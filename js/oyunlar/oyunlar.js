// js/oyunlar/oyunlar.js

function loadOyunlar() {
    console.log('loadOyunlar fonksiyonu çağrıldı');
    // İçerik alanını seç
    const content = document.getElementById('content');
    // "oyunlar.css" dosyasını dinamik olarak ekle
    loadStyle('css/oyunlar/oyunlar.css');

    // Tetris butonuna tıklama olayını ekle
    const tetrisButton = document.getElementById('tetris-button');
    tetrisButton.addEventListener('click', (e) => {
        e.preventDefault();
        loadPage('tetris');
    });
}