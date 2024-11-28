
let isWindowActive = false; // Переменная для отслеживания состояния окна
// Функция для прекращения действия по умолчанию
document.addEventListener('touchmove', function(e) {
    if (isWindowActive) { e.preventDefault(); } // Предотвращаем прокрутку, если окно активно
}, { passive: false });

let wakeLock = null; // Переменная для хранения блокировки экрана
// Функция для запроса блокировки экрана
async function requestWakeLock() {
    try { 
        wakeLock = await navigator.wakeLock.request('screen');
        setInterval(null, 5000); // Обновляем состояние каждые 5 секунд
        window.addEventListener('unload', () => { // Освобождаем блокировку при закрытии вкладки
            if (wakeLock) { wakeLock.release(); }
        });
        wakeLock.addEventListener('release', () => {  // Слушаем событие освобождения блокировки
            wakeLock = null; // Сбрасываем переменную
        });
    } catch (err) { console.error(`${err.name}, ${err.message}`);
    }
}

// Обработчик изменения состояния чекбокса
const checkbox = document.getElementById('fullscreenCheckbox');
checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
        document.documentElement.requestFullscreen() // Включаем полноэкранный режим
        .catch(err => {
            console.error(`Ошибка при попытке включить полноэкранный режим: ${err.message}`);
            checkbox.checked = false; // Сбрасываем чекбокс в случае ошибки
        });
    } else {
        document.exitFullscreen()  // Выходим из полноэкранного режима
        .catch(err => { console.error(`Ошибка при попытке выйти из полноэкранного режима: ${err.message}`);});
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
    window_settings.style.display = 'none';
    window_game.style.display = 'none';
    window_result.style.display = 'none';
}

// Переход к окну 2
towindow_gameButton.addEventListener('click', () => {
    hideAllWindows(); // Скрываем все окна
    overlay.style.display = 'flex'; // Показываем overlay
    setTimeout(() => {
        overlay.style.display = 'none';
        window_game.classList.add('active'); // Показываем окно 2
        requestWakeLock();
	    isWindowActive = true;
        startGame(); //Старт игры
    }, 1000);
    loadBestScore(); // Загружаем лучший результат
});

// Переход обратно к окну 1
backTowindow_settingsButton.addEventListener('click', () => {
    hideAllWindows(); // Скрываем все окна
    isWindowActive = false;
    window_settings.style.display = 'block'; // Показываем окно настроек
});

//ИГРА

let bestScore = null;
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const message = document.getElementById('message');
const grid = document.getElementById('grid');
const colors = ["red", "green", "blue", "cyan", "purple", "orange", "grey", "magenta"];
const cells = [];
let colorIndex = 0;
let filledCells = 0;

let score = 0; // Переменная для хранения текущего счета
let level = 3;
let timeLimit;
let time_out;
//let clickDisabled = false;

// Создаем сетку 8x8
for (let i = 0; i < 64; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.addEventListener('click', onCellClick);          //("click", () => { if (!clickDisabled) onCellClick; });
    grid.appendChild(cell);
    cells.push(cell);
}


function updateLevel() {
    const images = document.querySelectorAll('.level-image');
    images[1].style.opacity = '1';
    images[1].style.transform = 'scale(1)';
    const text = images[1].nextElementSibling;
    text.style.fontWeight = 'bold';
    text.style.fontSize = `1.1em`;

    images.forEach(image => {
        image.addEventListener('click', () => {
            // Убираем выделение с остальных изображений
            images.forEach(img => {
                img.style.opacity = '0.2';
                img.style.transform = 'scale(0.75)';
                img.nextElementSibling.style.fontWeight = 'normal'; // Сбрасываем жирный шрифт
                img.nextElementSibling.style.fontSize = `.9em`;
            });
            // Выделяем текущее изображение
            image.style.opacity = '1';
            image.style.transform = 'scale(1)';
            // Делаем текст жирным
            const text = image.nextElementSibling;
            text.style.fontWeight = 'bold';
            text.style.fontSize = `1.1em`;
            level = parseInt(image.getAttribute('data-level'));
           // console.log('Текущий уровень:', count);
        });
    });
}

const progressBar = document.getElementById('progress');
function startGame() {
    score = 0;
   
    setupGame();
    
    timeLimit = parseInt(level) === 1 ? 50 : parseInt(level) === 2 ? 40 : 30;

    window_game.style.display = 'block';
    startProgressBar(timeLimit * 1000); // Передаем время для синхронизации 
    time_out = setTimeout(() => {
         endGame(); // Если время истекло    
    },  + timeLimit*1000);
}    

