const express = require('express');
const app = express();
const ip = require('ip');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config({ path: '.env' });
const bodyParser = require('body-parser');

const index = require('./routes/index');
const user = require('./routes/user');

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(cookieParser(process.env.JWT_SECRET));

app.use('/', index);
app.use('/user', user);

MongoClient.connect(process.env.MONGODB_URL)
.then(client => {
  const db = client.db('dynamic_blog');
  app.locals.db = db;
});

const port = process.env.PORT || 8001
const server = app.listen(port, () => {
  console.log(`Express running 
f1 uc0u8594 
f0  PORT ${ip.address()}:${port}`);
});