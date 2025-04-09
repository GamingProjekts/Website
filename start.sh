#!/bin/bash

echo "Starte die Website..."

# Installiere Abhängigkeiten
echo "Installiere Abhängigkeiten..."
npm install

# Starte den Server
echo "Starte den Server auf Port 3000..."
node server.js
