const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'my_app_db',
};

const connectWithRetry = () => {
    const connection = mysql.createConnection(dbConfig);

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to Db:', err);
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log('Connected to Database');
            global.db = connection;
        }
    });

    connection.on('error', (err) => {
        console.error('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connectWithRetry();
        } else {
            throw err;
        }
    });
};

connectWithRetry();

app.get('/api/users', (req, res) => {
    if (!global.db) {
        return res.status(500).json({ error: 'Database not connected yet' });
    }

    global.db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
