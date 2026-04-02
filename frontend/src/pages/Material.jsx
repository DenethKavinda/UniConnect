import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiHome, FiUpload, FiEye } from "react-icons/fi";

// University Data: Faculty → Specialization → Year → Semester → Modules
const universityData = {
  Computing: {
    "Software Engineering": {
      "Year 1": {
        "Semester 1": [
          "Introduction to Programming",
          "Mathematics for Computing",
          "Computer Fundamentals",
          "Problem Solving Techniques",
          "Digital Logic Design",
        ],
        "Semester 2": [
          "Object-Oriented Programming",
          "Data Structures",
          "Computer Architecture",
          "Software Engineering Basics",
          "Database Fundamentals",
        ],
      },
      "Year 2": {
        "Semester 1": [
          "Database Systems",
          "Web Development",
          "Software Testing",
          "Operating Systems",
          "Networking Basics",
        ],
        "Semester 2": [
          "Mobile Application Development",
          "Software Project Management",
          "Cloud Computing Basics",
          "Human-Computer Interaction",
          "Algorithms Analysis",
        ],
      },
      "Year 3": {
        "Semester 1": [
          "Software Design Patterns",
          "AI Basics",
          "Advanced Web Development",
          "Distributed Systems",
          "Cybersecurity Fundamentals",
        ],
        "Semester 2": [
          "Machine Learning",
          "DevOps Practices",
          "Data Structures Advanced",
          "Software Quality Assurance",
          "Embedded Systems Basics",
        ],
      },
      "Year 4": {
        "Semester 1": [
          "Capstone Project 1",
          "Advanced Networking",
          "Big Data Analytics",
          "AI Ethics",
          "Parallel Programming",
        ],
        "Semester 2": [
          "Capstone Project 2",
          "Cloud Architecture",
          "Advanced Machine Learning",
          "Software Maintenance",
          "Information Security Management",
        ],
      },
    },
    "Data Science": {
      "Year 1": {
        "Semester 1": [
          "Intro to Python",
          "Statistics Basics",
          "Mathematics for Data Science",
          "Data Analysis Fundamentals",
          "Database Basics",
        ],
        "Semester 2": [
          "Data Wrangling",
          "Probability Theory",
          "Exploratory Data Analysis",
          "Linear Algebra Basics",
          "Visualization Techniques",
        ],
      },
      "Year 2": {
        "Semester 1": [
          "Machine Learning Fundamentals",
          "Data Visualization",
          "SQL for Data Science",
          "Python for Data Analysis",
          "Time Series Analysis Basics",
        ],
        "Semester 2": [
          "Deep Learning",
          "Big Data Tools",
          "Natural Language Processing Basics",
          "Model Evaluation",
          "Recommender Systems",
        ],
      },
      "Year 3": {
        "Semester 1": [
          "AI Algorithms",
          "Data Mining",
          "Predictive Modeling",
          "Advanced Statistics",
          "Data Engineering Fundamentals",
        ],
        "Semester 2": [
          "Natural Language Processing",
          "Computer Vision",
          "Advanced Machine Learning",
          "Reinforcement Learning Basics",
          "Data Ethics",
        ],
      },
      "Year 4": {
        "Semester 1": [
          "Capstone DS Project 1",
          "Reinforcement Learning",
          "Big Data Analytics Advanced",
          "AI Ethics Advanced",
          "Time Series Forecasting",
        ],
        "Semester 2": [
          "Capstone DS Project 2",
          "AI Deployment and DevOps",
          "Deep Learning Advanced",
          "Recommendation System Advanced",
          "Data Governance",
        ],
      },
    },
    "Cyber Security": {
      "Year 1": {
        "Semester 1": [
          "Introduction to Cyber Security",
          "Computer Fundamentals",
          "Networking Basics",
          "Information Security Basics",
          "Digital Literacy",
        ],
        "Semester 2": [
          "Ethical Hacking Basics",
          "System Administration",
          "Security Policies",
          "Intro to Cryptography",
          "Risk Management Fundamentals",
        ],
      },
      "Year 2": {
        "Semester 1": [
          "Network Security",
          "Advanced Cryptography",
          "Cyber Laws",
          "Firewall and VPNs",
          "Security Auditing",
        ],
        "Semester 2": [
          "Malware Analysis",
          "Penetration Testing",
          "Incident Response",
          "Threat Modeling",
          "Digital Forensics",
        ],
      },
      "Year 3": {
        "Semester 1": [
          "Advanced Penetration Testing",
          "Secure Software Development",
          "Cloud Security Basics",
          "IoT Security",
          "Identity Management",
        ],
        "Semester 2": [
          "Cyber Security Project 1",
          "Network Defense Strategies",
          "Malware Reverse Engineering",
          "Security Operations Center",
          "AI in Cybersecurity",
        ],
      },
      "Year 4": {
        "Semester 1": [
          "Cyber Security Project 2",
          "Advanced Cloud Security",
          "Risk and Compliance",
          "Cyber Threat Intelligence",
          "Incident Response Advanced",
        ],
        "Semester 2": [
          "Ethical Hacking Advanced",
          "Security Governance",
          "Capstone Security Project",
          "Advanced Digital Forensics",
          "Cybersecurity Management",
        ],
      },
    },
  },

  Engineering: {
    "Civil Engineering": {
      "Year 1": {
        "Semester 1": [
          "Engineering Mathematics I",
          "Engineering Mechanics I",
          "Material Science Basics",
          "Engineering Drawing",
          "Physics for Engineers",
        ],
        "Semester 2": [
          "Engineering Mathematics II",
          "Engineering Mechanics II",
          "Surveying Basics",
          "Computer-Aided Design",
          "Chemistry for Engineers",
        ],
      },
      "Year 2": {
        "Semester 1": [
          "Structural Analysis I",
          "Fluid Mechanics I",
          "Soil Mechanics I",
          "Construction Materials",
          "Environmental Engineering Basics",
        ],
        "Semester 2": [
          "Structural Analysis II",
          "Fluid Mechanics II",
          "Soil Mechanics II",
          "Transportation Engineering",
          "Hydraulics",
        ],
      },
      "Year 3": {
        "Semester 1": [
          "Advanced Structural Design",
          "Geotechnical Engineering",
          "Project Management Basics",
          "Water Resources Engineering",
          "Construction Planning",
        ],
        "Semester 2": [
          "Advanced Construction Materials",
          "Bridge Engineering",
          "Sustainable Construction",
          "Structural Dynamics",
          "Urban Planning Basics",
        ],
      },
      "Year 4": {
        "Semester 1": [
          "Capstone Project 1",
          "Advanced Transportation Engineering",
          "Environmental Impact Assessment",
          "Advanced Surveying",
          "Innovative Construction Techniques",
        ],
        "Semester 2": [
          "Capstone Project 2",
          "Construction Law",
          "Advanced Geotechnical Engineering",
          "Hydraulic Structures",
          "Project Risk Management",
        ],
      },
    },
    "Electrical Engineering": {
      "Year 1": {
        "Semester 1": [
          "Circuit Theory",
          "Electronics Basics",
          "Mathematics for Engineers",
          "Physics for Engineers",
          "Engineering Drawing",
        ],
        "Semester 2": [
          "Digital Electronics",
          "Signals and Systems",
          "Electrical Machines Basics",
          "Programming Basics",
          "Chemistry for Engineers",
        ],
      },
      "Year 2": {
        "Semester 1": [
          "Power Systems I",
          "Control Systems Basics",
          "Electromagnetics",
          "Microcontrollers",
          "Measurement and Instrumentation",
        ],
        "Semester 2": [
          "Power Systems II",
          "Advanced Control Systems",
          "Communication Systems Basics",
          "Embedded Systems",
          "Renewable Energy Fundamentals",
        ],
      },
      "Year 3": {
        "Semester 1": [
          "Advanced Power Systems",
          "Electrical Machines II",
          "PLC & Automation",
          "High Voltage Engineering",
          "Digital Signal Processing",
        ],
        "Semester 2": [
          "Electrical Engineering Project 1",
          "Smart Grid Basics",
          "Power Electronics",
          "Industrial Electronics",
          "Energy Management",
        ],
      },
      "Year 4": {
        "Semester 1": [
          "Electrical Engineering Project 2",
          "Advanced Power Electronics",
          "Control of Electrical Drives",
          "Electric Vehicles Basics",
          "Energy Storage Systems",
        ],
        "Semester 2": [
          "Capstone Project",
          "Advanced Smart Grid",
          "Renewable Energy Systems",
          "Electrical Safety & Standards",
          "Industrial Automation Project",
        ],
      },
    },
  },

  Business: {
    Accounting: {
      "Year 1": {
        "Semester 1": [
          "Intro to Accounting",
          "Business Mathematics",
          "Economics Basics",
          "Principles of Management",
          "Business Communication",
        ],
        "Semester 2": [
          "Financial Accounting I",
          "Microeconomics",
          "Business Law",
          "Business Ethics",
          "Statistics for Business",
        ],
      },
      "Year 2": {
        "Semester 1": [
          "Management Accounting",
          "Corporate Finance",
          "Auditing Basics",
          "Marketing Fundamentals",
          "Organizational Behavior",
        ],
        "Semester 2": [
          "Financial Accounting II",
          "Investment Analysis",
          "Human Resource Management",
          "Operations Management",
          "Entrepreneurship Basics",
        ],
      },
      "Year 3": {
        "Semester 1": [
          "Advanced Accounting",
          "Taxation",
          "Financial Modeling",
          "Strategic Management",
          "Digital Marketing Basics",
        ],
        "Semester 2": [
          "Investment Analysis Advanced",
          "Auditing Advanced",
          "Corporate Governance",
          "International Business",
          "Business Analytics",
        ],
      },
      "Year 4": {
        "Semester 1": [
          "Capstone Project 1",
          "Advanced Corporate Finance",
          "Risk Management",
          "Sustainable Business Practices",
          "Business Strategy",
        ],
        "Semester 2": [
          "Capstone Project 2",
          "Financial Reporting Advanced",
          "Leadership in Business",
          "Innovation Management",
          "Ethical Decision Making",
        ],
      },
    },
    Marketing: {
      "Year 1": {
        "Semester 1": [
          "Introduction to Marketing",
          "Business Communication",
          "Economics Basics",
          "Principles of Management",
          "Statistics for Business",
        ],
        "Semester 2": [
          "Consumer Behavior",
          "Advertising Basics",
          "Digital Marketing Fundamentals",
          "Sales Basics",
          "Market Research Basics",
        ],
      },
      "Year 2": {
        "Semester 1": [
          "Marketing Strategy",
          "Brand Management",
          "Social Media Marketing",
          "Customer Relationship Management",
          "Marketing Analytics",
        ],
        "Semester 2": [
          "International Marketing",
          "Product Development",
          "E-commerce Basics",
          "Retail Management",
          "Service Marketing",
        ],
      },
      "Year 3": {
        "Semester 1": [
          "Advanced Marketing Strategy",
          "Digital Marketing Advanced",
          "Market Research Advanced",
          "Promotions & Advertising",
          "Behavioral Economics",
        ],
        "Semester 2": [
          "Marketing Project 1",
          "Sales Management",
          "Negotiation Skills",
          "Customer Insights",
          "Brand Analytics",
        ],
      },
      "Year 4": {
        "Semester 1": [
          "Capstone Project 1",
          "Strategic Brand Management",
          "Integrated Marketing Communications",
          "Marketing Ethics",
          "Consumer Psychology",
        ],
        "Semester 2": [
          "Capstone Project 2",
          "International Marketing Strategy",
          "Advanced Sales Management",
          "Marketing Analytics Advanced",
          "Innovation & Marketing",
        ],
      },
    },
  },

  Science: {
    Physics: {
      "Year 1": {
        "Semester 1": [
          "Mechanics I",
          "Mathematics for Physics",
          "Physics Lab I",
          "Chemistry Basics",
          "Computational Physics Basics",
        ],
        "Semester 2": [
          "Electromagnetism I",
          "Mechanics II",
          "Physics Lab II",
          "Linear Algebra Basics",
          "Intro to Astronomy",
        ],
      },
      "Year 2": {
        "Semester 1": [
          "Thermodynamics",
          "Electromagnetism II",
          "Quantum Mechanics I",
          "Statistics for Physics",
          "Experimental Physics I",
        ],
        "Semester 2": [
          "Optics",
          "Quantum Mechanics II",
          "Computational Physics",
          "Solid State Physics",
          "Experimental Physics II",
        ],
      },
      "Year 3": {
        "Semester 1": [
          "Nuclear Physics",
          "Advanced Thermodynamics",
          "Electrodynamics",
          "Computational Modelling",
          "Astrophysics Basics",
        ],
        "Semester 2": [
          "Particle Physics",
          "Quantum Field Theory",
          "Experimental Techniques",
          "Advanced Optics",
          "Physics Project I",
        ],
      },
      "Year 4": {
        "Semester 1": [
          "Physics Project II",
          "Advanced Astrophysics",
          "Advanced Quantum Mechanics",
          "Research Methods in Physics",
          "Physics Seminar",
        ],
        "Semester 2": [
          "Capstone Project",
          "Advanced Nuclear Physics",
          "Photonics",
          "Plasma Physics",
          "Scientific Writing",
        ],
      },
    },
    Chemistry: {
      "Year 1": {
        "Semester 1": [
          "General Chemistry I",
          "Mathematics for Chemistry",
          "Chemistry Lab I",
          "Physics Basics",
          "Organic Chemistry Basics",
        ],
        "Semester 2": [
          "General Chemistry II",
          "Inorganic Chemistry",
          "Chemistry Lab II",
          "Analytical Chemistry",
          "Biochemistry Basics",
        ],
      },
      "Year 2": {
        "Semester 1": [
          "Organic Chemistry I",
          "Physical Chemistry I",
          "Analytical Techniques",
          "Lab Safety & Methods",
          "Environmental Chemistry Basics",
        ],
        "Semester 2": [
          "Organic Chemistry II",
          "Physical Chemistry II",
          "Inorganic Chemistry Advanced",
          "Chemistry Project I",
          "Industrial Chemistry Basics",
        ],
      },
      "Year 3": {
        "Semester 1": [
          "Advanced Organic Chemistry",
          "Advanced Physical Chemistry",
          "Spectroscopy Techniques",
          "Computational Chemistry Basics",
          "Lab Techniques Advanced",
        ],
        "Semester 2": [
          "Chemistry Project II",
          "Biochemistry Advanced",
          "Materials Chemistry",
          "Chemical Kinetics",
          "Advanced Lab Safety",
        ],
      },
      "Year 4": {
        "Semester 1": [
          "Capstone Project 1",
          "Advanced Analytical Chemistry",
          "Chemical Research Methods",
          "Green Chemistry",
          "Polymer Chemistry",
        ],
        "Semester 2": [
          "Capstone Project 2",
          "Advanced Biochemistry",
          "Industrial Chemistry Project",
          "Environmental Chemistry Advanced",
          "Chemistry Seminar",
        ],
      },
    },
  },

  Humanities: {
    History: {
      "Year 1": {
        "Semester 1": [
          "World History I",
          "Introduction to History",
          "Historical Methods",
          "Ancient Civilizations",
          "Geography Basics",
        ],
        "Semester 2": [
          "World History II",
          "Medieval History",
          "History of Art",
          "Cultural Studies",
          "Political Systems Basics",
        ],
      },
      "Year 2": {
        "Semester 1": [
          "Modern History I",
          "European History",
          "Asian History",
          "Historical Research Methods",
          "Archaeology Basics",
        ],
        "Semester 2": [
          "Modern History II",
          "African History",
          "American History",
          "History Project I",
          "Historiography",
        ],
      },
      "Year 3": {
        "Semester 1": [
          "History of Science",
          "Economic History",
          "Social History",
          "Public History Basics",
          "Oral History Techniques",
        ],
        "Semester 2": [
          "History Project II",
          "Comparative History",
          "Historical Anthropology",
          "Advanced Research Methods",
          "History Seminar",
        ],
      },
      "Year 4": {
        "Semester 1": [
          "Capstone Project 1",
          "Advanced Historical Analysis",
          "Historical Writing",
          "Global History Trends",
          "Research Ethics",
        ],
        "Semester 2": [
          "Capstone Project 2",
          "Archival Studies",
          "Digital History",
          "Advanced Historiography",
          "History Presentation Skills",
        ],
      },
    },
    Philosophy: {
      "Year 1": {
        "Semester 1": [
          "Introduction to Philosophy",
          "Ethics Basics",
          "Logic I",
          "Critical Thinking I",
          "History of Philosophy I",
        ],
        "Semester 2": [
          "Philosophy of Mind",
          "Logic II",
          "Critical Thinking II",
          "History of Philosophy II",
          "Ethics Advanced",
        ],
      },
      "Year 2": {
        "Semester 1": [
          "Metaphysics I",
          "Epistemology I",
          "Philosophical Methods",
          "Political Philosophy I",
          "Philosophy Lab I",
        ],
        "Semester 2": [
          "Metaphysics II",
          "Epistemology II",
          "Political Philosophy II",
          "Aesthetics Basics",
          "Philosophy Lab II",
        ],
      },
      "Year 3": {
        "Semester 1": [
          "Philosophy Project I",
          "Applied Ethics",
          "Phenomenology",
          "Philosophy of Science",
          "Logic Advanced",
        ],
        "Semester 2": [
          "Philosophy Project II",
          "Existentialism",
          "Analytic Philosophy",
          "Continental Philosophy",
          "Philosophy Seminar",
        ],
      },
      "Year 4": {
        "Semester 1": [
          "Capstone Project 1",
          "Advanced Ethics",
          "Philosophy of Technology",
          "Advanced Logic",
          "Research Methods in Philosophy",
        ],
        "Semester 2": [
          "Capstone Project 2",
          "Philosophy of Language",
          "Philosophy of Religion",
          "Final Thesis",
          "Presentation Skills",
        ],
      },
    },
  },
};

