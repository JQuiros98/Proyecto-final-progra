const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    fecha: { type: Date, required: true },
    ubicacion: String,

    estado: { 
        type: String, 
        enum: ['activo', 'cancelado'], 
        default: 'activo' 
    }
});

module.exports = mongoose.model('Evento', eventoSchema);