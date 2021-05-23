var mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    text: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    created: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        default: 'https://image.shutterstock.com/image-vector/person-gray-photo-placeholder-woman-260nw-1416988778.jpg'
    },
    rating: String
});

module.exports = mongoose.model('Comment', commentSchema);