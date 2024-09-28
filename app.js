require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:5173',  
    credentials: true,              
  };
  app.use(cors(corsOptions));

module.exports = app;