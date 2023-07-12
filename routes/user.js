const express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const urlencodedParser = bodyParser.urlencoded({ extended: false })

require('dotenv').config({ path: '.env' });

// A secret key that will be used to sign the JSON Web Token
const secretKey = process.env.JWT_SECRET;
router.use(cookieParser(secretKey));

// Create a new user record
router.post('/signin',urlencodedParser, async (req, res) => {
  const db = req.app.locals.db; 
  console.log(req.body)
  const { username, password } = req.body;
  // Check if the username already exists
  const existingUser = await db.collection('users').findOne({ username });

  if (existingUser) {
    console.log('Username already exists')
    res.redirect('/login')
    //res.status(409).send({ message: 'Username already exists' });
  } else {
    // Create a new user record
    const user = { username, password };

    try {
      const result = await db.collection('users').insertOne(user);
      const userID = result.insertedId.toString()
      // Generate a JWT token and set it as a cookie
      const token_userID = jwt.sign({ userID }, secretKey);
      res.cookie('userID', token_userID, { httpOnly: true, maxAge: 86400000,signed: true });
      const token_username = jwt.sign({ username }, secretKey);
      res.cookie('username', token_username, { httpOnly: true, maxAge: 86400000,signed: true });
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Error creating user' });
    }
  }
});
// Login endpoint that generates a JSON Web Token if the user credentials are correct
router.post('/login',urlencodedParser,async (req, res) => {
  const db = req.app.locals.db;
  console.log(req.body)
  const { username, password } = req.body;
  const users = db.collection('users');
  const user = await db.collection('users').findOne({ username, password });
  console.log(user)
  // If the user doesn't exist or the password is incorrect, return an error
  if (!user ) {
    console.log('Invalid username or password')
    res.redirect('/login?error=true');
    return;
  }

    const token_userID = jwt.sign({ userId: user._id }, secretKey);
    res.clearCookie('userID');
    res.clearCookie('username');
    res.cookie('userID', token_userID, { httpOnly: true,signed: true });
    const token_username = jwt.sign({ username:user.username }, secretKey);
    res.cookie('username', token_username, { httpOnly: true, maxAge: 86400000,signed: true });
    console.log('Login successful')
    res.redirect('/');
 
});

// Logout endpoint that removes the JSON Web Token cookie
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.send({ message: 'Logout successful' });
});

// A middleware function that checks if the request has a valid JSON Web Token cookie
const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(401).send({ message: 'Invalid token' });
      } else {
        req.userId = decoded.userId;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'Token not found' });
  }
};

// Protected endpoint that requires authentication
router.get('/protected', authenticate, (req, res) => {
  res.send({ message: `User ${req.userId} is authenticated` });
});

module.exports = router;