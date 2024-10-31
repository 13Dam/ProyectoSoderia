const db = require("../config/database");

// Obtener la lista de todos los barrios
exports.getBarrios = async (req, res) => {
    try {
        const [barrios] = await db.promise().query('SELECT * FROM Barrio');
        res.json(barrios);
    } catch (error) {
        console.error('Error al obtener los barrios:', error);
        res.status(500).json({ message: 'Error al obtener los barrios' });
    }
};