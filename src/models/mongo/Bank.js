const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema({
    bankType: {
        type: String,
        required: false,
        enum: ['User','Corporate'],
        default: 'User'
    },
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    branchCode: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('BankAccount', BankAccountSchema);
