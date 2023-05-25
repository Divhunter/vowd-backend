// Importations
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const emailValidator = require('../middleware/emailValidator');
const passwordValidator = require('../middleware/passwordValidator');
const limit = require('../middleware/logLimit');
const { route } = require('./post.routes');

// Réglage des contrôleurs
router.post('/register', emailValidator, passwordValidator, userCtrl.register);
router.post('/login', limit.limiter, passwordValidator, userCtrl.login);
router.post('/sendMail', userCtrl.sendMail);
router.post('/updatePassword', userCtrl.updatePassword);

// Exportation du Router pour pouvoir y acceder depuis un autre fichier
module.exports = router;