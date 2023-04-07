let mysql = require('mysql2');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
    host: dbConnectionInfo.host,
    user: dbConnectionInfo.user,
    password: dbConnectionInfo.password,
    port: dbConnectionInfo.port,
    multipleStatements: true // Needed for stored proecures with OUT results
});

con.connect(function(err) {
    if (err) {
        throw err;
    } else {
        console.log("database.js: Connected to server!");

        con.query("CREATE DATABASE IF NOT EXISTS rv_park", function(err, result) {
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
    con.query(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: Selected rv_park database");
            createTables();
            createStoredProcedures();
            //addTableData();
        }
    });
}

function createTables() {
    let sql;

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
        "   CHECK (dod_status IN ('active', 'retired', 'discharged')) \n " +
        ")";

    con.execute(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table account created, and constraints added, if it didn't exist");
        }
    });

    sql =
        "CREATE TABLE IF NOT EXISTS site_type( \n" +
        "   site_type_ID TINYINT NOT NULL AUTO_INCREMENT, \n" +
        "   site_type_name VARCHAR(50) NOT NULL, \n" +
        "   PRIMARY KEY (site_type_id) \n" +
        ")";

    con.execute(sql, function(err, results, fields) {
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
        "   site_number CHAR(3) NOT NULL, \n" + //TODO allow for null if the camp site doesnt have a number
        "   max_trailer_length TINYINT, \n" +
        "   rate DECIMAL(7,2) NOT NULL, \n" +
        "   PRIMARY KEY (site_id), \n" +
        "   CONSTRAINT fk_site_type_id FOREIGN KEY (site_type_id) REFERENCES site_type(site_type_id) \n" +
        ")";

    con.execute(sql, function(err, results, fields) {
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
        "   memo VARCHAR(255), \n" +
        "   status VARCHAR(21) NOT NULL, \n" +
        "   end_date DATE NOT NULL, \n" +
        "   PRIMARY KEY (reservation_id), \n" +
        "   CONSTRAINT fk_reservation_account_id FOREIGN KEY (account_id) REFERENCES account(account_id), \n" +
        "   CONSTRAINT fk_reservation_site_id FOREIGN KEY (site_id) REFERENCES site(site_id) \n" +
        ")";

    con.execute(sql, function(err, results, fields) {
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

    con.execute(sql, function(err, results, fields) {
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

    con.execute(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table card created if it didn't exist");
        }
    });

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

    con.execute(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: table invoice created if it didn't exist");
        }
    });
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

    // Authentication

    sql = "CREATE PROCEDURE IF NOT EXISTS `add_user_account`(\n" +
        "IN username VARCHAR(255), \n" +
        "IN hashed_password VARCHAR(255), \n" +
        "IN salt VARCHAR(255), \n" +
        "IN account_type VARCHAR(8), \n" +
        "IN f_name VARCHAR(255), \n" +
        "IN l_name VARCHAR(255), \n" +
        "IN email VARCHAR(255), \n" +
        "IN phone VARCHAR(10), \n" +
        "IN dod_rank VARCHAR(50), \n" +
        "IN affiliation VARCHAR(50), \n" +
        "IN status VARCHAR(7), \n" +
        "IN pcs TINYINT, \n" +
        "OUT result INT \n" +
        ")\n" +
        "BEGIN\n" +
        "DECLARE nCount INT DEFAULT 0;\n" +
        "SET result = 0;\n" +
        "SELECT Count(*) INTO nCount FROM account WHERE account.username = username;\n" +
        "IF nCount = 0 THEN\n" +
        "INSERT INTO account (username, hashed_password, salt, account_type, f_name, l_name, email, phone_number, dod_rank, dod_affiliation, dod_status, pcs)\n" +
        "VALUES (username, hashed_password, salt, account_type, f_name, l_name, email, phone_number, dod_rank, affiliation, status, pcs\n" +
        ");\n" +
        "ELSE\n" +
        "SET result = 1;\n" +
        "END IF;\n" +
        "END;"

    con.query(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure add_user_account created if it didn't exist");
        }
    });

    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_salt_from_email`\n" +
        "( \n" +
        "   IN email VARCHAR(255) \n" +
        ") \n" +
        "BEGIN\n" +
        "   SELECT salt FROM account WHERE account.email = email; \n" +
        "END;";

    con.query(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_salt_from_email created if it didn't exist");
        }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `check_credentials`(\n" +
        "IN  username VARCHAR(255), \n" +
        "IN hashed_password VARCHAR(255), \n" +
        "OUT result INT\n" +
        ")\n" +
        "BEGIN\n" +
        "DECLARE nCount INT DEFAULT 0;\n" +
        "SET result = 0;\n" +
        "SELECT Count(*) INTO nCount FROM account WHERE account.username = username AND account.hashed_password = hashed_password;\n" +
        "IF nCount = 1 THEN\n" +
        "SET result = (SELECT account_id FROM account WHERE account.username = username AND account.hashed_password=hashed_password\n" +
        ");\n" +
        "ELSE\n" +
        "SET result = 0;\n" +
        "END IF;\n" +
        "END;";

    con.query(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure check_credentials created if it didn't exist");
        }
    });

    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_user_id_from_hash_or_email`\n" +
        "( \n" +
        "   IN email VARCHAR(255), \n" +
        "   IN hashed_password VARCHAR(255) \n" +
        ") \n" +
        "BEGIN\n" +
        "   IF email IS NOT NULL AND hashed_password IS NOT NULL THEN \n" +
        "       SELECT account_id FROM account WHERE account.email = email AND account.hashed_password = hashed_password LIMIT 1; \n" +
        "   ELSEIF email IS NOT NULL THEN \n" +
        "       SELECT account_id FROM account WHERE account.email = email LIMIT 1; \n" +
        "   ELSEIF hashed_password IS NOT NULL THEN \n" +
        "       SELECT account_id FROM account WHERE account.hashed_password = hashed_password LIMIT 1; \n" +
        "   END IF; \n" +
        "END;";

    con.query(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_user_id_from_hash_or_email created if it didn't exist");
        }
    });


    // Viewing/Modifying Account-Related Information

    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_user_account`\n" +
        "( \n" +
        "   IN account_id INT\n" +
        ") \n" +
        "BEGIN\n" +
        "   SELECT * FROM account WHERE account_id = account_id; \n" +
        "END;";

    con.query(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_user_account created if it didn't exist");
        }
    });

    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_reservations_from_account_id`\n" +
        "( \n" +
        "   IN account_id INT\n" +
        ") \n" +
        "BEGIN\n" +
        "   SELECT * FROM reservation WHERE account_id = account_id; \n" +
        "END;";

    con.query(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_reservations_from_account_id created if it didn't exist");
        }
    });

    sql =
        "CREATE PROCEDURE IF NOT EXISTS `get_reservation_from_reservation_id`\n" +
        "( \n" +
        "   IN reservation_id INT\n" +
        ") \n" +
        "BEGIN\n" +
        "   SELECT * FROM reservation WHERE reservation_id = reservation_id; \n" +
        "END;";

    con.query(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_reservation_from_reservation_id created if it didn't exist");
        }
    });


    // Creating A Reservation

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
        "   ORDER BY max_trailer_length LIMIT 1;\n" +
        "END;";

    con.query(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure get_salt_from_email created if it didn't exist");
        }
    });

    sql = "CREATE PROCEDURE IF NOT EXISTS `create_reservation`(\n" +
        "IN account_id INT, \n" +
        "IN site_id SMALLINT, \n" +
        "IN start_date DATE, \n" +
        "IN end_date DATE, \n" +
        "IN num_nights TINYINT, \n" +
        "IN status VARCHAR(21) \n" +
        ")\n" +
        "BEGIN\n" +
        "INSERT INTO reservation (account_id, site_id, start_date, end_date, num_nights, status)\n" +
        "VALUES (account_id, site_id, start_date, end_date, num_nights, status\n" +
        ");\n" +
        "END;"

    con.query(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: procedure create_reservation created if it didn't exist");
        }
    });
}

function addTableData() {
    let sql;

    sql =
        "INSERT INTO site_type (site_type_name) \n" +
        "   VALUES ('trailer'), \n" +
        "   ('pop up trailer'), \n" +
        "   ('tent on wheels'), \n" +
        "   ('dry storage'), \n" +
        "   ('tent')";


    con.execute(sql, function(err, results, fields) {
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

    con.execute(sql, function(err, results, fields) {
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

    con.execute(sql, function(err, results, fields) {
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

    con.execute(sql, function(err, results, fields) {
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

    con.execute(sql, function(err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        } else {
            console.log("database.js: added data to site");
        }
    });

}


module.exports = con;