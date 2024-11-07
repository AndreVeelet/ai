let isWindowActive = false; // Переменная для отслеживания состояния окна
// Функция для прекращения действия по умолчанию
document.addEventListener('touchmove', function(e) {
    if (isWindowActive) {
        e.preventDefault(); // Предотвращаем прокрутку, если окно активно
    }
}, { passive: false });

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
            window_game.classList.add('active'); // Показываем окно 2
            requestWakeLock();
	isWindowActive = true;
//Старт игры
		
            startGame();

        }, 2000);
   
 //   alert(`Контрольная точка 1`);

    loadBestTime(); // Загружаем лучшее время для выбранного размера
});

// Переход обратно к окну 1
backTowindow_settingsButton.addEventListener('click', () => {
    hideAllWindows(); // Скрываем все окна
    isWindowActive = false;
    window_settings.classList.add('active'); // Показываем окно 1
});

//ИГРА


let gridSize = 5; // Начальный размер таблицы

let startTime;
let timerInterval;
let elapsed = 0; // Хранит общее время
let bestTime = null;

const gridElement = document.getElementById('grid');
const timeElement = document.getElementById('time');
const bestTimeElement = document.getElementById('best-time');
const gridSizeElement = document.getElementById('grid-size');



// Старт игры

let timeLimit = 5;

function startGame() {
    window_game.classList.add('active');
    setTimeout(() => {
        alert(`Контрольная точка 2`);
        endGame(); // Если все числа найдены
    }, timeLimit*1000 + 500);

    startTime = new Date();
    timerInterval = setInterval(updateTimer, 100); // Обновляем таймер каждые 100мс

    startProgressBar(timeLimit * 1000); // Передаем время для синхронизации 
    
    const interval = setInterval(() => {
   
        
        updateTimer();
    }, 10);
    
}    
// Обновление таймера
function updateTimer() {
    if (!timerInterval) return;
    const currentTime = new Date();
    const elapsed = (currentTime - startTime) / 1000;
    timeElement.textContent = elapsed.toFixed(1);
}

function startProgressBar(duration) {
    const progressBar = document.getElementById('progress');
    
    // Сбрасываем ширину и убираем transition, чтобы не было мгновенного заполнения
    progressBar.style.width = '0%';
    progressBar.style.transition = 'none'; 
    
    // Запускаем плавное увеличение ширины после небольшого тайм-аута, чтобы сброс применился
    setTimeout(() => {
        progressBar.style.transition = `width ${duration}ms linear`; // Устанавливаем плавную анимацию
        progressBar.style.width = '100%'; // Увеличиваем до 100% за заданное время
    }, 50);  // Небольшая задержка, чтобы CSS успел сбросить ширину
}

// Окончание игры
function endGame() {
    const time_Elasted = document.getElementById('time_elasted');
    hideAllWindows(); // Скрываем все окна
    window_result.classList.add('active'); // Показываем окно 3

    clearInterval(timerInterval); // Останавливаем таймер
    timerInterval = null; // Обнуляем переменную, чтобы не обновлять таймер дальше
   
    elapsed = 0;
    const currentTime = parseFloat(timeElement.textContent);
    const bestTimeKey = `bestTime_${gridSize}x${gridSize}`;
    time_Elasted.textContent = timeElement.textContent + " секунд";
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


