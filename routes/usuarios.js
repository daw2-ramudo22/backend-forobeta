const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const autenticarToken = require('../middleware/autenticarToken');

//LOGIN DE USUARIO
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

    const token = jwt.sign(
      { id: usuario._id, role: usuario.role || 'user' }, 
      process.env.JWT_SECRET || '123', 
      { expiresIn: '1d' }
    );

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

//REGISTRO DE USUARIO
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
      usuario: { id: nuevoUsuario._id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//OBTENER PERFIL
router.get('/perfil', autenticarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password');
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//RUTAS DE ADMINISTRACIÓN
//OBTENER TODOS LOS USUARIOS (Solo Admin)
router.get('/todos', autenticarToken, async (req, res) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: Se requiere ser administrador' });
  }
  try {
    const usuarios = await Usuario.find().select('-password');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

//EDITAR CUALQUIER USUARIO (Solo Admin)
router.put('/admin-edit/:id', autenticarToken, async (req, res) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  try {
    const usuarioAEditar = await Usuario.findById(req.params.id);
    if (!usuarioAEditar) return res.status(404).json({ error: 'Usuario no encontrado' });

    usuarioAEditar.nombre = req.body.nombre || usuarioAEditar.nombre;
    usuarioAEditar.email = req.body.email || usuarioAEditar.email;
    usuarioAEditar.role = req.body.role || usuarioAEditar.role; // El admin puede ascender a otros

    await usuarioAEditar.save();
    res.json({ mensaje: 'Usuario actualizado por el administrador' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

//ELIMINAR CUALQUIER USUARIO (Solo Admin)
router.delete('/admin-delete/:id', autenticarToken, async (req, res) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Usuario eliminado por el administrador' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;