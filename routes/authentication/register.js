var express = require('express');
var CryptoJS = require("crypto-js");
var router = express.Router();

var dbCon = require('../../lib/database');

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("register.js: GET")
    res.render('authentication/register', {});
});



/* POST page. */
router.post('/', function(req, res, next) { // still to be modified

    console.log("register.js: POST");

    // Get key value pairs from POST
    const username = req.body.email;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const phone_number = req.body.phone_number.toString();

    const password1 = req.body.password;
    const password2 = req.body.password_repeat;

    const account_type = "customer";

    const affiliation = req.body.affiliation;
    const status = req.body.status;
    const rank = req.body.rank;
    const pcs = 0;

    invalidInput = false;
    problemMessage = "Please Fill in All Fields Correctly";

    if (password1 != password2) {
        invalidInput = true;
        problemMessage = "Passwords do not match!";
    } else if (username == "") {
        invalidInput = true;
    } else if (first_name == "") {
        invalidInput = true;
    } else if (last_name == "") {
        invalidInput = true;
    } else if (phone_number.Length > 10 || phone_number == "") {
        invalidInput = true;
    } else if (status == "" || rank == "" || affiliation == "") {
        invalidInput = true;
    }

    if (invalidInput) {
        res.render('authentication/register', { message: problemMessage })
    } else {
        // Generate Hash and Salt if needed
        let saltValues = CryptoJS.lib.WordArray.random(8);
        let salt = saltValues.words[0].toString() + saltValues.words[1].toString();
        console.log(salt);
        let hashed_password = CryptoJS.SHA256(password1 + ":" + salt).toString(CryptoJS.enc.Hex);

        let sql = "CALL add_user_account(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @result); select @result";

        dbCon.query(sql, [username, hashed_password, salt, account_type, first_name, last_name, username, phone_number, rank, affiliation, status, pcs], function(err, rows) {
            console.log(rows);
            if (err) {
                throw err;
            }
            if (rows[1][0]['@result'] == 0) {
                // Successful Registration
                console.log("register.js: Account Added to Database");

                // Retrieve user_id
                sql = "CALL get_user_id_from_hash_or_email('" + username + "', '" + hashed_password + "');";

                dbCon.query(sql, function(err, rows) {
                    if (err) {
                        throw err;
                    }

                    const result = rows[0][0];

                    //Set the session
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
                        }
                        console.log("register.js: Successful Registration, a session field is: " + req.session.user_id.toString());

                        //Redirect the user to the home page. Let that redirect the user to the correct spot
                        res.redirect("/");
                    });
                });
            } else {
                // This user account already exists
                console.log("register.js: Username already exists. Reload register page with that message");
                res.render('authentication/register', { message: "The email: '" + username + "' already has an account associated with it" });
            }
        });
    }
});

module.exports = router;