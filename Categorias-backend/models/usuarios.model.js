const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    cedula: {
        type: String,
        required: [true, 'La cédula es obligatoria'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        trim: true
    },
    tipoUsuario: {
        type: String,
        required: [true, 'El tipo de usuario es obligatorio'],
        enum: ['Promotor', 'Usuario', 'Moderador']
    },
    eventosGuardados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evento'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
