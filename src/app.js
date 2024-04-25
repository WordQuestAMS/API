const express = require('express');
const mongoose = require('mongoose');
const dbConfig = require('./config/db');
const userRoutes = require('./api/routes/userRoutes');
const Event = require('./api/models/event');
const Diccionarios = require('./api/models/diccionarios')
const Users = require('./api/models/users')
const app = express();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

app.use(express.json());
app.set('json spaces', 2);

mongoose.connect(dbConfig.MONGODB_URI).then(() => console.log("Connectat a MongoDB"))
  .catch(err => console.error("No s'ha pogut connectar a MongoDB", err));

app.get('/api/bienvenida', (req, res) => {
  res.json({ status: "Bienvenido al servidor" });
});

app.use('/api', userRoutes);

app.post('/api/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).send(event);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send("L'esdeveniment no s'ha trobat.");
    }
    res.send(event);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/user/register', async (req, res) => {
  try {
    const { name, email, phone_number, avatar } = req.body;

    // Validate input parameters
    if (!name || !email || !phone_number || !avatar) {
      return res.status(400).json({ status: 'ERROR', message: 'Missing input parameters' });
    }

    // Generate UUID for the user
    const uuidValue = uuidv4();

    function generateApiKey(length = 64) {
      return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }
    const apiKey = generateApiKey(64);

    console.log("Uuid: " + uuidValue, "ApiKey: " + apiKey);

    // Create new user object using the User model
    const newUser = new Users({
      
      id: uuidValue,
      nickname: name,
      email,
      phone_number,
      avatar,
      api_key: apiKey
    });

    // Save user to MongoDB collection
    await newUser.save();

    return res.status(201).json({ status: 'OK', message: 'User registered', data: { api_key: apiKey } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'ERROR', message: 'User could not be registered' });
  }
});


app.post('/api/dictionary/browse', async (req, res) => {
  try {
    // Directly fetch the first 10 entries from the Diccionario collection
    const words = await Diccionarios.find().limit(10);

    // Log fetched words to console for debugging
    console.log(words);

    // Format words into desired response format
    const formattedWords = words.map(word => ({
      palabra: word.palabra,
      idioma: word.idioma,
      uso: word.uso
    }));

    // Log formatted words to console for debugging
    console.log(formattedWords);

    // Return a successful response with the formatted data
    return res.status(200).json({ status: 'OK', message: 'Dictionary data obtained successfully', data: formattedWords });
  } catch (error) {
    // Log the error to console and return an error response
    console.error(error);
    return res.status(500).json({ status: 'ERROR', message: 'Dictionary data could not be obtained' });
  }
});



module.exports = app;
