/* =========================================================
   vision.js - Vision Board
   Permite elegir imagenes de tu compu y escribir tus metas.
   Las imagenes se guardan en el navegador como texto (base64).
   ========================================================= */

const CANTIDAD_CASILLAS = 9;
const grilla = document.getElementById('grillaVision');

function dibujar() {
  const imagenes = Datos.leer('visionImagenes', {});

  let html = '';
  for (let i = 0; i < CANTIDAD_CASILLAS; i++) {
    const guardada = imagenes[i];
    html += '<label class="casilla-imagen" style="position:relative;">' +
              (guardada
                ? '<img src="' + guardada + '" alt="Imagen de mis metas">'
                : '<i class="fa-solid fa-plus"></i>') +
              '<input type="file" accept="image/*" data-casilla="' + i + '">' +
            '</label>';
  }
  grilla.innerHTML = html;

  grilla.querySelectorAll('input[type="file"]').forEach(campo => {
    campo.addEventListener('change', () => {
      const archivo = campo.files[0];
      if (!archivo) return;

      // FileReader lee la imagen y la convierte en texto para poder guardarla
      const lector = new FileReader();
      lector.onload = () => {
        const actuales = Datos.leer('visionImagenes', {});
        actuales[campo.dataset.casilla] = lector.result;
        if (Datos.guardar('visionImagenes', actuales)) {
          dibujar();
          avisar('Imagen agregada');
        }
      };
      lector.readAsDataURL(archivo);
    });
  });
}

dibujar();

/* --- Textos ------------------------------------------- */
const palabras = document.getElementById('palabrasGuia');
const version  = document.getElementById('mejorVersion');

palabras.value = Datos.leer('visionPalabras', '');
version.value  = Datos.leer('visionMejor', '');

palabras.addEventListener('change', () => Datos.guardar('visionPalabras', palabras.value));
version.addEventListener('change', () => Datos.guardar('visionMejor', version.value));

/* --- Areas de enfoque -------------------------------- */
const listaAreas = document.getElementById('listaAreas');
const AREAS_INICIALES = ['Estudio', 'Salud', 'Familia y amigos', 'Proyectos personales'];

function limpiar(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dibujarAreas() {
  const areas = Datos.leer('visionAreas', AREAS_INICIALES);

  listaAreas.innerHTML = areas.map((a, i) =>
    '<li>' +
      '<i class="fa-solid fa-star"></i>' +
      '<input type="text" value="' + limpiar(a) + '" data-area="' + i + '" placeholder="Nueva area...">' +
      '<button class="icono-borrar" data-borrar="' + i + '"><i class="fa-solid fa-xmark"></i></button>' +
    '</li>'
  ).join('');

  listaAreas.querySelectorAll('[data-area]').forEach(campo => {
    campo.addEventListener('change', () => {
      const actuales = Datos.leer('visionAreas', AREAS_INICIALES);
      actuales[campo.dataset.area] = campo.value;
      Datos.guardar('visionAreas', actuales);
    });
  });

  listaAreas.querySelectorAll('[data-borrar]').forEach(boton => {
    boton.addEventListener('click', () => {
      const actuales = Datos.leer('visionAreas', AREAS_INICIALES);
      actuales.splice(Number(boton.dataset.borrar), 1);
      Datos.guardar('visionAreas', actuales);
      dibujarAreas();
    });
  });
}

dibujarAreas();

document.getElementById('btnAgregarArea').addEventListener('click', () => {
  const actuales = Datos.leer('visionAreas', AREAS_INICIALES);
  actuales.push('');
  Datos.guardar('visionAreas', actuales);
  dibujarAreas();
});

document.getElementById('btnGuardarVision').addEventListener('click', () => {
  Datos.guardar('visionPalabras', palabras.value);
  Datos.guardar('visionMejor', version.value);
  avisar('Vision Board guardado!');
});
