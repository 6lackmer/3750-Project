let mysql = require('mysql2');
let crypto = require('crypto-js');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
    host: dbConnectionInfo.host,
    user: dbConnectionInfo.user,
    password: dbConnectionInfo.password,
    port: dbConnectionInfo.port,
    multipleStatements: true // Needed for stored proecures with OUT results
});

con.connect(function (err) {
    if (err) {
        throw err;
    } else {
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
            // addTableData();
        }
    });
}

function createTables() {
    let sql;

    //#region Account
    sql =
        "CREATE TABLE IF NOT EXISTS account( \n" +
        "   account_id INT NOT NULL AUTO_INCREMENT, \n" +
        "   username VARCHAR(255) NOT NULL,\n" +
        "   hashed_password VARCHAR(255) NOT NULL,\n" +
        "   salt VARCHAR(255) NOT NULL,\n" +
        "   account_type VARCHAR(8) NOT NULL, \n" +
        "   f_name VARCHAR(50) NOT NULL, \n" +
        "   l_name VARCHAR(50) NOT NULL, \n" +
        "   email VARCHAR(255) NOT NULL, \n" +
        "   phone_number VARCHAR(10) NOT NULL, \n" +
        "   dod_rank VARCHAR(50) NOT NULL, \n" +
        "   dod_affiliation VARCHAR(50) NOT NULL, \n" +
        "   dod_status VARCHAR(10) NOT NULL, \n" +
        "   pcs TINYINT(1) NOT NULL, \n" +
        "   PRIMARY KEY (account_id), \n" +
        "   CHECK (account_type IN ('employee', 'customer')), \n " +
        "   CHECK (dod_status IN ('active', 'veteran', 'discharged')) \n " +
        ")";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table account created, and constraints added, if it didn't exist");
        }
    });
    //#endregion

    //#region Site Type
    sql =
        "CREATE TABLE IF NOT EXISTS site_type( \n" +
        "   site_type_ID TINYINT NOT NULL AUTO_INCREMENT, \n" +
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
    //#endregion

    //#region Site
    sql =
        "CREATE TABLE IF NOT EXISTS site( \n" +
        "   site_id TINYINT NOT NULL AUTO_INCREMENT, \n" +
        "   site_type_id TINYINT NOT NULL, \n" +
        "   site_number CHAR(4) NOT NULL, \n" + //TODO allow for null if the camp site doesnt have a number
        "   max_trailer_length TINYINT, \n" +
        "   rate DECIMAL(7,2) NOT NULL, \n" +
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
    //#endregion

    //#region Reservation
    sql =
        "CREATE TABLE IF NOT EXISTS reservation( \n" +
        "   reservation_id INT NOT NULL AUTO_INCREMENT, \n" +
        "   account_id INT NOT NULL, \n" +
        "   site_id TINYINT NOT NULL, \n" +
        "   start_date DATE NOT NULL, \n" +
        "   num_nights SMALLINT NOT NULL, \n" +
        "   memo VARCHAR(255), \n" +
        "   status VARCHAR(21) NOT NULL, \n" +
        "   end_date DATE NOT NULL, \n" +
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
    //#endregion

    //#region Address
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
    //#endregion

    //#region Card
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
    //#endregion

    //#region Invoice
    sql =
        "CREATE TABLE IF NOT EXISTS invoice( \n" +
        "   invoice_id INT NOT NULL AUTO_INCREMENT, \n" +
        "   reservation_id INT NOT NULL, \n" +
        "   card_id INT NOT NULL, \n" +
        "   invoice_date DATE NOT NULL, \n" +
        "   invoice_amount DECIMAL(7,2) NOT NULL, \n" +
        "   payment_amount DECIMAL(7,2) NOT NULL, \n" +
        "   payment_method CHAR(4) NOT NULL, \n" +
        "   invoice_type CHAR(7) NOT NULL, \n" +
        "   memo VARCHAR (255) NOT NULL, \n" +
        "   PRIMARY KEY (invoice_id), \n" +
        "   CONSTRAINT fk_reservation_id FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id), \n" +
        "   CONSTRAINT fk_card_id FOREIGN KEY (card_id) REFERENCES card(card_id) \n" +
        ")";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table invoice created if it didn't exist");
        }
    });
    //#endregion
}

