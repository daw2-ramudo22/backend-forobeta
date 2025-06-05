const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
  texto: { type: String, required: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  hilo: { type: mongoose.Schema.Types.ObjectId, ref: 'Hilo', required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mensaje', mensajeSchema);
