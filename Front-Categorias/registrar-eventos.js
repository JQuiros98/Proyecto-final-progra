const usuarioGuardado = JSON.parse(localStorage.getItem('usuario')) || {};

if (usuarioGuardado.tipoUsuario !== 'Promotor' && usuarioGuardado.tipoUsuario !== 'Moderador') {
    alert('Solo el promotor o moderador puede registrar eventos');
    window.location.href = 'listar-eventos.html';
}

document.getElementById('formEvento').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const fecha = document.getElementById('fecha').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const estado = document.getElementById('estado').value;

    // VALIDACIÓN DE FECHA 
    const hoy = new Date().toISOString().split('T')[0];

    if (fecha < hoy) {
        document.getElementById('mensaje').innerHTML =
            `<div class="alert alert-warning">
                No se permiten fechas pasadas
             </div>`;
        return;
    }

    const evento = {
        nombre,
        fecha,
        ubicacion,
        estado
    };

    try {
        const res = await fetch('http://localhost:3000/api/eventos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(evento)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al crear evento');
        }

        document.getElementById('mensaje').innerHTML =
            `<div class="alert alert-success">
                Evento creado correctamente
             </div>`;

        document.getElementById('formEvento').reset();

    } catch (error) {
        document.getElementById('mensaje').innerHTML =
            `<div class="alert alert-danger">
                Error al crear evento
             </div>`;
    }
});
