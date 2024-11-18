const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configurar conexión a la base de datos
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
        process.exit(1);
    }
    console.log('Conexión exitosa a la base de datos.');
});

// Middleware
app.use(express.json());

// Ruta para guardar un valor
app.post('/api/guardar', (req, res) => {
    const { valorFinal } = req.body;
    if (!valorFinal) {
        return res.status(400).json({ error: 'El campo valorFinal es obligatorio.' });
    }

    const query = 'INSERT INTO resultados (valor_final) VALUES (?)';
    db.query(query, [valorFinal], (err, result) => {
        if (err) {
            console.error('Error al insertar en la base de datos:', err.message);
            return res.status(500).json({ error: 'Error al guardar el valor en la base de datos.' });
        }
        res.status(201).json({ message: 'Valor guardado con éxito.' });
    });
});

// Ruta para consultar el último valor
app.get('/api/consultar', (req, res) => {
    const query = 'SELECT valor_final FROM resultados ORDER BY fecha DESC LIMIT 1';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err.message);
            return res.status(500).json({ error: 'Error al consultar el valor en la base de datos.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No hay valores guardados.' });
        }
        res.json({ valor_final: results[0].valor_final });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
