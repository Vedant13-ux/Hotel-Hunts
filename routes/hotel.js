var express = require('express');
var router = express.Router();

var Hotel = require('../models/hotel');
var Blog = require('../models/blog');
var Comment = require('../models/comments');
var User = require('../models/user');
var Booking = require('../models/booking');
const Razorpay = require('razorpay')


var middleware = require('../middleware');
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_TEST_KEY,
    key_secret: process.env.RAZORPAY_TEST_SECRET
})
var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require('cloudinary');
const { checkCampgroundOwnership } = require('../middleware');
const { populate, db } = require('../models/hotel');
cloudinary.config({
    cloud_name: 'ved13',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
router.get('/hotels', function (req, res) {
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Hotel.find({ $or: [{ location: regex }, { name: regex }] }, function (err, allHotels) {
            if (err) {
                console.log(err);
            } else {
                if (allHotels.length < 1) {
                    noMatch = 'No Hotels match that query, please try again.';
                    Hotel.find({}, function (err, hotels) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.render('hotel/hotels', { hotels: hotels, noMatch: noMatch });
                        }
                    });
                } else {
                    res.render('hotels/campgrounds', { hotels: allHotels, noMatch: noMatch });
                }
            }
        });
    } else {
        Hotel.find({}, function (err, allHotels) {
            if (err) {
                console.log(err);
            } else {
                res.render('hotel/hotels', { hotels: allHotels, noMatch: noMatch });
            }
        });
    }
});

router.get('/hotels/new', middleware.isLoggedIn, function (req, res) {
    res.render('hotel/new');
});

router.post('/hotels', middleware.isLoggedIn, upload.single('image'), function (req, res) {
    req.body.hotel.allRooms = {
        singleBed: {
            withBathroom: {
                price: req.body.two,
                available: req.body.one
            },
            withoutBathroom: {
                price: req.body.four,
                available: req.body.three
            }
        },
        doubleBed: {
            withBathroom: {
                price: req.body.six,
                available: req.body.five
            },
            withoutBathroom: {
                price: req.body.eight,
                available: req.body.seven
            }
        }
    }
    cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }

        req.body.hotel.image = result.secure_url;
        req.body.hotel.imageId = result.public_id;
        req.body.hotel.author = req.user._id;
        Hotel.create(req.body.hotel, function (err, hotel) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/hotels/' + hotel._id);
        });
    });
});



router.get('/hotels/:id', middleware.isLoggedIn, function (req, res) {
    Hotel.findById(req.params.id).populate({ path: 'comments', populate: 'author', sort: { 'created': 1 } }).exec(function (err, hotel) {
        if (err) {
            req.flash('error', 'Hotel Not Found');
            res.redirect('/hotels');
        } else {
            if (!hotel) {
                req.flash('error', 'hotel Not Found');
                return res.redirect('/hotels');
            }
            Blog.find({ hotelName: new RegExp(escapeRegex(hotel.name), 'gi') }).populate('author').exec()
                .then((blogs) => {
                    res.render('hotel/showHotel', { hotel, blogs });

                }).catch((err) => {
                    req.flash('error', err.message);
                    return res.redirect('back');
                });
        }
    });
});

router.get('/hotels/:id/edit', middleware.checkCampgroundOwnership, function (req, res) {
    Hotel.findById(req.params.id, function (err, hotel) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('/hotels/' + hotel._id);
        } else {
            if (!hotel) {
                req.flash('error', 'Item Not Found');
                return res.redirect('back');
            }
            res.render('hotel/edit', { hotel });
        }
    });
});

