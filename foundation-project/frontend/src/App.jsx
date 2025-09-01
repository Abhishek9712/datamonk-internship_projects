import React, { useEffect, useState } from 'react';
import { listFiles, uploadFile, deleteFile, downloadFile } from './api';
import './styles.css';

export default function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fileList = await listFiles();
      setFiles(fileList);
    } catch (err) {
      setError('Failed to load files: ' + err.message);
      console.error('Fetch files error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
    clearMessages();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    try {
      setUploading(true);
      clearMessages();
      
      const result = await uploadFile(selectedFile);
      
      // Reset form
      const fileName = selectedFile.name;
      setSelectedFile(null);
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
      // Refresh file list
      await fetchFiles();
      
      setSuccess(`File "${fileName}" uploaded successfully!`);
      
    } catch (err) {
      setError('Upload failed: ' + err.message);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Are you sure you want to delete "${file.filename}"?`)) {
      return;
    }

    try {
      clearMessages();
      await deleteFile(file.id);
      await fetchFiles(); // Refresh file list
      setSuccess(`File "${file.filename}" deleted successfully!`);
    } catch (err) {
      setError('Delete failed: ' + err.message);
      console.error('Delete error:', err);
    }
  };

  const handleDownload = async (file) => {
    try {
      clearMessages();
      const response = await downloadFile(file.id);
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('Download failed: ' + err.message);
      console.error('Download error:', err);
    }
  };

  return (
    <div className="container">
      <h1>Google Drive Clone</h1>

      {/* Success Message */}
      {success && (
        <div className="success-message">
          {success}
          <button className="close-btn" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button className="close-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Upload Section */}
      <div className="upload-section">
        <input 
          id="file-input" 
          type="file" 
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {/* Files Section */}
      <div className="files-section">
        <h2>Your Files</h2>
        
        {loading ? (
          <div className="loading">Loading files...</div>
        ) : (
          <ul className="file-list">
            {files.length > 0 ? (
              files.map((file) => (
                <li key={file.id} className="file-item">
                  <span className="filename">{file.filename}</span>
                  <div className="file-actions">
                    <button onClick={() => handleDownload(file)}>
                      Download
                    </button>
                    <button 
                      onClick={() => handleDelete(file)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="no-files">No files uploaded yet</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
