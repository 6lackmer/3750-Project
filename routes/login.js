var express = require('express');
var router = express.Router();
var dbCon = require('../lib/database');

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("loginuser.js: GET");
    res.render('loginuser', {});
});

/* POST page. */
router.post('/', function(req, res, next) { // still to be modified
    console.log("loginuser.js: POST");

    const username = req.session.username;
    const hash = req.body.hash;

    let sql = "CALL check_credentials('" + username + "', '" + hash + "', @result); select @result";

    dbCon.query(sql, function(err, results) {
        if (err) {
            throw err;
        }
        console.log("loginuser.js: Obtained check_credentials reply from database");
        if (results[1][0] === undefined || results[1][0]["@result"] == 0) {
            console.log("loginuser.js: No login credentials found");
            res.render("loginuser", {
                message: "Password not valid for user '" + username + "'.  Please log in again."
            });
        } else {
            console.log("loginuser.js: Credentials Matched");
            role_id = results[1][0]["@result"];
            req.session.loggedIn = true;

            sql = "CALL get_user_id_by_username('" + username + "')";
            dbCon.query(sql, function(err, rows) {
                if (err) {
                    throw err;
                } else if (rows[0][0] === undefined) {
                    console.log("loginuser.js: Error handling request");
                    res.render("loignuser", {
                        message: "Error during login. Please try again"
                    });
                } else {
                    user_id = rows[0][0].user_id;
                    req.session.user_id = user_id;

                    req.session.save(function(err) {
                        if (err) {
                            throw err;
                        } else {
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    });
});


module.exports = router;