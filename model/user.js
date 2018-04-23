var mongoose = require('mongoose');
var projectSchema = new mongoose.Schema({
    name: String,
    pass: String,
    salt: String
});
mongoose.model('Users', projectSchema);
