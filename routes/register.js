var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("register.js: GET")
    res.render('user/register', {});
});



/* POST page. */
router.post('/', function(req, res, next) { // still to be modified

    console.log("register.js: POST");

    // Get key value pairs from POST
    const username = req.body.email;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;

    const password1 = req.body.password;
    const password2 = req.body.password_repeat;

    const affiliation = req.body.affiliation;
    const status = req.body.status;

    invalidInput = false;

    if (password1 != password2) {
        invalidInput = true;
    } else if (username == "") {
        invalidInput = true;
    } else if (first_name == "") {
        invalidInput = true;
    } else if (last_name == "") {
        invalidInput = true;
    }

    if (invalidInput) {
        res.render('user/register', { message: "Please Fill in All Fields Correctly" })
    } else {
        // Generate Hash and Salt if needed


    }

    console.log("register.js: username: " + username + " salt: " + salt + " hash: " + hash);

    let sql = "CALL add_user(?, ?, ?, ?, ?, ?, @result); select @result";

    dbCon.query(sql, [role_id, username, hash, salt, first_name, last_name], function(err, rows) {
        if (err) {
            throw err;
        }
        if (rows[1][0]['@result'] == 0) {
            // Successful Registration

            // Retrieve user_id
            sql = "CALL get_user_id_by_username('" + username + "');";

            dbCon.query(sql, function(err, rows) {
                if (err) {
                    throw err;
                }

                const user_id = rows[0][0]["user_id"];

                //Set the session
                req.session.user_id = user_id;
                req.session.loggedIn = true;

                req.session.save(function(err) {
                    if (err) {
                        throw err;
                    }
                    console.log("register.js: Successful Registration, a session field is: " + req.session.username);

                    //Redirect the user to the home page. Let that redirect the user to the correct spot
                    res.redirect('/');
                });
            });
        } else {
            // This user account already exists
            console.log("register.js: Username already exists. Reload register page with that message");
            res.render('register', { message: "The email '" + username + "' already has an acccount associated with it" });
        }
    });
});
module.exports = router;