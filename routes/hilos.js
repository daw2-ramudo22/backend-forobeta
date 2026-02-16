const express = require('express');
const router = express.Router();
const Hilo = require('../models/Hilo');
const Mensaje = require('../models/Mensaje');
const autenticarToken = require('../middleware/autenticarToken');


//Crear hilo (protegido con autenticación)
router.post('/', autenticarToken, async (req, res) => {
  try {
    const nuevoHilo = new Hilo({
      titulo: req.body.titulo,
      mensaje_del_hilo: req.body.mensaje_del_hilo,
      fecha_publicacion: new Date(),
      owner: req.usuarioId
    });

    await nuevoHilo.save();
    res.status(201).json(nuevoHilo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear hiloo' });
  }
});



//Obtener todos los hilos (ordenados por fecha de creación)
router.get('/', async (req, res) => {
  try {
    const hilos = await Hilo.find().populate('owner').lean();

    // Para cada hilo, contar los mensajes relacionados
    const resultados = await Promise.all(
      hilos.map(async hilo => {
        const cantidadMensajes = await Mensaje.countDocuments({ hilo: hilo._id });
        return {
          ...hilo,
          cantidadMensajes
        };
      })
    );

    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los hilos' });
  }
});

//Obtener hilo por ID
router.get('/:id', async (req, res) => {
  try {
    const hilo = await Hilo.findById(req.params.id).populate('owner');
    if (!hilo) {
      return res.status(404).json({ error: 'Hilo no encontrado' });
    }
    res.json(hilo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener hilo' });
  }
});

//Actualizar hilo
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const hilo = await Hilo.findById(req.params.id);
    if (!hilo) return res.status(404).json({ error: 'Hilo no encontrado' });

    if (hilo.owner.toString() !== req.usuarioId)
      return res.status(403).json({ error: 'No autorizado' });

    hilo.titulo = req.body.titulo || hilo.titulo;
    hilo.mensaje_del_hilo = req.body.mensaje_del_hilo || hilo.mensaje_del_hilo;

    await hilo.save();

    res.json({ mensaje: 'Hilo actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el hilo' });
  }
});

//Eliminar hilo
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const hilo = await Hilo.findById(req.params.id);
    if (!hilo) return res.status(404).json({ error: 'Hilo no encontrado' });

    // Verificamos que el usuario sea el owner
    if (hilo.owner.toString() !== req.usuarioId)
      return res.status(403).json({ error: 'No autorizado' });

    await hilo.deleteOne();
    res.json({ mensaje: 'Hilo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar hilo' });
  }
});


module.exports = router;