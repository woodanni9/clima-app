// ============================================
// CONFIGURACIÓN
// ============================================

// PEGA AQUÍ TU API KEY
const API_KEY = "efed3dfa3c5266c2d9d7b240bd31f487";

const API_URL =
    'https://api.openweathermap.org/data/2.5/weather';


// ============================================
// REFERENCIAS AL DOM
// ============================================

const formulario =
    document.getElementById('formulario');

const inputCiudad =
    document.getElementById('inputCiudad');

const resultado =
    document.getElementById('resultado');

const estado =
    document.getElementById('estado');


// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function consultarClima(ciudad) {

    // Mostrar mensaje de carga
    estado.textContent =
        '🌤️ Consultando el clima...';

    resultado.classList.remove('visible');


    try {

        // Codificar la ciudad
        const ciudadCodificada =
            encodeURIComponent(ciudad);


        // Crear URL
        const url =
            `${API_URL}?q=${ciudadCodificada}&appid=${API_KEY}&units=metric&lang=es`;


        // Hacer petición
        const respuesta =
            await fetch(url);


        // Revisar respuesta
        if (!respuesta.ok) {

            if (respuesta.status === 404) {

                throw new Error(
                    'Ciudad no encontrada'
                );

            } else if (respuesta.status === 401) {

                throw new Error(
                    'API Key inválida'
                );

            } else {

                throw new Error(
                    'Error en la petición: ' +
                    respuesta.status
                );
            }
        }


        // Convertir respuesta a JSON
        const datos =
            await respuesta.json();


        // Mostrar información
        mostrarClima(datos);


        estado.textContent =
            '✅ Datos actualizados correctamente.';


    } catch (error) {

        console.error('Error:', error);

        estado.textContent =
            `❌ ${error.message}. Intenta con otra ciudad.`;

        resultado.classList.remove('visible');
    }
}


// ============================================
// MOSTRAR CLIMA
// ============================================

function mostrarClima(datos) {

    // Extraer información
    const ciudad =
        datos.name;

    const pais =
        datos.sys.country;

    const temperatura =
        Math.round(datos.main.temp);

    const sensacion =
        Math.round(datos.main.feels_like);

    const humedad =
        datos.main.humidity;

    const presion =
        datos.main.pressure;

    const viento =
        datos.wind.speed;

    const descripcion =
        datos.weather[0].description;

    const icono =
        datos.weather[0].icon;


    // URL del icono
    const iconoUrl =
        `https://openweathermap.org/img/wn/${icono}@2x.png`;


    // Crear resultado
    resultado.innerHTML = `

        <div class="ciudad">
            ${ciudad}
        </div>

        <div class="pais">
            ${pais}
        </div>

        <img
            src="${iconoUrl}"
            alt="${descripcion}"
            class="icono-clima"
        >

        <div class="temperatura">
            ${temperatura}°C
        </div>

        <div class="descripcion">
            ${descripcion}
        </div>

        <div class="detalles">

            <div class="detalle">

                <div class="etiqueta">
                    Sensación
                </div>

                <div class="valor">
                    ${sensacion}°C
                </div>

            </div>


            <div class="detalle">

                <div class="etiqueta">
                    Humedad
                </div>

                <div class="valor">
                    ${humedad}%
                </div>

            </div>


            <div class="detalle">

                <div class="etiqueta">
                    Presión
                </div>

                <div class="valor">
                    ${presion} hPa
                </div>

            </div>


            <div class="detalle">

                <div class="etiqueta">
                    Viento
                </div>

                <div class="valor">
                    ${viento} m/s
                </div>

            </div>

        </div>
    `;


    // Mostrar resultado
    resultado.classList.add('visible');


    // Cambiar fondo
    cambiarFondoSegunClima(
        datos.weather[0].main
    );
}


// ============================================
// CAMBIAR FONDO SEGÚN CLIMA
// ============================================

function cambiarFondoSegunClima(clima) {

    // Quitar clases anteriores
    document.body.classList.remove(
        'clima-soleado',
        'clima-nublado',
        'clima-lluvioso',
        'clima-nieve'
    );


    // Convertir a minúsculas
    const climaLower =
        clima.toLowerCase();


    // Soleado
    if (climaLower.includes('clear')) {

        document.body.classList.add(
            'clima-soleado'
        );


    // Nublado
    } else if (
        climaLower.includes('cloud')
    ) {

        document.body.classList.add(
            'clima-nublado'
        );


    // Lluvioso
    } else if (
        climaLower.includes('rain') ||
        climaLower.includes('drizzle') ||
        climaLower.includes('thunderstorm')
    ) {

        document.body.classList.add(
            'clima-lluvioso'
        );


    // Nieve
    } else if (
        climaLower.includes('snow')
    ) {

        document.body.classList.add(
            'clima-nieve'
        );
    }
}


// ============================================
// EVENTO DEL FORMULARIO
// ============================================

formulario.addEventListener(
    'submit',
    (e) => {

        // Evitar recargar página
        e.preventDefault();


        // Obtener ciudad
        const ciudad =
            inputCiudad.value.trim();


        // Verificar que no esté vacío
        if (!ciudad) {

            estado.textContent =
                '⚠️ Escribe el nombre de una ciudad.';

            return;
        }


        // Consultar clima
        consultarClima(ciudad);
    }
);


// ============================================
// MENSAJE INICIAL
// ============================================

estado.textContent =
    'Escribe una ciudad y presiona "Consultar".';
