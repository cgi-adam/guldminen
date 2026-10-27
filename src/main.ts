import { initThemeToggle } from "./theme";
import { UIHandler } from "./ui";
import { handleGenerateReport } from "./api";
import { save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { translations, currentLang, Language } from "./i18n";
import { initUI } from "./ui";

const appWindow = getCurrentWindow();

document.getElementById("titlebar-minimize")?.addEventListener("click", () => {
    appWindow.minimize();
});

document.getElementById("titlebar-close")?.addEventListener("click", () => {
    appWindow.close();
});

document.querySelector(".titlebar")?.addEventListener("mousedown", (e) => {
    if ((e.target as HTMLElement).closest(".titlebar-controls")) return;
    appWindow.startDragging();
});

document.addEventListener("DOMContentLoaded", () => {
    initUI();
});

function applyTranslations(lang: Language) {
    document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (key && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
}

const langSelect = document.getElementById("lang-select") as HTMLSelectElement;
if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener("change", (e) => {
        const selectedLang = (e.target as HTMLSelectElement).value as Language;
        localStorage.setItem("app_lang", selectedLang);
        applyTranslations(selectedLang);
    });
}

applyTranslations(currentLang);

let ui: UIHandler;
document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    ui = new UIHandler();
    const generateBtn = document.getElementById("generate-btn");
    generateBtn?.addEventListener("click", async () => {
        if (!ui.imagePath || !ui.excelPath) return;
        try {
            const savePath = await save({
                filters: [
                    {
                        name: "Excel",
                        extensions: ["xlsx"],
                    },
                ],
                defaultPath: "Angiv-filnavn.xlsx",
            });
            if (savePath) {
                const result = await handleGenerateReport(
                    ui.imagePath,
                    ui.excelPath,
                    savePath,
                );
                alert(result);
            }
        } catch (err) {
            console.error(err);
        }
    });
});
