document.addEventListener("DOMContentLoaded", () => {
  const pdfInput = document.getElementById("pdf-input");
  const extractBtn = document.getElementById("extract-btn");
  const copyBtn = document.getElementById("copy-btn");
  const clearBtn = document.getElementById("clear-btn");
  const outputText = document.getElementById("output-text");
  const statusText = document.getElementById("status");
  const themeToggle = document.getElementById("theme-toggle");

  const THEME_KEY = "site-theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      applyTheme(savedTheme);
    } else {
      applyTheme("light");
    }
  }

  function setStatus(message) {
    if (statusText) {
      statusText.textContent = message;
    }
  }

  function cleanText(str) {
    if (typeof str !== "string") return "";
    return str.replace(/\s+/g, " ").trim();
  }

  async function extractPageText(pdf, pageNumber) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();

    if (!textContent || !Array.isArray(textContent.items)) {
      return "";
    }

    const parts = [];

    for (const item of textContent.items) {
      if (!item || typeof item.str !== "string") continue;

      const text = cleanText(item.str);
      if (!text) continue;

      parts.push(text);
    }

    return parts.join(" ").replace(/\s+([,.;:!?])/g, "$1").trim();
  }

  async function extractTextFromPdf(file) {
    if (!window.pdfjsLib) {
      throw new Error("PDF.js n'est pas chargé.");
    }

    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdf.worker.min.js";

    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = window.pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;

    let fullText = "";
    let okPages = 0;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      setStatus(`Extraction en cours... page ${pageNumber}/${pdf.numPages}`);

      try {
        const pageText = await extractPageText(pdf, pageNumber);

        if (pageText) {
          fullText += `--- Page ${pageNumber} ---\n${pageText}\n\n`;
          okPages++;
        }
      } catch (err) {
        console.error(`Erreur page ${pageNumber}:`, err);
      }
    }

    return {
      text: fullText.trim(),
      okPages,
      totalPages: pdf.numPages
    };
  }

  extractBtn.addEventListener("click", async () => {
    const file = pdfInput?.files?.[0];

    if (!file) {
      setStatus("Sélectionne un fichier PDF.");
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      (file.name && file.name.toLowerCase().endsWith(".pdf"));

    if (!isPdf) {
      setStatus("Le fichier sélectionné ne semble pas être un PDF.");
      return;
    }

    outputText.value = "";
    setStatus("Chargement du PDF...");

    try {
      const result = await extractTextFromPdf(file);

      if (!result.text) {
        setStatus("Aucun texte exploitable trouvé dans ce PDF.");
        return;
      }

      outputText.value = result.text;
      setStatus(
        `Extraction terminée. ${result.okPages}/${result.totalPages} page(s) lues.`
      );
    } catch (error) {
      console.error("Erreur extraction :", error);
      setStatus(`Erreur pendant l'extraction : ${error.message}`);
    }
  });

  copyBtn.addEventListener("click", async () => {
    const text = outputText.value;

    if (!text || !text.trim()) {
      setStatus("Aucun texte à copier.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("Texte copié.");
    } catch (error) {
      console.error("Erreur copie :", error);
      setStatus("Impossible de copier automatiquement.");
    }
  });

  clearBtn.addEventListener("click", () => {
    if (pdfInput) pdfInput.value = "";
    outputText.value = "";
    setStatus("Zone réinitialisée.");
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  initTheme();
});