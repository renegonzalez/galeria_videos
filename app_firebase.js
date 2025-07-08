import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// TODO: Agrega tu config aquí
const firebaseConfig = {
    apiKey: "AIzaSyDi4g-XX_APmqh21EPCQTnDCPMgOZNbZX4",
    authDomain: "galeria-videos-82389.firebaseapp.com",
    projectId: "galeria-videos-82389",
    storageBucket: "galeria-videos-82389.firebasestorage.app",
    messagingSenderId: "107017571224",
    appId: "1:107017571224:web:72c72f6d0e43f3d5ec39ed"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const galeria = document.getElementById("gallery");
const feedback = document.getElementById("formFeedback");
let todosLosVideos = [];

// Extraer ID de YouTube
function obtenerIdYoutube(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}

// Mostrar videos
function mostrarVideos(lista) {
  galeria.innerHTML = "";
  lista.forEach(video => {
    const div = document.createElement("div");
    div.className = "video";
    div.innerHTML = `
      <img src="https://img.youtube.com/vi/${video.id}/hqdefault.jpg" />
      <div class="video-content">
        <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank">${video.texto}</a>
        <div class="video-title">${video.titulo}</div>
      </div>`;
    galeria.appendChild(div);
  });
}

// Cargar desde Firebase
async function cargarVideos() {
  try {
    const snap = await getDocs(collection(db, "videos"));
    todosLosVideos = snap.docs.map(doc => doc.data());
    mostrarVideos(todosLosVideos);
  } catch (err) {
    console.error("Error:", err);
  }
}

// Guardar en Firebase
document.getElementById("formularioVideo").addEventListener("submit", async e => {
  e.preventDefault();
  const url = document.getElementById("url").value.trim();
  const titulo = document.getElementById("titulo").value.trim();
  const texto = document.getElementById("texto").value.trim();
  const categoria = document.getElementById("categoria").value;

  const id = obtenerIdYoutube(url);
  if (!id) {
    feedback.textContent = "❌ URL de YouTube inválida.";
    return;
  }

  const nuevo = { id, titulo, texto, categoria };
  try {
    await addDoc(collection(db, "videos"), nuevo);
    feedback.textContent = "✅ Video guardado.";
    document.getElementById("formularioVideo").reset();
    cargarVideos();
  } catch (err) {
    feedback.textContent = "❌ Error al guardar.";
    console.error(err);
  }
});

// Filtro
window.filtrarCategoria = categoria => {
  const filtrados = categoria === "todos"
    ? todosLosVideos
    : todosLosVideos.filter(v => v.categoria === categoria);
  mostrarVideos(filtrados);
};

// Tema
window.toggleTheme = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("tema", document.body.classList.contains("dark") ? "dark" : "light");
};

// Inicialización
window.onload = () => {
  if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark");
  }
  cargarVideos();
};
