var express = require('express');
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("information.js: GET")
    res.render('information', {});
});


module.exports = router;