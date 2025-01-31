// js/oyunlar/oyunlar.js

function loadOyunlar() {
    // İçerik alanını seç
    const content = document.getElementById('content');
    // "oyunlar.css" dosyasını dinamik olarak ekle
    loadStyle('css/oyunlar/oyunlar.css');

    // Tetris butonuna tıklama olayını ekle
    const tetrisButton = document.getElementById('tetris-button-link');
    tetrisButton.addEventListener('click', (e) => {
        e.preventDefault();
        loadPage('tetris');
    });
}