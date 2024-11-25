
const countries = [
    "Афганистан", "Албания", "Алжир", "Ангола", "Аргентина", "Армения",
    "Австралия", "Австрия", "Азербайджан", "Бангладеш", "Беларусь", "Бельгия",
    "Боливия", "Бразилия", "Болгария", "Камерун", "Канада", "Чили", "Китай",
    "Колумбия", "Конго", "Хорватия", "Куба", "Кипр", "Чехия", "Дания",
    "Эквадор", "Египет", "Эстония", "Эфиопия", "Франция", "Грузия", "Германия",
    "Гана", "Великобритания", "Греция", "Исландия", "Индия", "Индонезия",
    "Иран", "Ирак", "Израиль", "Италия", "Япония", "Иордания", "Казахстан",
    "Кения", "Кыргызстан", "Малайзия", "Мексика", "Молдова", "Монголия",
    "Марокко", "Мьянма", "Непал", "Нидерланды", "Новая Зеландия", "Нигерия",
    "Северная Корея", "Норвегия", "Пакистан", "Филиппины", "Польша", "Португалия",
    "Катар", "Румыния", "Россия", "Саудовская Аравия", "Сербия", "Южная Африка",
    "Южная Корея", "Испания", "Швеция", "Швейцария", "Сирия", "Танзания",
    "Таиланд", "Турция", "Уганда", "Украина", "США", "Узбекистан", "Венесуэла",
    "Вьетнам", "Зимбабве"
  ];

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
const flagGrid = document.getElementById("flag-grid");

let score = 0; // Переменная для хранения текущего счета
let count = 10;
let timeLimit = 30;
let time_out;
let clickDisabled = false;

function updateWordCount(value) {
    document.querySelector('label[for="count"]').textContent = `Количество (${value*value}):`;
}



const progressBar = document.getElementById('progress');
function startGame() {
    score = 0;
    count = document.getElementById('count').value;
    setupGame();
   // loadImages();
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

function endGame() {
    clearTimeout(time_out);
    hideAllWindows(); // Скрываем все окна
    window_result.style.display = 'block'; // Показываем окно 3
    scoreElement.textContent = `${score}`;
    const bestScoreKey = `bestTime_${count}`;
    const storedBestScore = localStorage.getItem(bestScoreKey);
    if (!storedBestScore || score > parseFloat(storedBestScore)) {
        localStorage.setItem(bestScoreKey, score);
    } 
    loadBestScore(); // Загружаем лучшее время
}

// Загрузка лучшего времени из localStorage
function loadBestScore() {
    const bestScoreKey = `bestTime_${count}`;
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
    count = document.getElementById('count').value;
   
    updateWordCount(count); // Обновляем текст ползунка количества слов с текущим значением
   
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
function getRandomIndices(arr, count) {
    const indices = [];
    while (indices.length < count) {
      const rand = Math.floor(Math.random() * arr.length);
      if (!indices.includes(rand)) indices.push(rand);
    }
    return indices;
  }

  function setupGame() {
    flagGrid.innerHTML = "";
    message.textContent = "";
    clickDisabled = false;

    const totalFlags = count * count;
    const randomIndices = getRandomIndices(countries, totalFlags);
    const selectedCountries = randomIndices.map(i => ({ name: countries[i], flag: `flags/${i + 1}.png` }));
    const correctCountry = selectedCountries[Math.floor(Math.random() * selectedCountries.length)];

    flagGrid.style.gridTemplateColumns = `repeat(${count}, 1fr)`;
    selectedCountries.forEach(country => {
      const img = document.createElement("img");
      img.src = country.flag;
      img.alt = country.name;

      img.addEventListener("click", () => {
          if (!clickDisabled) handleFlagClick(country, correctCountry);
        });
      flagGrid.appendChild(img);
    });

    message.textContent = `${correctCountry.name}`;
  }

  function handleFlagClick(selected, correct) {
    clickDisabled = true; // Отключение нажатий
    const allFlags = flagGrid.querySelectorAll("img");
    allFlags.forEach(flag => {
      if (flag.alt !== correct.name) {
        flag.classList.add("transparent");
      }
    });

    if (selected.name === correct.name) {
      score++;
      message.textContent = "Правильно!";
    } else {
     
      message.textContent = "Неправильно!";
    }

    setTimeout(() => { setupGame(); }, 1000);
  }


// Создаем массив с именами фоновых изображений 
const bg_images = [];
for (let i = 1; i <= 70; i++) {
    bg_images.push(`UI/bg${String(i).padStart(2, '0')}.jpg`); // Формируем имена файлов bg01.jpg, bg02.jpg и т.д.
}

// Функция для выбора случайного изображения
function setRandomBackground() {
    const randomIndex = Math.floor(Math.random() * bg_images.length); // Генерируем случайный индекс
    document.body.style.backgroundImage = `url(${bg_images[randomIndex]})`; // Устанавливаем фоновое изображение
}
