require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174' ],
    credentials: true,              
  };
  app.use(cors(corsOptions));

module.exports = app;