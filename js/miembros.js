document.addEventListener("DOMContentLoaded", () => {
  renderModuloMiembros();
});

function renderModuloMiembros() {
  const contenedor = document.getElementById("miembros-contenido");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="card">
      <h3>Formulario de Miembro</h3>
      <p>Aquí el Integrante 1 agregará el formulario de registro, búsqueda, edición y eliminación.</p>
    </div>

    <div class="card">
      <h3>Listado de Miembros</h3>
      <p>Aquí el Integrante 1 mostrará la tabla de miembros.</p>
    </div>
  `;
}