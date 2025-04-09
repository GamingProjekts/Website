const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { registerUser, verifyUser } = require('./userDataHandler');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Registrierung
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send({ message: 'Benutzername und Passwort sind erforderlich!' });
    }
    try {
        registerUser(username, password);
        res.status(201).send({ message: 'Registrierung erfolgreich!' });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (verifyUser(username, password)) {
        res.status(200).send({ message: 'Login erfolgreich!' });
    } else {
        res.status(401).send({ message: 'Ungültige Anmeldedaten!' });
    }
});

// Starte den Server
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
