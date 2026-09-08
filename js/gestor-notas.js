/* =========================================================
   gestor-notas.js - Gestor de notas con buscador
   Muestra todas las notas en tarjetas que se pueden editar,
   agregar y borrar. Arriba hay un buscador con mensaje de
   error cuando la nota no existe.
   Las notas son las MISMAS que usa la pagina Notas.
   ========================================================= */

let notasGestor = obtenerNotas();
let filtro = '';

const grillaNotas = document.getElementById('grillaNotas');
const mensaje = document.getElementById('mensajeSistema');
const formBuscar = document.getElementById('formBuscarNota');
const campoBuscar = document.getElementById('campoBuscarNota');

/* Evita que un texto escrito por el usuario rompa el HTML */
function limpiarTexto(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* --- Mostrar mensajes de error o de exito --------------- */
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = 'mensaje-sistema ' + (tipo === 'error' ? 'es-error' : 'es-exito');
  mensaje.hidden = false;
}

function ocultarMensaje() {
  mensaje.hidden = true;
}

/* --- Guardar en la memoria del navegador ---------------- */
function guardarNotas() {
  Datos.guardar('notas', notasGestor);
}

/* --- Dibujar las tarjetas ------------------------------- */
function dibujarGestor() {
  const buscado = filtro.trim().toLowerCase();

  // Guardo la posicion real de cada nota para poder editarla
  const visibles = notasGestor
    .map((nota, posicion) => ({ nota: nota, posicion: posicion }))
    .filter(item => {
      if (!buscado) return true;
      const titulo = String(item.nota.titulo || '').toLowerCase();
      const texto = String(item.nota.texto || '').toLowerCase();
      return titulo.includes(buscado) || texto.includes(buscado);
    });

  if (visibles.length === 0) {
    grillaNotas.innerHTML = '<p class="vacio">' +
      (buscado ? 'Ninguna nota coincide con esa busqueda.' : 'Todavia no tienes notas. Toca "Agregar nota".') +
      '</p>';
    return;
  }

  grillaNotas.innerHTML = visibles.map(item =>
    '<article class="tarjeta-nota-editable">' +
      '<input class="titulo-nota-editable" type="text" ' +
             'value="' + limpiarTexto(item.nota.titulo) + '" ' +
             'placeholder="Titulo de la nota" ' +
             'data-titulo="' + item.posicion + '">' +
      '<textarea class="texto-nota-editable" placeholder="Escribe aqui..." ' +
                'data-texto="' + item.posicion + '">' +
        limpiarTexto(item.nota.texto) +
      '</textarea>' +
      '<div class="acciones-nota">' +
        '<span class="dato-secundario">' + limpiarTexto(item.nota.fecha || '') + '</span>' +
        '<button class="boton boton-peligro" data-borrar="' + item.posicion + '">' +
          '<i class="fa-solid fa-trash"></i> Borrar' +
        '</button>' +
      '</div>' +
    '</article>'
  ).join('');

  conectarTarjetas();
}

/* --- Hacer que las tarjetas respondan ------------------- */
function conectarTarjetas() {
  grillaNotas.querySelectorAll('[data-titulo]').forEach(campo => {
    campo.addEventListener('change', () => {
      notasGestor[campo.dataset.titulo].titulo = campo.value;
      guardarNotas();
      mostrarMensaje('Cambios guardados.', 'exito');
    });
  });

  grillaNotas.querySelectorAll('[data-texto]').forEach(campo => {
    campo.addEventListener('change', () => {
      notasGestor[campo.dataset.texto].texto = campo.value;
      guardarNotas();
      mostrarMensaje('Cambios guardados.', 'exito');
    });
  });

  grillaNotas.querySelectorAll('[data-borrar]').forEach(boton => {
    boton.addEventListener('click', () => {
      const posicion = Number(boton.dataset.borrar);
      const borrada = notasGestor[posicion];

      // La nota borrada va a la Papelera, igual que en la pagina Notas
      const papelera = Datos.leer('papelera', []);
      papelera.push({
        titulo: borrada.titulo,
        texto: borrada.texto,
        fecha: borrada.fecha || hoyTexto(),
        borrada: hoyTexto()
      });
      Datos.guardar('papelera', papelera);

      notasGestor.splice(posicion, 1);
      guardarNotas();
      dibujarGestor();
      mostrarMensaje('Nota enviada a la papelera.', 'exito');
      avisar('Nota enviada a la papelera');
    });
  });
}

/* --- Agregar una nota nueva ----------------------------- */
document.getElementById('btnAgregarNota').addEventListener('click', () => {
  notasGestor.unshift({ titulo: '', texto: '', fecha: hoyTexto() });
  guardarNotas();
  filtro = '';
  campoBuscar.value = '';
  dibujarGestor();
  ocultarMensaje();
  avisar('Nota agregada');

  const primero = grillaNotas.querySelector('.titulo-nota-editable');
  if (primero) primero.focus();
});

/* --- Buscador ------------------------------------------- */
formBuscar.addEventListener('submit', (e) => {
  e.preventDefault();
  const buscado = campoBuscar.value.trim();

  if (!buscado) {
    filtro = '';
    dibujarGestor();
    ocultarMensaje();
    return;
  }

  const encontradas = notasGestor.filter(n =>
    String(n.titulo || '').toLowerCase().includes(buscado.toLowerCase()) ||
    String(n.texto || '').toLowerCase().includes(buscado.toLowerCase())
  );

  if (encontradas.length === 0) {
    mostrarMensaje('*Error: esta nota no existe', 'error');
    filtro = buscado;
    dibujarGestor();
    return;
  }

  filtro = buscado;
  dibujarGestor();
  mostrarMensaje('Se encontraron ' + encontradas.length + ' nota(s).', 'exito');
});

document.getElementById('btnVerTodas').addEventListener('click', () => {
  filtro = '';
  campoBuscar.value = '';
  ocultarMensaje();
  dibujarGestor();
});

dibujarGestor();
