import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import { FiArrowLeft, FiDownload, FiExternalLink, FiTrash2 } from "react-icons/fi";
=======
import {
  FiArrowLeft,
  FiDownload,
  FiExternalLink,
  FiTrash2,
} from "react-icons/fi";
>>>>>>> member2-materials

const UploadedMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState({
    faculty: "",
    year: "",
    semester: "",
    specialization: "",
    module: "",
  });

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

<<<<<<< HEAD
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
    Object.keys(filters).every((key) => (filters[key] ? m[key] === filters[key] : true)),
=======
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };

    // Reset dependent filters
    if (name === "faculty") {
      updatedFilters.year = "";
      updatedFilters.semester = "";
      updatedFilters.specialization = "";
      updatedFilters.module = "";
    } else if (name === "year") {
      updatedFilters.semester = "";
      updatedFilters.specialization = "";
      updatedFilters.module = "";
    } else if (name === "semester") {
      updatedFilters.specialization = "";
      updatedFilters.module = "";
    } else if (name === "specialization") {
      updatedFilters.module = "";
    }

    setFilters(updatedFilters);
  };

  // Get relevant options based on previous selections
  const getOptions = (field) => {
    let filtered = materials;

    if (field === "year") {
      if (filters.faculty)
        filtered = filtered.filter((m) => m.faculty === filters.faculty);
    } else if (field === "semester") {
      if (filters.faculty)
        filtered = filtered.filter((m) => m.faculty === filters.faculty);
      if (filters.year)
        filtered = filtered.filter((m) => m.year === filters.year);
    } else if (field === "specialization") {
      if (filters.faculty)
        filtered = filtered.filter((m) => m.faculty === filters.faculty);
      if (filters.year)
        filtered = filtered.filter((m) => m.year === filters.year);
      if (filters.semester)
        filtered = filtered.filter((m) => m.semester === filters.semester);
    } else if (field === "module") {
      if (filters.faculty)
        filtered = filtered.filter((m) => m.faculty === filters.faculty);
      if (filters.year)
        filtered = filtered.filter((m) => m.year === filters.year);
      if (filters.semester)
        filtered = filtered.filter((m) => m.semester === filters.semester);
      if (filters.specialization)
        filtered = filtered.filter(
          (m) => m.specialization === filters.specialization,
        );
    }

    const optionsSet = new Set(filtered.map((m) => m[field]));
    return Array.from(optionsSet);
  };

  const filteredMaterials = materials.filter((m) =>
    Object.keys(filters).every((key) =>
      filters[key] ? m[key] === filters[key] : true,
    ),
>>>>>>> member2-materials
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/materials/${id}`);
      fetchMaterials();
    } catch (err) {
      console.error(err);
    }
  };

  return (
<<<<<<< HEAD
    <div className="app-page p-10 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <Link to="/materials" className="flex items-center gap-2 text-amber-400">
=======
    <div className="p-10 bg-[#0a0d17] min-h-screen text-white">
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/materials"
          className="flex items-center gap-2 text-amber-400"
        >
>>>>>>> member2-materials
          <FiArrowLeft size={24} /> Back
        </Link>
        <h2 className="text-3xl font-bold">Uploaded Materials</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
<<<<<<< HEAD
        {["faculty", "year", "semester", "specialization", "module"].map((field) => (
          <select
            key={field}
            name={field}
            onChange={handleFilter}
            className="app-input rounded p-2"
          >
            <option value="">{field}</option>
          </select>
        ))}
=======
        <select
          name="faculty"
          value={filters.faculty}
          onChange={handleFilterChange}
          className="bg-[#1a1d2a] border border-white/20 rounded p-2 text-white"
        >
          <option value="">Faculty</option>
          {getOptions("faculty").map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <select
          name="year"
          value={filters.year}
          onChange={handleFilterChange}
          className="bg-[#1a1d2a] border border-white/20 rounded p-2 text-white"
        >
          <option value="">Year</option>
          {getOptions("year").map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          name="semester"
          value={filters.semester}
          onChange={handleFilterChange}
          className="bg-[#1a1d2a] border border-white/20 rounded p-2 text-white"
        >
          <option value="">Semester</option>
          {getOptions("semester").map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          name="specialization"
          value={filters.specialization}
          onChange={handleFilterChange}
          className="bg-[#1a1d2a] border border-white/20 rounded p-2 text-white"
        >
          <option value="">Specialization</option>
          {getOptions("specialization").map((sp) => (
            <option key={sp} value={sp}>
              {sp}
            </option>
          ))}
        </select>

        <select
          name="module"
          value={filters.module}
          onChange={handleFilterChange}
          className="bg-[#1a1d2a] border border-white/20 rounded p-2 text-white"
        >
          <option value="">Module</option>
          {getOptions("module").map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
>>>>>>> member2-materials
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<<<<<<< HEAD
        {filtered.map((m) => (
          <div key={m._id} className="app-surface p-6 rounded-2xl flex flex-col gap-4">
=======
        {filteredMaterials.map((m) => (
          <div
            key={m._id}
            className="bg-[#1a1d2a] p-6 rounded-2xl border flex flex-col gap-4"
          >
>>>>>>> member2-materials
            <h3 className="text-xl text-amber-400">{m.module}</h3>
            <p className="text-sm text-gray-300">
              {m.faculty} | {m.year} | {m.semester} | {m.specialization}
            </p>

            <div className="flex gap-3 flex-wrap">
              <a
                href={`http://localhost:5000/api/materials/file/${m.fileUrl}`}
                target="_blank"
                rel="noreferrer"
<<<<<<< HEAD
                className="app-btn-primary px-3 py-2 rounded flex items-center gap-2"
=======
                className="bg-amber-500 px-3 py-2 rounded flex items-center gap-2"
>>>>>>> member2-materials
              >
                <FiExternalLink /> View
              </a>

              <a
                href={`http://localhost:5000/api/materials/file/${m.fileUrl}`}
                download
<<<<<<< HEAD
                className="app-surface-soft px-3 py-2 rounded flex items-center gap-2"
=======
                className="bg-blue-500 px-3 py-2 rounded flex items-center gap-2"
>>>>>>> member2-materials
              >
                <FiDownload /> Download
              </a>

<<<<<<< HEAD
              <button onClick={() => handleDelete(m._id)} className="bg-red-600 px-3 py-2 rounded flex items-center gap-2">
=======
              <button
                onClick={() => handleDelete(m._id)}
                className="bg-red-600 px-3 py-2 rounded flex items-center gap-2"
              >
>>>>>>> member2-materials
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
