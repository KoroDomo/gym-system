let miembros = JSON.parse(localStorage.getItem("miembros")) || [];
let indiceEditando = null;

// Render principal
function renderModuloMiembros() {
    const contenedor = document.getElementById("miembros-contenido");

    contenedor.innerHTML = `
        <h3>Registrar Miembro</h3>
        <div class="form-miembro">
            <input type="text" id="nombre" placeholder="Nombre">
            <input type="text" id="apellido" placeholder="Apellido">
            <input type="text" id="cedula" placeholder="Cédula">
            <input type="text" id="plan" placeholder="Plan">
            <input type="date" id="fechaVencimiento">
            <button onclick="registrarMiembro()">Registrar</button>
        </div>

        <h3>Buscar Miembro</h3>
        <div class="form-buscar">
            <input type="text" id="buscar" placeholder="Buscar por nombre, apellido o cédula">
            <button onclick="buscarMiembro()">Buscar</button>
        </div>

        <h3>Lista de Miembros</h3>
        <div id="lista-miembros"></div>

        <!-- MODAL EDITAR -->
        <div id="modal-editar" class="modal">
            <div class="modal-contenido">
                <h3>Editar Miembro</h3>

                <input type="text" id="edit-nombre" placeholder="Nombre">
                <input type="text" id="edit-apellido" placeholder="Apellido">
                <input type="text" id="edit-plan" placeholder="Plan">
                <input type="date" id="edit-fecha">

                <div class="modal-botones">
                    <button onclick="guardarEdicion()">Guardar</button>
                    <button onclick="cerrarModal()">Cancelar</button>
                </div>
            </div>
        </div>
    `;

    listarMiembros();
}
// Guardar en localStorage
function guardarMiembros() {
    localStorage.setItem("miembros", JSON.stringify(miembros));
}

// Registrar
function registrarMiembro() {
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const cedula = document.getElementById("cedula").value.trim();
    const plan = document.getElementById("plan").value.trim();
    const fechaVencimiento = document.getElementById("fechaVencimiento").value;

    if (!nombre || !apellido || !cedula || !plan || !fechaVencimiento) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    // Validar duplicado
    if (miembros.some(m => m.cedula === cedula)) {
        alert("Ya existe un miembro con esa cédula.");
        return;
    }

    const nuevoMiembro = {
        id: generarId(miembros),
        nombre,
        apellido,
        cedula,
        plan,
        fechaVencimiento
    };

    miembros.push(nuevoMiembro);
    guardarMiembros();
    listarMiembros();
    alert("Miembro registrado correctamente.");

    document.querySelectorAll("#modulo-miembros input").forEach(i => i.value = "");
}

// Estado ACTIVO / VENCIDO
function obtenerEstado(fecha) {
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    return vencimiento >= hoy ? "ACTIVO" : "VENCIDO";
}

// Listar
function listarMiembros(lista = miembros) {
    const contenedor = document.getElementById("lista-miembros");

    if (lista.length === 0) {
        contenedor.innerHTML = "<p>No hay miembros registrados.</p>";
        return;
    }

    contenedor.innerHTML = `
        <ul class="lista-miembros">
            ${lista.map((m, index) => `
                <li class="item-miembro">
                    <span>
                        <strong>${m.nombre} ${m.apellido}</strong> |
                        Cédula: ${m.cedula} |
                        Plan: ${m.plan} |
                        Vence: ${m.fechaVencimiento} |
                        Estado: 
                        <b style="color:${obtenerEstado(m.fechaVencimiento) === 'ACTIVO' ? 'green' : 'red'}">
                            ${obtenerEstado(m.fechaVencimiento)}
                        </b>
                    </span>

                    <div class="acciones">
                        <button onclick="editarMiembro(${index})">Editar</button>
                        <button onclick="eliminarMiembro(${index})">Eliminar</button>
                    </div>
                </li>
            `).join("")}
        </ul>
    `;
}


// Buscar
function buscarMiembro() {
    const criterio = document.getElementById("buscar").value.toLowerCase();

    const resultados = miembros.filter(m =>
        m.nombre.toLowerCase().includes(criterio) ||
        m.apellido.toLowerCase().includes(criterio) ||
        m.cedula.includes(criterio)
    );

    listarMiembros(resultados);
}

// Editar
function editarMiembro(index) {

    indiceEditando = index;
    const miembro = miembros[index];

    document.getElementById("edit-nombre").value = miembro.nombre;
    document.getElementById("edit-apellido").value = miembro.apellido;
    document.getElementById("edit-plan").value = miembro.plan;
    document.getElementById("edit-fecha").value = miembro.fechaVencimiento;

    document.getElementById("modal-editar").style.display = "flex";
}


function guardarEdicion() {

    miembros[indiceEditando].nombre = document.getElementById("edit-nombre").value;
    miembros[indiceEditando].apellido = document.getElementById("edit-apellido").value;
    miembros[indiceEditando].plan = document.getElementById("edit-plan").value;
    miembros[indiceEditando].fechaVencimiento = document.getElementById("edit-fecha").value;

    guardarMiembros();
    listarMiembros();

    cerrarModal();
}

// Eliminar
function eliminarMiembro(index) {
    if (confirm("¿Seguro que deseas eliminar este miembro?")) {
        miembros.splice(index, 1);
        guardarMiembros();
        listarMiembros();
    }
}

function cerrarModal() {
    document.getElementById("modal-editar").style.display = "none";
}
// Render automático cuando se carga la página
document.addEventListener("DOMContentLoaded", renderModuloMiembros);


