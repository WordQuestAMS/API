const fs = require('fs');
const { MongoClient } = require('mongodb');

// URL de conexión a MongoDB
const url = 'mongodb://root:passpj03@localhost:27017';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Nombre de la base de datos
const dbName = 'wordQuestDB';

async function main() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos MongoDB');
    const db = client.db(dbName);
    const collection = db.collection('Diccionarios');

    // Leer el archivo palabras.txt
    const data = fs.readFileSync('./data/DISC2-LP.txt', { encoding: 'utf-8' });
    const lines = data.split('\n');
    const idioma = "Catalán"; // Idioma fijado como "Catalán"

    let idCounter = 1; // Inicia el contador de ID

    for (let line of lines) {
      const palabra = line.trim();
      if (palabra) {
        const doc = {
          _id: idCounter, // Asigna el ID actual
          palabra: palabra,
          idioma: idioma,
          uso: 0 // Inicialmente "0"
        };
        await collection.insertOne(doc);
        idCounter++; // Incrementa el contador de ID para el siguiente documento
      }
    }
  } catch (err) {
    console.error('Error al conectar o manipular MongoDB:', err);
  } finally {
    await client.close();
    console.log('Conexión cerrada');
  }
}

main();
