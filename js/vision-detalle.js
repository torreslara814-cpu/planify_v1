/* =========================================================
   vision-detalle.js - Vision Board detallado
   Tres casillas grandes: en cada una eliges una imagen y
   escribes al lado que significa para vos.
   Abajo podes agregar tus propias notas del Vision Board.
   ========================================================= */

const CASILLAS_DETALLE = 3;
const grillaDetalle = document.getElementById('grillaDetalle');

function limpiarTexto(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* --- Dibujar las tres casillas -------------------------- */
function dibujarDetalle() {
  const imagenes = Datos.leer('detalleImagenes', {});
  const textos = Datos.leer('detalleTextos', {});

  let html = '';
  for (let i = 0; i < CASILLAS_DETALLE; i++) {
    const imagen = imagenes[i];
    html += '<article class="tarjeta-vino bloque-detalle">' +
              '<div class="titulo-tarjeta">Imagen ' + (i + 1) + '</div>' +
              '<label class="casilla-imagen casilla-detalle">' +
                (imagen
                  ? '<img src="' + imagen + '" alt="Imagen de mis metas">'
                  : '<i class="fa-solid fa-plus"></i>') +
                '<input type="file" accept="image/*" data-casilla="' + i + '">' +
              '</label>' +
              '<textarea class="caja-texto-vision" data-significado="' + i + '" ' +
                        'placeholder="Que significa para mi esta imagen...">' +
                limpiarTexto(textos[i]) +
              '</textarea>' +
            '</article>';
  }
  grillaDetalle.innerHTML = html;

  // Elegir imagen desde la compu
  grillaDetalle.querySelectorAll('input[type="file"]').forEach(campo => {
    campo.addEventListener('change', () => {
      const archivo = campo.files[0];
      if (!archivo) return;

      // FileReader convierte la imagen en texto para poder guardarla
      const lector = new FileReader();
      lector.onload = () => {
        const actuales = Datos.leer('detalleImagenes', {});
        actuales[campo.dataset.casilla] = lector.result;
        if (Datos.guardar('detalleImagenes', actuales)) {
          dibujarDetalle();
          avisar('Imagen agregada');
        }
      };
      lector.readAsDataURL(archivo);
    });
  });

  // Guardar el texto de cada imagen
  grillaDetalle.querySelectorAll('[data-significado]').forEach(campo => {
    campo.addEventListener('change', () => {
      const actuales = Datos.leer('detalleTextos', {});
      actuales[campo.dataset.significado] = campo.value;
      Datos.guardar('detalleTextos', actuales);
    });
  });
}

dibujarDetalle();

/* --- Mis notas del Vision Board ------------------------- */
const listaNotasVision = document.getElementById('listaNotasVision');
const campoNotaVision = document.getElementById('campoNotaVision');

function dibujarNotasVision() {
  const notas = Datos.leer('detalleNotas', []);

  if (notas.length === 0) {
    listaNotasVision.innerHTML = '<li style="opacity:.85;">Todavia no agregaste notas.</li>';
    return;
  }

  listaNotasVision.innerHTML = notas.map((nota, i) =>
    '<li>' +
      '<i class="fa-solid fa-star"></i>' +
      '<input type="text" value="' + limpiarTexto(nota) + '" data-nota="' + i + '">' +
      '<button class="icono-borrar" data-quitar="' + i + '" aria-label="Borrar nota">' +
        '<i class="fa-solid fa-xmark"></i>' +
      '</button>' +
    '</li>'
  ).join('');

  listaNotasVision.querySelectorAll('[data-nota]').forEach(campo => {
    campo.addEventListener('change', () => {
      const actuales = Datos.leer('detalleNotas', []);
      actuales[campo.dataset.nota] = campo.value;
      Datos.guardar('detalleNotas', actuales);
    });
  });

  listaNotasVision.querySelectorAll('[data-quitar]').forEach(boton => {
    boton.addEventListener('click', () => {
      const actuales = Datos.leer('detalleNotas', []);
      actuales.splice(Number(boton.dataset.quitar), 1);
      Datos.guardar('detalleNotas', actuales);
      dibujarNotasVision();
      avisar('Nota borrada');
    });
  });
}

dibujarNotasVision();

function agregarNotaVision() {
  const texto = campoNotaVision.value.trim();
  if (!texto) {
    avisar('Escribe algo primero');
    return;
  }
  const actuales = Datos.leer('detalleNotas', []);
  actuales.push(texto);
  Datos.guardar('detalleNotas', actuales);
  campoNotaVision.value = '';
  dibujarNotasVision();
  avisar('Nota agregada');
}

document.getElementById('btnAgregarNotaVision').addEventListener('click', agregarNotaVision);

campoNotaVision.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    agregarNotaVision();
  }
});

/* --- Boton Guardar todo -------------------------------- */
document.getElementById('btnGuardarDetalle').addEventListener('click', () => {
  const textos = Datos.leer('detalleTextos', {});
  grillaDetalle.querySelectorAll('[data-significado]').forEach(campo => {
    textos[campo.dataset.significado] = campo.value;
  });
  Datos.guardar('detalleTextos', textos);

  const notas = Datos.leer('detalleNotas', []);
  listaNotasVision.querySelectorAll('[data-nota]').forEach(campo => {
    notas[campo.dataset.nota] = campo.value;
  });
  Datos.guardar('detalleNotas', notas);

  avisar('Vision Board detallado guardado!');
});
