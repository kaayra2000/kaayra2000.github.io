// js/oyunlar/oyunlar.js

function loadOyunlar() {
    console.log('loadOyunlar fonksiyonu çağrıldı');
    // İçerik alanını seç
    const content = document.getElementById('content');

    // İçeriği oluştur
    content.innerHTML = `
        <div class="oyunlar-container">
            <h2>Tetris Oyunu</h2>
            <div id="tetris-game"></div>
        </div>
    `;
    // "oyunlar.css" dosyasını dinamik olarak ekle
    loadStyle('css/oyunlar/oyunlar.css');
}
