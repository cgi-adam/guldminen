import { invoke } from "@tauri-apps/api/core";

export async function generateReport(
    imagePath: string,
    excelPath: string,
    savePath: string,
): Promise<string> {
    try {
        return await invoke("generate_report", {
            imagePath,
            excelPath,
            savePath,
        });
    } catch (error) {
        throw new Error(error as string);
    }
}
