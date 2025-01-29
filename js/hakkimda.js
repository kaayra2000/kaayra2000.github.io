// hakkimda.js

// Hakkımda sayfasının içeriğini oluşturma fonksiyonu
function loadHakkimda() {
    // İçerik alanını seç
    const content = document.getElementById('content');

    // İçeriği oluştur
    content.innerHTML = `
        <div class="profile-card">
            <h1 id="name">Yükleniyor...</h1>
            <p id="title" class="subtitle"></p>
            <div class="info-section">
                <h2>Hakkımda</h2>
                <p id="bio" class="bio-text"></p>
            </div>
            <div class="cv-section">
                <h2>CV</h2>
                <div id="cv-links" class="cv-links"></div>
            </div>
        </div>
    `;

    // "hakkimda.css" dosyasını dinamik olarak ekle
    loadStyle('css/hakkimda.css');

    // Data'yı yükle ve içerikleri doldur
    loadData();
}