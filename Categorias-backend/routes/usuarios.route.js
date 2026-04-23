const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuarios.model');
const Evento = require('../models/eventos.model');


//POST: Registrar usuario
router.post('/', async (req, res) => {
    try {
        const { nombre, cedula, email, password, tipoUsuario } = req.body;

        // Validación básica
        if (!nombre || !cedula || !email || !password || !tipoUsuario) {
            return res.status(400).json({
                success: false,
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        const nuevoUsuario = new Usuario({
            nombre,
            cedula,
            email,
            password,
            tipoUsuario
        });

        await nuevoUsuario.save();

        res.status(201).json({
            success: true,
            mensaje: 'Usuario registrado exitosamente',
            usuario: nuevoUsuario
        });

    } catch (error) {

        // 🔹 Error de duplicados
        if (error.code === 11000) {
            const campo = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                mensaje: `El ${campo} ingresado ya está registrado`
            });
        }

        res.status(500).json({
            success: false,
            mensaje: 'Error interno del servidor',
            error: error.message
        });
    }
});


//POST: LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ email });

        // Usuario no existe
        if (!usuario) {
            return res.status(404).json({
                success: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        // Password incorrecto
        if (usuario.password !== password) {
            return res.status(400).json({
                success: false,
                mensaje: 'Contraseña incorrecta'
            });
        }

        res.status(200).json({
            success: true,
            mensaje: 'Login exitoso',
            usuario
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error en el login',
            error: error.message
        });
    }
});


//GET: Obtener usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find();

        res.status(200).json({
            success: true,
            total: usuarios.length,
            usuarios
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error interno del servidor',
            error: error.message
        });
    }
});

//GET: Obtener eventos guardados de un usuario
router.get('/:idUsuario/eventos-guardados', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.idUsuario).populate('eventosGuardados');

        if (!usuario) {
            return res.status(404).json({
                success: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            eventos: usuario.eventosGuardados
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener eventos guardados',
            error: error.message
        });
    }
});

//POST: Guardar evento en lista personal
router.post('/:idUsuario/eventos-guardados/:idEvento', async (req, res) => {
    try {
        const { idUsuario, idEvento } = req.params;

        const usuario = await Usuario.findById(idUsuario);
        const evento = await Evento.findById(idEvento);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        if (!evento) {
            return res.status(404).json({
                success: false,
                mensaje: 'Evento no encontrado'
            });
        }

        const yaExiste = usuario.eventosGuardados.some(eventoGuardado => eventoGuardado.toString() === idEvento);

        if (yaExiste) {
            return res.status(400).json({
                success: false,
                mensaje: 'Este evento ya esta guardado'
            });
        }

        usuario.eventosGuardados.push(idEvento);
        await usuario.save();

        res.json({
            success: true,
            mensaje: 'Evento guardado correctamente',
            usuario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al guardar evento',
            error: error.message
        });
    }
});

//DELETE: Quitar evento guardado
router.delete('/:idUsuario/eventos-guardados/:idEvento', async (req, res) => {
    try {
        const { idUsuario, idEvento } = req.params;

        const usuario = await Usuario.findById(idUsuario);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        usuario.eventosGuardados = usuario.eventosGuardados.filter(eventoGuardado => eventoGuardado.toString() !== idEvento);
        await usuario.save();

        res.json({
            success: true,
            mensaje: 'Evento eliminado de tu lista personal'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error al quitar evento guardado',
            error: error.message
        });
    }
});


//DELETE: Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            mensaje: `Usuario ${usuario.nombre} eliminado exitosamente`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            mensaje: 'Error interno del servidor',
            error: error.message
        });
    }
});

module.exports = router;
