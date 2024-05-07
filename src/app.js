const express = require('express');
const mongoose = require('mongoose');
const dbConfig = require('./config/db');
const Event = require('./api/models/event');
const Diccionarios = require('./api/models/diccionarios')
const Users = require('./api/models/users')
const Partidas = require('./api/models/partidas')
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
    Console.log("Ha llegado aqui 1");
    // Validate input parameters
    if (!name || !email || !phone_number || !avatar) {
      return res.status(400).json({ status: 'ERROR', message: 'Missing input parameters' });
    }
    Console.log("Ha llegado aqui 2");
    // Generate UUID for the user
    const uuidValue = uuidv4();

    function generateApiKey(length = 64) {
      return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }
    const apiKey = generateApiKey(64);

    console.log("Uuid: " + uuidValue, "ApiKey: " + apiKey);

    const currentDate = new Date();

    // Create new user object using the User model
    const newUser = new Users({
      
      uuid: uuidValue,
      nickname: name,
      email,
      phone_number,
      avatar,
      creation_date: currentDate,
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
    const { initial, pageNumber, language } = req.body;

    // Validate input parameters
    if (!initial || !pageNumber || !language) {
      return res.status(400).json({ status: 'ERROR', message: 'Missing input parameters' });
    }

    // Calculate skip value based on pageNumber
    const skip = (pageNumber - 1) * 10;

    // Query to fetch words from the diccionarios collection
    const words = await Diccionarios.find({
      palabra: { $regex: `^${initial}`, $options: 'i' }, // Case insensitive match for initial letter
      idioma: language // Filter by language
    }).skip(skip).limit(10); // Pagination

    console.log(words);

    // Format words into desired response format
    const formattedWords = words.map(word => ({
      palabra: word.palabra,
      idioma: word.idioma,
      uso: word.uso
    }));

    console.log(formattedWords);

    return res.status(200).json({ status: 'OK', message: 'Dictionary data obtained successfully', data: formattedWords});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'ERROR', message: 'Dictionary data could not be obtained' });
  }
});


app.post('/api/games/newGame', async (req, res) => {
  try {
    // Create a new game entry
    const newPartida = new Partidas({
      start_time: null, 
      end_time: null, 
      players: [] 
    });

    // Save the new game entry to the database
    await newPartida.save();

    res.status(201).json({ message: 'New game created successfully', data: newPartida._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create game' });
  }
});


app.post('/api/games/startGame', async (req, res) => {
  try {
    // Check if any users have joined during the pre-game status
    const gameId = req.body.gameId;
    const game = await Partidas.findById(gameId);

    if (!game.players.length) {
      // No users have joined, delete the game from the database
      await Game.findByIdAndDelete(gameId);
      return res.status(200).json({ message: 'No users joined the game. Game deleted.' });
    }

    // Users have joined, update the game start datetime
    game.start_time = new Date();
    await game.save();

    res.status(200).json({ message: 'Game started successfully', gameId: gameId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to start game' });
  }
});


app.post('/api/games/endGame', async (req, res) => {
  try {
    const gameId = req.body.gameId;
    const game = await Partidas.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.end_time) {
      return res.status(400).json({ message: 'Game has already ended' });
    }

    game.end_time = new Date();
    await game.save();

    res.status(200).json({ message: 'Game ended successfully', gameId: gameId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to end game' });
  }
});


app.post('/api/games/addUser', async (req, res) => {
  try {
    const { gameId, nickname, apiKey } = req.body;

    // Search for the user using the apiKey
    const user = await User.findOne({ api_key: apiKey });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the game exists
    const game = await Partidas.findById(gameId);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    // Add the user to the game's players list
    game.players.push({ user_id: user._id, score: 0 });
    await game.save();

    // Add the game to the user's games list
    user.games.push({ partida_id: game._id, score: 0 });
    await user.save();

    return res.status(200).json({ success: true, message: 'User added to the game successfully' });
  } catch (error) {
    console.error('Error adding user to the game:', error);
    return res.status(500).json({ success: false, message: 'Failed to add user to the game. Please try again later.' });
  }
});


app.post('/api/games/removeUser', async (req, res) => {
  try {
    const { gameId, apiKey } = req.body;

    // Search for the user using the apiKey
    const user = await User.findOne({ api_key: apiKey });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the game exists
    const game = await Partidas.findById(gameId);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    // Remove the user from the game's players list
    game.players = game.players.filter(player => !player.user_id.equals(user._id));
    await game.save();

    // Remove the game from the user's games list
    user.games = user.games.filter(game => !game.partida_id.equals(gameId));
    await user.save();

    return res.status(200).json({ success: true, message: 'User removed from the game successfully' });
  } catch (error) {
    console.error('Error removing user from the game:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove user from the game. Please try again later.' });
  }
});


app.post('/api/games/updateScore', async (req, res) => {
  try {
    const { gameId, apiKey, score } = req.body;

    // Search for the user using the apiKey
    const user = await User.findOne({ api_key: apiKey });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the game exists
    const game = await Partidas.findById(gameId);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    // Find the corresponding player in the game's players list
    const playerIndex = game.players.findIndex(player => player.user_id.equals(user._id));
    if (playerIndex === -1) {
      return res.status(404).json({ success: false, message: 'User is not part of the game' });
    }

    // Update the score of the corresponding player in the game
    game.players[playerIndex].score = score;
    await game.save();

    // Update the score of the user in their games list
    const userGameIndex = user.games.findIndex(game => game.partida_id.equals(gameId));
    if (userGameIndex !== -1) {
      user.games[userGameIndex].score = score;
      await user.save();
    }

    return res.status(200).json({ success: true, message: 'Score updated successfully' });
  } catch (error) {
    console.error('Error updating score:', error);
    return res.status(500).json({ success: false, message: 'Failed to update score. Please try again later.' });
  }
});


app.get('/api/games/userScore', async (req, res) => {
  try {
    const currentGameId = 'CURRENT_GAME_ID';
    
    // Find all users who participated in the current game
    const users = await User.find({ 'Partidas.partida_id': currentGameId });
    
    // Calculate total score for each user
    const userScores = users.map(user => ({
      userId: user._id,
      nombre: user.nickname,
      puntos: user.games.find(game => Partidas.partida_id.toString() === currentGameId).score
    }));

    res.status(200).json(userScores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user scores' });
  }
});

module.exports = app;
