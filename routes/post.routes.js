// Importations
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const postCtrl = require('../controllers/post.controller');

// Routes
router.post('/', auth, multer, postCtrl.setPosts);
router.get('/', auth, postCtrl.getAllPosts);
router.get('/:id', auth, postCtrl.getOnePost);
router.put('/:id', auth, multer, postCtrl.editOnePost);
router.delete('/:id', auth, postCtrl.deletePost);
router.patch('/like-post/:id', auth, postCtrl.likePost);
router.patch('/dislike-post/:id', auth, postCtrl.dislikePost);

module.exports = router