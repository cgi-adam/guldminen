export function initThemeToggle() {
    const themeBtn = document.getElementById("theme-toggle");
    const moonIcon = document.getElementById("moon-icon");
    const sunIcon = document.getElementById("sun-icon");

    themeBtn?.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");

        if (document.body.classList.contains("dark-theme")) {
            moonIcon!.style.display = "none";
            sunIcon!.style.display = "block";
        } else {
            moonIcon!.style.display = "block";
            sunIcon!.style.display = "none";
        }
    });
}
