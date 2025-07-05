const API_URL = "https://script.google.com/macros/s/AKfycbx6nA0la6biGcVtJZgZND4zXsO5RqE3OF7gP1t6J_KL-p6GfB5ZGKsUMqd051jSZnQ_/exec";
let todosLosVideos = [];

async function cargarVideos() {
  try {
    const respuesta = await fetch(API_URL);
    const videos = await respuesta.json();
    todosLosVideos = videos;
    mostrarVideos(todosLosVideos);
  } catch (error) {
    console.error("Error al cargar los videos:", error);
  }
}

function mostrarVideos(lista) {
  const galeria = document.getElementById("gallery");
  galeria.innerHTML = "";

  lista.forEach(video => {
    const div = document.createElement("div");
    div.className = "video";
    div.innerHTML = `
      <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" alt="Miniatura de ${video.titulo}" loading="lazy" />
      <div class="video-content">
        <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank">${video.texto}</a>
        <div class="video-title">${video.titulo}</div>
      </div>
    `;
    galeria.appendChild(div);
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

document.getElementById("formularioVideo").addEventListener("submit", async (e) => {
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

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(nuevoVideo),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    if (data.success) {
      feedback.textContent = "✅ Video agregado correctamente.";
      document.getElementById("formularioVideo").reset();
      cargarVideos();
    } else {
      feedback.textContent = "⚠️ No se pudo guardar el video.";
    }
  } catch (err) {
    console.error("Error al enviar el video:", err);
    feedback.textContent = "❌ Error al guardar el video.";
  }
});

window.onload = () => {
  const temaGuardado = localStorage.getItem("temaPreferido");
  if (temaGuardado) {
    document.body.classList.toggle("dark", temaGuardado === "dark");
  } else {
    const prefiereOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.toggle("dark", prefiereOscuro);
  }

  cargarVideos();
};
