import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

let selectedExcelPath = "";
let selectedImageFolder = "";

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
        alert("Please select both a folder and an Excel file first.");
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
