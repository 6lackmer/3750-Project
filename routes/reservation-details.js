var express = require('express');
var router = express.Router();
var dbCon = require('./../lib/database');


function sqlCall(sql) {
    return new Promise((resolve, reject) => {
        dbCon.query(sql, function(err, rows) {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {
                resolve(rows); // Extract the reservation_count value directly here
            }
        });
    });
}

/* GET page. */
router.get('/', async function(req, res, next) {
    console.log("reservation-details.js: POST");

    // pull reservation ID from the url 
    const submitted_reservation_id = req.query.reservation_id;
    console.log("reservation id: " + submitted_reservation_id);

    // pull reservation and user information from the url 
    let user_info = await sqlCall("CALL get_reservation_from_reservation_id('" + submitted_reservation_id + "')");
    user_info = user_info[0][0];

    if (req.session.loggedIn && req.session.user_id == user_info.account_id) { // Verify User is logged in
        console.log("reservation-details.js: User is logged in");
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

        reservationObj.reservation_id = user_info.reservation_id;
        reservationObj.start_date = user_info.start_date;
        reservationObj.num_nights = user_info.num_nights;
        reservationObj.site_number = user_info.site_number;
        reservationObj.status = user_info.status;
        // TODO: reservationObj.last_four = user_info.number
        if (user_info.site_type_id == 1) {
            if (user_info.max_trailer_length == "40") {
                reservationObj.size_text = "Compact (40 ft)";
            } else if (user_info.max_trailer_length <= "52") {
                reservationObj.size_text = "Standard (52 ft)";
            } else if (user_info.max_trailer_length <= "62") {
                reservationObj.size_text = "Large (62 ft)";
            }
        } else if (user_info.site_type_id == 2) {
            reservationObj.size_text = "Pop-Up Trailer";
        } else if (user_info.site_type_id == 3) {
            reservationObj.size_text = "Tent on Wheels";
        } else if (user_info.site_type_id == 5) {
            reservationObj.size_text = "Tent site";
        }

        // Get Transaction Details:
        let transaction_info = await sqlCall("CALL get_invoice_from_reservation_id('" + submitted_reservation_id + "')");
        transaction_info = transaction_info[0][0];

        reservationObj.transaction_id = transaction_info.invoice_id;
        reservationObj.card_holder = (transaction_info.f_name + " " + transaction_info.l_name);
        reservationObj.card_number = transaction_info.card_number;

        console.log("reservationObj: " + reservationObj.start_date);
        res.render('reservation-details', { 'reservationObj': reservationObj });
    } else {
        console.log("reservation-details.js: Nobody logged in. Send to login page");
        res.redirect('/');
    }
});

function subtractDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() - days);
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

router.post('/', async function(req, res, next) {
    console.log("reservation-details.js: POST");

    // Get Reservation Info, determine amount of refund
    submitted_reservation_id = req.body.reservation_id;

    let user_info = await sqlCall("CALL get_reservation_from_reservation_id('" + submitted_reservation_id + "')");
    user_info = user_info[0][0];

    // Get Transaction Details:
    let transaction_info = await sqlCall("CALL get_invoice_from_reservation_id('" + submitted_reservation_id + "')");
    transaction_info = transaction_info[0][0];
    console.log(transaction_info);

    // Documentation: if arrival date > 3 days away, all but $10 refunded
    //                else, all but 1 full day refunded
    const arrivalDate = formatDate(subtractDays(new Date(user_info.start_date), 3)); // arrival date minus 3 days
    const currentDate = formatDate(new Date()); // todays date

    // set Reservation status to Cancelled
    let reservation_update = await sqlCall("Call modify_reservation('" + submitted_reservation_id + "', null, 'Cancelled', '');");


    // Things needed for Invoice
    // 1. reservation_id
    // 2. card_id
    // 3. invoice_date
    // 4. invoice_amount
    // 5. payment_amount
    // 6. payment_method
    // 7. invoice_type
    // 8. memo

    const card_id = transaction_info.card_id;
    const invoice_date = new Date();
    const payment_method = "Card";
    const invoice_type = "Refund";
    const memo = "Refunded by Customer";


    let sql = "CALL add_invoice(?, ?, ?, ?, ?, ?, ?, ?);";

    if (arrivalDate > currentDate) { // All but $10
        const refund_amount = transaction_info.payment_amount - 10;
        dbCon.query(sql, [submitted_reservation_id, card_id, invoice_date, refund_amount, refund_amount, payment_method, invoice_type, memo], function(err, rows) {
            if (err) {
                throw err;
            } else {
                console.log("reservation-confirmation.js: Refund Invoice Saved Successfully!");

                res.redirect('/history');
            }
        });

    } else { // All but a full day
        // Determine what a full day is
        let site_info = await sqlCall("CALL get_site_from_site_id('" + user_info.site_id + "')");
        site_info = site_info[0][0];
        const rate = site_info.rate;

        const refund_amount = transaction_info.payment_amount - rate;
        if (refund_amount == 0) {
            res.redirect('/history');
        } else {
            dbCon.query(sql, [submitted_reservation_id, card_id, invoice_date, refund_amount, refund_amount, payment_method, invoice_type, memo], function(err, rows) {
                if (err) {
                    throw err;
                } else {
                    console.log("reservation-confirmation.js: Refund Invoice Saved Successfully!");

                    res.redirect('/history');
                }
            });
        }
    }
});


module.exports = router;