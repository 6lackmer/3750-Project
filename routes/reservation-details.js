var express = require('express');
var router = express.Router();
var dbCon = require('../../lib/database');


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("reservation-details.js: GET")

    if (!req.session.loggedIn) { // Verify User is logged in
        console.log("reservation-details.js: Nobody logged in. Send to login page");
        res.redirect("login");
    } else {
        console.log("reservation-details.js: Guest Viewing Reservation " + req.body.reservation_id + ".");


        reservationObj = {}
            /* Reservation Obj Needs:
            1: Arrival Date
            2: Number of Nights
            3: RV Size
            4: Camp Site #
            5: Transaction Number
            6: CardHolder
            7: Last 4 of Card #
            */

        let sql = "CALL get_reservation_information('" + req.body.reservation_id + "')";
        dbCon.query(sql, function(err, rows) {
            if (err) {
                throw err;
            }
            reservationObj.arrival_date = rows[0][0].startdate;
            reservationObj.num_nights = rows[0][0].num_nights;
            reservationObj.rv_size = rows[0][0].site_type_name;
            reservationObj.site_number = rows[0][0].site_number;
            reservationObj.transaction_id = rows[0][0].invoice_id;
            reservationObj.card_holder = (rows[0][0].f_name + " " + rows[0][0].l_name);
            reservationObj.last_four = rows[0][0].number[12] + rows[0][0].number[13] + rows[0][0].number[14] + rows[0][0].number[15];

            req.session.save(function(err) {
                if (err) {
                    throw err;
                } else {
                    res.render('reservation-details', reservationObj);
                }

            });
        });
    }
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