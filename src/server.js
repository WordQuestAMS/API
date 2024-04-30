const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

class Joc {
  constructor(partidaDuracio, pausaDuracio) {
    this.partidaDuracio = partidaDuracio;
    this.pausaDuracio = pausaDuracio;
    this.properInici = Date.now() + this.pausaDuracio;  // Inicia con un periodo de pausa
    this.enPartida = false;
    this.iniciarCicle();
  }

  iniciarCicle() {
    setInterval(() => {
      if (this.enPartida) {
        this.properInici = Date.now() + this.pausaDuracio;
        this.enPartida = false;
      } else {
        this.properInici = Date.now() + this.partidaDuracio;
        this.enPartida = true;
      }
    }, this.partidaDuracio + this.pausaDuracio);
  }

  consultaTempsRestant() {
    const tempsRestant = this.properInici - Date.now();
    return { tempsRestant, enPartida: this.enPartida };
  }

  esPotUnir() {
    return !this.enPartida || (this.enPartida && this.consultaTempsRestant().tempsRestant >= this.partidaDuracio);
  }
}

const joc = new Joc(60000, 60000);  // 1 minut de partida, 1 minut de pausa

io.on('connection', (socket) => {
  console.log('Usuari connectat');

  socket.on('TEMPS_PER_INICI', () => {
    const resposta = joc.consultaTempsRestant();
    socket.emit('TEMPS_PER_INICI', resposta);
  });

  socket.on('ALTA', () => {
    if (joc.esPotUnir()) {
      // Logica para unirse a la partida
      console.log('Usuari unit a la partida');
    } else {
      console.log('Intent de unir-se a una partida ja començada');
      socket.emit('ERROR', 'La partida ja ha començat');
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

  const intervalId = setInterval(() => {
    const resposta = joc.consultaTempsRestant();
    socket.emit('TEMPS_PER_INICI', resposta);
  }, 10000);

  socket.on('disconnect', () => {
    console.log('Usuari desconnectat');
    clearInterval(intervalId);
  });
});

const port = process.env.PORT || 80;
server.listen(port, () => console.log(`Escoltant en el port ${port}...`));
