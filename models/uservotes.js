const mongoose = require('mongoose');
const uservoteSchema = new mongoose.Schema({
 party: String,
});

module.exports = mongoose.model('uservotes', uservoteSchema);
