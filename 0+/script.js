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

let score = 0; // Переменная для хранения текущего счета
let count = 10;
let timeLimit = 10;
let time_out;

function updateWordCount(value) {
    document.querySelector('label[for="count"]').textContent = `Количество (${value}):`;
}
function updateTimeLimit(value) {
    document.querySelector('label[for="timeLimit"]').textContent = `Время (${value} сек):`;
}



const progressBar = document.getElementById('progress');
function startGame() {
    score = 0;
    count = document.getElementById('count').value;
    timeLimit = document.getElementById('timeLimit').value;
    loadImages();
    window_game.style.display = 'block';
    startProgressBar(timeLimit * 1000); // Передаем время для синхронизации 
    time_out = setTimeout(() => {
      //  alert(`Время истекло!`);
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
const bestScoreKey = `bestScore`;

function endGame() {
    const gridElement = document.getElementById("grid");
    gridElement.innerHTML = '';
    clearTimeout(time_out);
    hideAllWindows(); // Скрываем все окна
    window_result.style.display = 'block'; // Показываем окно 3
    scoreElement.textContent = `${score}`;
    const storedBestScore = localStorage.getItem(bestScoreKey);
    if (!storedBestScore || score > parseFloat(storedBestScore)) {
        localStorage.setItem(bestScoreKey, score);
    } 
    loadBestScore(); // Загружаем лучшее время
}

// Загрузка лучшего времени из localStorage
function loadBestScore() {
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
    count = document.getElementById('count').value;
    timeLimit = document.getElementById('timeLimit').value;  
    updateWordCount(count); // Обновляем текст ползунка количества слов с текущим значением
    updateTimeLimit(timeLimit);   // Обновляем текст ползунка времени с текущим значением
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

function getRandomUniqueNumbers(n, max) {
    const numbers = new Set();
    while (numbers.size < n) {
        const random = Math.floor(Math.random() * max) + 1;
        numbers.add(random);
    }
    return Array.from(numbers);
}

// Функция загрузки и отображения картинок
function loadImages() {
    
    const grid = document.getElementById("grid");
    const randomNumbers = getRandomUniqueNumbers(count, 100);

    randomNumbers.forEach(num => {
        const imgContainer = document.createElement("div");
        imgContainer.className = "image-container";

        const img = document.createElement("img");
        img.src = `img/${num}.png`;
        img.alt = `${num}.png`;

        // Добавляем обработчик клика на картинку
        img.addEventListener("click", () => {
            score++;
            message.innerHTML = `Нажато <label style="color: white;">${img.alt}</label>, всего ${score}`;
            //alert(`You clicked: ${img.alt}`);
        });

        imgContainer.appendChild(img);
        grid.appendChild(imgContainer);
    });
}
