// Получаем элемент для отображения размеров
const sizeDisplay = document.getElementById('size-display');

// Функция для обновления размеров окна
function updateWindowSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    sizeDisplay.textContent = `${width} x ${height}`;
}

// Обновляем размеры при загрузке страницы
updateWindowSize();

// Добавляем слушатель события для изменения размеров окна
window.addEventListener('resize', updateWindowSize);
