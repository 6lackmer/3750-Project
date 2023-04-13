var express = require('express');
var router = express.Router();
var dbCon = require('../../lib/database');

/* POST Cancellation page. */
router.post('/', function(req, res, next) {
    console.log("reservation-details.js: POST");

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

        let sql = "CALL get_reservation_from_reservation_id('" + req.body.reservation_id + "')";
        dbCon.query(sql, function(err, rows) {
            if (err) {
                throw err;
            }
            console.log(rows);
            reservationObj.arrival_date = rows[0][0].startdate;
            reservationObj.num_nights = rows[0][0].num_nights;
            reservationObj.site_number = rows[0][0].site_number;
            reservationObj.transaction_id = rows[0][0].invoice_id;
            reservationObj.card_holder = (rows[0][0].f_name + " " + rows[0][0].l_name);
            reservationObj.last_four = rows[0][0].number.length >= 4 ? "************" + req.body.card_number.slice(-4) : rows[0][0].number;

            if (rows[0][0].max_trailer_length == "40") {
                reservationObj.size_text = "Compact (40 ft)";
            } else if (rows[0][0].max_trailer_length <= "52") {
                reservationObj.size_text = "Standard (52 ft)";
            } else if (rows[0][0].max_trailer_length <= "62") {
                reservationObj.size_text = "Large (62 ft)";
            } else if (rows[0][0].site_type_name == "tent_on_wheels") {
                reservationObj.size_text = "Tent on Wheels";
            } else if (rows[0][0].site_type_name == "pop_up_trailer") {
                reservationObj.size_text = "Pop-Up Trailer";
            } else {
                reservationObj.size_text = "Tent site";
            }

            console.log(reservationObj);
            req.session.save(function(err) {
                if (err) {
                    throw err;
                } else {
                    res.render('reservation-details', reservationObj);
                }

            });
        });
    }

    res.render('reservation-details', {});
});

module.exports = router;