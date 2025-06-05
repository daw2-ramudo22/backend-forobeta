const express = require('express');
const router = express.Router();
const Mensaje = require('../models/Mensaje');
const autenticarToken = require('../middleware/autenticarToken');
const API_URL = 'https://foro-backend-g0z3.onrender.com';


// Crear mensaje (requiere token)
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { texto, hilo } = req.body;

    const mensaje = new Mensaje({
      texto,
      hilo,
      autor: req.usuarioId,
      fecha: new Date()
    });

    await mensaje.save();
    res.status(201).json(mensaje);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear mensaje' });
  }
});

// Obtener todos los mensajes (solo para debug o admin)
router.get('/', async (req, res) => {
  const mensajes = await Mensaje.find().populate('autor').populate('hilo');
  res.json(mensajes);
});

// Obtener mensaje por ID
router.get('/:id', async (req, res) => {
  const mensaje = await Mensaje.findById(req.params.id).populate('autor').populate('hilo');
  res.json(mensaje);
});

// Obtener mensajes de un hilo
router.get('/hilo/:hiloId', async (req, res) => {
  try {
    const mensajes = await Mensaje.find({ hilo: req.params.hiloId })
      .populate('autor', 'nombre')
      .sort({ fecha: 1 });

    res.json(mensajes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

router.put('/:id', autenticarToken, async (req, res) => {
  const mensaje = await Mensaje.findById(req.params.id);

  if (!mensaje) return res.status(404).json({ error: 'Mensaje no encontrado' });
  if (mensaje.autor.toString() !== req.usuarioId) {
    return res.status(403).json({ error: 'No tienes permiso para editar este mensaje' });
  }

  mensaje.texto = req.body.texto || mensaje.texto;
  await mensaje.save();

  res.json({ mensaje: 'Mensaje actualizado', mensajeActualizado: mensaje });
});

router.delete('/:id', autenticarToken, async (req, res) => {
  const mensaje = await Mensaje.findById(req.params.id);

  if (!mensaje) return res.status(404).json({ error: 'Mensaje no encontrado' });
  if (mensaje.autor.toString() !== req.usuarioId) {
    return res.status(403).json({ error: 'No tienes permiso para borrar este mensaje' });
  }

  await mensaje.deleteOne();
  res.json({ mensaje: 'Mensaje eliminado' });
});

module.exports = router;
