const express = require('express');
require('dotenv').config();
const adminRoutes = require('./src/routes/adminRoute');
const authorRoutes = require('./src/routes/authorRoute');
const userRoutes = require('./src/routes/userRoute');

const bodyParser = require('body-parser');

const apiRoutes = require('./src/routes/route');

const app = express();
const port = process.env.PORT; 
app.use(bodyParser.json());
app.use('/',apiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/author',authorRoutes)
app.use('/api/user',userRoutes)

app.listen(port, () => {
    console.log(`Server is running on port number ${port}`);
});
