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

function validateInput(req, res) {

    var reservationObj = {
        date: req.body.date,
        nights: req.body.nights,
        size: req.body.size,
        site_id: req.body.site_id,
        amount: req.body.amount || 50,
        cardholder_name: req.body.cardholder_name,
        address1: req.body.address1,
        address2: req.body.address2,
        state: req.body.state,
        zip_code: req.body.zip_code,
        card_number: req.body.card_number.length >= 4 ? "************" + req.body.card_number.slice(-4) : req.body.card_number,
        exp_month: req.body.expiration_date.slice(-2),
        exp_year: req.body.expiration_date.slice(0, 4),
        security_code: req.body.security_code
    };

    // Validate Address information:

    const address = reservationObj.address1;
    const apt = reservationObj.address2;
    const city = reservationObj.city;
    const state = reservationObj.state;
    const zip = reservationObj.zip_code;

    if (address == "" || city == "" || state == "" || zip == "") {
        console.log("reservation confirmation: incomplete address details.");
        res.render("reservation-summary", { message: "Incomplete Addess Information" });
    } else {
        console.log("reservation-confirmation.js: Address validated");
        console.log("reservation-confirmation.js: '" + reservationObj.card_number + "'");

        // Validate Card Information:
        const card_number = req.body.card_number;
        const exp_month = reservationObj.exp_month;
        const exp_year = reservationObj.exp_year;
        const security_code = reservationObj.security_code;

        if (card_number == "" || exp_month == "" || exp_year == "" || security_code == "") {
            console.log("reservation confirmation: Incomplete Card information.");
            res.render("reservation-summary", { message: "Incomplete Card Information" });
        } else {
            console.log("reservation-confirmation.js: Card Info Validated");
            renderConfirmationPage(req, res);
        }
    }
}

function renderConfirmationPage(req, res) {

    var reservationObj = {
        date: req.body.date,
        nights: req.body.nights,
        size: req.body.size,
        site_id: req.body.site_id,
        amount: req.body.amount || 50,
        cardholder_name: req.body.cardholder_name,
        address1: req.body.address1,
        address2: req.body.address2,
        state: req.body.state,
        zip_code: req.body.zip_code,
        card_number: req.body.card_number.length >= 4 ? "************" + req.body.card_number.slice(-4) : req.body.card_number,
        exp_month: req.body.expiration_month,
        exp_year: req.body.expiration_year,
        security_code: req.body.security_code
    };

    createReservation(req, res);


    // Part 1: Add Reservation To DB
    function createReservation(req, res) {
        console.log("reservation-confirmation.js: Create Reservation");

        // Things needed for Reservation
        // 1. account_id
        // 2. site_id
        // 3. start_date
        // 4. num_nights
        // 5. memo
        // 6. status
        // 7. end_date

        const account_id = req.session.user_id;
        const site_id = reservationObj.site_id;
        const num_nights = reservationObj.nights;
        const memo = "";
        const status = "Reserved";

        // Generate start_date
        var sqlADate = new Date(req.body.date);
        let day = sqlADate.getDate();
        let month = sqlADate.getMonth() + 1;
        let year = sqlADate.getFullYear();
        const start_date = `${year}-${month}-${day}`;

        // Generate end_date
        let tempdepartureDate = addDays(req.body.date, parseInt(req.body.nights));
        var sqlDDate = new Date(formatDate(tempdepartureDate));
        day = sqlDDate.getDate();
        month = sqlDDate.getMonth() + 1;
        year = sqlDDate.getFullYear();
        const end_date = `${year}-${month}-${day}`;

        // Insert Reservation to DB
        let sql = "CALL add_reservation(?, ?, ?, ?, ?, ?, ?);";
        dbCon.query(sql, [account_id, site_id, start_date, num_nights, memo, status, end_date], function(err, rows) {
            if (err) {
                throw err;
            } else {
                console.log("reservation-confirmation.js: Reservation Saved Successfully!");
                let currentReservation = rows[0][0]["last_insert_id()"];

                createAddress(req, res, currentReservation);
            }
        });
    }

    // Part 2: Add Address to DB
    function createAddress(req, res, reservation_id) {
        console.log("reservation-confirmation.js: Create Address");
        // Things needed for Address
        // 1. street
        // 2. apt
        // 3. city
        // 4. state
        // 5. zip

        const address = reservationObj.address1;
        const apt = reservationObj.address2;
        //const city = reservationObj.city;
        const city = "Layton";
        const state = reservationObj.state;
        const zip = reservationObj.zip_code;

        let sql = "CALL add_address(?, ?, ?, ?, ?);";
        dbCon.query(sql, [address, apt, city, state, zip], function(err, rows) {
            if (err) {
                throw err;
            } else {
                console.log("reservation-confirmation.js: Address Saved Successfully!");
                let currentAddress = rows[0][0]["last_insert_id()"];

                createCard(req, res, reservation_id, currentAddress);
            }
        });
    }

    // Part 3: Add Card to DB
    function createCard(req, res, reservation_id, address_id) {
        console.log("reservation-confirmation.js: Create Card");

        // Things needed for Card
        // 1. account_id
        // 2. address_id
        // 3. card_number
        // 4. exp_month
        // 5. exp_year
        // 6. security_code

        const account_id = req.session.user_id;
        const card_number = req.body.card_number;
        //const exp_month = reservationObj.exp_month;
        //const exp_year = reservationObj.exp_year;
        const exp_month = 5;
        const exp_year = 2024;
        const security_code = reservationObj.security_code;

        let sql = "CALL add_card(?, ?, ?, ?, ?, ?);";
        dbCon.query(sql, [account_id, address_id, card_number, exp_month, exp_year, security_code], function(err, rows) {
            if (err) {
                throw err;
            } else {
                console.log("reservation-confirmation.js: Card Saved Successfully!");
                let currentCard = rows[0][0]["last_insert_id()"];

                createInvoice(req, res, reservation_id, currentCard);
            }
        });
    }

    // Part 4: Add Invoice to DB
    function createInvoice(req, res, reservation_id, card_id) {
        console.log("reservation-confirmation.js: Create Card");

        // Things needed for Invoice
        // 1. reservation_id
        // 2. card_id
        // 3. invoice_date
        // 4. invoice_amount
        // 5. payment_amount
        // 6. payment_method
        // 7. invoice_type
        // 8. memo

        const invoice_date = new Date();
        const invoice_amount = reservationObj.amount;
        const payment_amount = reservationObj.amount;
        const payment_method = "Cash";
        const invoice_type = "Payment";
        const memo = "";

        let sql = "CALL add_invoice(?, ?, ?, ?, ?, ?, ?, ?);";
        dbCon.query(sql, [reservation_id, card_id, invoice_date, invoice_amount, payment_amount, payment_method, invoice_type, memo], function(err, rows) {
            if (err) {
                throw err;
            } else {
                console.log("reservation-confirmation.js: Invoice Saved Successfully!");
                const invoice_id = rows[0][0]["last_insert_id()"];
                reservationObj.payment_id = invoice_id;
                console.log("reservation-confirmation.js: '" + reservationObj.date + "'");
                console.log("reservation-confirmation.js: '" + reservationObj.amount + "'");

                res.render('reservation-confirmation', { reservationObj });
            }
        });
    }
}

//////////////////////// TEST POST METHOD ////////////////////////
router.post('/', function(req, res, next) {

    console.log("reservation-confirmation.js: POST");
    validateInput(req, res); // Validate Input will continue to DB methods if passed. Will then continue to page

});

module.exports = router;