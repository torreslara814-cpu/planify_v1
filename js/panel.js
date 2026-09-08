/* =========================================================
   panel.js - Pantalla de inicio con las 6 tarjetas
   Arma un resumen de lo que hay guardado en cada seccion.
   ========================================================= */

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_CORTOS = ['L','M','X','J','V','S','D'];

/* --- Saludo con el nombre del usuario ------------------- */
const usuario = Datos.leer('usuario', { nombre: 'Estudiante' });
document.getElementById('saludo').textContent = 'BIENVENIDO, ' + usuario.nombre.toUpperCase() + '!';

const hoy = new Date();
document.getElementById('fechaHoy').textContent =
  'Hoy es ' + hoy.getDate() + ' de ' + MESES[hoy.getMonth()] + ' de ' + hoy.getFullYear();

/* --- Mini calendarios: 4 meses desde el actual ---------- */
function miniMes(anio, mes) {
  const primero = new Date(anio, mes, 1);
  // getDay() da 0 para domingo; lo corremos para que la semana empiece el lunes
  let desplazamiento = (primero.getDay() + 6) % 7;
  const cantidad = new Date(anio, mes + 1, 0).getDate();

  let celdas = '';
  for (let i = 0; i < desplazamiento; i++) celdas += '<span></span>';
  for (let d = 1; d <= cantidad; d++) {
    const pasado = new Date(anio, mes, d) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    celdas += '<span style="' + (pasado ? 'opacity:.45; text-decoration:line-through;' : '') + '">' + d + '</span>';
  }

  return '<div style="background:rgba(255,255,255,.16); border-radius:10px; padding:8px 6px;">' +
           '<div style="font-size:10px; font-weight:700; text-align:center; margin-bottom:5px; letter-spacing:.5px;">' +
             MESES[mes].slice(0, 3).toUpperCase() +
           '</div>' +
           '<div style="display:grid; grid-template-columns:repeat(7,1fr); gap:1px; font-size:7px; text-align:center; line-height:1.5;">' +
             celdas +
           '</div>' +
         '</div>';
}

let htmlMeses = '';
for (let i = 0; i < 4; i++) {
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
  htmlMeses += miniMes(fecha.getFullYear(), fecha.getMonth());
}
document.getElementById('mesesMini').innerHTML = htmlMeses;

/* --- Resumen de recordatorios --------------------------- */
const recordatorios = Datos.leer('recordatorios', [
  { hora: '08:00', texto: 'Entrar al colegio' },
  { hora: '13:00', texto: 'Almuerzo' },
  { hora: '17:00', texto: 'Estudiar Modelos y Sistemas' },
  { hora: '20:00', texto: 'Preparar la mochila' }
]);

document.getElementById('resumenRecordatorios').innerHTML =
  recordatorios.slice(0, 4).map(r =>
    '<div class="fila-hora"><span class="hora">' + escapar(r.hora) + '</span>' +
    '<span style="font-size:13px;">' + escapar(r.texto || '---') + '</span></div>'
  ).join('') || '<p style="font-size:13px;">Todavia no anotaste nada.</p>';

/* --- Resumen de notas ---------------------------------- */
const notas = obtenerNotas();
document.getElementById('resumenNotas').innerHTML =
  notas.slice(0, 4).map(n =>
    '<div style="background:rgba(255,255,255,.18); border-radius:10px; padding:10px; min-height:66px;">' +
      '<strong style="font-size:13px; display:block; margin-bottom:4px;">' + escapar(n.titulo) + '</strong>' +
      '<span style="font-size:11px; opacity:.9;">' + escapar(n.texto.slice(0, 44)) + '...</span>' +
    '</div>'
  ).join('') || '<p style="font-size:13px;">Sin notas todavia.</p>';

/* --- Resumen de pendientes ----------------------------- */
const pendientes = Datos.leer('pendientes', [
  { fecha: '', materia: 'Matematica', tarea: 'TP de funciones', hecho: false },
  { fecha: '', materia: 'Lengua', tarea: 'Leer capitulo 3', hecho: true },
  { fecha: '', materia: 'Modelos', tarea: 'Terminar la web', hecho: false }
]);

document.getElementById('resumenPendientes').innerHTML =
  pendientes.slice(0, 4).map(p =>
    '<tr' + (p.hecho ? ' style="opacity:.55; text-decoration:line-through;"' : '') + '>' +
      '<td>' + escapar(p.tarea) + '</td>' +
      '<td>' + escapar(p.materia) + '</td>' +
      '<td style="text-align:center;">' +
        '<i class="fa-' + (p.hecho ? 'solid fa-square-check' : 'regular fa-square') + '"></i>' +
      '</td>' +
    '</tr>'
  ).join('') || '<tr><td colspan="3">Nada pendiente!</td></tr>';

/* Convierte texto en texto seguro (evita que se rompa el HTML) */
function escapar(texto) {
  return String(texto === undefined || texto === null ? '' : texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
