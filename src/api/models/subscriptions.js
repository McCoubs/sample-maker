let mongoose = require('mongoose');

let subscriptionSchema = new mongoose.Schema({
        follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        followee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('Subscription', subscriptionSchema);
