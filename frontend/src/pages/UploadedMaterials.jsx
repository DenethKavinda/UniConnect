import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiDownload, FiExternalLink } from "react-icons/fi";

const UploadedMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/materials");
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filtered = materials.filter((m) =>
    Object.keys(filters).every((key) =>
      filters[key] ? m[key] === filters[key] : true,
    ),
  );

  return (
    <div className="p-10 bg-[#0a0d17] min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/materials"
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
        >
          <FiArrowLeft size={24} /> Back to Upload
        </Link>
        <h2 className="text-3xl font-bold">Uploaded Materials</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <select
          name="faculty"
          onChange={handleFilter}
          className="bg-[#1a1d2a] border border-white/20 rounded p-2 text-white"
        >
          <option value="">Faculty</option>
          <option>Computing</option>
          <option>Business</option>
          <option>Engineering</option>
          <option>Science</option>
        </select>

        <select
          name="year"
          onChange={handleFilter}
          className="bg-[#1a1d2a] border border-white/20 rounded p-2 text-white"
        >
          <option value="">Year</option>
          <option>Year 1</option>
          <option>Year 2</option>
          <option>Year 3</option>
          <option>Year 4</option>
        </select>

        <select
          name="semester"
          onChange={handleFilter}
          className="bg-[#1a1d2a] border border-white/20 rounded p-2 text-white"
        >
          <option value="">Semester</option>
          <option>Semester 1</option>
          <option>Semester 2</option>
        </select>

        <select
          name="specialization"
          onChange={handleFilter}
          className="bg-[#1a1d2a] border border-white/20 rounded p-2 text-white"
        >
          <option value="">Specialization</option>
          <option>Software Engineering</option>
          <option>Data Science</option>
          <option>Cyber Security</option>
          <option>Information Systems</option>
        </select>

        <select
          name="module"
          onChange={handleFilter}
          className="bg-[#1a1d2a] border border-white/20 rounded p-2 text-white"
        >
          <option value="">Module</option>
          <option>Database Systems</option>
          <option>Web Development</option>
          <option>Machine Learning</option>
          <option>Networking</option>
        </select>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((m) => (
          <div
            key={m._id}
            className="bg-[#1a1d2a] p-6 rounded-2xl shadow-lg border border-white/10 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl text-amber-400">{m.module}</h3>
              <span className="text-sm text-slate-400">{m.faculty}</span>
            </div>

            <p className="text-sm text-slate-300">
              Year: {m.year} | Semester: {m.semester} | Specialization:{" "}
              {m.specialization}
            </p>

            <div className="flex gap-4">
              <a
                href={`http://localhost:5000/api/materials/file/${m.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-amber-500/80 hover:bg-amber-500 text-[#0a0d17] font-bold px-4 py-2 rounded transition-all"
              >
                <FiExternalLink /> View
              </a>

              <a
                href={`http://localhost:5000/api/materials/file/${m.fileUrl}`}
                download
                className="flex items-center gap-2 bg-blue-500/80 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded transition-all"
              >
                <FiDownload /> Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadedMaterials;
