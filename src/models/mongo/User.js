const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    IdentityNumber: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    is_inactive: {
        type: Boolean,
        required: false
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    banks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank'
    }],
    is_verified: {
        type: Boolean,
        required: false
    },
});

module.exports = mongoose.model('User', UserSchema);
