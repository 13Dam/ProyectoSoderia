const express = require("express");
const morgan = require("morgan");
const database = require("./config/database");
const errorHandler = require("./middlewares/errorHandler");
const cors = require('cors');

//configuración inicial
const app = express();   //instancia de servidor
const PORT = process.env.PORT || 3000;

app.use(express.json()); 
app.use(morgan("dev"));

app.use(cors());

// Importar y usar las rutas de clientes
const clientesRouter = require("./routes/clientes");
app.use("/api/clientes", clientesRouter);  // Define la ruta base para clientes
//Importar y usar ruta de barrios
const barriosRouter = require("./routes/barrios");
app.use("/api/barrios", barriosRouter);
// Importar y usar las rutas de pedidos
const pedidosRouter = require("./routes/pedidos");
app.use("/api/pedidos", pedidosRouter);
// Importar y usar las rutas de productos
const productosRouter = require("./routes/productos");
app.use("/api/productos", productosRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});

module.exports = app;

//dotenv permite crear variables de entorno o datos seguros que para guardar estos datos en algún lugar es que usamos el archivo env
