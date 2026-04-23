const usuarioGuardado = JSON.parse(localStorage.getItem('usuario')) || {};
const tipoUsuario = usuarioGuardado.tipoUsuario || 'Usuario';
let listaUsuariosGlobal = [];

function obtenerFechaEvento(fecha) {
    return fecha ? fecha.split('T')[0] : '';
}

function mostrarFechaEvento(fecha) {
    const fechaEvento = obtenerFechaEvento(fecha);

    if (!fechaEvento) {
        return 'No definida';
    }

    const partes = fechaEvento.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function aplicarPermisos() {
    document.getElementById('badgeRol').textContent = tipoUsuario;

    if (tipoUsuario === 'Moderador') {
        document.getElementById('panelAdmin').classList.remove('d-none');
        document.getElementById('itemUsuarios').classList.remove('d-none');
    }
}

async function cargarUsuarios() {
    try {
        const res = await fetch('http://localhost:3000/api/usuarios');
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al cargar usuarios');
        }

        listaUsuariosGlobal = data.usuarios || [];
        mostrarUsuarios(listaUsuariosGlobal);
    } catch (error) {
        document.getElementById('listaUsuarios').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    ${error.message || 'Error al cargar usuarios'}
                </div>
            </div>
        `;
    }
}

function mostrarUsuarios(usuarios) {
    const lista = document.getElementById('listaUsuarios');
    const total = document.getElementById('totalUsuarios');

    lista.innerHTML = '';
    total.textContent = `${usuarios.length} usuarios`;

    if (usuarios.length === 0) {
        lista.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning mb-0">
                    No hay usuarios para mostrar
                </div>
            </div>
        `;
        return;
    }

    usuarios.forEach(usuario => {
        lista.innerHTML += `
            <div class="col-md-4">
                <div class="card shadow-sm h-100 border-0">
                    <div class="card-body">
                        <h5 class="card-title text-primary fw-bold">${usuario.nombre}</h5>
                        <p class="mb-1"><strong>Email:</strong> ${usuario.email}</p>
                        <p class="mb-2"><strong>Cedula:</strong> ${usuario.cedula}</p>
                        <span class="badge bg-dark">${usuario.tipoUsuario}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

function filtrarUsuarios() {
    const tipoSeleccionado = document.getElementById('filtroTipoUsuario').value;

    if (!tipoSeleccionado) {
        mostrarUsuarios(listaUsuariosGlobal);
        return;
    }

    const usuariosFiltrados = listaUsuariosGlobal.filter(usuario => usuario.tipoUsuario === tipoSeleccionado);
    mostrarUsuarios(usuariosFiltrados);
}

function mostrarSeccionUsuarios() {
    const seccionUsuarios = document.getElementById('seccionUsuarios');
    seccionUsuarios.classList.toggle('d-none');

    if (!seccionUsuarios.classList.contains('d-none')) {
        cargarUsuarios();
    }
}

function cargarInformacionUsuario() {
    document.getElementById('infoNombre').textContent = usuarioGuardado.nombre || 'Usuario invitado';
    document.getElementById('infoEmail').textContent = usuarioGuardado.email || 'No disponible';
    document.getElementById('infoCedula').textContent = usuarioGuardado.cedula || 'No disponible';
    document.getElementById('infoTipoUsuario').textContent = tipoUsuario;

    if (tipoUsuario === 'Usuario') {
        document.getElementById('seccionEventosGuardados').classList.remove('d-none');
        cargarEventosGuardados();
    }
}

async function cargarCategorias() {
    const res = await fetch('http://localhost:3000/api/categorias');
    const data = await res.json();

    const lista = document.getElementById('listaCategorias');
    const adminLista = document.getElementById('adminCategorias');

    lista.innerHTML = '';
    adminLista.innerHTML = '';

    data.categorias.forEach(cat => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-start gap-3';

        const contenido = document.createElement('div');
        contenido.innerHTML = `
            <h5 class="mb-1">${cat.nombre}</h5>
            <p class="mb-0 text-muted">${cat.descripcion || 'Sin descripcion'}</p>
        `;
        li.appendChild(contenido);

        if (tipoUsuario === 'Moderador') {
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn btn-danger btn-sm';
            btnEliminar.innerHTML = '<i class="bi bi-trash3"></i> Eliminar';
            btnEliminar.addEventListener('click', () => eliminarCategoriaMain(cat._id));
            li.appendChild(btnEliminar);
        }

        lista.appendChild(li);

        const liAdmin = document.createElement('li');
        liAdmin.className = 'list-group-item';
        liAdmin.innerHTML = `
            <strong>${cat.nombre}</strong>
            <br>
            <small class="text-muted">${cat.descripcion || 'Sin descripcion'}</small>
        `;
        adminLista.appendChild(liAdmin);
    });
}

async function eliminarCategoriaMain(id) {
    const confirmar = confirm('¿Deseas eliminar esta categoria?');

    if (!confirmar) {
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/categorias/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al eliminar categoria');
        }

        alert(data.mensaje);
        cargarCategorias();
    } catch (error) {
        alert(error.message || 'Error al eliminar categoria');
    }
}

async function cargarEventos() {
    try {
        const res = await fetch('http://localhost:3000/api/eventos');
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al cargar eventos');
        }

        mostrarEventos(data.eventos || []);
    } catch (error) {
        const contenedor = document.getElementById('listaEventos');
        contenedor.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger">
                    Error al cargar eventos
                </div>
            </div>
        `;
        console.error('Error al cargar eventos:', error);
    }
}

function mostrarEventos(eventos) {
    const contenedor = document.getElementById('listaEventos');
    const adminLista = document.getElementById('adminEventos');
    const selectPrincipal = document.getElementById('selectEventoPrincipal');
    const selectDuplicado = document.getElementById('selectEventoDuplicado');

    contenedor.innerHTML = '';
    adminLista.innerHTML = '';

    if (selectPrincipal && selectDuplicado) {
        selectPrincipal.innerHTML = '';
        selectDuplicado.innerHTML = '';
    }

    if (eventos.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning">
                    No hay eventos para mostrar
                </div>
            </div>
        `;
        return;
    }

    eventos.forEach(e => {
        const botonEliminar = tipoUsuario === 'Moderador'
            ? `<button class="btn btn-danger w-100 mt-2" onclick="eliminarEventoMain('${e._id}')">
                    <i class="bi bi-trash3"></i> Eliminar evento
               </button>`
            : '';
        const botonGuardar = tipoUsuario === 'Usuario'
            ? `<button class="btn btn-outline-success w-100 mt-2" onclick="guardarEventoPersonal('${e._id}')">
                    <i class="bi bi-bookmark-plus"></i> Guardar evento
               </button>`
            : '';

        contenedor.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm h-100 border-0 evento-card">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary fw-bold">${e.nombre}</h5>

                        <p class="mb-1"><strong>Fecha:</strong> ${mostrarFechaEvento(e.fecha)}</p>

                        <p class="mb-2"><strong>Ubicacion:</strong> ${e.ubicacion || 'No definida'}</p>

                        <span class="badge mb-3 ${e.estado === 'cancelado' ? 'bg-danger' : 'bg-success'}">
                            ${e.estado || 'activo'}
                        </span>

                        <button class="btn btn-outline-primary mt-auto" onclick="verDetalleEventoMain('${e._id}')">
                            Ver detalle
                        </button>

                        ${botonEliminar}
                        ${botonGuardar}
                    </div>
                </div>
            </div>
        `;

        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = e.nombre;
        adminLista.appendChild(li);

        if (selectPrincipal && selectDuplicado) {
            const opcionPrincipal = document.createElement('option');
            opcionPrincipal.value = e._id;
            opcionPrincipal.textContent = `${e.nombre} - ${mostrarFechaEvento(e.fecha)}`;
            selectPrincipal.appendChild(opcionPrincipal);

            const opcionDuplicado = opcionPrincipal.cloneNode(true);
            selectDuplicado.appendChild(opcionDuplicado);
        }
    });
}

