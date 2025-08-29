import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCar } from '../api';

export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState(null);

  useEffect(() => {
    getCar(id).then(res => setCar(res.data));
  }, [id]);

  if (!car) return <div style={{padding:'2rem'}}>Loading...</div>;

  return (
    <div style={{padding:'2rem'}}>
      <h2>{car.year} {car.make} {car.model}</h2>
      <div style={{display:'flex',gap:'2rem',flexWrap:'wrap'}}>
        <div>
          {car.images && car.images.length > 0 ? (
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {car.images.map((img, i) => (
                <img key={i} src={img} alt="car" style={{width:140,height:100,objectFit:'cover',borderRadius:6}} />
              ))}
            </div>
          ) : <div style={{width:140,height:100,background:'#f0f0f0',borderRadius:6}} />}
        </div>
        <div>
          <div><b>Price:</b> ${car.price.toLocaleString()}</div>
          <div><b>Mileage:</b> {car.mileage.toLocaleString()} miles</div>
          <div><b>Transmission:</b> {car.transmission}</div>
          <div><b>Fuel Type:</b> {car.fuelType}</div>
          <div><b>Color:</b> {car.color}</div>
          <div><b>Condition:</b> {car.condition}</div>
          <div style={{margin:'1rem 0'}}><b>Description:</b><br />{car.description}</div>
          <Link to={`/payment/${car._id}`} className="btn btn-primary">Proceed to Payment</Link>
        </div>
      </div>
      <div style={{marginTop:'2rem'}}>
        <Link to="/">&larr; Back to Inventory</Link>
      </div>
    </div>
  );
}
