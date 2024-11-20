import React from "react";

const CustomMessagebox = ({ message, onClose }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.messageBox}>
        <p>{message}</p>
        <button onClick={onClose} style={styles.closeButton}>
          OK
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  messageBox: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "100%",
  },
  closeButton: {
    marginTop: "10px",
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#ed8f37",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default CustomMessagebox;
