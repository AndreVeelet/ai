let wakeLock = null; // Переменная для хранения блокировки экрана

// Функция для запроса блокировки экрана
async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');

        // Обновляем состояние каждые 5 секунд
        setInterval(null, 5000);

        // Освобождаем блокировку при закрытии вкладки
        window.addEventListener('unload', () => {
            if (wakeLock) { wakeLock.release(); }
        });

        // Слушаем событие освобождения блокировки
        wakeLock.addEventListener('release', () => {
            wakeLock = null; // Сбрасываем переменную
        });

    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

// Обработчик изменения состояния чекбокса
const checkbox = document.getElementById('fullscreenCheckbox');
checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
        // Включаем полноэкранный режим
        document.documentElement.requestFullscreen()
            .catch(err => {
                console.error(`Ошибка при попытке включить полноэкранный режим: ${err.message}`);
                checkbox.checked = false; // Сбрасываем чекбокс в случае ошибки
            });
    } else {
        // Выходим из полноэкранного режима
        document.exitFullscreen()
            .catch(err => {
                console.error(`Ошибка при попытке выйти из полноэкранного режима: ${err.message}`);
            });
    }
});

// Получаем элементы окон и кнопок
const window_settings = document.getElementById('window_settings');
const window_game = document.getElementById('window_game');
const window_result = document.getElementById('window_result');


const towindow_gameButton = document.getElementById('towindow_game');
const backTowindow_settingsButton = document.getElementById('backTowindow_settings');

// Функция для скрытия всех окон
function hideAllWindows() {
    window_settings.classList.remove('active');
    window_game.classList.remove('active');
    window_result.classList.remove('active');
}

// Переход к окну 2
towindow_gameButton.addEventListener('click', () => {
    hideAllWindows(); // Скрываем все окна
    
    overlay.style.display = 'flex'; // Показываем overlay
        // Скрываем через 5 секунд
        setTimeout(() => {
            overlay.style.display = 'none';
            startGame();
        }, 4000);
   
    
    loadBestTime(); // Загружаем лучшее время для выбранного размера
});

// Переход обратно к окну 1
backTowindow_settingsButton.addEventListener('click', () => {
    hideAllWindows(); // Скрываем все окна
    window_settings.classList.add('active'); // Показываем окно 1
});

//ИГРА


let gridSize = 5; // Начальный размер таблицы
let numbers = [];
let currentNumber = 1; // С какого числа начинать
let startTime;
let timerInterval;
let elapsed = 0; // Хранит общее время
let bestTime = null;

const gridElement = document.getElementById('grid');
const timeElement = document.getElementById('time');
const bestTimeElement = document.getElementById('best-time');
const gridSizeElement = document.getElementById('grid-size');

// Функция для генерации случайного светлого цвета
function getRandomLightColor() {
    const r = Math.floor(Math.random() * 156) + 100; // от 100 до 255 (чтобы цвета были светлыми)
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgb(${r},${g},${b})`;
}

// Функция для генерации случайного порядка чисел
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Генерация таблицы
function generateGrid() {
    numbers = Array.from({ length: gridSize * gridSize }, (_, i) => i + 1); // Числа от 1 до N
    shuffle(numbers); // Перемешиваем числа

    gridElement.innerHTML = ''; // Очищаем таблицу
    if (gridSize === 7) {
        gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`; // Настраиваем сетку
        gridElement.style.gridTemplateRows = `repeat(${gridSize}, 50px)`;
    } 
    else {
        gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`; // Настраиваем сетку
        gridElement.style.gridTemplateRows = `repeat(${gridSize}, 60px)`;
    }

          

    numbers.forEach(number => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.textContent = number;
        cell.style.backgroundColor = getRandomLightColor(); // Задаем светлый цвет
        cell.addEventListener('click', () => handleCellClick(number, cell));
        gridElement.appendChild(cell);
    });
}

// Обработка клика на клетку
function handleCellClick(number, cell) {
    if (number === currentNumber) {
        cell.classList.add('disabled'); // Применяем эффект исчезновения
        currentNumber++;

        if (currentNumber > gridSize * gridSize) {
            endGame(); // Если все числа найдены
        }
    }
}

// Старт игры
function startGame() {
    window_game.classList.add('active'); // Показываем окно 2
    requestWakeLock();
    gridSize = parseInt(gridSizeElement.value); // Получаем выбранный размер


    currentNumber = 1; // Сбросить начальное число
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 100); // Обновляем таймер каждые 100мс
    generateGrid(); // Генерируем таблицу
}

// Обновление таймера
function updateTimer() {
    if (!timerInterval) return;
    const currentTime = new Date();
    const elapsed = (currentTime - startTime) / 1000;
    timeElement.textContent = elapsed.toFixed(1);
}

// Окончание игры
function endGame() {
    const time_Elasted = document.getElementById('time_elasted');
    hideAllWindows(); // Скрываем все окна
    window_result.classList.add('active'); // Показываем окно 3

    clearInterval(timerInterval); // Останавливаем таймер
    timerInterval = null; // Обнуляем переменную, чтобы не обновлять таймер дальше
    // Сохраняем текущее значение elapsed для использования при перезапуске
    elapsed += (new Date() - startTime) / 1000; // Добавляем к elapsed прошедшее время
    time_Elasted.textContent = elapsed.toFixed(1) + " секунд";
    elapsed = 0;
    const currentTime = parseFloat(timeElement.textContent);
    const bestTimeKey = `bestTime_${gridSize}x${gridSize}`;

    // Проверяем, есть ли лучшее время в localStorage
    const storedBestTime = localStorage.getItem(bestTimeKey);
    if (!storedBestTime || currentTime < parseFloat(storedBestTime)) {
        localStorage.setItem(bestTimeKey, currentTime);
        bestTime = currentTime;
      //  alert(`Новый рекорд! Вы нашли все числа за ${currentTime.toFixed(1)} секунд.`);
    } else {
      //  alert(`Игра окончена! Вы нашли все числа за ${currentTime.toFixed(1)} секунд.`);
    }

    loadBestTime(); // Загружаем лучшее время
}

// Загрузка лучшего времени из localStorage
function loadBestTime() {
    const bestTimeKey = `bestTime_${gridSize}x${gridSize}`;
    const storedBestTime = localStorage.getItem(bestTimeKey);

    if (storedBestTime) {
        bestTime = parseFloat(storedBestTime);
        bestTimeElement.textContent = `${bestTime.toFixed(1)} секунд`;
    } else {
        bestTimeElement.textContent = '—';
    }
}


// Запускаем игру при загрузке страницы
window.onload = () => {
    loadBestTime(); // Загружаем лучшее время при загрузке страницы
};


