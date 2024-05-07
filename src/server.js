const PuntuacionPalabra = require('./puntuacionPalabra');
const puntuacionPalabra = PuntuacionPalabra.obtenerInstancia();
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const server = http.createServer(app);
const io = new Server(server);
const axios = require('axios');


class Joc {
  constructor(partidaDuracio, pausaDuracio, prepartidaDuracio) {
    this.gameId = 0;
    this.partidaDuracio = partidaDuracio;
    this.pausaDuracio = pausaDuracio;
    this.prepartidaDuracio = prepartidaDuracio;
    this.properInici = Date.now() + this.prepartidaDuracio;
    this.enPartida = false;
    this.enPrepartida = true;
    this.iniciarCicle();
  }

  iniciarCicle() {
    this.actualitzarEstat();
    setInterval(() => {
      this.actualitzarEstat();
    }, 1000); // Actualizar cada segundo.
  }

  async actualitzarEstat() {
    const tempsActual = Date.now();
    const tempsPassatDesDeProperInici = tempsActual - this.properInici;

    if (this.enPrepartida && tempsPassatDesDeProperInici >= 0) {
      console.log('Fin Prepartida');
      this.enPrepartida = false;
      this.enPartida = true;
      this.properInici = tempsActual + this.partidaDuracio;
      /*try {
        // Call the endpoint to create a new game when a user connects to the WebSocket server
        const startGameResponse = await axios.post('https://roscodrom3.ieti.site/api/games/startGame', { gameId: this.gameId });
        const message = response.data.message;
        this.gameId = response.data.data; 
        console.log(message, this.gameId);
      } catch (error) {
        console.error('Error starting game:', error);
      }*/
      //console.log(`Partida comenzará, tiempo restante: ${this.partidaDuracio / 1000} segundos.`);
    } else if (this.enPartida && tempsPassatDesDeProperInici >= 0) {
      console.log('Fin Partida');
      this.enPartida = false;
      this.properInici = tempsActual + this.pausaDuracio;
      /*try {
        // Call the endpoint to create a new game when a user connects to the WebSocket server
        const startGameResponse = await axios.post('https://roscodrom3.ieti.site/api/games/endGame', { gameId: this.gameId });
        const message = response.data.message;
        this.gameId = response.data.data; 
        console.log(message, this.gameId);
        this.gameId = 0;
      } catch (error) {
        console.error('Error ending game:', error);
      }*/
      //console.log(`Pausa comenzará, tiempo restante: ${this.pausaDuracio / 1000} segundos.`);
    } else if (!this.enPartida && !this.enPrepartida && tempsPassatDesDeProperInici >= 0) {
      console.log('Fin Pausa');
      this.enPrepartida = true;
      this.properInici = tempsActual + this.prepartidaDuracio;
      /*try {
        // Call the endpoint to create a new game when a user connects to the WebSocket server
        const response = await axios.post('https://roscodrom3.ieti.site/api/games/newGame');
        const message = response.data.message;
        this.gameId = response.data.data; 
        console.log(message, this.gameId);
      } catch (error) {
        console.error('Error creating new game:', error);
      }*/
      //console.log(`Prepartida comenzará, tiempo restante: ${this.prepartidaDuracio / 1000} segundos.`);
    }
    const tempsRestant = this.properInici - tempsActual;
    console.log(`Estado actual: ${this.enPartida ? 'En Partida' : this.enPrepartida ? 'En Prepartida' : 'En Pausa'}, Tiempo restante: ${tempsRestant / 1000} segundos.`);
  }

  consultaTempsRestant() {
    const tempsActual = Date.now();
    const tempsRestant = this.properInici - tempsActual;

    // Calculamos el tiempo restante para la fase actual y mantenemos los otros tiempos como undefined
    return {
      enPartida: this.enPartida,
      enPrepartida: this.enPrepartida,
      enPausa: !this.enPartida && !this.enPrepartida,
      tempsEnPartida: this.enPartida ? tempsRestant : undefined,
      tempsEnPrepartida: this.enPrepartida ? tempsRestant : undefined,
      tempsEnPausa: (!this.enPartida && !this.enPrepartida) ? tempsRestant : undefined
    };
  }

  buscarPalabra(palabra, callback) {
    const rutaArchivo = path.join(__dirname, 'data', 'DISC2-LP.txt');
    let palabras = [];

    const rl = readline.createInterface({
      input: fs.createReadStream(rutaArchivo),
      output: process.stdout,
      terminal: false
    });

    rl.on('line', (line) => {
      palabras.push(line.trim()); // Añadir cada palabra a la lista
    });

    rl.on('close', () => {
      const index = this.busquedaBinaria(palabras, palabra);
      callback(index !== -1);
    });
  }

