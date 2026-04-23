const usuarioGuardado = JSON.parse(localStorage.getItem('usuario')) || {};

if (usuarioGuardado.tipoUsuario !== 'Moderador') {
    alert('Solo el moderador puede registrar categorias');
    window.location.href = 'listar-categorias.html';
}

async function registrarCategoria() {
    const categoria = {
        nombre: document.getElementById('txtNombre').value.trim(),
        descripcion: document.getElementById('txtDescripcion').value.trim()
    };

    try {
        const response = await fetch('http://localhost:3000/api/categorias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoria)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || 'Error al registrar categoria');
        }

        document.getElementById('mensaje').innerHTML = `
            <div class="alert alert-success">
                Categoria registrada correctamente
            </div>
        `;

        document.getElementById('txtNombre').value = '';
        document.getElementById('txtDescripcion').value = '';
    } catch (error) {
        document.getElementById('mensaje').innerHTML = `
            <div class="alert alert-danger">
                ${error.message || 'Error al registrar categoria'}
            </div>
        `;
    }
}

document.getElementById('btnRegistrar').addEventListener('click', registrarCategoria);