router.put('/hotels/:id', middleware.checkCampgroundOwnership, upload.single('image'), function (req, res) {
    req.body.hotel.allRooms = {
        singleBed: {
            withBathroom: {
                price: req.body.two,
                available: req.body.one
            },
            withoutBathroom: {
                price: req.body.four,
                available: req.body.three
            }
        },
        doubleBed: {
            withBathroom: {
                price: req.body.six,
                available: req.body.five
            },
            withoutBathroom: {
                price: req.body.eight,
                available: req.body.seven
            }
        }
    }
    Hotel.findById(req.params.id, async function (err, foundhotel) {
        if (req.file) {
            try {
                await cloudinary.v2.uploader.destroy(foundhotel.imageId);
                var result = await cloudinary.v2.uploader.upload(req.file.path);
                foundhotel.imageId = result.public_id;
                foundhotel.image = result.secure_url;
            } catch (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
        }
        foundhotel.name = req.body.hotel.name;
        foundhotel.description = req.body.hotel.description;
        foundhotel.location = req.body.hotel.location;
        foundhotel.amenities = req.body.hotel.amenities;
        foundhotel.location = req.body.hotel.location;
        foundhotel.allRooms = req.body.hotel.allRooms;



        foundhotel.save();
        req.flash('success', 'Successfully Updated the Hotel');
        res.redirect('/hotels/' + foundhotel._id);
    });
});


// Booking a Hotel
router.get('/booking/:id', middleware.isLoggedIn, (req, res) => {
    Hotel.findById(req.params.id)
        .then((hotel) => {
            if (!hotel) {
                req.flash('error', "Hotel that you were trying to book does not exist");
                return res.redirect('back');
            }
            return res.render('hotel/booking', { hotel });
        }).catch((err) => {
            req.flash('error', err.message);
            return res.redirect('back');
        });
});


router.post("/api/payment/order/:id", middleware.isLoggedIn, (req, res) => {
    const params = req.body.params;
    req.body.booking.amount = req.body.params.amount;
    req.body.booking.user = req.user._id;
    req.body.booking.hotel = req.params.id;
    instance.orders.create(params).then((data) => {
        Booking.create(req.body.booking)
            .then(async (result) => {
                await req.user.bookings.push(result);
                await req.user.save();
                res.send({ sub: data, bookingId: result._id, status: "success" });
            }).catch((err) => {
                req.flash('error', err.message);
                return res.redirect('back');
            });
    }).catch((error) => {
        res.send({ "sub": error, "status": "failed" });
    })
});



router.post("/api/payment/verify/:id", middleware.isLoggedIn, (req, res) => {
    body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    Booking.findById(req.params.id)
        .then(async (booking) => {
            if (!booking) {
                req.flash('error', "Booking Does Not Exist");
                return res.redirect('back');
            }
            var crypto = require("crypto");
            var expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_TEST_SECRET)
                .update(body.toString())
                .digest('hex');
            console.log("sig" + req.body.razorpay_signature);
            console.log("sig" + expectedSignature);
            var response = { "status": "failure" }
            if (expectedSignature === req.body.razorpay_signature) {
                booking.paymentDetails = req.body;
                booking.confirmed = true;
                await booking.save();
                response = { "status": "success" }
            }
            res.send(response);
        }).catch((err) => {
            req.flash('error', err.message);
            return res.redirect('back');
        });

});

router.get('/booking/delete/:id', (req, res) => {
    Booking.findById(req.params.id)
        .then(async (booking) => {
            if (!booking) {
                req.flash('error', err.message);
                return res.redirect('/hotels');
            }
            await booking.remove();
            req.user.bookings = await req.user.bookings.filter((b) => b._id != req.params.id);
            req.flash('success', `Booking with booking Id  ${booking._id} has been cancelled `);
            res.redirect('/my-bookings');
        }).catch((err) => {
            req.flash('error', err.message);
            return res.redirect('back');
        });
})

router.get('/my-bookings', middleware.isLoggedIn, (req, res) => {
    User.findById(req.user._id).populate({ path: 'bookings', populate: 'hotel' }).exec()
        .then((user) => {
            res.render('hotel/myBookings', { user })
        }).catch((err) => {
            req.flash('error', err.message);
            return res.redirect('back');
        });
})

//Search Pattern
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
module.exports = router;