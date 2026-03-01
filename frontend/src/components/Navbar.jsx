import React from "react";

function Navbar({ setPage }) {
  return (
    <div className="navbar">
      <h2>📚 UniConnect</h2>
      <div>
        <button onClick={() => setPage("upload")}>Upload Material</button>
        <button onClick={() => setPage("materials")}>Materials</button>
      </div>
    </div>
  );
}

export default Navbar;
