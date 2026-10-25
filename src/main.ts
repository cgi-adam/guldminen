import { initThemeToggle } from "./theme";
import { UIHandler } from "./ui";
import { generateReport } from "./api";
import { save } from "@tauri-apps/plugin-dialog";

document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    const ui = new UIHandler();

    const generateBtn = document.getElementById("generate-btn");

    generateBtn?.addEventListener("click", async () => {
        if (!ui.imagePath || !ui.excelPath) return;

        try {
            const savePath = await save({
                filters: [{ name: "Excel", extensions: ["xlsx"] }],
                defaultPath: "Mangler-Rapport.xlsx",
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
