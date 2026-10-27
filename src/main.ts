import { initThemeToggle } from "./theme";
import { setDynamicGreeting, UIHandler } from "./ui";
import { generateReport } from "./api";
import { save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";

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

window.addEventListener("DOMContentLoaded", setDynamicGreeting);

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    const ui = new UIHandler();

    const generateBtn = document.getElementById("generate-btn");

    generateBtn?.addEventListener("click", async () => {
        if (!ui.imagePath || !ui.excelPath) return;

        try {
            const savePath = await save({
                filters: [{ name: "Excel", extensions: ["xlsx"] }],
                defaultPath: "Angiv-filnavn.xlsx",
            });

            if (savePath) {
                const result = await generateReport(
                    ui.imagePath,
                    ui.excelPath,
                    savePath,
                );
                alert(result);
            }
        } catch (err) {
            console.error(err);
            alert("Der opstod en fejl: " + err);
        }
    });
});
