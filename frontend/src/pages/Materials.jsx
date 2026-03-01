import React, { useEffect, useState } from "react";
import axios from "axios";
// import "styles/main.css"; // Make sure to create this CSS file

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [previewId, setPreviewId] = useState(null);

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
  "Faculty of Business": [
    "Management",
    "Marketing",
    "Finance",
    "Analytics",
    "Fashion Business & Management",
    "MBA",
  ],
  "Faculty of Humanities & Sciences": [
    "Biotechnology",
    "Biomedical Science",
    "Psychology",
    "Financial Mathematics",
    "English",
    "Law",
    "Teacher Education",
    "Nursing",
  ],
  "School of Architecture": [
    "Architecture",
    "Interior Design",
    "MSc Architecture",
  ],
  "Hospitality & Culinary": [
    "Hospitality Management",
    "Commercial Cookery",
    "Event Management",
    "Patisserie",
    "Travel & Tourism Management",
  ],
};

  useEffect(() => {
    axios.get("http://localhost:5000/api/materials")
      .then(res => setMaterials(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredMaterials = materials.filter(
    (m) => m.faculty === selectedFaculty && m.specialization === selectedSpec
  );

  return (
    <div className="page">
      <h2>🎓 Select Faculty</h2>
      <div className="grid">
        {Object.keys(faculties).map((fac) => (
          <div
            key={fac}
            className={`card ${selectedFaculty === fac ? "active" : ""}`}
            onClick={() => {
              setSelectedFaculty(fac);
              setSelectedSpec("");
              setPreviewId(null);
            }}
          >
            {fac}
          </div>
        ))}
      </div>

      {selectedFaculty && (
        <>
          <h2>📘 Select Specialization</h2>
          <div className="grid">
            {faculties[selectedFaculty].map((spec) => (
              <div
                key={spec}
                className={`card ${selectedSpec === spec ? "active" : ""}`}
                onClick={() => {
                  setSelectedSpec(spec);
                  setPreviewId(null);
                }}
              >
                {spec}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedSpec && (
        <>
          <h2>📂 Materials</h2>
          {filteredMaterials.length === 0 ? (
            <p>No materials uploaded yet.</p>
          ) : (
            <div className="materials-grid">
              {filteredMaterials.map((mat) => (
                <div key={mat._id} className="card-material">
                  <h4>{mat.title}</h4>
                  <p>{mat.description}</p>
                  <div className="material-buttons">
                    <button
                      className="preview-btn"
                      onClick={() =>
                        setPreviewId(previewId === mat._id ? null : mat._id)
                      }
                    >
                      {previewId === mat._id ? "Hide Preview" : "Preview"}
                    </button>
                    <a
                      href={`http://localhost:5000/uploads/${mat.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="download-btn">Download</button>
                    </a>
                  </div>

                  {previewId === mat._id && (
                    <div className="preview-box">
                      <iframe
                        src={`http://localhost:5000/uploads/${mat.file}`}
                        title="Preview"
                        width="100%"
                        height="100%"
                      ></iframe>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Materials;
