// Importation de Password-validator (sécurité)
const passwordValidator = require('password-validator');

// Création d'un schéma de validation pour le password
const passwordSchema = new passwordValidator();
passwordSchema
.is().min(8)            // Minimum 8 caractères
.is().max(20)           // Maximum 20 caractères
.has().uppercase()      // Requière au moins une lettre majuscule
.has().lowercase()      // Requière au moins une lettre minuscule
.has().digits()         // Requière au moins un chiffre
.has().symbols()        // Requière au moins un caractère spécial
.has().not().spaces()   // Espace blanc non autorisé
.is().not().oneOf(['Passw0rd', 'Password123', 'Azerty123']); 

// Vérification du mot de pass
module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)){
        next();
    } else {
        return res
        .json({ error : `Le mot de passe n'est pas valide ! : ${passwordSchema.validate('req.body.password', { list: true })}`})
        .status(400)
    }
}