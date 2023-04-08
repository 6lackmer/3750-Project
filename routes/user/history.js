var express = require('express');
var router = express.Router();
var dbCon = require('../../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('history.js: GET');

    let user_id = req.session.user_id;

    ReservationsObj = {}

    let sql = "CALL get_reservations_from_account_id('" + user_id + "', '1')";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        }
        console.log(rows[0]);
        ReservationsObj.pastReservations = rows[0];

        let sql = "CALL get_reservations_from_account_id('" + user_id + "', '2')";
        dbCon.query(sql, function(err, rows) {
            if (err) {
                throw err;
            }
            console.log(rows[0]);
            ReservationsObj.futureReservations = rows[0];
        });

    });

    res.render('user/history', ReservationsObj);
});

module.exports = router;