/**
 * @file api.js
 * @brief Модуль для взаимодействия с сервером (API).
 * 
 * Временно содержит моки (заглушки) данных, пока бэкенд не реализован полностью.
 */

import axios from 'axios';

const API_URL = 'http://localhost:8000';

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

/**
 * @brief Объект с методами для работы с API.
 */
export const api = {
  /**
   * @brief Регистрация нового пользователя.
   * 
   * Пытается отправить реальный запрос на бэкенд. Если бэкенд недоступен,
   * возвращает успешный мок-ответ.
   * 
   * @param {string} username Логин пользователя.
   * @param {string} password Пароль пользователя.
   * @return {Promise<Object>} Данные зарегистрированного пользователя.
   */
  register: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { username, password });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock register');
      return new Promise(resolve => setTimeout(() => resolve({ id: 999, username }), 500));
    }
  },

  /**
   * @brief Авторизация пользователя (вход).
   * 
   * На данный момент полностью замокана. Возвращает фейковый JWT-токен
   * при вводе любых непустых данных.
   * 
   * @param {string} username Логин пользователя.
   * @param {string} password Пароль пользователя.
   * @return {Promise<Object>} Объект с токеном и данными юзера.
   * @throws {Error} Если логин или пароль пустые.
   */
  login: async (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && password) {
          resolve({ token: 'mock-jwt-token-123', user: { username } });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  },

  /**
   * @brief Получение списка всех доступных уроков.
   * 
   * @return {Promise<Array>} Массив объектов уроков.
   */
  getLessons: async () => {
    return new Promise(resolve => {
      setTimeout(() => resolve(MOCK_LESSONS), 300);
    });
  },

  /**
   * @brief Получение конкретного урока по его ID.
   * 
   * @param {number|string} id Идентификатор урока.
   * @return {Promise<Object>} Объект урока со списком заданий.
   * @throws {Error} Если урок с таким ID не найден.
   */
  getLesson: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lesson = MOCK_LESSONS.find(l => l.id === parseInt(id));
        if (lesson) resolve(lesson);
        else reject(new Error('Lesson not found'));
      }, 300);
    });
  }
};