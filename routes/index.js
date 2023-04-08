var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: '3750 Project Demo' });
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            throw err;
        } else {
            res.redirect('/');
        }
    });
})
module.exports = router;