// Получаем доступ к элементам
const fileInput = document.getElementById('fileInput');
const container = document.getElementById('container');
const scaleCheckbox = document.getElementById('scaleCheckbox');

// Функция для обработки загруженного изображения
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/png') {
        const img = new Image();
        img.src = URL.createObjectURL(file);  // Создаем ссылку на файл
        
        img.onload = () => {
            img.classList.add('draggable');   // Добавляем класс для стилей

            // Проверяем, нужно ли уменьшать изображение
            if (scaleCheckbox.checked) {
                img.style.transform = 'scale(0.5)';  // Уменьшение в 2 раза
            } else {
                img.style.transform = 'scale(1)';    // Оригинальный размер
            }

            container.appendChild(img);       // Добавляем изображение в контейнер
            enableDrag(img);                  // Включаем перетаскивание
        };
    } else {
        alert("Пожалуйста, выберите PNG файл.");
    }
});

// Функция для активации перетаскивания
function enableDrag(element) {
    let offsetX, offsetY;

    // Обработка событий мыши
    element.addEventListener('mousedown', (e) => {
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        document.addEventListener('mousemove', onMouseMove);
        element.style.cursor = 'grabbing';
    });

    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onMouseMove);
        element.style.cursor = 'grab';
    });

    function onMouseMove(e) {
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    }

    // Обработка событий для сенсорных устройств (тачскрин)
    element.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        offsetX = touch.clientX - element.getBoundingClientRect().left;
        offsetY = touch.clientY - element.getBoundingClientRect().top;
        document.addEventListener('touchmove', onTouchMove);
    });

    document.addEventListener('touchend', () => {
        document.removeEventListener('touchmove', onTouchMove);
    });

    function onTouchMove(e) {
        const touch = e.touches[0];
        element.style.left = `${touch.clientX - offsetX}px`;
        element.style.top = `${touch.clientY - offsetY}px`;
    }
}
