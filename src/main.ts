import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

let selectedExcelPath = "";
let selectedImageFolder = "";

const dropZone = document.getElementById("drop-zone");
const dropStatus = document.getElementById("drop-status");

const themeToggle = document.getElementById("theme-toggle");
const currentTheme = localStorage.getItem("theme");

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

getCurrentWindow().onDragDropEvent((event) => {
    if (!dropZone || !dropStatus) return;

    if (event.payload.type === "over" || event.payload.type === "enter") {
        dropZone.classList.add("hover");
    } else if (event.payload.type === "leave") {
        dropZone.classList.remove("hover");
    } else if (event.payload.type === "drop") {
        dropZone.classList.remove("hover");

        // Loop through all dropped items
        for (const path of event.payload.paths) {
            // Check if it's an Excel file based on extension
            if (
                path.toLowerCase().endsWith(".xlsx") ||
                path.toLowerCase().endsWith(".xls")
            ) {
                selectedExcelPath = path;
                console.log("Excel dropped:", path);
            } else {
                // If it's not Excel, we assume it's the image folder
                selectedImageFolder = path;
                console.log("Folder dropped:", path);
            }
        }

        // Update UI Text
        let status = [];
        if (selectedExcelPath) status.push("Excel indlæst");
        if (selectedImageFolder) status.push("Mappe indlæst");
        dropStatus.textContent =
            status.length > 0 ? status.join(" | ") : "Klar...";
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
        // Here we open the native save dialog
        const savePath = await save({
            filters: [{ name: "Excel", extensions: ["xlsx"] }],
            defaultPath: "angiv navn.xlsx",
        });

        // If the user closes the dialog without saving, stop execution
        if (!savePath) return;

        // Send all three paths to the Rust backend
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
