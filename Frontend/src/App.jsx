import React, { useState } from "react";
import "./App.css";
import UploadSection from "./UploadSection";
import ResultsSection from "./ResultsSection";

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [quality, setQuality] = useState(10);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({});
  const [showUploadSection, setShowUploadSection] = useState(true);

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
    setShowUploadSection(false);
    setSelectedFiles([]);
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

  const handleCompressMore = () => {
    setShowUploadSection(true);
    setResults([]);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Image Compression Studio</h1>

        {showUploadSection ? (
          <UploadSection
            selectedFiles={selectedFiles}
            quality={quality}
            loading={loading}
            error={error}
            progress={progress}
            onFileSelect={handleFileSelect}
            onQualityChange={setQuality}
            onRemoveFile={removeFile}
            onCompress={handleCompress}
          />
        ) : (
          <ResultsSection
            results={results}
            quality={quality}
            onCompressMore={handleCompressMore}
          />
        )}
      </header>
    </div>
  );
}

export default App;
