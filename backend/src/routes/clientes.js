const express = require("express");
const router = express.Router();
const { getAllClientes, getAllClientesOcultos, getClienteById, createCliente, updateCliente, hideCliente, showCliente } = require("../controllers/clienteController");

// Rutas para gestionar clientes
router.get("/habilitados", getAllClientes);  // Obtener todos los clientes habilitados
router.get("/ocultos", getAllClientesOcultos);  // Obtener todos los clientes deshabilitados
router.get("/:id", getClienteById);  // Obtener un cliente por ID
router.post("/", createCliente);  // Crear un nuevo cliente
router.put("/:id", updateCliente);  // Actualizar un cliente existente
router.put("/:id/ocultar", hideCliente);  // Deshabilitar un cliente (ocultar)
router.put("/:id/mostrar", showCliente);  // Habilitar un cliente

module.exports = router;