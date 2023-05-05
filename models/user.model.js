// Importation de Mongoose
const mongoose = require('mongoose');

// Importation d'Express-mongo-sanitize (sécurité)
// Pour assainir les champs inputs des injections sql
const uniqueValidator = require('mongoose-unique-validator');

// Création du schéma
const userSchema = mongoose.Schema(
    {
        userName: { type: String, required: true, unique: true},
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        resetToken: { type: String, default:'' }
    },
    {
        timestamps: true
    }
);

// Application de mongoose-unique-validator au schéma
userSchema.plugin(uniqueValidator);

// Exportation du module pour pouvoir y acceder depuis un autre fichier
module.exports = mongoose.model('user', userSchema);
