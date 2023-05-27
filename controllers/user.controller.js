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

// Importation de passwordValidator (Sécurité)
// Pour s'assurer que le password est valide
const passwordValidator = require('password-validator');

// Création du regex (Sécurité)
// Pour validation de la chaîne de caractère relative à l'adresse mail 
const regexEmail = /^\w+([\.-_]?\w+)*@\w+([\.-_]?\w+)*(\.\w{2,3})+$/;

// Création du regex (Sécurité)
// Pour filtrer les chaînes de caractères et bannir les caractères non autorisés
const regexUserName = /^[a-zA-Zéèêîçôï0-9]+(?:['\s\-\.a-zA-Zéèêîçôï0-9]+)*$/;

// Création d'un schéma de validation pour le password
const passwordSchema = new passwordValidator();
passwordSchema
.is().min(8)            // Minimum 8 caractères
.is().max(20)           // Maximum 20 caractères
.has().uppercase()      // Requière au moins une lettre majuscule
.has().lowercase()      // Requière au moins une lettre minuscule
.has().digits()         // Requière au moins un chiffre
.has().symbols(1)       // Requière au moins un caractère spécial
.has().not().spaces()   // Espace blanc non autorisé
.is().not().oneOf(['Passw0rd', 'Password123', 'Azerty123']); //Mots de passe non valides

//=========================================================================================
// Relatif à la création d'un compte utilisateur
module.exports.register = (req, res, next) => {
    UserModel.findOne({ userName: req.body.userName, email: req.body.email })
    .then(user => {
        if (user) {
            return res.json({ userRegError: 'Pseudo et/ou email déjà utilisés !' }).status(400);
        }
        else if (!regexUserName.test(req.body.userName)) {
            return res.json({ userNameRegError: 'Votre nom d\'utilisateur doit contenir des caractères valides !' }).status(400);
        } 
        else if (!regexEmail.test(req.body.email)) {
            return res.json({ emailRegError: 'L\'adresse mail n\'est pas valide !' }).status(400);
        } 
        else if (!passwordSchema.validate(req.body.password)) {
            return res.json({ passwordRegError:'Le mot de passe doit contenir 8 à 20 caractères dont au moins une lettre majuscule, une lettre minuscule, un chiffre, et un seul caractère spécial !' }).status(400);
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
            .catch(error => res.json({ error: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(500));
            })
        }
    })
    .catch(error => res.json({ error: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(500));
}



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
            const newToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET_TOKEN,
                { expiresIn: "24h" }
              );
            res.status(200).json({ userId: user._id, token: newToken });
        })
        .catch(error => res.json({ error: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(500));
    })
    .catch(error => res.json({ error: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(500));
}

//=========================================================================================
// Relatif à l'envoi du mail d'authentification'

module.exports.sendMail = (req, res, next) => {
    UserModel.findOne({ userName: req.body.userName, email: req.body.email })
    .then(user => {
        if (user) {
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
                html: `<p>Bonjour ${userName}, voici le lien pour réinitialiser votre mot de passe <a href = "http://localhost:3000/monSite/update_password" >réinitialisation</a></p>`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.json({ error: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(400)
                } 
                else {
                    return res.json({ messageSend: userName +', nous traitons votre demande !' }).status(201)
                }
            })
        }
        else {
            return res.json({ userSendError: 'Ce compte d\'utilisateur n\'existe pas !' }).status(401);
        }
    })
    .catch(error => res.json({ error: 'Une erreur inattendue est survenue, veuillez réesayer ulterieurement !' }).status(500));
};

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