import React, { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFiles = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      pages: Math.floor(Math.random() * 300) + 1,
      words: Math.floor(Math.random() * 200000) + 1000,
      status: "Processing",
    }));

    setFiles((prev) => [...newFiles, ...prev]);

    // simulate processing
    newFiles.forEach((f) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((p) => (p.id === f.id ? { ...p, status: "Processed" } : p))
        );
      }, 2000);
    });
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, []);

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedFiles = filteredFiles.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const deleteFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };
  const [isOpen, setIsOpen] = useState(false);

  const FileUploadModal = () => {
    return (
      isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Upload Files
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-purple-500 transition"
            >
              <div className="w-28 h-28 mb-4">
                <img
                  src="/icons/upload-file.svg"
                  alt="upload"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-dark font-medium text-center">
                Drag your book file here to start uploading
              </p>
              <span className="text-gray-400 my-5">OR</span>
              <label className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium cursor-pointer">
                + Browse files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.epub,.mobi"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
              <p className="text-xs text-gray-400 my-4">
                Supported file types: pdf, epub, mobi
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )
    );
  };

  return (
    <Layout>
      <div className=" min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto gap-6">
          <FileUploadModal />
          {/* Files Table */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
              <h2 className="text-lg font-semibold text-gray-800">File</h2>
              <button
                onClick={() => setIsOpen(true)}
                className="bg-purple-900 text-white py-[10px] px-[16px] flex align-center gap-2 rounded-lg text-sm"
              >
                <img src="/icons/ic-upload.svg" className="text-white" />
                Upload
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-start">File</th>
                    <th className="p-3 text-start">Status</th>
                    <th className="p-3 text-start">Pages</th>
                    <th className="p-3 text-start">Words</th>
                    <th className="p-3 text-start">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFiles.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-400">
                        No files uploaded
                      </td>
                    </tr>
                  )}
                  {paginatedFiles.map((file) => (
                    <tr key={file.id} className="border-b">
                      <td className="p-3 flex items-center gap-2">
                        <span className="text-red-500 font-semibold">
                          <img src="/icons/pdf.svg" />
                        </span>
                        {file.name}
                      </td>
                      <td className="p-3">
                        <div>
                          <p
                            className={`px-3 py-1 flex align-items-center justify-center gap-2 w-[100px] rounded-full text-xs font-medium ${
                              file.status === "Processed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            <img src="/icons/tick.svg" />
                            {file.status}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">{file.pages}</td>
                      <td className="p-3">{file.words.toLocaleString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="text-red-500 hover:underline"
                        >
                          <img src="/icons/ic-bin" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FileUpload;
