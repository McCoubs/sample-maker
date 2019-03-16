let mongoose = require('mongoose');

let sampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  file_id: { type: mongoose.Schema.Types.ObjectId },
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
  timestamps: true
});

module.exports = mongoose.model('Sample', sampleSchema);
