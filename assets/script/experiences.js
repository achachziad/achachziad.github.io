const ExperienceData = [
    {
        role: "Stagiaire développeur web",
        company: "Ghomrassen Transport",
        date: "Juil. – Août 2025",
        description: "Application interne logistique (Node.js, SQLite, HTML/CSS/JS) : gestion clients/colis, tri automatisé par destination, intégration QR codes."
    },
    {
        role: "Préparateur de commandes",
        company: "Leclerc Drive",
        date: "Déc. 2022 – Déc. 2023",
        description: "Préparation/livraison, gestion des stocks, organisation des rayons. Compétences transférables : rigueur, travail en équipe."
    }
];

const ExperienceHTML = ExperienceData.map(
    (exp) => `
    <div class="experience-card">
      <h3>${exp.role}</h3>
      <h4>${exp.company} – <span>${exp.date}</span></h4>
      <p>${exp.description}</p>
    </div>
  `
).join("");

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("experience-card-container").innerHTML = ExperienceHTML;
});
