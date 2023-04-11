var express = require('express');
var router = express.Router();
var dbCon = require('./../lib/database');

//////////////////////// TEST POST METHOD ////////////////////////
router.post('/', function(req, res, next) {
    var reservationObj = {
        date: req.body.date,
        nights: req.body.nights,
        size: req.body.size,
        amount: req.body.amount || 50,
        cardholder_name: req.body.cardholder_name,
        // address1: req.body.address1,
        // address2: req.body.address2,
        // state: req.body.state,
        //zip_code: req.body.zip_code,
        card_number: req.body.card_number.length >= 4 ? "************" + req.body.card_number.slice(-4) : req.body.card_number,
        payment_id: 1000 //get id from database
    };

    console.log("reservation-confirmation.js: POST")
    res.render('reservation-confirmation', { reservationObj });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("reservation-confirmation.js: GET")

    console.log("reservation-details.js: Guest Viewing Recently Made Reservation");


    reservationObj = {}
        /* Reservation Obj Needs:
        1: Arrival Date
        */

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
            reservationObj.arrival_date = rows[0][0].start_date;

            console.log(reservationObj.arrival_date);

            req.session.save(function(err) {
                if (err) {
                    throw err;
                } else {
                    res.render('reservation-confirmation', reservationObj);
                }
            });
        });

    });
});

module.exports = router;