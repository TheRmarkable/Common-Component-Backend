require('dotenv').config();
const mongoose = require('mongoose');
const { SCDatabaseError } = require('../constants/Error')

class BaseMongoService {
    constructor({ dbName, collectionName, schema }) {
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.schema = schema;
    }

    getMongoDbConnectionStringFor() {
        return `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}` +
               `@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${this.dbName}?authSource=admin`;
    }

    async getDbModel() {
        const dbConnection = await mongoose.createConnection(this.getMongoDbConnectionStringFor(), {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        return dbConnection.model(this.collectionName, this.schema);
    }

    /**
     * Creates a new document in the database
     * @param {Object} data - Data to create a new document
     * @return {Promise<Object>} - The created document
     */
    async create(data) {
        try {
            logger.info(`${this.serviceName}: Creating a new document.`);
            const model = await this.getDbModel();
            const document = new model(data);
            return await document.save();
        } catch (error) {
            logger.error(`${this.serviceName}: Error in create - ${error.message}`);
            throw new SCDatabaseError(SCErrorTypes.CANNOT_INSERT_ITEM, error);
        }
    }

    /**
     * Finds a document by ID
     * @param {string} id - The document ID to find
     * @return {Promise<Object|null>} - The found document or null
     */
    async findById(id) {
        try {
            logger.info(`${this.serviceName}: Finding a document by ID.`);
            const model = await this.getDbModel();
            return await model.findById(id);
        } catch (error) {
            logger.error(`${this.serviceName}: Error in findById - ${error.message}`);
            throw new SCDatabaseError(SCErrorTypes.CANNOT_GET_ITEM, error);
        }
    }

    /**
     * Updates a document by ID
     * @param {string} id - The document ID to update
     * @param {Object} updateData - The data to update
     * @return {Promise<Object>} - The updated document
     */
    async updateById(id, updateData) {
        try {
            logger.info(`${this.serviceName}: Updating a document by ID.`);
            const model = await this.getDbModel();
            return await model.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            logger.error(`${this.serviceName}: Error in updateById - ${error.message}`);
            throw new SCDatabaseError(SCErrorTypes.CANNOT_UPDATE_ITEM, error);
        }
    }

    /**
     * Deletes a document by ID
     * @param {string} id - The document ID to delete
     * @return {Promise<boolean>} - True if the document is deleted, false otherwise
     */
    async deleteById(id) {
        try {
            logger.info(`${this.serviceName}: Deleting a document by ID.`);
            const model = await this.getDbModel();
            const result = await model.findByIdAndDelete(id);
            return result !== null;
        } catch (error) {
            logger.error(`${this.serviceName}: Error in deleteById - ${error.message}`);
            throw new SCDatabaseError(SCErrorTypes.CANNOT_DELETE_ITEM, error);
        }
    }
}

module.exports = BaseMongoService;
