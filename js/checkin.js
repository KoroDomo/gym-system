document.addEventListener("DOMContentLoaded", () => {
  renderModuloCheckin();
});

function renderModuloCheckin() {
  const contenedor = document.getElementById("checkin-contenido");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="card">
      <h3>Check-in de Miembros</h3>
      <p>Aquí el Integrante 2 agregará búsqueda, validación de membresía e historial de asistencia.</p>
    </div>
  `;
}