var mongoose = require('mongoose');
var Schema = mongoose.Schema;


module.exports = mongood.modal('User', new Schema({
	name: String,
	password: String,
	admin: Boolean
}));
