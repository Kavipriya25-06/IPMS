import React, { useEffect, useRef, useState } from "react";

let highestZIndex = 1000; // Static variable to track the highest zIndex

const CustomMessagebox = ({ message, onClose }) => {
  const closeButtonRef = useRef(null);
  const [zIndex, setZIndex] = useState(highestZIndex);

  useEffect(() => {
    // Increment the zIndex for each new pop-up
    highestZIndex += 10;
    setZIndex(highestZIndex);

    // Focus the "OK" button when the component is mounted
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Handle the Escape key to close the pop-up
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div style={{ ...styles.overlay, zIndex }}>
      <div style={styles.messageBox}>
        <p>{message}</p>
        <button
          onClick={onClose}
          style={styles.closeButton}
          ref={closeButtonRef}
        >
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
