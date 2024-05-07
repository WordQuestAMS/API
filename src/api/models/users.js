const mongoose = require('mongoose');

// Define the schema for the users model
const userSchema = new mongoose.Schema({
  uuid: {
      type: String,
      required: true,
      unique: true
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
  creation_date: {
      type: Date,
      required: true
  },
  api_key: {
      type: String,
      required: true
  },
  games: [{
      partida_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Partida' 
      },
      score: {
          type: Number,
          required: true
      }
  }]
}, { collection: "users" });


// Compile and export the users model
module.exports = mongoose.model('Usuarios', userSchema)