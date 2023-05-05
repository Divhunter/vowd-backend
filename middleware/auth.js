// Importation de JWT (sécurité)
// Pour attribuer un jeton (code haché unique) relatif aux données 
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
   try {
       // Recherche du segment jeton des en-têtes d'autorisation
       const token = req.headers.authorization.split(' ')[1];

       // Vérification avec la clé secrète du jeton
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
    res.json({ error: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(401);
   }
};