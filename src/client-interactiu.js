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

// Conecta al servidor
const socket = io('https://roscodrom3.ieti.site');

socket.on('connect', () => {
  console.log('Conectado al servidor');
  solicitarTempsRegularmente();
});

// Gestiona la respuesta del servidor para el tiempo de inicio
socket.on('TEMPS_PER_INICI', (data) => {
  tempsRestant = `${data.tempsRestant} ms`;
  enPartida = data.enPartida ? 'Sí' : 'No';
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

// Función para solicitar el tiempo cada 10 segundos
function solicitarTempsRegularmente() {
  setInterval(() => {
    socket.emit('TEMPS_PER_INICI');
  }, 10000);
}

function mostrarMenu() {
  console.log(`\nTiempo restante para el inicio: ${tempsRestant}, En Partida: ${enPartida}`);
  console.log('Selecciona una opción:');
  console.log('1: Consultar tiempo para el inicio');
  console.log('2: Alta en la partida');
  console.log('3: Enviar palabra');
  console.log('4: Salir');

  esperantResposta = true;

  rl.question('Introduce el número de tu elección: ', (input) => {
    esperantResposta = false;
    switch (input) {
      case '1':
        socket.emit('TEMPS_PER_INICI');
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
      socket.emit('ALTA', `ALTA=${nickname};API_KEY=${apiKey}`);
      esperantResposta = false;
      mostrarMenu();
    });
  });
}

function enviarPalabra() {
  esperantResposta = true;
  rl.question('Introduce la palabra que quieres enviar: ', (palabra) => {
    rl.question('Introduce tu API_KEY: ', (apiKey) => {
      socket.emit('PALABRA', `PALABRA=${palabra};API_KEY=${apiKey}`);
      esperantResposta = false;
      mostrarMenu();
    });
  });
}
