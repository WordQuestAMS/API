const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

class Joc {
  constructor(partidaDuracio, pausaDuracio) {
    this.partidaDuracio = partidaDuracio;
    this.pausaDuracio = pausaDuracio;
    this.properInici = Date.now() + this.partidaDuracio + this.pausaDuracio;
    this.enPartida = false;
    this.iniciarCicle();
  }

  iniciarCicle() {
    setInterval(() => {
      if (this.enPartida) {
        this.properInici = Date.now() + this.pausaDuracio;
        this.enPartida = false;
      } else {
        this.properInici = Date.now() + this.partidaDuracio + this.pausaDuracio;
        this.enPartida = true;
      }
    }, this.partidaDuracio + this.pausaDuracio);
  }

  consultaTempsRestant() {
    const tempsRestant = this.properInici - Date.now();
    return { tempsRestant, enPartida: this.enPartida };
  }
}

const joc = new Joc(60000, 60000);  // 1 minut de partida, 1 minut de pausa
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
server.listen(port, () => console.log(`Escoltant en el port ${port}...`));