const Material = () => {
  const [formData, setFormData] = useState({
    faculty: "",
    specialization: "",
    year: "",
    semester: "",
    module: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      // Reset dependent selections when parent changes
      let resetData = { [name]: value };
      if (name === "faculty")
        resetData = {
          ...resetData,
          specialization: "",
          year: "",
          semester: "",
          module: "",
        };
      if (name === "specialization")
        resetData = { ...resetData, year: "", semester: "", module: "" };
      if (name === "year")
        resetData = { ...resetData, semester: "", module: "" };
      if (name === "semester") resetData = { ...resetData, module: "" };
      setFormData({ ...formData, ...resetData });
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
        specialization: "",
        year: "",
        semester: "",
        module: "",
        file: null,
      });
    } catch (err) {
      console.error(err);
      alert("Upload Failed");
    }
  };

  const selectClass =
<<<<<<< HEAD
    "app-input w-full p-3 rounded-lg";
  const inputClass =
    "app-input w-full p-3 rounded-lg";
=======
    "w-full p-3 rounded-lg bg-[#1a1f2e] text-white border border-gray-600 focus:border-blue-500 focus:outline-none";
>>>>>>> member2-materials
  const buttonClass =
    "app-btn-primary hover:brightness-110 transition-colors px-6 py-3 rounded-lg flex items-center gap-2 font-bold";

  // Dynamic lists based on selection
  const specializations = formData.faculty
    ? Object.keys(universityData[formData.faculty])
    : [];
  const years = formData.specialization
    ? Object.keys(universityData[formData.faculty][formData.specialization])
    : [];
  const semesters = formData.year
    ? Object.keys(
        universityData[formData.faculty][formData.specialization][
          formData.year
        ],
      )
    : [];
  const modules =
    formData.year && formData.semester
      ? universityData[formData.faculty][formData.specialization][
          formData.year
        ][formData.semester]
      : [];

  return (
    <div className="app-page p-10 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="text-blue-400 hover:text-blue-500 transition-colors">
          <FiHome size={28} />
        </Link>
<<<<<<< HEAD

        <Link to="/uploaded-materials" className="flex items-center gap-2 text-amber-400 hover:text-amber-500 transition-colors font-medium">
=======
        <Link
          to="/uploaded-materials"
          className="flex items-center gap-2 text-amber-400 hover:text-amber-500 transition-colors font-medium"
        >
>>>>>>> member2-materials
          <FiEye /> View Uploads
        </Link>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-[var(--app-text)]">Upload Materials</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="space-y-5">
<<<<<<< HEAD
          <select name="faculty" value={formData.faculty} onChange={handleChange} required className={selectClass}>
            <option value="">Select Faculty</option>
            <option>Computing</option>
            <option>Business</option>
            <option>Engineering</option>
            <option>Science</option>
          </select>

          <select name="year" value={formData.year} onChange={handleChange} required className={selectClass}>
            <option value="">Academic Year</option>
            <option>Year 1</option>
            <option>Year 2</option>
            <option>Year 3</option>
            <option>Year 4</option>
          </select>

          <select name="semester" value={formData.semester} onChange={handleChange} required className={selectClass}>
            <option value="">Semester</option>
            <option>Semester 1</option>
            <option>Semester 2</option>
          </select>

          <select name="specialization" value={formData.specialization} onChange={handleChange} required className={selectClass}>
            <option value="">Specialization</option>
            <option>Software Engineering</option>
            <option>Data Science</option>
            <option>Cyber Security</option>
            <option>Information Systems</option>
          </select>

          <select name="module" value={formData.module} onChange={handleChange} required className={selectClass}>
            <option value="">Module</option>
            <option>Database Systems</option>
            <option>Web Development</option>
            <option>Machine Learning</option>
            <option>Networking</option>
          </select>

          <input type="file" name="file" onChange={handleChange} required className={inputClass} />
=======
          {/* Faculty */}
          <select
            name="faculty"
            value={formData.faculty}
            onChange={handleChange}
            required
            className={selectClass}
          >
            <option value="">Select Faculty</option>
            {Object.keys(universityData).map((fac) => (
              <option key={fac}>{fac}</option>
            ))}
          </select>

          {/* Specialization */}
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
            disabled={!formData.faculty}
            className={selectClass}
          >
            <option value="">Select Specialization</option>
            {specializations.map((spec) => (
              <option key={spec}>{spec}</option>
            ))}
          </select>

          {/* Year */}
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            disabled={!formData.specialization}
            className={selectClass}
          >
            <option value="">Select Year</option>
            {years.map((yr) => (
              <option key={yr}>{yr}</option>
            ))}
          </select>

          {/* Semester */}
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
            disabled={!formData.year}
            className={selectClass}
          >
            <option value="">Select Semester</option>
            {semesters.map((sem) => (
              <option key={sem}>{sem}</option>
            ))}
          </select>

          {/* Module */}
          <select
            name="module"
            value={formData.module}
            onChange={handleChange}
            required
            disabled={!formData.semester}
            className={selectClass}
          >
            <option value="">Select Module</option>
            {modules.map((mod) => (
              <option key={mod}>{mod}</option>
            ))}
          </select>

          {/* File Upload */}
          <input
            type="file"
            name="file"
            onChange={handleChange}
            required
            className={selectClass}
          />
>>>>>>> member2-materials

          <button type="submit" className={buttonClass}>
            <FiUpload /> Upload
          </button>
        </form>

        <div className="app-surface p-6 rounded-2xl flex flex-col shadow-lg">
          <h3 className="text-2xl font-extrabold mb-6 text-amber-400 animate-pulse">💡 Tips for Uploading</h3>
          <ul className="space-y-4 w-full">
            {[
              "Select correct Faculty, Specialization, Year, Semester, and Module.",
              "Ensure the document is properly named.",
<<<<<<< HEAD
              "Allowed formats: PDF, DOCX, PPTX, TXT, ZIP, and other common document types.",
=======
              "Allowed formats: PDF, DOCX, PPTX, TXT, ZIP, and other common types.",
>>>>>>> member2-materials
              "After upload, you can view it in Uploaded Materials.",
            ].map((tip, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-600/20 to-amber-500/10 hover:from-blue-500/30 hover:to-amber-400/20 transition-all duration-500 group cursor-pointer"
              >
                <span className="app-btn-primary flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full font-bold animate-pulse">
                  {idx + 1}
                </span>
                <p className="text-white font-medium text-sm group-hover:text-amber-300 transition-colors">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Material;
