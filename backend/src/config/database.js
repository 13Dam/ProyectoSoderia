const mysql = require('mysql2');
const dotenv = require("dotenv");  // Importamos el módulo dotenv para usar variables de entorno
dotenv.config();  // Configura dotenv para que funcione process.env y pueda leer las variables del archivo .env

const connection = mysql.createConnection({  ////se envía un objeto de tipo de dato "connectionConfig" que tiene propiedades como host (donde está la base de datos), database, etc
    host: "localhost",
    user: "root",
    password: "dama41349525",
    database: "dbSoderia"
});

connection.connect((err) => {
    if (err) {
      console.error('Error connecting: ' + err.stack);
      return;
    }
    console.log('Connected as id ' + connection.threadId);
});

module.exports = connection;