// Importation de Rate-limit (sécurité)
// Pour limiter le nombre de requêtes effectuées par l'utilisateur
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 10 * 60 * 10/*1000*/, 
  max: 3,
  message: JSON.stringify({
  error:'Trop de tentives de connection, réessayez dans 10 minutes',
  code: 429
  })
});

module.exports = { limiter }