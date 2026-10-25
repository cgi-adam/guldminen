import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { readDir } from "@tauri-apps/plugin-fs";

export class UIHandler {
    private dropZone = document.getElementById("drop-zone") as HTMLElement;
    private generateBtn = document.getElementById(
        "generate-btn",
    ) as HTMLButtonElement;
    private missingText = document.getElementById(
        "missing-text",
    ) as HTMLElement;

    private cardImg = document.getElementById("card-img") as HTMLElement;
    private pathImg = document.getElementById("path-img") as HTMLElement;
    private cardExcel = document.getElementById("card-excel") as HTMLElement;
    private pathExcel = document.getElementById("path-excel") as HTMLElement;

    private modal = document.getElementById("inspect-modal") as HTMLElement;
    private modalTitle = document.getElementById("modal-title") as HTMLElement;
    private modalList = document.getElementById(
        "modal-file-list",
    ) as HTMLElement;

    public imagePath: string = "";
    public excelPath: string = "";

    constructor() {
        this.setupDropZone();
        this.setupTauriDragAndDrop();
        this.setupFileActions();
    }

    private setupFileActions() {
        document
            .getElementById("btn-inspect-img")
            ?.addEventListener("click", async () => {
                if (this.imagePath) {
                    this.modalTitle.textContent = "Billeder i mappe";
                    this.modalList.innerHTML = "<li>Henter filer...</li>";
                    this.modal.classList.remove("hidden");

                    try {
                        const entries = await readDir(this.imagePath);
                        const images = entries.filter(
                            (e) =>
                                e.isFile &&
                                (e.name?.toLowerCase().endsWith(".jpg") ||
                                    e.name?.toLowerCase().endsWith(".png")),
                        );

                        this.modalList.innerHTML = "";
                        if (images.length === 0) {
                            this.modalList.innerHTML =
                                "<li>Ingen JPG/PNG fundet.</li>";
                        } else {
                            images.forEach((img) => {
                                const li = document.createElement("li");
                                li.textContent = img.name || "Ukendt fil";
                                this.modalList.appendChild(li);
                            });
                        }
                    } catch (err) {
                        this.modalList.innerHTML =
                            "<li>Kunne ikke læse mappen. Mangler tauri-plugin-fs?</li>";
                    }
                }
            });

        document
            .getElementById("btn-inspect-excel")
            ?.addEventListener("click", () => {
                if (this.excelPath) {
                    this.modalTitle.textContent = "Valgt Excel-fil";
                    this.modalList.innerHTML = `<li>${this.getFolderName(this.excelPath)}</li>`;
                    this.modal.classList.remove("hidden");
                }
            });

        document
            .getElementById("btn-close-modal")
            ?.addEventListener("click", () => {
                this.modal.classList.add("hidden");
            });

        this.modal.addEventListener("click", (e) => {
            if (e.target === this.modal) {
                this.modal.classList.add("hidden");
            }
        });

        document
            .getElementById("btn-delete-img")
            ?.addEventListener("click", () => {
                this.imagePath = "";
                this.updateUI();
            });

        document
            .getElementById("btn-delete-excel")
            ?.addEventListener("click", () => {
                this.excelPath = "";
                this.updateUI();
            });
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
                if (!this.imagePath) {
                    const folderPath = await open({
                        directory: true,
                        multiple: false,
                        title: "Vælg billedemappe",
                    });
                    if (folderPath) this.imagePath = folderPath as string;
                }

                if (!this.excelPath) {
                    const filePath = await open({
                        filters: [
                            { name: "Excel", extensions: ["xlsx", "xls"] },
                        ],
                        multiple: false,
                        title: "Vælg Excel-fil",
                    });
                    if (filePath) this.excelPath = filePath as string;
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

    private getFolderName(fullPath: string): string {
        const parts = fullPath.split(/[/\\]/);
        return parts.pop() || fullPath;
    }

    private updateUI() {
        if (this.imagePath) {
            this.pathImg.textContent = this.getFolderName(this.imagePath);
            this.cardImg.classList.remove("hidden");
        } else {
            this.cardImg.classList.add("hidden");
        }

        if (this.excelPath) {
            this.pathExcel.textContent = this.getFolderName(this.excelPath);
            this.cardExcel.classList.remove("hidden");
        } else {
            this.cardExcel.classList.add("hidden");
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
