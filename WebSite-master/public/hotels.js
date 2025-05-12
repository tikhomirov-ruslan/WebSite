// hotels.js

const hotelsContainer = document.getElementById('hotels');
let hotelsArray = [];

/**
 * Отрисовка карточек отелей
 * @param {Array} list — массив объектов отелей
 */
// hotels.js

// В renderHotels заменяем inline-onclick на data-атрибуты и JS-слушатель
function renderHotels(list) {
  hotelsContainer.innerHTML = '';

  if (!list.length) {
    hotelsContainer.innerHTML = '<p>Ничего не найдено.</p>';
    return;
  }

  list.forEach(hotel => {
    const card = document.createElement('div');
    card.className = 'hotel-card';
    card.innerHTML = `
      <img src="${hotel.image}" alt="${hotel.title}">
      <div class="hotel-info">
        <h3>${hotel.title}</h3>
        <p>${hotel.description}</p>
        <p class="price">${hotel.price}</p>
        <p class="rating">${hotel.rating}</p>
        <div class="hotel-actions">
          <button class="book-button"
                  data-id="${hotel.id}"
                  data-title="${hotel.title}">
            Забронировать
          </button>
        </div>
      </div>
    `;
    hotelsContainer.append(card);
  });

  // После вставки всех карточек вешаем обработчики
  document.querySelectorAll('.book-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const title = btn.dataset.title;
      goToPayment(id, title);
    });
  });
}


/**
 * Переходит на страницу оплаты, передавая идентификатор и название отеля
 */
function goToPayment(id, title) {
  // Можно передать и другие параметры через query string
  const params = new URLSearchParams({ hotelId: id, hotelTitle: title });
  window.location.href = `payment.html?${params.toString()}`;
}


/**
 * Загрузка отелей с сервера
 */
async function loadHotels() {
  try {
    const response = await fetch('/api/hotels');
    if (!response.ok) throw new Error('Ошибка загрузки: ' + response.status);
    hotelsArray = await response.json();
    renderHotels(hotelsArray);
  } catch (error) {
    console.error(error);
    hotelsContainer.innerHTML = '<p>Не удалось загрузить отели.</p>';
  }
}

// При загрузке страницы — тянем отели
document.addEventListener('DOMContentLoaded', loadHotels);