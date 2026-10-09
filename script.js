// ==========================================
// CONFIGURACIÓN
// ==========================================

// Escribe aquí tu API Key nueva, sin compartirla.
const API_KEY = "efed3dfa3c5266c2d9d7b240bd31f487";

const API_URL =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
    "https://api.openweathermap.org/data/2.5/forecast";

// ==========================================
// ELEMENTOS HTML
// ==========================================

const formulario = document.getElementById("formulario");
const inputCiudad = document.getElementById("inputCiudad");
const resultado = document.getElementById("resultado");
const estado = document.getElementById("estado");
const btnUbicacion = document.getElementById("btnUbicacion");
const btnTema = document.getElementById("btnTema");
const pronostico = document.getElementById("pronostico");
const tarjetasPronostico =
    document.getElementById("tarjetasPronostico");
const seccionHistorial =
    document.getElementById("seccionHistorial");
const historialBotones =
    document.getElementById("historialBotones");

// ==========================================
// RETO 3: HISTORIAL DE CINCO CIUDADES
// ==========================================

let historial = [];

try {
    historial = JSON.parse(
        localStorage.getItem("historialClima") || "[]"
    );

    if (!Array.isArray(historial)) {
        historial = [];
    }
} catch {
    historial = [];
}

function guardarEnHistorial(ciudad) {
    historial = historial.filter(
        item => item.toLowerCase() !== ciudad.toLowerCase()
    );

    historial.unshift(ciudad);
    historial = historial.slice(0, 5);

    try {
        localStorage.setItem(
            "historialClima",
            JSON.stringify(historial)
        );
    } catch (error) {
        console.error("No se pudo guardar el historial", error);
    }

    mostrarHistorial();
}

function mostrarHistorial() {
    historialBotones.replaceChildren();

    seccionHistorial.hidden = historial.length === 0;

    historial.forEach(ciudad => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = "🌎 " + ciudad;

        boton.addEventListener("click", () => {
            inputCiudad.value = ciudad;
            consultarClima(ciudad);
        });

        historialBotones.appendChild(boton);
    });
}

// ==========================================
// CONSULTAR CLIMA
// ==========================================

async function consultarClima(ciudad) {
    ciudad = ciudad.trim();

    if (!ciudad) {
        estado.textContent = "Escribe una ciudad.";
        return;
    }

    if (!API_KEY || API_KEY === "TU_API_KEY_NUEVA") {
        estado.textContent = "Configura tu API Key en script.js.";
        return;
    }

    estado.textContent = "⏳ Consultando el clima...";
    resultado.hidden = true;
    pronostico.hidden = true;

    try {
        const parametros = new URLSearchParams({
            q: ciudad,
            appid: API_KEY,
            units: "metric",
            lang: "es"
        });

        const respuesta = await fetch(`${API_URL}?${parametros}`);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                datos.message || `Error HTTP ${respuesta.status}`
            );
        }

        mostrarClima(datos);
        guardarEnHistorial(datos.name);
        estado.textContent = "✅ Clima actualizado.";

        // El pronóstico falla por separado sin ocultar el clima actual.
        try {
            await mostrarPronostico(datos.name);
        } catch (error) {
            console.error("Error en el pronóstico:", error);
            pronostico.hidden = true;
            estado.textContent =
                "✅ Clima actual cargado. No se pudo cargar el pronóstico.";
        }

    } catch (error) {
        console.error("Error al consultar:", error);

        if (error.message.toLowerCase().includes("city not found")) {
            estado.textContent = "❌ Ciudad no encontrada. Prueba otro nombre.";
        } else if (error.message.toLowerCase().includes("invalid api key")) {
            estado.textContent =
                "❌ API Key no válida o todavía no activada.";
        } else {
            estado.textContent = "❌ " + error.message;
        }
    }
}

// ==========================================
// MOSTRAR CLIMA ACTUAL
// ==========================================

