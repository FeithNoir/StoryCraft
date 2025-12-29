// Datos de la aplicación
let projectsData = [];
let escaletaData = {
  acto1: [],
  acto2: [],
  acto3: [],
};

let personajesData = [];
let currentActo = null;
let editingChapterIndex = null;
let editingPersonajeIndex = null;

// Inicialización
document.addEventListener("DOMContentLoaded", function () {
  // Cargar datos guardados
  cargarDatosGuardados();

  // Configurar navegación
  document
    .getElementById("nav-projects")
    .addEventListener("click", () => mostrarModulo("projects"));
  document
    .getElementById("nav-escaleta")
    .addEventListener("click", () => mostrarModulo("escaleta"));
  document
    .getElementById("nav-personajes")
    .addEventListener("click", () => mostrarModulo("personajes"));

  // Configurar acordeones
  document.querySelectorAll(".accordion-header").forEach((header) => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      const icon = header.querySelector("i.fa-chevron-down");

      content.classList.toggle("hidden");
      icon.classList.toggle("rotate-180");
    });
  });

  // Botones para agregar capítulos
  document.querySelectorAll(".add-chapter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      currentActo = this.getAttribute("data-acto");
      editingChapterIndex = null;
      mostrarModalCapitulo();
    });
  });

  // Botones para guardar escaleta
  document
    .getElementById("guardar-escaleta")
    .addEventListener("click", guardarDatos);

  // Botones para gestionar personajes
  document
    .getElementById("nuevo-personaje")
    .addEventListener("click", () => mostrarFormularioPersonaje());
  document
    .getElementById("cancelar-personaje")
    .addEventListener("click", ocultarFormularioPersonaje);
  document
    .getElementById("guardar-personaje")
    .addEventListener("click", guardarPersonaje);

  // Botones del modal de capítulo
  document
    .getElementById("cancel-chapter")
    .addEventListener("click", cerrarModalCapitulo);
  document
    .getElementById("save-chapter")
    .addEventListener("click", guardarCapitulo);

  // Inicializar con datos de ejemplo
  if (
    projectsData.length === 0 &&
    escaletaData.acto1.length === 0 &&
    personajesData.length === 0
  ) {
    inicializarDatosEjemplo();
  }

  // Nuevo: Event listeners para proyectos
  document
    .getElementById("nuevo-proyecto")
    .addEventListener("click", () => crearNuevoProyecto());
  document
    .getElementById("search-project")
    .addEventListener("input", () => renderizarProyectos());
});

// Funciones de navegación
function mostrarModulo(modulo) {
  // Ocultar todos los módulos
  document
    .querySelectorAll(".module")
    .forEach((m) => m.classList.add("hidden"));

  // Mostrar el módulo seleccionado
  document.getElementById(`${modulo}-module`).classList.remove("hidden");

  // Actualizar botones de navegación
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("bg-blue-700");
    btn.classList.add("bg-transparent");
  });

  document.getElementById(`nav-${modulo}`).classList.remove("bg-transparent");
  document.getElementById(`nav-${modulo}`).classList.add("bg-blue-700");

  // Renderizar el contenido del módulo
  if (modulo === "personajes") {
    renderizarPersonajes();
  } else if (modulo === "projects") {
    renderizarProyectos();
  } else if (modulo === "escaleta") {
    renderizarCapitulos();
  }
}

// --- Funciones para Proyectos ---

