// Detecta la página actual por el título de la página
cargarClientesOcultos();  

// Función para listar clientes ocultos desde la base de datos
async function cargarClientesOcultos() {
    try {
        const response = await axios.get('http://localhost:3000/api/clientes/ocultos');
        const clientes = response.data;

        // Seleccionar el cuerpo de la tabla
        const tbody = document.getElementById('clientes-body');
        tbody.innerHTML = '';

        // Iterar sobre los clientes y agregar filas a la tabla
        clientes.forEach(cliente => {
            const fila = `
                <tr>
                    <td>${cliente.IDCliente}</td>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.apellido}</td>
                    <td>${cliente.DNI}</td>
                    <td>${cliente.direccion}</td>
                    <td>${cliente.telefono || ''}</td>
                    <td>${cliente.email || ''}</td>
                    <td>${cliente.nombreBarrio}</td>  <!-- Mostrar el nombre del barrio -->
                    <td>
                        <button class="btn btn-success btn-sm mx-1" data-id="${cliente.IDCliente}"><i class="bi bi-person-check-fill"></i></button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', fila);
        });

        // Agregar eventos a los botones de habilitación
        const habilitarButtons = document.querySelectorAll(".btn-success");
        habilitarButtons.forEach(button => {
            button.addEventListener("click", async (e) => {
                const clienteId = e.currentTarget.getAttribute("data-id");
                HabilitarCliente(clienteId);
            });
        });
    } catch (error) {
        console.error('Error al cargar los clientes', error);
        alert('Hubo un error al cargar los clientes');
    }
}

// Función para habilitar un cliente
async function HabilitarCliente(clienteId) {
    const confirmacion = confirm("¿Estás seguro de que quieres habilitar este cliente?");
    if (!confirmacion) return;

    try {
        await axios.put(`http://localhost:3000/api/clientes/${clienteId}/mostrar`);
        alert('Cliente habilitado exitosamente');
        cargarClientesOcultos();  // Recargar la lista de clientes ocultos
    } catch (error) {
        console.error('Error al habilitar el cliente', error);
        alert('Hubo un error al habilitar el cliente');
    }
}