function mostrarClima(datos) {
    const ciudad = datos.name;
    const pais = datos.sys.country;
    const temperatura = Math.round(datos.main.temp);
    const sensacion = Math.round(datos.main.feels_like);
    const humedad = datos.main.humidity;
    const viento = datos.wind.speed;
    const presion = datos.main.pressure;
    const descripcion = datos.weather[0].description;
    const icono = datos.weather[0].icon;

    resultado.replaceChildren();

    const titulo = document.createElement("div");
    titulo.className = "ciudad";
    titulo.textContent = ciudad;

    const paisTexto = document.createElement("div");
    paisTexto.className = "pais";
    paisTexto.textContent = "🌎 " + pais;

    const imagen = document.createElement("img");
    imagen.className = "icono-clima";
    imagen.alt = descripcion;
    imagen.src =
        `https://openweathermap.org/img/wn/${icono}@2x.png`;

    const temp = document.createElement("div");
    temp.className = "temperatura";
    temp.textContent = `${temperatura}°C`;

    const desc = document.createElement("div");
    desc.className = "descripcion";
    desc.textContent = descripcion;

    const detalles = document.createElement("div");
    detalles.className = "detalles";

    const datosExtra = [
        ["Sensación", `${sensacion}°C`],
        ["Humedad", `${humedad}%`],
        ["Presión", `${presion} hPa`],
        ["Viento", `${viento} m/s`]
    ];

    datosExtra.forEach(([etiqueta, valor]) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "detalle";

        const nombre = document.createElement("div");
        nombre.className = "etiqueta";
        nombre.textContent = etiqueta;

        const numero = document.createElement("div");
        numero.className = "valor";
        numero.textContent = valor;

        tarjeta.append(nombre, numero);
        detalles.appendChild(tarjeta);
    });

    const compartir = document.createElement("button");
    compartir.type = "button";
    compartir.className = "btn-whatsapp";
    compartir.textContent = "📲 Compartir por WhatsApp";

    compartir.addEventListener("click", () => {
        compartirWhatsApp(ciudad, temperatura, descripcion);
    });

    resultado.append(
        titulo, paisTexto, imagen, temp, desc, detalles, compartir
    );

    resultado.hidden = false;
    cambiarFondoSegunClima(datos.weather[0].main);
}

// ==========================================
// RETO 2: PRONÓSTICO DE CINCO DÍAS
// ==========================================

