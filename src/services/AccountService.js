const BaseMongoService = require('./db');
const AccountSchema = require('../models/mongo/Account');
const logger = require('./logger');
const { SCErrorTypes, SCDatabaseError, SCValidationError } = require('../constants/Error'); 
const TRANSACTIONSTATUSES = require('../constants/TransactionsStatuses') 

class AccountService extends BaseMongoService {
    constructor() {
        super({
            dbName: 'MONGO_DB_ACCOUNTS',
            collectionName: 'accounts',
            schema: AccountSchema,
            serviceName: 'AccountService'
        });
    }


    async createAccount(userId) {
        try {
            logger.info('Creating new account');
            return await this.create({ userId });
        } catch (error) {
            logger.error(`Error in createAccount: ${error.message}`);
            throw new SCDatabaseError(SCErrorTypes.CANNOT_INSERT_ITEM, error);
        }
    }


    async deposit(accountId, { amount, currency }) {
        const account = await this.findById(accountId);
        if (!account) {
            throw new SCDatabaseError(SCErrorTypes.NO_SUCH_ITEM, error);
        }

        const balance = account.balances.find(b => b.currency === currency);
        if (balance) {
            balance.amount += amount;
        } else {
            account.balances.push({ currency, amount });
        }

        account.transactions.push({
            type: 'deposit',
            amount: amount,
            currency: currency,
            timestamp: new Date()
        });

        await account.save();
        return account;
    }

    async withdrawOrTransfer( transferOrWithdraw,accountId, { amount, currency }) {
        const account = await this.findById(accountId);
        if (!account) {
            throw SCDatabaseError(SCErrorTypes.NO_SUCH_ITEM, error);
        }

        const balance = account.balances.find(b => b.currency === currency);
        if (!balance || balance.amount < amount) {
            throw new SCValidationError(SCErrorTypes.INSUFFICIENT_FUNDS);
        }

        balance.amount -= amount;

        account.transactions.push({
            type: transferOrWithdraw,
            amount: -amount, 
            currency: currency,
            timestamp: new Date()
        });
        await account.save();
        return account;
    }

    async requestWithdrawal(accountId, { amount, currency, userId }) {
        const user = await new UserService().findById(userId);
        if (!user.isVerified) {
            throw new SCValidationError('User not verified');
        }

        const account = await this.findById(accountId);
        // ... Existing balance checks ...

        account.transactions.push({
            type: 'withdrawal',
            amount: -amount, 
            currency: currency,
            timestamp: new Date(),
            status: TRANSACTIONSTATUSES.PENDING
        });
        await account.save();
        return account;
    }

    async approveOrRejectWithdrawal(accountId, transactionId, approve) {
        const account = await this.findById(accountId);
        const transaction = account.transactions.id(transactionId);

        if (!transaction || transaction.type !== 'withdrawal' || transaction.status !== 'pending') {
            throw new SCDatabaseError('Invalid transaction request');
        }

        transaction.status = approve ? 'approved' : 'rejected';
        await account.save();
        return account;
    }

    async cancelWithdrawalRequest(accountId, transactionId) {
        const account = await this.findById(accountId);
        const transaction = account.transactions.id(transactionId);

        if (!transaction || transaction.type !== 'withdrawal' || transaction.status !== 'pending') {
            throw new SCDatabaseError('Invalid transaction request');
        }

        account.transactions.pull({ _id: transactionId });
        await account.save();
        return account;
    }


}

module.exports = AccountService;
