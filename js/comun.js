/* =========================================================
   comun.js - Codigo que usan TODAS las paginas
   Se encarga de: menu hamburguesa, buscador, tema de color,
   modo oscuro/claro y de guardar datos en el navegador.
   ========================================================= */

/* ---------- 1. Guardar y leer datos (localStorage) --------
   localStorage es una "memoria" del navegador. Lo que guardas
   sigue ahi aunque cierres la pagina.                        */
const Datos = {
  leer(clave, porDefecto) {
    try {
      const guardado = localStorage.getItem('planify_' + clave);
      return guardado === null ? porDefecto : JSON.parse(guardado);
    } catch (e) {
      return porDefecto;
    }
  },
  guardar(clave, valor) {
    try {
      localStorage.setItem('planify_' + clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      avisar('No se pudo guardar (memoria del navegador llena)');
      return false;
    }
  },
  borrar(clave) {
    localStorage.removeItem('planify_' + clave);
  }
};

/* ---------- 2. Notas de ejemplo la primera vez ----------- */
function notasIniciales() {
  return [
    { titulo: 'Nota 1', texto: 'Repasar estructuras repetitivas para la prueba.', fecha: hoyTexto() },
    { titulo: 'Nota 2', texto: 'Traer la carpeta de Modelos y Sistemas.', fecha: hoyTexto() },
    { titulo: 'Nota 3', texto: 'Ideas para el proyecto final: agenda escolar.', fecha: hoyTexto() }
  ];
}

function obtenerNotas() {
  let notas = Datos.leer('notas', null);
  if (!Array.isArray(notas)) {
    notas = notasIniciales();
    Datos.guardar('notas', notas);
  }
  return notas;
}

function hoyTexto() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------- 3. Aviso flotante --------------------------- */
let temporizadorAviso = null;
function avisar(mensaje) {
  let caja = document.getElementById('avisoFlotante');
  if (!caja) {
    caja = document.createElement('div');
    caja.id = 'avisoFlotante';
    caja.className = 'aviso-flotante';
    document.body.appendChild(caja);
  }
  caja.textContent = mensaje;
  caja.classList.add('visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => caja.classList.remove('visible'), 2200);
}

/* ---------- 4. Tema de color y modo oscuro --------------
   Con UN solo color armo toda la familia: uno mas oscuro y
   uno mas suave. Asi el logo, la barra y el menu cambian
   todos juntos y siempre combinan.                        */
function aclararOscurecer(color, cuanto) {
  // cuanto negativo = mas oscuro / cuanto positivo = mas claro
  const limpio = String(color).replace('#', '');
  if (limpio.length !== 6) return color;
  const partes = [0, 2, 4].map(i => parseInt(limpio.slice(i, i + 2), 16));
  const nuevas = partes.map(v => {
    let n = Math.round(v + cuanto);
    if (n < 0) n = 0;
    if (n > 255) n = 255;
    return n.toString(16).padStart(2, '0');
  });
  return '#' + nuevas.join('');
}

function aplicarTema() {
  const color = Datos.leer('color', '#a33b62');
  const raiz = document.documentElement.style;

  raiz.setProperty('--ciruela', color);
  raiz.setProperty('--vino', color);
  raiz.setProperty('--vino-oscuro', aclararOscurecer(color, -42));
  raiz.setProperty('--violeta', aclararOscurecer(color, 34));
  raiz.setProperty('--violeta-oscuro', aclararOscurecer(color, -60));

  if (Datos.leer('modoOscuro', false)) {
    document.body.classList.add('modo-oscuro');
  } else {
    document.body.classList.remove('modo-oscuro');
  }
}

/* ---------- 5. Menu lateral ----------------------------- */
function prepararMenu() {
  const boton = document.getElementById('btnMenu');
  const menu = document.getElementById('menuLateral');
  const fondo = document.getElementById('fondoMenu');
  if (!boton || !menu || !fondo) return;

  const abrir = () => { menu.classList.add('abierto'); fondo.classList.add('visible'); };
  const cerrar = () => { menu.classList.remove('abierto'); fondo.classList.remove('visible'); };

  boton.addEventListener('click', () => {
    menu.classList.contains('abierto') ? cerrar() : abrir();
  });
  fondo.addEventListener('click', cerrar);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
}

/* ---------- 6. Cuantos dias pasaron desde una fecha ----- */
const DIAS_PAPELERA = 15;

function diasDesde(fechaTexto) {
  const fecha = new Date(String(fechaTexto) + 'T00:00:00');
  if (isNaN(fecha.getTime())) return 0;
  return Math.floor((Date.now() - fecha.getTime()) / (1000 * 60 * 60 * 24));
}

/* ---------- 7. Buscador de notas ------------------------
   Busca primero en tus notas. Si no la encuentra, mira en
   la papelera y avisa si todavia se puede recuperar o si
   ya paso el plazo de 15 dias.                            */
function prepararBuscador() {
  const formulario = document.getElementById('formBuscador');
  const campo = document.getElementById('campoBuscar');
  const aviso = document.getElementById('avisoBusqueda');
  if (!formulario || !campo) return;

  function mostrar(texto, tipo) {
    if (!aviso) return;
    aviso.textContent = texto;
    aviso.className = 'aviso-busqueda ' + (tipo === 'ok' ? 'es-ok' : 'es-error');
    aviso.hidden = false;
  }

  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = campo.value.trim().replace(/^\*/, '').toLowerCase();
    if (!texto) return;

    const coincide = (n) =>
      String(n.titulo || '').toLowerCase().includes(texto) ||
      String(n.texto || '').toLowerCase().includes(texto);

    // 1) Busco entre las notas que tengo
    const notas = obtenerNotas();
    const posicion = notas.findIndex(coincide);
    if (posicion !== -1) {
      window.location.href = 'notas.html?nota=' + posicion;
      return;
    }

    // 2) Si no esta, la busco en la papelera
    const papelera = Datos.leer('papelera', []);
    const enPapelera = papelera.find(coincide);

    if (enPapelera) {
      if (diasDesde(enPapelera.borrada) > DIAS_PAPELERA) {
        mostrar('*Esta nota ya paso el plazo de 15 dias', 'error');
      } else {
        mostrar('*Esta nota esta en la papelera, todavia la podes restaurar', 'ok');
      }
      return;
    }

    mostrar('*Error: Esta nota no existe', 'error');
  });

  campo.addEventListener('input', () => { if (aviso) aviso.hidden = true; });
}

