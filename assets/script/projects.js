const ProjectsData = [
  {
    name: "GéoJourney (Python)",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
    description:
        "Calcul d’itinéraires multi-villes + visualisation cartographique (GeoPandas). Parsing et traitement de données.",
    link: "https://github.com/achachziad", // remplace par le dépôt si public
  },
  {
    name: "Borondeur (Java)",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg",
    description:
        "Appli d’itinéraires pour IDFM. Projet en équipe (Agile). TDD avec JUnit pour fiabilité/maintenabilité.",
    link: "https://github.com/achachziad", // remplace par le dépôt si public
  },
  {
    name: "Shazoum (C++)",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg",
    description:
        "Reconnaissance acoustique via empreintes audio (FFT/DCT). Traitement de fichiers WAV et comparaison rapide.",
    link: "https://github.com/achachziad", // remplace par le dépôt si public
  },
  {
    name: "ColiRoute (Node.js + SQLite)",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
    description:
        "Application interne de gestion colis/clients/trajets, tri par destination, QR codes pour le suivi.",
    link: "https://github.com/achachziad", // remplace par le dépôt si public
  },
];

const ProjectsDataHTML = ProjectsData.map(
    (item) => `
           <div class="projects-card">
              <img loading="lazy" src="${item.logo}" alt="${item.name}">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <a href="${item.link}" title="${item.name}" target="_blank">Voir</a>
          </div>
      `
).join("");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("projects-card-container").innerHTML =
      ProjectsDataHTML;
});
