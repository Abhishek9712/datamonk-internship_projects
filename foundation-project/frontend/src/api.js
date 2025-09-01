const BASE = 'http://localhost:5000/api';

export const listFiles = async () => {
  try {
    const response = await fetch(`${BASE}/files`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

export const uploadFile = async (file) => {
  try {
    const form = new FormData();
    form.append('file', file);
    
    const response = await fetch(`${BASE}/upload`, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (id) => {
  try {
    const response = await fetch(`${BASE}/delete/${id}`, { 
      method: 'DELETE' 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const downloadFile = async (id) => {
  try {
    const response = await fetch(`${BASE}/download/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response; // Return response for blob handling
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};
