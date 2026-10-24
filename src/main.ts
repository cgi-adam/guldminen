import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

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

// Example: Opening a folder picker for the images
document
    .getElementById("upload-images-btn")
    ?.addEventListener("click", async () => {
        const selectedFolder = await open({
            directory: true,
            multiple: false,
        });

        if (selectedFolder) {
            console.log("Selected image folder:", selectedFolder);
        }
    });

// Example: Opening a file explorer for the Excel file
document
    .getElementById("upload-excel-btn")
    ?.addEventListener("click", async () => {
        const selectedPath = await open({
            multiple: false,
            filters: [
                {
                    name: "Excel",
                    extensions: ["xlsx"],
                },
            ],
        });

        if (selectedPath) {
            console.log("Selected Excel file:", selectedPath);
            // Later, you will pass this path to your Rust backend using invoke()
        }
    });
