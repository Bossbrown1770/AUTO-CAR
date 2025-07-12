const carSummary = document.getElementById('summary-details');
const paymentForm = document.getElementById('payment-form');

const getCarSummary = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    try {
        const res = await axios.get(`/api/admin/cars/${id}`);
        const car = res.data;
        carSummary.innerHTML = `
            <h3>${car.make} ${car.model}</h3>
            <p>Year: ${car.year}</p>
            <p>Price: $${car.price}</p>
            <img src="${car.image}" alt="${car.make} ${car.model}" width="200">
        `;
    } catch (err) {
        console.error(err);
    }
};

paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const paymentOption = document.getElementById('payment-option').value;
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    try {
        const res = await axios.post('/api/payments', { name, email, paymentOption, car: carId });
        console.log(res.data);
        alert('Payment submitted successfully!');
        window.location.href = 'index.html';
    } catch (err) {
        console.error(err);
    }
});

getCarSummary();
