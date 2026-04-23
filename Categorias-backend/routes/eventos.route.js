const express = require('express');
const router = express.Router();
const Evento = require('../models/eventos.model');

//POST
router.post('/', async (req, res) => {
    try {
        const evento = new Evento(req.body);
        await evento.save();

        res.status(201).json({
            mensaje: 'Evento creado',
            evento
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear evento'
        });
    }
});

//GET
router.get('/', async (req, res) => {
    try {
        const eventos = await Evento.find();

        res.json({
            mensaje: 'Eventos obtenidos',
            eventos
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener eventos'
        });
    }
});

//GET por ID
router.get('/:id', async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);

        if (!evento) {
            return res.status(404).json({
                mensaje: 'Evento no encontrado'
            });
        }

        res.json({
            mensaje: 'Evento encontrado',
            evento
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar evento'
        });
    }
});

//PUT: fusionar eventos duplicados
router.put('/fusionar/:idPrincipal/:idDuplicado', async (req, res) => {
    try {
        const { idPrincipal, idDuplicado } = req.params;

        if (idPrincipal === idDuplicado) {
            return res.status(400).json({
                mensaje: 'Debes seleccionar dos eventos diferentes'
            });
        }

        const eventoPrincipal = await Evento.findById(idPrincipal);
        const eventoDuplicado = await Evento.findById(idDuplicado);

        if (!eventoPrincipal || !eventoDuplicado) {
            return res.status(404).json({
                mensaje: 'Uno de los eventos no existe'
            });
        }

        eventoPrincipal.descripcion = eventoPrincipal.descripcion || eventoDuplicado.descripcion;
        eventoPrincipal.ubicacion = eventoPrincipal.ubicacion || eventoDuplicado.ubicacion;
        eventoPrincipal.estado = eventoPrincipal.estado || eventoDuplicado.estado;

        await eventoPrincipal.save();
        await Evento.findByIdAndDelete(idDuplicado);

        res.json({
            mensaje: 'Eventos fusionados correctamente',
            evento: eventoPrincipal,
            eventoEliminado: eventoDuplicado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al fusionar eventos'
        });
    }
});

//DELETE por ID
router.delete('/:id', async (req, res) => {
    try {
        const evento = await Evento.findByIdAndDelete(req.params.id);

        if (!evento) {
            return res.status(404).json({
                mensaje: 'Evento no encontrado'
            });
        }

        res.json({
            mensaje: 'Evento eliminado correctamente',
            evento
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar evento'
        });
    }
});

module.exports = router;
