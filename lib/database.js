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
        "CREATE TABLE IF NOT EXISTS site_type( \n" +
        "   site_type_ID TINYINT NOT NULL, \n" +
        "   site_type_name VARCHAR(50) NOT NULL, \n" +
        "   PRIMARY KEY (site_type_id) \n" +
        ")";
    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table site_type created if it didn't exist");
        }
    });

    sql =
        "CREATE TABLE IF NOT EXISTS site( \n" +
        "   site_id TINYINT NOT NULL AUTO_INCREMENT, \n" +
        "   site_type_id TINYINT NOT NULL, \n" +
        "   site_number TINYINT NOT NULL, \n" +
        "   site_length TINYINT NOT NULL, \n" +
        "   site_rate DECIMAL(7,2) NOT NULL, \n" +
        "   popup TINYINT(1) NOT NULL, \n" +
        "   PRIMARY KEY (site_id), \n" +
        "   CONSTRAINT fk_site_type_id FOREIGN KEY (site_type_id) REFERENCES site_type(site_type_id) \n" +
        ")";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table site created if it didn't exist");
        }
    });

    sql =
        "CREATE TABLE IF NOT EXISTS reservation( \n" +
        "   reservation_id INT NOT NULL AUTO_INCREMENT, \n" +
        "   account_id INT NOT NULL, \n" +
        "   site_id TINYINT NOT NULL, \n" +
        "   start_date DATE NOT NULL, \n" +
        "   num_nights SMALLINT NOT NULL, \n" +
        "   memo VARCHAR(255) NOT NULL, \n" +
        "   PRIMARY KEY (reservation_id), \n" +
        "   CONSTRAINT fk_reservation_account_id FOREIGN KEY (account_id) REFERENCES account(account_id), \n" +
        "   CONSTRAINT fk_reservation_site_id FOREIGN KEY (site_id) REFERENCES site(site_id) \n" +
        ")";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table reservation created if it didn't exist");
        }
    });

    sql =
        "CREATE TABLE IF NOT EXISTS address( \n" +
        "   address_id INT NOT NULL AUTO_INCREMENT, \n" +
        "   street VARCHAR(255) NOT NULL, \n" +
        "   apt VARCHAR(50), \n" +
        "   city VARCHAR(255) NOT NULL, \n" +
        "   state CHAR(2) NOT NULL, \n" +
        "   zip CHAR(5) NOT NULL, \n" +
        "   PRIMARY KEY (address_id) \n" +
        ")";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table address created if it didn't exist");
        }
    });

    sql =
        "CREATE TABLE IF NOT EXISTS card( \n" +
        "   card_id INT NOT NULL AUTO_INCREMENT, \n" +
        "   account_ID INT NOT NULL, \n" +
        "   address_id INT NOT NULL, \n" +
        "   number CHAR(16) NOT NULL, \n" +
        "   exp_month CHAR(2) NOT NULL, \n" +
        "   exp_year CHAR(4) NOT NULL, \n" +
        "   security_code CHAR(4) NOT NULL, \n" +
        "   PRIMARY KEY (card_id), \n" +
        "   CONSTRAINT fk_card_account_id FOREIGN KEY (account_id) REFERENCES account(account_id), \n" +
        "   CONSTRAINT fk_card_address_id FOREIGN KEY (address_id) REFERENCES address(address_id) \n" +
        ")";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table card created if it didn't exist");
        }
    });
}

function createStoredProcedures() {

}

function addTableData() {
    //TODO: add the 3 different site types. 

}


module.exports = con;