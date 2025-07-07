// src/utils/toast.js
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Success notification
export const showSuccessToast = (message) => {
  toast.success(message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    style: { backgroundColor: "#82B97E", color: "white" }, // Inline styles for red background
  });
};

// Error notification
export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });
};

// Info notification
export const showInfoToast = (message) => {
  toast.info(message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });
};

//Message with YES or NO buttons
export const showMessageToast = ({ message, onConfirm, onCancel }) => {
  toast.info(
    ({ closeToast }) => (
      <div style={{ fontSize: "14px" }}>
        {message}
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={async () => {
              closeToast();
              onConfirm && (await onConfirm());
            }}
            style={{
              padding: "6px 12px",
              backgroundColor: "#f58720",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Yes
          </button>
          <button
            onClick={() => {
              closeToast();
            }}
            style={{
              padding: "6px 12px",
              backgroundColor: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            No
          </button>
        </div>
      </div>
    ),
    {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      style: {
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        padding: "16px",
      },
    }
  );
};

export const showTextToast = ({
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "No",
}) => {
  toast.info(
    ({ closeToast }) => (
      <div style={{ fontSize: "14px" }}>
        {typeof message === "function" ? (
          message({ closeToast })
        ) : (
          <p>{message}</p>
        )}
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "flex-end", // 🔸 Right aligned
            gap: "10px",
            marginLeft: "70px",
          }}
        >
          <button
            onClick={async () => {
              closeToast();
              if (onConfirm) await onConfirm();
            }}
            style={{
              padding: "6px 12px",
              backgroundColor: "#f58720",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {confirmText}
          </button>
          <button
            onClick={() => {
              closeToast();
              if (onCancel) onCancel();
            }}
            style={{
              padding: "6px 12px",
              backgroundColor: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    ),
    {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      style: {
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        padding: "16px",
        minWidth: "320px",
      },
    }
  );
};

// Warning notification
export const showWarningToast = (message) => {
  toast.warn(message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });
};

// Toast container (to be added in your main App component)
export const ToastContainerComponent = () => <ToastContainer />;
