const hotels = [
    { name: "Ritz Carlton", location: "Алматы", price: 25000, rating: 5, guests: 2, availableFrom: "2024-04-10", availableTo: "2024-04-30" },
    { name: "Отель Казахстан", location: "Алматы", price: 15000, rating: 4, guests: 3, availableFrom: "2024-04-12", availableTo: "2024-05-05" },
    { name: "Holiday Inn", location: "Астана", price: 18000, rating: 4, guests: 2, availableFrom: "2024-04-15", availableTo: "2024-05-01" },
    { name: "Dostyk Hotel", location: "Алматы", price: 22000, rating: 5, guests: 4, availableFrom: "2024-04-08", availableTo: "2024-04-28" }
];

function filterHotels() {
    const nameInput = document.querySelector("#hotel-name").value.toLowerCase();
    const guestsInput = parseInt(document.querySelector("#guests").value) || 0;
    const checkInDate = document.querySelector("#check-in").value ? new Date(document.querySelector("#check-in").value) : null;
    const checkOutDate = document.querySelector("#check-out").value ? new Date(document.querySelector("#check-out").value) : null;

    const filteredHotels = hotels.filter(hotel => {
        const hotelCheckIn = new Date(hotel.availableFrom);
        const hotelCheckOut = new Date(hotel.availableTo);

        const matchesName = nameInput ? hotel.name.toLowerCase().includes(nameInput) : true;
        const matchesGuests = guestsInput ? hotel.guests >= guestsInput : true;
        const matchesCheckIn = checkInDate ? hotelCheckIn <= checkInDate : true;
        const matchesCheckOut = checkOutDate ? hotelCheckOut >= checkOutDate : true;

        return matchesName && matchesGuests && matchesCheckIn && matchesCheckOut;
    });

    displayHotels(filteredHotels);
}

function displayHotels(hotelsList) {
    const hotelsContainer = document.querySelector(".hotel-grid");
    hotelsContainer.innerHTML = "";

    if (hotelsList.length === 0) {
        hotelsContainer.innerHTML = "<p>Нет доступных отелей по вашему запросу.</p>";
        return;
    }

    hotelsList.forEach(hotel => {
        hotelsContainer.innerHTML += `
            <div class="hotel-card">
                <div class="hotel-image" style="background-image: url('https://source.unsplash.com/800x600/?hotel')"></div>
                <div class="hotel-info">
                    <h3>${hotel.name}</h3>
                    <div class="hotel-rating">${"★".repeat(hotel.rating)}</div>
                    <p>${hotel.location}</p>
                    <div class="hotel-price">₸ ${hotel.price} / ночь</div>
                    <button class="book-button">Забронировать</button>
                </div>
            </div>
        `;
    });
}

document.querySelector(".search-form").addEventListener("submit", function(event) {
    event.preventDefault();
    filterHotels();
});
