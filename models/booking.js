var mongoose = require('mongoose');
var bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel'
    },
    email: String,
    name: String,
    phoneNumber: String,
    city: String,
    country: String,
    street: String,
    streetNumber: String,
    postCode: String,
    arrive: Date,
    depart: Date,
    numberOfPeople: Number,
    roomType: String,
    beddingType: String,
    comments: String,
    paymentDetails: Object,
    confirmed: {
        type: Boolean,
        default: false
    },
    amount: Number

});
module.exports = mongoose.model('Booking', bookingSchema);