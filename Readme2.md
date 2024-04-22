# WordQuestDB

¡Bienvenido a WordQuestDB, la base de datos diseñada para respaldar la funcionalidad del emocionante juego WordQuest! Esta base de datos está destinada a ser enlazada con una API en JavaScript para proporcionar una experiencia de juego fluida tanto para la versión de un jugador como para el multijugador en línea de WordQuest.

## Descripción del Juego

WordQuest es un juego de palabras que desafía tu habilidad para formar palabras a partir de un conjunto de letras dispuestas en un rosco. Los jugadores pueden disfrutar de la versión de un jugador para competir contra sí mismos o participar en emocionantes partidas multijugador en línea.

## Estructura de la Base de Datos

WordQuestDB está diseñada con una estructura que permite almacenar información esencial para el juego, incluyendo:

### Colecciones

1. **Diccionarios:**
   - Esta colección almacena las palabras utilizadas en el juego.
   - Cada palabra se guarda con su idioma correspondiente, un identificador único (ID) y el número de veces que ha sido utilizada en las partidas.

2. **Usuarios:**
   - Aquí se guardan los perfiles de los jugadores.
   - La información incluye la puntuación de cada jugador, su nombre, la cantidad de partidas jugadas y otros detalles relevantes.

3. **Registros de Partidas:**
   - Esta colección mantiene un registro de las partidas realizadas.
   - Contiene información sobre las partidas individuales, como los jugadores involucrados, la duración de la partida y los resultados.

4. **Historial de Acciones:**
   - Guarda un registro de las acciones realizadas durante las partidas.
   - Incluye detalles como las palabras formadas, los movimientos de los jugadores y otros eventos importantes.

## Enlace con la API en JavaScript

La base de datos WordQuestDB se integra perfectamente con una API en JavaScript que proporciona acceso y funcionalidad para el juego WordQuest. Esta API permite a los desarrolladores implementar las características del juego tanto para la versión de un jugador como para el multijugador en línea.

Para obtener más detalles sobre cómo utilizar la base de datos y la API, consulta la documentación correspondiente en los siguientes enlaces:

- [Documentación de WordQuestDB](link_to_documentation)
- [API de WordQuest en JavaScript](link_to_api)

¡Gracias por tu interés en WordQuest! Esperamos que disfrutes del juego tanto como nosotros disfrutamos creándolo.

---
