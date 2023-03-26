var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

// create routers
var indexRouter = require('./routes/index');

var loginUserRouter = require('./routes/login'); // Login page
var registerRouter = require('./routes/register'); // Register Page

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// This will set up the database if it doesn't already exist
var dbCon = require('./lib/database');

// Session management to store cookies in a MySQL server (this has a bug, so we assist it by creating the database for it)
var dbSessionPool = require('./lib/sessionPool.js');
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

//app.use('/loginuser', loginUserRouter);
//app.use('/register', registerRouter);

// temporary routes to show site mockup
app.get('/index2', (req, res) => {
    res.render('index2');
});
app.get('/register', (req, res) => {
    res.render('user/register');
});
app.get('/login', (req, res) => {
    res.render('user/login');
});
app.get('/account', (req, res) => {
    res.render('user/account');
});
app.get('/history', (req, res) => {
    res.render('user/history');
});
app.get('/reservation', (req, res) => {
    res.render('reservation');
});
app.get('/reservation-confirmation', (req, res) => {
    res.render('reservation-confirmation');
});
app.get('/reservation-details', (req, res) => {
    res.render('reservation-details');
});
app.get('/admin/report', (req, res) => {
    res.render('admin/report');
});
app.get('/information', (req, res) => {
    res.render('information');
});
app.get('/location', (req, res) => {
    res.render('location');
});
app.get('/policies', (req, res) => {
    res.render('policies');
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