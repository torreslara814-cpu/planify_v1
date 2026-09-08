/* =========================================================
   acceso.js - Registro e inicio de sesion
   Valida los campos y, si todo esta bien, entra al panel.
   (Es una simulacion: los datos se guardan en el navegador,
    no hay base de datos ni servidor.)
   ========================================================= */

/* ---------- A donde va despues de iniciar sesion ---------
   Si el plan esta al dia entra al panel.
   Si vencio o nunca pago, primero pasa por la pantalla de
   aviso, asi no puede usar el sitio sin plan.             */
function entrarSegunPago() {
  const estado = estadoPago();
  if (estado.situacion === 'sin-plan') {
    window.location.href = 'pago-registro.html';
  } else if (!estado.activo) {
    window.location.href = 'pago-bloqueado.html';
  } else {
    window.location.href = 'panel.html';
  }
}

/* --- Seccion de pago del registro ------------------------
   Los dos planes chiquitos que estan abajo del formulario.
   Guardo el que elige para que despues aparezca marcado en
   la pantalla de pago.                                     */
const pagoRegistro = document.getElementById('pagoRegistro');
if (pagoRegistro) {
  const opciones = pagoRegistro.querySelectorAll('.mini-plan');

  opciones.forEach(boton => {
    boton.addEventListener('click', () => {
      opciones.forEach(o => o.classList.remove('elegido'));
      boton.classList.add('elegido');
      Datos.guardar('planElegido', boton.dataset.plan);
    });
  });

  /* Si ya habia elegido antes, lo dejo marcado */
  const guardado = Datos.leer('planElegido', 'mensual');
  opciones.forEach(o => {
    o.classList.toggle('elegido', o.dataset.plan === guardado);
  });
}

/* --- Seccion de pago del inicio de sesion ----------------
   Antes de entrar le cuento como viene su plan.            */
const pagoLogin = document.getElementById('pagoLogin');
if (pagoLogin) {
  const texto = document.getElementById('estadoLoginTexto');
  const pastilla = document.getElementById('estadoLoginPastilla');
  const boton = document.getElementById('btnPagoLogin');
  const estado = estadoPago();

  if (estado.situacion === 'sin-plan') {
    texto.textContent = 'Todavia no elegiste un plan. Al entrar te pedimos el primer pago.';
    pastilla.textContent = 'Sin plan';
    pastilla.classList.add('es-vencido');
  } else if (estado.situacion === 'vencido') {
    texto.textContent = 'Tu plan vencio el ' + fechaLinda(estado.vence) + '. Renovalo para seguir usando Planify.';
    pastilla.textContent = 'Vencido';
    pastilla.classList.add('es-vencido');
    boton.hidden = false;
  } else if (estado.situacion === 'por-vencer') {
    texto.textContent = 'Te quedan ' + estado.dias + ' dias de tu plan (vence el ' + fechaLinda(estado.vence) + ').';
    pastilla.textContent = 'Por vencer';
    pastilla.classList.add('es-por-vencer');
    boton.hidden = false;
  } else {
    texto.textContent = 'Tu plan esta al dia hasta el ' + fechaLinda(estado.vence) + '. Podes entrar tranquila.';
    pastilla.textContent = 'Al dia';
    pastilla.classList.add('es-al-dia');
  }

  pastilla.hidden = false;
}

/* --- Registro ------------------------------------------- */
const formRegistro = document.getElementById('formRegistro');
if (formRegistro) {
  const error = document.getElementById('errorRegistro');

  formRegistro.addEventListener('submit', (e) => {
    e.preventDefault();                 // evita que la pagina se recargue
    error.textContent = '';

    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const clave  = document.getElementById('clave').value;

    if (nombre.length < 3) {
      error.textContent = 'Escribe tu nombre y apellido.';
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(correo)) {
      error.textContent = 'El correo no parece valido.';
      return;
    }
    if (clave.length < 6) {
      error.textContent = 'La contrasena necesita al menos 6 caracteres.';
      return;
    }

    const partes = nombre.split(' ');
    Datos.guardar('usuario', {
      nombre: partes[0],
      apellido: partes.slice(1).join(' ') || '-',
      correo: correo
    });
    /* Despues de registrarse va a la pantalla del primer pago.
       La sesion se abre recien cuando el pago queda hecho.    */
    window.location.href = 'pago-registro.html';
  });
}

/* --- Inicio de sesion ---------------------------------- */
const formLogin = document.getElementById('formLogin');
if (formLogin) {
  const error = document.getElementById('errorLogin');

  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    error.textContent = '';

    const correo = document.getElementById('correo').value.trim();
    const clave  = document.getElementById('clave').value;

    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(correo)) {
      error.textContent = 'Ingresa un correo valido.';
      return;
    }
    if (clave.length < 6) {
      error.textContent = 'Contrasena incorrecta (minimo 6 caracteres).';
      return;
    }

    const usuario = Datos.leer('usuario', null);
    if (!usuario) {
      Datos.guardar('usuario', { nombre: 'Estudiante', apellido: 'Planify', correo: correo });
    }
    Datos.guardar('sesion', true);
    entrarSegunPago();
  });

  const btnGoogle = document.getElementById('btnGoogle');
  if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
      if (!Datos.leer('usuario', null)) {
        Datos.guardar('usuario', {
          nombre: 'Estudiante', apellido: 'Planify', correo: 'usuario@gmail.com'
        });
      }
      Datos.guardar('sesion', true);
      entrarSegunPago();
    });
  }
}
