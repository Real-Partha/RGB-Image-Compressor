import React, { useState } from "react";
import "./App.css";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiDownload, FiUpload, FiImage, FiInfo } from "react-icons/fi";
import { BiImageAlt, BiColorFill } from "react-icons/bi";
import { MdHighQuality } from "react-icons/md";

const ImageInsights = ({ result, file, quality, type }) => {
  const [imageDetails, setImageDetails] = useState(null);

  React.useEffect(() => {
    // Combine backend and frontend data
    const getDetails = async () => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => (img.onload = resolve));

      setImageDetails({
        width: img.width,
        height: img.height,
        aspectRatio: (img.width / img.height).toFixed(2),
        fileType: file.type,
        fileName: file.name,
        ...result.image_analysis,
      });
    };

    getDetails();
  }, [file, result]);

  if (type === "original")
    return (
      <div className="image-insights">
        <motion.div
          className="insights-header"
          onClick={() => setImageDetails(!imageDetails)}
          style={{ cursor: "pointer" }}
        >
          <h5>
            <FiInfo style={{ marginRight: "8px" }} />
            Image Analysis & Insights
          </h5>
        </motion.div>

        <AnimatePresence>
          {imageDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="insights-grid">
                <div className="insight-item full-width">
                  <BiImageAlt className="insight-icon" />
                  <span className="insight-label">Dimensions</span>
                  <span className="insight-value">
                    {imageDetails.width} x {imageDetails.height}
                  </span>
                </div>

                <div className="insight-item full-width">
                  <MdHighQuality className="insight-icon" />
                  <span className="insight-label">Aspect Ratio</span>
                  <span className="insight-value">
                    {imageDetails.aspectRatio}
                  </span>
                </div>

                <div className="insight-item full-width">
                  <MdHighQuality className="insight-icon" />
                  <span className="insight-label">Color Mode</span>
                  <span className="insight-value">
                    {imageDetails.color_mode}
                  </span>
                </div>

                <div className="insight-item full-width">
                  <BiColorFill className="insight-icon" />
                  <span className="insight-label">Format</span>
                  <span className="insight-value">
                    {imageDetails.fileType.split("/")[1].toUpperCase()}
                  </span>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );

  if (type === "compressed")
    return (
      <div className="image-insights">
        <motion.div
          className="insights-header"
          onClick={() => setShowDetails(!showDetails)}
          style={{ cursor: "pointer" }}
        >
          <h5>
            <FiInfo style={{ marginRight: "8px" }} />
            Image Analysis & Insights
          </h5>
        </motion.div>

        <AnimatePresence>
          {imageDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="insights-grid">
                <div className="insight-item full-width">
                  <span className="insight-label">Size Reduction</span>
                  <div className="`reduction-bar-container`">
                    <div className="reduction-bar">
                      <motion.div
                        className="reduction-fill"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            ((result.original_size - result.compressed_size) /
                              result.original_size) *
                            100
                          }%`,
                        }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <span className="reduction-value">
                      {(
                        ((result.original_size - result.compressed_size) /
                          result.original_size) *
                        100
                      ).toFixed(1)}
                      % smaller
                    </span>
                  </div>
                </div>

                <div className="insight-item full-width">
                  <span className="insight-label">Compression Performance</span>
                  <div className="performance-metrics">
                    <div className="metric">
                      <span className="metric-label">Speed</span>
                      <div className="metric-bar">
                        <motion.div
                          className="metric-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${(quality / 50) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Quality</span>
                      <div className="metric-bar">
                        <motion.div
                          className="metric-fill"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              100 -
                              (result.compressed_size / result.original_size) *
                                100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
};

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [quality, setQuality] = useState(10);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({});

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

  const ProgressIndicator = ({ fileName, progress }) => (
    <div className="progress-indicator">
      <span className="filename">{fileName}</span>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      <span className="progress-text">{progress}%</span>
    </div>
  );

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

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line) continue;
            const data = JSON.parse(line);

            if (data.status === "error") {
              setError(`Error processing ${file.name}: ${data.message}`);
              continue;
            }

            if (data.status !== "completed") {
              setProgress((prev) => ({
                ...prev,
                [file.name]: data.progress,
              }));
              continue;
            }

            const compressedImageBase64 = await arrayBufferToBase64(
              data.compressed_image.data
            );
            compressedResults.push({
              ...data,
              originalFile: file,
              compressed_image_base64: compressedImageBase64,
            });
          }
        }
      } catch (error) {
        setError(`Error processing ${file.name}: ${error.message}`);
      }
    }

    setResults(compressedResults);
    setLoading(false);
    setProgress({});
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
        {Object.entries(progress).length > 0 && (
          <div className="progress-container">
            {Object.entries(progress).map(([fileName, progress]) => (
              <ProgressIndicator
                key={fileName}
                fileName={fileName}
                progress={progress}
              />
            ))}
          </div>
        )}
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
                  {/* Add ImageInsights for original image */}
                  <ImageInsights
                    result={{
                      original_size: result.original_size,
                      image_analysis: result.image_analysis,
                    }}
                    file={result.originalFile}
                    quality={quality}
                    type="original"
                  />
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
                  <div className="image-stats">
                    <span>
                      Compressed Size:{" "}
                      {(result.compressed_size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  {/* Add ImageInsights for compressed image */}
                  <ImageInsights
                    result={result}
                    file={result.originalFile}
                    quality={quality}
                    type="compressed"
                  />
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
