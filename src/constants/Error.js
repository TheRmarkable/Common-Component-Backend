const MSG_PERMISSION_DENIED = 'Permission denied for your request. Please contact system administrators';

/**
 * Error Type mapping used for enumerating all errors of the system
 * @constant
 */
const SCErrorTypes = {
   
    INVALID_OR_MISSING_FIELD: { message: 'Invalid or missing field in request', code: -4000 },
    REQUIRE_USER_DATA_MISSING: { message: 'Required User data is missing', code: -4001 },
    PERMISSION_DENIED: {
        message: MSG_PERMISSION_DENIED,
        code: -4004,
    },
    PERMISSION_DENIED_NO_SUCH_USER: {
        message: MSG_PERMISSION_DENIED,
        code: -4005,
    },
    PERMISSION_DENIED_NO_SUCH_PATH: {
        message: MSG_PERMISSION_DENIED,
        code: -4006,
    },
    PERMISSION_DENIED_INSUFFICIENT_PERMISSION_FOR_USER_ROLE: {
        message: MSG_PERMISSION_DENIED,
        code: -4007,
    },
    PERMISSION_DENIED_INSUFFICIENT_PERMISSION_FOR_USER: {
        message: MSG_PERMISSION_DENIED,
        code: -4008,
    },
    PERMISSION_DENIED_NO_SUCH_ROLE_FOR_USER: {
        message: MSG_PERMISSION_DENIED,
        code: -4010,
    },

    NO_SUCH_ROUTE_404: { message: MSG_PERMISSION_DENIED, code: -4013 },

    INSUFFICIENT_FUNDS : { message: 'Insufficient funds', code: -5001},

    // Db inits
    CANNOT_CREATE_DB: { message: 'Cannot create database', code: -7000 },
    CANNOT_DELETE_DB: { message: 'Cannot delete database', code: -7001 },
    CANNOT_CREATE_TABLE: { message: 'Cannot create database table', code: -7002 },
    CANNOT_DELETE_TABLE: { message: 'Cannot create database table', code: -7003 },
    CANNOT_DELETE_DOC_IN_MONGODB: { message: 'Cannot delete document in mongo db', code: -7004 },
    CANNOT_CONNECT_TO_MONGO_DB: { message: 'Cannot connect to db', code: -7005 },
    CANNOT_CONNECT_TO_POSTGRESQL_DB: { message: 'Cannot connect to db', code: -7006 },
    NO_SUCH_SQL_STORED_PROCEDURE: { message: 'No such sql stored procedure', code: -7007 },
    NO_SUCH_MODEL_FOUND: { message: 'No such model', code: -7008 },
    INVALID_CREDENTIALS_FOR_TEST_DB_PREP: { message: 'Invalid Credentials', code: -7009 },

    // CRUD ops
    CANNOT_INSERT_ITEM: { message: 'Cannot insert item into database', code: -7100 },
    CANNOT_UPDATE_ITEM: { message: 'Cannot update item in database', code: -7101 },
    CANNOT_DELETE_ITEM: { message: 'Cannot delete item from database', code: -7102 },
    CANNOT_GET_ITEM: { message: 'Cannot get item from database', code: -7103 },
    CANNOT_GET_ATTACHMENT: { message: 'Cannot get attachment from database', code: -7104 },
    CANNOT_INSERT_ATTACHMENT: { message: 'Cannot insert attachment to database', code: -7105 },
    CANNOT_REMOVE_ATTACHMENT: { message: 'Cannot remove attachment from database', code: -7106 },
    CANNOT_GET_ATTACHMENT_DETAILS: { message: 'Cannot get attachment details from database', code: -7107 },
    CANNOT_INSERT_ATTACHMENT_DETAILS: { message: 'Cannot insert attachment details to database', code: -7108 },
    NO_SUCH_ITEM: { message: 'There is no such item in database', code: -7109 },


    // Default Db error
    MAX_PAGE_SIZE_EXCEEDED: { message: 'Max page size exceeded', code: -7900 },
    DATABASE_GENERIC_ERROR: { message: 'Something wrong in database :/', code: -7999 },


    // User CRUD errors
    CANNOT_CHANGE_USER_STATUS_TO_PASSIVE: {
        message: 'Cannot update status to passive. User has active tasks',
        code: -11000,
    },

    // Role CRUD errors
    INACCESSIBLE_PERMISSIONS: { message: 'Inaccessible Permissions!', code: -13000 },

    
};


