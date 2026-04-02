import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
<<<<<<< HEAD
=======
import { FiExternalLink, FiDownload } from "react-icons/fi";
>>>>>>> member2-materials

const MaterialApproval = () => {
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();

  const fetchPending = async () => {
    const res = await API.get("/materials/pending");
    setMaterials(res.data);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id) => {
    await API.put(`/materials/approve/${id}`);
    fetchPending();
  };

  const reject = async (id) => {
    await API.put(`/materials/reject/${id}`);
    fetchPending();
  };

<<<<<<< HEAD
  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }
    await API.delete(`/materials/${id}`);
    fetchPending();
  };

  return (
    <div className="app-page p-10 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-[var(--app-text)]">Material Approval</h2>

      <button onClick={() => navigate("/materials-delete")} className="app-surface-soft mb-6 px-4 py-2 rounded">
        Go to Delete Page
      </button>

      {materials.map((m) => (
        <div key={m._id} className="app-surface p-5 rounded mb-4">
          <h3 className="text-amber-400">{m.module}</h3>

          <div className="flex gap-3 mt-3">
            <button onClick={() => approve(m._id)} className="bg-green-500 px-4 py-2 rounded">
              Approve
            </button>

            <button onClick={() => reject(m._id)} className="bg-red-500 px-4 py-2 rounded">
              Reject
            </button>

            <button onClick={() => remove(m._id)} className="bg-red-700 px-4 py-2 rounded">
              Delete
            </button>
          </div>
        </div>
      ))}
=======
  return (
    <div className="p-10 text-white bg-[#0a0d17] min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Material Approval</h2>

      {/* NAV BUTTON */}
      <button
        onClick={() => navigate("/materials-delete")}
        className="mb-6 bg-blue-600 px-4 py-2 rounded"
      >
        Go to Delete Page
      </button>

      {materials.length === 0 ? (
        <p className="text-gray-400">No pending materials</p>
      ) : (
        materials.map((m) => (
          <div
            key={m._id}
            className="bg-[#1a1d2a] p-5 rounded mb-4 border border-white/10"
          >
            <h3 className="text-amber-400 text-lg font-semibold">{m.module}</h3>

            <p className="text-sm text-gray-300">
              {m.faculty} | {m.year} | {m.semester} | {m.specialization}
            </p>

            {/* VIEW + DOWNLOAD */}
            <div className="flex gap-3 mt-4 flex-wrap">
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
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 mt-4 flex-wrap">
              <button
                onClick={() => approve(m._id)}
                className="bg-green-500 px-4 py-2 rounded"
              >
                Approve
              </button>

              <button
                onClick={() => reject(m._id)}
                className="bg-red-500 px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
>>>>>>> member2-materials
    </div>
  );
};

export default MaterialApproval;
