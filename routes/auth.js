var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

//SignUp

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', (req, res) => {
    User.register(new User({ username: req.body.username, gender: req.body.gender }), req.body.password, function(
        err,
        user
    ) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/signup');
        }
        passport.authenticate('local')(req, res, function() {
            req.flash('success', 'Welcome to YelpCamp ' + user.username);
            res.redirect('/hotels');
        });
    });
});

//Login
router.get('/login', function(req, res) {
    res.render('login');
});
router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/hotels',
        failureRedirect: '/login'
    }),
    function(req, res) {
        console.log('Logged in');
    }
);

//Logout
router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'Successfully Logged You Out');
    res.redirect('/hotels');
});

module.exports = router;