function startProgressBar(duration) {
    progressBar.style.width = '0%'; // Сбрасываем ширину
    progressBar.style.transition = 'none';// и убираем transition, чтобы не было мгновенного заполнения
    setTimeout(() => { // Запускаем плавное увеличение ширины после небольшого тайм-аута, чтобы сброс применился
        progressBar.style.transition = `width ${duration}ms linear`; // Устанавливаем плавную анимацию
        progressBar.style.width = '100%'; // Увеличиваем до 100% за заданное время
     }, 50);  // Небольшая задержка, чтобы CSS успел сбросить ширину
}

// Окончание игры

function endGame() {
    clearTimeout(time_out);
    hideAllWindows(); // Скрываем все окна
    window_result.style.display = 'block'; // Показываем окно 3
    scoreElement.textContent = `${score}`;
    const bestScoreKey = `bestTime_${level}`;
    const storedBestScore = localStorage.getItem(bestScoreKey);
    if (!storedBestScore || score > parseFloat(storedBestScore)) {
        localStorage.setItem(bestScoreKey, score);
    } 
    loadBestScore(); // Загружаем лучшее время
}

// Загрузка лучшего времени из localStorage
function loadBestScore() {
    const bestScoreKey = `bestTime_${level}`;
    const storedBestScore = localStorage.getItem(bestScoreKey);
    if (storedBestScore) {
        bestScore = parseFloat(storedBestScore);
        bestScoreElement.textContent = `${bestScore}`;
    } else {
        bestScoreElement.textContent = '—';
    }
}


// Запускаем игру при загрузке страницы
window.onload = () => {
    setRandomBackground();
   // count = document.getElementById('count').value;
    
    updateLevel(); // Обновляем уровень
   
    window_game.style.display = 'none';
    window_result.style.display = 'none';
    
    document.body.style.transformOrigin = 'top center';
    document.body.style.transform = 'scale(1)';
    document.body.style.backgroundSize = 'auto';
    if (document.documentElement.clientWidth < 500) {
        document.body.style.transform = 'scale(' + document.documentElement.clientWidth/500 + ')';
        document.body.style.backgroundSize = '100% auto';
    }
    
  //  loadBestScore(); // Загружаем лучшее время при загрузке страницы
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadGrid() {
    const existingGrids = JSON.parse(localStorage.getItem('grids') || '[]');
    if (existingGrids.length === 0) {   alert('Нет сохраненных таблиц.');
        return;
    }

    const randomGrid = existingGrids[Math.floor(Math.random() * existingGrids.length)];
    shuffleArray(colors);

    randomGrid.flat().forEach((colorIndex, i) => {
        cells[i].style.backgroundColor = colors[colorIndex];
    });
}


  function setupGame() {
   
    message.textContent = "Найди какого цвета больше";
   // clickDisabled = false;
    loadGrid();
  }

 
  function onCellClick(event) {

    // Отключаем клики
    grid.classList.add('disabled');

   // clickDisabled = true; // Отключение нажатий
    const cellIndex = cells.indexOf(event.target);
    const cellColorIndex = colors.indexOf(event.target.style.backgroundColor);

    if (cellColorIndex === 0) {
        score++;
        message.textContent = "Правильно!";
    } else {
        message.textContent = "Неправильно!";
    }

    cells.forEach((cell, index) => {
        if (colors.indexOf(cell.style.backgroundColor) !== 0) {
            cell.style.opacity = '0.2';
        }
    });

    setTimeout(() => {
        cells.forEach(cell => {
            cell.style.opacity = '1';
        });
         // Включаем клики обратно
         grid.classList.remove('disabled');
        setupGame();
    }, 1000);
}

function loadFromJSON() {
    fetch('grid.json')
        .then(response => response.json())
        .then(grids => {
            localStorage.setItem('grids', JSON.stringify(grids));
          //  alert('Таблицы загружены из grid.json в localStorage.');
        })
        .catch(() => alert('Ошибка загрузки grid.json.'));
}
loadFromJSON();

// Создаем массив с именами фоновых изображений 
const bg_images = [];
for (let i = 1; i <= 70; i++) {
    bg_images.push(`../UI/bg${String(i).padStart(2, '0')}.jpg`); // Формируем имена файлов bg01.jpg, bg02.jpg и т.д.
}

// Функция для выбора случайного изображения
function setRandomBackground() {
    const randomIndex = Math.floor(Math.random() * bg_images.length); // Генерируем случайный индекс
    document.body.style.backgroundImage = `url(${bg_images[randomIndex]})`; // Устанавливаем фоновое изображение
}
