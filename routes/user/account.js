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
            profileObj.email = rows[0][0].email;

            let temp = rows[0][0].dod_affiliation;
            if (temp == "army") {
                profileObj.military_affiliation = "Army";
            } else if (temp == "navy") {
                profileObj.military_affiliation = "Navy";
            } else if (temp == "coast_guard") {
                profileObj.military_affiliation = "Coast Guard";
            } else if (temp == "marines") {
                profileObj.military_affiliation = "Marines";
            } else if (temp == "air_force") {
                profileObj.military_affiliation = "Air Force";
            } else if (temp == "area_51") {
                profileObj.military_affiliation = "Area 51";
            }

            temp = rows[0][0].dod_status;
            if (temp == "active") {
                profileObj.status = "Active Duty";
            } else {
                profileObj.status = "Veteran";
            }
            profileObj.rank = rows[0][0].dod_rank;

            res.render('user/account', profileObj);
        });
    }
});

module.exports = router;