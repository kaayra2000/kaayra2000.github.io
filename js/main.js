// Mevcut main.js içeriği

document.addEventListener('DOMContentLoaded', () => {
    // Tema seçimi ile ilgili kodlar

    const applyTheme = (theme) => {
        // Mevcut tema sınıflarını kaldır
        document.body.classList.remove('light', 'medium-light', 'medium-dark', 'dark');
        // Yeni temayı ekle
        document.body.classList.add(theme);
        // Tercihi kaydet
        localStorage.setItem('theme', theme);
    };

    // Tema seçici olay dinleyicisi
    const themeSelect = document.getElementById('theme-select');
    themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });

    // Sayfa yüklendiğinde tema tercihini kontrol et
    const savedTheme = localStorage.getItem('theme') || 'light';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    // Navigasyon tıklamalarını yönetme
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Aktif sınıfını güncelle
            navLinks.forEach(link => link.classList.remove('active'));
            e.target.classList.add('active');

            // Sayfayı yükle
            const page = e.target.getAttribute('data-page');
            loadPage(page);
        });
    });

    // Sayfaları yükleme fonksiyonu
    const loadPage = (page) => {
        if (page === 'hakkimda') {
            // Hakkımda sayfasını yükle
            loadHakkimda();
        }
        // Diğer sayfalar için ekleme yapabilirsiniz
    };

    // İlk açılışta varsayılan sayfayı yükle
    loadPage('hakkimda');
});

// Data yükleme fonksiyonu (hakkimda.js içinde kullanacağız)
const loadData = async () => {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Veri alınamadı');
        
        const data = await response.json();
        
        // Elementleri güncelle
        document.getElementById('name').textContent = data.user.name;
        document.getElementById('title').textContent = data.user.title;
        document.getElementById('bio').textContent = data.user.bio;
        
        // CV linklerini oluştur
        const cvLinksContainer = document.getElementById('cv-links');
        cvLinksContainer.innerHTML = '';

        Object.entries(data.user.cv).forEach(([lang, fileName]) => {
            const link = document.createElement('a');
            link.href = fileName;
            link.className = 'cv-link';

            // İndirilen dosyanın adını belirleme
            let userName = data.user.name;
            let fileSuffix = '';

            if (lang === 'tr') {
                fileSuffix = 'Özgeçmiş.pdf';
            } else if (lang === 'en') {
                fileSuffix = 'CV.pdf';
            }

            const downloadFileName = `${userName} ${fileSuffix}`;
            link.download = downloadFileName;

            // Buton metnini güncelleme
            const langText = lang === 'tr' ? 'Türkçe' : 'English';
            link.textContent = `CV (${langText})`;
            cvLinksContainer.appendChild(link);
        });
        
    } catch (error) {
        console.error('Hata:', error);
        document.getElementById('name').textContent = "Veri Yüklenemedi";
        document.getElementById('cv-links').innerHTML = 
            '<p class="error">CV bilgileri yüklenemedi</p>';
    }
};