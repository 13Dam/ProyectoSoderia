// Detecta la página actual por el título de la página
document.addEventListener("DOMContentLoaded", async () => {
    const pageTitle = document.title;

    if (pageTitle === "Lista Clientes") {
        cargarClientes();  // Lógica para listar clientes
    } else if (pageTitle === "Agregar Clientes") {
        const clienteId = obtenerParametroUrl('id');
        await cargarBarrios();  // Cargar los barrios en el select primero
        if (clienteId) {
            await cargarClienteParaEdicion(clienteId); // Cargar datos del cliente después de cargar barrios
        }
        guardarRegistro(clienteId);  // Pasar el ID del cliente (si existe) para editar o crear
    }
});

// Función para listar clientes desde la base de datos
async function cargarClientes() {
    try {
        const response = await axios.get('http://localhost:3000/api/clientes/habilitados');
        const clientes = response.data;

        // Seleccionar el cuerpo de la tabla
        const tbody = document.getElementById('clientes-body');
        tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

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
                        <button class="btn btn-warning btn-sm mx-1 btn-editar" data-id="${cliente.IDCliente}"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-danger btn-sm mx-1" data-id="${cliente.IDCliente}"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', fila);
        });
        //Evento para deshabilitar al cliente al hacer click en el botón de basura
        const deleteButtons = document.querySelectorAll(".btn-danger");
        deleteButtons.forEach(button => {
            button.addEventListener("click", async (e) => {
                const clienteId = e.currentTarget.getAttribute("data-id");
                deshabilitarCliente(clienteId);
            });
        });
        //Evento para capturar el click en el botón de editar
        const editButtons = document.querySelectorAll(".btn-editar");
        editButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const clienteId = e.currentTarget.getAttribute("data-id");
                // Redirigir a la página de agregar clientes con el ID del cliente
                window.location.href = `agregarClientes.html?id=${clienteId}`;
            });
        });
    } catch (error) {
        console.error('Error al cargar los clientes', error);
        alert('Hubo un error al cargar los clientes');
    }
}

// Función para obtener el parámetro 'id' de la URL
function obtenerParametroUrl(nombreParametro) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombreParametro);
}

// Función para cargar los barrios en el select
async function cargarBarrios() {
    try {
        const response = await axios.get('http://localhost:3000/api/barrios');
        const barrios = response.data;
        
        const selectBarrio = document.getElementById('barrio');
        selectBarrio.innerHTML = ''; // Limpiar el select antes de cargar nuevos datos

        // Agregar opción predeterminada
        const optionDefault = document.createElement('option');
        optionDefault.value = ''; // Valor vacío
        optionDefault.text = 'Seleccione un barrio'; // Texto que se mostrará
        optionDefault.selected = true; // Marcar como seleccionado
        optionDefault.disabled = true; // Desactivar la opción predeterminada para que no se pueda seleccionar
        selectBarrio.appendChild(optionDefault);

        // Iterar sobre los barrios y crear opciones en el select
        barrios.forEach(barrio => {
            const option = document.createElement('option');
            option.value = barrio.IDBarrio;
            option.text = barrio.nombre;
            selectBarrio.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar los barrios', error);
        alert('Hubo un error al cargar los barrios');
    }
}

//Función para agregar clientes
function guardarRegistro(clienteId){
    document.querySelector("button.btn-primary").addEventListener("click", async () => {
        // Obtener los valores de los campos del formulario
        const apellido = document.getElementById("apellido").value;
        const nombre = document.getElementById("nombre").value;
        const DNI = document.getElementById("DNI").value;
        const direccion = document.getElementById("direccion").value;
        const telefono = document.getElementById("telefono").value || null; // Opcional
        const email = document.getElementById("email").value || null; // Opcional
        const barrio = document.getElementById("barrio").value;
    
        // Validar campos obligatorios
        if (!apellido || !nombre || !DNI || !direccion || !barrio) {
            alert("Por favor, completa todos los campos obligatorios");
            return;
        }
    
        // Enviar los datos al backend
        try {
            if (clienteId) {
                // Si hay clienteId, actualizar cliente existente
                await axios.put(`http://localhost:3000/api/clientes/${clienteId}`, {
                    nombre, apellido, DNI, direccion, telefono, email, IDBarrio: barrio
                });
                alert('Cliente actualizado exitosamente');
            } else {
                // Si no hay clienteId, crear nuevo cliente
                const response = await axios.post('http://localhost:3000/api/clientes', {
                    nombre: nombre,
                    apellido: apellido,
                    DNI: DNI,
                    direccion: direccion,
                    telefono: telefono,
                    email: email,
                    IDBarrio: barrio
                });
                alert('Cliente creado exitosamente');
            }
            window.location.href = 'clientes.html';// Redirigir a la página de listado
        } catch (error) {
            console.error('Error al crear el cliente', error);
            alert('Hubo un error al crear el cliente');
        }
    });
}

// Función para deshabilitar un cliente
async function deshabilitarCliente(clienteId) {
    const confirmacion = confirm("¿Estás seguro de que quieres deshabilitar este cliente?");
    if (!confirmacion) return;

    try {
        await axios.put(`http://localhost:3000/api/clientes/${clienteId}/ocultar`);
        alert('Cliente deshabilitado exitosamente');
        cargarClientes();  // Recargar la lista de clientes
    } catch (error) {
        console.error('Error al deshabilitar el cliente', error);
        alert('Hubo un error al deshabilitar el cliente');
    }
}

// Función para cargar los datos del cliente en el formulario para poder actualizar
async function cargarClienteParaEdicion(clienteId) {
    try {
        const response = await axios.get(`http://localhost:3000/api/clientes/${clienteId}`);
        const cliente = response.data;

        // Llenar los campos del formulario con los datos del cliente
        document.getElementById("apellido").value = cliente.apellido;
        document.getElementById("nombre").value = cliente.nombre;
        document.getElementById("DNI").value = cliente.DNI;
        document.getElementById("direccion").value = cliente.direccion;
        document.getElementById("telefono").value = cliente.telefono || '';
        document.getElementById("email").value = cliente.email || '';
        document.getElementById("barrio").value = cliente.IDBarrio;
    } catch (error) {
        console.error('Error al cargar los datos del cliente', error);
        alert('Hubo un error al cargar los datos del cliente');
    }
}