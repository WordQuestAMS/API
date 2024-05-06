const mongoose = require('mongoose');

// Define the schema for the Partidas (games) model
const partidaSchema = new mongoose.Schema({
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    players: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        score: {
            type: Number,
            required: true
        }
    }]
}, { collection: "Partidas" });

// Compile and export the Partida model
module.exports = mongoose.model('Partida', partidaSchema);