function renderizarProyectos(page = 1) {
  const searchTerm = document.getElementById("search-project").value.toLowerCase();
  const filteredProjects = projectsData.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm)
  );

  const tableBody = document.getElementById("projects-table-body");
  tableBody.innerHTML = "";

  if (filteredProjects.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" class="text-center p-4 text-gray-500">No se encontraron proyectos.</td></tr>`;
    return;
  }

  // Paginación
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(start, end);

  paginatedProjects.forEach((project) => {
    const row = document.createElement("tr");
    row.className = "border-b border-gray-200 hover:bg-gray-50";
    row.innerHTML = `
      <td class="p-3">${project.nombre}</td>
      <td class="p-3">${project.escaletaId}</td>
      <td class="p-3">
        <button class="edit-project-btn px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200" data-id="${project.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-project-btn px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" data-id="${project.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Event listeners para botones de acción
  tableBody.querySelectorAll(".edit-project-btn").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      editarProyecto(e.currentTarget.dataset.id)
    );
  });
  tableBody.querySelectorAll(".delete-project-btn").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      eliminarProyecto(e.currentTarget.dataset.id)
    );
  });

  renderizarControlesPaginacion(totalPages, page);
}

function renderizarControlesPaginacion(totalPages, currentPage) {
  const paginationContainer = document.getElementById("pagination-controls");
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.className = `px-3 py-1 rounded-lg mx-1 ${
      i === currentPage
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`;
    button.addEventListener("click", () => renderizarProyectos(i));
    paginationContainer.appendChild(button);
  }
}

function crearNuevoProyecto() {
  const nombre = prompt("Introduce el nombre del nuevo proyecto:");
  if (nombre && nombre.trim() !== "") {
    const nuevoProyecto = {
      id: generarId(),
      nombre: nombre.trim(),
      escaletaId: generarGuid(),
    };
    projectsData.push(nuevoProyecto);
    guardarDatos();
    renderizarProyectos();
  }
}

function editarProyecto(id) {
  const project = projectsData.find((p) => p.id === id);
  if (project) {
    const nuevoNombre = prompt("Edita el nombre del proyecto:", project.nombre);
    if (nuevoNombre && nuevoNombre.trim() !== "") {
      project.nombre = nuevoNombre.trim();
      guardarDatos();
      renderizarProyectos();
    }
  }
}

function eliminarProyecto(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
    projectsData = projectsData.filter((p) => p.id !== id);
    guardarDatos();
    renderizarProyectos();
  }
}

// --- Funciones para la escaleta ---
function mostrarModalCapitulo() {
  // Reiniciar formulario
  document.getElementById("chapter-title").value = "";
  document.getElementById("chapter-desc").value = "";

  // Mostrar personajes disponibles
  renderizarPersonajesParaCapitulo();

  // Si estamos editando, cargar datos
  if (editingChapterIndex !== null && currentActo !== null) {
    const capitulo = escaletaData[`acto${currentActo}`][editingChapterIndex];
    document.getElementById("chapter-title").value = capitulo.titulo;
    document.getElementById("chapter-desc").value = capitulo.descripcion;

    // Marcar personajes seleccionados
    capitulo.personajes.forEach((personajeId) => {
      const checkbox = document.querySelector(
        `input[data-personaje-id="${personajeId}"]`
      );
      if (checkbox) checkbox.checked = true;
    });
  }

  // Mostrar modal
  document.getElementById("chapter-modal").classList.remove("hidden");
}

function cerrarModalCapitulo() {
  document.getElementById("chapter-modal").classList.add("hidden");
}

function guardarCapitulo() {
  const titulo = document.getElementById("chapter-title").value.trim();
  const descripcion = document.getElementById("chapter-desc").value.trim();

  if (!titulo || !descripcion) {
    alert("Por favor, completa el título y la descripción del capítulo.");
    return;
  }

  // Obtener personajes seleccionados
  const personajesSeleccionados = [];
  document
    .querySelectorAll('#personajes-disponibles input[type="checkbox"]:checked')
    .forEach((checkbox) => {
      personajesSeleccionados.push(checkbox.getAttribute("data-personaje-id"));
    });

  const nuevoCapitulo = {
    titulo,
    descripcion,
    personajes: personajesSeleccionados,
  };

  // Guardar en la estructura de datos
  if (editingChapterIndex !== null) {
    // Editar capítulo existente
    escaletaData[`acto${currentActo}`][editingChapterIndex] = nuevoCapitulo;
  } else {
    // Añadir nuevo capítulo
    escaletaData[`acto${currentActo}`].push(nuevoCapitulo);
  }

  // Actualizar la vista
  renderizarCapitulos();
  cerrarModalCapitulo();
  guardarDatos();
}

function renderizarCapitulos() {
  // Limpiar listas
  ["acto1", "acto2", "acto3"].forEach((acto) => {
    document.getElementById(`${acto}-chapters`).innerHTML = "";
  });

  // Renderizar capítulos para cada acto
  for (let i = 1; i <= 3; i++) {
    const actoKey = `acto${i}`;
    const capitulos = escaletaData[actoKey];
    const container = document.getElementById(`${actoKey}-chapters`);

    // Actualizar contador
    document.querySelector(
      `.acto-${i} .capitulo-count`
    ).textContent = `Capítulos: ${capitulos.length}`;

    // Si no hay capítulos, mostrar mensaje
    if (capitulos.length === 0) {
      container.innerHTML = `
                        <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            <i class="fas fa-book-open text-3xl mb-3"></i>
                            <p>No hay capítulos aún. ¡Añade el primero!</p>
                        </div>
                    `;
      continue;
    }

    // Renderizar cada capítulo
    capitulos.forEach((capitulo, index) => {
      // Obtener nombres de personajes
      const nombresPersonajes = capitulo.personajes
        .map((id) => {
          const personaje = personajesData.find((p) => p.id === id);
          return personaje ? personaje.nombre : "";
        })
        .filter((nombre) => nombre !== "");

      const capituloElement = document.createElement("div");
      capituloElement.className =
        "bg-gray-50 p-4 rounded-lg border border-gray-200";
      capituloElement.innerHTML = `
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-bold text-lg text-gray-800">${
                                  capitulo.titulo
                                }</h4>
                                <p class="text-gray-600 mt-2">${
                                  capitulo.descripcion
                                }</p>
                                
                                ${
                                  nombresPersonajes.length > 0
                                    ? `
                                <div class="mt-3">
                                    <span class="text-sm font-medium text-gray-700">Personajes:</span>
                                    <div class="flex flex-wrap gap-2 mt-1">
                                        ${nombresPersonajes
                                          .map(
                                            (nombre) => `
                                            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${nombre}</span>
                                        `
                                          )
                                          .join("")}
                                    </div>
                                </div>
                                `
                                    : ""
                                }
                            </div>
                            <div class="flex space-x-2 ml-4">
                                <button class="edit-chapter-btn px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors" data-acto="${i}" data-index="${index}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-chapter-btn px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" data-acto="${i}" data-index="${index}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;

      container.appendChild(capituloElement);
    });

    // Agregar event listeners a los botones de editar/eliminar
    container.querySelectorAll(".edit-chapter-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        currentActo = this.getAttribute("data-acto");
        editingChapterIndex = parseInt(this.getAttribute("data-index"));
        mostrarModalCapitulo();
      });
    });

    container.querySelectorAll(".delete-chapter-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const acto = this.getAttribute("data-acto");
        const index = parseInt(this.getAttribute("data-index"));

        if (confirm("¿Estás seguro de que quieres eliminar este capítulo?")) {
          escaletaData[`acto${acto}`].splice(index, 1);
          renderizarCapitulos();
          guardarDatos();
        }
      });
    });
  }
}

