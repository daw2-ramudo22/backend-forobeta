const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  nombre: String,
  email: { type: String, unique: true },
  cumple: Date,
  fotoperfil: String,
  password: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Usuario', schema);
