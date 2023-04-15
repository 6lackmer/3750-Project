var express = require('express');
var router = express.Router();
var dbCon = require('../../lib/database');

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

// GET home page.
router.get('/', async function(req, res, next) {
    if (req.session.loggedIn == true) {
        console.log('history.js: GET');

        const user_id = req.session.user_id;

        // 1 is past, 2 is future
        let pastReservations = await sqlCall("CALL get_reservations_from_account_id('" + user_id + "', '1')");
        pastReservations = pastReservations[0];

        let futureReservations = await sqlCall("CALL get_reservations_from_account_id('" + user_id + "', '2')");
        futureReservations = futureReservations[0];

        res.render('user/history', { 'pastReservations': pastReservations, 'futureReservations': futureReservations });
    } else {
        res.redirect('/');
    }
});


module.exports = router;