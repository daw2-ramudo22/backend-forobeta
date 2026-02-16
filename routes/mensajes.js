const express = require('express');
const router = express.Router();
const Mensaje = require('../models/Mensaje');
const autenticarToken = require('../middleware/autenticarToken');

//CREAR MENSAJE
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { texto, hilo } = req.body;

    const mensaje = new Mensaje({
      texto,
      hilo,
      autor: req.usuario.id,
      fecha: new Date()
    });

    await mensaje.save();
    res.status(201).json(mensaje);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear mensaje' });
  }
});

//OBTENER MENSAJES
router.get('/', async (req, res) => {
  const mensajes = await Mensaje.find().populate('autor', 'nombre').populate('hilo', 'titulo');
  res.json(mensajes);
});

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

//ACTUALIZAR MENSAJE
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const mensaje = await Mensaje.findById(req.params.id);

    if (!mensaje) return res.status(404).json({ error: 'Mensaje no encontrado' });

    const esAutor = mensaje.autor.toString() === req.usuario.id;
    const esAdmin = req.usuario.role === 'admin';

    if (!esAutor && !esAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para editar este mensaje' });
    }

    mensaje.texto = req.body.texto || mensaje.texto;
    await mensaje.save();

    res.json({ 
      mensaje: 'Mensaje actualizado', 
      editadoPor: esAdmin && !esAutor ? 'Admin' : 'Autor' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el mensaje' });
  }
});

//ELIMINAR MENSAJE
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const mensaje = await Mensaje.findById(req.params.id);

    if (!mensaje) return res.status(404).json({ error: 'Mensaje no encontrado' });

    const esAutor = mensaje.autor.toString() === req.usuario.id;
    const esAdmin = req.usuario.role === 'admin';

    if (!esAutor && !esAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para borrar este mensaje' });
    }

    await mensaje.deleteOne();
    res.json({ mensaje: 'Mensaje eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al borrar el mensaje' });
  }
});

module.exports = router;