function createStoredProcedures() {

    // sql =
    //     "CREATE PROCEDURE IF NOT EXISTS ``\n" +
    //     "( \n" +
    //     "   IN  \n" +
    //     ") \n" +
    //     "BEGIN\n" +
    //     "END;";

    // con.query(sql, function (err, results, fields) {
    //     if (err) {
    //         console.log(err.message);
    //         throw err;
    //     } else {
    //         console.log("database.js: procedure  created if it didn't exist");
    //     }
    // });

    let sql;

    //#region Insert

    //#region User Account
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `add_user_account`(\n" +
        "   IN username VARCHAR(255), \n" +
        "   IN hashed_password VARCHAR(255), \n" +
        "   IN salt VARCHAR(255), \n" +
        "   IN account_type VARCHAR(8), \n" +
        "   IN f_name VARCHAR(255), \n" +
        "   IN l_name VARCHAR(255), \n" +
        "   IN email VARCHAR(255), \n" +
        "   IN phone_number VARCHAR(10), \n" +
        "   IN dod_rank VARCHAR(50), \n" +
        "   IN affiliation VARCHAR(50), \n" +
        "   IN status VARCHAR(32), \n" +
        "   IN pcs TINYINT, \n" +
        "   OUT result INT \n" +
        ")\n" +
        "BEGIN\n" +
        "   DECLARE nCount INT DEFAULT 0;\n" +
        "   SET result = 0;\n" +
        "   SELECT Count(*) INTO nCount FROM account WHERE account.username = username;\n" +
        "       IF nCount = 0 THEN\n" +
        "           INSERT INTO account ( \n" +
        "               username, \n" +
        "               hashed_password, \n" +
        "               salt, \n" +
        "               account_type, \n" +
        "               f_name, \n" +
        "               l_name, \n" +
        "               email, \n" +
        "               phone_number, \n" +
        "               dod_rank, \n" +
        "               dod_affiliation, \n" +
        "               dod_status, \n" +
        "               pcs \n" +
        "           )\n" +
        "           VALUES ( \n" +
        "               username, \n" +
        "               hashed_password, \n" +
        "               salt, \n" +
        "               account_type, \n" +
        "               f_name, \n" +
        "               l_name, \n" +
        "               email, \n" +
        "               phone_number, \n" +
        "               dod_rank, \n" +
        "               affiliation, \n" +
        "               status, \n" +
        "               pcs \n" +
        "           );\n" +
        "       ELSE\n" +
        "           SET result = 1;\n" +
        "       END IF;\n" +
        "END;"

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure add_user_account created if it didn't exist");
        }
    });
    //#endregion

    //#region Reservation

    sql =
        "CREATE PROCEDURE IF NOT EXISTS `add_reservation`\n" +
        "( \n" +
        "   IN account_id INT,\n" +
        "   IN site_id TINYINT,\n" +
        "   IN start_date DATE,\n" +
        "   IN num_nights SMALLINT,\n" +
        "   IN memo VARCHAR(255),\n" +
        "   IN status VARCHAR(21),\n" +
        "   IN end_date DATE \n" +
        ") \n" +
        "BEGIN\n" +
        "    INSERT INTO reservation( \n" +
        "        account_id, \n" +
        "        site_id, \n" +
        "        start_date, \n" +
        "        num_nights, \n" +
        "        memo, \n" +
        "        status, \n" +
        "        end_date \n" +
        "    ) \n" +
        "    VALUES( \n" +
        "        account_id, \n" +
        "        site_id, \n" +
        "        start_date, \n" +
        "        num_nights, \n" +
        "        memo, \n" +
        "        status, \n" +
        "        end_date \n" +
        "    ); \n" +
        "SELECT last_insert_id();\n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure add_reservation created if it didn't exist");
        }
    });

    //#endregion

    //#region Address
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `add_address`(\n" +
        "    IN street VARCHAR(255), \n" +
        "    IN apt VARCHAR(50), \n" +
        "    IN city VARCHAR(255), \n" +
        "    IN state CHAR(2), \n" +
        "    IN zip CHAR(5) \n" +
        ") \n" +
        "BEGIN \n" +
        "    INSERT INTO address ( \n" +
        "        street, \n" +
        "        apt, \n" +
        "        city, \n" +
        "        state, \n" +
        "        zip \n" +
        "    ) \n" +
        "    VALUES ( \n" +
        "        street, \n" +
        "        apt, \n" +
        "        city, \n" +
        "        state, \n" +
        "        zip \n" +
        "    ); \n" +
        "SELECT last_insert_id();\n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure add_address created if it didn't exist");
        }
    });
    //#endregion

    //#region Card
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `add_card`(\n" +
        "    IN account_id INT, \n" +
        "    IN address_id INT, \n" +
        "    IN number CHAR(16), \n" +
        "    IN exp_month CHAR(2), \n" +
        "    IN exp_year CHAR(4), \n" +
        "    IN security_code CHAR(4) \n" +
        ") \n" +
        "BEGIN \n" +
        "    INSERT INTO card ( \n" +
        "        account_ID, \n" +
        "        address_id, \n" +
        "        number, \n" +
        "        exp_month, \n" +
        "        exp_year, \n" +
        "        security_code \n" +
        "    ) \n" +
        "    VALUES ( \n" +
        "        account_id, \n" +
        "        address_id, \n" +
        "        number, \n" +
        "        exp_month, \n" +
        "        exp_year, \n" +
        "        security_code \n" +
        "    ); \n" +
        "SELECT last_insert_id();\n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure add_card created if it didn't exist");
        }
    });
    //#endregion

    //#region Invoice
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `add_invoice`\n(" +
        "    IN reservation_id INT, \n" +
        "    IN card_id INT, \n" +
        "    IN invoice_date DATE, \n" +
        "    IN invoice_amount DECIMAL(7,2), \n" +
        "    IN payment_amount DECIMAL(7,2), \n" +
        "    IN payment_method CHAR(4), \n" +
        "    IN invoice_type CHAR(7), \n" +
        "    IN memo VARCHAR(255) \n" +
        ") \n" +
        "BEGIN \n" +
        "    INSERT INTO invoice ( \n" +
        "        reservation_id, \n" +
        "        card_id, \n" +
        "        invoice_date, \n" +
        "        invoice_amount, \n" +
        "        payment_amount, \n" +
        "        payment_method, \n" +
        "        invoice_type, \n" +
        "        memo \n" +
        "    ) \n" +
        "    VALUES ( \n" +
        "        reservation_id, \n" +
        "        card_id, \n" +
        "        invoice_date, \n" +
        "        invoice_amount, \n" +
        "        payment_amount, \n" +
        "        payment_method, \n" +
        "        invoice_type, \n" +
        "        memo \n" +
        "    ); \n" +
        "SELECT last_insert_id();\n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure add_invoice created if it didn't exist");
        }
    });
    //#endregion

    //#endregion

    //#region Modify

    //#region Site

    // Note: pass NULL if not updating a value
    sql =
        "CREATE PROCEDURE IF NOT EXISTS modify_site( \n" +
        "    IN p_site_id TINYINT, \n" +
        "    IN new_site_type_id TINYINT, \n" +
        "    IN new_site_number CHAR(4), \n" +
        "    IN new_max_trailer_length TINYINT, \n" +
        "    IN new_rate DECIMAL(7,2) \n" +
        ") \n" +
        "BEGIN \n" +
        "    UPDATE site \n" +
        "    SET \n" +
        "    site_type_id = IF(new_site_type_id IS NOT NULL, new_site_type_id, site_type_id), \n" +
        "    site_number = IF(new_site_number IS NOT NULL, new_site_number, site_number), \n" +
        "    max_trailer_length = IF(new_max_trailer_length IS NOT NULL, new_max_trailer_length, max_trailer_length), \n" +
        "    rate = IF(new_rate IS NOT NULL, new_rate, rate) \n" +
        "    WHERE \n" +
        "        site_id = p_site_id; \n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure modify_site created if it didn't exist");
        }
    });
    //#endregion

    //#region Reservation

    // Note: pass NULL if not updating a value
    sql =
        "CREATE PROCEDURE IF NOT EXISTS modify_reservation( \n" +
        "    IN p_reservation_id INT, \n" +
        "    IN new_site_id TINYINT, \n" +
        "    IN new_status VARCHAR(21), \n" +
        "    IN new_memo VARCHAR(255) \n" +
        ") \n" +
        "BEGIN \n" +
        "    UPDATE reservation \n" +
        "    SET \n" +
        "        site_id = IF(new_site_id IS NOT NULL, new_site_id, site_id), \n" +
        "        memo = IF(new_memo IS NOT NULL, new_memo, memo), \n" +
        "        status = IF(new_status IS NOT NULL, new_status, status) \n" +
        "    WHERE \n" +
        "        reservation_id = p_reservation_id; \n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure modify_reservation created if it didn't exist");
        }
    });
    //#endregion

    //#endregion

    //#region Select

    //#region Get Salt
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_salt_from_email`( \n" +
        "   IN email VARCHAR(255) \n" +
        ") \n" +
        "BEGIN \n" +
        "   SELECT salt FROM account WHERE account.email = email; \n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_salt_from_email created if it didn't exist");
        }
    });
    //#endregion

    //#region Check Credentials
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `check_credentials`(\n" +
        "   IN username VARCHAR(255), \n" +
        "   IN hashed_password VARCHAR(255) \n" +
        ")\n" +
        "BEGIN\n" +
        "   SELECT account_id, username, account_type, f_name, l_name, email, phone_number, dod_rank, dod_affiliation, dod_status, pcs\n" +
        "   FROM account WHERE account.username = username AND account.hashed_password=hashed_password;\n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure check_credentials created if it didn't exist");
        }
    });
    //#endregion

    //#region Select User Id
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_user_id_from_hash_or_email`( \n" +
        "   IN email VARCHAR(255), \n" +
        "   IN hashed_password VARCHAR(255) \n" +
        ") \n" +
        "BEGIN\n" +
        "   IF email IS NOT NULL AND hashed_password IS NOT NULL THEN \n" +
        "       SELECT account_id, username, account_type, f_name, l_name, email, phone_number, dod_rank, dod_affiliation, dod_status, pcs FROM account WHERE account.email = email AND account.hashed_password = hashed_password LIMIT 1; \n" +
        "   ELSEIF email IS NOT NULL THEN \n" +
        "       SELECT account_id, username, account_type, f_name, l_name, email, phone_number, dod_rank, dod_affiliation, dod_status, pcs FROM account WHERE account.email = email LIMIT 1; \n" +
        "   ELSEIF hashed_password IS NOT NULL THEN \n" +
        "       SELECT account_id, username, account_type, f_name, l_name, email, phone_number, dod_rank, dod_affiliation, dod_status, pcs FROM account WHERE account.hashed_password = hashed_password LIMIT 1; \n" +
        "   END IF; \n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_user_id_from_hash_or_email created if it didn't exist");
        }
    });
    //#endregion

    //#region Select User Account Info
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_user_account`\n" +
        "( \n" +
        "   IN account_id INT\n" +
        ") \n" +
        "BEGIN\n" +
        "   SELECT * FROM account WHERE account.account_id = account_id; \n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_user_account created if it didn't exist");
        }
    });
    //#endregion

    //#region Select User Reservations By Time Period
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_reservations_from_account_id`( \n" +
        "   IN account_id INT,\n" +
        "   IN time TINYINT\n" +
        ") \n" +
        "BEGIN\n" +
        "   IF time = '1' THEN \n" +
        "       SELECT reservation.*, site_type.site_type_name FROM reservation \n" +
        "       INNER JOIN site ON reservation.site_id = site.site_id \n" +
        "       INNER JOIN site_type ON site.site_type_id = site_type.site_type_id \n" +
        "       WHERE reservation.account_id = account_id AND (reservation.status = 'reserved' OR reservation.status = 'booking') \n" +
        "       ORDER BY reservation.end_date; \n" +
        "   ELSEIF time = '2' THEN \n" +
        "       SELECT reservation.*, site_type.site_type_name FROM reservation \n" +
        "       INNER JOIN site ON reservation.site_id = site.site_id \n" +
        "       INNER JOIN site_type ON site.site_type_id = site_type.site_type_id \n" +
        "       WHERE reservation.account_id = account_id AND reservation.status = 'out' \n" +
        "       ORDER BY reservation.end_date;\n" +
        "   ELSE \n" +
        "       SELECT reservation.*, site_type.site_type_name FROM reservation \n" +
        "       INNER JOIN site ON reservation.site_id = site.site_id \n" +
        "       INNER JOIN site_type ON site.site_type_id = site_type.site_type_id \n" +
        "       WHERE reservation.account_id = account_id; \n" +
        "   END IF; \n" +
        "END;";


    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_reservations_from_account_id created if it didn't exist");
        }
    });
    //#endregion

    //#region Select Reservation Info
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_reservation_from_reservation_id`\n" +
        "( \n" +
        "   IN reservation_id INT\n" +
        ") \n" +
        "BEGIN\n" +
        "   SELECT * FROM reservation \n" +
        "   INNER JOIN site s ON s.site_id = reservation.site_id \n" +
        "   INNER JOIN site_type st ON st.site_type_ID = s.site_type_id \n" +
        "   WHERE reservation.reservation_id = reservation_id; \n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_reservation_from_reservation_id created if it didn't exist");
        }
    });
    //#endregion

    //#region Select Site Info
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_site_from_site_id`\n" +
        "( \n" +
        "   IN site_id INT\n" +
        ") \n" +
        "BEGIN\n" +
        "   SELECT * FROM site WHERE site.site_id = site_id; \n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_reservation_from_reservation_id created if it didn't exist");
        }
    });
    //#endregion

    //#region Select Site Availability By Size
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_availability_by_date_and_size`\n" +
        "( \n" +
        "   IN arrivalDate Date, \n" +
        "   IN departureDate Date, \n" +
        "   IN max_length TINYINT \n" +
        ") \n" +
        "BEGIN\n" +
        "   SELECT site_id, rate, site_type_name, site_number, max_trailer_length FROM site \n" +
        "   INNER JOIN site_type ON site_type.site_type_id = site.site_type_id \n" +
        "   WHERE site.max_trailer_length >= max_length \n" +
        "   AND NOT EXISTS \n" +
        "       (SELECT 1 \n" +
        "       FROM reservation \n" +
        "       WHERE reservation.site_id = site.site_id \n" +
        "       AND reservation.start_date <= departureDate \n" +
        "       AND reservation.end_date >= arrivalDate \n" +
        "       ) \n" +
        "   ORDER BY max_trailer_length;\n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_availability_by_date_and_size created if it didn't exist");
        }
    });
    //#endregion

    //#region Select Site Availability By Type
    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_availability_by_date_and_type`\n" +
        "( \n" +
        "   IN arrivalDate Date, \n" +
        "   IN departureDate Date, \n" +
        "   IN site_type VARCHAR(50) \n" +
        ") \n" +
        "BEGIN\n" +
        "   SELECT site_id, rate, site_type_name, site_number FROM site \n" +
        "   INNER JOIN site_type ON site_type.site_type_id = site.site_type_id \n" +
        "   WHERE site_type.site_type_name = site_type \n" +
        "   AND NOT EXISTS \n" +
        "       (SELECT 1 \n" +
        "       FROM reservation \n" +
        "       WHERE reservation.site_id = site.site_id \n" +
        "       AND reservation.start_date <= departureDate \n" +
        "       AND reservation.end_date >= arrivalDate \n" +
        "       ) \n" +
        "   ORDER BY rate LIMIT 1;\n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_salt_from_email created if it didn't exist");
        }
    });

    sql =
        "CREATE PROCEDURE IF NOT EXISTS get_todays_reservations_count() \n" +
        "BEGIN \n" +
        "  DECLARE todays_count INT; \n" +
        "  SELECT COUNT(*) \n" +
        "  INTO todays_count \n" +
        "  FROM reservation \n" +
        "  WHERE start_date <= CURDATE() AND end_date >= CURDATE(); \n" +
        "  SELECT todays_count; \n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_todays_reservations_count created if it didn't exist");
        }
    });
    //#endregion

    //#endregion

    sql =
        "CREATE PROCEDURE IF NOT EXISTS get_check_ins_today() \n" +
        "BEGIN \n" +
        "    SELECT a.f_name, a.l_name, r.num_nights, s_type.site_type_name, s.site_number \n" +
        "    FROM reservation AS r \n" +
        "    INNER JOIN account as a \n" +
        "        ON r.account_id = a.account_id \n" +
        "    INNER JOIN site as s \n" +
        "        ON r.site_id = s.site_id \n" +
        "    INNER JOIN site_type as s_type \n" +
        "        ON s.site_type_id = s_type.site_type_id \n" +
        "    WHERE start_date = CURDATE(); \n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_check_ins_today created if it didn't exist");
        }
    });

    sql =
        "CREATE PROCEDURE IF NOT EXISTS get_check_outs_today() \n" +
        "BEGIN \n" +
        "    SELECT a.f_name, a.l_name, r.num_nights, s_type.site_type_name, s.site_number \n" +
        "    FROM reservation AS r \n" +
        "    INNER JOIN account as a \n" +
        "        ON r.account_id = a.account_id \n" +
        "    INNER JOIN site as s \n" +
        "        ON r.site_id = s.site_id \n" +
        "    INNER JOIN site_type as s_type \n" +
        "        ON s.site_type_id = s_type.site_type_id \n" +
        "    WHERE end_date = CURDATE(); \n" +
        "END;";

    con.query(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_check_outs_today created if it didn't exist");
        }
    });


}

