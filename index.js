const express = require('express');
const app = express();
const morgan = require('morgan');
app.use(morgan('tiny'));
const mongoose = require('mongoose');

const helmet = require("helmet");
const compression = require("compression");


require('dotenv').config();
const cors = require('cors');
const connectDB = require('./src/config/db');
const PORT = process.env.PORT || 5000;
const jwtAuth=require('./src/middlewares/user.auth.jwt');
const routes = require("./src/routes/routes.index");


//connect to mongodb
connectDB();


//middlewares
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());


//routes for all apis
app.use("/api", routes);


//home route
app.get('/', (req, res) => {
    res.send('/home route ci-cd added');
});


//protected route to test jwt
app.get('/protected',jwtAuth, (req, res) => {
    res.send('This is /protected test response');
});



//error middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(err);
});


//server is listening 
app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}/`));