import { invoke } from "@tauri-apps/api/core";
import { translations, currentLang } from "./i18n";

export async function handleGenerateReport(
    imagePath: string,
    excelPath: string,
    savePath: string,
): Promise<string> {
    const t = translations[currentLang];

    try {
        const response: string = await invoke("generate_report", {
            imagePath: imagePath,
            excelPath: excelPath,
            savePath: savePath,
            headerPresent: t["report.present"],
            headerMissing: t["report.missing"],
            errorMsg: t["error.select_both"],
            successMsg: t["success.saved"],
        });

        return response;
    } catch (error) {
        throw error;
    }
}
