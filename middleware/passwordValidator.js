// Importation de Password-validator (sécurité)
const passwordValidator = require('password-validator');

// Creation du schéma
const passwordSchema = new passwordValidator();

// Définition des propriétés du schéma (le shéma que doit respecter le mot de pass)
passwordSchema
// Longueur min 8 caractères
.is().min(8) 

// Longueur max 100 caractères
.is().max(100)      

// Lettres en majuscule requises
.has().uppercase()

// Lettres en minuscule requises
.has().lowercase()    

// Chiffres requis
.has().digits(1) 

// Espaces blancs non autorisés
.has().not().spaces()  

// Mots interdits
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