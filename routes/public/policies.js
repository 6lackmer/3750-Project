var express = require('express');
var router = express.Router();

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("policies.js: GET")
    res.render('public/policies', {});
});


module.exports = router;