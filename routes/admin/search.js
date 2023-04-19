var express = require('express');
var router = express.Router();
var dbCon = require('../../lib/database');

function callProcedure(sql) {
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

//////////////////////// TEST POST METHOD ////////////////////////
router.post('/', async function(req, res, next) {
    console.log("search.js: POST");
    const email = req.body.email
    try {
        let reservations = await callProcedure("CALL get_reservations_from_email('"+ email +"');");
        reservations = reservations[0]
        res.render('admin/search', { reservations, email });

    } catch (err) {
        console.log(err.message);
        next(err);
    }
});

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("search.js: GET");
    console.log(req.session.user.account_type);
    if (req.session.loggedIn && req.session.user.account_type == 'employee'){
        res.render('admin/search-form', {});
    } else {
        console.log("search.js GET: Nobody logged in or customer account. Send to login page");
        res.redirect('/');
    }
});

module.exports = router;