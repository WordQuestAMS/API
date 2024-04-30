const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

class Joc {
  constructor(partidaDuracio, pausaDuracio) {
    this.partidaDuracio = partidaDuracio;
    this.pausaDuracio = pausaDuracio;
    this.properInici = Date.now() + this.pausaDuracio;  // Comienza con un periodo de pausa
    this.enPartida = false;
    this.iniciarCicle();
  }

  iniciarCicle() {
    setInterval(() => {
      if (this.enPartida) {
        console.log("La partida ha terminado, 1 minuto para la siguiente partida");
        this.properInici = Date.now() + this.pausaDuracio;
        this.enPartida = false;
        io.emit('ESTAT_PARTIDA', { message: 'La partida ha terminado, 1 minuto para la siguiente partida' });
      } else {
        console.log("Comienza la partida");
        this.properInici = Date.now() + this.partidaDuracio;
        this.enPartida = true;
        io.emit('ESTAT_PARTIDA', { message: 'Comienza la partida' });
      }
    }, this.partidaDuracio + this.pausaDuracio);
  }

  consultaTempsRestant() {
    const tempsRestant = this.properInici - Date.now();
    return { tempsRestant, enPartida: this.enPartida };
  }

  esPotUnir() {
    return !this.enPartida;
  }
}

const joc = new Joc(60000, 60000);  // 1 minuto de juego, 1 minuto de pausa

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('TEMPS_PER_INICI', () => {
    const respuesta = joc.consultaTempsRestant();
    socket.emit('TEMPS_PER_INICI', respuesta);
  });

  socket.on('ALTA', (data) => {
    if (joc.esPotUnir()) {
      console.log(`Usuario unido a la partida: Nickname: ${data.nickname}, API_KEY: ${data.apiKey}`);
      // Aquí puedes añadir el usuario a la lista de jugadores, etc.
    } else {
      console.log('Intento de unirse a una partida ya comenzada');
      socket.emit('ERROR', 'La partida ya ha comenzado');
    }
  });

  // Maneja el evento 'PARAULA'
  socket.on('PARAULA', (data) => {
    // Deberías parsear la cadena para extraer correctamente la palabra y la API_KEY si es necesario
    const params = data.split(';').reduce((acc, current) => {
      const [key, value] = current.split('=');
      acc[key] = value;
      return acc;
    }, {});

    console.log(`Paraula rebuda: ${params.PALABRA}`);
    // Añadir lógica de manejo de palabras si es necesario
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

const port = process.env.PORT || 80;
server.listen(port, () => console.log(`Escuchando en el puerto ${port}...`));
