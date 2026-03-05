document.addEventListener("DOMContentLoaded", () => {
  renderModuloPagos();
});

function renderModuloPagos() {
  const contenedor = document.getElementById("pagos-contenido");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="card">
      <h3>Pagos y Renovación de Membresía</h3>

      <label for="pago-miembro">Seleccionar miembro</label>
      <select id="pago-miembro"></select>

      <label for="pago-plan">Seleccionar plan</label>
      <select id="pago-plan">
        <option value="Diario">Diario</option>
        <option value="Mensual">Mensual</option>
        <option value="Trimestral">Trimestral</option>
        <option value="Anual">Anual</option>
      </select>

      <label for="pago-monto">Monto</label>
      <input type="number" id="pago-monto" placeholder="Ingrese el monto" min="0" />

      <button class="accion" onclick="registrarPago()">Registrar pago</button>

      <div id="pago-mensaje"></div>
    </div>

    <div class="card">
      <h3>Historial de Pagos</h3>
      <div id="tabla-pagos"></div>
    </div>

    <div class="card">
      <h3>Registro de Productos</h3>

      <input type="hidden" id="producto-id" />

      <label for="producto-nombre">Nombre del producto</label>
      <input type="text" id="producto-nombre" placeholder="Ej: Agua" />

      <label for="producto-precio">Precio</label>
      <input type="number" id="producto-precio" placeholder="Ej: 50" min="0" />

      <label for="producto-stock">Cantidad en stock</label>
      <input type="number" id="producto-stock" placeholder="Ej: 20" min="0" />

      <label for="producto-stock-minimo">Stock mínimo</label>
      <input type="number" id="producto-stock-minimo" placeholder="Ej: 5" min="0" />

      <button class="accion" onclick="guardarProducto()">Guardar producto</button>
      <button class="accion" type="button" onclick="limpiarFormularioProducto()">Limpiar</button>

      <div id="producto-mensaje"></div>
    </div>

    <div class="card">
      <h3>Inventario</h3>
      <div id="tabla-productos"></div>
    </div>

    <div class="card">
      <h3>Registrar Venta</h3>

      <label for="venta-producto">Seleccionar producto</label>
      <select id="venta-producto"></select>

      <label for="venta-cantidad">Cantidad</label>
      <input type="number" id="venta-cantidad" placeholder="Ej: 1" min="1" />

      <button class="accion" onclick="registrarVenta()">Registrar venta</button>

      <div id="venta-mensaje"></div>
    </div>

    <div class="card">
      <h3>Reporte de Ventas por Fecha</h3>

      <label for="reporte-fecha-inicio">Desde</label>
      <input type="date" id="reporte-fecha-inicio" />

      <label for="reporte-fecha-fin">Hasta</label>
      <input type="date" id="reporte-fecha-fin" />

      <button class="accion" onclick="filtrarVentas()">Filtrar ventas</button>

      <div id="tabla-ventas"></div>
    </div>
  `;

  cargarMiembrosEnSelectPago();
  renderTablaPagos();
  renderSelectVentaProductos();
  renderTablaProductos();
  renderTablaVentas(obtenerDatos("ventas"));
}

/* =========================
   PAGOS / RENOVACIÓN
========================= */

function cargarMiembrosEnSelectPago() {
  const select = document.getElementById("pago-miembro");
  if (!select) return;

  const miembros = obtenerDatos("miembros");

  if (miembros.length === 0) {
    select.innerHTML = `<option value="">No hay miembros registrados</option>`;
    return;
  }

  select.innerHTML = `<option value="">Seleccione un miembro</option>`;

  miembros.forEach(miembro => {
    select.innerHTML += `
      <option value="${miembro.id}">
        ${miembro.nombre} ${miembro.apellido} - ${miembro.cedula}
      </option>
    `;
  });
}

function registrarPago() {
  const miembroId = Number(document.getElementById("pago-miembro").value);
  const plan = document.getElementById("pago-plan").value;
  const monto = Number(document.getElementById("pago-monto").value);
  const mensaje = document.getElementById("pago-mensaje");

  if (!miembroId) {
    mensaje.innerHTML = `<p class="alerta">Seleccione un miembro.</p>`;
    return;
  }

  if (!monto || monto <= 0) {
    mensaje.innerHTML = `<p class="alerta">Ingrese un monto válido.</p>`;
    return;
  }

  const miembros = obtenerDatos("miembros");
  const pagos = obtenerDatos("pagos");

  const indiceMiembro = miembros.findIndex(m => m.id === miembroId);
  if (indiceMiembro === -1) {
    mensaje.innerHTML = `<p class="alerta">El miembro no existe.</p>`;
    return;
  }

  const miembro = miembros[indiceMiembro];
  const nuevaFecha = calcularNuevaFechaVencimiento(miembro.fechaVencimiento, plan);
  const comprobante = generarComprobante();

  miembro.plan = plan;
  miembro.fechaVencimiento = nuevaFecha;

  miembros[indiceMiembro] = miembro;
  guardarDatos("miembros", miembros);

  const nuevoPago = {
    id: generarId(pagos),
    miembroId: miembro.id,
    plan: plan,
    monto: monto,
    fechaPago: obtenerFechaHoraActual(),
    comprobante: comprobante
  };

  pagos.push(nuevoPago);
  guardarDatos("pagos", pagos);

  mensaje.innerHTML = `
    <p><strong>Pago registrado correctamente.</strong></p>
    <p>Comprobante: <strong>${comprobante}</strong></p>
    <p>Nuevo vencimiento: <strong>${nuevaFecha}</strong></p>
    <p>Estado actual: <strong class="estado-activo">${calcularEstado(nuevaFecha)}</strong></p>
  `;

  document.getElementById("pago-monto").value = "";

  renderTablaPagos();
  cargarMiembrosEnSelectPago();
}

function renderTablaPagos() {
  const contenedor = document.getElementById("tabla-pagos");
  if (!contenedor) return;

  const pagos = obtenerDatos("pagos");
  const miembros = obtenerDatos("miembros");

  if (pagos.length === 0) {
    contenedor.innerHTML = `<p>No hay pagos registrados.</p>`;
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>Comprobante</th>
          <th>Miembro</th>
          <th>Plan</th>
          <th>Monto</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
  `;

  pagos
    .slice()
    .reverse()
    .forEach(pago => {
      const miembro = miembros.find(m => m.id === pago.miembroId);
      const nombreMiembro = miembro
        ? `${miembro.nombre} ${miembro.apellido}`
        : "Miembro no encontrado";

      html += `
        <tr>
          <td>${pago.comprobante}</td>
          <td>${nombreMiembro}</td>
          <td>${pago.plan}</td>
          <td>${pago.monto}</td>
          <td>${pago.fechaPago}</td>
        </tr>
      `;
    });

  html += `</tbody></table>`;
  contenedor.innerHTML = html;
}

