import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiExternalLink, FiDownload } from "react-icons/fi";

const MaterialsDelete = () => {
  const [materials, setMaterials] = useState([]);

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
<<<<<<< HEAD
    if (!window.confirm("Are you sure you want to delete this document?")) return;
=======
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
>>>>>>> member2-materials
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
      <h2 className="text-3xl font-bold mb-6 text-[var(--app-text)]">Admin - Delete Uploaded Materials</h2>
=======
    <div className="p-10 bg-[#0a0d17] min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6">
        Admin - Delete Uploaded Materials
      </h2>
>>>>>>> member2-materials

      {materials.length === 0 ? (
        <p className="text-gray-400">No uploaded materials</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.map((m) => (
<<<<<<< HEAD
            <div key={m._id} className="app-surface p-6 rounded-2xl flex flex-col gap-4">
=======
            <div
              key={m._id}
              className="bg-[#1a1d2a] p-6 rounded-2xl border flex flex-col gap-4"
            >
>>>>>>> member2-materials
              <h3 className="text-xl text-amber-400">{m.module}</h3>
              <p className="text-sm text-gray-300">
                {m.faculty} | {m.year} | {m.semester} | {m.specialization}
              </p>
              <p className="text-sm text-green-400">Status: {m.status}</p>

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
      )}
    </div>
  );
};

export default MaterialsDelete;
