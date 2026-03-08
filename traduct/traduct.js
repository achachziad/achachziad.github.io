document.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("input-text");
  const pasteBtn = document.getElementById("paste-btn");
  const copyBtn = document.getElementById("copy-btn");
  const clearBtn = document.getElementById("clear-btn");
  const themeToggle = document.getElementById("theme-toggle");
  const menuToggle = document.getElementById("menu-toggle");
  const menuDropdown = document.getElementById("menu-dropdown");

  const THEME_KEY = "site-theme";
  const PDF_TEXT_KEY = "pdfTextToTranslate";

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

  function closeMenu() {
    menuDropdown.classList.add("hidden");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    const isHidden = menuDropdown.classList.contains("hidden");

    if (isHidden) {
      menuDropdown.classList.remove("hidden");
      menuToggle.setAttribute("aria-expanded", "true");
    } else {
      closeMenu();
    }
  }

  function setDisplayedText(text) {
    inputText.textContent = text || "";
  }

  function getDisplayedText() {
    return inputText.textContent || "";
  }

  function loadTextFromSessionStorage() {
    const storedText = sessionStorage.getItem(PDF_TEXT_KEY);

    if (storedText && storedText.trim()) {
      setDisplayedText(storedText);
      sessionStorage.removeItem(PDF_TEXT_KEY);
    }
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });

  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  document.addEventListener("click", (event) => {
    if (!menuDropdown.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });

  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();

      if (text) {
        setDisplayedText(text);
      }
    } catch (error) {
      console.error(error);
      alert("Impossible de coller automatiquement. Colle le texte manuellement.");
    }

    closeMenu();
  });

  copyBtn.addEventListener("click", async () => {
    const text = getDisplayedText();

    if (!text.trim()) {
      closeMenu();
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error(error);
      alert("Impossible de copier automatiquement.");
    }

    closeMenu();
  });

  clearBtn.addEventListener("click", () => {
    setDisplayedText("");
    closeMenu();
  });

  initTheme();
  loadTextFromSessionStorage();
});