  busquedaBinaria(datos, palabra) {
    let inicio = 0;
    let fin = datos.length - 1;
    while (inicio <= fin) {
      let medio = Math.floor((inicio + fin) / 2);
      if (datos[medio] < palabra) {
        inicio = medio + 1;
      } else if (datos[medio] > palabra) {
        fin = medio - 1;
      } else {
        return medio; // Palabra encontrada
      }
    }
    return -1; // Palabra no encontrada
  }

  fetchPlayerData = async () => {
    try {
      const response = await axios.get('https://roscodrom3.ieti.site/api/games/userScore', {gameId: this.gameId});
      return response.data;
    } catch (error) {
      console.error('Error fetching player data:', error.message);
      return []; // Return an empty array if there's an error
    }
  };

  sendPlayerData = async () => {
    const players = await fetchPlayerData();
    io.emit('jugadores', players);
  };

  
}





const joc = new Joc(60000, 60000, 10000);  // 1 minuto de juego, 1 minuto de pausa, 20 segundos de prepartida

io.on('connection', (socket) => {
  console.log('Usuario conectado');


  socket.emit('ESTADO_INICIAL', joc.consultaTempsRestant());

  socket.on('CONSULTA_ESTADO', () => {
    const estado = joc.consultaTempsRestant();
    socket.emit('ACTUALIZACION_ESTADO', estado);
  });

  // Manejar alta en la partida
  socket.on('ALTA', async (data) => {
    console.log(`Nickname: ${data.nickname}, API_KEY: ${data.apiKey}`);
    try {
      // Call the endpoint to add the user to the game in MongoDB
      const altaResponse = await axios.post('https://roscodrom3.ieti.site/api/games/addUser', {
        gameId: joc.gameId, 
        nickname: data.nickname,
        apiKey: data.apiKey
      });

      // If the user is successfully added to the game, inform the client
      if (altaResponse.data.success) {
        console.log('User added to the game successfully');
        // Emit an event to inform the client about the success
        socket.emit('USER_ADDED_TO_GAME_SUCCESS', { message: 'User added to the game successfully' });
      } else {
        console.error('Failed to add user to the game');
        // Emit an event to inform the client about the failure
        socket.emit('USER_ADDED_TO_GAME_FAILURE', { message: 'Failed to add user to the game' });
      }
    } catch (error) {
      console.error('Error adding user to the game:', error);
      // Emit an event to inform the client about the error
      socket.emit('USER_ADDED_TO_GAME_ERROR', { message: 'Failed to add user to the game. Please try again later.' });
    }
  });

  socket.on('PARAULA', (data) => {
    let palabra = data.palabra.toUpperCase();
    const apiKey = data.apiKey;
    console.log(`Palabra recibida: ${palabra}`);
    joc.buscarPalabra(palabra, async (existe) => {
      if (existe) {
        const puntuacion = puntuacionPalabra.calcularPuntuacion(palabra);
        console.log(`La palabra '${palabra}' existe y su puntuación es ${puntuacion}.`);
        try {
          const response = await axios.post('https://roscodrom3.ieti.site/api/games/updateScore', {
          gameId: joc.gameId,
          apiKey: apiKey,
          score: puntuacion
        });
        } catch (error) {

        }
        socket.emit('RESULTADO_PALABRA', { palabra: palabra, existe: true, puntuacion: puntuacion });
      } else {
        console.log(`La palabra '${palabra}' no existe.`);
        socket.emit('RESULTADO_PALABRA', { palabra: palabra, existe: false, puntuacion: 0 });
      }
    });
  });
  
  socket.on('disconnect', async (data) => {
    console.log('Usuario desconectado');
    try {
      // Call the endpoint to remove the user from the game in MongoDB if the game is in the pregame state
      const removeUserResponse = await axios.post('https://roscodrom3.ieti.site/api/games/removeUser', {
        apiKey: data.apiKey,
        gameId: joc.gameId
      });

      // If the user is successfully removed from the game, inform the client
      if (removeUserResponse.data.success) {
        console.log('User removed from the game successfully');
        // Emit an event to inform the client about the success
        socket.emit('USER_REMOVED_FROM_GAME_SUCCESS', { message: 'User removed from the game successfully' });
      } else {
        console.error('Failed to remove user from the game');
        // Emit an event to inform the client about the failure
        socket.emit('USER_REMOVED_FROM_GAME_FAILURE', { message: 'Failed to remove user from the game' });
      }
    } catch (error) {
      console.error('Error removing user from the game:', error);
      // Emit an event to inform the client about the error
      socket.emit('USER_REMOVED_FROM_GAME_ERROR', { message: 'Failed to remove user from the game. Please try again later.' });
    }
  });
});

const port = process.env.PORT || 80;
server.listen(port, () => console.log(`Escuchando en el puerto ${port}...`));
