const express = require('express');
const mongoose = require('mongoose');
const dbConfig = require('./config/db');
const userRoutes = require('./api/routes/userRoutes');
const Event = require('./api/models/event');
const Diccionarios = require('./api/models/diccionarios')
const app = express();

app.use(express.json());
app.set('json spaces', 2);

mongoose.connect(dbConfig.MONGODB_URI).then(() => console.log("Connectat a MongoDB"))
  .catch(err => console.error("No s'ha pogut connectar a MongoDB", err));

const userSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  api_key: {
    type: String,
    required: true
  }
});

const User = mongoose.model('Usuarios', userSchema);


app.get('/api/health', (req, res) => {
  res.json({ status: "OK" });
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

    // Decode base64 avatar to save as image
    const avatarPath = base64Img.imgSync(avatar, './avatars', uuid.v4());

    // Generate UUID for the user
    const uuidValue = uuid.v4();

    // Generate API Key
    const apiKey = bcrypt.hashSync(uuid.v4(), 10);

    // Create new user object using the User model
    const newUser = new User({
      uuid: uuidValue,
      nickname: name,
      email,
      phone_number,
      avatar: avatarPath,
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
