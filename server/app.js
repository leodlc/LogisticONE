require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { dbConnection } = require('./config/mongo');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Cargar rutas
app.use('/api/1.0', require('./app/routes')); 

// Conectar a la BD y levantar servidor
dbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Database connection failed', error);
  process.exit(1);
});
