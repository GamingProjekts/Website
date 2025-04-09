const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'userData.json');
const KEY_FILE = path.join(__dirname, 'encryptionKey.key');
const IV_LENGTH = 16; // Initialisierungsvektor-Länge

// Verschlüsselungsschlüssel laden oder generieren
let ENCRYPTION_KEY;
if (fs.existsSync(KEY_FILE)) {
    ENCRYPTION_KEY = fs.readFileSync(KEY_FILE);
} else {
    ENCRYPTION_KEY = crypto.randomBytes(32);
    fs.writeFileSync(KEY_FILE, ENCRYPTION_KEY);
}

// Daten verschlüsseln
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Daten entschlüsseln
function decrypt(text) {
    const [iv, encryptedText] = text.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Benutzerdaten laden
function loadUserData() {
    if (!fs.existsSync(DATA_FILE)) {
        return {};
    }
    const encryptedData = fs.readFileSync(DATA_FILE, 'utf8');
    const decryptedData = decrypt(encryptedData);
    return JSON.parse(decryptedData);
}

// Benutzerdaten speichern
function saveUserData(data) {
    const jsonData = JSON.stringify(data, null, 2);
    const encryptedData = encrypt(jsonData);
    fs.writeFileSync(DATA_FILE, encryptedData, 'utf8');
}

// Benutzer registrieren
function registerUser(username, password) {
    const users = loadUserData();
    if (users[username]) {
        throw new Error('Benutzername existiert bereits!');
    }
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    users[username] = { password: hashedPassword };
    saveUserData(users);
}

// Benutzer überprüfen
function verifyUser(username, password) {
    const users = loadUserData();
    if (!users[username]) {
        return false;
    }
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    return users[username].password === hashedPassword;
}

module.exports = { registerUser, verifyUser };
