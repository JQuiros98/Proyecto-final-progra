const express = require('express');
const router = express.Router();
const Categoria = require('../models/categoria.model');

//POST: registrar categoría
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({
                mensaje: 'El nombre es obligatorio'
            });
        }

        const nuevaCategoria = new Categoria({
            nombre,
            descripcion
        });

        await nuevaCategoria.save();

        res.json({
            mensaje: 'Categoría registrada correctamente',
            categoria: nuevaCategoria
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al registrar categoría',
            error
        });
    }
});

//GET: listar categorías
router.get('/', async (req, res) => {
    try {
        const categorias = await Categoria.find();

        res.json({
            mensaje: 'Listado de categorías',
            categorias
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener categorías',
            error
        });
    }
});


// // DELETE: eliminar categoría por ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const categoriaEliminada = await Categoria.findByIdAndDelete(id);

         if (!categoriaEliminada) {
            return res.status(404).json({
                mensaje: 'Categoría no encontrada'
            });
        }

         res.json({
            mensaje: 'Categoría eliminada correctamente',
           categoria: categoriaEliminada
        });

     } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar categoría',
            error
        });
    }
});



//GET: filtrar por nombre
router.get('/filtro/:nombre', async (req, res) => {
    try {
        const { nombre } = req.params;

        const categorias = await Categoria.find({
            nombre: new RegExp(nombre, 'i')
        });

        res.json({
            mensaje: 'Resultado del filtro',
            categorias
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al filtrar',
            error
        });
    }
});

module.exports = router;