const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const autenticarToken = require('../middleware/autenticarToken');
const API_URL = 'https://foro-backend-g0z3.onrender.com';



// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET || '123', {
      expiresIn: '1d',
    });

    res.json({ 
      mensaje: 'Login correcto', 
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registro de usuario
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword
    });

    await nuevoUsuario.save();

    res.status(201).json({ 
      mensaje: 'Usuario creado correctamente',
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario autenticado
router.get('/perfil', autenticarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId).select('-password');
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    console.log('Usuario devuelto:', usuario); // 👈 AGREGA ESTO

    res.json(usuario);
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



// Editar nombre de usuario autenticado
router.put('/editar-nombre', autenticarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    usuario.nombre = req.body.nombre || usuario.nombre;
    await usuario.save();

    res.json({ mensaje: 'Nombre actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el nombre' });
  }
});

// Eliminar cuenta del usuario autenticado
router.delete('/eliminar-cuenta', autenticarToken, async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.usuarioId);
    res.json({ mensaje: 'Cuenta eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la cuenta' });
  }
});

module.exports = router;