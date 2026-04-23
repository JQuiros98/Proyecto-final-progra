let listaEventosGlobal = [];

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

async function cargarEventos() {
    try {
        const res = await fetch('http://localhost:3000/api/eventos');
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al cargar eventos');
        }

        listaEventosGlobal = data.eventos || [];
        mostrarEventos(listaEventosGlobal);
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        mostrarEventos([]);
    }
}

function mostrarEventos(eventos) {
    const lista = document.getElementById('lista');
    lista.innerHTML = '';

    if (!eventos || eventos.length === 0) {
        lista.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning">
                    No hay eventos para mostrar
                </div>
            </div>
        `;
        return;
    }

    eventos.forEach(e => {
        lista.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm h-100 border-0 evento-card">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary fw-bold">${e.nombre}</h5>

                        <p class="mb-1"><strong>Fecha:</strong> ${mostrarFechaEvento(e.fecha)}</p>

                        <p class="mb-2"><strong>Ubicacion:</strong> ${e.ubicacion || 'No definida'}</p>

                        <span class="badge mb-3 ${e.estado === 'cancelado' ? 'bg-danger' : 'bg-success'}">
                            ${e.estado || 'activo'}
                        </span>

                        <button class="btn btn-outline-primary mt-auto" onclick="verDetalle('${e._id}')">
                            Ver detalle
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

async function verDetalle(id) {
    try {
        const res = await fetch(`http://localhost:3000/api/eventos/${id}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al obtener detalle');
        }

        const e = data.evento;

        document.getElementById('detalle').innerHTML = `
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

function filtrarEventos() {
    const fechaSeleccionada = document.getElementById('filtroFecha').value;
    const estadoSeleccionado = document.getElementById('filtroEstado').value;

    let filtrados = listaEventosGlobal;

    if (fechaSeleccionada) {
        filtrados = filtrados.filter(e => obtenerFechaEvento(e.fecha) === fechaSeleccionada);
    }

    if (estadoSeleccionado) {
        filtrados = filtrados.filter(e => (e.estado || 'activo') === estadoSeleccionado);
    }

    mostrarEventos(filtrados);
}

function limpiarFiltros() {
    document.getElementById('filtroFecha').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('detalle').innerHTML = '';
    mostrarEventos(listaEventosGlobal);
}

cargarEventos();
