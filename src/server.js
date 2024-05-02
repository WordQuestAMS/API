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


class Joc {
  constructor(partidaDuracio, pausaDuracio, prepartidaDuracio) {
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

  actualitzarEstat() {
    const tempsActual = Date.now();
    const tempsPassatDesDeProperInici = tempsActual - this.properInici;

    if (this.enPrepartida && tempsPassatDesDeProperInici >= 0) {
      console.log('Inicio Prepartida');
      this.enPrepartida = false;
      this.enPartida = true;
      this.properInici = tempsActual + this.partidaDuracio;
      //console.log(`Partida comenzará, tiempo restante: ${this.partidaDuracio / 1000} segundos.`);
    } else if (this.enPartida && tempsPassatDesDeProperInici >= 0) {
      console.log('Fin Partida');
      this.enPartida = false;
      this.properInici = tempsActual + this.pausaDuracio;
      //console.log(`Pausa comenzará, tiempo restante: ${this.pausaDuracio / 1000} segundos.`);
    } else if (!this.enPartida && !this.enPrepartida && tempsPassatDesDeProperInici >= 0) {
      console.log('Fin Pausa');
      this.enPrepartida = true;
      this.properInici = tempsActual + this.prepartidaDuracio;
      //console.log(`Prepartida comenzará, tiempo restante: ${this.prepartidaDuracio / 1000} segundos.`);
    }
    const tempsRestant = this.properInici - tempsActual;
    //console.log(`Estado actual: ${this.enPartida ? 'En Partida' : this.enPrepartida ? 'En Prepartida' : 'En Pausa'}, Tiempo restante: ${tempsRestant / 1000} segundos.`);
  }

  consultaTempsRestant() {
    const tempsActual = Date.now();
    const tempsRestant = this.properInici - tempsActual;
    return { tempsRestant, enPartida: this.enPartida, enPrepartida: this.enPrepartida };
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
}


const joc = new Joc(60000, 60000, 10000);  // 1 minuto de juego, 1 minuto de pausa, 10 segundos de prepartida

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.emit('ESTADO_INICIAL', joc.consultaTempsRestant());

  socket.on('CONSULTA_ESTADO', () => {
    const estado = joc.consultaTempsRestant();
    socket.emit('ACTUALIZACION_ESTADO', estado);
  });

  // Manejar alta en la partida
  socket.on('ALTA', (data) => {
    console.log(`Nickname: ${data.nickname}, API_KEY: ${data.apiKey}`);
    // Aquí puedes agregar lógica para manejar la alta en la partida.
  });

  socket.on('PARAULA', (data) => {
    let palabra = data.palabra.toUpperCase();
    console.log(`Palabra recibida: ${palabra}`);
    joc.buscarPalabra(palabra, (existe) => {
      if (existe) {
        const puntuacion = puntuacionPalabra.calcularPuntuacion(palabra);
        console.log(`La palabra '${palabra}' existe y su puntuación es ${puntuacion}.`);
        socket.emit('RESULTADO_PALABRA', { palabra: palabra, existe: true, puntuacion: puntuacion });
      } else {
        console.log(`La palabra '${palabra}' no existe.`);
        socket.emit('RESULTADO_PALABRA', { palabra: palabra, existe: false });
      }
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

const port = process.env.PORT || 80;
server.listen(port, () => console.log(`Escuchando en el puerto ${port}...`));
