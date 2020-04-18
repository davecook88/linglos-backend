const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');

const users = require('./routes/api/users');
const booking = require('./routes/api/bookings');

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
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/users', users);
app.use('/api/booking', booking);



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});