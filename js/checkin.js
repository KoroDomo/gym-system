document.addEventListener("DOMContentLoaded", () => {
  renderModuloCheckin();
});

function renderModuloCheckin() {
  const contenedor = document.getElementById("checkin-contenido");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="card">
      <h3>Check-in de Miembro</h3>

      <label for="checkin-busqueda">Buscar miembro (nombre, apellido o cédula)</label>
      <input
        type="text"
        id="checkin-busqueda"
        placeholder="Busqueda"
        oninput="buscarMiembroCheckin()"
      />

      <div id="checkin-resultados"></div>
    </div>

    <div class="card">
      <h3>Historial de Asistencia</h3>
      <div id="checkin-historial"></div>
    </div>
  `;

  renderHistorialCheckin();
}


/* Busqueda de Miembros */
function buscarMiembroCheckin() {
  const termino = document.getElementById("checkin-busqueda").value.trim().toLowerCase();
  const contenedor = document.getElementById("checkin-resultados");

  if (!termino) {
    contenedor.innerHTML = "";
    return;
  }

  const miembros = obtenerDatos("miembros");

  const encontrados = miembros.filter(m => {
    return (
      m.nombre.toLowerCase().includes(termino) ||
      m.apellido.toLowerCase().includes(termino) ||
      m.cedula.toLowerCase().includes(termino)
    );
  });

  if (encontrados.length === 0) {
    contenedor.innerHTML = `<p class="alerta">No se encontró ningún miembro con ese criterio.</p>`;
    return;
  }

  let html = `<table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Cédula</th>
        <th>Plan</th>
        <th>Vencimiento</th>
        <th>Estado</th>
        <th>Acción</th>
      </tr>
    </thead>
    <tbody>`;

  encontrados.forEach(miembro => {
    const estado = calcularEstado(miembro.fechaVencimiento);
    const esActivo = estado === "ACTIVO";
    const claseEstado = esActivo ? "estado-activo" : "estado-vencido";
    const botonCheckin = esActivo
      ? `<button class="accion" onclick="registrarCheckin(${miembro.id})">Registrar entrada</button>`
      : `<button class="accion" disabled style="background:#ccc;cursor:not-allowed;">Membresía vencida</button>`;

    html += `
      <tr>
        <td>${miembro.nombre} ${miembro.apellido}</td>
        <td>${miembro.cedula}</td>
        <td>${miembro.plan || "—"}</td>
        <td>${miembro.fechaVencimiento || "—"}</td>
        <td><span class="${claseEstado}">${estado}</span></td>
        <td>${botonCheckin}</td>
      </tr>`;
  });

  html += `</tbody></table>`;
  contenedor.innerHTML = html;
}

/* Registrar Checking */
function registrarCheckin(miembroId) {
  const miembros = obtenerDatos("miembros");
  const asistencias = obtenerDatos("asistencias");

  const miembro = miembros.find(m => m.id === miembroId);
  if (!miembro) return;

  // Validación de estado al momento de registrar (segunda barrera)
  const estado = calcularEstado(miembro.fechaVencimiento);
  if (estado !== "ACTIVO") {
    mostrarMensajeCheckin(
      `<p class="alerta">No se puede registrar la entrada. La membresía de <strong>${miembro.nombre} ${miembro.apellido}</strong> está VENCIDA.</p>`
    );
    return;
  }

  const nuevaAsistencia = {
    id: generarId(asistencias),
    miembroId: miembro.id,
    nombre: `${miembro.nombre} ${miembro.apellido}`,
    cedula: miembro.cedula,
    fechaHora: obtenerFechaHoraCheckin()
  };

  asistencias.push(nuevaAsistencia);
  guardarDatos("asistencias", asistencias);

  // Limpiar búsqueda y resultados
  document.getElementById("checkin-busqueda").value = "";
  document.getElementById("checkin-resultados").innerHTML = "";

  mostrarMensajeCheckin(
    `<p style="color:green;font-weight:bold;">
      ✅ Entrada registrada para <strong>${miembro.nombre} ${miembro.apellido}</strong> a las ${nuevaAsistencia.fechaHora}.
    </p>`
  );

  renderHistorialCheckin();
}


/* Mensaje Notificacion */
function mostrarMensajeCheckin(html) {
  // Insertar mensaje temporal sobre la búsqueda
  let mensajeDiv = document.getElementById("checkin-mensaje-global");

  if (!mensajeDiv) {
    mensajeDiv = document.createElement("div");
    mensajeDiv.id = "checkin-mensaje-global";
    mensajeDiv.style.marginTop = "10px";

    const card = document.querySelector("#checkin-contenido .card");
    if (card) card.appendChild(mensajeDiv);
  }

  mensajeDiv.innerHTML = html;

  // Auto-ocultar el mensaje después de 4 segundos
  setTimeout(() => {
    mensajeDiv.innerHTML = "";
  }, 4000);
}


/* Historial de Asistencias */
function renderHistorialCheckin() {
  const contenedor = document.getElementById("checkin-historial");
  if (!contenedor) return;

  const asistencias = obtenerDatos("asistencias");

  if (asistencias.length === 0) {
    contenedor.innerHTML = `<p>No hay asistencias registradas todavía.</p>`;
    return;
  }

  let html = `<table>
    <thead>
      <tr>
        <th>#</th>
        <th>Nombre</th>
        <th>Cédula</th>
        <th>Fecha y hora</th>
      </tr>
    </thead>
    <tbody>`;

  asistencias
    .slice()
    .reverse()
    .forEach((asistencia, index) => {
      html += `
        <tr>
          <td>${asistencias.length - index}</td>
          <td>${asistencia.nombre}</td>
          <td>${asistencia.cedula}</td>
          <td>${asistencia.fechaHora}</td>
        </tr>`;
    });

  html += `</tbody></table>`;
  contenedor.innerHTML = html;
}



/* Utilidades Fecha y Hora */
function obtenerFechaHoraCheckin() {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, "0");
  const day = String(ahora.getDate()).padStart(2, "0");
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${horas}:${minutos}`;
}
