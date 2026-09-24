import api from './api.js';

// Get all files from ImageKit
export const getAllFiles = async () => {
  const response = await api.get('/api/imagekit/files');
  return response.data;
};

// Get only cake images
export const getCakeImages = async () => {
  const allFiles = await getAllFiles();
  return allFiles.filter(file => 
    file.filePath && file.filePath.toLowerCase().includes('cakes')
  );
};

// Get file by ID
export const getFileById = async (fileId) => {
  const response = await api.get(`/api/imagekit/files/${fileId}`);
  return response.data;
};

// Sync files from ImageKit (admin only)
export const syncFiles = async () => {
  const response = await api.post('/api/imagekit/sync');
  return response.data;
};

// Get total file count
export const getFileCount = async () => {
  const response = await api.get('/api/imagekit/count');
  return response.data;
};
