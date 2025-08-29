import React, { useEffect, useState } from 'react';
import { getCars, createCar, updateCar, deleteCar, getUsers, createUser, updateUser, deleteUser, getContent, updateContent } from '../api';

export default function AdminDashboard() {
  const [tab, setTab] = useState('cars');
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState({ about: '', contact: {} });
  const [editingCar, setEditingCar] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [carForm, setCarForm] = useState({ make:'', model:'', year:'', price:'', mileage:'', transmission:'', fuelType:'', color:'', description:'', features:'', condition:'', images:[] });
  const [userForm, setUserForm] = useState({ name:'', email:'', password:'', role:'user' });
  const [about, setAbout] = useState('');
  const [contact, setContact] = useState({ address:'', phone:'', email:'', hours:'' });

  useEffect(() => {
    if (tab === 'cars') getCars().then(res => setCars(res.data));
    if (tab === 'users') getUsers().then(res => setUsers(res.data));
    if (tab === 'content') getContent().then(res => { setContent(res.data); setAbout(res.data.about); setContact(res.data.contact); });
  }, [tab]);

  // Car CRUD
  const handleCarFormChange = e => {
    const { name, value } = e.target;
    setCarForm(f => ({ ...f, [name]: value }));
  };
  const handleCarImageChange = (idx, val) => {
    setCarForm(f => ({ ...f, images: f.images.map((img, i) => i === idx ? val : img) }));
  };
  const addCarImage = () => setCarForm(f => ({ ...f, images: [...f.images, ''] }));
  const removeCarImage = idx => setCarForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  const startEditCar = car => { setEditingCar(car); setCarForm({ ...car, features: car.features ? car.features.join(', ') : '', images: car.images || [] }); };
  const resetCarForm = () => { setEditingCar(null); setCarForm({ make:'', model:'', year:'', price:'', mileage:'', transmission:'', fuelType:'', color:'', description:'', features:'', condition:'', images:[] }); };
  const submitCarForm = e => {
    e.preventDefault();
    const data = { ...carForm, year: Number(carForm.year), price: Number(carForm.price), mileage: Number(carForm.mileage), features: carForm.features.split(',').map(f => f.trim()), images: carForm.images.filter(Boolean) };
    (editingCar ? updateCar(editingCar._id, data) : createCar(data)).then(() => { getCars().then(res => setCars(res.data)); resetCarForm(); });
  };
  const handleDeleteCar = id => { if(window.confirm('Delete car?')) deleteCar(id).then(() => getCars().then(res => setCars(res.data))); };

  // User CRUD
  const handleUserFormChange = e => { const { name, value } = e.target; setUserForm(f => ({ ...f, [name]: value })); };
  const startEditUser = user => { setEditingUser(user); setUserForm(user); };
  const resetUserForm = () => { setEditingUser(null); setUserForm({ name:'', email:'', password:'', role:'user' }); };
  const submitUserForm = e => { e.preventDefault(); (editingUser ? updateUser(editingUser._id, userForm) : createUser(userForm)).then(() => { getUsers().then(res => setUsers(res.data)); resetUserForm(); }); };
  const handleDeleteUser = id => { if(window.confirm('Delete user?')) deleteUser(id).then(() => getUsers().then(res => setUsers(res.data))); };

  // Content
  const submitContent = e => { e.preventDefault(); updateContent({ about, contact }).then(() => alert('Content updated!')); };

  return (
    <div style={{padding:'2rem'}}>
      <h2>Admin Dashboard</h2>
      <div style={{marginBottom:'1rem'}}>
        <button onClick={()=>setTab('cars')}>Cars</button>
        <button onClick={()=>setTab('users')}>Users</button>
        <button onClick={()=>setTab('content')}>About/Contact</button>
      </div>
      {tab==='cars' && (
        <div>
          <h3>{editingCar ? 'Edit Car' : 'Add Car'}</h3>
          <form onSubmit={submitCarForm} style={{display:'flex',flexDirection:'column',gap:8,maxWidth:500}}>
            <input name="make" placeholder="Make" value={carForm.make} onChange={handleCarFormChange} required />
            <input name="model" placeholder="Model" value={carForm.model} onChange={handleCarFormChange} required />
            <input name="year" type="number" placeholder="Year" value={carForm.year} onChange={handleCarFormChange} required />
            <input name="price" type="number" placeholder="Price" value={carForm.price} onChange={handleCarFormChange} required />
            <input name="mileage" type="number" placeholder="Mileage" value={carForm.mileage} onChange={handleCarFormChange} required />
            <input name="transmission" placeholder="Transmission" value={carForm.transmission} onChange={handleCarFormChange} required />
            <input name="fuelType" placeholder="Fuel Type" value={carForm.fuelType} onChange={handleCarFormChange} required />
            <input name="color" placeholder="Color" value={carForm.color} onChange={handleCarFormChange} required />
            <textarea name="description" placeholder="Description" value={carForm.description} onChange={handleCarFormChange} />
            <input name="features" placeholder="Features (comma separated)" value={carForm.features} onChange={handleCarFormChange} />
            <input name="condition" placeholder="Condition" value={carForm.condition} onChange={handleCarFormChange} required />
            <div>
              <b>Images:</b>
              {carForm.images.map((img, idx) => (
                <div key={idx} style={{display:'flex',alignItems:'center',gap:4,marginBottom:4}}>
                  <input value={img} onChange={e=>handleCarImageChange(idx, e.target.value)} style={{flex:1}} />
                  <button type="button" onClick={()=>removeCarImage(idx)} style={{color:'red'}}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={addCarImage}>Add Image</button>
            </div>
            <button type="submit">{editingCar ? 'Save Changes' : 'Add Car'}</button>
            {editingCar && <button type="button" onClick={resetCarForm}>Cancel</button>}
          </form>
          <h3>All Cars</h3>
          <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
            {cars.map(car => (
              <div key={car._id} style={{border:'1px solid #eee',borderRadius:8,padding:12,width:260}}>
                {car.images && car.images[0] && <img src={car.images[0]} alt="car" style={{width:'100%',height:90,objectFit:'cover',borderRadius:6}} />}
                <div><b>{car.year} {car.make} {car.model}</b></div>
                <div>${car.price.toLocaleString()}</div>
                <button onClick={()=>startEditCar(car)}>Edit</button>
                <button onClick={()=>handleDeleteCar(car._id)} style={{color:'red'}}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='users' && (
        <div>
          <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
          <form onSubmit={submitUserForm} style={{display:'flex',flexDirection:'column',gap:8,maxWidth:400}}>
            <input name="name" placeholder="Full Name" value={userForm.name} onChange={handleUserFormChange} required />
            <input name="email" placeholder="Email" value={userForm.email} onChange={handleUserFormChange} required />
            <input name="password" type="password" placeholder="Password" value={userForm.password} onChange={handleUserFormChange} required />
            <input name="role" placeholder="Role (admin/user)" value={userForm.role} onChange={handleUserFormChange} required />
            <button type="submit">{editingUser ? 'Save Changes' : 'Add User'}</button>
            {editingUser && <button type="button" onClick={resetUserForm}>Cancel</button>}
          </form>
          <h3>All Users</h3>
          <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
            {users.map(user => (
              <div key={user._id} style={{border:'1px solid #eee',borderRadius:8,padding:12,width:260}}>
                <div><b>{user.name}</b> ({user.email})</div>
                <div>{user.role}</div>
                <button onClick={()=>startEditUser(user)}>Edit</button>
                <button onClick={()=>handleDeleteUser(user._id)} style={{color:'red'}}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==='content' && (
        <div>
          <h3>Edit About</h3>
          <textarea value={about} onChange={e=>setAbout(e.target.value)} style={{width:'100%',minHeight:80}} />
          <h3>Edit Contact</h3>
          <form onSubmit={submitContent} style={{display:'flex',flexDirection:'column',gap:8,maxWidth:400}}>
            <input name="address" placeholder="Address" value={contact.address} onChange={e=>setContact(c=>({...c,address:e.target.value}))} />
            <input name="phone" placeholder="Phone" value={contact.phone} onChange={e=>setContact(c=>({...c,phone:e.target.value}))} />
            <input name="email" placeholder="Email" value={contact.email} onChange={e=>setContact(c=>({...c,email:e.target.value}))} />
            <input name="hours" placeholder="Hours" value={contact.hours} onChange={e=>setContact(c=>({...c,hours:e.target.value}))} />
            <button type="submit">Save Content</button>
          </form>
        </div>
      )}
    </div>
  );
}
