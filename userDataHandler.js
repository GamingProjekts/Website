const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'userData.json');

// Benutzerdaten laden
function loadUserData() {
    if (!fs.existsSync(DATA_FILE)) {
        return {};
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Benutzerdaten speichern
function saveUserData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Benutzer registrieren
function registerUser(username, password) {
    const users = loadUserData();
    if (users[username]) {
        throw new Error('Benutzername existiert bereits!');
    }
    users[username] = { password };
    saveUserData(users);
}

// Benutzer überprüfen
function verifyUser(username, password) {
    const users = loadUserData();
    return users[username] && users[username].password === password;
}

module.exports = { registerUser, verifyUser };
