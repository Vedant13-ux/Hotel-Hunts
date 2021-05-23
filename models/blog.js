var mongoose = require('mongoose');
var blogSchema = new mongoose.Schema({
    title: String,
    hotelName: String,
    location: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    image: String,
    body: String,
    created: { type: Date, default: Date.now },

});
module.exports = mongoose.model('Blog', blogSchema);