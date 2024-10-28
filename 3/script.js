
// Функция для перехода в полноэкранный режим
function enterFullScreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
    }
}

// Запускаем fullscreen при первом касании экрана
function initFullScreenOnFirstTouch() {
    document.addEventListener('touchstart', function onFirstTouch() {
        enterFullScreen();
        document.removeEventListener('touchstart', onFirstTouch);
    });
}

// Вызываем функцию при загрузке страницы
initFullScreenOnFirstTouch();


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
        board[rIndex][cIndex] = Math.random() > 0.1 ? 2 : 4;
    }
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

createBoard();



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

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) move('right');
        else move('left');
    } else {
        if (deltaY > 0) move('down');
        else move('up');
    }
}

// Добавляем слушатели для touch событий
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);
