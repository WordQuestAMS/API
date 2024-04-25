const mongoose = require('mongoose');

// Define the schema for the diccionarios model
const DiccionarioSchema = new mongoose.Schema({
  palabra: {
    type: String,
    required: true,
    unique: true // Ensure each word is unique
  },
  idioma: {
    type: String,
    required: true
  },
  usos: {
    type: Number,
    default: 0
  }
},{collection: "Diccionarios"});

// Compile and export the diccionarios model
const Diccionarios = mongoose.model('Diccionarios', DiccionarioSchema);

module.exports = Diccionario;