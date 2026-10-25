import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

let selectedExcelPath = "";
let selectedImageFolder = "";

const dropZone = document.getElementById("drop-zone");

const themeToggle = document.getElementById("theme-toggle");
const currentTheme = localStorage.getItem("theme");

const statusImgText = document.getElementById("status-img-text");
const statusExcelText = document.getElementById("status-excel-text");
const generateBtn = document.getElementById(
    "generate-btn",
) as HTMLButtonElement | null;
const missingText = document.getElementById("missing-text");

function updateUI() {
    if (selectedImageFolder) {
        statusImgText!.textContent = "Klar";
        statusImgText!.className = "status-text ready";
    } else {
        statusImgText!.textContent = "Ikke klar";
        statusImgText!.className = "status-text not-ready";
    }

    if (selectedExcelPath) {
        statusExcelText!.textContent = "Klar";
        statusExcelText!.className = "status-text ready";
    } else {
        statusExcelText!.textContent = "Ikke klar";
        statusExcelText!.className = "status-text not-ready";
    }

    if (selectedImageFolder && selectedExcelPath) {
        generateBtn!.disabled = false;
        missingText!.textContent = "";
    } else if (!selectedImageFolder && !selectedExcelPath) {
        generateBtn!.disabled = true;
        missingText!.textContent =
            "* Billeder og Excel-fil mangler at blive lagt ind";
    } else if (!selectedImageFolder) {
        generateBtn!.disabled = true;
        missingText!.textContent = "* Billedmappe mangler at blive lagt ind";
    } else {
        generateBtn!.disabled = true;
        missingText!.textContent = "* Excel-fil mangler at blive lagt ind";
    }
}

if (currentTheme === "dark") {
    document.body.classList.add("dark-theme");
}

themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const theme = document.body.classList.contains("dark-theme")
        ? "dark"
        : "light";
    localStorage.setItem("theme", theme);
});

async function greet() {
    if (greetMsgEl && greetInputEl) {
        // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        greetMsgEl.textContent = await invoke("test_greet", {
            name: greetInputEl.value,
        });
    }
}

window.addEventListener("DOMContentLoaded", () => {
    greetInputEl = document.querySelector("#greet-input");
    greetMsgEl = document.querySelector("#greet-msg");
    document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        greet();
    });
});

document.getElementById("drop-zone")?.addEventListener("click", async () => {
    const excelPath = await open({
        multiple: false,
        filters: [{ name: "Excel", extensions: ["xlsx", "xls"] }],
        title: "Vælg din master Excel-fil",
    });
    if (excelPath) {
        selectedExcelPath = excelPath as string;

        const folderPath = await open({
            directory: true,
            multiple: false,
            title: "Vælg mappen med billeder",
        });
        if (folderPath) {
            selectedImageFolder = folderPath as string;
        }
    }
    updateUI();
});

getCurrentWindow().onDragDropEvent((event) => {
    if (!dropZone) return;

    if (event.payload.type === "over" || event.payload.type === "enter") {
        dropZone.classList.add("hover");
    } else if (event.payload.type === "leave") {
        dropZone.classList.remove("hover");
    } else if (event.payload.type === "drop") {
        dropZone.classList.remove("hover");

        for (const path of event.payload.paths) {
            if (
                path.toLowerCase().endsWith(".xlsx") ||
                path.toLowerCase().endsWith(".xls")
            ) {
                selectedExcelPath = path;
                console.log("Excel dropped:", path);
            } else {
                selectedImageFolder = path;
                console.log("Folder dropped:", path);
            }
        }

        updateUI();
    }
});

document
    .getElementById("upload-excel-btn")
    ?.addEventListener("click", async () => {
        const selectedPath = await open({
            multiple: false,
            filters: [{ name: "Excel", extensions: ["xlsx"] }],
        });
        if (selectedPath) {
            selectedExcelPath = selectedPath as string;
            console.log("Excel selected:", selectedExcelPath);
        }
    });

document
    .getElementById("upload-images-btn")
    ?.addEventListener("click", async () => {
        const selectedFolder = await open({
            directory: true,
            multiple: false,
        });
        if (selectedFolder) {
            selectedImageFolder = selectedFolder as string;
            console.log("Images selected:", selectedImageFolder);
        }
    });

document.getElementById("generate-btn")?.addEventListener("click", async () => {
    if (!selectedImageFolder || !selectedExcelPath) {
        alert("Venligst vælg både en mappe og en Excel fil.");
        return;
    }

    try {
        const savePath = await save({
            filters: [{ name: "Excel", extensions: ["xlsx"] }],
            defaultPath: "angiv navn.xlsx",
        });

        if (!savePath) return;

        const response = await invoke("generate_report", {
            imagePath: selectedImageFolder,
            excelPath: selectedExcelPath,
            savePath: savePath,
        });

        alert(response);
    } catch (error) {
        alert("Error: " + error);
    }
});
