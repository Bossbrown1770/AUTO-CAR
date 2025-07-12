const inventoryList = document.getElementById('inventory-list');

const getCars = async () => {
    try {
        const res = await axios.get('/api/admin/cars');
        inventoryList.innerHTML = '';
        res.data.forEach(car => {
            const carEl = document.createElement('div');
            carEl.innerHTML = `
                <h3>${car.make} ${car.model}</h3>
                <p>Year: ${car.year}</p>
                <p>Price: $${car.price}</p>
                <img src="${car.image}" alt="${car.make} ${car.model}" width="200">
                <a href="details.html?id=${car._id}">View Details</a>
            `;
            inventoryList.appendChild(carEl);
        });
    } catch (err) {
        console.error(err);
    }
};

const carDetails = document.getElementById('car-details');

const getCarDetails = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    try {
        const res = await axios.get(`/api/admin/cars/${id}`);
        const car = res.data;
        carDetails.innerHTML = `
            <h3>${car.make} ${car.model}</h3>
            <p>Year: ${car.year}</p>
            <p>Price: $${car.price}</p>
            <img src="${car.image}" alt="${car.make} ${car.model}" width="400">
            <a href="payment.html?id=${car._id}">Buy Now</a>
        `;
    } catch (err) {
        console.error(err);
    }
};

if (inventoryList) {
    getCars();
}

if (carDetails) {
    getCarDetails();
}
