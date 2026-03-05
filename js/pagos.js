document.addEventListener("DOMContentLoaded", () => {
  renderModuloPagos();
});

function renderModuloPagos() {
  const contenedor = document.getElementById("pagos-contenido");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="card">
      <h3>Pagos y Renovación</h3>
      <p>Aquí el Integrante 3 agregará el registro de pagos y renovación de planes.</p>
    </div>

    <div class="card">
      <h3>Inventario y Ventas</h3>
      <p>Aquí el Integrante 3 agregará productos, ventas, control de stock y reporte por fechas.</p>
    </div>
  `;
}