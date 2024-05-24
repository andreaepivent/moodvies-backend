require("dotenv").config();
require('./models/connection');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var moviesRouter = require('./routes/movies');
var moodRouter = require('./routes/updateMood');
var recommendationRouter = require('./routes/recommendation');
var chatbotRouter = require('./routes/chatbot');

var app = express();
const cors = require("cors");
const corsOptions = {
    origin: function (origin, callback) {
      // Remplacee 'allowedOrigins' avec vos différents URLs front pouvant accéder au Backend
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
      ];
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  };
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/movies', moviesRouter);
app.use('/updateMood', moodRouter);
app.use('/recommendation', recommendationRouter);
app.use('/chatbot', chatbotRouter);

module.exports = app;
