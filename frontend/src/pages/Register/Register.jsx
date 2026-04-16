import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { api } from '../../services/api';
import '../Login/Login.css';

const Register = () => {
  const [username, setUsername] = useState('');
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
      await api.register(username, password);
      const data = await api.login(username, password);
      localStorage.setItem('token', data.access_token || data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Ошибка при регистрации. Возможно, пользователь уже существует.');
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
            label="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Придумайте логин"
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