// Funciones para personajes
function mostrarFormularioPersonaje(personaje = null) {
  // Limpiar formulario
  document.getElementById("personaje-nombre").value = "";
  document.getElementById("personaje-edad").value = "";
  document.getElementById("personaje-genero").value = "";
  document.getElementById("personaje-metas").value = "";
  document.getElementById("personaje-historia").value = "";
  document.getElementById("personaje-gustos").value = "";
  document.getElementById("personaje-disgustos").value = "";

  // Si estamos editando, cargar datos
  if (personaje) {
    document.getElementById("personaje-nombre").value = personaje.nombre;
    document.getElementById("personaje-edad").value = personaje.edad || "";
    document.getElementById("personaje-genero").value = personaje.genero || "";
    document.getElementById("personaje-metas").value = personaje.metas || "";
    document.getElementById("personaje-historia").value =
      personaje.historia || "";
    document.getElementById("personaje-gustos").value = personaje.gustos || "";
    document.getElementById("personaje-disgustos").value =
      personaje.disgustos || "";
  }

  // Mostrar formulario
  document
    .getElementById("personaje-form-container")
    .classList.remove("hidden");
}

function ocultarFormularioPersonaje() {
  document.getElementById("personaje-form-container").classList.add("hidden");
  editingPersonajeIndex = null;
}

