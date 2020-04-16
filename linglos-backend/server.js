const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');

const users = require('./routes/api/users');

require('dotenv').config();


const app = express();

app.use(express.json());

app.use(cors());
app.use(passport.initialize());

require('./config/passport')(passport);

const port = process.env.PORT || 5000;

const uri = process.env.ATLAS_URI;

mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB connection established successfully');
});



// const exercisesRouter = require('./routes/exercises');
// const usersRouter = require('./routes/users');

app.use('/api/users', users);
// app.use('/users', usersRouter);



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});