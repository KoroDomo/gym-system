function obtenerDatos(clave) {
  return JSON.parse(localStorage.getItem(clave)) || [];
}

function guardarDatos(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

function inicializarStorage() {
  const claves = ["miembros", "asistencias", "pagos", "productos", "ventas"];

  claves.forEach(clave => {
    if (!localStorage.getItem(clave)) {
      localStorage.setItem(clave, JSON.stringify([]));
    }
  });
}

function generarId(lista) {
  if (lista.length === 0) return 1;
  return Math.max(...lista.map(item => item.id)) + 1;
}

function calcularEstado(fechaVencimiento) {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);

  hoy.setHours(0, 0, 0, 0);
  vencimiento.setHours(0, 0, 0, 0);

  return vencimiento >= hoy ? "ACTIVO" : "VENCIDO";
}