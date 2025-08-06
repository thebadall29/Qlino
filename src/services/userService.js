import axios from 'axios';

import config from '../config/config';
const API_URL = `${config.API_URL}/api/users`;

export const getUserData = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};