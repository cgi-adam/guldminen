use calamine::{Data, Reader, open_workbook_auto};
use rust_xlsxwriter::Workbook;
use std::fs;

#[tauri::command]
fn generate_report(
    image_path: String,
    excel_path: String,
    save_path: String,
) -> Result<String, String> {
    if image_path.is_empty() || excel_path.is_empty() {
        return Err("Venligst vælg både en mappe og en Excel fil".into());
    }

    // First, we read the image filenames
    let mut photographed_names = Vec::new();
    let entries = fs::read_dir(&image_path).map_err(|e| e.to_string())?;

    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_file() {
                if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                    if ext.eq_ignore_ascii_case("jpg") || ext.eq_ignore_ascii_case("png") {
                        if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                            photographed_names.push(stem.to_string());
                        }
                    }
                }
            }
        }
    }

    // Thenn, we read the master excel list by using open_workbook_auto
    let mut excel = open_workbook_auto(&excel_path).map_err(|e| e.to_string())?;

    let sheet_names = excel.sheet_names().to_owned();
    let first_sheet = &sheet_names[0];

    let mut all_students = Vec::new();

    if let Ok(range) = excel.worksheet_range(first_sheet) {
        for row in range.rows() {
            if let Some(cell) = row.get(0) {
                if let Data::String(name) = cell {
                    all_students.push(name.to_string());
                }
            }
        }
    }

    // And here we compare the lists
    let mut present = Vec::new();
    let mut missing = Vec::new();

    for student in all_students {
        let is_present = photographed_names
            .iter()
            .any(|photo_name| photo_name.contains(&student) || student.contains(photo_name));

        if is_present {
            present.push(student);
        } else {
            missing.push(student);
        }
    }

    // And now we generate the output excel
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();

    worksheet
        .write_string(0, 0, "Fotograferet")
        .map_err(|e| e.to_string())?;
    worksheet
        .write_string(0, 1, "Mangler")
        .map_err(|e| e.to_string())?;

    for (row, name) in present.iter().enumerate() {
        worksheet
            .write_string((row + 1) as u32, 0, name)
            .map_err(|e| e.to_string())?;
    }

    for (row, name) in missing.iter().enumerate() {
        worksheet
            .write_string((row + 1) as u32, 1, name)
            .map_err(|e| e.to_string())?;
    }

    // Lastly, we save the file
    workbook.save(&save_path).map_err(|e| e.to_string())?;

    Ok(format!("Succes! Filen er gemt her:\n{}", save_path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![generate_report])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
