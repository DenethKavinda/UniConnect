import React, { useState, useEffect } from "react";
import axios from "axios";

function UploadMaterial() {
  const [faculty, setFaculty] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);

  // Sample faculties & specializations
  const faculties = {
    "Faculty of Computing": [
      "Information Technology",
      "Artificial Intelligence",
      "Computer Systems & Network Engineering",
      "Software Engineering",
      "Information Systems Engineering",
      "Cyber Security",
      "Interactive Media",
      "Data Science",
      "Computer Science",
      "Computer Systems Engineering",
    ],
    "Faculty of Engineering": [
      "Civil Engineering",
      "Electrical & Electronic Engineering",
      "Mechanical Engineering",
      "Mechatronics",
      "Materials Engineering",
      "Quantity Surveying",
    ],
    "Faculty of Business": ["Management", "Marketing", "Finance", "Analytics", "Fashion Business & Management", "MBA"],
    "Faculty of Humanities & Sciences": ["Biotechnology", "Biomedical Science", "Psychology", "Financial Mathematics", "English", "Law", "Teacher Education", "Nursing"],
    "School of Architecture": ["Architecture", "Interior Design", "MSc Architecture"],
    "Hospitality & Culinary": ["Hospitality Management", "Commercial Cookery", "Event Management", "Patisserie", "Travel & Tourism Management"],
  };

  // Fetch uploaded materials from backend
  const fetchMaterials = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/materials");
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Handle form submit
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!faculty || !specialization || !title || !file) {
      alert("Please complete all required fields!");
      return;
    }

    const formData = new FormData();
    formData.append("faculty", faculty);
    formData.append("specialization", specialization);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/api/materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Material uploaded successfully!");
      // Reset form
      setFaculty("");
      setSpecialization("");
      setTitle("");
      setDescription("");
      setFile(null);
      // Refresh table
      fetchMaterials();
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    }
  };

  return (
    <div className="page">
      {/* ================= UPLOAD FORM ================= */}
      <div className="form-box">
        <h3>📤 Upload New Material</h3>

        <label>Faculty</label>
        <select value={faculty} onChange={(e) => { setFaculty(e.target.value); setSpecialization(""); }}>
          <option value="">Select Faculty</option>
          {Object.keys(faculties).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <label>Specialization</label>
        <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} disabled={!faculty}>
          <option value="">Select Specialization</option>
          {faculty && faculties[faculty].map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>

        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter material title" />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description (optional)"></textarea>

        <label>Select File</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button onClick={handleUpload}>Upload Material</button>
      </div>

      {/* ================= MATERIAL TABLE ================= */}
      <div className="material-table-container">
        <h3>📂 Uploaded Materials</h3>
        <table>
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Specialization</th>
              <th>Title</th>
              <th>Description</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((mat) => (
              <tr key={mat._id}>
                <td>{mat.faculty}</td>
                <td>{mat.specialization}</td>
                <td>{mat.title}</td>
                <td>{mat.description}</td>
                <td>
                  <a href={`http://localhost:5000/uploads/${mat.file}`} target="_blank" rel="noopener noreferrer">
                    <button>Download</button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UploadMaterial;
