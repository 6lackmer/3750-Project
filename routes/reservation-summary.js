var express = require('express');
var router = express.Router();
var dbCon = require('./../lib/database');

//////////////////////// TEST POST METHOD ////////////////////////
router.post('/', function(req, res, next) {
    var reservationObj = {
        date: req.body.date,
        nights: req.body.nights,
        size: req.body.size,
        amount: req.body.nights * 25
    };

    console.log("reservation-summary.js: POST");
    res.render('reservation-summary', { reservationObj });
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