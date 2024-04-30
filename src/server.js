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
  console.log('Usuari connectat');
 
  socket.on('TEMPS_PER_INICI', () => {
    const resposta = joc.consultaTempsRestant();
    socket.emit('TEMPS_PER_INICI', resposta);
  });

  socket.on('ALTA', (data) => {
    console.log(`Nickname: ${data.nickname}, API_KEY: ${data.apiKey}`);
    // Añadir lógica para manejar el alta en la partida
  });

  socket.on('PARAULA', (data) => {
    console.log(`Palabra recibida: ${data.split(';')[0].split('=')[1]}, API_KEY: ${data.split(';')[1].split('=')[1]}`);
    // Añadir lógica para manejar la palabra recibida
  });
  socket.onAny((event, ...args) => {
    if (event !== 'consulta temps' && event !== 'disconnect' && event !== 'connect') {
      console.log(`Comanda no reconeguda: ${event}`);
      const resposta = joc.consultaTempsRestant();
      socket.emit('TEMPS_PER_INICI', resposta);
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuari desconnectat');
    clearInterval(intervalId);  // Atura l'enviament periòdic quan l'usuari es desconnecta
  });
});

const port = process.env.PORT || 80;
server.listen(port, () => console.log(`Escoltant en el port ${port}...`));
