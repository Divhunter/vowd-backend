// Importation d'Express
const express = require('express');

// Création de l'application express
const app = express();

// Importation de Morgan (logger htpp)
const morgan = require('morgan');

// Importation de Helmet (sécurité)
// Pour la protection contre les attaques de type cross-site scripting et autres injections intersites
const helmet = require('helmet');

// Importation de HPP (sécurité)
// Pour se protéger des attaques par pollution des paramètres HTTP
const hpp = require('hpp');

// Importation d'Express-mongo-sanitize (sécurité)
// Pour assainir les champs inputs des injections sql
const mongoSanitize = require('express-mongo-sanitize');

app.use('/', express.static('dist')) 

// Application du logger
app.use(morgan('dev'));

//Importation des routes
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');

const path = require('path');
const { application } = require('express');

app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Définition des entêtes CORS
app.use((req, res, next) => {
    res.setHeader(
    'Access-Control-Allow-Origin',
    '*',
    'https://vowd-project.onrender.com/', 
    'https://vowd-project.onrender.com/updatePassword'
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, Content-Type, Access-Control-Allow-Headers"
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/post', postRoutes);
app.use('/api/auth', userRoutes);

// Application des middlewares de sécurité 
app.use(helmet());
app.use(hpp()); 
app.use(mongoSanitize()); 

// Exportation de app.js pour pouvoir y acceder depuis un autre fichier
module.exports = app;