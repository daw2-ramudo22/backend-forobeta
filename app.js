const API_URL = 'https://foro-backend-g0z3.onrender.com';
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const PORT = process.env.PORT || 3000;


//Inicializar app antes de usarla
const app = express();

//Habilitar CORS correctamente
app.use(cors({
  origin: 'https://proyecto-foro-beta-nmbc.vercel.app',
  credentials: true
}));

// Middleware para manejar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/usuarios', require('../routes/usuarios'));
app.use('/hilos', require('../routes/hilos'));
app.use('/mensajes', require('../routes/mensajes'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error de conexión:', err));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
