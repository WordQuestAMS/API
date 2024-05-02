const io = require('socket.io-client');
const readline = require('readline');

// Crea una interfaz de readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let esperantResposta = false;
let tempsRestant = 'Pendiente de actualización';
let enPartida = false;
let enPrepartida = false;

// Conexión al servidor local para fines de desarrollo
const socket = io('http://127.0.0.1:3000');

socket.on('connect', () => {
  console.log('Conectado al servidor');
  solicitarEstadoRegularmente();
});

// Gestiona la respuesta del servidor con el estado actual del juego
socket.on('ACTUALIZACION_ESTADO', (data) => {
  tempsRestant = `${data.tempsRestant} ms`;
  enPartida = data.enPartida ? 'Sí' : 'No';
  enPrepartida = data.enPrepartida ? 'Sí' : 'No';
  if (!esperantResposta) {
    mostrarMenu();
  }
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
  process.exit();
});

// Gestiona errores de conexión
socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error);
});

// Función para solicitar el estado cada 10 segundos
function solicitarEstadoRegularmente() {
  setInterval(() => {
    socket.emit('CONSULTA_ESTADO');
  }, 10000);
}

function mostrarMenu() {
  console.log(`\nTiempo restante para el inicio: ${tempsRestant}, En Partida: ${enPartida}, En Prepartida: ${enPrepartida}`);
  console.log('Selecciona una opción:');
  console.log('1: Consultar estado del juego');
  console.log('2: Alta en la partida');
  console.log('3: Enviar palabra');
  console.log('4: Salir');

  esperantResposta = true;

  rl.question('Introduce el número de tu elección: ', (input) => {
    esperantResposta = false;
    switch (input) {
      case '1':
        socket.emit('CONSULTA_ESTADO');
        break;
      case '2':
        altaAPartida();
        break;
      case '3':
        enviarPalabra();
        break;
      case '4':
        console.log('Saliendo...');
        socket.disconnect();
        rl.close();
        break;
      default:
        console.log('Opción no reconocida');
        mostrarMenu();
    }
  });
}

function altaAPartida() {
  esperantResposta = true;
  rl.question('Introduce tu nickname: ', (nickname) => {
    rl.question('Introduce tu API_KEY: ', (apiKey) => {
      socket.emit('ALTA', { nickname: nickname, apiKey: apiKey });
      esperantResposta = false;
      mostrarMenu();
    });
  });
}

function enviarPalabra() {
  esperantResposta = true;
  rl.question('Introduce la palabra que quieres enviar: ', (palabra) => {
    rl.question('Introduce tu API_KEY: ', (apiKey) => {
      socket.emit('PARAULA', { palabra: palabra, apiKey: apiKey });
      
      mostrarMenu();
    });
  });
}
