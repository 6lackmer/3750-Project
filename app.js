var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

// create routers
var indexRouter = require('./routes/index');

// Admin Pages
var adminReportRouter = require('./routes/admin/report'); // Daily Report Page

// Authentication Pages
var loginRouter = require('./routes/authentication/login'); // Login page
var registerRouter = require('./routes/authentication/register'); // Register Page

// Public Pages
var informationRouter = require('./routes/public/information'); // Information Page
var locationRouter = require('./routes/public/location'); // Location Page
var policiesRouter = require('./routes/public/policies'); // Policies Page

// User Pages
var accountRouter = require('./routes/user/account'); // User Account Page
var reservationHistoryRouter = require('./routes/user/history'); // User Reservation History Page

// Reservation Pages
var reservationRouter = require('./routes/reservation'); // Reservation Form
var reservationConfirmationRouter = require('./routes/reservation-confirmation'); // Reservation Confirmation Page
var reservationSummaryRouter = require('./routes/reservation-summary'); // Reservation Summary Page

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// This will set up the database if it doesn't already exist
var dbCon = require('./lib/database');

// Session management to store cookies in a MySQL server (this has a bug, so we assist it by creating the database for it)
var dbSessionPool = require('./lib/sessionPool');
var sessionStore = new MySQLStore({}, dbSessionPool);

// Necessary middleware to store session cookies in MySQL
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret1234',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'strict'
    }
}));

// Middleware to make session variables available in .ejs template files
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use('/', indexRouter);

// Admin Pages
app.use('/admin/report', adminReportRouter);

// Authentication Pages
app.use('/login', loginRouter);
app.use('/register', registerRouter);

// Public Pages
app.use('/information', informationRouter);
app.use('/location', locationRouter);
app.use('/policies', policiesRouter);

// User Pages
app.use('/account', accountRouter);
app.use('/history', reservationHistoryRouter);

// Reservation Pages
app.use('/reservation', reservationRouter);
app.use('/reservation-confirmation', reservationConfirmationRouter);
app.use('/reservation-summary', reservationSummaryRouter);

app.get('/reservation-details', (req, res) => {
    res.render('reservation-details');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;