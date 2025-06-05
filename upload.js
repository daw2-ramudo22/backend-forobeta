// upload.js
const multer = require('multer');
const path = require('path');

// Carpeta donde se guardarán las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Ej: 1695577552938.jpg
  }
});

const upload = multer({ storage });

module.exports = upload;
