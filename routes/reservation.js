var express = require('express');
var router = express.Router();
var dbCon = require('./../lib/database');

//////////////////////// TEST POST METHOD ////////////////////////
router.post('/', function(req, res, next) {
    var reservationObj = {
        date: req.body.date,
        nights: req.body.nights,
        size: req.body.size
    };

    console.log("reservation.js: POST")
    res.render('reservation', { reservationObj });
});

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("reservation.js: GET")
    res.render('reservation', {});
});

module.exports = router;