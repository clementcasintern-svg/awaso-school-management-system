import apiClient from './api';

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  gender: string;
  nationality: string;
  phone?: string;
  classId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  classId?: string;
  search?: string;
}

export const studentAPI = {
  getAll: async (params: GetStudentsParams = {}) => {
    const response = await apiClient.get('/students', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  create: async (data: Partial<Student>) => {
    const response = await apiClient.post('/students', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Student>) => {
    const response = await apiClient.put(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },

  getDashboard: async (id: string) => {
    const response = await apiClient.get(`/students/${id}/dashboard`);
    return response.data;
  }
};
