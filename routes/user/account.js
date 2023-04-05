var express = require('express');
var router = express.Router();
var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("account.js: GET")

    if (!req.session.loggedIn) {
        console.log("account.js: Not logged in");
        res.redirect("login");
    } else {
        console.log("account.js: Guest Viewing Account Info");

        profileObj = {}

        let sql = "CALL get_user_info('" + req.session.user_id + "')";
        dbCon.query(sql, function(err, rows) {
            if (err) {
                throw err;
            }
            console.log(rows);
            profileObj.first_name = (rows[0][0].f_name + " " + rows[0][0].l_name);
            profileObj.email = rows[0][0].email;
            profileObj.military_affiliation = rows[0][0].dod_affiliation;
            profileObj.status = rows[0][0].dod_status;

            res.render("account", objForProfile);
        });
    }
});

module.exports = router;