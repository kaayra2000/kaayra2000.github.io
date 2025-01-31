let canvas, context;
let animationId;
let arena;
let player;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let highScore = localStorage.getItem('tetrisHighScore') || 0;

// Temel renkler (ID=1..7) parlak tetris renkleri
const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

function initTetris() {
    canvas = document.getElementById('tetris');
    context = canvas.getContext('2d');

    // Oyun bittiğinde gösterilen öğeler
    const gameOverElement = document.getElementById('game-over-message');
    const restartButton = document.getElementById('restart-button');

    // **Yeni Eklenen Öğeler**
    const infoButton = document.getElementById('info-button');
    const keyInstructions = document.getElementById('key-instructions');
    const closeInstructionsButton = document.getElementById('close-instructions');

    // Arena matrisi (12 sütun, 20 satır)
    arena = createMatrix(12, 20);

    // Oyuncu başlangıç objesi
    player = {
        pos: { x: 0, y: 0 },
        matrix: null,
        score: 0,
    };

    // Canvas ölçülerini ayarla
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        draw();
    });

    // Klavye olaylarını dinle
    document.addEventListener('keydown', onKeyDown);

    // Tekrar oyna butonu
    restartButton.addEventListener('click', () => {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        playerReset();
        updateScore();
        gameOverElement.style.display = 'none';
        requestAnimationFrame(update);
    });

    // **"i" Butonuna Tıklama Olayı**
    infoButton.addEventListener('click', () => {
        keyInstructions.style.display = 'flex';
    });

    // **Tuş Bilgisi Penceresini Kapama Olayı**
    closeInstructionsButton.addEventListener('click', () => {
        keyInstructions.style.display = 'none';
    });

    // Oyunu başlat
    playerReset();
    updateScore();
    update();
}

function resizeCanvas() {
    // Ölçeği sıfırla
    context.setTransform(1, 0, 0, 1, 0, 0);

    // Oyun alanının mantıksal boyutları
    const gameWidth = 12;
    const gameHeight = 20;

    // .tetris-container genişlik / yükseklik
    const container = document.querySelector('.tetris-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // En-boy oranını koruyarak canvas boyutlarını belirle
    const aspectRatio = gameWidth / gameHeight;
    let canvasWidth = containerWidth;
    let canvasHeight = canvasWidth / aspectRatio;

    // Yükseklik çok büyükse, yüksekliği sınırlayıp genişliği ayarla
    if (canvasHeight > containerHeight) {
        canvasHeight = containerHeight;
        canvasWidth = canvasHeight * aspectRatio;
    }

    // Cihazın piksel oranını al
    const scaleFactor = window.devicePixelRatio || 1;

    // Canvas'ın gerçek boyutlarını ayarla (piksel cinsinden)
    canvas.width = canvasWidth * scaleFactor;
    canvas.height = canvasHeight * scaleFactor;

    // Stil boyutu (görünen boyut)
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Konteksin ölçeklendirilmesi
    context.scale(
        (canvasWidth / gameWidth) * scaleFactor,
        (canvasHeight / gameHeight) * scaleFactor
    );
}

function draw() {
    // Gövdenin (body) stil değişkenlerini oku
    const computedStyles = getComputedStyle(document.body);
    // Arka plan ve ızgara renklerini al
    const bgColor = computedStyles.getPropertyValue('--card-background').trim() || '#000';
    const gridColor = computedStyles.getPropertyValue('--grid-color').trim() || '#ccc';

    // Canvas zeminini temadaki “card-background” rengiyle doldur
    context.fillStyle = bgColor;
    context.fillRect(0, 0, 12, 20);

    // Izgara çizimi
    drawGrid(gridColor);

    // Arena ve aktif parça çizimi
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function drawGrid(gridColor) {
    context.save();
    context.strokeStyle = gridColor;
    context.lineWidth = 0.05; // Çizgi kalınlığı (ihtiyaca göre ayarlayın)

    // Yatay çizgiler
    for (let y = 0; y <= 20; y++) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(12, y);
        context.stroke();
    }

    // Dikey çizgiler
    for (let x = 0; x <= 12; x++) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, 20);
        context.stroke();
    }

    context.restore();
}

// Her frame çağrılan fonksiyon
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
        dropCounter = 0;
    }

    draw();
    animationId = requestAnimationFrame(update);
}

// Klavye kontrolleri
function onKeyDown(e) {
    if (e.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (e.key === 'ArrowRight') {
        playerMove(1);
    } else if (e.key === 'ArrowDown') {
        playerDrop();
    } else if (e.key === 'q' || e.key === 'Q') {
        playerRotate(-1);
    } else if (e.key === 'w' || e.key === 'W') {
        playerRotate(1);
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    // Döndürürken arena dışına taşarsa düzelt
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// Matris döndürme
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Yeni arena matrisi
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Rastgele tetromino parçası üret
function createPiece(type) {
    switch (type) {
        case 'T':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        case 'O':
            return [
                [2, 2],
                [2, 2],
            ];
        case 'L':
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        case 'J':
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        case 'I':
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        case 'S':
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        case 'Z':
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
    }
}

// Arena üzerine matris çiz
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Çarpışma kontrolü
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (
                m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
            ) {
                return true;
            }
        }
    }
    return false;
}

// Arena ile birleştir
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Satır temizleme
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

// Yeni parça alıp tepeye yerleştir
function playerReset() {
    const pieces = 'TJLOSZI';
    const rand = pieces[Math.floor(Math.random() * pieces.length)];
    player.matrix = createPiece(rand);
    player.pos.y = 0;
    player.pos.x =
        (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);

    // Oyuncu kaybettiğinde
    if (collide(arena, player)) {
        // En yüksek skoru güncelle
        if (player.score > highScore) {
            highScore = player.score;
            localStorage.setItem('tetrisHighScore', highScore);
        }
        cancelAnimationFrame(animationId);
        showGameOverMessage();
    }
}

// Oyun bitince mesaj
function showGameOverMessage() {
    const gameOverElement = document.getElementById('game-over-message');
    const messageElement = document.getElementById('message-text');
    gameOverElement.style.display = 'flex';

    let scoreMessage = '';
    if (player.score > highScore) {
        scoreMessage = 'Yeni en yüksek skoru elde ettiniz! Tebrikler!';
    } else {
        if (player.score < 100) {
            scoreMessage = 'Skorun yerlerde sürünüyor! Biraz pratik yapsan iyi olur.';
        } else if (player.score >= 100 && player.score < 200) {
            scoreMessage = 'Eh işte, fena değil ama daha iyisini yapabilirsin.';
        } else if (player.score >= 200 && player.score < 300) {
            scoreMessage = 'Güzel skor! Biraz daha uğraşırsan efsane olacaksın.';
        } else {
            scoreMessage = 'Harika bir skor! Tetris senin işin!';
        }
    }

    messageElement.textContent = `${scoreMessage} Toplam Skorunuz: ${player.score}`;
}

// Skoru HTML'de güncelle
function updateScore() {
    const scoreElem = document.getElementById('score');
    const highScoreElem = document.getElementById('high-score');
    if (scoreElem) {
        scoreElem.innerText = player.score;
    }
    if (highScoreElem) {
        highScoreElem.innerText = highScore;
    }
}