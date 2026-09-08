/* =========================================================
   pago.js - Pantallas de pago de PLANIFY
   1) Primer pago al registrarse (pago-registro.html)
   2) Renovacion y estado de cuenta (pago-actualizar.html)
   3) Aviso de plan vencido (pago-bloqueado.html)
   Es una simulacion escolar: no hay banco ni servidor real,
   todo se guarda en la memoria del navegador.

   Ojo: los planes (PLANES), estadoPago() y registrarPago()
   viven en comun.js, porque TODAS las paginas necesitan saber
   si el plan esta vencido para poder bloquearse.
   ========================================================= */


/* =========================================================
   PANTALLA 1: PRIMER PAGO (pago-registro.html)
   ========================================================= */
const formPagoRegistro = document.getElementById('formPagoRegistro');
if (formPagoRegistro) {
  const error = document.getElementById('errorPago');
  /* Si en el registro ya toco un plan, empiezo con ese */
  let planElegido = Datos.leer('planElegido', 'mensual');
  if (!PLANES[planElegido]) planElegido = 'mensual';

  /* Saludo con el nombre que puso en el registro */
  const usuario = Datos.leer('usuario', null);
  const saludo = document.getElementById('saludoPago');
  if (saludo && usuario && usuario.nombre) {
    saludo.textContent = 'Ya casi, ' + usuario.nombre + '! Elegi tu plan.';
  }

  /* Marcar el plan que toca la persona */
  function marcarPlan() {
    document.querySelectorAll('.tarjeta-plan').forEach(caja => {
      caja.classList.toggle('elegido', caja.dataset.plan === planElegido);
    });
    const plan = PLANES[planElegido];
    const resumen = document.getElementById('resumenPlan');
    if (resumen) {
      resumen.textContent = plan.nombre + ' - $' + conPuntos(plan.precio) + ' por ' + plan.periodo;
    }
  }

  document.querySelectorAll('.tarjeta-plan').forEach(caja => {
    caja.addEventListener('click', () => {
      planElegido = caja.dataset.plan;
      Datos.guardar('planElegido', planElegido);
      marcarPlan();
    });
  });
  marcarPlan();

  /* Mientras escribe la tarjeta, la separo cada 4 numeros */
  const campoTarjeta = document.getElementById('numeroTarjeta');
  campoTarjeta.addEventListener('input', () => {
    const soloNumeros = campoTarjeta.value.replace(/\D/g, '').slice(0, 16);
    campoTarjeta.value = soloNumeros.replace(/(.{4})/g, '$1 ').trim();
  });

  const campoVence = document.getElementById('venceTarjeta');
  campoVence.addEventListener('input', () => {
    let v = campoVence.value.replace(/\D/g, '').slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    campoVence.value = v;
  });

  const campoCodigo = document.getElementById('codigoTarjeta');
  campoCodigo.addEventListener('input', () => {
    campoCodigo.value = campoCodigo.value.replace(/\D/g, '').slice(0, 4);
  });

  /* Al enviar: reviso los datos y confirmo el pago */
  formPagoRegistro.addEventListener('submit', (e) => {
    e.preventDefault();
    error.textContent = '';

    const titular = document.getElementById('titular').value.trim();
    const numero  = campoTarjeta.value.replace(/\s/g, '');

    if (titular.length < 3) {
      error.textContent = 'Escribi el nombre que figura en la tarjeta.';
      return;
    }
    if (numero.length !== 16) {
      error.textContent = 'El numero de la tarjeta tiene que tener 16 digitos.';
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(campoVence.value)) {
      error.textContent = 'La fecha de vencimiento va asi: 08/27';
      return;
    }
    if (campoCodigo.value.length < 3) {
      error.textContent = 'El codigo de seguridad tiene 3 o 4 numeros.';
      return;
    }

    registrarPago(planElegido, numero, titular);
    Datos.guardar('sesion', true);
    avisar('Pago confirmado. Bienvenida a Planify!');
    setTimeout(() => { window.location.href = 'panel.html'; }, 1200);
  });
}

/* =========================================================
   PANTALLA 3: BLOQUEO POR PLAN VENCIDO (pago-bloqueado.html)
   Muestra por que esta bloqueado y deja renovar en un clic.
   ========================================================= */
