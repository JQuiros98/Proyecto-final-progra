document.addEventListener('DOMContentLoaded', function () {

    // Registro
    const form = document.getElementById('formRegistro');

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (form.checkValidity()) {
                const usuario = {
                    nombre: document.getElementById('txtNombre').value.trim(),
                    cedula: document.getElementById('txtCedula').value.trim(),
                    email: document.getElementById('txtEmail').value.trim(),
                    password: document.getElementById('txtPassword').value.trim(),
                    tipoUsuario: document.getElementById('sltUsuario').value
                };

                try {
                    const response = await fetch('http://localhost:3000/api/usuarios', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(usuario)
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.mensaje);
                    }

                    mostrarMensaje('Usuario registrado exitosamente', 'success');
                    form.reset();
                    form.classList.remove('was-validated');
                } catch (error) {
                    mostrarMensaje(error.message || 'Error al registrar usuario', 'danger');
                }
            } else {
                form.classList.add('was-validated');
            }
        });
    }

    // Login
    const formLogin = document.getElementById('formLogin');

    if (formLogin) {
        formLogin.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('http://localhost:3000/api/usuarios/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.mensaje);
                }

                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                window.location.href = 'main.html';
            } catch (error) {
                mostrarMensajeLogin(error.message || 'Error al iniciar sesion', 'danger');

                if (error.message === 'Usuario no encontrado') {
                    const panelRegistro = document.getElementById('offcanvasRegistro');
                    const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(panelRegistro);
                    offcanvas.show();
                }
            }
        });
    }
});

function mostrarMensaje(texto, tipo) {
    const contenedor = document.getElementById('formRegistro');
    const anterior = contenedor.querySelector('.alert');

    if (anterior) {
        anterior.remove();
    }

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} mt-3`;
    alerta.textContent = texto;

    contenedor.appendChild(alerta);

    setTimeout(() => alerta.remove(), 3000);
}

function mostrarMensajeLogin(texto, tipo) {
    const formLogin = document.getElementById('formLogin');
    const anterior = formLogin.querySelector('.alert');

    if (anterior) {
        anterior.remove();
    }

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} mt-2`;
    alerta.textContent = texto;

    formLogin.appendChild(alerta);

    setTimeout(() => alerta.remove(), 3000);
}
