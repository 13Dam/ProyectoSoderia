const db = require("../config/database");

//Obtener la lista de todos los productos
exports.getProductos = async (req, res) => {
    try {
        const [productos] = await db.promise().query('SELECT * FROM Producto');
        res.json(productos);
    } catch(error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
};