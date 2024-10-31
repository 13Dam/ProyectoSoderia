const express = require("express");
const router = express.Router();
const { getAllPedidos, getPedidoById, createPedido, updatePedido, deletePedido } = require("../controllers/pedidoController");

//Rutas para gestionar pedidos
router.get("/", getAllPedidos);
router.get("/:id", getPedidoById);
router.post("/", createPedido);
router.put("/:id", updatePedido);
router.delete("/:id", deletePedido);

module.exports = router;