async function guardarEventoPersonal(idEvento) {
    if (!usuarioGuardado._id) {
        alert('Debes iniciar sesion para guardar eventos');
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/usuarios/${usuarioGuardado._id}/eventos-guardados/${idEvento}`, {
            method: 'POST'
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al guardar evento');
        }

        alert(data.mensaje);
        cargarEventosGuardados();
    } catch (error) {
        alert(error.message || 'Error al guardar evento');
    }
}

async function eliminarEventoGuardado(idEvento) {
    try {
        const res = await fetch(`http://localhost:3000/api/usuarios/${usuarioGuardado._id}/eventos-guardados/${idEvento}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al quitar evento guardado');
        }

        cargarEventosGuardados();
    } catch (error) {
        alert(error.message || 'Error al quitar evento guardado');
    }
}

async function cargarEventosGuardados() {
    const lista = document.getElementById('listaEventosGuardados');

    if (!lista) {
        return;
    }

    lista.innerHTML = '';

    if (!usuarioGuardado._id) {
        lista.innerHTML = `
            <li class="list-group-item text-muted">
                No se encontro el usuario
            </li>
        `;
        return;
    }

    let eventosGuardados = [];

    try {
        const res = await fetch(`http://localhost:3000/api/usuarios/${usuarioGuardado._id}/eventos-guardados`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al cargar eventos guardados');
        }

        eventosGuardados = data.eventos || [];
    } catch (error) {
        lista.innerHTML = `
            <li class="list-group-item text-danger">
                ${error.message || 'Error al cargar eventos guardados'}
            </li>
        `;
        return;
    }

    if (eventosGuardados.length === 0) {
        lista.innerHTML = `
            <li class="list-group-item text-muted">
                No tienes eventos guardados
            </li>
        `;
        return;
    }

    eventosGuardados.forEach(evento => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';

        const fecha = mostrarFechaEvento(evento.fecha);
        li.innerHTML = `
            <span>${evento.nombre} - ${fecha}</span>
            <button class="btn btn-outline-danger btn-sm" onclick="eliminarEventoGuardado('${evento._id}')">
                Quitar
            </button>
        `;

        lista.appendChild(li);
    });
}