async function mostrarPronostico(ciudad) {
    const parametros = new URLSearchParams({
        q: ciudad,
        appid: API_KEY,
        units: "metric",
        lang: "es"
    });

    const respuesta = await fetch(`${FORECAST_URL}?${parametros}`);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(
            datos.message || "No se pudo cargar el pronóstico"
        );
    }

    // Seleccionamos una previsión cercana al mediodía por cada día.
    const porDia = new Map();

    datos.list.forEach(item => {
        const fecha = item.dt_txt.split(" ")[0];
        const hora = Number(item.dt_txt.split(" ")[1].slice(0, 2));

        if (!porDia.has(fecha)) {
            porDia.set(fecha, item);
        }

        const anterior = porDia.get(fecha);
        const horaAnterior =
            Number(anterior.dt_txt.split(" ")[1].slice(0, 2));

        if (Math.abs(hora - 12) < Math.abs(horaAnterior - 12)) {
            porDia.set(fecha, item);
        }
    });

    const dias = [...porDia.values()].slice(0, 5);
    tarjetasPronostico.replaceChildren();

    dias.forEach(item => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-dia";

        const fecha = document.createElement("div");
        fecha.className = "fecha";
        fecha.textContent = new Date(item.dt * 1000)
            .toLocaleDateString("es-MX", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit"
            });

        const imagen = document.createElement("img");
        imagen.alt = item.weather[0].description;
        imagen.src =
            `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

        const temperatura = document.createElement("div");
        temperatura.className = "temp";
        temperatura.textContent =
            `${Math.round(item.main.temp)}°C`;

        const descripcion = document.createElement("div");
        descripcion.className = "desc";
        descripcion.textContent = item.weather[0].description;

        tarjeta.append(fecha, imagen, temperatura, descripcion);
        tarjetasPronostico.appendChild(tarjeta);
    });

    pronostico.hidden = false;
}

// ==========================================
// RETO 1: MI UBICACIÓN
// ==========================================

btnUbicacion.addEventListener("click", () => {
    if (!navigator.geolocation) {
        estado.textContent = "Tu navegador no admite geolocalización.";
        return;
    }

    if (!API_KEY || API_KEY === "TU_API_KEY_NUEVA") {
        estado.textContent = "Configura tu API Key en script.js.";
        return;
    }

    estado.textContent = "📍 Solicitando permiso de ubicación...";

    navigator.geolocation.getCurrentPosition(
        async posicion => {
            try {
                const parametros = new URLSearchParams({
                    lat: posicion.coords.latitude,
                    lon: posicion.coords.longitude,
                    appid: API_KEY,
                    units: "metric",
                    lang: "es"
                });

                const respuesta =
                    await fetch(`${API_URL}?${parametros}`);
                const datos = await respuesta.json();

                if (!respuesta.ok) {
                    throw new Error(
                        datos.message || "No se pudo obtener el clima"
                    );
                }

                mostrarClima(datos);
                guardarEnHistorial(datos.name);
                estado.textContent = "📍 Clima de tu ubicación cargado.";

                try {
                    await mostrarPronostico(datos.name);
                } catch (error) {
                    console.error(error);
                    estado.textContent =
                        "Clima cargado; el pronóstico no está disponible.";
                }

            } catch (error) {
                estado.textContent = "❌ " + error.message;
            }
        },
        error => {
            if (error.code === 1) {
                estado.textContent =
                    "Permite la ubicación en el navegador para usar esta función.";
            } else if (error.code === 2) {
                estado.textContent =
                    "No se pudo determinar tu ubicación.";
            } else {
                estado.textContent =
                    "Se agotó el tiempo para obtener tu ubicación.";
            }
        },
        { enableHighAccuracy: false, timeout: 15000 }
    );
});

// ==========================================
// RETO 4: MODO CLARO Y OSCURO
// ==========================================

function aplicarTema(tema) {
    const claro = tema === "claro";
    document.body.classList.toggle("claro", claro);
    btnTema.textContent = claro ? "🌙 Modo oscuro" : "☀️ Modo claro";

    try {
        localStorage.setItem("temaClima", claro ? "claro" : "oscuro");
    } catch (error) {
        console.error("No se pudo guardar el tema", error);
    }
}

btnTema.addEventListener("click", () => {
    const esClaro = document.body.classList.contains("claro");
    aplicarTema(esClaro ? "oscuro" : "claro");
});

// ==========================================
// RETO 5: COMPARTIR POR WHATSAPP
// ==========================================

function compartirWhatsApp(ciudad, temperatura, descripcion) {
    const texto =
        `🌤️ El clima en ${ciudad} es de ${temperatura}°C. ` +
        `Condición: ${descripcion}.`;

    const url = "https://wa.me/?text=" + encodeURIComponent(texto);
    window.open(url, "_blank", "noopener,noreferrer");
}

// ==========================================
// FONDO SEGÚN EL CLIMA
// ==========================================

function cambiarFondoSegunClima(clima) {
    document.body.classList.remove(
        "clima-soleado",
        "clima-nublado",
        "clima-lluvioso",
        "clima-nieve"
    );

    // No cambiamos el fondo si el usuario eligió el modo claro.
    if (document.body.classList.contains("claro")) return;

    const tipo = clima.toLowerCase();

    if (tipo.includes("clear")) {
        document.body.classList.add("clima-soleado");
    } else if (tipo.includes("cloud")) {
        document.body.classList.add("clima-nublado");
    } else if (
        tipo.includes("rain") ||
        tipo.includes("drizzle") ||
        tipo.includes("thunderstorm")
    ) {
        document.body.classList.add("clima-lluvioso");
    } else if (tipo.includes("snow")) {
        document.body.classList.add("clima-nieve");
    }
}

// ==========================================
// FORMULARIO DE BÚSQUEDA
// ==========================================

formulario.addEventListener("submit", event => {
    event.preventDefault();
    consultarClima(inputCiudad.value);
});

// ==========================================
// INICIAR PÁGINA
// ==========================================

function iniciar() {
    mostrarHistorial();

    let tema = "oscuro";

    try {
        tema = localStorage.getItem("temaClima") || "oscuro";
    } catch (error) {
        console.error(error);
    }

    aplicarTema(tema);
}

iniciar();
