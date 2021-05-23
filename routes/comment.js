var express = require('express');
var router = express.Router();
var Hotel = require('../models/hotel');
var Comment = require('../models/comments');

var middleware = require('../middleware');

router.post('/hotels/:id', middleware.isLoggedIn, function (req, res) {
    Hotel.findById(req.params.id).populate('comments').exec()
        .then((hotel) => {
            if (!hotel) {
                req.flash('error', "Request Couldn't Be Completed");
                return res.redirect('back');
            }
            Comment.create(req.body.comment, async function (err, newComment) {
                if (err) {
                    req.flash('error', "Request Coldn't Be Completed");
                    res.redirect('back');
                } else {
                    newComment.author = req.user.id;
                    await newComment.save();
                    var sum = 0;

                    await hotel.comments.push(newComment);
                    await hotel.comments.map(c => {
                        sum = sum + parseFloat(c.rating);
                    })
                    console.log(sum / hotel.comments.length, sum);
                    hotel.rating = Math.round((sum / hotel.comments.length) * 10) / 10;
                    await hotel.save();
                    req.flash('success', `Successfully added your Review on the Hotel`);
                    res.redirect('/hotels/' + req.params.id);
                }
            });
        }).catch((err) => {
            req.flash('error', err.message);
            res.redirect('back');
        });
});

router.put('/hotels/:id/:cmntid', middleware.checkUserCommentAuthorization, function (req, res) {
    console.log(req.body.comment)
    Comment.findByIdAndUpdate(req.params.cmntid, req.body.comment, async function (err, comment) {
        if (err) {
            req.flash('error', "Request Couldn't Be Completed");
            res.redirect('back');
        } else {
            console.log(comment);
            try {
                var hotel = await Hotel.findById(req.params.id).populate('comments').exec();
                var sum = 0;
                await hotel.comments.map(c => {
                    sum = sum + parseFloat(c.rating);
                })
                console.log(sum / hotel.comments.length, sum);
                hotel.rating = Math.round((sum / hotel.comments.length) * 10) / 10;
                await hotel.save();
                req.flash('success', 'Successfully updated your Review on the Hotel');
                res.redirect('/hotels/' + req.params.id);
            } catch (error) {
                req.flash('error', "Request Couldn't Be Completed");
                res.redirect('back');
            }

        }
    });
});

router.delete('/hotels/:id/:cmntid', middleware.checkUserCommentAuthorization, function (req, res) {
    Comment.findByIdAndDelete(req.params.cmntid, function (err) {
        if (err) {
            req.flash('error', "Request Couldn't Be Completed");
            res.redirect('back');
        } else {
            req.flash('success', 'Successfully Deleted Your Review On The Hotel');
            res.redirect('/hotels/' + req.params.id);
        }
    });
});

module.exports = router;