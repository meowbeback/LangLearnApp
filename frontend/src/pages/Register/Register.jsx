import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { api } from '../../services/api';
import '../Login/Login.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      await api.register(email, login, password);
      const data = await api.login(email, password);
      localStorage.setItem('token', data.access_token || data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/onboarding');
    } catch (err) {
      setError('Ошибка регистрации. Возможно, email уже занят.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <Input
            label="Отображаемое имя (логин)"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            placeholder="Как к вам обращаться"
          />
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Придумайте пароль"
          />
          <Input
            label="Подтверждение пароля"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Повторите пароль"
          />
          {error && <div className="auth-error">{error}</div>}
          <Button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </Button>
        </form>
        <p className="auth-redirect">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
