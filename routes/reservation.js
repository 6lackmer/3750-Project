var express = require('express');
var router = express.Router();
var dbCon = require('./../lib/database');

//////////////////////// TEST POST METHOD ////////////////////////
router.post('/', function(req, res, next) {
    var reservationObj = {
        date: req.body.date,
        nights: req.body.nights,
        size: req.body.size
    };

    console.log("reservation.js: POST")
    res.render('reservation', { reservationObj });
});

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

/* POST page. */
router.post('/', function(req, res, next) {
    console.log("reservation.js: POST");

    // Save Reservation in Database

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

        if (site_type == "40" || site_type == "52" || site_type == "62") {
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
                        const memo = ""

                        let sql = "CALL add_reservation(?, ?, ?, ?, ?, ?, ?);";

                        dbCon.query(sql, [account_id, site_id, sqlArrivalDate, numNights, memo, status, sqlDepartureDate], function(err, rows) {
                            if (err) {
                                throw err;
                            } else {
                                console.log("reservation.js: Reservation Saved Successfully!");
                                req.session.currentReservation = rows[0][0]["last_insert_id()"];

                                req.session.save(function(err) {
                                    if (err) {
                                        throw err;
                                    }
                                    console.log("reservation.js: Sending to Reservation summary Page");
                                    res.redirect("reservation-summary");
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
                        const memo = ""

                        let sql = "CALL add_reservation(?, ?, ?, ?, ?, ?, ?);";

                        dbCon.query(sql, [account_id, site_id, sqlArrivalDate, numNights, memo, status, sqlDepartureDate], function(err, rows) {
                            if (err) {
                                throw err;
                            } else {
                                console.log("reservation.js: Reservation Saved Successfully!");
                                req.session.currentReservation = rows[0][0]["last_insert_id()"];

                                req.session.save(function(err) {
                                    if (err) {
                                        throw err;
                                    }
                                    console.log("reservation.js: Sending to Reservation summary Page");
                                    res.redirect("reservation-summary");
                                });
                            }
                        });
                    }
                }
            });
        }
    }
});

module.exports = router;