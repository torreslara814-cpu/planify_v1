/* =========================================================
   perfil.js - Muestra y permite editar tus datos
   ========================================================= */

const campos = {
  nombre:   document.getElementById('perfilNombre'),
  apellido: document.getElementById('perfilApellido'),
  correo:   document.getElementById('perfilCorreo')
};

const usuario = Datos.leer('usuario', {
  nombre: 'Estudiante', apellido: 'Planify', correo: 'planify@correo.com'
});

campos.nombre.value   = usuario.nombre;
campos.apellido.value = usuario.apellido;
campos.correo.value   = usuario.correo;

const boton = document.getElementById('btnEditarPerfil');
let editando = false;

boton.addEventListener('click', () => {
  editando = !editando;

  // disabled = true significa "no se puede escribir"
  Object.values(campos).forEach(c => { c.disabled = !editando; });

  if (editando) {
    boton.innerHTML = '<i class="fa-solid fa-check"></i> Guardar cambios';
    campos.nombre.focus();
  } else {
    boton.innerHTML = '<i class="fa-solid fa-pen"></i> Editar perfil';
    Datos.guardar('usuario', {
      nombre:   campos.nombre.value.trim()   || 'Estudiante',
      apellido: campos.apellido.value.trim() || '-',
      correo:   campos.correo.value.trim()   || 'planify@correo.com'
    });
    avisar('Perfil actualizado');
  }
});