function calcularNuevaFechaVencimiento(fechaActual, plan) {
  const hoy = new Date();
  let base = new Date();

  if (fechaActual) {
    const fechaExistente = new Date(fechaActual);
    if (!isNaN(fechaExistente.getTime()) && fechaExistente > hoy) {
      base = fechaExistente;
    } else {
      base = hoy;
    }
  } else {
    base = hoy;
  }

  switch (plan) {
    case "Diario":
      base.setDate(base.getDate() + 1);
      break;
    case "Mensual":
      base.setMonth(base.getMonth() + 1);
      break;
    case "Trimestral":
      base.setMonth(base.getMonth() + 3);
      break;
    case "Anual":
      base.setFullYear(base.getFullYear() + 1);
      break;
    default:
      base.setMonth(base.getMonth() + 1);
      break;
  }

  return formatearFecha(base);
}

function generarComprobante() {
  const random = Math.floor(Math.random() * 1000);
  return `COMP-${Date.now()}-${random}`;
}

/* =========================
   PRODUCTOS / INVENTARIO
========================= */

function guardarProducto() {
  const id = Number(document.getElementById("producto-id").value);
  const nombre = document.getElementById("producto-nombre").value.trim();
  const precio = Number(document.getElementById("producto-precio").value);
  const stock = Number(document.getElementById("producto-stock").value);
  const stockMinimo = Number(document.getElementById("producto-stock-minimo").value);
  const mensaje = document.getElementById("producto-mensaje");

  if (!nombre || precio < 0 || stock < 0 || stockMinimo < 0 || isNaN(precio) || isNaN(stock) || isNaN(stockMinimo)) {
    mensaje.innerHTML = `<p class="alerta">Complete todos los campos correctamente.</p>`;
    return;
  }

  const productos = obtenerDatos("productos");

  if (id) {
    const indice = productos.findIndex(p => p.id === id);
    if (indice !== -1) {
      productos[indice] = {
        ...productos[indice],
        nombre,
        precio,
        stock,
        stockMinimo
      };
      mensaje.innerHTML = `<p>Producto actualizado correctamente.</p>`;
    }
  } else {
    const nuevoProducto = {
      id: generarId(productos),
      nombre,
      precio,
      stock,
      stockMinimo
    };

    productos.push(nuevoProducto);
    mensaje.innerHTML = `<p>Producto registrado correctamente.</p>`;
  }

  guardarDatos("productos", productos);
  limpiarFormularioProducto();
  renderTablaProductos();
  renderSelectVentaProductos();
}