/* ---------- 8. Marcar en que pagina estoy --------------- */
function marcarPaginaActual() {
  const archivo = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu-lateral a, .pestana').forEach(enlace => {
    if (enlace.getAttribute('href') === archivo) enlace.classList.add('actual');
  });
}

/* ---------- 9. Cerrar sesion --------------------------- */
function prepararCerrarSesion() {
  document.querySelectorAll('[data-accion="cerrar-sesion"]').forEach(boton => {
    boton.addEventListener('click', (e) => {
      e.preventDefault();
      if (!confirm('Seguro que queres cerrar sesion?')) return;
      Datos.guardar('sesion', false);
      window.location.href = 'sesion-cerrada.html';
    });
  });
}

/* ---------- 9.b Mostrar "Actualizar pago" solo con sesion ---
   Si la persona inicio sesion, en el menu aparece el item de
   pago. Si no inicio sesion, se esconde.                     */
function prepararItemPago() {
  const hayUsuario = Datos.leer('sesion', false) || Datos.leer('usuario', null);
  document.querySelectorAll('.menu-lateral a[href="pago-actualizar.html"]').forEach(enlace => {
    enlace.hidden = !hayUsuario;
  });
}

/* ---------- 9.c El plan y el estado del pago -------------
   Aca guardo los dos planes y las cuentas de fechas. Esta en
   comun.js porque TODAS las paginas tienen que poder saber si
   el plan esta vencido para bloquearse solas.               */
const PLANES = {
  mensual: { nombre: 'Plan Mensual', precio: 500,  periodo: 'mes', dias: 30 },
  anual:   { nombre: 'Plan Anual',   precio: 5000, periodo: 'ano', dias: 365 }
};

