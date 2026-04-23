const mongoose = require('mongoose');

const categoriaSchema = mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, required: false }
});

module.exports = mongoose.model('Categoria', categoriaSchema);