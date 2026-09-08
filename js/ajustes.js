/* =========================================================
   ajustes.js - Colores y modo oscuro/claro
   Todo lo que elijas queda guardado para las demas paginas.
   ========================================================= */

/* Los 6 colores que se pueden elegir con un solo clic.
   Cada uno tiene su nombre para que se entienda cual es.   */
const COLORES = [
  { nombre: 'Rosa',   codigo: '#d94f8a' },
  { nombre: 'Bordo',  codigo: '#7b1f37' },
  { nombre: 'Azul',   codigo: '#3f5f9e' },
  { nombre: 'Verde',  codigo: '#2e7d5b' },
  { nombre: 'Marron', codigo: '#7b4b2a' },
  { nombre: 'Gris',   codigo: '#5a5a6b' }
];

const paleta    = document.getElementById('paleta');
const selector  = document.getElementById('selectorColor');
const campoHex  = document.getElementById('codigoHex');

let colorActual = Datos.leer('color', '#a33b62');
selector.value = colorActual;
campoHex.value = colorActual;

/* Dibuja los circulitos de colores */
function dibujarPaleta() {
  paleta.innerHTML = COLORES.map(c =>
    '<button class="opcion-color" data-color="' + c.codigo + '" ' +
            'title="' + c.nombre + '" aria-label="Color ' + c.nombre + '">' +
      '<span class="muestra-color' + (c.codigo === colorActual ? ' elegida' : '') + '" ' +
            'style="background:' + c.codigo + ';"></span>' +
      '<span class="nombre-color">' + c.nombre + '</span>' +
    '</button>'
  ).join('');

  paleta.querySelectorAll('[data-color]').forEach(boton => {
    boton.addEventListener('click', () => aplicar(boton.dataset.color));
  });
}

/* Guarda el color y lo aplica al instante */
function aplicar(color) {
  colorActual = color;
  Datos.guardar('color', color);
  selector.value = color;
  campoHex.value = color;
  aplicarTema();
  dibujarPaleta();

  // Si el color es uno de los 6, aviso con su nombre
  const elegido = COLORES.find(c => c.codigo.toLowerCase() === color.toLowerCase());
  avisar('Color aplicado: ' + (elegido ? elegido.nombre : color));
}

dibujarPaleta();

selector.addEventListener('input', () => aplicar(selector.value));

document.getElementById('btnAplicarHex').addEventListener('click', () => {
  let valor = campoHex.value.trim();
  if (!valor.startsWith('#')) valor = '#' + valor;

  // Comprueba que sea un codigo de color valido tipo #a33b62
  if (!/^#[0-9a-f]{6}$/i.test(valor)) {
    avisar('Ese codigo no es valido. Ejemplo: #a33b62');
    return;
  }
  aplicar(valor);
});

campoHex.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('btnAplicarHex').click(); }
});

/* --- Modo oscuro y claro ------------------------------- */
function marcarModo() {
  const oscuro = Datos.leer('modoOscuro', false);
  document.getElementById('btnOscuro').classList.toggle('boton-violeta', oscuro);
  document.getElementById('btnClaro').classList.toggle('boton-violeta', !oscuro);
}

document.getElementById('btnOscuro').addEventListener('click', () => {
  Datos.guardar('modoOscuro', true);
  aplicarTema(); marcarModo();
  avisar('Modo oscuro activado');
});

document.getElementById('btnClaro').addEventListener('click', () => {
  Datos.guardar('modoOscuro', false);
  aplicarTema(); marcarModo();
  avisar('Modo claro activado');
});

marcarModo();

/* --- Borrar todos los datos --------------------------- */
document.getElementById('btnReiniciar').addEventListener('click', () => {
  if (!confirm('Se borraran tus notas, tareas y ajustes. Seguro?')) return;

  Object.keys(localStorage)
    .filter(k => k.startsWith('planify_'))
    .forEach(k => localStorage.removeItem(k));

  avisar('Datos borrados');
  setTimeout(() => { window.location.href = 'index.html'; }, 1000);
});
