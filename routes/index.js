const express = require('express');
const router = express.Router();
const axios = require('axios');
const cookieParser = require('cookie-parser');
const { ObjectId } = require('mongodb');
const fs = require('fs');
var wordpress = require( "wordpress" );
const query = require('../modules/genimg.js')
const checkUser = require('../modules/checkUser.js')

require('dotenv').config({ path: '.env' });
// A secret key that will be used to sign the JSON Web Token
const secretKey = process.env.JWT_SECRET;
router.use(cookieParser(secretKey));

var client = wordpress.createClient({
  url: process.env.WORDPRESS,
  username: process.env.WORDPRESS_USER,
  password: process.env.WORDPRESS_PASS
});


const COMPLETIONS_MODEL = 'text-davinci-003';

// Render the sign-in form
router.get('/login',async (req, res) => {
  let error = req.query.error ? req.query.error : false
  const db = req.app.locals.db;
  let users = await db.collection('users').find().toArray()

  res.render('signin',{action:'user/login',error:error,title:'ログイン',signin:true,login:false});
});
// Render the sign-in form
router.get('/signin', (req, res) => {
  res.render('signin',{action:'user/signin',title:'登録する',login:false});
});

router.get('/', async (req, res) => {
  const db = req.app.locals.db;
  const userID = await checkUser(req);

  if (!userID) {
    res.redirect('/login');
    return;
  }

  const articles = await db.collection('articles').find().toArray();
  const subjectsCursor = await db.collection('articles').aggregate([
    { $match: { userId: userID } },
    { $group: { _id: "$subject" } }
  ]);
  const subjects = await subjectsCursor.toArray();

  res.render('index', { articles, subjects: subjects.map(s => s._id) });
});

// Add this route to your routes/index.js file
router.get('/titles/:subject', async (req, res) => {
  const { subject } = req.params;
  const db = req.app.locals.db;

  try {
    const titles = await db
      .collection('articles')
      .find({ subject })
      .toArray();

      res.render('titles', { generatedTitles: titles });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});


router.get('/generate-titles/:subject', async (req, res) => {
  
  const subject = req.params.subject;

  
  if(!subject){
    res.send(`Error : ${subject}`)
    return
  }
  const userID = await checkUser(req);

  
  if (!userID) {
    res.redirect('/login');
    return;
  }

  const prompt = `Generate 10 article titles related to "${subject}"`;

  const data = {
    prompt: prompt,
    temperature: 0.5,
    max_tokens: 500,
    model: COMPLETIONS_MODEL,
    n: 10
  };
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
  };

  try {
    const response = await axios.post('https://api.openai.com/v1/completions', data, config);
    const titlesString = response.data.choices[0].text.trim();
    const generatedTitles = titlesString.split(/ *\d+\. */).filter(title => title);

    const db = req.app.locals.db;
    const newTitles = generatedTitles.map(title => {
      return {
        title: title,
        content: "",
        userId: userID,
        subject: subject
      };
    });

    await db.collection('articles').insertMany(newTitles);

    res.render('titles', { generatedTitles });

    async function blobToBase64(blob) {
      // Convert the Blob (Buffer) to a base64 string
      const base64Data = blob.toString('base64');
      return base64Data;
    }


  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});


// Route to display an article with the given title
router.get('/article/:articleId', async (req, res) => {
  const { articleId } = req.params;

  try {
    const db = req.app.locals.db;
    const article = await db.collection('articles').findOne({ _id: new ObjectId(articleId) });

    if (article && article.content) {
      res.render('article', { generatedArticle: article.content,articleId });
    } else {
      res.status(404).send('Article not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

router.post('/generate-article', async (req, res) => {
  const db = req.app.locals.db;
  const { articleId } = req.body;
  let articleTitle = await db.collection('articles').findOne({_id:new ObjectId(articleId)})
  articleTitle = articleTitle.title

  const userID = await checkUser(req);
  const prompt = `Write a HTML formatted article about "${articleTitle}"`;

  const data = {
    prompt: prompt,
    temperature: 0.5,
    max_tokens: 2000,
    model: COMPLETIONS_MODEL
  };
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
  };

  try {
    const db = req.app.locals.db;
    const existingArticle = await db.collection('articles').findOne({ title: articleTitle });

    if (existingArticle && existingArticle.content) {
      res.render('article', { generatedArticle: existingArticle.content });
    } else {
      const response = await axios.post('https://api.openai.com/v1/completions', data, config);
      const generatedArticle = response.data.choices[0].text.trim();

      await db.collection('articles').updateOne(
        { title: articleTitle },
        { $set: { content: generatedArticle , userID:userID } },
        { upsert: true },
      );

      res.render('article', { generatedArticle });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});


router.post('/post-article', async (req, res) => {
  const { articleId } = req.body;

  if (!articleId) {
      res.status(400).json({status: 'error', message: 'Article ID is required'});
      return;
  }

  try {
      const db = req.app.locals.db; // using the database instance from app.locals
      const article = await db.collection('articles').findOne({ _id: new ObjectId(articleId) });

      if (!article) {
          res.status(404).json({status: 'error', message: 'Article not found'});
          return;
      }

      const response = await client.newPost({
          title: article.title,
          content: article.content,
          status: 'publish'
      }, function( error, id ){
        if(!error){
          res.status(200).json({status: 'success', message: `Article posted successfully with ID: ${id}`});
        }else{
          console.error(error);
          res.status(500).json({status: 'error', message: 'Internal server error'});
        }
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({status: 'error', message: 'Internal server error'});
  }
});

module.exports = router;
