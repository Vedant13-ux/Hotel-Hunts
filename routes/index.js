var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('landing');
});
router.get('/tovisit', function(req, res) {
    res.render('tovisit');
});
router.get('*', function(req, res) {
    res.render('nofound');
});

module.exports = router;