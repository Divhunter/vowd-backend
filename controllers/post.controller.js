const PostModel = require('../models/post.model');

// Importation du module Fs :
// Pour créer des fichiers
// Pour lire des fichiers
// Pour écrire dans des fichiers
// Pour copier des fichiers
// Pour renommer des fichiers
// Pour supprimer des fichiers
const fs = require('fs');

// Importation de JWT (sécurité)
// Pour attribuer un jeton (code haché unique) relatif aux données 
const jwt = require('jsonwebtoken');

// Création du regex (Sécurité)
// Pour filtrer les chaînes de caractères et bannir les caractères non autorisés
const regex = /^[a-zA-Zéèêîçôï0-9]+(?:['\s\-\.a-zA-Zéèêîçôï0-9]+)*$/;


//=========================================================================================
// Relatif à la création d'un post
module.exports.setPosts = async (req, res, next) => {

    const post = await PostModel.create({
        message: req.body.message,
        author: req.body.author,
        userId: req.body.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    if (!regex.test(post.message)) {
        post.remove();
        res.status(400).json({ error: 'Vos champs doivent contenir des caractères valides !' }); // Accès à la requête refusée 
    }
    else {
        post.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' })}) // Objet créé, requête réussie
        .catch(error => { res.status(401).json({ error })}) // Client non auhtentifié, requête échouée*/
    }
};

//=========================================================================================
// Relatif à la modification dun post
exports.editOnePost = (req, res, next) => {
    const postObjet = req.file ? {
        //L'opérateur spread ... est utilisé pour faire une copie de tous les éléments de req.body
        ...JSON.parse(req.body.post),
        //imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    if (
        !regex.test(postObjet.message)
    ) {
        return res
        .status(400) // Erreur de synthaxe
        .json({ error: "Vos champs doivent contenir des caractères valides !" }); 
    };
  
    delete postObjet._userId;
    PostModel.findOne({_id: req.params.id})
    .then(post => {
        if (post.userId != req.body.userId /*req.auth.userId*/) {
            res.status(401).json({ message : "Erreur d'authentification"}); // Client non auhtentifié, requête échouée 
        } else {
            PostModel.updateOne({ _id: req.params.id}, { ...postObjet, _id: req.params.id})
            .then(() => res.status(200).json({message : 'Objet modifié!'}))
            .catch(error => res.status(401).json({ error })); // Client non auhtentifié, requête échouée
        }
    })
    .catch((error) => {
        res.status(403).json({ error }); // Accès à la requête refusée
    });
};

module.exports.deletePost = async (req, res) => {
    const post = await PostModel.findById(req.params.id);

    if(!post) {
        res.status(400).json({ message: 'Ce post n\'existe pas !' })
    };

    await post.remove();
    res.status(200).json({ message: 'Message supprimé id: ' + req.params.id})
};

//=========================================================================================
// Relatif à la suppression de l'objet
module.exports.deletePost = async (req, res, next) => {
    PostModel.findOne({ _id: req.params.id})
    .then(post => {
        if (post.userId != req.body.userId /*req.auth.userId*/) {
            res.status(401).json({message: "Erreur d'authentification"}); // Client non auhtentifié
        } else {
            const filename = post.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                PostModel.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'Objet supprimé !'})}) // requête réussie
                    .catch(error => res.status(401).json({ error })); // Client non auhtentifié, requête échouée
            });
        }
    })
    .catch( error => {
        res.status(500).json({ error });
    });
};

//=========================================================================================
// Relatif à l'affichage de tous les posts
module.exports.getAllPosts = async (req, res, next) => {
    const posts = await PostModel.find()
        .then(posts => res.status(200).json(posts)) // requête réussie
        .catch(error => res.status(404).json({ error }));
};

//=========================================================================================
// Relatif à l'affichage d'un seul post
module.exports.getOnePost = async (req, res, next) => {
    const post = await PostModel.findById({ _id: req.params.id })
        .then(post => res.status(200).json(post)) // requête réussie
        .catch(error => res.status(404).json({ error }));
};

module.exports.likePost = async (req, res) => {
    try {
        await PostModel.findByIdAndUpdate(
            req.params.id,
            {$addToSet: { likers: req.body.userId }},
            {new: true}
        )
        .then((data) => res.status(200).send(data))
    }
    catch (error) {
        res.status(400).json(error)
    }
}

module.exports.dislikePost = async (req, res) => {
    try {
        await PostModel.findByIdAndUpdate(
            req.params.id,
            {$pull: { likers: req.body.userId }},
            {new: true}
        )
        .then((data) => res.status(200).send(data))
    }
    catch (error) {
        res.status(400).json(error)
    }
}