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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setQuestions(updated.length ? updated : [""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!componentType) {
      showErrorToast("Please select a component type.");
      return;
    }

    const cleaned = questions.map((q) => q.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      showErrorToast("Please enter at least one question.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1) Ensure the component type exists in QC component types
      //    If it already exists, the API may return 400/409 — we ignore that and continue.
      const ctRes = await fetch(`${config.apiBaseURL}/qc_component_type/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ component_type: componentType }),
      });

      if (!ctRes.ok && ctRes.status !== 400 && ctRes.status !== 409) {
        // Not a "already exists" error -> surface it but still try questions
        const msg = await ctRes.text();
        console.warn("qc_component_type POST warning:", msg);
      }

      // 2) POST each question for this component type
      const results = await Promise.all(
        cleaned.map((q) =>
          fetch(`${config.apiBaseURL}/qc_question/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              component_type: componentType,
              question: q,
            }),
          })
        )
      );

      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        showErrorToast(
          `Saved with ${failed.length} error(s). Some questions failed.`
        );
      } else {
        showSuccessToast("QC questions saved successfully!");
        // Reset form
        setComponentType("");
        setQuestions([""]);
      }
    } catch (err) {
      console.error("Submit error:", err);
      showErrorToast("Something went wrong while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          <button
            type="submit"
            className="qc-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
          <button
            type="button"
            className="qc-cancel-button"
            onClick={handleCancel}
            disabled={isSubmitting}
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