/* Escribe un numero con punto de miles: 5000 -> 5.000 */
function conPuntos(numero) {
  return String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* Fecha linda para mostrar: 2026-03-14 -> 14/03/2026 */
function fechaLinda(texto) {
  const f = new Date(String(texto) + 'T00:00:00');
  if (isNaN(f.getTime())) return '-';
  const dia = String(f.getDate()).padStart(2, '0');
  const mes = String(f.getMonth() + 1).padStart(2, '0');
  return dia + '/' + mes + '/' + f.getFullYear();
}

/* Suma dias a la fecha de hoy y devuelve 2026-03-14 */
function sumarDias(dias) {
  const f = new Date();
  f.setDate(f.getDate() + dias);
  return f.toISOString().slice(0, 10);
}

/* Cuantos dias faltan para una fecha (negativo = ya paso) */
function diasHasta(texto) {
  const f = new Date(String(texto) + 'T00:00:00');
  if (isNaN(f.getTime())) return 0;
  return Math.ceil((f.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/* Devuelve el plan, cuando vence y en que situacion esta:
   sin-plan / vencido / por-vencer / al-dia               */
function estadoPago() {
  const guardado = Datos.leer('pago', null);
  if (!guardado || !guardado.vence) {
    return { activo: false, situacion: 'sin-plan', dias: 0 };
  }
  const faltan = diasHasta(guardado.vence);
  let situacion = 'al-dia';
  if (faltan < 0) situacion = 'vencido';
  else if (faltan <= 5) situacion = 'por-vencer';

  return {
    activo: faltan >= 0,
    situacion: situacion,
    dias: faltan,
    plan: guardado.plan || 'mensual',
    vence: guardado.vence,
    tarjeta: guardado.tarjeta || '4271',
    titular: guardado.titular || ''
  };
}

/* Guarda un pago nuevo y corre la fecha de vencimiento */
function registrarPago(clavePlan, tarjeta, titular) {
  const plan = PLANES[clavePlan] || PLANES.mensual;
  Datos.guardar('pago', {
    plan: clavePlan,
    tarjeta: String(tarjeta).replace(/\s/g, '').slice(-4) || '4271',
    titular: titular || '',
    pagado: hoyTexto(),
    vence: sumarDias(plan.dias)
  });
}

/* ---------- 9.d El guardia del pago ---------------------
   Es como un portero: en cada pagina mira si el plan esta
   vencido. Si esta vencido, manda derecho a la pantalla de
   aviso y no deja usar el resto del sitio.

   Estas paginas NO se bloquean, porque son la puerta de
   entrada y la de pago (si no, quedaria encerrada).       */
const PAGINAS_LIBRES = [
  'index.html', 'registro.html', 'iniciar-sesion.html',
  'pago-registro.html', 'pago-actualizar.html',
  'pago-bloqueado.html', 'sesion-cerrada.html'
];

function paginaActual() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function guardiaDePago() {
  const pagina = paginaActual();
  if (PAGINAS_LIBRES.indexOf(pagina) !== -1) return;

  // Si todavia no inicio sesion, el pago no importa
  if (!Datos.leer('sesion', false)) return;

  const estado = estadoPago();
  if (!estado.activo) {
    window.location.replace('pago-bloqueado.html');
    return;
  }

  // Si le quedan pocos dias, solo le aviso con carino
  if (estado.situacion === 'por-vencer' && !Datos.leer('avisoVence', false)) {
    Datos.guardar('avisoVence', true);
    setTimeout(() => {
      avisar('Tu plan vence en ' + estado.dias + ' dias. Podes renovarlo en Actualizar pago');
    }, 900);
  }
  if (estado.situacion === 'al-dia' && estado.dias > 5) {
    Datos.borrar('avisoVence');
  }
}

/* ---------- 10. Arranque ------------------------------- */
aplicarTema();
guardiaDePago();
document.addEventListener('DOMContentLoaded', () => {
  aplicarTema();
  guardiaDePago();
  prepararMenu();
  prepararBuscador();
  marcarPaginaActual();
  prepararCerrarSesion();
  prepararItemPago();
});
