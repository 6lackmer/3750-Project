var express = require('express');
var router = express.Router();
var dbCon = require('../../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("account.js: GET")

    if (!req.session.loggedIn) {
        console.log("account.js: Not logged in");
        res.redirect("login");
    } else {
        console.log("account.js: Guest Viewing Account Info");

        profileObj = {}

        let sql = "CALL get_user_account('" + req.session.user_id + "')";
        dbCon.query(sql, function(err, rows) {
            if (err) {
                throw err;
            }
            console.log(rows);
            profileObj.full_name = (rows[0][0].f_name + " " + rows[0][0].l_name);

            profileObj.phone_number = rows[0][0].phone_number.replace(/(\d{3})(\d{3})(\d{4})/,"($1) $2-$3");

            profileObj.email = rows[0][0].email;

            profileObj.military_affiliation = rows[0][0].dod_affiliation.split("_").map(word => (
                word.charAt(0).toUpperCase() + word.slice(1)
            )).join(' ');

            profileObj.status = rows[0][0].dod_status === "active" ? "Active Duty" 
                : (rows[0][0].dod_status.charAt(0).toUpperCase() + rows[0][0].dod_status.slice(1));

            profileObj.rank = rows[0][0].dod_rank;

            res.render('user/account', profileObj);
        });
    }
});

module.exports = router;