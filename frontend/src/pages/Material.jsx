import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiHome, FiUpload, FiEye } from "react-icons/fi";

const Material = () => {
  const [formData, setFormData] = useState({
    faculty: "",
    year: "",
    semester: "",
    specialization: "",
    module: "",
    file: null,
  });

  const handleChange = (e) => {
    if (e.target.name === "file") {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    try {
      await axios.post("http://localhost:5000/api/materials/upload", data);
      alert("Uploaded Successfully");
      setFormData({
        faculty: "",
        year: "",
        semester: "",
        specialization: "",
        module: "",
        file: null,
      });
    } catch (err) {
      console.error(err);
      alert("Upload Failed");
    }
  };

  const selectClass =
    "w-full p-3 rounded-lg bg-[#1a1f2e] text-white border border-gray-600 focus:border-blue-500 focus:outline-none";
  const inputClass =
    "w-full p-3 rounded-lg bg-[#1a1f2e] text-white border border-gray-600 focus:border-blue-500 focus:outline-none";
  const buttonClass =
    "bg-blue-500 hover:bg-blue-600 transition-colors px-6 py-3 rounded-lg flex items-center gap-2 font-bold";

  return (
    <div className="p-10 text-white bg-[#0a0d17] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <Link
          to="/"
          className="text-blue-400 hover:text-blue-500 transition-colors"
        >
          <FiHome size={28} />
        </Link>

        <Link
          to="/uploaded-materials"
          className="flex items-center gap-2 text-amber-400 hover:text-amber-500 transition-colors font-medium"
        >
          <FiEye /> View Uploads
        </Link>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold mb-8">Upload Materials</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <select
            name="faculty"
            value={formData.faculty}
            onChange={handleChange}
            required
            className={selectClass}
          >
            <option value="">Select Faculty</option>
            <option>Computing</option>
            <option>Business</option>
            <option>Engineering</option>
            <option>Science</option>
          </select>

          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            className={selectClass}
          >
            <option value="">Academic Year</option>
            <option>Year 1</option>
            <option>Year 2</option>
            <option>Year 3</option>
            <option>Year 4</option>
          </select>

          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
            className={selectClass}
          >
            <option value="">Semester</option>
            <option>Semester 1</option>
            <option>Semester 2</option>
          </select>

          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
            className={selectClass}
          >
            <option value="">Specialization</option>
            <option>Software Engineering</option>
            <option>Data Science</option>
            <option>Cyber Security</option>
            <option>Information Systems</option>
          </select>

          <select
            name="module"
            value={formData.module}
            onChange={handleChange}
            required
            className={selectClass}
          >
            <option value="">Module</option>
            <option>Database Systems</option>
            <option>Web Development</option>
            <option>Machine Learning</option>
            <option>Networking</option>
          </select>

          <input
            type="file"
            name="file"
            onChange={handleChange}
            required
            className={inputClass}
          />

          <button type="submit" className={buttonClass}>
            <FiUpload /> Upload
          </button>
        </form>

        <div className="bg-[#1a1f2e] p-6 rounded-2xl flex flex-col shadow-lg border border-gray-700">
          <h3 className="text-2xl font-extrabold mb-6 text-amber-400 animate-pulse">
            💡 Tips for Uploading
          </h3>
          <ul className="space-y-4 w-full">
            {[
              "Select correct Faculty, Year, Semester, Specialization, and Module.",
              "Ensure the document is properly named.",
              "Allowed formats: PDF, DOCX, PPTX.",
              "After upload, you can view it in Uploaded Materials.",
            ].map((tip, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-600/20 to-amber-500/10 hover:from-blue-500/30 hover:to-amber-400/20 transition-all duration-500 group cursor-pointer"
              >
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-amber-400 text-[#0a0d17] font-bold animate-pulse">
                  {idx + 1}
                </span>
                <p className="text-white font-medium text-sm group-hover:text-amber-300 transition-colors">
                  {tip}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Material;
