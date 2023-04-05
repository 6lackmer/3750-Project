var express = require('express');
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("location.js: GET")
    res.render('location', {});
});


module.exports = router;