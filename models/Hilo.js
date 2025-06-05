const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hiloSchema = new Schema({
  titulo: { type: String, required: true },
  mensaje_del_hilo: { type: String, required: true },
  fecha_publicacion: { type: Date, default: Date.now },
  owner: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
});

module.exports = mongoose.model('Hilo', hiloSchema);
