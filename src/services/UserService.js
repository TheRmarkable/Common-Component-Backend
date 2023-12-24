const BaseMongoService = require('./db');
const logger = require('./logger');
const { SCErrorTypes, SCDatabaseError } = require('../constants/Error');
const UserSchema = require('../models/mongo/User');
const AccountService = require('./AccountService');


class UserService extends BaseMongoService {
    constructor() {
        super({
            dbName: 'MONGO_DB_USERS',
            collectionName: 'users',
            schema: UserSchema,
            serviceName: 'UserService',
        });
    }

    async addUser({identityNumber,name,surname,email,role,mobileNumber,is_inactive,is_verified}) {

        if (!identityNumber || !name || !surname || !email || !role || !mobileNumber) {
            logger.error('Validation error: Missing required fields (name, surname, email, role, identityNumber)');
            throw new SCValidationError({
                scErrorType: SCErrorTypes.REQUIRE_USER_DATA_MISSING,
                msg: 'Missing required fields: name, surname, email, and role are required.',
            });
        }

        const userData = {
            identityNumber,
            name,
            surname,
            email,
            role,
            mobileNumber,
            is_inactive: is_inactive || false,
            is_verified: is_verified || false
        }
        try {
            logger.info('Adding new user');
            const newUser = await this.create(userData);
            const accountService = new AccountService();
            await accountService.createAccount(newUser.id);

           return await this.getUserById(newUser.id);
        } catch (error) {
            logger.error(`Error in addUser: ${error.message}`);
            throw new SCDatabaseError(SCErrorTypes.CANNOT_INSERT_ITEM, error);
        }
    }

    async getUserById(userId) {
        try {
            return await this.getDbModel()
                .then(UserModel => UserModel.findById(userId).exec());
        } catch (error) {
            logger.error(`Error when fetching user by ID: ${error.message}`);
            throw new SCDatabaseError(SCErrorTypes.CANNOT_GET_ITEM, error);
        }
    }

    async verifyUser(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new SCDatabaseError(SCErrorTypes.NO_SUCH_ITEM);
        }
        user.is_verified = true; 
        await user.save();
        return user;
    }

}

module.exports = UserService;
