var express = require('express');
var router = express.Router();
var dbCon = require('../../lib/database');


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("reservation-confirmation.js: GET")

    console.log("reservation-details.js: Guest Viewing Recently Made Reservation");


    reservationObj = {}
        /* Reservation Obj Needs:
        1: Arrival Date
        */

    let sql = "CALL get_reservations_from_account_id('" + req.body.user.id + "')";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        }
        console.log(rows);

        req.session.save(function(err) {
            if (err) {
                throw err;
            } else {
                res.render('reservation-confirmation', reservationObj);
            }
        });
    });
});



/* POST Cancellation page. */
router.post('/', function(req, res, next) {
    console.log("reservation-details.js: POST");

    // This method will be used to cancel a
    // Guest's Reservation

    //Waiting for configuration of Stripe Payment System

    res.render('reservation-details', {});
});

module.exports = router;