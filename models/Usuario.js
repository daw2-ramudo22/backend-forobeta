const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  nombre: String,
  email: { type: String, unique: true },
  cumple: Date,
  fotoperfil: String,
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Usuario', schema);
