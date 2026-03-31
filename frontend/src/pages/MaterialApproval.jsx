import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

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

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }
    await API.delete(`/materials/${id}`);
    fetchPending();
  };

  return (
    <div className="p-10 text-white bg-[#0a0d17] min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Material Approval</h2>

      {/* ✅ NAV BUTTON */}
      <button
        onClick={() => navigate("/materials-delete")}
        className="mb-6 bg-blue-600 px-4 py-2 rounded"
      >
        Go to Delete Page
      </button>

      {materials.map((m) => (
        <div key={m._id} className="bg-[#1a1d2a] p-5 rounded mb-4">
          <h3 className="text-amber-400">{m.module}</h3>

          <div className="flex gap-3 mt-3">
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

            <button
              onClick={() => remove(m._id)}
              className="bg-red-700 px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterialApproval;
