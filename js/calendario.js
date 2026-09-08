/* =========================================================
   calendario.js - Sirve para el calendario ANUAL y el MENSUAL
   Dibuja los meses, tacha los dias que ya pasaron y permite
   escribir eventos y objetivos.
   ========================================================= */

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const SEMANA = ['L','M','X','J','V','S','D'];

const AHORA = new Date();
const HOY_LIMPIO = new Date(AHORA.getFullYear(), AHORA.getMonth(), AHORA.getDate());

/* Cuantos dias tiene un mes */
function diasDelMes(anio, mes) {
  return new Date(anio, mes + 1, 0).getDate();
}

/* En que columna arranca el mes (0 = lunes) */
function primerDiaSemana(anio, mes) {
  return (new Date(anio, mes, 1).getDay() + 6) % 7;
}

function textoSeguro(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* =========================================================
   1) CALENDARIO ANUAL - los 12 meses chiquitos
   ========================================================= */
const grillaAnual = document.getElementById('grillaAnual');
if (grillaAnual) {
  let anio = Datos.leer('anioElegido', AHORA.getFullYear());

  function dibujarAnio() {
    document.getElementById('anioTitulo').textContent = anio;
    let html = '';

    for (let mes = 0; mes < 12; mes++) {
      let filas = '';
      let celdas = '';
      const inicio = primerDiaSemana(anio, mes);
      const total = diasDelMes(anio, mes);

      for (let i = 0; i < inicio; i++) celdas += '<td></td>';

      for (let dia = 1; dia <= total; dia++) {
        const fecha = new Date(anio, mes, dia);
        const columna = (inicio + dia - 1) % 7;

        let clase = '';
        if (fecha < HOY_LIMPIO) clase = 'dia-pasado';
        else if (fecha.getTime() === HOY_LIMPIO.getTime()) clase = 'dia-hoy';
        else if (columna >= 5) clase = 'dia-fin';

        celdas += '<td class="' + clase + '">' + dia + '</td>';

        if (columna === 6) { filas += '<tr>' + celdas + '</tr>'; celdas = ''; }
      }
      if (celdas) filas += '<tr>' + celdas + '</tr>';

      html += '<article class="mes-mini" data-mes="' + mes + '" style="cursor:pointer;">' +
                '<h3>' + MESES[mes] + '</h3>' +
                '<table><thead><tr>' +
                  SEMANA.map(d => '<th>' + d + '</th>').join('') +
                '</tr></thead><tbody>' + filas + '</tbody></table>' +
              '</article>';
    }

    grillaAnual.innerHTML = html;

    // Al hacer clic en un mes se abre la planificacion mensual
    grillaAnual.querySelectorAll('.mes-mini').forEach(caja => {
      caja.addEventListener('click', () => {
        Datos.guardar('mesElegido', Number(caja.dataset.mes));
        Datos.guardar('anioElegido', anio);
        window.location.href = 'calendario-mensual.html';
      });
    });
  }

  dibujarAnio();

  document.getElementById('anioAnterior').addEventListener('click', () => {
    anio--; Datos.guardar('anioElegido', anio); dibujarAnio();
  });
  document.getElementById('anioSiguiente').addEventListener('click', () => {
    anio++; Datos.guardar('anioElegido', anio); dibujarAnio();
  });
}

/* =========================================================
   2) CALENDARIO MENSUAL - un mes grande + objetivos
   ========================================================= */
