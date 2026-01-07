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
    initializeApp();
    loadSampleData();
    setupEventListeners();
    setupCharts();
});

// Uygulamayı Başlat
function initializeApp() {
    console.log('CalfDiagNet PWA başlatılıyor...');
    
    // Çevrimdışı verileri yükle
    loadOfflineData();
    
    // PWA yükleme butonu
    setupInstallPrompt();
}

// Örnek Veri Yükle
function loadSampleData() {
    // Örnek test verileri
    appState.tests = [
        { id: 1, calfId: 'CALF-2024-001', farmer: 'Ahmet Yılmaz', location: 'Konya-Meram', date: '2024-01-15', pathogens: ['BRV', 'ETEC'] },
        { id: 2, calfId: 'CALF-2024-002', farmer: 'Mehmet Demir', location: 'Konya-Selçuklu', date: '2024-01-14', pathogens: ['BCoV'] },
        { id: 3, calfId: 'CALF-2024-003', farmer: 'Ayşe Kaya', location: 'Konya-Karatay', date: '2024-01-13', pathogens: ['Cparvum'] }
    ];
    
    // İstatistikleri güncelle
    updateStatistics();
    
    // UI'yı güncelle
    updateDashboard();
}

// İstatistikleri Hesapla
function updateStatistics() {
    const stats = appState.statistics;
    
    stats.totalTests = appState.tests.length;
    stats.positiveCases = appState.tests.filter(t => t.pathogens.length > 0).length;
    stats.lastWeek = appState.tests.filter(t => {
        const testDate = new Date(t.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return testDate >= weekAgo;
    }).length;
    
    // Etken sayılarını sıfırla
    Object.keys(stats.pathogenCounts).forEach(key => {
        stats.pathogenCounts[key] = 0;
    });
    
    // Etken sayılarını hesapla
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
    
    document.getElementById('total-tests').textContent = stats.totalTests;
    document.getElementById('positive-cases').textContent = stats.positiveCases;
    document.getElementById('last-week').textContent = stats.lastWeek;
}

// Bölüm Değiştirme
function showSection(sectionId) {
    // Tüm bölümleri gizle
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Seçilen bölümü göster
    document.getElementById(sectionId).classList.add('active');
    
    // Navigasyonu güncelle
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
        }
    });
    
    // Grafikleri yeniden çiz
    if (sectionId === 'statistics') {
        drawCharts();
    }
}

// Event Listeners
function setupEventListeners() {
    // Test form submit
    document.getElementById('test-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveTest();
    });
    
    // Navigasyon
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
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
    
    // İstatistikleri güncelle
    updateStatistics();
    updateDashboard();
    
    // Formu temizle
    document.getElementById('test-form').reset();
    
    // Dashboard'a dön
    showSection('dashboard');
    
    // Bildirim göster
    showNotification('Test başarıyla kaydedildi!', 'success');
    
    // Çevrimdışı depolamaya kaydet
    saveOffline(newTest);
}

// Grafik Kurulumu
function setupCharts() {
    // Chart.js global ayarları
    Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    Chart.defaults.color = '#666';
}

// Grafik Çiz
function drawCharts() {
    const ctx = document.getElementById('pathogenChart').getContext('2d');
    const stats = appState.statistics;
    
    const pathogenData = {
        labels: ['BRV', 'BCoV', 'E.coli K99', 'C. parvum', 'C. difficile', 'Giardia'],
        datasets: [{
            label: 'Pozitif Vaka Sayısı',
            data: [
                stats.pathogenCounts.BRV,
                stats.pathogenCounts.BCoV,
                stats.pathogenCounts.ETEC,
                stats.pathogenCounts.Cparvum,
                stats.pathogenCounts.Cdiff,
                stats.pathogenCounts.Giardia
            ],
            backgroundColor: [
                '#ff6b6b', '#4ecdc4', '#45b7d1', 
                '#96ceb4', '#feca57', '#ff9ff3'
            ],
            borderWidth: 1
        }]
    };
    
    new Chart(ctx, {
        type: 'bar',
        data: pathogenData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw} vaka`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Bildirim Göster
function showNotification(message, type = 'info') {
    // Tarayıcı bildirimi
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('CalfDiagNet', {
            body: message,
            icon: '/calfdiag/img/icon.png'
        });
    }
    
    // Toast bildirimi (basit)
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Çevrimdışı Veri Yönetimi
function saveOffline(test) {
    if ('localStorage' in window) {
        const offlineTests = JSON.parse(localStorage.getItem('calfdiag_tests') || '[]');
        offlineTests.push(test);
        localStorage.setItem('calfdiag_tests', JSON.stringify(offlineTests));
    }
}

function loadOfflineData() {
    if ('localStorage' in window) {
        const offlineTests = JSON.parse(localStorage.getItem('calfdiag_tests') || '[]');
        if (offlineTests.length > 0) {
            appState.tests = offlineTests;
            updateStatistics();
            updateDashboard();
        }
    }
}

// PWA Kurulum Butonu
function setupInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Kurulum butonu göster
        const installBtn = document.createElement('button');
        installBtn.className = 'btn btn-primary';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Uygulamayı Yükle';
        installBtn.style.margin = '10px auto';
        installBtn.style.display = 'block';
        
        installBtn.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Kullanıcı PWA kurulumunu kabul etti');
                }
                deferredPrompt = null;
            });
        });
        
        document.querySelector('.footer').prepend(installBtn);
    });
}

// Verileri Yenile
function refreshData() {
    showNotification('Veriler yenileniyor...', 'info');
    // Burada API'den veri çekme işlemi yapılabilir
    setTimeout(() => {
        showNotification('Veriler güncellendi!', 'success');
    }, 1000);
}

// Test verilerini dışa aktar (Excel/CSV)
function exportData() {
    const csv = convertToCSV(appState.tests);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calfdiag-tests.csv';
    a.click();
}

function convertToCSV(data) {
    const headers = ['ID', 'Buzağı No', 'Çiftçi', 'Lokasyon', 'Tarih', 'Patojenler'];
    const rows = data.map(test => [
        test.id,
        test.calfId,
        test.farmer,
        test.location,
        test.date,
        test.pathogens.join(', ')
    ]);
    
    return [headers, ...rows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
}