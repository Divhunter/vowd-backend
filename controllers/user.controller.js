// Importation de UserShema
const UserModel = require('../models/user.model');

// Importation de BCRYPT (Sécurité)
// Pour le salage et le hachage du password
const bcrypt = require('bcrypt');

// Importation de JWT (sécurité)
// Pour attribuer un jeton (code haché unique) relatif aux données 
const jwt = require('jsonwebtoken');

// Importation de nodeMailer
// Pour envoyer un email
const nodeMailer = require('nodemailer')

// Importation de mailValidator (Sécurité)
// Pour s'assurer que l'email et bien un email
const mailValidator = require("email-validator");

// Importation de passwordValidator (Sécurité)
// Pour s'assurer que le password est valide
const passwordValidator = require("password-validator");

// Création du regex (Sécurité)
// Pour filtrer les chaînes de caractères et bannir les caractères non autorisés
const regex = /^[a-zA-Zéèêîçôï0-9]+(?:['\s\-\.a-zA-Zéèêîçôï0-9]+)*$/;

// Création d'un schéma de validation pour le password
var schema = new passwordValidator();
schema
    .is()
    .min(10)
    .is()
    .max(20)
    .has()
    .not()
    .spaces()
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits(1);

//=========================================================================================
// Relatif à la création d'un compte utilisateur
module.exports.register = (req, res, next) => {
    UserModel.findOne({ userName: req.body.userName, email: req.body.email })
        if (!regex.test(req.body.userName)) {
            return res.json({ userNameRegError: 'Votre nom d\'utilisateur doit contenir des caractères valides !' }).status(400); // Accès à la requête refusée 
        } 
        else if (!mailValidator.validate(req.body.email)) {
            return res.json({ emailRegError: 'L\'adresse mail n\'est pas valide !' }).status(400); // Accès à la requête refusée
        } 
        else if (!schema.validate(req.body.password)) {
            return res.json({ passwordRegError: 'Le password n\'est pas valide !' }).status(400); // Accès à la requête refusée
        }
        else {
            bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const user = new UserModel({
                userName: req.body.userName,  
                email: req.body.email,
                password: hash
            });
            user.save()
            .then(() => res.json({  userId: user._id,
                                    message:  user.userName +', votre compte est crée !' }).status(200))
            .catch(error => res.json({ userRegError: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(400));
        })
        .catch(error => res.json({ error: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(500));
    }
};

//=========================================================================================
// Relatif à la connection d'un compte utilisateur
module.exports.login = (req, res, next) => {
    UserModel.findOne({ userName: req.body.userName, email: req.body.email })
    .then(user => {
        if (!user) {
            return res.json({ userLogError: 'Pseudo et/ou email incorrecte(s) !' }).status(401);
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                return res.json({ passwordLogError: 'Mot de passe incorrecte !' }).status(401);
            }
            res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    { userId: user._id },
                    'RANDOM_TOKEN_SECRET',
                    { expiresIn: '24h'}
                )
            });
        })
        .catch(error => res.json({ errorLogUnknown: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(500));
    })
    .catch(error => res.json({ errorLogUnknown: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(500));
}

//=========================================================================================
// Relatif à l'envoi du mail d'authentification'

module.exports.sendMail = (req, res, next) => {
    const userName = req.body.userName
    const email = req.body.email
    const verifUser = { userName: userName, email: email }
    UserModel.findOne(verifUser) 
    if (!verifUser) {
        return res.json({ userSendError: 'Erreur d\'authentification !' }).status(401);
    } 
    else {

        const transporter = nodeMailer.createTransport({
            host: 'smtp-mail.outlook.com',
            secureConnection: false,
            port: 587,
            tls: {
                ciphers:"SSLv3"
            },
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Réinitialisation de mot de passe',
            html: `<p>Bonjour ${userName}, voici le lien pour réinitialiser votre mot de passe: ${process.env.CLIENT_URL}/password </p>`
        }
    
        transporter.sendMail(mailOptions, error => {
            if (error) {
                res.json({ error: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(400)
            } 
            else {
                res.json({ messageSend: userName +', nous traitons votre demande !' }).status(201)
            };
        })
    };
}


//=========================================================================================
// Relatif à la mise à jour du mot de passe

module.exports.updatePassword = (req, res, next) => {
    const userName = req.body.userName
    const email = req.body.email
    const verifUser = { userName: userName, email: email }
    UserModel.findOne(verifUser) 
    .then(user => {
        if (!user) {
            return res.json({ userUpdateError: 'Erreur d\'authentification !' }).status(401);
        } 
        else {
            const token = jwt.sign(
                { _id: user._id },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '20m'}
            )
            user.resetToken = token
            user.password = bcrypt.hashSync(req.body.password, 10)
            user.save()
           
            .then(() => res.json({ messageUpdate: userName +', votre mot de passe a été modifié !' }).status(200))
            .catch(error => res.json({ error: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(400));
        };
    })
    .catch(error => res.json({ errorUpUnknown: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(500));
};