export type Language = "da" | "en";

export const translations: Record<Language, Record<string, string>> = {
    da: {
        "lang.current": "Dansk",
        "dropzone.default":
            "Træk og slip en mappe med<br/>billeder og en Excel-fil her",
        "dropzone.hover": "Slip her",
        "badge.images": "Billeder",
        "badge.excel": "Excel-fil",
        "btn.generate": "Opret et nyt regneark",
        "modal.title": "Filindhold",
        "report.present": "Fotograferet",
        "report.missing": "Mangler",
        "error.select_both": "Venligst vælg både en mappe og en Excel fil",
        "success.saved": "Succes! Filen er gemt her:\n",
        "greeting.morning": "Godmorgen.",
        "greeting.day": "Goddag.",
        "greeting.evening": "Godaften.",
    },
    en: {
        "lang.current": "English",
        "dropzone.default":
            "Drag and drop a folder of<br/>images and an Excel file here",
        "dropzone.hover": "Drop here",
        "badge.images": "Images",
        "badge.excel": "Excel File",
        "btn.generate": "Generate new spreadsheet",
        "modal.title": "File Contents",
        "report.present": "Present",
        "report.missing": "Missing",
        "error.select_both": "Please select both a folder and an Excel file",
        "success.saved": "Success! File saved at:\n",
        "greeting.morning": "Good morning.",
        "greeting.day": "Good afternoon.",
        "greeting.evening": "Good evening.",
    },
};

export let currentLang: Language =
    (localStorage.getItem("app_lang") as Language) || "da";

export function setLanguage(lang: Language) {
    currentLang = lang;
    localStorage.setItem("app_lang", currentLang);
}
