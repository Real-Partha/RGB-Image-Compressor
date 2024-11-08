// App.jsx
import React, { useState } from "react";
import "./App.css";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiDownload, FiUpload } from "react-icons/fi";

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [quality, setQuality] = useState(10);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      setError("Maximum 5 images can be selected");
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCompress = async () => {
    setLoading(true);
    setError(null);
    const compressedResults = [];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quality_factor", quality);

      try {
        const response = await fetch("http://localhost:8000/compress", {
          method: "POST",
          body: formData,
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const compressedImageBase64 = await arrayBufferToBase64(
          data.compressed_image.data
        );
        compressedResults.push({
          ...data,
          originalFile: file,
          compressed_image_base64: compressedImageBase64,
        });
      } catch (error) {
        setError(error.message);
      }
    }

    setResults(compressedResults);
    setLoading(false);
  };

  // Helper function to convert array buffer to base64
  const arrayBufferToBase64 = (buffer) => {
    return new Promise((resolve, reject) => {
      try {
        const binary = new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        );
        resolve(btoa(binary));
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Image Compression Studio</h1>

        <motion.div className="upload-section" whileHover={{ scale: 1.02 }}>
          <label className="upload-label">
            <FiUpload size={24} />
            <span>Select Images (Max 5)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden-input"
            />
          </label>
        </motion.div>

        <div className="quality-slider">
          <label>Compression Quality</label>
          <input
            type="range"
            min="1"
            max="50"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
          />
          <span>{quality}</span>
        </div>

        <div className="selected-images">
          <AnimatePresence>
            {selectedFiles.map((file, index) => (
              <motion.div
                key={index}
                className="image-preview-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  className="image-preview"
                />
                <button
                  className="remove-button"
                  onClick={() => removeFile(index)}
                >
                  <FiX />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <motion.button
          className="compress-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={selectedFiles.length === 0 || loading}
          onClick={handleCompress}
        >
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Compressing...</span>
            </div>
          ) : (
            "Compress Images"
          )}
        </motion.button>

        <div className="results-grid">
          {results.map((result, index) => (
            <motion.div
              key={index}
              className="result-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="image-comparison">
                <div className="original-image">
                  <h4>Original</h4>
                  <img
                    src={URL.createObjectURL(result.originalFile)}
                    alt="Original"
                  />
                  <div className="image-stats">
                    <span>
                      Original Size: {(result.original_size / 1024).toFixed(2)}{" "}
                      KB
                    </span>
                  </div>
                </div>

                <div className="compressed-image">
                  <h4>Compressed</h4>
                  <div className="image-wrapper">
                    <img
                      src={`data:image/jpeg;base64,${result.compressed_image_base64}`}
                      alt="Compressed"
                    />
                    <motion.button
                      className="download-button"
                      whileHover={{ scale: 1.1 }}
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = `data:image/jpeg;base64,${result.compressed_image_base64}`;
                        link.download = `compressed_${result.originalFile.name}`;
                        link.click();
                      }}
                    >
                      <FiDownload />
                    </motion.button>
                  </div>
                  <div className="compression-details">
                    <h5>Compression Analysis</h5>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-label">Compressed Size</span>
                        <span className="stat-value">
                          {(result.compressed_size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Compression Ratio</span>
                        <span className="stat-value">
                          {result.compression_ratio.toFixed(2)}x
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Space Saved</span>
                        <span className="stat-value">
                          {(
                            ((result.original_size - result.compressed_size) /
                              result.original_size) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Quality Setting</span>
                        <span className="stat-value">{quality}/50</span>
                      </div>
                    </div>
                    <div className="compression-chart">
                      <div
                        style={{
                          width: "100%",
                          height: "20px",
                          background: "#e2e8f0",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${
                              (result.compressed_size / result.original_size) *
                              100
                            }%`,
                            height: "100%",
                            background:
                              "linear-gradient(to right, var(--primary-color), var(--secondary-color))",
                            transition: "width 0.5s ease-in-out",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: "0.5rem",
                          fontSize: "0.875rem",
                          color: "#64748b",
                        }}
                      >
                        Size Reduction Visualization
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
