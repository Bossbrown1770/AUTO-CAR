const addCarForm = document.getElementById('add-car-form');
const inventoryList = document.getElementById('inventory-list');
const paymentList = document.getElementById('payment-list');

const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

const config = {
    headers: {
        'x-auth-token': token
    }
};

// Add car
addCarForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const make = document.getElementById('make').value;
    const model = document.getElementById('model').value;
    const year = document.getElementById('year').value;
    const price = document.getElementById('price').value;
    const image = document.getElementById('image').value;

    try {
        const res = await axios.post('/api/admin/cars', { make, model, year, price, image }, config);
        console.log(res.data);
        addCarForm.reset();
        getCars();
    } catch (err) {
        console.error(err);
    }
});

// Get cars
const getCars = async () => {
    try {
        const res = await axios.get('/api/admin/cars');
        inventoryList.innerHTML = '';
        res.data.forEach(car => {
            const carEl = document.createElement('div');
            carEl.innerHTML = `
                <p>${car.make} ${car.model} (${car.year}) - $${car.price}</p>
                <button onclick="editCar('${car._id}')">Edit</button>
                <button onclick="deleteCar('${car._id}')">Delete</button>
            `;
            inventoryList.appendChild(carEl);
        });
    } catch (err) {
        console.error(err);
    }
};

// Edit car
const editCar = async (id) => {
    // Implementation for editing a car
};

// Delete car
const deleteCar = async (id) => {
    try {
        await axios.delete(`/api/admin/cars/${id}`, config);
        getCars();
    } catch (err) {
        console.error(err);
    }
};

// Get payments
const getPayments = async () => {
    try {
        const res = await axios.get('/api/admin/payments', config);
        paymentList.innerHTML = '';
        res.data.forEach(payment => {
            const paymentEl = document.createElement('div');
            paymentEl.innerHTML = `
                <p>${payment.name} - ${payment.email} - ${payment.paymentOption} - ${payment.car.make} ${payment.car.model}</p>
            `;
            paymentList.appendChild(paymentEl);
        });
    } catch (err) {
        console.error(err);
    }
};

getCars();
getPayments();
