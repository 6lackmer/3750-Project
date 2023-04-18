var express = require('express');
var router = express.Router();
var dbCon = require('../../lib/database');

function callProcedure(sql){
    return new Promise((resolve, reject) => {
        dbCon.query(sql, function (err, rows) {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {
                resolve(rows); // Extract the reservation_count value directly here
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
            let checkInsToday = await callProcedure("CALL get_check_ins_today();");
            checkInsToday = checkInsToday[0]

            let checkOutsToday = await callProcedure("CALL get_check_outs_today();");
            checkOutsToday = checkOutsToday[0]

            let reservationCount = await callProcedure("CALL get_todays_reservations_count();");
            reservationCount = reservationCount[0][0].todays_count

            res.render('admin/report', { todaysDate: formattedDate, checkInsToday: checkInsToday, checkOutsToday: checkOutsToday, reservationCount: reservationCount });
        } catch (err) {
            console.log(err.message);
            next(err); 
        }
    } else {
        res.redirect('/');
    }
});

router.post('/', function (req, res, next) {
    console.log("report.js: POST");

    const current_reservation = req.body.reservation_id;
    const action_id = req.body.action_id;
    if (action_id = 1) { // Check in
        let sql = "CALL modify_reservation('" + current_reservation + "', '', '', 'In');";
        dbCon.query(sql, function (err, rows) {
            if (err) {
                throw err;
            }
            res.redirect('admin/report');
        });
    } else {
        let sql = "CALL modify_reservation('" + current_reservation + "', '', '', 'Out');";
        dbCon.query(sql, function (err, rows) {
            if (err) {
                throw err;
            }
            res.redirect('admin/report');
        });
    }
});

module.exports = router;