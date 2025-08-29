import React, { useEffect, useState } from 'react';
import { getCars, getContent } from '../api';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [cars, setCars] = useState([]);
  const [about, setAbout] = useState('');
  const [contact, setContact] = useState({});

  useEffect(() => {
    getCars().then(res => setCars(res.data));
    getContent().then(res => {
      setAbout(res.data.about);
      setContact(res.data.contact);
    });
  }, []);

  return (
    <div>
      <header style={{background:'#3399FF',color:'#fff',padding:'2rem 1rem',textAlign:'center'}}>
        <h1>AutoCentral</h1>
        <p>Find your perfect car under $3000</p>
      </header>
      <section style={{padding:'2rem 1rem'}}>
        <h2>Inventory</h2>
        <div style={{display:'flex',flexWrap:'wrap',gap:'1rem'}}>
          {cars.map(car => (
            <div key={car._id} style={{border:'1px solid #eee',borderRadius:8,padding:16,width:280}}>
              {car.images && car.images.length > 0 ? (
                <img src={car.images[0]} alt="car" style={{width:'100%',height:140,objectFit:'cover',borderRadius:6}} />
              ) : <div style={{height:140,background:'#f0f0f0',borderRadius:6}} />}
              <h3>{car.year} {car.make} {car.model}</h3>
              <div>${car.price.toLocaleString()}</div>
              <Link to={`/car/${car._id}`} className="btn" style={{marginRight:8}}>Details</Link>
              <Link to={`/payment/${car._id}`} className="btn btn-secondary">Payment</Link>
            </div>
          ))}
        </div>
      </section>
      <section style={{padding:'2rem 1rem',background:'#F0F0F0'}}>
        <h2>About</h2>
        <p>{about}</p>
      </section>
      <section style={{padding:'2rem 1rem'}}>
        <h2>Contact</h2>
        <div>Address: {contact.address}</div>
        <div>Phone: {contact.phone}</div>
        <div>Email: {contact.email}</div>
        <div>Hours: {contact.hours}</div>
      </section>
    </div>
  );
}
