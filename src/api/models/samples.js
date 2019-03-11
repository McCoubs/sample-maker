let mongoose = require('mongoose');

let sampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  tags: [{type: String, lowercase: true, trim: true}],
  genres: [{type: String, lowercase: true, trim: true}],
  published: {
    type: Boolean,
    default: false
  },
  metadata: {
    upvotes: {type: Number, default: 0},
    downvotes: {type: Number, default: 0}
  }
},
{
  capped: 314572800,
  timestamps: true
});

module.exports = mongoose.model('Sample', sampleSchema);
