var express = require('express');
var router = express.Router();
var dbCon = require('./../lib/database');


function sqlCall(sql) {
    return new Promise((resolve, reject) => {
        dbCon.query(sql, function (err, rows) {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {
                resolve(rows); // Extract the reservation_count value directly here
            }
        });
    });
}

/* POST Cancellation page. */
router.get('/', async function (req, res, next) {
    console.log("reservation-details.js: POST");

    // pull reservation ID from the url 
    const submitted_reservation_id = req.query.reservation_id;
    console.log("reservation id: " + submitted_reservation_id);

    // pull reservation and user information from the url 
    let user_info = await sqlCall("CALL get_reservation_from_reservation_id('" + submitted_reservation_id + "')");
    user_info = user_info[0][0]

    if (req.session.loggedIn && req.session.user_id == user_info.account_id) { // Verify User is logged in
        console.log("User is logged in")
        /* Reservation Obj Needs:
        1: Arrival Date
        2: Number of Nights
        3: RV Size
        4: Camp Site #
        5: Transaction Number
        6: CardHolder
        7: Last 4 of Card #
        */
        reservationObj = {}

        reservationObj.start_date = user_info.start_date;
        reservationObj.num_nights = user_info.num_nights;
        reservationObj.site_number = user_info.site_number;
        reservationObj.transaction_id = user_info.invoice_id;
        reservationObj.card_holder = (user_info.f_name + " " + user_info.l_name);
        // TODO: reservationObj.last_four = user_info.number

        if (user_info.max_trailer_length == "40") {
            reservationObj.size_text = "Compact (40 ft)";
        } else if (user_info.max_trailer_length <= "52") {
            reservationObj.size_text = "Standard (52 ft)";
        } else if (user_info.max_trailer_length <= "62") {
            reservationObj.size_text = "Large (62 ft)";
        } else if (user_info.site_type_name == "tent_on_wheels") {
            reservationObj.size_text = "Tent on Wheels";
        } else if (user_info.site_type_name == "pop_up_trailer") {
            reservationObj.size_text = "Pop-Up Trailer";
        } else {
            reservationObj.size_text = "Tent site";
        }
        console.log("reservationObj: " + reservationObj.start_date);
        res.render('reservation-details',{'reservationObj': reservationObj});
    } else {
        console.log("reservation-details.js: Nobody logged in. Send to login page");
        res.redirect('/');
    }
});

module.exports = router;