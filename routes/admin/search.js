var express = require('express');
var router = express.Router();
var dbCon = require('../../lib/database');

//////////////////////// TEST POST METHOD ////////////////////////
router.post('/', function(req, res, next) {
    var searchObj = {
        email: req.body.email
    };

    var reservations = [
        {
            reservation_id: 1,
            start_date: '2023-04-01',
            num_nights: 5,
            status: 'Out',
            site_type_name: 'trailer',
        },
        {
            reservation_id: 2,
            start_date: '2023-04-18',
            num_nights: 7,
            status: 'In',
            site_type_name: 'trailer',
        },
        {
            reservation_id: 3,
            start_date: '2023-05-01',
            num_nights: 1,
            status: '',
            site_type_name: 'dry_storage',
        },
    ];

    console.log("search.js: POST");
    res.render('admin/search', { searchObj, reservations });
});

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("search.js: GET");
    res.render('admin/search-form', {});
});

module.exports = router;