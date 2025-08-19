

let todosLosVideos = [];
let castApiReady = false;

const EJEMPLOS_VIDEOS = [
  {
    id: "dQw4w9WgXcQ",
    titulo: "Rick Astley - Never Gonna Give You Up",
    texto: "Un clásico de internet",
    categoria: "Creatividad"
  },
  {
    id: "3JZ_D3ELwOQ",
    titulo: "Aprende JavaScript en 1 hora",
    texto: "Tutorial rápido de JS",
    categoria: "Tutorial"
  },
  {
    id: "M7lc1UVf-VE",
    titulo: "YouTube Developers Live: Embedded Web Player Customization",
    texto: "Personaliza el reproductor de YouTube",
    categoria: "Tutorial"
  }
];


function cargarVideos() {
  todosLosVideos = EJEMPLOS_VIDEOS;
  mostrarVideos(todosLosVideos);

function mostrarVideos(lista) {
  const galeria = document.getElementById("gallery");
  galeria.innerHTML = "";


  // Detectar si la API de Cast está lista

  const castReady = castApiReady;

  lista.forEach(video => {
    const div = document.createElement("div");
    div.className = "video";
    div.innerHTML = `
      <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="Miniatura de ${video.titulo}" loading="lazy" />
      <div class="video-content">
        <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank">${video.texto}</a>
        <div class="video-title">${video.titulo}</div>
        <div class="video-btns">
          <button class="play-btn" data-url="https://www.youtube.com/watch?v=${video.id}" aria-label="Reproducir video">▶️ Reproducir</button>
          <button class="cast-btn" data-id="${video.id}" aria-label="Enviar a Chromecast" ${!castReady ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>📺 Chromecast</button>
        </div>
      </div>
    `;
    galeria.appendChild(div);
  });

  // Asignar eventos a los botones
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = btn.getAttribute('data-url');
      window.open(url, '_blank');
    });
  });
  if (castReady) {
    document.querySelectorAll('.cast-btn').forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.cursor = '';
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        enviarAChromecast(id);
      });
    });
  } else {
    document.querySelectorAll('.cast-btn').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    });
  }
}
// Esperar a que la API de Cast esté lista y recargar los botones
window['__onGCastApiAvailable'] = function(isAvailable) {
  console.log('[Cast] __onGCastApiAvailable llamada. isAvailable:', isAvailable);
  if (isAvailable) {
    if (window.cast && window.cast.framework) {
      console.log('[Cast] API de Cast y framework detectados. Inicializando opciones...');
      cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
      });
      castApiReady = true;
      console.log('[Cast] API de Cast lista. Botones Chromecast serán habilitados.');
      mostrarVideos(todosLosVideos);
    } else {
      console.warn('[Cast] window.cast o window.cast.framework no están disponibles tras isAvailable=true');
    }
  } else {
    console.warn('[Cast] __onGCastApiAvailable llamada pero isAvailable=false');
  }
};
// Mensaje de depuración al cargar el script principal
console.log('[Cast] Script app.js cargado. Esperando inicialización de Cast...');
}

// ...existing code...

// Chromecast logic
function enviarAChromecast(id) {
  if (!window.chrome || !window.chrome.cast || !window.cast) {
    alert('La función Chromecast solo está disponible en navegadores compatibles como Google Chrome con Cast habilitado.');
    return;
  }
  const videoUrl = `https://www.youtube.com/watch?v=${id}`;
  // Inicializar Cast API si es necesario
  if (!window.cast.framework) {
    alert('El framework de Chromecast no está disponible.');
    return;
  }
  const context = cast.framework.CastContext.getInstance();
  context.requestSession().then(() => {
    const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, 'video/mp4');
    const request = new chrome.cast.media.LoadRequest(mediaInfo);
    context.getCurrentSession().loadMedia(request).catch((e) => {
      alert('No se pudo enviar el video a Chromecast.');
    });
  }).catch(() => {
    alert('No se pudo iniciar la sesión de Chromecast.');
  });
}

function filtrarCategoria(categoria) {
  if (categoria === 'todos') {
    mostrarVideos(todosLosVideos);
  } else {
    const filtrados = todosLosVideos.filter(v => v.categoria === categoria);
    mostrarVideos(filtrados);
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const esOscuro = document.body.classList.contains("dark");
  localStorage.setItem("temaPreferido", esOscuro ? "dark" : "light");
}

function obtenerIdYoutube(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}


document.getElementById("formularioVideo").addEventListener("submit", (e) => {
  e.preventDefault();

  const url = document.getElementById("url").value.trim();
  const titulo = document.getElementById("titulo").value.trim();
  const texto = document.getElementById("texto").value.trim();
  const categoria = document.getElementById("categoria").value;
  const feedback = document.getElementById("formFeedback");

  const videoId = obtenerIdYoutube(url);
  if (!videoId) {
    feedback.textContent = "❌ URL de YouTube no válida.";
    return;
  }

  const nuevoVideo = { id: videoId, titulo, texto, categoria };
  todosLosVideos.push(nuevoVideo);
  feedback.textContent = "✅ Video agregado correctamente.";
  document.getElementById("formularioVideo").reset();
  mostrarVideos(todosLosVideos);
});

window.onload = () => {
  const temaGuardado = localStorage.getItem("temaPreferido");
  if (temaGuardado) {
    document.body.classList.toggle("dark", temaGuardado === "dark");
  } else {
    const prefiereOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.toggle("dark", prefiereOscuro);
  }
  // Inicializar opciones de Cast si está disponible
  if (window.cast && window.cast.framework) {
    cast.framework.CastContext.getInstance().setOptions({
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
  }
  cargarVideos();
};
