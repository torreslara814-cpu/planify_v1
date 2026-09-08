/* =========================================================
   recordatorios.js - Tu dia hora por hora
   Puedes cambiar la hora, el texto y agregar mas filas.
   ========================================================= */

const POR_DEFECTO = [
  { hora: '07:00', texto: 'Levantarme' },
  { hora: '08:00', texto: 'Entrar al colegio' },
  { hora: '13:00', texto: 'Almuerzo' },
  { hora: '15:00', texto: 'Hacer la tarea' },
  { hora: '17:00', texto: 'Estudiar Modelos y Sistemas' },
  { hora: '20:00', texto: 'Preparar la mochila' },
  { hora: '22:30', texto: 'Dormir' }
];

const lista = document.getElementById('listaHoras');

function limpiar(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dibujar() {
  const datos = Datos.leer('recordatorios', POR_DEFECTO);

  if (datos.length === 0) {
    lista.innerHTML = '<p style="font-size:14px; opacity:.9;">Agrega tu primer horario.</p>';
    return;
  }

  lista.innerHTML = datos.map((r, i) =>
    '<div class="fila-hora">' +
      '<input class="hora" type="time" value="' + limpiar(r.hora) + '" data-hora="' + i + '" ' +
             'style="background:transparent; border:none; color:inherit; font-family:var(--sans); outline:none;">' +
      '<input type="text" value="' + limpiar(r.texto) + '" data-texto="' + i + '" placeholder="Que tengo que hacer?">' +
      '<button class="icono-borrar" data-borrar="' + i + '" title="Quitar">' +
        '<i class="fa-solid fa-xmark"></i>' +
      '</button>' +
    '</div>'
  ).join('');

  // Guardar cuando cambia la hora o el texto
  lista.querySelectorAll('[data-hora], [data-texto]').forEach(campo => {
    campo.addEventListener('change', () => {
      const actuales = Datos.leer('recordatorios', POR_DEFECTO);
      if (campo.dataset.hora !== undefined) actuales[campo.dataset.hora].hora = campo.value;
      else actuales[campo.dataset.texto].texto = campo.value;
      Datos.guardar('recordatorios', actuales);
    });
  });

  lista.querySelectorAll('[data-borrar]').forEach(boton => {
    boton.addEventListener('click', () => {
      const actuales = Datos.leer('recordatorios', POR_DEFECTO);
      actuales.splice(Number(boton.dataset.borrar), 1);
      Datos.guardar('recordatorios', actuales);
      dibujar();
    });
  });
}

dibujar();

document.getElementById('btnAgregarHora').addEventListener('click', () => {
  const actuales = Datos.leer('recordatorios', POR_DEFECTO);
  actuales.push({ hora: '12:00', texto: '' });
  // Ordena las filas por hora
  actuales.sort((a, b) => a.hora.localeCompare(b.hora));
  Datos.guardar('recordatorios', actuales);
  dibujar();
});

document.getElementById('btnGuardarRec').addEventListener('click', () => {
  avisar('Recordatorios guardados!');
});
