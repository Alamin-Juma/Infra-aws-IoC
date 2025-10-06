import React, { useState } from "react";
import axios from "axios";

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [message, setMessage] = useState("");


  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      setMessage("Please upload a valid CSV file.");
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").map((row) => row.split(","));
      setPreview(rows.slice(1, 6)); // Show first 5 rows
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("No file selected!");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/doc/uploadCSV`, formData, {


        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setMessage(response.data.message || "File uploaded successfully!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error uploading file!");
    }
  };
  

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Upload Users via CSV</h2>

      <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-100 border border-dashed border-gray-400 rounded-lg cursor-pointer">
        <span className="text-gray-600">Drag & Drop or Click to Upload</span>
        <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      </label>

      {preview.length > 0 && (
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-2 py-1">First Name</th>
              <th className="border border-gray-300 px-2 py-1">Last Name</th>
              <th className="border border-gray-300 px-2 py-1">Email</th>
              <th className="border border-gray-300 px-2 py-1">roleId</th>
              <th className="border border-gray-300 px-2 py-1">password</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((row, index) => (
              <tr key={index} className="text-gray-700">
                <td className="border border-gray-300 px-2 py-1">{row[0]}</td>
                <td className="border border-gray-300 px-2 py-1">{row[1]}</td>
                <td className="border border-gray-300 px-2 py-1">{row[2]}</td>
                <td className="border border-gray-300 px-2 py-1">{row[3]}</td>
                <td className="border border-gray-300 px-2 py-1">{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={handleUpload}
        className="w-full mt-4 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition"
      >
        Upload
      </button>

      {message && <p className="mt-3 text-center text-gray-700">{message}</p>}
    </div>
  );
};

export default UploadCSV;
