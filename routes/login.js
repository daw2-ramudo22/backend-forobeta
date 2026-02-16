const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

//Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    //Buscar usuario y asegurarnos de traer el campo 'role'
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    //Verificar contraseña
    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    //Generar TOKEN incluyendo el ID y el ROLE
    const token = jwt.sign(
      { id: usuario._id, role: usuario.role || 'user' }, 
      process.env.JWT_SECRET || '123', 
      { expiresIn: '1d' }
    );

    //Responder con los datos necesarios
    res.json({ 
      mensaje: 'Login correcto', 
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.role || 'user'
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//Registro de usuario
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      role: 'user'
    });

    await nuevoUsuario.save();

    res.status(201).json({ 
      mensaje: 'Usuario creado correctamente',
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        role: nuevoUsuario.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//Obtener perfil del usuario
router.get('/perfil', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '123');
    const usuario = await Usuario.findById(decoded.id).select('-password');

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(usuario);
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;