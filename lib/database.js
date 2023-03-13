let mysql = require('mysql2');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
    host: dbConnectionInfo.host,
    user: dbConnectionInfo.user,
    password: dbConnectionInfo.password,
    port: dbConnectionInfo.port,
    multipleStatements: true              // Needed for stored proecures with OUT results
});

con.connect(function (err) {
    if (err) {
        throw err;
    }
    else {
        console.log("database.js: Connected to server!");

        con.query("CREATE DATABASE IF NOT EXISTS rv_park", function (err, result) {
            if (err) {
                console.log(err.message);
                throw err;
            }
            console.log("database.js: rv_park database created if it didn't exist");
            selectDatabase();
        });
    }
});

function selectDatabase() {
    let sql = "USE rv_park";
    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: Selected rv_park database");
            createTables();
            createStoredProcedures();
            addTableData();
        }
    });
}

//TODO: add tables
function createTables() {
    let sql;

    sql =
        "CREATE TABLE IF NOT EXISTS account( \n" +
        "   account_id INT NOT NULL AUTO_INCREMENT, \n" +
        "   account_type VARCHAR(8) NOT NULL, \n" +
        "   f_name VARCHAR(50) NOT NULL, \n" +
        "   l_name VARCHAR(50) NOT NULL, \n" +
        "   email VARCHAR(255) NOT NULL, \n" +
        "   phone_number VARCHAR(10) NOT NULL, \n" +
        "   dod_rank VARCHAR(50) NOT NULL, \n" +
        "   dod_affiliation VARCHAR(50) NOT NULL, \n" +
        "   dod_status VARCHAR(7) NOT NULL, \n" +
        "   pcs TINYINT(1) NOT NULL, \n" +
        "   PRIMARY KEY (account_id), \n" +
        "   CHECK (account_type IN ('employee', 'customer')), \n " +
        "   CHECK (dod_status IN ('active', 'retired')) \n " +
        ")";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table account created, and constraints added, if it didn't exist");
        }
    });

    sql =
        "CREATE TABLE IF NOT EXISTS trailer_site( \n" +
        "   trailer_site_id INT NOT NULL AUTO_INCREMENT, \n" +
        "   site_number TINYINT NOT NULL, \n" + 
        "   site_length TINYINT NOT NULL, \n" + 
        "   site_rate DECIMAL(7,2) NOT NULL, \n" + 
        "   popup TINYINT(1) NOT NULL, \n" + 
        "   PRIMARY KEY (trailer_site_id) \n" +
        ")";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table trailer_site created if it didn't exist");
        }
    });

    sql =
        "CREATE TABLE IF NOT EXISTS dry_storage_site( \n" +
        "   dry_storage_site_id INT NOT NULL AUTO_INCREMENT, \n" +
        "   site_number TINYINT NOT NULL, \n" + 
        "   site_rate DECIMAL(7,2) NOT NULL, \n" + 
        "   PRIMARY KEY (dry_storage_site_id) \n" +
        ")";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table dry_storage_site created if it didn't exist");
        }
    });

    sql =
        "CREATE TABLE IF NOT EXISTS tent_site( \n" +
        "   tent_site_id INT NOT NULL AUTO_INCREMENT, \n" +
        "   site_rate DECIMAL(7,2) NOT NULL, \n" + 
        "   PRIMARY KEY (tent_site_id) \n" +
        ")";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table tent_site created if it didn't exist");
        }
    });
}

function createStoredProcedures() {

}

function addTableData() {

}


module.exports = con;