function addTableData() {
    let sql;

    sql =
        "INSERT INTO site_type (site_type_name) \n" +
        "   VALUES ('trailer'), \n" +
        "   ('pop_up_trailer'), \n" +
        "   ('tent_on_wheels'), \n" +
        "   ('dry_storage'), \n" +
        "   ('tent')";


    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: added data to site_type");
        }
    });

    // add the normal trailer sites
    sql =
        "INSERT INTO site (site_type_id, site_number, max_trailer_length, rate) \n" +
        "   VALUES (1, '1', 52, 25.00), \n" + // has size exception
        "   (1, '3', 40, 25.00), \n" +
        "   (1, '2', 40, 25.00), \n" +
        "   (1, '4', 40, 25.00), \n" +
        "   (1, '5', 40, 25.00), \n" +
        "   (1, '6', 40, 25.00), \n" +
        "   (1, '7', 40, 25.00), \n" +
        "   (1, '8', 40, 25.00), \n" +
        "   (1, '9', 40, 25.00), \n" +
        "   (1, '10', 40, 25.00), \n" +
        "   (1, '11', 40, 25.00), \n" +
        "   (1, '12', 40, 25.00), \n" +
        "   (1, '13', 40, 25.00), \n" +
        "   (1, '14', 40, 25.00), \n" +
        "   (1, '17', 43, 25.00), \n" +
        "   (1, '18', 43, 25.00), \n" +
        "   (1, '19', 52, 25.00), \n" + // has size exception
        "   (1, '20', 43, 25.00), \n" +
        "   (1, '21', 52, 25.00), \n" + // has size exception
        "   (1, '22', 43, 25.00), \n" +
        "   (1, '23', 43, 25.00), \n" +
        "   (1, '24', 43, 25.00), \n" +
        "   (1, '25', 43, 25.00), \n" +
        "   (1, '26', 43, 25.00), \n" +
        "   (1, '27', 43, 25.00), \n" +
        "   (1, '28', 43, 25.00), \n" +
        "   (1, '29', 43, 25.00), \n" +
        "   (1, '30', 43, 25.00), \n" +
        "   (1, '31', 43, 25.00), \n" +
        "   (1, '32', 62, 25.00), \n" +
        "   (1, '33', 62, 25.00), \n" +
        "   (1, '34', 62, 25.00), \n" +
        "   (1, '35', 62, 25.00), \n" +
        "   (1, '36', 62, 25.00), \n" +
        "   (1, '37', 62, 25.00), \n" +
        "   (1, '38', 62, 25.00), \n" +
        "   (1, '39', 62, 25.00), \n" +
        "   (1, '41', 62, 25.00), \n" +
        "   (1, '42', 62, 25.00), \n" +
        "   (1, '43', 62, 25.00), \n" +
        "   (1, '44', 62, 25.00), \n" +
        "   (1, '45', 62, 25.00)";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: added data to site");
        }
    });

    // add the pop up trailer site
    sql =
        "INSERT INTO site (site_type_id, site_number, max_trailer_length, rate) \n" +
        "   VALUES (2, '11B', NULL, 30.00)";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: added data to site");
        }
    });

    // add the tent on wheels site
    sql =
        "INSERT INTO site (site_type_id, site_number, max_trailer_length, rate) \n" +
        "   VALUES (3, '12B', NULL, 30.00)";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: added data to site");
        }
    });

    // add the tent site
    sql =
        "INSERT INTO site (site_type_id, site_number, max_trailer_length, rate) \n" +
        "   VALUES (5, 'TENT', NULL, 30.00)";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: added data to site");
        }
    });

    // add the dry storage sites 
    sql =
        "INSERT INTO site (site_type_id, site_number, max_trailer_length, rate) \n" +
        "   VALUES (4, 'A', NULL, 30.00), \n" +
        "   (4, 'B', NULL, 30.00), \n" +
        "   (4, 'C', NULL, 30.00), \n" +
        "   (4, 'D', NULL, 30.00)";

    con.execute(sql, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: added data to site");
        }
    });

    //#region RegisterUser
    let password = "admin";
    let salt = crypto.lib.WordArray.random(8);
    let hashed = crypto.SHA256(password + ":" + salt).toString(crypto.enc.Hex);
    sql = "CALL add_user_account(" +
        "'admin@email.com'," +
        " '" + hashed + "'," +
        " '" + salt + "'," +
        " 'employee', " +
        " 'admin'," +
        " 'user'," +
        " 'admin@email.com'," +
        " '1234567890'," +
        " 'manager'," +
        " 'air_force'," +
        " 'active'," +
        " '0'," +
        " @result)";
    con.query(sql, function (err, rows) {
        if (err) {
            console.log(err.message);
            throw err;
        }
        console.log("database.js: Added Admin user");
    });

    //#endregion
}

module.exports = con;