const tarjetaBloqueo = document.getElementById('btnPagarAhora');
if (tarjetaBloqueo) {
  const estado = estadoPago();
  const usuario = Datos.leer('usuario', null);
  const plan = PLANES[estado.plan] || PLANES.mensual;

  document.getElementById('bloqueoNombre').textContent =
    usuario && usuario.nombre ? usuario.nombre : 'Estudiante';
  document.getElementById('bloqueoVence').textContent =
    estado.vence ? fechaLinda(estado.vence) : 'todavia no elegiste plan';
  document.getElementById('bloqueoPlan').textContent =
    plan.nombre + ': $' + conPuntos(plan.precio) + ' por ' + plan.periodo;

  /* Si nunca eligio plan, el texto es distinto */
  if (estado.situacion === 'sin-plan') {
    document.querySelector('#tituloBloqueo').textContent = 'Todavia no tenes un plan';
    document.getElementById('textoBloqueo').textContent =
      'Para entrar a tus notas, calendarios y recordatorios elegi un plan.';
  }

  /* Renovar y volver al panel */
  tarjetaBloqueo.addEventListener('click', () => {
    registrarPago(estado.plan || 'mensual', estado.tarjeta || '4271', estado.titular);
    avisar('Listo! Tu plan quedo activo otra vez');
    setTimeout(() => { window.location.href = 'panel.html'; }, 1200);
  });
}

/* =========================================================
   PANTALLA 2: RENOVAR Y ESTADO DE CUENTA (pago-actualizar.html)
   ========================================================= */
const zonaEstado = document.getElementById('zonaEstadoPago');
if (zonaEstado) {
  const usuario = Datos.leer('usuario', null);
  const nombre = usuario && usuario.nombre ? usuario.nombre : 'Ruth';

  const saludo = document.getElementById('saludoEstado');
  if (saludo) saludo.textContent = 'Hola de nuevo, ' + nombre;

  /* Dibuja toda la informacion de la cuenta en pantalla */
  function dibujarEstado() {
    const estado = estadoPago();
    const plan = PLANES[estado.plan] || PLANES.mensual;

    const franja = document.getElementById('franjaEstado');
    const pastilla = document.getElementById('pastillaEstado');
    const bajada = document.getElementById('bajadaEstado');

    franja.className = 'franja-pago';
    pastilla.className = 'pastilla-estado';

    if (estado.situacion === 'sin-plan' || estado.situacion === 'vencido') {
      franja.classList.add('es-vencido');
      pastilla.classList.add('es-vencido');
      franja.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> VENCIDO';
      pastilla.textContent = 'Vencido';
      bajada.textContent = 'Renova tu plan para seguir usando Planify';
    } else if (estado.situacion === 'por-vencer') {
      franja.classList.add('es-por-vencer');
      pastilla.classList.add('es-por-vencer');
      franja.innerHTML = '<i class="fa-regular fa-clock"></i> POR VENCER';
      pastilla.textContent = 'Por vencer';
      bajada.textContent = 'Te quedan ' + estado.dias + ' dias. Renova tu plan para seguir usando Planify';
    } else {
      franja.classList.add('es-al-dia');
      pastilla.classList.add('es-al-dia');
      franja.innerHTML = '<i class="fa-solid fa-circle-check"></i> AL DIA';
      pastilla.textContent = 'Al dia';
      bajada.textContent = 'Tu cuenta esta al dia. Gracias por usar Planify!';
    }

    document.getElementById('datoPlan').textContent =
      plan.nombre + ': $' + conPuntos(plan.precio);
    document.getElementById('datoVence').textContent =
      estado.vence ? fechaLinda(estado.vence) : 'Sin plan activo';
    document.getElementById('datoTarjeta').textContent =
      'Tarjeta terminada en ***' + (estado.tarjeta || '4271');
  }

  dibujarEstado();

  /* Boton Actualizar Pago: renueva el plano que ya tenia */
  document.getElementById('btnActualizarPago').addEventListener('click', () => {
    const estado = estadoPago();
    registrarPago(estado.plan || 'mensual', estado.tarjeta || '4271', estado.titular);
    dibujarEstado();
    avisar('Pago actualizado. Tu plan sigue activo!');
  });

  /* Boton Cambiar de Plan: abre y cierra las dos opciones */
  const cajaPlanes = document.getElementById('cajaPlanes');
  document.getElementById('btnCambiarPlan').addEventListener('click', () => {
    cajaPlanes.hidden = !cajaPlanes.hidden;
  });

  cajaPlanes.querySelectorAll('[data-plan]').forEach(boton => {
    boton.addEventListener('click', () => {
      const estado = estadoPago();
      registrarPago(boton.dataset.plan, estado.tarjeta || '4271', estado.titular);
      cajaPlanes.hidden = true;
      dibujarEstado();
      avisar('Ahora tenes el ' + PLANES[boton.dataset.plan].nombre);
    });
  });
}
