function openModal(modalType) {
    document.getElementById(modalType + 'Modal').style.display = 'flex';
}

function closeModal(modalType) {
    document.getElementById(modalType + 'Modal').style.display = 'none';
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Анимация при скролле
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.hotel-card, .map-section, .filters').forEach(el => observer.observe(el));


console.log("end");