import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPDF } from '../services/api';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setError('');
      setResult(null);
    } else {
      setError('Please select a valid PDF file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setUploadProgress(0);
    try {
      const res = await uploadPDF(file, (e) => {
        if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PDF MCQ Quiz</h1>
          <p className="text-gray-500 mt-2">Upload your question bank PDF to start</p>
        </div>

        <div className="card">
          {!result ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200
                  ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {file ? (
                  <div>
                    <p className="text-blue-600 font-semibold">{file.name}</p>
                    <p className="text-sm text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 font-medium">Drag & drop your PDF here</p>
                    <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Upload progress */}
              {uploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Uploading & parsing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn-primary w-full mt-5"
              >
                {uploading ? 'Processing...' : 'Upload & Parse Quiz'}
              </button>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {result.totalQuestions} Questions Found
              </h2>
              <p className="text-gray-500 mb-6">
                Your quiz is ready! Click below to start.
              </p>
              <button
                onClick={() => navigate('/quiz')}
                className="btn-success w-full text-lg py-4"
              >
                Start Quiz
              </button>
              <button
                onClick={() => { setFile(null); setResult(null); }}
                className="btn-secondary w-full mt-3"
              >
                Upload Different PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
