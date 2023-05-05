// Import Validator (sécurité)
// Pour vérifier que la saisie dans le champ soit conforme au format email
const validator = require('validator');

// Vérification de email
module.exports = (req, res, next) => {
    const validate = req.body.email;

    if(validator.isEmail(validate)){
        next();
    } else {
        return res
        .json({ error: "L'email n'est pas valide !"})
        .status(400)
    }
}