/**
 * Generic error wrapper class for handling Nspect code logic related errors.
 * These errors are caused by developers logic intentionally, to capture later.
 * Any other error that does not inherit SCError class is the unhandled errors that our code fails to cover
 */
class SCError extends Error {
    /**
     * @param {String} message - Human readable error message @see SCErrorTypes
     * @param {Object=} extras - Extra info about error. Reserved for future use.
     * @constructor
     */
    constructor(message, extras = {}) {
        let errMsg = message;
        const { code } = extras;
        if (typeof message !== 'string') {
            errMsg = message?.message;
        }
        super(errMsg);
        this.code = code;
        this.extras = extras;
    }
}

/**
 * Wrapper Error base class
 * Wrapper Error base class
 */
class SCErrorBase extends SCError {
    /**
     * @param {Object} params
     * @param {String} params.message - Human readable error message @see SCErrorTypes
     * @param {Number} params.code - Negative integer, @see SCErrorTypes
     * @param {Object|String|undefined} specifics - other specific details about the error. BEWARE THAT this may be sent to user
     * @constructor
     */
    constructor({ message, code }, specifics = null) {
        super(message, { code });
        if (specifics) {
            this.specifics = specifics;
        }
    }
}

/**
 * Wrapper class for classifying authentication related errors.
 */
class AuthenticationError extends SCErrorBase {}

/**
 * Wrapper class for classifying authorization related errors.
 */
class AuthorizationError extends SCErrorBase {}

/**
 * Wrapper class for classifying database related errors (like resource item not found).
 * @param {Object=} scDbErrorType - ScDatabaseErrorTypes object
 * @param {Object=} specifics - Error object for logging locally (not to be sent to the end-user)
 */
class SCDatabaseError extends SCErrorBase {
    /**
     * @param {Object=} scDbErrorType
     * @param {String=} scDbErrorType.message - Human readable error message @see SCErrorTypes
     * @param {Number=} scDbErrorType.code - Negative integer, @see SCErrorTypes
     * @param {Object=} specifics - Error object or a string to give extra data about the error
     * @constructor
     */
    constructor(scDbErrorType = null, specifics = null) {
        super((scDbErrorType || SCErrorTypes.DATABASE_GENERIC_ERROR), specifics);
    }
}

/**
 * Wrapper class for classifying validations of input & comparing it with the data in database.
 */
class SCValidationError extends SCErrorBase {
    /**
     * @example
     * let errObj = {
     *   value: '1fasle',
     *      msg: 'Invalid Project Id',
     *      param: 'project_id',
     *      location: 'query'
     * }
     * next(new SCValidationError({
     *  scErrorType: SCErrorTypes.PERMISSION_DENIED_INSUFFICIENT_PERMISSION_FOR_USER_ROLE,
     *  msg: 'User with this role cannot do this action',
     *  value: 'value user provided...'
     * }))
     */
    constructor({ value, msg, scErrorType }) {
        const message = msg || scErrorType?.message || SCErrorTypes.INVALID_OR_MISSING_FIELD.message;
        const code = scErrorType?.code || SCErrorTypes.INVALID_OR_MISSING_FIELD.code;
        const specifics = `${msg}: '${value}'`;
        super({ message, code }, specifics);
    }
}

/**
 * Wrapper class for missing implementation for function. This error is for developers.
 * @class
 */
class ScDevelopmentError extends SCErrorBase {
    /**
     * @return {String|null}
     */
    get extra() {
        return this.specifics;
    }
}



module.exports = {
    SCErrorTypes,
    SCError,
    SCErrorBase,
    AuthenticationError,
    AuthorizationError,
    SCValidationError,
    SCDatabaseError,
    ScDevelopmentError,

};