package cat.iesesteveterradas.exemples;

import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoCollection;
import org.bson.Document;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashMap;
import java.util.Map;

public class QueryDicc {
    public static void main(String[] args) {
        try (var mongoClient = MongoClients.create("mongodb://root:passpj03@localhost:27017")) {
            MongoDatabase database = mongoClient.getDatabase("wordQuestDB");
            MongoCollection<Document> wordCollection = database.getCollection("diccionarios");

            // Definir el idioma (puedes cambiarlo según tus necesidades)
            String language = "Catalan";

            // Leer el archivo de texto
            String filePath = "data/info/DISC2-LP.txt";
            Map<Integer, String> wordMap = readWordsFromFile(filePath);

            // Insertar las palabras en la colección de MongoDB
            for (Map.Entry<Integer, String> entry : wordMap.entrySet()) {
                Document wordDocument = new Document();
                wordDocument.append("_id", entry.getKey())
                            .append("palabra", entry.getValue())
                            .append("idioma", language)
                            .append("usos", 0);
                wordCollection.insertOne(wordDocument);
            }
            System.out.println("-"+20);
            System.out.println("-----Palabras insertadas correctamente-----");
            System.out.println("-"+20);

        } catch (Exception e) {
            System.err.println("Se produjo un error: " + e.getMessage());
        }
    }

    // Método para leer las palabras desde un archivo de texto
    private static Map<Integer, String> readWordsFromFile(String filePath) {
        Map<Integer, String> wordMap = new HashMap<>();
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            int id = 1;
            while ((line = br.readLine()) != null) {
                wordMap.put(id++, line.trim());
            }
        } catch (Exception e) {
            System.err.println("Error al leer el archivo: " + e.getMessage());
        }
        return wordMap;
    }
}
