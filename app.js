const API_URL = "https://corsproxy.io/?url=https://script.google.com/macros/s/AKfycbzIr1tjqznLoZo2n4TguleaUkotctSeOQBkk6HsnuCE3s2P2sQxv18dDCyIzMhVJJLt/exec";

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
