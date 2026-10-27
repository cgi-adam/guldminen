use calamine::{Data, Reader, open_workbook_auto};
use rust_xlsxwriter::{Color, Format, Workbook};
use std::fs;

#[tauri::command]
fn generate_report(
    image_path: String,
    excel_path: String,
    save_path: String,
    header_present: String,
    header_missing: String,
    error_msg: String,
    success_msg: String,
) -> Result<String, String> {
    if image_path.is_empty() || excel_path.is_empty() {
        return Err(error_msg);
    }

    // 1. Read the image filenames
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

    // 2. Read the master excel list
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

    // 3. Compare the lists
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

    // 4. Generate the styled output excel
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();

    // Set column widths so names are readable without manual expansion
    worksheet
        .set_column_width(0, 45.0)
        .map_err(|e| e.to_string())?;
    worksheet
        .set_column_width(1, 45.0)
        .map_err(|e| e.to_string())?;

    // Define visual formats
    let branding_format = Format::new().set_bold().set_font_size(14);
    let summary_format = Format::new().set_italic().set_font_color(Color::Gray);

    let present_header_fmt = Format::new()
        .set_bold()
        .set_font_color(Color::White)
        .set_background_color(Color::RGB(0x2E7D32)); // Dark Green
    let missing_header_fmt = Format::new()
        .set_bold()
        .set_font_color(Color::White)
        .set_background_color(Color::RGB(0xC62828)); // Dark Red

    let present_cell_fmt = Format::new().set_font_color(Color::RGB(0x1B5E20));
    let missing_cell_fmt = Format::new().set_font_color(Color::RGB(0xB71C1C));

    // Calculate summary statistics
    let total = present.len() + missing.len();
    let present_pct = if total > 0 {
        (present.len() as f64 / total as f64) * 100.0
    } else {
        0.0
    };

    // Write Branding and Summary (Rows 0 and 1)
    worksheet
        .write_string_with_format(0, 0, "Match Report", &branding_format)
        .map_err(|e| e.to_string())?;

    let summary_text = format!(
        "Total: {} | {}: {} ({:.1}%) | {}: {}",
        total,
        header_present,
        present.len(),
        present_pct,
        header_missing,
        missing.len()
    );
    worksheet
        .write_string_with_format(1, 0, &summary_text, &summary_format)
        .map_err(|e| e.to_string())?;

    // Write translated, color-coded headers (Row 3)
    let start_row = 3;
    worksheet
        .write_string_with_format(start_row, 0, &header_present, &present_header_fmt)
        .map_err(|e| e.to_string())?;
    worksheet
        .write_string_with_format(start_row, 1, &header_missing, &missing_header_fmt)
        .map_err(|e| e.to_string())?;

    // Write data arrays with color formatting
    for (i, name) in present.iter().enumerate() {
        worksheet
            .write_string_with_format((start_row + 1 + i as u32), 0, name, &present_cell_fmt)
            .map_err(|e| e.to_string())?;
    }

    for (i, name) in missing.iter().enumerate() {
        worksheet
            .write_string_with_format((start_row + 1 + i as u32), 1, name, &missing_cell_fmt)
            .map_err(|e| e.to_string())?;
    }

    // 5. Save the file
    workbook.save(&save_path).map_err(|e| e.to_string())?;

    Ok(format!("{}{}", success_msg, save_path))
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
