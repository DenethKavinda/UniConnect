import React, { useState } from "react";
import Navbar from "./components/Navbar";
import UploadMaterial from "./pages/UploadMaterial";
import Materials from "./pages/Materials";
import "./styles/main.css";


function App() {
  const [page, setPage] = useState("upload");

  return (
    <div>
      <Navbar setPage={setPage} />

      {page === "upload" && <UploadMaterial />}
      {page === "materials" && <Materials />}
      
    </div>
  );
}

export default App;
