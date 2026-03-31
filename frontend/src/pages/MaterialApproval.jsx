import React, { useEffect, useState } from "react";
import axios from "axios";

const MaterialApproval = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/materials/pending",
      );
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id) => {
    await axios.put(`http://localhost:5000/api/materials/approve/${id}`);
    fetchPending();
  };

  const reject = async (id) => {
    await axios.put(`http://localhost:5000/api/materials/reject/${id}`);
    fetchPending();
  };

  return (
    <div className="p-10 text-white bg-[#0a0d17] min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Material Approval</h2>

      {loading ? (
        <p>Loading...</p>
      ) : materials.length === 0 ? (
        <p className="text-gray-400">No pending materials</p>
      ) : (
        <div className="grid gap-6">
          {materials.map((m) => (
            <div key={m._id} className="bg-[#1a1d2a] p-5 rounded-xl border">
              <h3 className="text-xl text-amber-400">{m.module}</h3>

              <p>
                {m.faculty} | Year {m.year} | Sem {m.semester}
              </p>

              <div className="flex gap-3 mt-3">
                <a
                  href={`http://localhost:5000/api/materials/file/${m.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-500 px-4 py-2 rounded"
                >
                  View
                </a>

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
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialApproval;
