import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUpload } from "react-icons/fi";

const UploadSection = ({
  selectedFiles,
  quality,
  loading,
  error,
  progress,
  onFileSelect,
  onQualityChange,
  onRemoveFile,
  onCompress,
}) => {
  return (
    <>
      <motion.div className="upload-section" whileHover={{ scale: 1.02 }}>
        <label className="upload-label">
          <FiUpload size={24} />
          <span>Select Images (Max 5)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFileSelect}
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
          onChange={(e) => onQualityChange(parseInt(e.target.value))}
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
                onClick={() => onRemoveFile(index)}
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
        onClick={onCompress}
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
    </>
  );
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

export default UploadSection;