const express = require('express');
require('dotenv').config();
const adminRoutes = require('./src/routes/adminRoute');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT; 
app.use(bodyParser.json());
app.use('/admin', adminRoutes);

app.listen(port, () => {
    console.log(`Server is running on port number ${port}`);
});
