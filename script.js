// ============================================
// CONFIGURACIÓN
// ============================================

// PEGA AQUÍ TU API KE
const API_KEY = 'efed3dfa3c5266c2d9d7b240bd31f487';

const API_URL =
    'https://api.openweathermap.org/data/k2.5/weather';


// ============================================
// ELEMENTOS HTML
// ============================================

const formulario =
    document.getElementById("formulario");


const inputCiudad =
    document.getElementById("inputCiudad");


const resultado =
    document.getElementById("resultado");


const estado =
    document.getElementById("estado");


const btnUbicacion =
    document.getElementById("btnUbicacion");


const btnTema =
    document.getElementById("btnTema");


const pronostico =
    document.getElementById("pronostico");


const tarjetasPronostico =
    document.getElementById("tarjetasPronostico");


const seccionHistorial =
    document.getElementById("seccionHistorial");


const historialBotones =
    document.getElementById("historialBotones");


// ============================================
// RETO 3
// HISTORIAL DE CIUDADES
// ============================================

let historial =
    JSON.parse(
        localStorage.getItem("historialClima")
    ) || [];


function guardarEnHistorial(ciudad) {

    ciudad = ciudad.trim();


    historial =
        historial.filter(
            item =>
                item.toLowerCase() !==
                ciudad.toLowerCase()
        );


    historial.unshift(ciudad);


    historial =
        historial.slice(0, 5);


    localStorage.setItem(
        "historialClima",
        JSON.stringify(historial)
    );


    mostrarHistorial();
}


function mostrarHistorial() {

    historialBotones.innerHTML = "";


    if (historial.length === 0) {

        seccionHistorial.hidden = true;

        return;
    }


    seccionHistorial.hidden = false;


    historial.forEach(ciudad => {

        const boton =
            document.createElement("button");


        boton.textContent =
            "🌎 " + ciudad;


        boton.addEventListener(
            "click",
            function () {

                inputCiudad.value = ciudad;

                consultarClima(ciudad);

            }
        );


        historialBotones.appendChild(boton);

    });
}


// ============================================
// CONSULTAR CLIMA
// ============================================

async function consultarClima(ciudad) {

    if (
        !API_KEY ||
        API_KEY === "TU_API_KEY_NUEVA"
    ) {

        estado.textContent =
            "❌ Coloca tu API Key en script.js.";

        return;
    }


    estado.textContent =
        "⏳ Consultando el clima...";


    resultado.hidden = true;

    pronostico.hidden = true;


    try {

        const ciudadCodificada =
            encodeURIComponent(ciudad);


        const url =
            `${API_URL}?q=${ciudadCodificada}` +
            `&appid=${API_KEY}` +
            `&units=metric` +
            `&lang=es`;


        const respuesta =
            await fetch(url);


        if (!respuesta.ok) {

            const errorAPI =
                await respuesta.json();


            console.log(
                "Error de OpenWeatherMap:",
                errorAPI
            );


            if (respuesta.status === 404) {

                throw new Error(
                    "Ciudad no encontrada"
                );
            }


            if (respuesta.status === 401) {

                throw new Error(
                    "La API Key no fue aceptada"
                );
            }


            if (respuesta.status === 429) {

                throw new Error(
                    "Demasiadas solicitudes"
                );
            }


            throw new Error(
                errorAPI.message ||
                `Error HTTP ${respuesta.status}`
            );
        }


        const datos =
            await respuesta.json();


        mostrarClima(datos);


        await mostrarPronostico(
            datos.name
        );


        guardarEnHistorial(
            datos.name
        );


        estado.textContent =
            "✅ Datos actualizados correctamente.";

    }


    catch (error) {

        console.error(error);


        estado.textContent =
            "❌ " + error.message;


        resultado.hidden = true;

        pronostico.hidden = true;

    }

}


// ============================================
// MOSTRAR CLIMA ACTUAL
// ============================================

