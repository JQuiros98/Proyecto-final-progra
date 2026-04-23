require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();


// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log(' Base de datos conectada correctamente');
})
.catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
});


// Middlewares
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


//Ruta de prueba (opcional pero útil)
app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});


// RUTAS
// Usuarios
const usuariosRoute = require('./routes/usuarios.route');
app.use('/api/usuarios', usuariosRoute);

// Categorías
const categoriasRoute = require('./routes/categorias.route');
app.use('/api/categorias', categoriasRoute);

// Eventos
const eventosRoutes = require('./routes/eventos.route');
app.use('/api/eventos', eventosRoutes);


// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        mensaje: 'Ruta no encontrada'
    });
});


// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(` Servidor corriendo en: http://localhost:${PORT}`);
});
