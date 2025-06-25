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

export const showMessageToast = (message) => {
  toast.info(message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    style: { backgroundColor: "#fff", color: "gray" }, // Inline styles for red background
  });
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
