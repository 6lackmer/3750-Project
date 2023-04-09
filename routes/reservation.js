var express = require('express');
var router = express.Router();
var dbCon = require('./../lib/database');

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("reservation.js: GET")
    res.render('reservation', {});
});

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + 1 + days);
    return result;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}


function createReservation(req) {
    // Form Values
    let arrivalDate = req.body.date;
    var numNights = parseInt(req.body.nights);
    let site_type = req.body.size;

    // Generate Departure Date
    let tempdepartureDate = addDays(arrivalDate, numNights);
    let departureDate = formatDate(tempdepartureDate);

    // Validation Variables
    currentDate = formatDate(new Date());
    let invalidInput = false;

    // Validate Input
    if (arrivalDate = "" || arrivalDate < currentDate) {
        console.log("reservation.js: Date Issue");
        invalidInput = true;
    } else if (numNights < 1) {
        console.log("reservation.js: Duration Issue");
    } else if (site_type == "") {
        console.log("reservation.js: Site Issue");
        invalidInput = true;
    }

    if (invalidInput) { // Invalid Input.  Request User Input
        console.log("reservation.js: Form not complete");
        res.render('reservation', { message: "Please Fill in All Fields Correctly" });
    } else { // Valid Input
        console.log("reservation.js: Input valid.  Query Database for reservations by date and site size");

        // Compute dates that SQL will accept
        var sqlADate = new Date(req.body.date);
        var sqlDDate = new Date(departureDate);

        let day = sqlADate.getDate();
        let month = sqlADate.getMonth() + 1;
        let year = sqlADate.getFullYear();
        let sqlArrivalDate = `${year}-${month}-${day}`;

        day = sqlDDate.getDate();
        month = sqlDDate.getMonth() + 1;
        year = sqlDDate.getFullYear();
        let sqlDepartureDate = `${year}-${month}-${day}`;

        if (site_type == "40" || site_type == "52" || site_type == "60") {
            console.log("reservation.js: Personal Trailer Site");
            let sql = "CALL get_availability_by_date_and_size('" + sqlArrivalDate + "', '" + sqlDepartureDate + "', '" + site_type + "')";
            dbCon.query(sql, function(err, rows) {
                if (err) {
                    throw err;
                } else {
                    console.log("availability returned");
                    if (rows[0][0]) {
                        console.log("reservation.js: A Site is available");

                        const site_id = rows[0][0].site_id;
                        const status = "booking";
                        const account_id = req.session.user.id;

                        let sql = "CALL create_reservation(?, ?, ?, ?, ?, ?);";

                        dbCon.query(sql, [account_id, site_id, sqlArrivalDate, sqlDepartureDate, numNights, status], function(err, rows) {
                            if (err) {
                                throw err;
                            } else {
                                console.log("reservation.js: Reservation Saved Successfully!");

                                // Next we need to create the invoice and charge a card for payment
                                req.session.save(function(err) {
                                    if (err) {
                                        throw err;
                                    }
                                    console.log("register.js: Successful Registration, a session field is: " + req.session.user_id.toString());
                                });
                            }
                        });
                    }
                }
            });
        } else {
            console.log("reservation.js: Tent/Pop Up Trailer/ etc");
            let sql = "CALL get_availability_by_date_and_type('" + sqlArrivalDate + "', '" + sqlDepartureDate + "', '" + site_type + "')";
            dbCon.query(sql, function(err, rows) {
                if (err) {
                    throw err;
                } else {
                    console.log("availability returned");
                    if (rows[0][0]) {
                        console.log("reservation.js: A Site is available");

                        const site_id = rows[0][0].site_id;
                        const status = "booking";
                        const account_id = req.session.user.id;

                        let sql = "CALL create_reservation(?, ?, ?, ?, ?, ?);";

                        dbCon.query(sql, [account_id, site_id, sqlArrivalDate, sqlDepartureDate, numNights, status], function(err, rows) {
                            if (err) {
                                throw err;
                            } else {
                                console.log("reservation.js: Reservation Saved Successfully!");

                                // Next we need to create the invoice and charge a card for payment
                                req.session.save(function(err) {
                                    if (err) {
                                        throw err;
                                    }
                                    console.log("register.js: Successful Registration, a session field is: " + req.session.user_id.toString());
                                });
                            }
                        });
                    }
                }
            });
        }

        let sql = "CALL get_reservations_from_account_id('" + req.session.user_id + "', '0')";
        dbCon.query(sql, function(err, rows) {
            if (err) {
                throw err;
            }
            var reservations = rows[0];

            maxID = 0;

            for (var i = 0; i < reservations.length; i++) {
                if (reservations[1].reservation_id > maxID) {
                    maxID = reservations[1].reservation_id;
                }
            }

            let sql = "CALL get_reservation_from_reservation_id('" + maxID + "')";
            dbCon.query(sql, function(err, rows) {
                if (err) {
                    throw err;
                }
                return rows[0][0].reservation_id;
            });
        });
    }
}


/* POST page. */
router.post('/', function(req, res, next) {
    console.log("reservation.js: POST");

    // Save Reservation in Database

    let reservation_id = createReservation(req);

    res.redirect("reservation-confirmation");
});


module.exports = router;