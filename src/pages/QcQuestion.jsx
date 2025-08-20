import React, { useState, useEffect } from "react";
import Add from "../assets/Add.png";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx";
import config from "../Config";

const QCForm = () => {
  const [componentType, setComponentType] = useState("");
  const [questions, setQuestions] = useState([""]);
  const [componentTypesList, setComponentTypesList] = useState([]);

  useEffect(() => {
    fetch(`${config.apiBaseURL}/component/`)
      .then((res) => res.json())
      .then((data) => {
        const uniqueTypes = Array.from(
          new Set(data.map((item) => item.component_type))
        );
        setComponentTypesList(uniqueTypes);
      })
      .catch((error) => {
        console.error("Error fetching component types:", error);
      });
  }, []);

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    if (questions[questions.length - 1].trim() === "") {
      showWarningToast(
        "Please fill the previous question field before adding a new one."
      );
      return;
    }
    setQuestions([...questions, ""]);
  };

  const handleRemoveQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!componentType) {
      showErrorToast("Please select a component type.");
      return;
    }

    const hasEmpty = questions.some((q) => q.trim() === "");
    if (hasEmpty) {
      showErrorToast("Please fill in all question fields.");
      return;
    }

    console.log("Component Type:", componentType);
    console.log("Questions:", questions);
    showSuccessToast("Form submitted successfully!");
  };

  const handleCancel = () => {
    setComponentType("");
    setQuestions([""]);
  };

  return (
    <div className="qc-container">
      <h3 className="qc-title">QC question</h3>

      <form onSubmit={handleSubmit}>
        <div className="qc-input-group">
          <label className="qc-label">Component type</label>
          <select
            value={componentType}
            onChange={(e) => setComponentType(e.target.value)}
            className="qc-select"
          >
            <option value="">Select any Component Type</option>
            {componentTypesList.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {questions.map((question, index) => (
          <div key={index} className="qc-input-group">
            <label className="qc-label">Question {index + 1}</label>

            <div className="qc-question-wrapper">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  className="qc-remove-btn"
                  title="Remove question"
                >
                  ×
                </button>
              )}
              <textarea
                value={question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                className="qc-textarea"
                rows={3}
              />
            </div>
          </div>
        ))}

        <div className="qc-plus-icon" onClick={handleAddQuestion}>
          <img src={Add} alt="Add Question" />
        </div>

        <div className="qc-button-group">
          <button type="submit" className="qc-submit-button">
            Submit
          </button>
          <button
            type="button"
            className="qc-cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
      <ToastContainerComponent />
    </div>
  );
};

export default QCForm;
