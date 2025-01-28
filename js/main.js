document.addEventListener('DOMContentLoaded', () => {
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
                link.download = true;
                link.textContent = `CV İndir (${lang.toUpperCase()})`;
                cvLinksContainer.appendChild(link);
            });
            
        } catch (error) {
            console.error('Hata:', error);
            document.getElementById('name').textContent = "Veri Yüklenemedi";
            document.getElementById('cv-links').innerHTML = 
                '<p class="error">CV bilgileri yüklenemedi</p>';
        }
    };
    
    loadData();
});