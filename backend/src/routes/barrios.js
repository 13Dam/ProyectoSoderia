const express = require("express");
const router = express.Router();
const barrioController = require("../controllers/barrioController");

//Ruta para obtener todos los barrios
router.get('/', barrioController.getBarrios);

module.exports = router;

