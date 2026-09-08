/* =========================================================
   notas.js - Crear, escribir, guardar y borrar notas
   Las notas borradas van a la Papelera con su fecha.
   ========================================================= */

let notas = obtenerNotas();
let actual = 0;

const campoTitulo = document.getElementById('tituloNota');
const campoTexto  = document.getElementById('textoNota');
const lista       = document.getElementById('listaNotas');

/* Historial simple para el boton Deshacer */
let historial = [];

function limpiar(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* --- Si vengo del buscador, abrir esa nota -------------- */
const parametros = new URLSearchParams(window.location.search);
if (parametros.has('nota')) {
  const pedida = Number(parametros.get('nota'));
  if (pedida >= 0 && pedida < notas.length) actual = pedida;
}

/* --- Dibujar la lista de la derecha -------------------- */
function dibujarLista() {
  if (notas.length === 0) {
    lista.innerHTML = '<p class="vacio">No tienes notas.</p>';
    return;
  }

  lista.innerHTML = notas.map((n, i) =>
    '<div class="item-nota' + (i === actual ? ' seleccionada' : '') + '" data-abrir="' + i + '">' +
      '<span>' + limpiar(n.titulo || 'Sin titulo') +
        '<small>' + limpiar(n.fecha || '') + '</small>' +
      '</span>' +
      '<button class="icono-borrar" data-borrar="' + i + '" title="Borrar">' +
        '<i class="fa-solid fa-trash"></i>' +
      '</button>' +
    '</div>'
  ).join('');

  lista.querySelectorAll('[data-abrir]').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('[data-borrar]')) return;   // si toco la papelera, no abro
      guardarActual(false);
      actual = Number(item.dataset.abrir);
      mostrarNota();
    });
  });

  lista.querySelectorAll('[data-borrar]').forEach(boton => {
    boton.addEventListener('click', (e) => {
      e.stopPropagation();
      mandarAPapelera(Number(boton.dataset.borrar));
    });
  });
}

/* --- Mostrar la nota elegida en el editor -------------- */
function mostrarNota() {
  if (notas.length === 0) {
    campoTitulo.value = '';
    campoTexto.value = '';
    dibujarLista();
    return;
  }
  if (actual >= notas.length) actual = notas.length - 1;

  campoTitulo.value = notas[actual].titulo || '';
  campoTexto.value  = notas[actual].texto  || '';
  dibujarLista();
}

/* --- Guardar lo que esta en el editor ------------------ */
function guardarActual(avisando) {
  if (notas.length === 0) return;
  notas[actual].titulo = campoTitulo.value || 'Sin titulo';
  notas[actual].texto  = campoTexto.value;
  notas[actual].fecha  = hoyTexto();
  Datos.guardar('notas', notas);
  if (avisando) avisar('Nota guardada');
}

/* --- Mandar una nota a la papelera -------------------- */
function mandarAPapelera(indice) {
  const nota = notas[indice];
  if (!confirm('Mandar "' + (nota.titulo || 'esta nota') + '" a la papelera?')) return;

  const papelera = Datos.leer('papelera', []);
  papelera.unshift({ titulo: nota.titulo, texto: nota.texto, borrada: hoyTexto() });
  Datos.guardar('papelera', papelera);

  notas.splice(indice, 1);
  Datos.guardar('notas', notas);

  if (actual >= notas.length) actual = Math.max(0, notas.length - 1);
  mostrarNota();
  avisar('Nota enviada a la papelera');
}

/* --- Botones de la barra de herramientas -------------- */
document.querySelectorAll('[data-tamano]').forEach(boton => {
  boton.addEventListener('click', () => {
    campoTexto.style.fontSize = boton.dataset.tamano + 'px';
  });
});

document.getElementById('btnNegrita').addEventListener('click', () => {
  campoTexto.style.fontWeight = campoTexto.style.fontWeight === '700' ? '400' : '700';
});

document.getElementById('btnCursiva').addEventListener('click', () => {
  campoTexto.style.fontStyle = campoTexto.style.fontStyle === 'italic' ? 'normal' : 'italic';
});

campoTexto.addEventListener('input', () => {
  historial.push(campoTexto.value);
  if (historial.length > 40) historial.shift();
});

document.getElementById('btnDeshacer').addEventListener('click', () => {
  if (historial.length > 1) {
    historial.pop();
    campoTexto.value = historial[historial.length - 1];
  } else {
    avisar('No hay nada para deshacer');
  }
});

document.getElementById('btnGuardarNota').addEventListener('click', () => guardarActual(true));

document.getElementById('btnBorrarNota').addEventListener('click', () => {
  if (notas.length > 0) mandarAPapelera(actual);
});

/* --- Nueva nota -------------------------------------- */
document.getElementById('btnNuevaNota').addEventListener('click', () => {
  guardarActual(false);
  notas.push({ titulo: 'Nota ' + (notas.length + 1), texto: '', fecha: hoyTexto() });
  Datos.guardar('notas', notas);
  actual = notas.length - 1;
  mostrarNota();
  campoTitulo.focus();
});

/* --- Panel "+": agrega pedacitos de texto a la nota ---- */
const botonPanel = document.getElementById('btnAbrirPanel');
const opciones   = document.getElementById('opcionesPanel');

botonPanel.addEventListener('click', () => {
  const abierto = !opciones.hidden;
  opciones.hidden = abierto;
  botonPanel.setAttribute('aria-expanded', abierto ? 'false' : 'true');
  botonPanel.classList.toggle('girado', !abierto);
});

/* Que texto pone cada botoncito del panel */
function textoParaAgregar(clase) {
  if (clase === 'titulo')   return '\n--- Subtitulo ---\n';
  if (clase === 'lista')    return '\n- \n- \n- \n';
  if (clase === 'tildes')   return '\n[ ] \n[ ] \n[ ] \n';
  if (clase === 'fecha')    return '\n' + hoyTexto() + '\n';
  if (clase === 'linea')    return '\n------------------------------\n';
  if (clase === 'estrella') return ' (importante) ';
  return '';
}

document.querySelectorAll('[data-agregar]').forEach(boton => {
  boton.addEventListener('click', () => {
    if (notas.length === 0) {
      avisar('Primero crea una nota con el boton Nueva nota');
      return;
    }

    const agregado = textoParaAgregar(boton.dataset.agregar);

    /* Lo pone donde esta el cursor */
    const desde = campoTexto.selectionStart;
    const hasta = campoTexto.selectionEnd;
    campoTexto.value = campoTexto.value.slice(0, desde) + agregado + campoTexto.value.slice(hasta);

    const nuevaPosicion = desde + agregado.length;
    campoTexto.focus();
    campoTexto.setSelectionRange(nuevaPosicion, nuevaPosicion);

    historial.push(campoTexto.value);
    guardarActual(false);
  });
});

/* Guardar tambien al salir de los campos */
campoTitulo.addEventListener('change', () => guardarActual(false));
campoTexto.addEventListener('change', () => guardarActual(false));

mostrarNota();
