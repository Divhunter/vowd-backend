// Importation de Mongoose
const mongoose = require('mongoose');

// Création du schéma
const postSchema = mongoose.Schema(
    {
    userId: { type: String, required: true },
    author: { type: String, required: true },
    message: { type: String, required: true },
    imageUrl: { type: String },
    likers: { type: [String], default: [] },
    },
    {
        timestams: true
    }
);

// Export de post pour pouvoir y acceder depuis un autre fichier
module.exports = mongoose.model('post', postSchema)