function guardarPersonaje() {
  const nombre = document.getElementById("personaje-nombre").value.trim();

  if (!nombre) {
    alert("Por favor, introduce al menos el nombre del personaje.");
    return;
  }

  const nuevoPersonaje = {
    id:
      editingPersonajeIndex !== null
        ? personajesData[editingPersonajeIndex].id
        : generarId(),
    nombre,
    edad: document.getElementById("personaje-edad").value,
    genero: document.getElementById("personaje-genero").value,
    metas: document.getElementById("personaje-metas").value,
    historia: document.getElementById("personaje-historia").value,
    gustos: document.getElementById("personaje-gustos").value,
    disgustos: document.getElementById("personaje-disgustos").value,
  };

  if (editingPersonajeIndex !== null) {
    // Editar personaje existente
    personajesData[editingPersonajeIndex] = nuevoPersonaje;
  } else {
    // Añadir nuevo personaje
    personajesData.push(nuevoPersonaje);
  }

  // Actualizar la vista
  renderizarPersonajes();
  ocultarFormularioPersonaje();
  guardarDatos();

  // Actualizar capítulos si están abiertos
  if (
    !document.getElementById("escaleta-module").classList.contains("hidden")
  ) {
    renderizarCapitulos();
  }
}

function renderizarPersonajes() {
  const container = document.getElementById("personajes-lista");

  // Si no hay personajes, mostrar mensaje
  if (personajesData.length === 0) {
    container.innerHTML = `
                    <div class="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                        <i class="fas fa-users text-4xl mb-4"></i>
                        <p class="text-xl mb-2">No hay personajes aún</p>
                        <p class="mb-6">Crea tu primer personaje para empezar a construir tu historia.</p>
                        <button id="nuevo-personaje-empty" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-user-plus mr-2"></i>Crear Primer Personaje
                        </button>
                    </div>
                `;

    document
      .getElementById("nuevo-personaje-empty")
      .addEventListener("click", () => mostrarFormularioPersonaje());
    return;
  }

  // Renderizar cada personaje
  container.innerHTML = "";
  personajesData.forEach((personaje, index) => {
    const personajeElement = document.createElement("div");
    personajeElement.className =
      "bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200";
    personajeElement.innerHTML = `
                    <div class="p-5">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h4 class="font-bold text-xl text-gray-800">${
                                  personaje.nombre
                                }</h4>
                                ${
                                  personaje.edad || personaje.genero
                                    ? `
                                <p class="text-gray-600 mt-1">
                                    ${
                                      personaje.edad
                                        ? `${personaje.edad} años`
                                        : ""
                                    }
                                    ${
                                      personaje.edad && personaje.genero
                                        ? " • "
                                        : ""
                                    }
                                    ${
                                      personaje.genero
                                        ? `${personaje.genero}`
                                        : ""
                                    }
                                </p>
                                `
                                    : ""
                                }
                            </div>
                            <div class="flex space-x-2">
                                <button class="edit-personaje-btn px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors" data-index="${index}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-personaje-btn px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" data-index="${index}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        
                        ${
                          personaje.metas
                            ? `
                        <div class="mb-4">
                            <h5 class="font-medium text-gray-700 mb-1">Metas</h5>
                            <p class="text-gray-600 text-sm">${personaje.metas}</p>
                        </div>
                        `
                            : ""
                        }
                        
                        ${
                          personaje.historia
                            ? `
                        <div class="mb-4">
                            <h5 class="font-medium text-gray-700 mb-1">Historia</h5>
                            <p class="text-gray-600 text-sm">${personaje.historia.substring(
                              0,
                              100
                            )}${
                                personaje.historia.length > 100 ? "..." : ""
                              }</p>
                        </div>
                        `
                            : ""
                        }
                        
                        <div class="flex justify-between mt-4 pt-4 border-t border-gray-100">
                            ${
                              personaje.gustos
                                ? `
                            <div class="w-1/2 pr-2">
                                <h5 class="font-medium text-gray-700 mb-1 text-sm">Gustos</h5>
                                <p class="text-gray-600 text-xs">${personaje.gustos.substring(
                                  0,
                                  50
                                )}${
                                    personaje.gustos.length > 50 ? "..." : ""
                                  }</p>
                            </div>
                            `
                                : ""
                            }
                            
                            ${
                              personaje.disgustos
                                ? `
                            <div class="w-1/2 pl-2">
                                <h5 class="font-medium text-gray-700 mb-1 text-sm">Disgustos</h5>
                                <p class="text-gray-600 text-xs">${personaje.disgustos.substring(
                                  0,
                                  50
                                )}${
                                    personaje.disgustos.length > 50 ? "..." : ""
                                  }</p>
                            </div>
                            `
                                : ""
                            }
                        </div>
                    </div>
                `;

    container.appendChild(personajeElement);
  });

  // Agregar event listeners a los botones de editar/eliminar
  container.querySelectorAll(".edit-personaje-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      editingPersonajeIndex = parseInt(this.getAttribute("data-index"));
      mostrarFormularioPersonaje(personajesData[editingPersonajeIndex]);
    });
  });

  container.querySelectorAll(".delete-personaje-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      const personajeNombre = personajesData[index].nombre;

      if (
        confirm(`¿Estás seguro de que quieres eliminar a "${personajeNombre}"?`)
      ) {
        // Eliminar personaje de los capítulos
        const personajeId = personajesData[index].id;
        for (let actoKey in escaletaData) {
          escaletaData[actoKey].forEach((capitulo) => {
            const indexPersonaje = capitulo.personajes.indexOf(personajeId);
            if (indexPersonaje !== -1) {
              capitulo.personajes.splice(indexPersonaje, 1);
            }
          });
        }

        // Eliminar personaje de la lista
        personajesData.splice(index, 1);
        renderizarPersonajes();
        guardarDatos();

        // Actualizar capítulos si están abiertos
        if (
          !document
            .getElementById("escaleta-module")
            .classList.contains("hidden")
        ) {
          renderizarCapitulos();
        }
      }
    });
  });
}

