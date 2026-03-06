function mostrarModulo(nombreModulo) {
  const modulos = document.querySelectorAll(".modulo");
  modulos.forEach(modulo => modulo.classList.remove("activo"));

  const moduloObjetivo = document.getElementById(`modulo-${nombreModulo}`);
  if (moduloObjetivo) {
    moduloObjetivo.classList.add("activo");
  }

  if (nombreModulo === "pagos" && typeof refrescarPagos === "function") {
    refrescarPagos();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarStorage();
  mostrarModulo("miembros");
});
