var mongoose = require('mongoose');
var campSchema = new mongoose.Schema({
    name: String,
    image: String,
    imageId: String,
    description: String,
    location: String,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: Number,
    allRooms: {
        singleBed: {
            withBathroom: {
                price: Number,
                available: Number
            },
            withoutBathroom: {
                price: Number,
                available: Number
            },
        },
        doubleBed: {
            withBathroom: {
                price: Number,
                available: Number
            },
            withoutBathroom: {
                price: Number,
                available: Number
            },
        }
    },
    amenities: [{
        type: String
    }]
});
module.exports = mongoose.model('Hotel', campSchema);