function mostrarClima(datos) {

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


    const iconoURL =
        `https://openweathermap.org/img/wn/${icono}@2x.png`;


    resultado.innerHTML = `

        <div class="ciudad">
            ${escapeHTML(ciudad)}
        </div>


        <div class="pais">
            🌎 ${escapeHTML(pais)}
        </div>


        <img
            src="${iconoURL}"
            alt="${escapeHTML(descripcion)}"
            class="icono-clima"
        >


        <div class="temperatura">
            ${temperatura}°C
        </div>


        <div class="descripcion">
            ${escapeHTML(descripcion)}
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


        <!-- RETO 5 -->

        <button
            type="button"
            class="btn-whatsapp"
            id="btnWhatsApp"
        >
            📲 Compartir por WhatsApp
        </button>

    `;


    resultado.hidden = false;


    cambiarFondoSegunClima(
        datos.weather[0].main
    );


    document
        .getElementById("btnWhatsApp")
        .addEventListener(
            "click",
            function () {

                compartirWhatsApp(
                    ciudad,
                    temperatura,
                    descripcion
                );

            }
        );

}


// ============================================
// RETO 2
// PRONÓSTICO DE 5 DÍAS
// ============================================

async function mostrarPronostico(ciudad) {

    const ciudadCodificada =
        encodeURIComponent(ciudad);


    const url =
        `${FORECAST_URL}?q=${ciudadCodificada}` +
        `&appid=${API_KEY}` +
        `&units=metric` +
        `&lang=es`;


    const respuesta =
        await fetch(url);


    if (!respuesta.ok) {

        throw new Error(
            "No se pudo cargar el pronóstico"
        );

    }


    const datos =
        await respuesta.json();


    const porDia = {};


    datos.list.forEach(item => {

        const fecha =
            item.dt_txt.split(" ")[0];


        if (!porDia[fecha]) {

            porDia[fecha] = item;

        }

    });


    const dias =
        Object.values(porDia).slice(0, 5);


    tarjetasPronostico.innerHTML = "";


    dias.forEach(item => {

        const fecha =
            new Date(item.dt * 1000);


        const nombreDia =
            fecha.toLocaleDateString(
                "es-MX",
                {
                    weekday: "short"
                }
            );


        const fechaCorta =
            fecha.toLocaleDateString(
                "es-MX",
                {
                    day: "2-digit",
                    month: "2-digit"
                }
            );


        const temperatura =
            Math.round(item.main.temp);


        const descripcion =
            item.weather[0].description;


        const icono =
            item.weather[0].icon;


        const tarjeta =
            document.createElement("div");


        tarjeta.className =
            "tarjeta-dia";


        tarjeta.innerHTML = `

            <div class="fecha">

                ${nombreDia}<br>

                ${fechaCorta}

            </div>


            <img
                src="https://openweathermap.org/img/wn/${icono}@2x.png"
                alt="${escapeHTML(descripcion)}"
            >


            <div class="temp">
                ${temperatura}°C
            </div>


            <div class="desc">
                ${escapeHTML(descripcion)}
            </div>

        `;


        tarjetasPronostico.appendChild(
            tarjeta
        );

    });


    pronostico.hidden = false;

}


// ============================================
// RETO 1
// MI UBICACIÓN
// ============================================

