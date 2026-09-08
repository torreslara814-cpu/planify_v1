/* =========================================================
   pendientes.js - Tabla de tareas y trabajos practicos
   Se pueden tildar, editar y borrar.
   Ademas con los botones Columnas - + y Filas - + la tabla
   se hace mas grande o mas chica.
   ========================================================= */

/* Columnas que trae la tabla al principio */
const COLUMNAS_INICIALES = ['Fecha de entrega', 'Materia', 'Tarea', 'Completada'];

const FILAS_INICIALES = [
  { celdas: ['', 'Matematica', 'TP de funciones'], hecho: false },
  { celdas: ['', 'Lengua', 'Leer capitulo 3'], hecho: true },
  { celdas: ['', 'Modelos y Sistemas', 'Terminar la pagina web'], hecho: false },
  { celdas: ['', 'Historia', 'Resumen de la unidad 2'], hecho: false }
];

const encabezado = document.getElementById('encabezadoPendientes');
const cuerpo = document.getElementById('cuerpoPendientes');
const contador = document.getElementById('contadorPendientes');
const numeroColumnas = document.getElementById('numeroColumnas');
const numeroFilas = document.getElementById('numeroFilas');

function limpiar(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Trae las columnas guardadas */
function leerColumnas() {
  const guardadas = Datos.leer('columnasPendientes', COLUMNAS_INICIALES);
  return (Array.isArray(guardadas) && guardadas.length >= 2)
    ? guardadas
    : COLUMNAS_INICIALES.slice();
}

/* Trae las filas guardadas. Si son del formato viejo
   (fecha, materia, tarea) las acomoda al formato nuevo. */
function leerFilas() {
  const guardadas = Datos.leer('pendientes', FILAS_INICIALES);
  if (!Array.isArray(guardadas)) return FILAS_INICIALES.slice();

  return guardadas.map(f => {
    if (Array.isArray(f.celdas)) return { celdas: f.celdas, hecho: !!f.hecho };
    return { celdas: [f.fecha || '', f.materia || '', f.tarea || ''], hecho: !!f.hecho };
  });
}

/* La ultima columna (Completada) siempre es la del tilde.
   Las demas son cajitas de texto o de fecha. */
function dibujar() {
  const columnas = leerColumnas();
  const filas = leerFilas();
  const cantidadTexto = columnas.length - 1;   // columnas escribibles

  /* --- Encabezado: los titulos se pueden editar --- */
  encabezado.innerHTML = columnas.map((titulo, c) =>
    '<th><input type="text" value="' + limpiar(titulo) +
      '" data-titulo="' + c + '" aria-label="Nombre de la columna"></th>'
  ).join('') + '<th></th>';

  numeroColumnas.textContent = columnas.length;
  numeroFilas.textContent = filas.length;

  /* --- Cuerpo --- */
  if (filas.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="' + (columnas.length + 1) +
      '" style="text-align:center; padding:24px;">No tienes pendientes. Buen trabajo!</td></tr>';
    contador.textContent = '';
  } else {
    cuerpo.innerHTML = filas.map((f, i) => {
      let celdas = '';

      for (let c = 0; c < cantidadTexto; c++) {
        const valor = limpiar(f.celdas[c] || '');
        const tipo = (c === 0) ? 'date' : 'text';
        celdas += '<td><input type="' + tipo + '" value="' + valor +
                  '" data-fila="' + i + '" data-celda="' + c + '"></td>';
      }

      celdas += '<td style="text-align:center;">' +
                  '<input type="checkbox" data-tilde="' + i + '"' +
                  (f.hecho ? ' checked' : '') + '>' +
                '</td>' +
                '<td style="text-align:center;">' +
                  '<button class="icono-borrar" data-borrar="' + i + '" title="Borrar">' +
                    '<i class="fa-solid fa-trash"></i>' +
                  '</button>' +
                '</td>';

      return '<tr class="' + (f.hecho ? 'hecho' : '') + '">' + celdas + '</tr>';
    }).join('');

    const faltan = filas.filter(f => !f.hecho).length;
    contador.textContent = '(' + faltan + ' sin terminar de ' + filas.length + ')';
  }

  /* --- Escuchar los cambios --- */
  encabezado.querySelectorAll('[data-titulo]').forEach(campo => {
    campo.addEventListener('change', () => {
      const actuales = leerColumnas();
      actuales[Number(campo.dataset.titulo)] = campo.value;
      Datos.guardar('columnasPendientes', actuales);
    });
  });

  cuerpo.querySelectorAll('[data-celda]').forEach(campo => {
    campo.addEventListener('change', () => {
      const actuales = leerFilas();
      actuales[Number(campo.dataset.fila)].celdas[Number(campo.dataset.celda)] = campo.value;
      Datos.guardar('pendientes', actuales);
    });
  });

  cuerpo.querySelectorAll('[data-tilde]').forEach(campo => {
    campo.addEventListener('change', () => {
      const actuales = leerFilas();
      actuales[Number(campo.dataset.tilde)].hecho = campo.checked;
      Datos.guardar('pendientes', actuales);
      dibujar();
    });
  });

  cuerpo.querySelectorAll('[data-borrar]').forEach(boton => {
    boton.addEventListener('click', () => {
      const actuales = leerFilas();
      actuales.splice(Number(boton.dataset.borrar), 1);
      Datos.guardar('pendientes', actuales);
      dibujar();
    });
  });
}

/* ---------- Agregar y quitar filas --------------------- */
function agregarFila() {
  const columnas = leerColumnas();
  const filas = leerFilas();
  const vacias = [];
  for (let c = 0; c < columnas.length - 1; c++) vacias.push('');
  filas.push({ celdas: vacias, hecho: false });
  Datos.guardar('pendientes', filas);
  dibujar();
}

function quitarFila() {
  const filas = leerFilas();
  if (filas.length === 0) {
    avisar('Ya no queda ninguna fila');
    return;
  }
  filas.pop();
  Datos.guardar('pendientes', filas);
  dibujar();
}

/* ---------- Agregar y quitar columnas ------------------ */
function agregarColumna() {
  const columnas = leerColumnas();
  if (columnas.length >= 7) {
    avisar('Ya no entran mas columnas');
    return;
  }
  /* La nueva columna entra antes de "Completada" */
  columnas.splice(columnas.length - 1, 0, 'Columna ' + columnas.length);
  Datos.guardar('columnasPendientes', columnas);

  const filas = leerFilas();
  filas.forEach(f => f.celdas.push(''));
  Datos.guardar('pendientes', filas);
  dibujar();
}

function quitarColumna() {
  const columnas = leerColumnas();
  if (columnas.length <= 3) {
    avisar('Tienen que quedar al menos 3 columnas');
    return;
  }
  columnas.splice(columnas.length - 2, 1);
  Datos.guardar('columnasPendientes', columnas);

  const filas = leerFilas();
  filas.forEach(f => f.celdas.pop());
  Datos.guardar('pendientes', filas);
  dibujar();
}

dibujar();

document.getElementById('btnMasFila').addEventListener('click', agregarFila);
document.getElementById('btnMenosFila').addEventListener('click', quitarFila);
document.getElementById('btnMasColumna').addEventListener('click', agregarColumna);
document.getElementById('btnMenosColumna').addEventListener('click', quitarColumna);

document.getElementById('btnAgregarPend').addEventListener('click', agregarFila);

document.getElementById('btnGuardarPend').addEventListener('click', () => {
  avisar('Pendientes guardados!');
});
