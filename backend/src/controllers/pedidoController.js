const db = require("../config/database");

// Obtener todos los pedidos
exports.getAllPedidos = async (req, res) => {
  try {
    const [result] = await db.promise().query(`
      SELECT Pedido.IDPedido, Pedido.fechaPedido, Pedido.estado, Pedido.descuento, 
             Cliente.nombre AS nombreCliente, 
             Producto.nombre AS nombreProducto, PedidoProducto.cantidad, PedidoProducto.precioFinal
      FROM Pedido 
      INNER JOIN Cliente ON Pedido.IDCliente = Cliente.IDCliente
      INNER JOIN PedidoProducto ON Pedido.IDPedido = PedidoProducto.IDPedido
      INNER JOIN Producto ON PedidoProducto.IDProducto = Producto.IDProducto
      ORDER BY Pedido.IDPedido ASC
    `);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los pedidos" });
  }
};
  
  // Obtener un pedido por ID
  exports.getPedidoById = async (req, res) => {
    try {
      const [result] = await db.promise().query(`
        SELECT Pedido.IDPedido, Pedido.fechaPedido, Pedido.estado, Pedido.descuento, 
              Cliente.nombre AS nombreCliente, 
              Producto.nombre AS nombreProducto, PedidoProducto.cantidad, PedidoProducto.precioFinal
        FROM Pedido 
        INNER JOIN Cliente ON Pedido.IDCliente = Cliente.IDCliente
        INNER JOIN PedidoProducto ON Pedido.IDPedido = PedidoProducto.IDPedido
        INNER JOIN Producto ON PedidoProducto.IDProducto = Producto.IDProducto
        WHERE Pedido.IDPedido = ?
      `, [req.params.id]);
      
      if (result.length === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }

      res.status(200).json(result[0]);  // Devolver el primer (y único) resultado
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el pedido" });
    }
  };
  
  // Crear un nuevo pedido
  exports.createPedido = async (req, res) => {
    try {
      const { fechaPedido, estado, descuento, IDCliente, IDPedidoRecurrente, productos } = req.body;
  
      // 1. Crear el pedido
      const [result] = await db.promise().query(`
        INSERT INTO Pedido (fechaPedido, estado, descuento, IDCliente, IDPedidoRecurrente) 
        VALUES (?, ?, ?, ?, ?)
      `, [fechaPedido, estado, descuento, IDCliente, IDPedidoRecurrente]);
  
      const nuevoIDPedido = result.insertId;
  
      // 2. Insertar productos en PedidoProducto (si existen)
      if (productos && productos.length > 0) {
        for (const producto of productos) {
          await db.promise().query(`
            INSERT INTO PedidoProducto (IDPedido, IDProducto, cantidad, precioFinal) 
            VALUES (?, ?, ?, ?)
          `, [nuevoIDPedido, producto.IDProducto, producto.cantidad, producto.cantidad * (await obtenerPrecioProducto(producto.IDProducto))]);
        }
      }
  
      res.status(201).json({ id: nuevoIDPedido, ...req.body });
  
    } catch (error) {
      res.status(500).json({ error: "Error al crear el pedido" });
    }
  };
  
  // Función auxiliar para obtener el precio de un producto
  async function obtenerPrecioProducto(IDProducto) {
    const [rows] = await db.promise().query(`
      SELECT precioUnitario FROM Producto WHERE IDProducto = ?
    `, [IDProducto]);
    return rows[0].precioUnitario;
  }
  
  // Actualizar un pedido existente
  exports.updatePedido = async (req, res) => {
    try {
      const { fechaPedido, estado, descuento, IDCliente, IDPedidoRecurrente, productos } = req.body;
  
      // 1. Actualizar el pedido principal
      const [result] = await db.promise().query(`
        UPDATE Pedido 
        SET fechaPedido = ?, estado = ?, descuento = ?, IDCliente = ?, IDPedidoRecurrente = ? 
        WHERE IDPedido = ?
      `, [fechaPedido, estado, descuento, IDCliente, IDPedidoRecurrente, req.params.id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }
  
      // 2. Si se proporcionan productos, actualizar la tabla PedidoProducto
      if (productos && productos.length > 0) {
        // Eliminar todos los productos anteriores relacionados con este pedido
        await db.promise().query(`
          DELETE FROM PedidoProducto WHERE IDPedido = ?
        `, [req.params.id]);
  
        // Insertar los nuevos productos
        productos.forEach(async (producto) => {
          await db.promise().query(`
            INSERT INTO PedidoProducto (IDPedido, IDProducto, cantidad, precioFinal) 
            VALUES (?, ?, ?, ?)
          `, [req.params.id, producto.IDProducto, producto.cantidad, producto.cantidad * (await obtenerPrecioProducto(producto.IDProducto))]);
        });
      }
  
      res.status(200).json({ id: req.params.id, ...req.body });
  
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el pedido" });
    }
  };
  
  // Eliminar un pedido
  exports.deletePedido = async (req, res) => {
    try {
      // 1. Eliminar productos relacionados con el pedido
      await db.promise().query(`
        DELETE FROM PedidoProducto WHERE IDPedido = ?
      `, [req.params.id]);
  
      // 2. Eliminar el pedido
      const [result] = await db.promise().query(`
        DELETE FROM Pedido WHERE IDPedido = ?
      `, [req.params.id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }
  
      res.status(200).json({ message: "Pedido y productos asociados eliminados correctamente" });
  
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar el pedido" });
    }
  };