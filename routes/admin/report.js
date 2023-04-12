var express = require('express');
var router = express.Router();
var dbCon = require('../../lib/database');

function getCheckInsToday() {
    sql =
        "SELECT a.f_name, a.l_name, r.num_nights, s_type.site_type_name, s.site_number FROM reservation AS r\n" +
        "   INNER JOIN account as a \n" +
        "       ON r.account_id = a.account_id \n" +
        "   INNER JOIN site as s \n" +
        "       ON r.site_id = s.site_id \n" +
        "   INNER JOIN site_type as s_type \n" +
        "       ON s.site_type_id = s_type.site_type_id \n" +
        "   WHERE start_date = CURDATE();";

    return new Promise((resolve, reject) => {
        dbCon.query(sql, function (err, rows) {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getCheckOutsToday() {
    sql =
        "SELECT a.f_name, a.l_name, r.num_nights, s_type.site_type_name, s.site_number FROM reservation AS r\n" +
        "   INNER JOIN account as a \n" +
        "       ON r.account_id = a.account_id \n" +
        "   INNER JOIN site as s \n" +
        "       ON r.site_id = s.site_id \n" +
        "   INNER JOIN site_type as s_type \n" +
        "       ON s.site_type_id = s_type.site_type_id \n" +
        "   WHERE end_date = CURDATE();";

    return new Promise((resolve, reject) => {
        dbCon.query(sql, function (err, rows) {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

router.get('/', async function (req, res, next) {
    if (req.session.user.account_type == 'employee') {
        console.log('report.js: GET');

        const currentDate = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDate = `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;

        try {
            let checkInsToday = await getCheckInsToday();
            let checkOutsToday = await getCheckOutsToday();
            //  TODO: get occupied spots number
            //  TODO: get the site id's to assign the numbers to 

            res.render('admin/report', { todaysDate: formattedDate, checkInsToday: checkInsToday, checkOutsToday: checkOutsToday });
        } catch (err) {
            console.log(err.message);
            next(err); // Pass the error to the next middleware
        }

    } else {
        res.redirect('/');
    }
});

module.exports = router;
