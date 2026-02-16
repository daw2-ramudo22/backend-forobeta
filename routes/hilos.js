const express = require('express');
const router = express.Router();
const Hilo = require('../models/Hilo');
const Mensaje = require('../models/Mensaje');
const autenticarToken = require('../middleware/autenticarToken');

//CREAR HILO
router.post('/', autenticarToken, async (req, res) => {
  try {
    const nuevoHilo = new Hilo({
      titulo: req.body.titulo,
      mensaje_del_hilo: req.body.mensaje_del_hilo,
      fecha_publicacion: new Date(),
      owner: req.usuario.id
    });

    await nuevoHilo.save();
    res.status(201).json(nuevoHilo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear hilo' });
  }
});

//OBTENER TODOS LOS HILOS
router.get('/', async (req, res) => {
  try {
    const hilos = await Hilo.find().populate('owner', 'nombre email').lean();

    const resultados = await Promise.all(
      hilos.map(async hilo => {
        const cantidadMensajes = await Mensaje.countDocuments({ hilo: hilo._id });
        return { ...hilo, cantidadMensajes };
      })
    );

    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los hilos' });
  }
});

//ACTUALIZAR HILO
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const hilo = await Hilo.findById(req.params.id);
    if (!hilo) return res.status(404).json({ error: 'Hilo no encontrado' });

    //Lógica de Gesto de Usuario
    const esDuenio = hilo.owner.toString() === req.usuario.id;
    const esAdmin = req.usuario.role === 'admin';

    if (!esDuenio && !esAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este hilo' });
    }

    hilo.titulo = req.body.titulo || hilo.titulo;
    hilo.mensaje_del_hilo = req.body.mensaje_del_hilo || hilo.mensaje_del_hilo;

    await hilo.save();
    res.json({ mensaje: 'Hilo actualizado', editadoPor: esAdmin && !esDuenio ? 'Admin' : 'Usuario' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el hilo' });
  }
});

//ELIMINAR HILO
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const hilo = await Hilo.findById(req.params.id);
    if (!hilo) return res.status(404).json({ error: 'Hilo no encontrado' });

    //Lógica de Gesto de Usuario
    const esDuenio = hilo.owner.toString() === req.usuario.id;
    const esAdmin = req.usuario.role === 'admin';

    if (!esDuenio && !esAdmin) {
      return res.status(403).json({ error: 'No autorizado para eliminar este hilo' });
    }

    //Limpieza base de datos
    await Mensaje.deleteMany({ hilo: hilo._id });
    await hilo.deleteOne();

    res.json({ mensaje: 'Hilo y sus mensajes eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar hilo' });
  }
});

module.exports = router;