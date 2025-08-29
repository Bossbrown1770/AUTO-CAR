import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getCars = () => axios.get(`${API_URL}/cars`);
export const getCar = id => axios.get(`${API_URL}/cars/${id}`);
export const createCar = data => axios.post(`${API_URL}/cars`, data);
export const updateCar = (id, data) => axios.put(`${API_URL}/cars/${id}`, data);
export const deleteCar = id => axios.delete(`${API_URL}/cars/${id}`);

export const getUsers = () => axios.get(`${API_URL}/users`);
export const createUser = data => axios.post(`${API_URL}/users`, data);
export const updateUser = (id, data) => axios.put(`${API_URL}/users/${id}`, data);
export const deleteUser = id => axios.delete(`${API_URL}/users/${id}`);

export const getContent = () => axios.get(`${API_URL}/content`);
export const updateContent = data => axios.put(`${API_URL}/content`, data);
