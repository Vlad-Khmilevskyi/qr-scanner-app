document.getElementById('btn-share').addEventListener('click', () => {
    const blob = generateExcelFile(); // Наша функція створення Excel
    if (!blob) return;

    // Створюємо посилання для завантаження
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Inventory_" + new Date().toISOString().slice(0,10) + ".xlsx";
    
    // Додаємо елемент у документ, клікаємо і видаляємо
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Додатково: пробуємо викликати системне меню "Поділитися", якщо воно доступне
    try {
        const file = new File([blob], "Inventory.xlsx", { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: 'Результати інвентаризації',
            });
        }
    } catch (e) {
        console.log("Системне меню недоступне, файл завантажено браузером.");
    }
});