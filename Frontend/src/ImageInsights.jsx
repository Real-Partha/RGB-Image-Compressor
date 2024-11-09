import React, { useState } from "react";
import "./App.css";
import { motion, AnimatePresence } from "framer-motion";
import { FiInfo } from "react-icons/fi";
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

export default ImageInsights;
