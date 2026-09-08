/* =========================================================
   compartir.js - Compartidos
   Sirve para agregar personas por telefono o por gmail,
   sacar un enlace para pasarle a otros y tocar "Listo".
   ========================================================= */

const formInvitar = document.getElementById('formInvitar');
const campoPersona = document.getElementById('campoPersona');
const tipoPermiso = document.getElementById('tipoPermiso');
const listaPersonas = document.getElementById('listaPersonas');
const mensaje = document.getElementById('mensajeCompartir');
const campoEnlace = document.getElementById('campoEnlace');

/* Personas que ya estan invitadas al empezar (ejemplo) */
const PERSONAS_INICIALES = [
  { dato: 'sofia.gomez@gmail.com', tipo: 'gmail', permiso: 'Puede editar' },
  { dato: '3514567890', tipo: 'telefono', permiso: 'Puede ver' }
];

function limpiar(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Muestra un cartelito arriba de la lista */
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = 'mensaje-sistema ' + (tipo === 'error' ? 'es-error' : 'es-exito');
  mensaje.hidden = false;
}

/* Decide si lo que escribieron es un gmail, un telefono o nada */
function reconocer(texto) {
  const limpio = texto.trim();

  if (/^[^@\s]+@gmail\.com$/i.test(limpio)) return 'gmail';
  if (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(limpio)) return 'correo';

  const soloNumeros = limpio.replace(/[\s()+-]/g, '');
  if (/^\d{8,15}$/.test(soloNumeros)) return 'telefono';

  return '';
}

/* Dibuja la lista de personas invitadas */
function dibujar() {
  const personas = Datos.leer('compartidos', PERSONAS_INICIALES);

  if (personas.length === 0) {
    listaPersonas.innerHTML =
      '<li class="persona-invitada"><div class="datos-persona">' +
      '<span>Todavia no compartiste con nadie.</span></div></li>';
    return;
  }

  listaPersonas.innerHTML = personas.map((p, i) => {
    const inicial = String(p.dato || '?').charAt(0).toUpperCase();
    const icono = (p.tipo === 'telefono') ? 'fa-solid fa-phone' : 'fa-regular fa-envelope';

    return '<li class="persona-invitada">' +
             '<span class="circulo-inicial">' + limpiar(inicial) + '</span>' +
             '<span class="datos-persona">' +
               '<strong>' + limpiar(p.dato) + '</strong>' +
               '<span><i class="' + icono + '"></i> ' + limpiar(p.permiso) + '</span>' +
             '</span>' +
             '<button class="icono-borrar" data-quitar="' + i + '" title="Quitar a esta persona">' +
               '<i class="fa-solid fa-xmark"></i>' +
             '</button>' +
           '</li>';
  }).join('');

  listaPersonas.querySelectorAll('[data-quitar]').forEach(boton => {
    boton.addEventListener('click', () => {
      const actuales = Datos.leer('compartidos', PERSONAS_INICIALES);
      const fuera = actuales.splice(Number(boton.dataset.quitar), 1)[0];
      Datos.guardar('compartidos', actuales);
      dibujar();
      mostrarMensaje('Ya no compartis con ' + fuera.dato, 'exito');
    });
  });
}

/* Agregar una persona nueva */
formInvitar.addEventListener('submit', (e) => {
  e.preventDefault();
  const texto = campoPersona.value.trim();

  if (texto === '') {
    mostrarMensaje('*Error: Escribi un telefono o un gmail', 'error');
    return;
  }

  const tipo = reconocer(texto);
  if (tipo === '') {
    mostrarMensaje('*Error: Eso no parece un telefono ni un gmail', 'error');
    return;
  }

  const personas = Datos.leer('compartidos', PERSONAS_INICIALES);
  const repetida = personas.some(p =>
    String(p.dato).toLowerCase() === texto.toLowerCase()
  );
  if (repetida) {
    mostrarMensaje('*Esa persona ya esta en la lista', 'error');
    return;
  }

  personas.push({ dato: texto, tipo: tipo, permiso: tipoPermiso.value });
  Datos.guardar('compartidos', personas);

  campoPersona.value = '';
  dibujar();
  mostrarMensaje('Listo! Ahora compartis con ' + texto, 'exito');
});

campoPersona.addEventListener('input', () => { mensaje.hidden = true; });

/* ---------- Enlace para compartir ---------------------- */

/* Arma un enlace inventado con letras y numeros al azar */
function armarEnlace() {
  const letras = 'abcdefghijkmnpqrstuvwxyz23456789';
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    codigo += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  return 'https://planify.app/agenda/' + codigo;
}

function mostrarEnlace() {
  let enlace = Datos.leer('enlaceCompartir', '');
  if (!enlace) {
    enlace = armarEnlace();
    Datos.guardar('enlaceCompartir', enlace);
  }
  campoEnlace.value = enlace;
}

document.getElementById('btnCopiar').addEventListener('click', () => {
  campoEnlace.select();

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(campoEnlace.value)
      .then(() => avisar('Enlace copiado!'))
      .catch(() => avisar('Copialo a mano con Ctrl + C'));
  } else {
    avisar('Copialo a mano con Ctrl + C');
  }
});

document.getElementById('btnGenerarEnlace').addEventListener('click', () => {
  const enlace = armarEnlace();
  Datos.guardar('enlaceCompartir', enlace);
  campoEnlace.value = enlace;
  avisar('Enlace nuevo generado');
});

/* Boton Listo: guarda y vuelve al inicio */
document.getElementById('btnListo').addEventListener('click', () => {
  const personas = Datos.leer('compartidos', PERSONAS_INICIALES);
  Datos.guardar('compartidos', personas);
  avisar('Listo! Se guardo con quienes compartis');
  setTimeout(() => { window.location.href = 'panel.html'; }, 900);
});

mostrarEnlace();
dibujar();
