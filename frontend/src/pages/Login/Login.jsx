import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { api } from '../../services/api';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Неверное имя пользователя или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Вход в систему</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Введите логин"
          />
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Введите пароль"
          />
          {error && <div className="auth-error">{error}</div>}
          <Button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Загрузка...' : 'Войти'}
          </Button>
        </form>
        <p className="auth-redirect">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;