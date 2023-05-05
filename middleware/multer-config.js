// Importation de Multer
const multer = require('multer');

// Extensions d'image acceptés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/tiff': 'tiff'
};

// Importation et création d'un nom pour l'image 
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Vérification de l'extension de l'image 
const fileFilter = (req, file, callback) => {
  const extension = MIME_TYPES[file.mimetype]; 
  if (extension === 'jpg' || extension === 'png' || extension === 'tiff') {
    callback(null, true); 
  } else {
    callback('Erreur : Votre image n\'est pas valide', false);
  }
};

// Exportation du module pour pouvoir y acceder depuis un autre fichier
module.exports = multer({storage: storage, limits: { fileSize: 104857600 }, fileFilter}).single('image');