import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality_factor', quality);

    try {
      const response = await fetch('http://localhost:8000/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert the compressed image data to base64
      const compressedImageBase64 = await arrayBufferToBase64(data.compressed_image.data);
      setResult({
        ...data,
        compressed_image_base64: compressedImageBase64
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert array buffer to base64
  const arrayBufferToBase64 = (buffer) => {
    return new Promise((resolve, reject) => {
      try {
        const binary = new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        );
        resolve(btoa(binary));
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>RGB Image Compression</h1>
        {error && <div className="error-message">Error: {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Select Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          
          <div className="input-group">
            <label>Quality Factor (1-50):</label>
            <input
              type="number"
              min="1"
              max="50"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
            />
          </div>

          <button type="submit" disabled={!file || loading}>
            {loading ? 'Compressing...' : 'Compress Image'}
          </button>
        </form>

        {result && (
          <div className="results">
            <h2>Results</h2>
            <p>Original Size: {(result.original_size / 1024).toFixed(2)} KB</p>
            <p>Compressed Size: {(result.compressed_size / 1024).toFixed(2)} KB</p>
            <p>Compression Ratio: {result.compression_ratio.toFixed(2)}x</p>
            
            <div className="image-comparison">
              <div>
                <h3>Original Image</h3>
                {file && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Original"
                    style={{ maxWidth: '400px' }}
                  />
                )}
              </div>
              <div>
                <h3>Compressed Image</h3>
                {result.compressed_image_base64 && (
                  <img
                    src={`data:image/png;base64,${result.compressed_image_base64}`}
                    alt="Compressed"
                    style={{ maxWidth: '400px' }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;