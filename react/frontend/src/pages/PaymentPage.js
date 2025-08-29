import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCar } from '../api';

const paymentMethods = [
  'Credit Card', 'Cash App', 'Chime', 'Zelle', 'Apple Pay', 'PayPal', 'Varo', 'Gift Card'
];

export default function PaymentPage() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', paymentMethod: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getCar(id).then(res => setCar(res.data));
  }, [id]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (!car) return <div style={{padding:'2rem'}}>Loading...</div>;

  return (
    <div style={{padding:'2rem',maxWidth:500,margin:'0 auto'}}>
      <h2>Payment Intent</h2>
      <div style={{marginBottom:'1rem'}}>
        <b>{car.year} {car.make} {car.model}</b><br />
        <img src={car.images && car.images[0]} alt="car" style={{width:180,height:120,objectFit:'cover',borderRadius:6,margin:'1rem 0'}} />
        <div>Price: ${car.price.toLocaleString()}</div>
      </div>
      {submitted ? (
        <div style={{background:'#e0ffe0',padding:'1rem',borderRadius:8}}>
          <b>Thank you!</b> We have received your request. We will contact you soon with payment instructions.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
          <input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
          <input name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required />
          <input name="phone" placeholder="Your Phone" value={form.phone} onChange={handleChange} />
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required>
            <option value="">Select Payment Method</option>
            {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <textarea name="message" placeholder="Message (optional)" value={form.message} onChange={handleChange} rows={3} />
          <button type="submit" className="btn btn-primary">Send Request</button>
        </form>
      )}
    </div>
  );
}
