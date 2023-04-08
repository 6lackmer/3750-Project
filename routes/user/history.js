var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('history.js: GET');

    let user_id = req.session.user_id;

    res.render('history', {});
});

module.exports = router;