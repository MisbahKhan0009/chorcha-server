import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDivisions = () => api.get('/divisions/');
export const getGroups = () => api.get('/groups/');
export const getSubjects = (divisionId, groupId) => 
  api.get(`/subjects/?division=${divisionId}&group=${groupId}`);
export const getQuestionSets = (subjectId) => 
  api.get(`/question-sets/?subject=${subjectId}`);
export const getQuestionSetDetail = (setId) => 
  api.get(`/question-sets/${setId}/`);

export default api;