function limpiarFormularioProducto() {
  document.getElementById("producto-id").value = "";
  document.getElementById("producto-nombre").value = "";
  document.getElementById("producto-precio").value = "";
  document.getElementById("producto-stock").value = "";
  document.getElementById("producto-stock-minimo").value = "";
}

function renderTablaProductos() {
  const contenedor = document.getElementById("tabla-productos");
  if (!contenedor) return;

  const productos = obtenerDatos("productos");

  if (productos.length === 0) {
    contenedor.innerHTML = `<p>No hay productos registrados.</p>`;
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Stock mínimo</th>
          <th>Alerta</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  productos.forEach(producto => {
    const alerta =
      producto.stock <= producto.stockMinimo
        ? `<span class="alerta">Stock bajo</span>`
        : `OK`;

    html += `
      <tr>
        <td>${producto.nombre}</td>
        <td>${producto.precio}</td>
        <td>${producto.stock}</td>
        <td>${producto.stockMinimo}</td>
        <td>${alerta}</td>
        <td>
          <button class="accion" onclick="editarProducto(${producto.id})">Editar</button>
          <button class="accion" onclick="eliminarProducto(${producto.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  contenedor.innerHTML = html;
}

function editarProducto(id) {
  const productos = obtenerDatos("productos");
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  document.getElementById("producto-id").value = producto.id;
  document.getElementById("producto-nombre").value = producto.nombre;
  document.getElementById("producto-precio").value = producto.precio;
  document.getElementById("producto-stock").value = producto.stock;
  document.getElementById("producto-stock-minimo").value = producto.stockMinimo;
}

function eliminarProducto(id) {
  const productos = obtenerDatos("productos");
  const nuevasLista = productos.filter(p => p.id !== id);

  guardarDatos("productos", nuevasLista);
  renderTablaProductos();
  renderSelectVentaProductos();
}

/* =========================
   VENTAS
========================= */

function renderSelectVentaProductos() {
  const select = document.getElementById("venta-producto");
  if (!select) return;

  const productos = obtenerDatos("productos");

  if (productos.length === 0) {
    select.innerHTML = `<option value="">No hay productos registrados</option>`;
    return;
  }

  select.innerHTML = `<option value="">Seleccione un producto</option>`;

  productos.forEach(producto => {
    select.innerHTML += `
      <option value="${producto.id}">
        ${producto.nombre} (Stock: ${producto.stock})
      </option>
    `;
  });
}

function registrarVenta() {
  const productoId = Number(document.getElementById("venta-producto").value);
  const cantidad = Number(document.getElementById("venta-cantidad").value);
  const mensaje = document.getElementById("venta-mensaje");

  if (!productoId) {
    mensaje.innerHTML = `<p class="alerta">Seleccione un producto.</p>`;
    return;
  }

  if (!cantidad || cantidad <= 0) {
    mensaje.innerHTML = `<p class="alerta">Ingrese una cantidad válida.</p>`;
    return;
  }

  const productos = obtenerDatos("productos");
  const ventas = obtenerDatos("ventas");

  const indiceProducto = productos.findIndex(p => p.id === productoId);
  if (indiceProducto === -1) {
    mensaje.innerHTML = `<p class="alerta">Producto no encontrado.</p>`;
    return;
  }

  const producto = productos[indiceProducto];

  if (cantidad > producto.stock) {
    mensaje.innerHTML = `<p class="alerta">No hay suficiente stock disponible.</p>`;
    return;
  }

  producto.stock -= cantidad;
  productos[indiceProducto] = producto;
  guardarDatos("productos", productos);

  const nuevaVenta = {
    id: generarId(ventas),
    productoId: producto.id,
    cantidad: cantidad,
    total: producto.precio * cantidad,
    fechaVenta: formatearFecha(new Date())
  };

  ventas.push(nuevaVenta);
  guardarDatos("ventas", ventas);

  let alertaExtra = "";
  if (producto.stock <= producto.stockMinimo) {
    alertaExtra = `<p class="alerta">Alerta: el stock de "${producto.nombre}" está en mínimo o por debajo.</p>`;
  }

  mensaje.innerHTML = `
    <p>Venta registrada correctamente.</p>
    <p>Total: <strong>${nuevaVenta.total}</strong></p>
    ${alertaExtra}
  `;

  document.getElementById("venta-cantidad").value = "";

  renderTablaProductos();
  renderSelectVentaProductos();
  renderTablaVentas(obtenerDatos("ventas"));
}

function filtrarVentas() {
  const fechaInicio = document.getElementById("reporte-fecha-inicio").value;
  const fechaFin = document.getElementById("reporte-fecha-fin").value;

  const ventas = obtenerDatos("ventas");

  if (!fechaInicio || !fechaFin) {
    renderTablaVentas(ventas);
    return;
  }

  const filtradas = ventas.filter(v => {
    return v.fechaVenta >= fechaInicio && v.fechaVenta <= fechaFin;
  });

  renderTablaVentas(filtradas);
}

function renderTablaVentas(listaVentas) {
  const contenedor = document.getElementById("tabla-ventas");
  if (!contenedor) return;

  const productos = obtenerDatos("productos");

  if (!listaVentas || listaVentas.length === 0) {
    contenedor.innerHTML = `<p>No hay ventas para mostrar.</p>`;
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  listaVentas
    .slice()
    .reverse()
    .forEach(venta => {
      const producto = productos.find(p => p.id === venta.productoId);
      const nombreProducto = producto ? producto.nombre : "Producto eliminado";

      html += `
        <tr>
          <td>${venta.fechaVenta}</td>
          <td>${nombreProducto}</td>
          <td>${venta.cantidad}</td>
          <td>${venta.total}</td>
        </tr>
      `;
    });

  html += `</tbody></table>`;
  contenedor.innerHTML = html;
}

/* =========================
   UTILIDADES INTERNAS
========================= */

function formatearFecha(fecha) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function obtenerFechaHoraActual() {
  const ahora = new Date();
  const fecha = formatearFecha(ahora);
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  return `${fecha} ${horas}:${minutos}`;
}