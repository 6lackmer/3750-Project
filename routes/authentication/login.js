var express = require('express');
var CryptoJS = require("crypto-js");
var router = express.Router();
var dbCon = require('../../lib/database');

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("login.js: GET");
    res.render('authentication/login', {});
});

/* POST page. */
router.post('/', function(req, res, next) { // still to be modified
    console.log("loginuser.js: POST");

    const username = req.body.email;
    const password = req.body.password;
    let salt = "";

    let sql = "CALL get_salt_from_email('" + username + "');";
    dbCon.query(sql, function(err, rows) {
        if (err) {
            throw err;
        } else if (rows[0][0] === undefined) {
            console.log("login.js: Error handling request");
            res.render("authentication/login", {
                message: "Error during login. Please try again"
            });
        } else {
            console.log(rows);
            salt = rows[0][0].salt;

            if (salt == "") {
                res.render("authentication/login", { message: "No account associated with '" + username + "'." });
            } else {
                const hashed_password = CryptoJS.SHA256(password + ":" + salt).toString(CryptoJS.enc.Hex);

                let sql = "CALL check_credentials('" + username + "', '" + hashed_password + "');";

                dbCon.query(sql, function(err, results) {
                    if (err) {
                        throw err;
                    }
                    console.log("login.js: Obtained check_credentials reply from database");

                    if (results[0][0] === undefined || results[0][0].length === 0) {
                        console.log("login.js: No Login Credentials found");
                        res.render("authentication/login", { message: "Password not valid for user '" + username + "'. Please log in again." });
                    } else {
                        console.log("login.js: Credentials Matched");

                        const result = results[0][0];

                        req.session.loggedIn = true;

                        req.session.user_id = result.account_id;
                        req.session.user = {
                            id: result.account_id,
                            username: result.username,
                            account_type: result.account_type,
                            f_name: result.f_name,
                            l_name: result.l_name,
                            email: result.email,
                            phone_number: result.phone_number,
                            dod_rank: result.dod_rank,
                            dod_affiliation: result.dod_affiliation,
                            dod_status: result.dod_status,
                            pcs: result.pcs
                        };

                        req.session.save(function(err) {
                            if (err) {
                                throw err;
                            } else {
                                console.log("Session Saved: Current User Name: '" + req.session.user.f_name + " " + req.session.user.l_name + "'");
                                res.redirect("/")
                            }
                        });
                    }
                });
            }
        }
    });
});


module.exports = router;