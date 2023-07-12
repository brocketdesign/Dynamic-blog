// FILE: dynamic-blog/initialize_db.js
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });

const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const sampleArticles = [
  { title: "Découvrez les 10 traditions japonaises les plus surprenantes" },
  { title: "Le Japon, une destination incontournable pour les amateurs de gastronomie" },
  { title: "5 raisons pour lesquelles le Japon est un leader mondial de la technologie" },
  { title: "Les 5 plus beaux temples et sanctuaires à visiter au Japon" },
  { title: "Les secrets de la longévité des Japonais : régime alimentaire, mode de vie et astuces santé" },
  { title: "Travailler au Japon : les opportunités d'emploi et les meilleurs secteurs à explorer" },
  { title: "Tokyo, Kyoto, Osaka : quelle ville choisir pour votre voyage au Japon ?" },
  { title: "Les mystères de la culture japonaise : les légendes, les fêtes et les rituels" },
  { title: "Comment préparer votre voyage au Japon : les visas, le budget, les astuces pour économiser" },
  { title: "Les plus beaux paysages naturels du Japon : les montagnes, les lacs, les jardins" },
  { title: "Les jeux vidéo japonais : les plus populaires et les plus innovants" },
  { title: "Le Japon et les arts martiaux : histoire, disciplines et influence mondiale" },
  { title: "Comment apprendre le japonais : les méthodes, les outils et les astuces pour progresser rapidement" },
  { title: "Les festivals japonais : les plus colorés, les plus impressionnants et les plus populaires" },
  { title: "Les meilleurs souvenirs à rapporter du Japon : artisanat, produits alimentaires, gadgets électroniques, etc." },
  { title: "La mode japonaise : les tendances, les marques et les créateurs à suivre" },
  { title: "Les stations thermales japonaises : les bienfaits, les coutumes et les meilleures adresses" },
  { title: "Les quartiers les plus emblématiques de Tokyo : Shibuya, Harajuku, Shinjuku, Ginza, etc." },
  { title: "Les hôtels les plus insolites du Japon : les capsules, les ryokans, les love hotels, etc." },
  { title: "Les jeux olympiques de Tokyo 2020 : l'histoire, les enjeux et les moments forts de cette édition exceptionnelle." }
];

async function initializeDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('dynamic_blog');
    const articlesCollection = db.collection('articles');

    // Remove any existing data
    await articlesCollection.deleteMany({});

    // Insert sample articles
    const result = await articlesCollection.insertMany(sampleArticles);
    console.log(`Inserted ${result.insertedCount} articles`);

    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error while initializing the database:', error);
  }
}

initializeDatabase();
