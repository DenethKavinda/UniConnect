import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiDownload,
  FiExternalLink,
  FiTrash2,
} from "react-icons/fi";

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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/materials/${id}`);
      fetchMaterials();
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
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/materials"
          className="flex items-center gap-2 text-amber-400"
        >
          <FiArrowLeft size={24} /> Back
        </Link>
        <h2 className="text-3xl font-bold">Uploaded Materials</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {["faculty", "year", "semester", "specialization", "module"].map(
          (field) => (
            <select
              key={field}
              name={field}
              onChange={handleFilter}
              className="bg-[#1a1d2a] border border-white/20 rounded p-2 text-white"
            >
              <option value="">{field}</option>
            </select>
          ),
        )}
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((m) => (
          <div
            key={m._id}
            className="bg-[#1a1d2a] p-6 rounded-2xl border flex flex-col gap-4"
          >
            <h3 className="text-xl text-amber-400">{m.module}</h3>
            <p className="text-sm text-gray-300">
              {m.faculty} | {m.year} | {m.semester} | {m.specialization}
            </p>

            <div className="flex gap-3 flex-wrap">
              <a
                href={`http://localhost:5000/api/materials/file/${m.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="bg-amber-500 px-3 py-2 rounded flex items-center gap-2"
              >
                <FiExternalLink /> View
              </a>

              <a
                href={`http://localhost:5000/api/materials/file/${m.fileUrl}`}
                download
                className="bg-blue-500 px-3 py-2 rounded flex items-center gap-2"
              >
                <FiDownload /> Download
              </a>

              <button
                onClick={() => handleDelete(m._id)}
                className="bg-red-600 px-3 py-2 rounded flex items-center gap-2"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadedMaterials;
