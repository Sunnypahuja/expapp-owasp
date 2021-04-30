const mongoose = require('mongoose');
const VoteSchema = new mongoose.Schema({
  item: String,
  status: String,
  voterId: String,
});

module.exports = mongoose.model('Vote', VoteSchema);