const cuerpoMes = document.getElementById('cuerpoMes');
if (cuerpoMes) {
  let mes = Datos.leer('mesElegido', AHORA.getMonth());
  let anio = Datos.leer('anioElegido', AHORA.getFullYear());

  function clave(anio, mes, dia) {
    return anio + '-' + (mes + 1) + '-' + dia;
  }

  function dibujarMes() {
    document.getElementById('tituloMes').textContent = MESES[mes] + ' ' + anio;

    const eventos = Datos.leer('eventos', {});
    const inicio = primerDiaSemana(anio, mes);
    const total = diasDelMes(anio, mes);

    let filas = '';
    let celdas = '';
    for (let i = 0; i < inicio; i++) celdas += '<td></td>';

    for (let dia = 1; dia <= total; dia++) {
      const fecha = new Date(anio, mes, dia);
      const columna = (inicio + dia - 1) % 7;
      const k = clave(anio, mes, dia);

      let clases = [];
      if (fecha < HOY_LIMPIO) clases.push('dia-pasado');
      if (fecha.getTime() === HOY_LIMPIO.getTime()) clases.push('dia-hoy-celda');

      const texto = eventos[k] ? '<div class="evento-dia">' + textoSeguro(eventos[k]) + '</div>' : '';
      const resaltado = fecha.getTime() === HOY_LIMPIO.getTime()
        ? ' style="background:var(--lavanda);"' : '';

      celdas += '<td data-dia="' + dia + '"' + resaltado + '>' +
                  '<span class="numero-dia ' + clases.join(' ') + '">' + dia + '</span>' +
                  texto +
                '</td>';

      if (columna === 6) { filas += '<tr>' + celdas + '</tr>'; celdas = ''; }
    }
    if (celdas) filas += '<tr>' + celdas + '</tr>';

    cuerpoMes.innerHTML = filas;

    // Clic en un dia = escribir o cambiar el evento
    cuerpoMes.querySelectorAll('td[data-dia]').forEach(celda => {
      celda.addEventListener('click', () => {
        const dia = celda.dataset.dia;
        const k = clave(anio, mes, dia);
        const guardados = Datos.leer('eventos', {});
        const nuevo = prompt('Evento para el ' + dia + ' de ' + MESES[mes] + ':', guardados[k] || '');
        if (nuevo === null) return;

        if (nuevo.trim() === '') delete guardados[k];
        else guardados[k] = nuevo.trim();

        Datos.guardar('eventos', guardados);
        dibujarMes();
        avisar('Calendario actualizado');
      });
    });
  }

  dibujarMes();

  document.getElementById('mesAnterior').addEventListener('click', () => {
    mes--; if (mes < 0) { mes = 11; anio--; }
    Datos.guardar('mesElegido', mes); Datos.guardar('anioElegido', anio);
    dibujarMes(); dibujarObjetivos();
  });
  document.getElementById('mesSiguiente').addEventListener('click', () => {
    mes++; if (mes > 11) { mes = 0; anio++; }
    Datos.guardar('mesElegido', mes); Datos.guardar('anioElegido', anio);
    dibujarMes(); dibujarObjetivos();
  });

  /* --- Objetivos del mes -------------------------------- */
  const lista = document.getElementById('listaObjetivos');

  function claveObjetivos() { return 'objetivos_' + anio + '_' + mes; }

  function dibujarObjetivos() {
    const objetivos = Datos.leer(claveObjetivos(), ['', '', '', '']);

    lista.innerHTML = objetivos.map((texto, i) =>
      '<li>' +
        '<i class="fa-solid fa-star"></i>' +
        '<input type="text" data-indice="' + i + '" value="' + textoSeguro(texto) + '" placeholder="Escribe un objetivo...">' +
        '<button class="icono-borrar" data-borrar="' + i + '" title="Quitar">' +
          '<i class="fa-solid fa-xmark"></i>' +
        '</button>' +
      '</li>'
    ).join('');

    lista.querySelectorAll('input').forEach(campo => {
      campo.addEventListener('change', () => {
        const actuales = Datos.leer(claveObjetivos(), ['', '', '', '']);
        actuales[campo.dataset.indice] = campo.value;
        Datos.guardar(claveObjetivos(), actuales);
        avisar('Objetivo guardado');
      });
    });

    lista.querySelectorAll('[data-borrar]').forEach(boton => {
      boton.addEventListener('click', () => {
        const actuales = Datos.leer(claveObjetivos(), ['', '', '', '']);
        actuales.splice(Number(boton.dataset.borrar), 1);
        Datos.guardar(claveObjetivos(), actuales);
        dibujarObjetivos();
      });
    });
  }

  dibujarObjetivos();

  document.getElementById('btnAgregarObjetivo').addEventListener('click', () => {
    const actuales = Datos.leer(claveObjetivos(), ['', '', '', '']);
    actuales.push('');
    Datos.guardar(claveObjetivos(), actuales);
    dibujarObjetivos();
  });
}