btnUbicacion.addEventListener(
    "click",
    function () {

        if (!navigator.geolocation) {

            estado.textContent =
                "❌ Tu navegador no permite geolocalización.";

            return;
        }


        estado.textContent =
            "📍 Obteniendo tu ubicación...";


        navigator.geolocation.getCurrentPosition(

            async function (posicion) {

                const lat =
                    posicion.coords.latitude;


                const lon =
                    posicion.coords.longitude;


                try {

                    const url =
                        `${API_URL}?lat=${lat}` +
                        `&lon=${lon}` +
                        `&appid=${API_KEY}` +
                        `&units=metric` +
                        `&lang=es`;


                    const respuesta =
                        await fetch(url);


                    if (!respuesta.ok) {

                        throw new Error(
                            "No se pudo obtener el clima"
                        );

                    }


                    const datos =
                        await respuesta.json();


                    mostrarClima(datos);


                    await mostrarPronostico(
                        datos.name
                    );


                    guardarEnHistorial(
                        datos.name
                    );


                    estado.textContent =
                        "📍 Clima obtenido de tu ubicación.";

                }


                catch (error) {

                    console.error(error);


                    estado.textContent =
                        "❌ " + error.message;

                }

            },


            function (error) {

                console.error(error);


                if (error.code === 1) {

                    estado.textContent =
                        "❌ Permiso de ubicación denegado.";

                }

                else {

                    estado.textContent =
                        "❌ No se pudo obtener tu ubicación.";

                }

            }

        );

    }
);


// ============================================
// RETO 4
// MODO CLARO / OSCURO
// ============================================

btnTema.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "claro"
        );


        const modoClaro =
            document.body.classList.contains(
                "claro"
            );


        if (modoClaro) {

            btnTema.textContent =
                "🌙 Modo oscuro";


            localStorage.setItem(
                "temaClima",
                "claro"
            );

        }

        else {

            btnTema.textContent =
                "☀️ Modo claro";


            localStorage.setItem(
                "temaClima",
                "oscuro"
            );

        }

    }
);


// ============================================
// CARGAR TEMA
// ============================================

function cargarTema() {

    const tema =
        localStorage.getItem(
            "temaClima"
        );


    if (tema === "claro") {

        document.body.classList.add(
            "claro"
        );


        btnTema.textContent =
            "🌙 Modo oscuro";

    }

    else {

        btnTema.textContent =
            "☀️ Modo claro";

    }

}


// ============================================
// RETO 5
// COMPARTIR POR WHATSAPP
// ============================================

function compartirWhatsApp(
    ciudad,
    temperatura,
    descripcion
) {

    const texto =
        `🌤️ El clima en ${ciudad} ` +
        `es de ${temperatura}°C. ` +
        `Condición: ${descripcion}.`;


    const url =
        "https://wa.me/?text=" +
        encodeURIComponent(texto);


    window.open(
        url,
        "_blank"
    );

}


// ============================================
// CAMBIAR FONDO SEGÚN CLIMA
// ============================================

function cambiarFondoSegunClima(clima) {

    document.body.classList.remove(
        "clima-soleado",
        "clima-nublado",
        "clima-lluvioso",
        "clima-nieve"
    );


    const climaLower =
        clima.toLowerCase();


    if (
        climaLower.includes("clear")
    ) {

        document.body.classList.add(
            "clima-soleado"
        );

    }


    else if (
        climaLower.includes("cloud")
    ) {

        document.body.classList.add(
            "clima-nublado"
        );

    }


    else if (
        climaLower.includes("rain") ||
        climaLower.includes("drizzle") ||
        climaLower.includes("thunderstorm")
    ) {

        document.body.classList.add(
            "clima-lluvioso"
        );

    }


    else if (
        climaLower.includes("snow")
    ) {

        document.body.classList.add(
            "clima-nieve"
        );

    }

}


// ============================================
// FORMULARIO
// ============================================

formulario.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const ciudad =
            inputCiudad.value.trim();


        if (!ciudad) {

            estado.textContent =
                "⚠️ Escribe una ciudad.";


            inputCiudad.focus();


            return;

        }


        consultarClima(ciudad);

    }
);


// ============================================
// SEGURIDAD
// ============================================

function escapeHTML(texto) {

    const div =
        document.createElement("div");


    div.textContent =
        texto;


    return div.innerHTML;

}


// ============================================
// INICIO
// ============================================

mostrarHistorial();

cargarTema();


estado.textContent =
    'Escribe una ciudad y presiona "Consultar".';
