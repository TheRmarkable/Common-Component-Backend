const BaseMongoService = require('./db');
const BankAccountSchema = require('../models/mongo/Bank');
const logger = require('./logger'); 
const { SCErrorTypes, SCDatabaseError } = require('../constants/Error'); 
const UserService = require('./UserService');
const UserRoles = require('../constants/UserRole')

class BankService extends BaseMongoService {
    constructor() {
        super({
            dbName: 'MONGO_DB_BANKS', 
            collectionName: 'bankAccounts',
            schema: BankAccountSchema,
            serviceName: 'BankService'
        });
    }

    async addCorporateBank(userId, name, accountNumber) {

        const bankAccountData = {
            name,
            accountNumber,
            type: 'Corporate'
        }

        const userService = new UserService();

        const user = await userService.getUserById(userId);

        if(user.role === UserRoles.FINANCE_USER){
            try {
                return await this.create({...bankAccountData, createdBy: userId});
            } catch (error) {
                logger.error(`Error in addBankAccount: ${error.message}`);
                throw new SCDatabaseError(SCErrorTypes.CANNOT_INSERT_ITEM, error);
            }
        }else {
            return Promise.reject(new AuthorizationError(SCErrorTypes.PERMISSION_DENIED_INSUFFICIENT_PERMISSION_FOR_USER_ROLE))
        }
        
    }

    async addUserBank(userId, name, accountNumber) {

        const bankData = {
            name,
            accountNumber
        }
        const userService = new UserService();

        const user = await userService.getUserById(userId);

        if(user.role === UserRoles.STANDARD_USER){
            try {
                return await this.create({ ...bankData, createdBy: userId });;
            } catch (error) {
                logger.error(`Error in addBankAccount: ${error.message}`);
                throw new SCDatabaseError(SCErrorTypes.CANNOT_INSERT_ITEM, error);
            }
        }else {
            return Promise.reject(new AuthorizationError(SCErrorTypes.PERMISSION_DENIED_INSUFFICIENT_PERMISSION_FOR_USER_ROLE))
        }
    }

    async updateUserBank(userId, bankId, name, accountNumber) {

        const bankData = {
            name,
            accountNumber
        }
        const userService = new UserService();

        const user = await userService.getUserById(userId);

        const bankAccount = await this.findById(bankId);

        if(!name){
            bankData.name = bankAccount.name
        }
        if(!accountNumber){
            bankData.accountNumber = bankAccount.accountNumber
        }

        if (!bankAccount) {
            throw new SCDatabaseError(SCErrorTypes.NO_SUCH_ITEM, error);
        }
        if (bankAccount.createdBy.toString() !== userId || user.role !== UserRoles.FINANCE_USER) {
            throw new AuthorizationError(SCErrorTypes.PERMISSION_DENIED_INSUFFICIENT_PERMISSION_FOR_USER);
        }
        return await this.updateById(bankId, bankData);
    }

    async deleteUserBank(userId, bankId) {
        const bankAccount = await this.findById(bankId);

        const userService = new UserService();

        const user = await userService.getUserById(userId);

        if (!bankAccount) {
            throw new SCDatabaseError(SCErrorTypes.NO_SUCH_ITEM, error);
        }
        if (bankAccount.createdBy.toString() !== userId || user.role !== 'FINANCE_USER') {
            throw new AuthorizationError(SCErrorTypes.PERMISSION_DENIED_INSUFFICIENT_PERMISSION_FOR_USER);
        }
        return await this.deleteById(bankId);
    }

    async getUserBanks(userId) {
        try {
            const model = await this.getDbModel();
            const userBanks = await model.find({ createdBy: userId });
            return userBanks;
        } catch (error) {
            logger.error(`Error in getUserBanks: ${error.message}`);
            throw new SCDatabaseError(SCErrorTypes.CANNOT_GET_ITEM, error);
        }
    }


    async updateCorporateBank(userId, bankId, name, accountNumber) {

        const bankData = {
            name,
            accountNumber
        }
        const userService = new UserService();

        const user = await userService.getUserById(userId);

        const bankAccount = await this.findById(bankId);

        if(!name){
            bankData.name = bankAccount.name
        }
        if(!accountNumber){
            bankData.accountNumber = bankAccount.accountNumber
        }

        if (!bankAccount) {
            throw new SCDatabaseError(SCErrorTypes.NO_SUCH_ITEM, error);
        }
        if (user.role !== UserRoles.FINANCE_USER) {
            throw new AuthorizationError(SCErrorTypes.PERMISSION_DENIED_INSUFFICIENT_PERMISSION_FOR_USER_ROLE);
        }
        return await this.updateById(bankId, bankData);
    }


    async deleteCorporateBank(userId, bankId) {
        const bankAccount = await this.findById(bankId);

        const userService = new UserService();

        const user = await userService.getUserById(userId);

        if (!bankAccount) {
            throw new  SCDatabaseError(SCErrorTypes.NO_SUCH_ITEM, error);
        }
        if ( user.role !== 'FINANCE_USER') {
            throw new AuthorizationError(SCErrorTypes.PERMISSION_DENIED_INSUFFICIENT_PERMISSION_FOR_USER_ROLE);
        }
        return await this.deleteById(bankId);
    }

    async getCorporateBanks() {
        try {
            const model = await this.getDbModel();
            const corporateBanks = await model.find({ type: 'corporate' });
            return corporateBanks;
        } catch (error) {
            logger.error(`Error in getCorporateBanks: ${error.message}`);
            throw new SCDatabaseError(SCErrorTypes.CANNOT_GET_ITEM, error);
        }
    }
}

module.exports = BankService;
