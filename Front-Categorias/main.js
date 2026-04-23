const usuarioGuardado = JSON.parse(localStorage.getItem('usuario')) || {};
const tipoUsuario = usuarioGuardado.tipoUsuario || 'Usuario';

function aplicarPermisos() {
    document.getElementById('badgeRol').textContent = tipoUsuario;

    if (tipoUsuario === 'Moderador') {
        document.getElementById('panelAdmin').classList.remove('d-none');
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
            <div class="col-md-4 mb-3">
                <div class="card shadow h-100">
                    <div class="card-body">
                        <h5 class="card-title">${e.nombre}</h5>

                        <p><strong>Fecha:</strong> ${new Date(e.fecha).toLocaleDateString()}</p>

                        <p><strong>Ubicacion:</strong> ${e.ubicacion || 'No definida'}</p>

                        <p>
                            <strong>Estado:</strong>
                            <span class="badge ${e.estado === 'cancelado' ? 'bg-danger' : 'bg-success'}">
                                ${e.estado || 'activo'}
                            </span>
                        </p>

                        <button class="btn btn-primary w-100" onclick="verDetalleEventoMain('${e._id}')">
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
            opcionPrincipal.textContent = `${e.nombre} - ${new Date(e.fecha).toLocaleDateString()}`;
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

        const fecha = new Date(evento.fecha).toLocaleDateString();
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

                <p><strong>Fecha:</strong> ${new Date(e.fecha).toLocaleDateString()}</p>
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
    }
});
