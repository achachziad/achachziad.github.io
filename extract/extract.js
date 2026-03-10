document.addEventListener("DOMContentLoaded", () => {
  const pdfInput = document.getElementById("pdf-input");
  const extractBtn = document.getElementById("extract-btn");
  const copyBtn = document.getElementById("copy-btn");
  const clearBtn = document.getElementById("clear-btn");
  const outputText = document.getElementById("output-text");
  const statusText = document.getElementById("status");
  const themeToggle = document.getElementById("theme-toggle");

  const THEME_KEY = "site-theme";

  // ── Thème ──────────────────────────────────────────────────────────────────

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {
      // localStorage indisponible (mode privé, iframe sandbox…)
    }
  }

  function initTheme() {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem(THEME_KEY);
    } catch (_) {}
    applyTheme(savedTheme === "dark" ? "dark" : "light");
  }

  // ── Statut ─────────────────────────────────────────────────────────────────

  function setStatus(message) {
    if (statusText) statusText.textContent = message;
  }

  // ── Extraction avec préservation de la mise en forme ──────────────────────

  /**
   * Reconstitue le texte d'une page en respectant :
   *  - les retours à la ligne (détectés via le changement de coordonnée Y)
   *  - les espaces entre les mots (détectés via hasEOL et l'écart horizontal)
   *  - les lignes vides significatives
   */
  async function extractPageText(pdf, pageNumber) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent({
      includeMarkedContent: false,   // on n'a pas besoin des artefacts
      disableNormalization: false
    });

    if (!textContent || !Array.isArray(textContent.items) || textContent.items.length === 0) {
      return "";
    }

    const lines = [];
    let currentLine = [];
    let lastY = null;
    // Tolérance verticale : deux items sont sur la même ligne
    // si leur différence de Y est inférieure à ce seuil (en unités PDF).
    const Y_TOLERANCE = 2;

    for (const item of textContent.items) {
      // Certains items sont des MarkedContent et n'ont pas de str
      if (!item || typeof item.str !== "string") continue;

      const str = item.str;
      // transform[5] = coordonnée Y dans l'espace PDF
      const y = item.transform ? item.transform[5] : null;

      // Saut de ligne : changement de Y ou marqueur explicite hasEOL
      const isNewLine =
        lastY !== null &&
        y !== null &&
        Math.abs(y - lastY) > Y_TOLERANCE;

      if (isNewLine || item.hasEOL) {
        // Valide la ligne courante
        if (currentLine.length > 0) {
          lines.push(currentLine.join(""));
          currentLine = [];
        } else {
          // Ligne vide explicite → on la conserve pour espacer les paragraphes
          lines.push("");
        }
      }

      if (str) {
        currentLine.push(str);
      }

      if (y !== null) lastY = y;
    }

    // Flush de la dernière ligne
    if (currentLine.length > 0) {
      lines.push(currentLine.join(""));
    }

    return lines.join("\n");
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

    const pageParts = [];
    let okPages = 0;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      setStatus(`Extraction en cours… page ${pageNumber} / ${pdf.numPages}`);

      try {
        const pageText = await extractPageText(pdf, pageNumber);

        if (pageText && pageText.trim()) {
          pageParts.push(`--- Page ${pageNumber} ---\n${pageText}`);
          okPages++;
        }
      } catch (err) {
        console.error(`Erreur page ${pageNumber} :`, err);
        pageParts.push(`--- Page ${pageNumber} --- [erreur : ${err.message}]`);
      }
    }

    return {
      text: pageParts.join("\n\n"),
      okPages,
      totalPages: pdf.numPages
    };
  }

  // ── Boutons ────────────────────────────────────────────────────────────────

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
    extractBtn.disabled = true;
    setStatus("Chargement du PDF…");

    try {
      const result = await extractTextFromPdf(file);

      if (!result.text || !result.text.trim()) {
        setStatus("Aucun texte exploitable trouvé dans ce PDF (PDF scanné ?).");
        return;
      }

      outputText.value = result.text;
      setStatus(
        `Extraction terminée — ${result.okPages} / ${result.totalPages} page(s) lue(s).`
      );
    } catch (error) {
      console.error("Erreur extraction :", error);
      setStatus(`Erreur pendant l'extraction : ${error.message}`);
    } finally {
      extractBtn.disabled = false;
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
      setStatus("Texte copié dans le presse-papiers.");
    } catch (error) {
      console.error("Erreur copie :", error);
      // Fallback pour les navigateurs sans accès clipboard
      outputText.select();
      const success = document.execCommand("copy");
      setStatus(success ? "Texte copié (fallback)." : "Impossible de copier automatiquement.");
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
