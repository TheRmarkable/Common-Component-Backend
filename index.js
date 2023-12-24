const express = require('express');
const bodyParser = require('body-parser');
const corporateBank = require('./src/api/routes/corporateBank');
const users = require('./src/api/routes/users');
const accounts = require('./src/api/routes/account');

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'A simple Express API'
        }
    },
    apis: ['./src/api/routes/*.js'] 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);


const app = express();

app.use(bodyParser.json());

app.use('/corporate', corporateBank);
app.use('/users', users);
app.use('/accounts', accounts);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