function renderizarPersonajesParaCapitulo() {
  const container = document.getElementById("personajes-disponibles");

  if (personajesData.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500">No hay personajes creados aún. Ve al módulo de Personajes para crear algunos.</p>';
    return;
  }

  container.innerHTML = "";
  personajesData.forEach((personaje) => {
    const checkbox = document.createElement("div");
    checkbox.className = "flex items-center";
    checkbox.innerHTML = `
                    <input type="checkbox" id="personaje-${personaje.id}" data-personaje-id="${personaje.id}" class="mr-2">
                    <label for="personaje-${personaje.id}" class="text-gray-700">${personaje.nombre}</label>
                `;
    container.appendChild(checkbox);
  });
}

// Funciones de utilidad
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generarGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function guardarDatos() {
  const data = {
    projects: projectsData,
    escaleta: escaletaData,
    personajes: personajesData,
  };

  localStorage.setItem("storycraft-data", JSON.stringify(data));
}

function cargarDatosGuardados() {
  const datosGuardados = localStorage.getItem("storycraft-data");

  if (datosGuardados) {
    try {
      const data = JSON.parse(datosGuardados);
      projectsData = data.projects || [];
      escaletaData = data.escaleta || { acto1: [], acto2: [], acto3: [] };
      personajesData = data.personajes || [];

      // Renderizar datos cargados
      renderizarCapitulos();
      renderizarProyectos(); // Asegurarse de renderizar proyectos al cargar
    } catch (e) {
      console.error("Error al cargar datos guardados:", e);
    }
  }
}

function inicializarDatosEjemplo() {
  // Proyectos de ejemplo
  projectsData = [];

  // Personajes de ejemplo
  personajesData = [];

  // Capítulos de ejemplo
  escaletaData.acto1 = [];
  escaletaData.acto2 = [];
  escaletaData.acto3 = [];

  // Renderizar datos de ejemplo
  renderizarCapitulos();
  renderizarProyectos();
  guardarDatos();
}