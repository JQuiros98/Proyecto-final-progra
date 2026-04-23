async function cargarCategorias() {
    try {
        const response = await fetch('http://localhost:3000/api/categorias');
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || 'Error al cargar categorias');
        }

        mostrarCategorias(data.categorias || []);
    } catch (error) {
        mostrarError(error.message || 'Error al cargar categorias');
    }
}

function mostrarCategorias(categorias) {
    const tbody = document.getElementById('tbodyCategorias');
    tbody.innerHTML = '';

    if (categorias.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center text-muted">
                    No hay categorias para mostrar
                </td>
            </tr>
        `;
        return;
    }

    categorias.forEach(cat => {
        const tr = document.createElement('tr');

        const tdNombre = document.createElement('td');
        tdNombre.textContent = cat.nombre || 'Sin nombre';

        const tdDescripcion = document.createElement('td');
        tdDescripcion.textContent = cat.descripcion || 'Sin descripcion';

        tr.appendChild(tdNombre);
        tr.appendChild(tdDescripcion);
        tbody.appendChild(tr);
    });
}

async function filtrarCategorias() {
    const nombre = document.getElementById('txtFiltro').value.trim();

    if (!nombre) {
        alert('Escribe algo para filtrar');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/categorias/filtro/${nombre}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || 'Error al filtrar categorias');
        }

        mostrarCategorias(data.categorias || []);
    } catch (error) {
        mostrarError(error.message || 'Error al filtrar categorias');
    }
}

function mostrarError(mensaje) {
    const tbody = document.getElementById('tbodyCategorias');
    tbody.innerHTML = `
        <tr>
            <td colspan="2">
                <div class="alert alert-danger mb-0">
                    ${mensaje}
                </div>
            </td>
        </tr>
    `;
}

document.getElementById('btnFiltrar').addEventListener('click', filtrarCategorias);
document.getElementById('btnMostrarTodo').addEventListener('click', cargarCategorias);

cargarCategorias();
