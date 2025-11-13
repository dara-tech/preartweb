import api from './api';

const infantTestApi = {
  // Get infant test results with pagination and filtering
  getInfantTests: async (params = {}) => {
    try {
      const response = await api.get('/apiv1/infant-tests', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching infant tests:', error);
      throw error;
    }
  },

  // Get infant test statistics
  getTestStats: async (params = {}) => {
    try {
      const response = await api.get('/apiv1/infant-tests/stats/summary', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching infant test statistics:', error);
      throw error;
    }
  },

  // Get infant test by ID
  getInfantTestById: async (clinicId) => {
    try {
      const response = await api.get(`/apiv1/infant-tests/${clinicId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching infant test by ID:', error);
      throw error;
    }
  },

  // Create new infant test
  createInfantTest: async (testData) => {
    try {
      const response = await api.post('/apiv1/infant-tests', testData);
      return response.data;
    } catch (error) {
      console.error('Error creating infant test:', error);
      throw error;
    }
  },

  // Update infant test
  updateInfantTest: async (clinicId, testData) => {
    try {
      const response = await api.put(`/apiv1/infant-tests/${clinicId}`, testData);
      return response.data;
    } catch (error) {
      console.error('Error updating infant test:', error);
      throw error;
    }
  },

  // Delete infant test
  deleteInfantTest: async (clinicId) => {
    try {
      const response = await api.delete(`/apiv1/infant-tests/${clinicId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting infant test:', error);
      throw error;
    }
  }
};

export default infantTestApi;
