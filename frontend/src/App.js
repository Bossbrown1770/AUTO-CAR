import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';

// Authentication Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.user_id) {
          setUser(data);
        }
      })
      .catch(error => {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser({ user_id: data.user_id, role: data.role });
      return true;
    }
    return false;
  };

  const register = async (userData) => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser({ user_id: data.user_id, role: 'user' });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Components
const Navbar = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>AutoDeal Pro</h2>
        </div>
        <div className="nav-links">
          <button 
            className={currentPage === 'home' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <button 
            className={currentPage === 'inventory' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentPage('inventory')}
          >
            Inventory
          </button>
          <button 
            className={currentPage === 'about' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentPage('about')}
          >
            About
          </button>
          <button 
            className={currentPage === 'contact' ? 'nav-link active' : 'nav-link'}
            onClick={() => setCurrentPage('contact')}
          >
            Contact
          </button>
          {user ? (
            <div className="user-menu">
              {user.role === 'admin' && (
                <button 
                  className={currentPage === 'admin' ? 'nav-link active' : 'nav-link'}
                  onClick={() => setCurrentPage('admin')}
                >
                  Admin
                </button>
              )}
              <button 
                className={currentPage === 'orders' ? 'nav-link active' : 'nav-link'}
                onClick={() => setCurrentPage('orders')}
              >
                My Orders
              </button>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                className={currentPage === 'login' ? 'nav-link active' : 'nav-link'}
                onClick={() => setCurrentPage('login')}
              >
                Login
              </button>
              <button 
                className={currentPage === 'register' ? 'nav-link active' : 'nav-link'}
                onClick={() => setCurrentPage('register')}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
      <PageRouter currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </nav>
  );
};

const HomePage = () => {
  const carImages = [
    'https://images.unsplash.com/photo-1560009320-c01920eef9f8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHxjYXJ8ZW58MHx8fGJsdWV8MTc1MjU1OTA3Nnww&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1591105327764-4c4b76f9e6a0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxjYXJ8ZW58MHx8fGJsdWV8MTc1MjU1OTA3Nnww&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1601929862217-f1bf94503333?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXJzfGVufDB8fHxibHVlfDE3NTI1MjEwMzZ8MA&ixlib=rb-4.1.0&q=85'
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Find Your Perfect Car</h1>
            <p>Discover premium vehicles at unbeatable prices. We offer the best selection of cars with flexible payment options.</p>
            <div className="hero-buttons">
              <button className="btn-primary">Browse Inventory</button>
              <button className="btn-secondary">Get Financing</button>
            </div>
          </div>
          <div className="hero-image">
            <img src={carImages[0]} alt="Featured Car" />
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Why Choose AutoDeal Pro?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚗</div>
            <h3>Quality Vehicles</h3>
            <p>All our cars are thoroughly inspected and come with detailed histories.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Flexible Payment</h3>
            <p>Multiple payment options including credit cards, bank transfers, and digital wallets.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Secure Transactions</h3>
            <p>Your payments are protected with industry-leading security measures.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <h3>24/7 Support</h3>
            <p>Our team is here to help you every step of the way.</p>
          </div>
        </div>
      </section>

      <section className="gallery-section">
        <h2>Featured Vehicles</h2>
        <div className="gallery-grid">
          {carImages.map((image, index) => (
            <div key={index} className="gallery-item">
              <img src={image} alt={`Car ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const InventoryPage = ({ setCurrentPage }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    fetchCars();
  }, [searchTerm]);

  const fetchCars = async () => {
    try {
      const url = searchTerm 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/cars?search=${encodeURIComponent(searchTerm)}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/cars`;
      
      const response = await fetch(url);
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <div className="loading">Loading cars...</div>;

  return (
    <div className="inventory-page">
      <h1>Our Inventory</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by make, model, or color..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="cars-grid">
        {cars.map((car) => (
          <div key={car.car_id} className="car-card">
            <div className="car-image">
              <img 
                src={car.main_image || 'https://via.placeholder.com/300x200?text=Car+Image'} 
                alt={`${car.make} ${car.model}`}
              />
            </div>
            <div className="car-info">
              <h3>{car.make} {car.model}</h3>
              <p className="car-year">{car.year}</p>
              <p className="car-price">${car.price.toLocaleString()}</p>
              <p className="car-mileage">{car.mileage.toLocaleString()} miles</p>
              <p className="car-details">{car.fuel_type} • {car.transmission}</p>
              <button 
                className="btn-primary"
                onClick={() => setSelectedCar(car)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCar && (
        <CarDetailsModal 
          car={selectedCar} 
          onClose={() => setSelectedCar(null)}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

const CarDetailsModal = ({ car, onClose, setCurrentPage }) => {
  const { user } = useAuth();
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    financing_needed: false,
    payment_method: 'credit_card'
  });

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to purchase a car');
      setCurrentPage('login');
      return;
    }

    // Create order
    const orderData = {
      ...purchaseForm,
      car_id: car.car_id
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        // Redirect to payment
        const formData = new FormData();
        formData.append('car_id', car.car_id);

        const paymentResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/checkout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          window.location.href = paymentData.url;
        }
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Error processing purchase. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content car-details-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="car-details-header">
          <h2>{car.make} {car.model} ({car.year})</h2>
          <p className="car-price">${car.price.toLocaleString()}</p>
        </div>

        <div className="car-images">
          <div className="main-image">
            <img 
              src={car.main_image || 'https://via.placeholder.com/500x300?text=Car+Image'} 
              alt={`${car.make} ${car.model}`}
            />
          </div>
          {car.images && car.images.length > 0 && (
            <div className="image-gallery">
              {car.images.map((image, index) => (
                <img 
                  key={index} 
                  src={image} 
                  alt={`${car.make} ${car.model} ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="car-specifications">
          <h3>Specifications</h3>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Mileage:</span>
              <span className="spec-value">{car.mileage.toLocaleString()} miles</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Fuel Type:</span>
              <span className="spec-value">{car.fuel_type}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Transmission:</span>
              <span className="spec-value">{car.transmission}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Engine:</span>
              <span className="spec-value">{car.engine_size}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Color:</span>
              <span className="spec-value">{car.color}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Interior:</span>
              <span className="spec-value">{car.interior_type}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">VIN:</span>
              <span className="spec-value">{car.vin_number}</span>
            </div>
          </div>
        </div>

        <div className="car-description">
          <h3>Description</h3>
          <p>{car.description}</p>
        </div>

        {car.safety_features && car.safety_features.length > 0 && (
          <div className="safety-features">
            <h3>Safety Features</h3>
            <ul>
              {car.safety_features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="purchase-section">
          {!showPurchaseForm ? (
            <button 
              className="btn-primary purchase-btn"
              onClick={() => setShowPurchaseForm(true)}
            >
              Purchase This Car
            </button>
          ) : (
            <form onSubmit={handlePurchaseSubmit} className="purchase-form">
              <h3>Purchase Information</h3>
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={purchaseForm.customer_name}
                  onChange={(e) => setPurchaseForm({...purchaseForm, customer_name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={purchaseForm.customer_email}
                  onChange={(e) => setPurchaseForm({...purchaseForm, customer_email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={purchaseForm.customer_phone}
                  onChange={(e) => setPurchaseForm({...purchaseForm, customer_phone: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={purchaseForm.customer_address}
                  onChange={(e) => setPurchaseForm({...purchaseForm, customer_address: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={purchaseForm.payment_method}
                  onChange={(e) => setPurchaseForm({...purchaseForm, payment_method: e.target.value})}
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="google_pay">Google Pay</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={purchaseForm.financing_needed}
                    onChange={(e) => setPurchaseForm({...purchaseForm, financing_needed: e.target.checked})}
                  />
                  I need financing assistance
                </label>
              </div>

              <div className="form-buttons">
                <button type="button" onClick={() => setShowPurchaseForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Proceed to Payment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const AboutPage = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About AutoDeal Pro</h1>
        <p>Your trusted partner in finding the perfect vehicle</p>
      </section>

      <section className="about-content">
        <div className="about-text">
          <h2>Our Story</h2>
          <p>
            Founded with a passion for connecting people with their dream cars, AutoDeal Pro has been serving customers for over a decade. 
            We believe that buying a car should be an exciting and stress-free experience.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            To provide high-quality vehicles at competitive prices while delivering exceptional customer service. 
            We're committed to transparency, integrity, and making car buying accessible to everyone.
          </p>

          <h2>What Sets Us Apart</h2>
          <ul>
            <li>Comprehensive vehicle inspections</li>
            <li>Transparent pricing with no hidden fees</li>
            <li>Multiple payment options for flexibility</li>
            <li>Expert financing assistance</li>
            <li>Dedicated customer support</li>
            <li>Secure online transactions</li>
          </ul>
        </div>

        <div className="about-stats">
          <div className="stat-card">
            <h3>1000+</h3>
            <p>Cars Sold</p>
          </div>
          <div className="stat-card">
            <h3>500+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat-card">
            <h3>10+</h3>
            <p>Years Experience</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Customer Support</p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <h2>Contact Information</h2>
        <div className="contact-info">
          <div className="contact-item">
            <h3>Phone</h3>
            <p>+1 470-499-8139</p>
          </div>
          <div className="contact-item">
            <h3>Telegram</h3>
            <p>@carsforsaleunder3000</p>
          </div>
          <div className="contact-item">
            <h3>Business Hours</h3>
            <p>Mon-Fri: 9AM-8PM<br />Sat-Sun: 10AM-6PM</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitMessage('Thank you! Your message has been sent successfully.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setSubmitMessage('Error sending message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitMessage('Error sending message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contact-page">
      <h1>Contact Us</h1>
      
      <div className="contact-container">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <p>Have questions about our vehicles or need assistance? We're here to help!</p>
          
          <div className="contact-details">
            <div className="contact-item">
              <h3>📞 Phone</h3>
              <p>+1 470-499-8139</p>
            </div>
            <div className="contact-item">
              <h3>💬 Telegram</h3>
              <p>@carsforsaleunder3000</p>
              <a href="https://t.me/carsforsaleunder3000" target="_blank" rel="noopener noreferrer">
                Chat with us on Telegram
              </a>
            </div>
            <div className="contact-item">
              <h3>🕒 Business Hours</h3>
              <p>Monday - Friday: 9:00 AM - 8:00 PM<br />Saturday - Sunday: 10:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        <div className="contact-form">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

            {submitMessage && (
              <div className={`submit-message ${submitMessage.includes('Error') ? 'error' : 'success'}`}>
                {submitMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ setCurrentPage }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const success = await login(formData.email, formData.password);
    if (success) {
      setCurrentPage('home');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary">Login</button>
        </form>
        <p>
          Don't have an account?{' '}
          <button onClick={() => setCurrentPage('register')} className="link-button">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = ({ setCurrentPage }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const success = await register(formData);
    if (success) {
      setCurrentPage('home');
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary">Register</button>
        </form>
        <p>
          Already have an account?{' '}
          <button onClick={() => setCurrentPage('login')} className="link-button">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({});
  const [cars, setCars] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchCars();
    fetchOrders();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchCars = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cars`);
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading admin panel...</div>;

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'cars' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('cars')}
        >
          Manage Cars
        </button>
        <button 
          className={activeTab === 'orders' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Cars</h3>
            <p>{dashboardData.total_cars || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Available Cars</h3>
            <p>{dashboardData.available_cars || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Sold Cars</h3>
            <p>{dashboardData.sold_cars || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{dashboardData.total_users || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p>{dashboardData.total_orders || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p>${(dashboardData.total_revenue || 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      {activeTab === 'cars' && (
        <div className="cars-management">
          <h2>Car Inventory Management</h2>
          <div className="cars-list">
            {cars.map(car => (
              <div key={car.car_id} className="car-item">
                <h3>{car.make} {car.model} ({car.year})</h3>
                <p>Price: ${car.price.toLocaleString()}</p>
                <p>Status: {car.status}</p>
                <p>Mileage: {car.mileage.toLocaleString()} miles</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-management">
          <h2>Order Management</h2>
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.order_id} className="order-item">
                <h3>Order #{order.order_id.slice(-8)}</h3>
                <p>Customer: {order.customer_name}</p>
                <p>Email: {order.customer_email}</p>
                <p>Phone: {order.customer_phone}</p>
                <p>Status: {order.order_status}</p>
                <p>Amount: ${order.total_amount.toLocaleString()}</p>
                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading your orders...</div>;

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.order_id} className="order-card">
              <h3>Order #{order.order_id.slice(-8)}</h3>
              <p>Status: {order.order_status}</p>
              <p>Total: ${order.total_amount.toLocaleString()}</p>
              <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
              <p>Payment Method: {order.payment_method}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PaymentSuccess = () => {
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const [paymentInfo, setPaymentInfo] = useState({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      pollPaymentStatus(sessionId);
    }
  }, []);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000; // 2 seconds

    if (attempts >= maxAttempts) {
      setPaymentStatus('timeout');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/status/${sessionId}`);
      const data = await response.json();
      
      if (data.payment_status === 'paid') {
        setPaymentStatus('success');
        setPaymentInfo(data);
        return;
      } else if (data.status === 'expired') {
        setPaymentStatus('expired');
        return;
      }

      // Continue polling if payment is still pending
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('error');
    }
  };

  return (
    <div className="payment-result">
      {paymentStatus === 'checking' && (
        <div className="payment-checking">
          <h2>Processing your payment...</h2>
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {paymentStatus === 'success' && (
        <div className="payment-success">
          <h2>Payment Successful! 🎉</h2>
          <p>Thank you for your purchase. Your payment has been processed successfully.</p>
          <p>Amount: ${(paymentInfo.amount_total / 100).toFixed(2)}</p>
          <p>You will receive a confirmation email shortly.</p>
        </div>
      )}
      
      {paymentStatus === 'expired' && (
        <div className="payment-expired">
          <h2>Payment Session Expired</h2>
          <p>Your payment session has expired. Please try again.</p>
        </div>
      )}
      
      {paymentStatus === 'error' && (
        <div className="payment-error">
          <h2>Payment Error</h2>
          <p>There was an error processing your payment. Please contact support.</p>
        </div>
      )}
    </div>
  );
};

const PageRouter = ({ currentPage, setCurrentPage }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Check if user is trying to access admin page
  if (currentPage === 'admin' && (!user || user.role !== 'admin')) {
    return <div className="error">Access denied. Admin privileges required.</div>;
  }

  // Check if user is trying to access protected pages
  if ((currentPage === 'orders') && !user) {
    return <div className="error">Please login to view your orders.</div>;
  }

  // Handle payment success page
  if (window.location.pathname === '/payment-success' || window.location.search.includes('session_id')) {
    return <PaymentSuccess />;
  }

  switch (currentPage) {
    case 'home':
      return <HomePage />;
    case 'inventory':
      return <InventoryPage setCurrentPage={setCurrentPage} />;
    case 'about':
      return <AboutPage />;
    case 'contact':
      return <ContactPage />;
    case 'login':
      return <LoginPage setCurrentPage={setCurrentPage} />;
    case 'register':
      return <RegisterPage setCurrentPage={setCurrentPage} />;
    case 'admin':
      return <AdminPage />;
    case 'orders':
      return <MyOrdersPage />;
    default:
      return <HomePage />;
  }
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
      </div>
    </AuthProvider>
  );
}

export default App;