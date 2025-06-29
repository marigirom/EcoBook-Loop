import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  //form to enter personal details
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token);
      alert('Registered successfully');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

    return (
    <div className="register-page">
      <div className="register-card">
        <form onSubmit={handleSubmit}>
          <h2>SignUp</h2>
          <input name="name" placeholder="Name" onChange={handleChange} required />
          <input name="email" placeholder="Email" onChange={handleChange} required />
          <input name="phone" placeholder="Phone" onChange={handleChange} required />
          <input name="password" placeholder="Password" onChange={handleChange} type="password" required />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
