

// Функция для прекращения действия по умолчанию
document.addEventListener('touchmove', function(e) {
    if (isWindowActive) { e.preventDefault(); } // Предотвращаем прокрутку, если окно активно
}, { passive: false });

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
//const window_result = document.getElementById('window_result');
const towindow_gameButton = document.getElementById('towindow_game');
const backTowindow_settingsButton = document.getElementById('backTowindow_settings');


// Функция для скрытия всех окон
function hideAllWindows() {
    window_settings.style.display = 'none';
    window_game.style.display = 'none';
    //window_result.style.display = 'none';
}

// Переход к окну 2
towindow_gameButton.addEventListener('click', () => {
    hideAllWindows(); // Скрываем все окна
    overlay.style.display = 'flex'; // Показываем overlay
    setTimeout(() => {
        overlay.style.display = 'none';
        window_game.classList.add('active'); // Показываем окно 2
        
	    isWindowActive = true;
        startGame(); //Старт игры
    }, 1000);
  
});



//ИГРА

//const message = document.getElementById('message');
const gridElement = document.getElementById('grid');
let gridSize; // Размер сетки
let totalCells; // Общее количество клеток
let back = false;
const message = document.getElementById('message');
let level = 5;
let num_click = 6;
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
            
            image.style.opacity = '1';  // Выделяем текущее изображение
            image.style.transform = 'scale(1)';
            const text = image.nextElementSibling;
            text.style.fontWeight = 'bold'; // Делаем текст жирным
            text.style.fontSize = `1.1em`;
            level = parseInt(image.getAttribute('data-level'));
            num_click = parseInt(level) === 4 ? 4 : parseInt(level) === 5 ? 6 : 8;

        });
    });
}



function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.dataset.index);
    
    // Меняем цвет клетки и соседей
    toggleCellColor(cell);

    const neighbors = getNeighbors(index);
    
    neighbors.forEach(neighbor => {
        const neighborCell = gridElement.children[neighbor];
        toggleCellColor(neighborCell);
    });
	// Добавляем или удаляем класс active для обводки
    cell.classList.toggle('active');
    
    cell.style.border = '4px solid black';
    
    if (back&&(cell.classList.contains('active'))){
        cell.style.border = '4px solid red';
    }
    const control_end = 0;
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (cell.dataset.green === 'false'){   //style.background !== 'linear-gradient(to right, green, lime)'){
            control_end++;
        }
    });
    if (control_end === 0){
        backTowindow_settingsButton.innerHTML = '<b>Назад</b>';
        back = true;
        message.innerHTML = 'Победа!';
        gridElement.classList.add('disabled');
    }


}

function toggleCellColor(cell) {
  /*  if (cell.style.background === 'linear-gradient(to right, green, lime)') {
	cell.style.background = 'linear-gradient(to right, grey, white)';
    } else {
        cell.style.background = 'linear-gradient(to right, green, lime)';
    } */

        cell.dataset.green = cell.dataset.green === 'true' ? 'false' : 'true';
        
    if (cell.dataset.green === 'true') {
        //cell.dataset.green = false;
        cell.style.backgroundColor = 'lime'; //cell.style.backgroundColor = 'gray';
    } else {
        //cell.dataset.green = true;
        cell.style.backgroundColor = 'gray';

    }

}

// Функция для получения индексов соседних клеток
function getNeighbors(index) {
    const neighbors = [];
    if (index >= gridSize) neighbors.push(index - gridSize);// Проверяем верхнюю клетку
    if (index < totalCells - gridSize) neighbors.push(index + gridSize);// Проверяем нижнюю клетку
    if (index % gridSize !== 0) neighbors.push(index - 1); // Проверяем левую клетку
    if (index % gridSize !== gridSize - 1) neighbors.push(index + 1);// Проверяем правую клетку
    return neighbors;
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Обмен элементов
    }
}
function generateRandomNumbers() {
    const numbers = Array.from({length: level*level}, (_, i) => i + 1); // Создаем массив от 1 до 36
    shuffleArray(numbers);// Перемешиваем массив
    const randomNumbers = numbers.slice(0, num_click);// Получаем первые 8 элементов
    randomNumbers.forEach(idx => {  
        let thirdCell = document.querySelectorAll('.cell')[idx-1];		
        thirdCell.click();  });
} 


function startGame() {
    gridElement.innerHTML = '';
    message.innerHTML = `Сделай все ячейки зелеными`;
    gridSize = level; // Размер сетки
    gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 75px)`;    
    gridElement.style.gridTemplateRows = `repeat(${gridSize}, 75px)`;
    
    totalCells = gridSize * gridSize;
    
    window_game.style.display = 'block';
    

    // Создаем сетку 
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i; // Сохраняем индекс клетки
        cell.dataset.green = 'true'; // Сохраняем цвет

        cell.addEventListener('click', handleCellClick);
        cell.style.backgroundColor = 'lime';
        gridElement.appendChild(cell);
    }

    generateRandomNumbers();
}    



// Запускаем игру при загрузке страницы
window.onload = () => {
    setRandomBackground();
    updateLevel(); // Обновляем уровень
   
    window_game.style.display = 'none';
        
    document.body.style.transformOrigin = 'top center';
    document.body.style.transform = 'scale(1)';
    document.body.style.backgroundSize = 'auto';
    if (document.documentElement.clientWidth < 500) {
        document.body.style.transform = 'scale(' + document.documentElement.clientWidth/500 + ')';
        document.body.style.backgroundSize = '100% auto';
    }
};


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

// Переход обратно к окну 1
backTowindow_settingsButton.addEventListener('click', () => {
    if (!back){
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            if (cell.classList.contains('active')){
                cell.style.border = '4px solid red';
            }
        })
        
        backTowindow_settingsButton.innerHTML = '<b>Назад</b>';
        
        
        back = true;
    } else {

        gridElement.innerHTML = '';
        hideAllWindows(); // Скрываем все окна
        isWindowActive = false;
        window_settings.style.display = 'block'; // Показываем окно настроек
        back = false;
        backTowindow_settingsButton.innerHTML = '<b>Подсказка</b>';
        gridElement.classList.remove('disabled');
    }
    
});