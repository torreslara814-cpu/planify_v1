/* =========================================================
   semanal.js - Los 7 dias de la semana
   Cada dia tiene su cuadro de texto y todo se guarda solo.
   ========================================================= */

const DIAS = ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'];
const ICONOS = ['fa-mug-hot','fa-book','fa-pencil','fa-flask','fa-music','fa-futbol','fa-couch'];

const grilla = document.getElementById('grillaSemana');
const guardado = Datos.leer('semana', {});

function limpiar(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* Dibuja una tarjeta por dia */
grilla.innerHTML = DIAS.map((dia, i) =>
  '<article class="tarjeta-dia' + (i === 6 ? ' domingo' : '') + '">' +
    '<h3>' + dia + ' <i class="fa-solid ' + ICONOS[i] + '"></i></h3>' +
    '<textarea data-dia="' + dia + '" placeholder="Que tengo que hacer el ' + dia.toLowerCase() + '?">' +
      limpiar(guardado[dia] || '') +
    '</textarea>' +
  '</article>'
).join('');

/* Guarda cada vez que dejas de escribir en un cuadro */
grilla.querySelectorAll('textarea').forEach(caja => {
  caja.addEventListener('change', () => {
    const datos = Datos.leer('semana', {});
    datos[caja.dataset.dia] = caja.value;
    Datos.guardar('semana', datos);
    avisar('Guardado: ' + caja.dataset.dia);
  });
});

/* Nota general de la semana */
const notaSemana = document.getElementById('notaSemana');
notaSemana.value = Datos.leer('notaSemana', '');
notaSemana.addEventListener('change', () => {
  Datos.guardar('notaSemana', notaSemana.value);
});

/* Boton Guardar (guarda todo junto) */
document.getElementById('btnGuardarSemana').addEventListener('click', () => {
  const datos = {};
  grilla.querySelectorAll('textarea').forEach(c => { datos[c.dataset.dia] = c.value; });
  Datos.guardar('semana', datos);
  Datos.guardar('notaSemana', notaSemana.value);
  avisar('Semana guardada!');
});
