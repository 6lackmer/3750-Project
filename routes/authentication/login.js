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
            res.render("loginuser", {
                message: "Error during login. Please try again"
            });
        } else {
            console.log(rows);
            salt = rows[0][0].salt;

            if (salt == "") {
                res.render("authentication/login", { message: "No account associated with '" + username + "'." });
            } else {
                const hashed_password = CryptoJS.SHA256(password + ":" + salt).toString(CryptoJS.enc.Hex);

                let sql = "CALL check_credentials('" + username + "', '" + hashed_password + "', @result); select @result";
                dbCon.query(sql, function(err, results) {
                    if (err) {
                        throw err;
                    }
                    console.log("login.js: Obtained check_credentials reply from database");
                    if (results[1][0] === undefined || results[1][0]["@result"] == 0) {
                        console.log("login.js: No Login Credentials found");
                        res.render("authentication/login", { message: "Password not valid for user '" + username + "'. Please log in again." });
                    } else {
                        console.log("login.js: Credentials Matched");
                        let user_id = results[1][0]["@result"];

                        req.session.loggedIn = true;
                        req.session.user_id = user_id;

                        req.session.save(function(err) {
                            if (err) {
                                throw err;
                            } else {
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