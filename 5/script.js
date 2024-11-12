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
        setInterval(null, 5000); // Обновляем состояние каждые 5 секунд
        window.addEventListener('unload', () => {
            if (wakeLock) { wakeLock.release(); }// Освобождаем блокировку при закрытии вкладки
        });
        wakeLock.addEventListener('release', () => {// Слушаем событие освобождения блокировки
            wakeLock = null; // Сбрасываем переменную
        });
    } catch (err) { console.error(`${err.name}, ${err.message}`); }
}

// Обработчик изменения состояния чекбокса
const checkbox = document.getElementById('fullscreenCheckbox');
checkbox.addEventListener('change', () => {
    if (checkbox.checked) {        // Включаем полноэкранный режим
        document.documentElement.requestFullscreen()
            .catch(err => {
                console.error(`Ошибка при попытке включить полноэкранный режим: ${err.message}`);
                checkbox.checked = false; // Сбрасываем чекбокс в случае ошибки
            });
    } else {        // Выходим из полноэкранного режима
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

        }, 1000);
   
 //   alert(`Контрольная точка 1`);

});

// Переход обратно к окну 1
backTowindow_settingsButton.addEventListener('click', () => {
    hideAllWindows(); // Скрываем все окна
    isWindowActive = false;
    window_settings.classList.add('active'); // Показываем окно 1
});

//ИГРА

let timeLimit = 3; 
let errCount = 5;

   // Обновляем текст ползунка времени с текущим значением

function updateErrCount(value) {
    document.querySelector('label[for="errCount"]').textContent = `Число ошибок (${value}):`;
}

function updateTimeLimit(value) {
    document.querySelector('label[for="timeLimit"]').textContent = `Время на игру (${value} мин):`;
}

let t_out;
const progressBar = document.getElementById('progress');
function startGame() {
    imageIndices = [];
    initializeImageIndices(); // Инициализируем массив случайных уникальных индексов
    imagesToShow = 1;
    showImages();    
    
    window_game.classList.add('active');

    errCount = document.getElementById('errCount').value;
    timeLimit = document.getElementById('timeLimit').value;  
    updateErrCount(errCount); // Обновляем текст ползунка количества слов с текущим значением
    updateTimeLimit(timeLimit);

    startProgressBar(timeLimit*60000);
    
    
    t_out = setTimeout(() => {
        alert(`Время истекло!`);
        endGame(); // Если время истекло    
    },  + timeLimit*60000);

}    

function startProgressBar(duration) {
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
    hideAllImages(); 
    clearTimeout(t_out);
    hideAllWindows(); // Скрываем все окна
    isWaiting = false;
    document.getElementById('score').textContent = `Найдено картинок: ${imagesToShow - 1}.`;
    window_result.classList.add('active'); // Показываем окно 3
  
}

    const totalImages = 64;       // Всего доступных картинок
    const originalSize = 512;     // Размер оригинального изображения
    const gridRows = 8;           // Количество строк сетки
    const gridCols = 6;           // Количество столбцов сетки
    let imageIndices = [];        // Массив для хранения случайных уникальных индексов изображений
    let imagesToShow = 1;         // Количество отображаемых изображений (начинаем с 1)
    let isWaiting = false;        // Флаг ожидания для предотвращения повторных кликов

    function createGrid() {
        const grid = document.getElementById('grid');
        
        for (let i = 0; i < gridRows * gridCols; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            
            const imageDiv = document.createElement('div');
            imageDiv.classList.add('image');
            
            imageDiv.onclick = () => handleImageClick(imageDiv);  // Передаем элемент изображения в обработчик клика

            cell.appendChild(imageDiv);
            grid.appendChild(cell);
        }
    }

    function initializeImageIndices() {
        // Генерируем массив уникальных индексов
        while (imageIndices.length < gridRows * gridCols) {
            const randomIndex = Math.floor(Math.random() * totalImages);
            if (!imageIndices.includes(randomIndex)) {
                imageIndices.push(randomIndex);
            }
        }
    }

    function showImages() {
            // Отображаем изображения по порядку из массива imageIndices до количества imagesToShow
        for (let i = 0; i < imagesToShow; i++) {
            const imageIndex = imageIndices[i];
            showImageInRandomCell(imageIndex, i);
        }
    }

    function handleImageClick(imageDiv) {
        if (isWaiting) return;

        const clickedImageOrder = parseInt(imageDiv.parentElement.dataset.imageOrder, 10);  // Получаем порядок изображения из dataset
        const expectedImageOrder = imagesToShow - 1;  // Ожидаемый порядок последней добавленной картинки
        hideAllImages(); // Скрываем предыдущие изображения
       // setTimeout(() => {
            
            
       // }, 1000);
        if (clickedImageOrder === expectedImageOrder) {
            isWaiting = true;
            showMessage(`Верно!`);
            setTimeout(() => {
                imagesToShow++;
                if (imagesToShow > gridCols*gridRows) {endGame();}
              
                showImages(); // Показываем новые изображения
                isWaiting = false;
                showMessage(`Нажми на новую картинку`);
            }, 1500);
        } else {
            isWaiting = true;
            errCount--;
            if (errCount === 0) {       endGame();
            } else {
                showMessage(`Неверно! Осталось попыток: ${errCount}.`);
            
                setTimeout(() => {
                   showImages(); // Показываем те же изображения снова
                   isWaiting = false;
                   showMessage(`Нажми на новую картинку`);
                }, 2500);  
            }
           
        }
    }

    function hideAllImages() {
        document.querySelectorAll('.image').forEach(imageDiv => {
            imageDiv.style.display = 'none';
        });
    }

    function showImageInRandomCell(imageIndex, imageOrder) {
        const x = (imageIndex % 8) * (originalSize / 8);
        const y = Math.floor(imageIndex / 8) * (originalSize / 8);

        let randomCellIndex;
        do {
            randomCellIndex = Math.floor(Math.random() * (gridRows * gridCols));
        } while (document.querySelectorAll('.cell')[randomCellIndex].querySelector('.image').style.display === 'block');

        const randomCell = document.querySelectorAll('.cell')[randomCellIndex];
        const imageDiv = randomCell.querySelector('.image');
        imageDiv.style.backgroundPosition = `-${x}px -${y}px`;
        imageDiv.style.display = 'block';

        // Присваиваем порядок показа для проверки в handleImageClick
        randomCell.dataset.imageOrder = imageOrder; // Запоминаем порядок показа в dataset
    }

    function showMessage(message) {
        document.getElementById('message').textContent = message;
    }

    

// Запускаем игру при загрузке страницы
window.onload = () => {
    errCount = document.getElementById('errCount').value;
    timeLimit = document.getElementById('timeLimit').value;
    updateErrCount(errCount); // Обновляем текст ползунка количества слов с текущим значением
    updateTimeLimit(timeLimit);   // Обновляем текст ползунка времени с текущим значением

    createGrid();            // Создаем сетку
};



