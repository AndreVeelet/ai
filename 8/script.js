// script.js
const gridElement = document.getElementById('grid');
const infoElement = document.getElementById('info');

const gridSize = 6; // Размер сетки
const totalCells = gridSize * gridSize; // Общее количество клеток

// Создаем сетку 
for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i; // Сохраняем индекс клетки
    cell.addEventListener('click', handleCellClick);
    cell.style.backgroundColor = 'green';
    gridElement.appendChild(cell);
}

function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.dataset.index);
    
    // Выводим порядковый номер клетки
    infoElement.textContent = `Клетка номер ${index + 1}`;
    
    // Меняем цвет клетки и соседей
    toggleCellColor(cell);

    const neighbors = getNeighbors(index);
    
    neighbors.forEach(neighbor => {
        const neighborCell = gridElement.children[neighbor];
        toggleCellColor(neighborCell);
    });
	// Добавляем или удаляем класс active для обводки
    cell.classList.toggle('active');
}

function toggleCellColor(cell) {
    if (cell.style.backgroundColor === 'green') {
        
	cell.style.backgroundColor = 'white';
    } else {
       // alert(`Контрольная точка 1`);
        cell.style.backgroundColor = 'green';
    }
}

// Функция для получения индексов соседних клеток
function getNeighbors(index) {
    const neighbors = [];
    
    // Проверяем верхнюю клетку
    if (index >= gridSize) neighbors.push(index - gridSize);
    
    // Проверяем нижнюю клетку
    if (index < totalCells - gridSize) neighbors.push(index + gridSize);
    
    // Проверяем левую клетку
    if (index % gridSize !== 0) neighbors.push(index - 1);
    
    // Проверяем правую клетку
    if (index % gridSize !== gridSize - 1) neighbors.push(index + 1);
    
    return neighbors;
}

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Обмен элементов
        }
    }

    function generateRandomNumbers() {
        // Создаем массив от 1 до 36
        const numbers = Array.from({length: 36}, (_, i) => i + 1);

        // Перемешиваем массив
        shuffleArray(numbers);

        // Получаем первые 8 элементов
        const randomNumbers = numbers.slice(0, 8);
        
	randomNumbers.forEach(idx => {  
		const thirdCell = document.querySelectorAll('.cell')[idx-1];		
		thirdCell.click();  });
    } 

generateRandomNumbers();
// Получаем третью клетку (индекс 2) const thirdCell = document.querySelectorAll('.cell')[2];


// Сымитировать клик на третьей клетке   thirdCell.click();
