// Vite dynamic assets loader
const modules = import.meta.glob("../assets/AirlineLogos/*.{png,jpg,jpeg,svg,webp}", {
    eager: true,
});

const logoMap = {};
for (const path in modules) {
    // path: ../assets/airlines/KU.png
    const file = path.split("/").pop();
    const code = file.split(".")[0].toUpperCase();
    logoMap[code] = modules[path].default;
}

export const getAirlineLogo = (code) => {
    if (!code) return null;
    return logoMap[String(code).toUpperCase()] || null;
};
