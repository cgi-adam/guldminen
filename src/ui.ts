import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";

export class UIHandler {
    private dropZone = document.getElementById("drop-zone") as HTMLElement;
    private generateBtn = document.getElementById(
        "generate-btn",
    ) as HTMLButtonElement;
    private statusImgText = document.getElementById(
        "status-img-text",
    ) as HTMLElement;
    private statusExcelText = document.getElementById(
        "status-excel-text",
    ) as HTMLElement;
    private missingText = document.getElementById(
        "missing-text",
    ) as HTMLElement;

    public imagePath: string = "";
    public excelPath: string = "";

    constructor() {
        this.setupDropZone();
        this.setupTauriDragAndDrop();
    }

    private setupDropZone() {
        this.dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            this.dropZone.classList.add("hover");
        });

        this.dropZone.addEventListener("dragleave", (e) => {
            e.preventDefault();
            this.dropZone.classList.remove("hover");
        });

        this.dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            this.dropZone.classList.remove("hover");
        });

        this.dropZone.addEventListener("click", async () => {
            try {
                const folderPath = await open({
                    directory: true,
                    multiple: false,
                    title: "Vælg billedemappe (Folder)",
                });

                if (folderPath) {
                    this.imagePath = folderPath as string;
                }

                const filePath = await open({
                    filters: [{ name: "Excel", extensions: ["xlsx", "xls"] }],
                    multiple: false,
                    title: "Vælg Excel-fil",
                });

                if (filePath) {
                    this.excelPath = filePath as string;
                }

                this.updateUI();
            } catch (error) {
                console.error("Fejl ved valg af filer:", error);
            }
        });
    }

    private async setupTauriDragAndDrop() {
        await listen<{ paths: string[] }>("tauri://drag-drop", (event) => {
            this.dropZone.classList.remove("hover");
            const paths = event.payload.paths;

            if (!paths || paths.length === 0) return;

            for (const filePath of paths) {
                const lowerPath = filePath.toLowerCase();
                if (lowerPath.endsWith(".xlsx") || lowerPath.endsWith(".xls")) {
                    this.excelPath = filePath;
                } else {
                    this.imagePath = filePath;
                }
            }

            this.updateUI();
        });

        await listen("tauri://drag-leave", () => {
            this.dropZone.classList.remove("hover");
        });
    }

    private updateUI() {
        if (this.imagePath) {
            this.statusImgText.textContent = "Klar";
            this.statusImgText.classList.replace("not-ready", "ready");
        } else {
            this.statusImgText.textContent = "Ikke klar";
            this.statusImgText.classList.replace("ready", "not-ready");
        }

        if (this.excelPath) {
            this.statusExcelText.textContent = "Klar";
            this.statusExcelText.classList.replace("not-ready", "ready");
        } else {
            this.statusExcelText.textContent = "Ikke klar";
            this.statusExcelText.classList.replace("ready", "not-ready");
        }

        if (this.imagePath && this.excelPath) {
            this.generateBtn.disabled = false;
            this.missingText.style.display = "none";
        } else {
            this.generateBtn.disabled = true;
            this.missingText.style.display = "block";
        }
    }
}
