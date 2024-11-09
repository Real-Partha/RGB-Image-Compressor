import React from "react";
import { motion } from "framer-motion";
import { FiDownload } from "react-icons/fi";
import ImageInsights from "./ImageInsights";

const ResultsSection = ({ results, quality, onCompressMore }) => {
  return (
    <>
      <motion.button
        className="compress-button compress-more"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCompressMore}
      >
        Compress More Images
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
                    Original Size: {(result.original_size / 1024).toFixed(2)} KB
                  </span>
                </div>
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
                    Compressed Size: {(result.compressed_size / 1024).toFixed(2)} KB
                  </span>
                </div>
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
    </>
  );
};

export default ResultsSection;