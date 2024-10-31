document.addEventListener("DOMContentLoaded", async () => {
    const pageTitle = document.title;

    if (pageTitle === "Lista Pedidos") {
        cargarPedidos();
    } else if (pageTitle === "Agregar Pedidos") {
        const pedidoId = obtenerParametroUrl('id');
        if (pedidoId) {
            // Cargar los datos del cliente para edición
            await cargarPedidoParaEdicion(pedidoId);
        }
        cargarNombresClientes();
        cargarProductos();
        guardarPedido(pedidoId);
    }
});

async function cargarPedidos() {
    try {
        const response = await axios.get('http://localhost:3000/api/pedidos');
        const pedidos = response.data;
        const tbody = document.getElementById('pedidos-body');
        tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

        pedidos.forEach(pedido => {
            // Formatear la fecha del pedido
            const fechaPedido = new Date(pedido.fechaPedido).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
            const fila = `
                <tr>
                    <td>${pedido.IDPedido}</td>
                    <td>${pedido.nombreCliente}</td>
                    <td>${fechaPedido}</td>
                    <td>${pedido.nombreProducto}</td>
                    <td>${pedido.cantidad}</td>
                    <td>${pedido.descuento || '0.00'}</td>
                    <td>${pedido.precioFinal}</td>
                    <td>${pedido.estado}</td>
                    <td>
                        <button class="btn btn-warning btn-sm mx-1 btn-editar" data-id="${pedido.IDPedido}"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-danger btn-sm mx-1" data-id="${pedido.IDPedido}"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', fila);
        });
        //Eliminar pedido al hacer click en el botón de basura
        const deleteButtons = document.querySelectorAll(".btn-danger");
        deleteButtons.forEach(button => {
            button.addEventListener("click", async (e) => {
                const pedidoId = e.currentTarget.getAttribute("data-id");
                eliminarPedido(pedidoId); // Llama a la función para eliminar el pedido
            });
        });
        //Evento para capturar el click en el botón de editar
        const editButtons = document.querySelectorAll(".btn-editar");
        editButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const pedidoId = e.currentTarget.getAttribute("data-id");
                // Redirigir a la página de agregar clientes con el ID del cliente
                window.location.href = `agregarPedidos.html?id=${pedidoId}`;
            });
        });
    } catch (error) {
        console.error('Error al cargar los pedidos', error);
        alert('Hubo un error al cargar los pedidos');
    }
}

// Función para obtener el parámetro 'id' de la URL
function obtenerParametroUrl(nombreParametro) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombreParametro);
}

//Función para cargar nombres de los clientes en el select
async function cargarNombresClientes() {
    try {
        const response = await axios.get('http://localhost:3000/api/clientes/habilitados');
        const clientes = response.data;
        
        const selectNombre = document.getElementById("nombreCliente");
        selectNombre.innerHTML = ''; // Limpiar el select antes de cargar nuevos datos

        // Agregar opción predeterminada
        const optionDefault = document.createElement('option');
        optionDefault.value = ''; // Valor vacío
        optionDefault.text = 'Seleccione un cliente'; // Texto que se mostrará
        optionDefault.selected = true; // Marcar como seleccionado
        optionDefault.disabled = true; // Desactivar la opción predeterminada para que no se pueda seleccionar
        selectNombre.appendChild(optionDefault);

        // Iterar sobre los clientes y crear opciones en el select
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.IDCliente; // Usar el ID del cliente como valor
            // Concatenar nombre y apellido del cliente
            option.text = `${cliente.nombre} ${cliente.apellido}`; 
            selectNombre.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar los nombres de los clientes', error);
        alert('Hubo un error al cargar los nombres de los clientes');
    }
}

async function cargarProductos() {
    try {
        const response = await axios.get("http://localhost:3000/api/productos");
        const productos = response.data;

        const selectProducto = document.getElementById("producto");
        selectProducto.innerHTML = '';

        //Agregar opción predeterminada
        const optionDefault = document.createElement('option');
        optionDefault.value= '';
        optionDefault.text= 'Seleccione un producto';
        optionDefault.selected=true;
        optionDefault.disabled=true;
        selectProducto.appendChild(optionDefault);

        // Iterar sobre los productos y crear opciones en el select
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value= producto.IDProducto;
            option.text= producto.nombre;
            selectProducto.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar los productos', error);
        alert('Hubo un error al cargar los productos');
    }
}

async function guardarPedido(pedidoId) {
    document.querySelector("button.btn-primary").addEventListener("click", async () => {
        // Obtener los valores de los campos del formulario
        const IDCliente = document.getElementById("nombreCliente").value; // ID del cliente
        const fechaPedido = document.getElementById("fechaPedido").value; // Fecha del pedido
        const IDProducto = document.getElementById("producto").value; // ID del producto
        const cantidad = parseInt(document.getElementById("cantidad").value); // Convertir a entero
        const descuento = document.getElementById("descuento").value || 0; // Opcional, por defecto 0
        const estado = document.getElementById("estado").value; // Estado del pedido
        const precio = parseFloat(document.getElementById("precio").value); // Convertir a flotante

        // Validar campos obligatorios
        if (!IDCliente || !fechaPedido || !IDProducto || !cantidad || !estado) {
            alert("Por favor, completa todos los campos obligatorios");
            return;
        }
        // Armar el objeto de productos para enviar al backend
        const productos = [{
            IDProducto: IDProducto,
            cantidad: cantidad,
            precioFinal: cantidad * precio // Calcular precio final basado en la cantidad
        }];
        const data = {
            fechaPedido: fechaPedido,
            estado: estado,
            descuento: descuento,
            IDCliente: IDCliente,
            productos: productos
        };
        console.log("Datos enviados al backend:", data);
        if (pedidoId) {
            await actualizarPedido(pedidoId, data);
        } else {
            await crearPedido(data);
        }
        window.location.href = 'pedidos.html'; // Redirigir a la página de listado de pedidos
    });
}

async function crearPedido(data) {
    try {
        await axios.post('http://localhost:3000/api/pedidos', data);
        alert('Pedido creado exitosamente');
    } catch (error) {
        console.error('Error al crear el pedido', error);
        alert('Hubo un error al actualizar el pedido');
    }
}

async function actualizarPedido(pedidoId, data) {
    try {
        await axios.put(`http://localhost:3000/api/pedidos/${pedidoId}`, data);
        alert('Pedido actualizado exitosamente');
    } catch (error) {
        console.error('Error al actualizar el pedido', error);
        alert('Hubo un error al actualizar el pedido');
    }
}

// Enviar los datos al backend
        /* try {
            if (pedidoId) {
                // Si hay pedidoId, actualizar pedido existente
                await axios.put(`http://localhost:3000/api/pedidos/${pedidoId}`, {
                    fechaPedido,
                    estado,
                    descuento,
                    IDCliente,
                    productos 
                });
                alert('Pedido actualizado exitosamente');
            } else {
                // Si no hay pedidoId, crear nuevo pedido
                const response = await axios.post('http://localhost:3000/api/pedidos', {
                    fechaPedido: fechaPedido,
                    estado: estado,
                    descuento: descuento,
                    IDCliente: IDCliente,
                    productos: productos
                });
                alert('Pedido creado exitosamente');
            }
            window.location.href = 'pedidos.html'; 
        } catch (error) {
            console.error('Error al crear el pedido', error);
            alert('Hubo un error al crear el pedido');
        } */

// Función para cargar los datos del pedido en el formulario para poder actualizar
async function cargarPedidoParaEdicion(pedidoId) {
    try {

        const response = await axios.get(`http://localhost:3000/api/pedidos/${pedidoId}`);
        const pedido = response.data;

        // Llenar los campos del formulario con los datos del pedido
        document.getElementById("nombreCliente").value = pedido.IDCliente;
        document.getElementById("fechaPedido").value = pedido.fechaPedido.slice(0, 10); // Formato de fecha: YYYY-MM-DD
        document.getElementById("producto").value = pedido.IDProducto;
        document.getElementById("cantidad").value = pedido.cantidad;
        document.getElementById("descuento").value = pedido.descuento || 0;
        document.getElementById("estado").value = pedido.estado;
        document.getElementById("precio").value = pedido.precio;
    } catch (error) {
        console.error('Error al cargar los datos del pedido', error);
        alert('Hubo un error al cargar los datos del pedido');
    }
}

async function eliminarPedido(pedidoId) {
    try {
        await axios.delete(`http://localhost:3000/api/pedidos/${pedidoId}`);
        alert('Pedido eliminado correctamente');
        cargarPedidos();  // Recargar la lista de pedidos después de eliminar
    } catch (error) {
        console.error('Error al eliminar el pedido', error);
        alert('Hubo un error al eliminar el pedido');
    }
}