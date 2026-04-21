import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { api } from '../../services/api';
import '../Login/Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await api.forgotPassword(email);
      setMsg(res.detail || 'Запрос принят.');
    } catch {
      setMsg('Запрос принят.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Восстановление пароля</h2>
        <p className="auth-redirect" style={{ textAlign: 'left', marginBottom: '1rem' }}>
          Учебный прототип: письмо не отправляется, запрос фиксируется на сервере-заглушке.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {msg && <div className="auth-error" style={{ color: 'var(--success-color)' }}>{msg}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Отправка...' : 'Отправить'}
          </Button>
        </form>
        <p className="auth-redirect">
          <Link to="/login">Назад ко входу</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
