// js/app.js - GÜNCELLENMİŞ VERSİYON

// Uygulama State
let appState = {
    tests: [],
    statistics: {
        totalTests: 0,
        positiveCases: 0,
        lastWeek: 0,
        pathogenCounts: {
            BRV: 0,
            BCoV: 0,
            ETEC: 0,
            Cparvum: 0,
            Cdiff: 0,
            Giardia: 0
        }
    }
};

// DOM Yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    console.log('CalfDiagNet başlatılıyor...');
    initializeApp();
    loadSampleData();
    setupEventListeners();
});

// Uygulamayı Başlat
function initializeApp() {
    // Navigasyonu ayarla
    setupNavigation();
    
    // Varsayılan olarak dashboard'u göster
    showSection('dashboard');
}

// Navigasyon Ayarla
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').replace('#', '');
            showSection(sectionId);
        });
    });
}

// Bölüm Değiştirme (EN ÖNEMLİ FONKSİYON)
function showSection(sectionId) {
    console.log('Bölüm değiştiriliyor:', sectionId);
    
    // 1. Tüm bölümleri gizle
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // 2. Tüm nav linklerinden active class'ını kaldır
    const allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // 3. Seçilen bölümü göster
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        
        // Seçilen nav link'ine active class'ını ekle
        const activeNavLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }
        
        // Grafik bölümündeyse grafikleri çiz
        if (sectionId === 'statistics') {
            drawCharts();
        }
    } else {
        console.error('Bölüm bulunamadı:', sectionId);
        // Fallback: dashboard'u göster
        showSection('dashboard');
    }
}

// Event Listeners Kurulumu
function setupEventListeners() {
    // Test form submit
    const testForm = document.getElementById('test-form');
    if (testForm) {
        testForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTest();
        });
    }
    
    // Hızlı aksiyon butonları
    const quickActions = document.querySelectorAll('.quick-actions button');
    quickActions.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('onclick');
            if (action && action.includes('showSection')) {
                // Butonun onclick'ini çalıştır
                eval(action);
            }
        });
    });
}

// Örnek Veri Yükle
function loadSampleData() {
    appState.tests = [
        { 
            id: 1, 
            calfId: 'CALF-2024-001', 
            farmer: 'Ahmet Yılmaz', 
            location: 'Konya-Meram', 
            date: '2024-01-15', 
            pathogens: ['BRV', 'ETEC'] 
        },
        { 
            id: 2, 
            calfId: 'CALF-2024-002', 
            farmer: 'Mehmet Demir', 
            location: 'Konya-Selçuklu', 
            date: '2024-01-14', 
            pathogens: ['BCoV'] 
        },
        { 
            id: 3, 
            calfId: 'CALF-2024-003', 
            farmer: 'Ayşe Kaya', 
            location: 'Konya-Karatay', 
            date: '2024-01-13', 
            pathogens: ['Cparvum'] 
        }
    ];
    
    updateStatistics();
    updateDashboard();
}

// İstatistikleri Güncelle
function updateStatistics() {
    const stats = appState.statistics;
    
    stats.totalTests = appState.tests.length;
    stats.positiveCases = appState.tests.filter(t => t.pathogens.length > 0).length;
    
    // Son 7 gün hesapla
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    stats.lastWeek = appState.tests.filter(t => {
        const testDate = new Date(t.date);
        return testDate >= oneWeekAgo;
    }).length;
    
    // Etken sayılarını sıfırla ve hesapla
    Object.keys(stats.pathogenCounts).forEach(key => {
        stats.pathogenCounts[key] = 0;
    });
    
    appState.tests.forEach(test => {
        test.pathogens.forEach(pathogen => {
            if (stats.pathogenCounts[pathogen] !== undefined) {
                stats.pathogenCounts[pathogen]++;
            }
        });
    });
}

// Dashboard'u Güncelle
function updateDashboard() {
    const stats = appState.statistics;
    
    const totalTestsEl = document.getElementById('total-tests');
    const positiveCasesEl = document.getElementById('positive-cases');
    const lastWeekEl = document.getElementById('last-week');
    
    if (totalTestsEl) totalTestsEl.textContent = stats.totalTests;
    if (positiveCasesEl) positiveCasesEl.textContent = stats.positiveCases;
    if (lastWeekEl) lastWeekEl.textContent = stats.lastWeek;
}

// Test Kaydet
function saveTest() {
    const calfId = document.getElementById('calf-id').value;
    const farmerName = document.getElementById('farmer-name').value;
    const location = document.getElementById('location').value;
    
    // Seçilen patojenler
    const selectedPathogens = [];
    document.querySelectorAll('input[name="pathogen"]:checked').forEach(checkbox => {
        selectedPathogens.push(checkbox.value);
    });
    
    // Yeni test oluştur
    const newTest = {
        id: Date.now(),
        calfId: calfId,
        farmer: farmerName,
        location: location,
        date: new Date().toISOString().split('T')[0],
        pathogens: selectedPathogens
    };
    
    // State'e ekle
    appState.tests.push(newTest);
    
    // Güncelle
    updateStatistics();
    updateDashboard();
    
    // Formu temizle
    document.getElementById('test-form').reset();
    
    // Dashboard'a dön
    showSection('dashboard');
    
    // Bildirim
    showNotification('✓ Test başarıyla kaydedildi!');
}

// Bildirim Göster
function showNotification(message) {
    // Basit bir bildirim
    alert(message);
    
    // Daha iyisi: ekranda mesaj göster
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: fadeInOut 3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Verileri Yenile
function refreshData() {
    showNotification('Veriler yenileniyor...');
    // Burada gerçek veri yenileme işlemi yapılabilir
    setTimeout(() => {
        showNotification('Veriler güncellendi!');
    }, 1000);
}

// Grafik Çiz
function drawCharts() {
    const canvas = document.getElementById('pathogenChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const stats = appState.statistics;
    
    // Basit bir grafik çiz
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const data = [
        stats.pathogenCounts.BRV,
        stats.pathogenCounts.BCoV,
        stats.pathogenCounts.ETEC,
        stats.pathogenCounts.Cparvum,
        stats.pathogenCounts.Cdiff,
        stats.pathogenCounts.Giardia
    ];
    
    const labels = ['BRV', 'BCoV', 'E.coli', 'C.parvum', 'C.diff', 'Giardia'];
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    
    const maxValue = Math.max(...data, 1);
    const barWidth = 40;
    const spacing = 20;
    const startX = 60;
    
    // Çubukları çiz
    data.forEach((value, index) => {
        const x = startX + (barWidth + spacing) * index;
        const height = (value / maxValue) * 200;
        const y = 250 - height;
        
        // Çubuk
        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth, height);
        
        // Değer
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + barWidth/2, y - 5);
        
        // Etiket
        ctx.fillText(labels[index], x + barWidth/2, 270);
    });
    
    // Y ekseni
    ctx.beginPath();
    ctx.moveTo(40, 50);
    ctx.lineTo(40, 250);
    ctx.lineTo(400, 250);
    ctx.strokeStyle = '#333';
    ctx.stroke();
}