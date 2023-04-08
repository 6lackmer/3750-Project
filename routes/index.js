var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.loggedIn === undefined) {
        req.session.loggedIn = false;
      }      
    res.render('index', { title: '3750 Project Demo' });
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            throw err;
        } else {
            console.log('session destroyed');
            res.redirect('/');
        }
    });
})
module.exports = router;