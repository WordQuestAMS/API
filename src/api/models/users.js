const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

// Define the schema for the users model
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
}, {collection: "users"});


autoIncrement.initialize(mongoose.connection);
userSchema.plugin(autoIncrement.plugin, { model: 'User', field: '_id' });

// Compile and export the users model
const User = mongoose.model('Usuarios', userSchema);

module.exports = User;