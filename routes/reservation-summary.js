var express = require('express');
var router = express.Router();
var dbCon = require('./../lib/database');

//#region Post Method Functions
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
//#endregion

//////////////////////// TEST POST METHOD ////////////////////////
router.post('/', function(req, res, next) {

    console.log("reservation-summary.js: POST");

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

    var reservationObj = {
        date: req.body.date,
        nights: req.body.nights,
        size: req.body.size,
    };

    if (req.body.size == "40") {
        reservationObj.size_text = "Compact (40 ft)";
    } else if (req.body.size == "52") {
        reservationObj.size_text = "Standard (52 ft)";
    } else if (req.body.size == "62") {
        reservationObj.size_text = "Large (62 ft)";
    } else if (req.body.size == "tent_on_wheels") {
        reservationObj.size_text = "Tent on Wheels";
    } else if (req.body.size == "pop_up_trailer") {
        reservationObj.size_text = "Pop-Up Trailer";
    } else {
        reservationObj.size_text = "Tent site";
    }

    let sql = "CALL get_user_account('" + req.session.user_id + "')";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        } else {
            reservationObj.cardholder_name = rows[0][0].f_name + " " + rows[0][0].l_name;

            let message = "";
            // Validate Input
            if (arrivalDate = "" || arrivalDate < currentDate) {
                console.log("reservation.js: Date Issue");
                invalidInput = true;
                message += "Please enter a valid date. ";
            } else if (numNights < 1) {
                console.log("reservation.js: Duration Issue");
                message += "Please enter a valid number of nights. ";
            } else if (site_type == "") {
                console.log("reservation.js: Site Issue");
                invalidInput = true;
                message += "There was an issue booking your site. Please call us for assistance or choose a different trailer size.";
            }

            if (invalidInput) { // Invalid Input.  Request User Input
                console.log("reservation.js: Form not complete");
                res.render('reservation', { reservationObj, message });
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

                                reservationObj.site_id = rows[0][0].site_id;
                                console.log("reservation-summary.js: Site Id: '" + reservationObj.site_id + "'");
                                reservationObj.amount = (rows[0][0].rate * req.body.nights);

                                console.log("reservation.js: Sending to Reservation summary Page");
                                res.render("reservation-summary", { reservationObj });
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

                                reservationObj.site_id = rows[0][0].site_id;
                                console.log("reservation-summary.js: Site Id: '" + reservationObj.site_id + "'");
                                reservationObj.amount = (rows[0][0].rate * req.body.nights);

                                console.log("reservation.js: Sending to Reservation summary Page");
                                res.render("reservation-summary", { reservationObj });
                            }
                        }
                    });
                }
            }
        }
    });
});


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("reservation-summary.js: GET")

    console.log("reservation-summary.js: Current Reservation Id: '" + req.session.currentReservation + "'");

    invoiceObj = {}
        /* GET View: Invoice Obj Needs:
        2: Reservation Id
        3: Reservation Date
        4: Reservation Num Nights
        5: Reservation RV Size
        6: Invoice Amount
        */

    var currentReservation = req.session.currentReservation;
    invoiceObj.reservationId = currentReservation;

    let sql = "CALL get_reservation_from_reservation_id('" + currentReservation + "')";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        }
        invoiceObj.arrival_date = rows[0][0].start_date;
        console.log(rows);
        invoiceObj.numNights = rows[0][0].num_nights;

        currSite_id = rows[0][0].site_id;

        let sql = "CALL get_site_from_site_id('" + currSite_id + "')";
        dbCon.query(sql, function(err, rows) {
            if (err) {
                throw err;
            }
            invoiceObj.reservation_total = rows[0][0].rate * invoiceObj.numNights;

            if (rows[0][0].max_trailer_length != null) {
                if (rows[0][0].max_trailer_length <= 40) {
                    invoiceObj.trailer_size = "Compact (40 ft)";
                } else if (rows[0][0].max_trailer_length <= 52) {
                    invoiceObj.trailer_size = "Standard (52 ft)";
                } else {
                    invoiceObj.trailer_size = "Large (62 ft)";
                }
            } else {
                if (rows[0][0].site_type_id == 2) {
                    invoiceObj.trailer_size = "Pop Up Trailer";
                } else if (rows[0][0].site_type_id == 3) {
                    invoiceObj.trailer_size = "Tent On Wheels";
                } else if (rows[0][0].site_type_id == 5) {
                    invoiceObj.trailer_size = "Tent Site";
                }
            }

            req.session.save(function(err) {
                if (err) {
                    throw err;
                } else {
                    res.render('reservation-summary', invoiceObj);
                }
            });

        });
    });
});

/* POST Cancellation page. */
router.post('/', function(req, res, next) {
    console.log("reservation-details.js: POST");

    /* POST View: Invoice Obj Needs:
    1: Invoice Date
    2: Reservation Id
    3: Reservation Date
    4: Reservation Num Nights
    5: Reservation RV Size
    6: Invoice Amount
    7: Payment Amount (?)
    8: Invoice Type
    */

    // This method will be used to cancel a
    // Guest's Reservation

    //Waiting for configuration of Stripe Payment System

    res.render('reservation-details', {});
});

module.exports = router;