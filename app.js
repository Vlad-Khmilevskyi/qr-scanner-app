// Масив для збереження відсканованих даних
let scannedData = [];
// Змінна, щоб не сканувати один і той самий код кілька разів поспіль
let lastScanText = "";

// Налаштування сканера (камери)
const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }, 
    false
);

// Функція, яка спрацьовує при успішному скануванні
function onScanSuccess(decodedText) {
    if (decodedText !== lastScanText) {
        lastScanText = decodedText;
        
        // Додаємо відсканований текст та час у наш масив
        scannedData.push({
            "Інвентарні дані": decodedText,
            "Час сканування": new Date().toLocaleTimeString('uk-UA')
        });

        // Виводимо зелений текст про успіх
        const statusEl = document.getElementById('status-text');
        statusEl.innerText = "Успішно відскановано!";
        setTimeout(() => { statusEl.innerText = ""; }, 2000);

        // Додаємо запис у список на екрані
        const li = document.createElement('li');
        li.innerText = decodedText;
        document.getElementById('result-list').prepend(li);
    }
}

// Запускаємо сканер
html5QrcodeScanner.render(onScanSuccess, (error) => {
    // Ігноруємо помилки, коли QR-код просто не знайдено в кадрі
});

// Функція для генерації Excel файлу з нашого масиву
function generateExcelFile() {
    if (scannedData.length === 0) {
        alert("Спочатку відскануйте хоча б один QR-код!");
        return null;
    }
    
    // Перетворюємо JSON (наш масив) на аркуш Excel
    const worksheet = XLSX.utils.json_to_sheet(scannedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Інвентаризація");

    // Формуємо бінарний файл XLSX
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// Кнопка "Зберегти в Excel"
document.getElementById('btn-export').addEventListener('click', () => {
    const blob = generateExcelFile();
    if (!blob) return;

    // Створюємо посилання для завантаження і програмно клікаємо по ньому
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Inventory_Scan.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
    
    // Якщо браузер підтримує функцію Share (як на смартфонах), показуємо кнопку "Поділитися"
    if (navigator.canShare) {
        document.getElementById('btn-share').style.display = 'block';
    }
});

// Кнопка "Поділитися файлом"
document.getElementById('btn-share').addEventListener('click', async () => {
    const blob = generateExcelFile();
    if (!blob) return;

    // Створюємо об'єкт File
    const file = new File([blob], "Inventory_Scan.xlsx", { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Перевіряємо, чи можемо поділитися саме цим файлом
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: 'Результати інвентаризації',
                text: 'Надсилаю файл Excel з відсканованими кодами.',
            });
        } catch (error) {
            console.log('Користувач скасував або сталася помилка', error);
        }
    } else {
        alert("На жаль, ваш браузер не підтримує пересилання файлів.");
    }
});