/* =========================================================
   papelera.js - Notas borradas
   Se pueden restaurar durante 15 dias. Pasado ese plazo
   aparece el aviso y ya no se puede recuperar.
   Tambien tiene su propio buscador para encontrar
   una nota borrada por el nombre.
   ========================================================= */

const DIAS_LIMITE = 15;
const contenedor = document.getElementById('listaPapelera');
const formBuscarPap = document.getElementById('formBuscarPapelera');
const campoBuscarPap = document.getElementById('campoBuscarPapelera');
const btnVerTodas = document.getElementById('btnVerTodasPapelera');
const mensajePap = document.getElementById('mensajePapelera');

/* Lo que se escribio en el buscador de la papelera */
let filtro = '';

function limpiar(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* Cuantos dias pasaron desde que se borro */
function diasPasados(fechaTexto) {
  const borrada = new Date(fechaTexto + 'T00:00:00');
  const diferencia = Date.now() - borrada.getTime();
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
}

function mostrarMensaje(texto, tipo) {
  if (!texto) {
    mensajePap.hidden = true;
    return;
  }
  mensajePap.textContent = texto;
  mensajePap.className = 'mensaje-sistema ' + (tipo === 'error' ? 'es-error' : 'es-exito');
  mensajePap.hidden = false;
}

function dibujar() {
  const papelera = Datos.leer('papelera', []);

  if (papelera.length === 0) {
    contenedor.innerHTML = '<p class="vacio">La papelera esta vacia.</p>';
    return;
  }

  /* Si hay algo escrito en el buscador, muestro solo lo que coincide.
     Me guardo el numero original de cada nota para no equivocarme
     al restaurar o eliminar. */
  const visibles = papelera
    .map((n, i) => ({ nota: n, indice: i }))
    .filter(par => filtro === '' ||
      String(par.nota.titulo || '').toLowerCase().includes(filtro));

  if (visibles.length === 0) {
    contenedor.innerHTML =
      '<p class="vacio">Ninguna nota borrada se llama asi.</p>';
    return;
  }

  contenedor.innerHTML = visibles.map(par => {
    const n = par.nota;
    const i = par.indice;
    const dias = diasPasados(n.borrada);
    const vencida = dias > DIAS_LIMITE;

    return '<article class="item-papelera' + (vencida ? ' vencida' : '') + '">' +
             '<div>' +
               '<strong>' + limpiar(n.titulo || 'Sin titulo') + '</strong>' +
               '<p class="dato-secundario">Borrada el ' + limpiar(n.borrada) +
                 ' (hace ' + dias + ' dia' + (dias === 1 ? '' : 's') + ')</p>' +
               (vencida
                 ? '<p class="aviso-vencida">Esta nota ya paso el plazo de 15 dias</p>'
                 : '') +
             '</div>' +
             '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
               (vencida
                 ? ''
                 : '<button class="boton" data-restaurar="' + i + '">' +
                     '<i class="fa-solid fa-rotate-left"></i> Restaurar</button>') +
               '<button class="boton boton-peligro" data-eliminar="' + i + '">' +
                 '<i class="fa-solid fa-trash"></i> Eliminar</button>' +
             '</div>' +
           '</article>';
  }).join('');

  contenedor.querySelectorAll('[data-restaurar]').forEach(boton => {
    boton.addEventListener('click', () => {
      const papelera = Datos.leer('papelera', []);
      const nota = papelera[Number(boton.dataset.restaurar)];

      const notas = obtenerNotas();
      notas.push({ titulo: nota.titulo, texto: nota.texto, fecha: hoyTexto() });
      Datos.guardar('notas', notas);

      papelera.splice(Number(boton.dataset.restaurar), 1);
      Datos.guardar('papelera', papelera);

      dibujar();
      avisar('Nota restaurada');
    });
  });

  contenedor.querySelectorAll('[data-eliminar]').forEach(boton => {
    boton.addEventListener('click', () => {
      if (!confirm('Eliminar esta nota para siempre?')) return;
      const papelera = Datos.leer('papelera', []);
      papelera.splice(Number(boton.dataset.eliminar), 1);
      Datos.guardar('papelera', papelera);
      dibujar();
    });
  });
}

/* ---------- Buscador propio de la papelera ------------- */
formBuscarPap.addEventListener('submit', (e) => {
  e.preventDefault();
  const buscado = campoBuscarPap.value.trim();

  if (buscado === '') {
    mostrarMensaje('*Error: Escribi el nombre de la nota que buscas', 'error');
    return;
  }

  filtro = buscado.toLowerCase();
  const papelera = Datos.leer('papelera', []);

  const encontradas = papelera.filter(n =>
    String(n.titulo || '').toLowerCase().includes(filtro)
  );

  if (encontradas.length === 0) {
    mostrarMensaje('*Error: Esta nota no existe en la papelera', 'error');
  } else {
    const vencidas = encontradas.filter(n => diasPasados(n.borrada) > DIAS_LIMITE).length;

    if (vencidas === encontradas.length) {
      mostrarMensaje('*Esta nota ya paso el plazo de 15 dias', 'error');
    } else {
      mostrarMensaje('Encontramos ' + encontradas.length +
        (encontradas.length === 1 ? ' nota borrada' : ' notas borradas'), 'exito');
    }
  }

  dibujar();
});

btnVerTodas.addEventListener('click', () => {
  filtro = '';
  campoBuscarPap.value = '';
  mostrarMensaje('', '');
  dibujar();
});

dibujar();

document.getElementById('btnVaciar').addEventListener('click', () => {
  if (!confirm('Vaciar toda la papelera? No se puede deshacer.')) return;
  Datos.guardar('papelera', []);
  filtro = '';
  campoBuscarPap.value = '';
  mostrarMensaje('', '');
  dibujar();
  avisar('Papelera vaciada');
});
