/**
 * @file api.js
 * @brief Модуль для взаимодействия с сервером (API).
 * 
 * Содержит флаг USE_REAL_BACKEND для переключения между реальным API и моками.
 */

import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Флаг для переключения между реальным бэкендом и моками
export const USE_REAL_BACKEND = false;

/**
 * @brief Заглушка списка уроков.
 * @type {Array<Object>}
 */
const MOCK_LESSONS = [
  {
    id: 1,
    title: 'Основы: Приветствия',
    level: 'Beginner',
    completed: false,
    tasks: [
      {
        id: 101,
        type: 'translate',
        question: 'Как сказать "Привет"?',
        options: ['Hello', 'Goodbye', 'Please', 'Thanks'],
        correctAnswer: 'Hello'
      },
      {
        id: 102,
        type: 'input',
        question: 'Напишите по-английски "Яблоко"',
        correctAnswer: 'Apple'
      }
    ]
  },
  {
    id: 2,
    title: 'Глагол to be',
    level: 'Beginner',
    completed: false,
    tasks: [
      {
        id: 201,
        type: 'translate',
        question: 'I ___ a student',
        options: ['am', 'is', 'are', 'be'],
        correctAnswer: 'am'
      }
    ]
  }
];

// Вспомогательная функция для получения заголовков авторизации
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * @brief Объект с методами для работы с API.
 */
export const api = {
  /**
   * @brief Регистрация нового пользователя.
   */
  register: async (username, password) => {
    if (USE_REAL_BACKEND) {
      const response = await axios.post(`${API_URL}/auth/register`, { username, password });
      return response.data;
    }
    return new Promise(resolve => setTimeout(() => resolve({ id: 999, username }), 500));
  },

  /**
   * @brief Авторизация пользователя (вход).
   */
  login: async (username, password) => {
    if (USE_REAL_BACKEND) {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      return response.data;
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && password) {
          resolve({ access_token: 'mock-jwt-token-123', user: { username } });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  },

  /**
   * @brief Получение списка всех доступных уроков.
   */
  getLessons: async () => {
    if (USE_REAL_BACKEND) {
      const response = await axios.get(`${API_URL}/lessons`, { headers: getAuthHeaders() });
      return response.data;
    }
    return new Promise(resolve => {
      setTimeout(() => resolve(MOCK_LESSONS), 300);
    });
  },

  /**
   * @brief Получение конкретного урока по его ID.
   */
  getLesson: async (id) => {
    if (USE_REAL_BACKEND) {
      const response = await axios.get(`${API_URL}/lessons/${id}`, { headers: getAuthHeaders() });
      return response.data;
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lesson = MOCK_LESSONS.find(l => l.id === parseInt(id));
        if (lesson) resolve(lesson);
        else reject(new Error('Lesson not found'));
      }, 300);
    });
  },

  /**
   * @brief Отметка урока как пройденного.
   */
  completeLesson: async (id) => {
    if (USE_REAL_BACKEND) {
      const response = await axios.post(`${API_URL}/lessons/${id}/complete`, {}, { headers: getAuthHeaders() });
      return response.data;
    }
    return new Promise(resolve => {
      setTimeout(() => resolve({ message: "Lesson completed" }), 300);
    });
  },

  /**
   * @brief Получение статистики профиля.
   */
  getProfileStats: async () => {
    if (USE_REAL_BACKEND) {
      const response = await axios.get(`${API_URL}/profile/stats`, { headers: getAuthHeaders() });
      return response.data;
    }
    return new Promise(resolve => {
      setTimeout(() => resolve({ completed_lessons_count: 5, current_streak: 3 }), 300);
    });
  }
};
