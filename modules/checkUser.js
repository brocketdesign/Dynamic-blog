   
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config({ path: '.env' });

// A secret key that will be used to sign the JSON Web Token
const secretKey = process.env.JWT_SECRET;

 // Check if a username and password exist in the 'users' collection
 async function checkUser(req) {
    console.log(req.signedCookies)
    if (!req.signedCookies) { 
        return false;
    }
    const token = req.signedCookies.userID;
    if (!token) { 
        return false;
    }

    try {
        const decodedToken = jwt.verify(token, secretKey);
        return new ObjectId(decodedToken.userId);
    } catch (err) {
        console.log(err)
        return false;
    }
}   
module.exports=checkUser