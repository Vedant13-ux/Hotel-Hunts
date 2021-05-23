var mongoose = require('mongoose');
var tovisitSchema = new mongoose.Schema({
    todo: String,
    isDone: Boolean
});

module.exports = mongoose.model('ToVisit', tovisitSchema);