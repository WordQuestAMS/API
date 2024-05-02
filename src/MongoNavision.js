const { MongoClient } = require('mongodb');
const { ConnectionPool } = require('mssql');

// MongoDB connection URI
const mongoURI = 'mongodb://root:passpj03@localhost:27017/wordQuestDB?authSource=admin';

// SQL Server connection configuration
const sqlConfig = {
  user: 'as',
  password: 'mypassword',
  server: 'OW_VENTURES\\NAVDEMO',
  port: 1433,
  database: 'Demo Database NAV (9-0)',
  options: {
    trustServerCertificate: true // if using self-signed SSL/TLS certificates
  }
};

// Async main function
async function main() {
  try {
    // Connect to MongoDB
    const mongoClient = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoClient.connect();
    const db = mongoClient.db();

    // Retrieve data from MongoDB collections
    const diccionariosData = await db.collection('Diccionarios').find({}).toArray();
    const usersData = await db.collection('users').find({}).toArray();

    // Connect to SQL Server
    const pool = new ConnectionPool(sqlConfig);
    await pool.connect();

    // Insert data into SQL Server tables
    await Promise.all([
      insertDiccionarios(diccionariosData, pool),
      insertUsers(usersData, pool)
    ]);

    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error during data migration:', error);
  }
}

// Function to insert data from Diccionarios collection into SQL Server
async function insertDiccionarios(diccionariosData, pool) {
  const request = pool.request();
  for (const doc of diccionariosData) {
    await request.query(`
      INSERT INTO Diccionarios (palabra, idioma, usos)
      VALUES ('${doc.palabra}', '${doc.idioma}', ${doc.usos})
    `);
  }
}

// Function to insert data from users collection into SQL Server
async function insertUsers(usersData, pool) {
  const request = pool.request();
  for (const user of usersData) {
    await request.query(`
      INSERT INTO Users (uuid, nickname, email, phone_number, avatar, creation_date, api_key)
      VALUES ('${user.uuid}', '${user.nickname}', '${user.email}', '${user.phone_number}', '${user.avatar}', '${user.creation_date.toISOString()}', '${user.api_key}')
    `);
  }
}

// Call the main function
main().catch(console.error);