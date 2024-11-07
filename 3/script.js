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

        }, 1000);
    loadBestScore(); // Загружаем лучшее время для выбранного размера
});

// Переход обратно к окну 1
backTowindow_settingsButton.addEventListener('click', () => {
    hideAllWindows(); // Скрываем все окна
    isWindowActive = false;
    window_settings.classList.add('active'); // Показываем окно 1
});

//ИГРА

let bestScore = null;

const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');


// Старт игры


let score = 0; // Переменная для хранения текущего счета

function startGame() {
    window_game.classList.add('active');
    score = 0;
    document.getElementById('score').textContent = `Счет: ${score}`;
    createBoard();
    
    
}    


function updateScore(value) {
    score += value; // Увеличиваем счет на значение плитки
    document.getElementById('score').textContent = `Счет: ${score}`; // Обновляем отображение счета
}


var style = document.createElement('style');
style.innerHTML = `
@font-face {
    font-family: 'MyCustomFont';
    src: url('font2048.ttf') format('truetype');
}
`;
document.head.appendChild(style);

// Применение шрифта
document.getElementById('game-board').style.fontFamily = 'MyCustomFont';

const boardSize = 4;
let board = [];

function createBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
    addNewTile();
    addNewTile();
    renderBoard();
}

function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    board.forEach(row => {
        row.forEach(value => {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            if (value) tile.classList.add(`tile-${value}`);
            tile.textContent = value || '';
            gameBoard.appendChild(tile);
        });
    });
}

function addNewTile() {
    let emptyTiles = [];
    board.forEach((row, rIndex) => {
        row.forEach((tile, cIndex) => {
            if (!tile) emptyTiles.push({ rIndex, cIndex });
        });
    });
    if (emptyTiles.length) {
        const { rIndex, cIndex } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[rIndex][cIndex] = Math.random() > 0.2 ? 2 : 4;
    } else if (!canMove()) {
        endGame(); // Игра окончена   
        
    }
}

function canMove() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === 0) return true; // Есть пустая клетка
            // Проверяем соседние плитки
            if (col < boardSize - 1 && board[row][col] === board[row][col + 1]) return true; // Вправо
            if (row < boardSize - 1 && board[row][col] === board[row + 1][col]) return true; // Вниз
        }
    }
    return false; // Ходов больше нет
}

function move(direction) {
    // Логика движения плиток
    if (direction === 'up') moveUp();
    if (direction === 'down') moveDown();
    if (direction === 'left') moveLeft();
    if (direction === 'right') moveRight();
    addNewTile();
    renderBoard();
}

function moveLeft() {
    for (let row = 0; row < boardSize; row++) {
        let filteredRow = board[row].filter(val => val);
        for (let i = 0; i < filteredRow.length - 1; i++) {
            if (filteredRow[i] === filteredRow[i + 1]) {
                filteredRow[i] *= 2;
                updateScore(filteredRow[i]); // Обновляем счет при слиянии
                filteredRow.splice(i + 1, 1);
            }
        }
        board[row] = [...filteredRow, ...Array(boardSize - filteredRow.length).fill(0)];
    }
}

function moveRight() {
    board = board.map(row => row.reverse());
    moveLeft();
    board = board.map(row => row.reverse());
}

function moveUp() {
    board = rotateLeft(board);
    moveLeft();
    board = rotateRight(board);   
}

function moveDown() {
    board = rotateRight(board);
    moveLeft();
    board = rotateLeft(board);
}

function rotateLeft(matrix) {
    return matrix[0].map((_, index) => matrix.map(row => row[index])).reverse();
}

function rotateRight(matrix) {
    return matrix.reverse()[0].map((_, index) => matrix.map(row => row[index]));
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') move('up');
    if (e.key === 'ArrowDown') move('down');
    if (e.key === 'ArrowLeft') move('left');
    if (e.key === 'ArrowRight') move('right');
});


let startX, startY;

function handleTouchStart(event) {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
}

function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    if ((Math.abs(deltaX) > 20) || (Math.abs(deltaY) > 20)) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) move('right');
            else move('left');
        } else {
            if (deltaY > 0) move('down');
            else move('up');
        }
    }
}

// Добавляем слушатели для touch событий
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);



// Окончание игры
const bestScoreKey = `bestScore`;
function endGame() {
    
    hideAllWindows(); // Скрываем все окна
    window_result.classList.add('active'); // Показываем окно 3
    document.getElementById('score2').textContent = `Счет: ${score}`;
    const scoreElement = document.getElementById('score');
  //  const currentScore = parseFloat(scoreElement.textContent);
    
    
    // Проверяем, есть ли лучшее время в localStorage
    const storedBestScore = localStorage.getItem(bestScoreKey);
    if (!storedBestScore || score > parseFloat(storedBestScore)) {
        localStorage.setItem(bestScoreKey, score);
      //        alert(`Сохраняем лучший счет: ${score}.`);
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
      //  alert(`Сохраненный лучший счет: —.`);
    }
}


// Запускаем игру при загрузке страницы
window.onload = () => {
    
    loadBestScore(); // Загружаем лучшее время при загрузке страницы
    
};


