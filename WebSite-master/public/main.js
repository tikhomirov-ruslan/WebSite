/* ----------  Leaflet карта  ---------- */
function initMap() {
    const map = L.map("map").setView([43.2389, 76.8897], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    L.marker([43.2389, 76.8897])
      .addTo(map)
      .bindPopup("<b>Ритц Карлтон Алматы</b><br>Рейтинг: ★★★★★");
}

/* ----------  Модалки ---------- */
function openModal(id)  { document.getElementById(id + "Modal").style.display = "flex"; }
function closeModal(id) { document.getElementById(id + "Modal").style.display = "none"; }

/* ----------  UI авторизации (шапка) ---------- */
function updateAuthUI() {
    const area = document.getElementById("authArea");
    const u    = JSON.parse(localStorage.getItem("user"));

    if (u) {
        area.innerHTML = `
      <a href="profile.html" title="Профиль"
         style="display:flex;align-items:center;text-decoration:none;color:#000;">
        <img src="${u.photo || 'https://placehold.co/32x32?text=%F0%9F%91%A4'}"
             style="width:32px;height:32px;border-radius:50%;object-fit:cover;margin-right:.5rem">
        <span>${u.name}${u.surname ? " " + u.surname : ""}</span>
      </a>
      <button onclick="logout()" style="margin-left:1rem;">Выйти</button>`;
    } else {
        area.innerHTML = `
      <button onclick="openModal('register')"><i class="fas fa-user-plus"></i> Регистрация</button>
      <button onclick="openModal('login')"><i class="fas fa-sign-in-alt"></i> Войти</button>`;
    }
}
function logout() {
    localStorage.removeItem("user");
    location.href = "index.html";
}

/* ----------  Переход к оплате (демо) ---------- */
function goToPayment(id, title) {
    // Убедимся, что оба параметра передаются в URL
    const params = new URLSearchParams({
        hotelId: id,
        hotelTitle: title
    });
    // Переносим пользователя на страницу оплаты
    window.location.href = `payment.html?${params.toString()}`;
}

/* ----------  Загрузка / отрисовка отелей ---------- */
async function loadHotels() {
    try {
        const r = await fetch("/api/hotels");
        if (!r.ok) throw new Error("HTTP " + r.status);
        return await r.json();
    } catch (e) {
        console.error(e);
        document.getElementById("hotels").innerHTML = "<p>Не удалось загрузить отели.</p>";
        return [];
    }
}

function renderHotels(list) {
    const grid = document.getElementById("hotels");
    grid.innerHTML = list.length ? "" : "<p>Ничего не найдено.</p>";

    list.forEach(h => {
        const card = document.createElement("div");
        card.className = "hotel-card";
        card.innerHTML = `
      <div class="hotel-image" style="background-image:url('${h.image}')"></div>
      <div class="hotel-info">
        <h3>${h.title}</h3>
        <div class="hotel-rating">${h.rating}</div>
        <p>${h.description}</p>
        <div class="hotel-price">${h.price}</div>
        <button class="book-button">Забронировать</button>
      </div>`;
        card.querySelector(".book-button")
          .addEventListener("click", () => goToPayment(h.id, h.title));
        grid.appendChild(card);
    });
}

/* ----------  Главная точка входа ---------- */
let hotelsData = [];
document.addEventListener("DOMContentLoaded", async () => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (u?.role === "admin") { location.href = "admin-hotel.html"; return; }

    updateAuthUI();
    initMap();

    hotelsData = await loadHotels();
    renderHotels(hotelsData);

    /* фильтр */
    document.getElementById("filterForm").addEventListener("submit", e => {
        e.preventDefault();
        const q = document.getElementById("searchName").value.toLowerCase();
        renderHotels(hotelsData.filter(h => h.title.toLowerCase().includes(q)));
    });
});

/* ----------  Регистрация ---------- */
document.getElementById("registerForm")
  .addEventListener("submit", async e => {
      e.preventDefault();
      const name     = regName.value.trim();
      const surname  = regSurname.value.trim();
      const login    = regLogin.value.trim();
      const email    = regEmail.value.trim();      // <--- новое поле
      const photo    = regPhoto.value.trim() || "";
      const password = regPassword.value;
      const confirm  = regConfirm.value;

      if (!name || !surname || !login || !email || !password || !confirm) {
          return alert("Пожалуйста, заполните все обязательные поля.");
      }
      if (password !== confirm) {
          return alert("Пароли не совпадают!");
      }

      const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, surname, email, login, password, photo })
      });
      const data = await res.json();
      if (res.ok) {
          alert(data.message);
          e.target.reset();
          closeModal("register");
      } else {
          alert(data.message || "Ошибка регистрации");
      }
  });


/* ----------  Вход ---------- */
document.getElementById("loginForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    const login = loginLogin.value.trim();
    const password = loginPassword.value;
    if (!login || !password) return alert("Введите логин и пароль");

    const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ login, password })
    });
    const data = await r.json();
    if (!r.ok) return alert(data.message || "Ошибка входа");

    localStorage.setItem("user", JSON.stringify(data.user));
    data.user.role === "admin"
      ? location.href = "admin-hotel.html"
      : (alert(data.message), closeModal("login"), updateAuthUI());
});
