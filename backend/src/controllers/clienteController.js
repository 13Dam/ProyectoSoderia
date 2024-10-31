const db = require("../config/database");

// Obtener todos los clientes visibles (ocultar = 0)
exports.getAllClientes = async (req, res) => {
  try {
    const query = `
      SELECT Cliente.IDCliente, Cliente.nombre, Cliente.apellido, Cliente.DNI, Cliente.direccion, 
             Cliente.telefono, Cliente.email, Barrio.IDBarrio, Barrio.nombre AS nombreBarrio
      FROM Cliente
      INNER JOIN Barrio ON Cliente.IDBarrio = Barrio.IDBarrio
      WHERE ocultar = 0
      ORDER BY Cliente.IDCliente ASC
    `;
    const [result] = await db.promise().query(query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los clientes" });
  }
};

// Obtener todos los clientes deshabilitados (ocultar = 1)
exports.getAllClientesOcultos = async (req, res) => {
  try {
    const query = `
      SELECT Cliente.IDCliente, Cliente.nombre, Cliente.apellido, Cliente.DNI, Cliente.direccion, 
             Cliente.telefono, Cliente.email, Barrio.IDBarrio, Barrio.nombre AS nombreBarrio
      FROM Cliente
      INNER JOIN Barrio ON Cliente.IDBarrio = Barrio.IDBarrio
      WHERE ocultar = 1
      ORDER BY Cliente.IDCliente ASC
    `;
    const [result] = await db.promise().query(query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los clientes" });
  }
};

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const query = `
      SELECT Cliente.IDCliente, Cliente.nombre, Cliente.apellido, Cliente.DNI, Cliente.direccion, 
             Cliente.telefono, Cliente.email, Barrio.IDBarrio, Barrio.nombre AS nombreBarrio
      FROM Cliente
      INNER JOIN Barrio ON Cliente.IDBarrio = Barrio.IDBarrio
      WHERE ocultar = 0 AND Cliente.IDCliente = ?
    `;
    const [result] = await db.promise().query(query, [req.params.id]);
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el cliente" });
  }
};

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
  try {
    const { nombre, apellido, DNI, direccion, telefono, email, IDBarrio } = req.body;
    const [result] = await db.promise().query(
      "INSERT INTO Cliente (nombre, apellido, DNI, direccion, telefono, email, IDBarrio) VALUES (?, ?, ?, ?, ?, ?, ?)", 
      [nombre, apellido, DNI, direccion, telefono, email, IDBarrio]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el cliente" });
  }
};

// Actualizar un cliente existente
exports.updateCliente = async (req, res) => {
  try {
    const { nombre, apellido, DNI, direccion, telefono, email, IDBarrio } = req.body;
    const [result] = await db.promise().query(
      "UPDATE Cliente SET nombre = ?, apellido = ?, DNI = ?, direccion = ?, telefono = ?, email = ?, IDBarrio = ? WHERE IDCliente = ?", 
      [nombre, apellido, DNI, direccion, telefono, email, IDBarrio, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.status(200).json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el cliente" });
  }
};

// Ocultar o deshabilitar un cliente (ocultar=1)
exports.hideCliente = async (req, res) => {
  try {
    const [result] = await db.promise().query(`
      UPDATE Cliente 
      SET ocultar = 1 
      WHERE IDCliente = ?
    `, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.status(200).json({ message: "Cliente ocultado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al ocultar el cliente" });
  }
};

// Habilitar o mostrar un cliente (ocultar = 0)
exports.showCliente = async (req, res) => {
  try {
    const [result] = await db.promise().query(`
      UPDATE Cliente 
      SET ocultar = 0 
      WHERE IDCliente = ?
    `, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.status(200).json({ message: "Cliente habilitado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al habilitar el cliente" });
  }
};
