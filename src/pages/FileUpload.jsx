import React, { useCallback, useEffect, useRef, useState } from "react";
import Layout from "../components/Layout/Layout";
import API from "../services/api";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal";
import toast from "react-hot-toast";
import { apibase } from "../services/contants";

const FileUpload = () => {
  const [filePriview, setFile] = useState({});
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [openModal, setOpenMadal] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleFiles = async (selectedFiles) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFiles[0]);
      const res = await API.post("/admin/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(res?.data?.message);
      setFile(res.data?.data);
      setIsOpen(false);
      console.log("Upload success:", res.data);
    } catch (error) {
      toast.success(error?.response?.data?.message || error?.message);
      console.error("File upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    getFile();
  }, []);

  console.log("filePriview", filePriview);

  const getFile = async () => {
    try {
      const response = await API.get("/admin/file");
      setFile(response?.data?.data);
    } catch (error) {
      setFile();
      console.log(error);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await API.delete(`/admin/delete/file/${filePriview.id}`);
      // console.log(response);
      setLoading(false);
      getFile();
      toast.success(response?.data?.message);
      setOpenMadal(false);
      // setFile({});
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message || error?.message);
      console.log(error);
    }
  };

   useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuRef.current) return;
  
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
  
    document.addEventListener("click", handleClickOutside);
  
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
                {uploading ? (
                  "Loading..."
                ) : (
                  <>
                    + Browse files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </>
                )}
              </label>
              <p className="text-xs text-gray-400 my-4">
                Supported file types: pdf
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
                onClick={() => {
                  if (filePriview?.original_name || false) {
                    toast.error(
                      "Please delete the existing preview before uploading a new file."
                    );
                  } else {
                    setIsOpen(true);
                  }
                }}
                className="bg-purple-900 text-white py-[10px] px-[16px] flex align-center gap-2 rounded-lg text-sm"
              >
                <img src="/icons/ic-upload.svg" className="text-white" />
                Upload
              </button>
            </div>

            <div className="">
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
                  {!filePriview?.original_name ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-400">
                        No files uploaded
                      </td>
                    </tr>
                  ) : (
                    <tr key={filePriview?.id} className="border-b">
                      <td className="p-3 flex items-center gap-2">
                        <span className="text-red-500 font-semibold">
                          <img src="/icons/pdf.svg" />
                        </span>
                        {filePriview?.original_name}
                      </td>
                      <td className="p-3">
                        <div>
                          <p
                            className={`px-3 py-1 flex align-items-center justify-center gap-2 w-[100px] rounded-full text-xs font-medium ${
                              filePriview.status === 1
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            <img src="/icons/tick.svg" />
                            {filePriview.status == 1
                              ? "Processed"
                              : "Processing"}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">{filePriview.pages || "0"}</td>
                      <td className="p-3">{filePriview.words || "0"}</td>
                      <td className="p-3">
                        <div className="relative inline-block" ref={menuRef}>
                          {/* 3 dots */}
                          <button
                            onClick={() => setOpen(!open)}
                            className="text-gray-400 text-start hover:text-gray-700 text-xl"
                          >
                            ⋯
                          </button>

                          {/* Dropdown */}
                          {open && (
                            <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg z-50">
                              <button
                                onClick={() => {
                                  console.log("filePriview" ,filePriview);
                                  window.open(`${filePriview?.full_path}`, "_blank");
                                  
                                }}
                                className="w-full font-bold text-gray-600 flex align-center gap-2 px-4 py-2 hover:bg-red-50"
                              >
                                <img src="/icons/ic-veiw.svg" />
                                View
                              </button>
                              <button
                                onClick={() => setOpenMadal(true)}
                                className="w-full font-bold text-gray-600 flex align-center gap-2 px-4 py-2 hover:bg-red-50"
                              >
                                <img src="/icons/ic-bin.svg" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={openModal}
        onClose={() => setOpenMadal(false)}
        onConfirm={handleDelete}
        loading={loading}
      />
    </Layout>
  );
};

export default FileUpload;