async function fusionarEventos() {
    const idPrincipal = document.getElementById('selectEventoPrincipal').value;
    const idDuplicado = document.getElementById('selectEventoDuplicado').value;
    const mensajeFusion = document.getElementById('mensajeFusion');

    if (!idPrincipal || !idDuplicado) {
        mensajeFusion.innerHTML = `
            <div class="alert alert-warning">
                Debes seleccionar dos eventos
            </div>
        `;
        return;
    }

    if (idPrincipal === idDuplicado) {
        mensajeFusion.innerHTML = `
            <div class="alert alert-warning">
                Debes seleccionar eventos diferentes
            </div>
        `;
        return;
    }

    const confirmar = confirm('¿Deseas fusionar estos eventos? El evento duplicado sera eliminado.');

    if (!confirmar) {
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/eventos/fusionar/${idPrincipal}/${idDuplicado}`, {
            method: 'PUT'
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al fusionar eventos');
        }

        mensajeFusion.innerHTML = `
            <div class="alert alert-success">
                ${data.mensaje}
            </div>
        `;

        document.getElementById('detalleEventoMain').innerHTML = '';
        cargarEventos();
    } catch (error) {
        mensajeFusion.innerHTML = `
            <div class="alert alert-danger">
                ${error.message || 'Error al fusionar eventos'}
            </div>
        `;
    }
}

async function eliminarEventoMain(id) {
    const confirmar = confirm('¿Deseas eliminar este evento?');

    if (!confirmar) {
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/eventos/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al eliminar evento');
        }

        document.getElementById('detalleEventoMain').innerHTML = '';
        alert(data.mensaje);
        cargarEventos();
    } catch (error) {
        alert(error.message || 'Error al eliminar evento');
    }
}

async function verDetalleEventoMain(id) {
    try {
        const res = await fetch(`http://localhost:3000/api/eventos/${id}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al obtener detalle');
        }

        const e = data.evento;

        document.getElementById('detalleEventoMain').innerHTML = `
            <div class="card shadow p-4">
                <h3 class="text-primary">${e.nombre}</h3>
                <hr>

                <p><strong>Fecha:</strong> ${mostrarFechaEvento(e.fecha)}</p>
                <p><strong>Ubicacion:</strong> ${e.ubicacion || 'No definida'}</p>

                <p>
                    <strong>Estado:</strong>
                    <span class="badge ${e.estado === 'cancelado' ? 'bg-danger' : 'bg-success'}">
                        ${e.estado || 'activo'}
                    </span>
                </p>
            </div>
        `;
    } catch (error) {
        console.error('Error al obtener detalle:', error);
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = 'registro-usuario.html';
}

function abrirPaginaCategorias(event) {
    event.preventDefault();

    if (tipoUsuario === 'Moderador') {
        window.location.href = 'registrar-categorias.html';
    } else {
        window.location.href = 'listar-categorias.html';
    }
}

function abrirPaginaEventos(event) {
    event.preventDefault();

    if (tipoUsuario === 'Promotor' || tipoUsuario === 'Moderador') {
        window.location.href = 'registrar-evento.html';
    } else {
        window.location.href = 'listar-eventos.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    aplicarPermisos();
    cargarInformacionUsuario();
    cargarCategorias();
    cargarEventos();

    document.getElementById('linkCategorias').addEventListener('click', abrirPaginaCategorias);
    document.getElementById('linkEventos').addEventListener('click', abrirPaginaEventos);
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);

    if (tipoUsuario === 'Moderador') {
        document.getElementById('btnFusionarEventos').addEventListener('click', fusionarEventos);
        document.getElementById('btnVerUsuarios').addEventListener('click', mostrarSeccionUsuarios);
        document.getElementById('btnFiltrarUsuarios').addEventListener('click', filtrarUsuarios);
    }
});
