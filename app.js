///including packages
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
require('dotenv').config();
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
var expressSanitizer = require('express-sanitizer');
const ejsLint = require('ejs-lint');

//including models

var User = require('./models/user.js');

//Flash Messages
var flash = require('connect-flash');

//including Rotes
var hotelRoutes = require('./routes/hotel');
var commentRoutes = require('./routes/comment');
var authRoutes = require('./routes/auth');
var indexRoutes = require('./routes/index');
var blogRoutes = require('./routes/blog.js');
//Requirements
mongoose
    .connect(process.env.MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then(() => {
        console.log('Connected');
    })
    .catch((err) => {
        console.log(err.message);
    });

app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(
    require('express-session')({
        secret: 'Vedant is Cool',
        resave: false,
        saveUninitialized: false
    })
);

// require('./seeds')();
app.use(flash());
app.use(function (req, res, next) {
    res.locals.success = req.flash('success');
    next();
});
app.use(function (req, res, next) {
    res.locals.error = req.flash('error');
    next();
});

//Setting Up Passport.JS
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

//Using Routes

app.use(authRoutes);
app.use(hotelRoutes);
app.use(blogRoutes);
app.use(commentRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log('HotelHunts Has Started Started ');
});