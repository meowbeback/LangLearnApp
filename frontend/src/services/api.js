import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const USE_REAL_BACKEND = true;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  register: async (email, login, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      login,
      password,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  },

  getStudentMe: async () => {
    const response = await axios.get(`${API_URL}/students/me`, { headers: getAuthHeaders() });
    return response.data;
  },

  patchStudentMe: async (body) => {
    const response = await axios.patch(`${API_URL}/students/me`, body, { headers: getAuthHeaders() });
    return response.data;
  },

  getCourses: async () => {
    const response = await axios.get(`${API_URL}/courses`, { headers: getAuthHeaders() });
    return response.data;
  },

  getLessons: async (params = {}) => {
    const response = await axios.get(`${API_URL}/lessons`, {
      headers: getAuthHeaders(),
      params,
    });
    return response.data;
  },

  getLesson: async (id) => {
    const response = await axios.get(`${API_URL}/lessons/${id}`, { headers: getAuthHeaders() });
    return response.data;
  },

  getLessonProgressState: async (id) => {
    const response = await axios.get(`${API_URL}/lessons/${id}/progress-state`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  putLessonProgress: async (id, body) => {
    const response = await axios.put(`${API_URL}/lessons/${id}/progress`, body, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  checkTask: async (lessonId, taskId, answer) => {
    const response = await axios.post(
      `${API_URL}/lessons/${lessonId}/check-task`,
      { task_id: taskId, answer },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  completeLesson: async (id) => {
    const response = await axios.post(`${API_URL}/lessons/${id}/complete`, {}, { headers: getAuthHeaders() });
    return response.data;
  },

  restartLesson: async (id) => {
    const response = await axios.post(`${API_URL}/lessons/${id}/restart`, {}, { headers: getAuthHeaders() });
    return response.data;
  },

  getWrongTasks: async (lessonId) => {
    const response = await axios.get(`${API_URL}/lessons/${lessonId}/wrong-tasks`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  getDictionaryWords: async () => {
    const response = await axios.get(`${API_URL}/dictionaries/me/words`, { headers: getAuthHeaders() });
    return response.data;
  },

  addDictionaryWord: async (word_original, word_translation) => {
    const response = await axios.post(
      `${API_URL}/dictionaries/me/words`,
      { word_original, word_translation },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  getProfileStats: async () => {
    const response = await axios.get(`${API_URL}/profile/stats`, { headers: getAuthHeaders() });
    return response.data;
  },
};
