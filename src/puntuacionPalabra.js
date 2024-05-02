class PuntuacionPalabra {
    constructor() {
        this.puntuaciones = new Map([
            ['E', 13], ['A', 12], ['I', 8], ['R', 8], ['S', 8], ['N', 6],
            ['O', 5], ['T', 5], ['L', 4], ['U', 4], ['C', 3], ['D', 3], ['M', 3],
            ['B', 2], ['G', 2], ['P', 2], ['F', 4], ['V', 4], ['H', 8], ['J', 8],
            ['Q', 8], ['Z', 8], ['Ç', 10], ['X', 10], ['Y', 10]
        ]);
    }

    static obtenerInstancia() {
        if (!PuntuacionPalabra.instancia) {
            PuntuacionPalabra.instancia = new PuntuacionPalabra();
        }
        return PuntuacionPalabra.instancia;
    }

    calcularPuntuacion(palabra) {
        let puntuacionTotal = 0;
        for (let letra of palabra.toUpperCase()) {
            if (this.puntuaciones.has(letra)) {
                puntuacionTotal += this.puntuaciones.get(letra);
            }
        }
        return puntuacionTotal;
    }
}

module.exports = PuntuacionPalabra;
