// import React, { useEffect, useRef, useState } from "react";
// import config from "../Config";
// import {
//   showSuccessToast,
//   showErrorToast,
//   showWarningToast,
//   ToastContainerComponent,
// } from "./Toastify.jsx";

// const ComponentRequest = () => {
//   const [availableInventory, setAvailableInventory] = useState([]);
//   const [takenInventory, setTakenInventory] = useState([]);
//   const [registeredUsers, setRegisteredUsers] = useState([]);
//   const [rows, setRows] = useState([]);
//   const [openIndex, setOpenIndex] = useState(null);
//   const [searches, setSearches] = useState({});
//   const [returningSerial, setReturningSerial] = useState("");

//   const dropdownRef = useRef(null);
//   const rowRefs = useRef([]);

//   useEffect(() => {
//     fetchInventory();
//     fetchRegisteredUsers();
//   }, []);

//   const fetchInventory = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/inventory/`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch inventory");
//       }

//       const data = await response.json();
//       const inventoryList = Array.isArray(data) ? data : data.results || [];

//       const availableItems = inventoryList.filter(
//         (item) => item.status === "Available" && item.is_taken === false,
//       );

//       const takenItems = inventoryList.filter(
//         (item) =>
//           item.is_taken === true &&
//           item.taken_by &&
//           item.taken_by.trim() !== "" &&
//           item.taken_date,
//       );

//       setAvailableInventory(availableItems);
//       setTakenInventory(takenItems);
//     } catch (error) {
//       console.error("Error fetching inventory:", error);
//       showErrorToast("Failed to fetch inventory.");
//     }
//   };

//   const fetchRegisteredUsers = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/register/`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch registered users");
//       }

//       const data = await response.json();
//       const users = Array.isArray(data) ? data : data.results || [];

//       const normalizedUsers = users.map((user) => ({
//         id: user.id || user.user_id || user.pk || "",
//         name:
//           user.full_name ||
//           user.name ||
//           user.username ||
//           user.email ||
//           "Unknown User",
//       }));

//       setRegisteredUsers(normalizedUsers);
//     } catch (error) {
//       console.error("Error fetching registered users:", error);
//       showErrorToast("Failed to fetch registered users.");
//     }
//   };

//   const handleAddRow = () => {
//     const newIndex = rows.length;

//     setRows((prev) => [
//       ...prev,
//       {
//         component_type: "",
//         specification: "",
//         serial_number: "",
//         UOM: "",
//         category: "",
//         vendor_name: "",
//         status: "Available",
//         taken_by: "",
//       },
//     ]);

//     setTimeout(() => {
//       setOpenIndex(newIndex);
//     }, 100);
//   };

//   const handleRemoveRow = (index) => {
//     setRows((prev) => prev.filter((_, i) => i !== index));
//     setOpenIndex(null);
//   };

//   const handleTakenByChange = (index, selectedUserName) => {
//     setRows((prev) =>
//       prev.map((row, i) =>
//         i === index
//           ? {
//               ...row,
//               taken_by: selectedUserName || "",
//             }
//           : row,
//       ),
//     );
//   };

//   const handleRowComponentChange = (index, selectedValue) => {
//     const [componentType, specification] = selectedValue.split("||");

//     const alreadySelectedSerials = rows
//       .filter((_, i) => i !== index)
//       .map((row) => row.serial_number)
//       .filter(Boolean);

//     const matchedAvailableItems = availableInventory.filter(
//       (item) =>
//         item.component_type === componentType &&
//         item.specification === specification &&
//         item.status === "Available" &&
//         item.is_taken === false &&
//         !alreadySelectedSerials.includes(item.serial_number),
//     );

//     if (matchedAvailableItems.length === 0) {
//       showWarningToast("No available serial number found for this component.");
//       return;
//     }

//     const selectedItem = matchedAvailableItems[0];

//     setRows((prev) =>
//       prev.map((row, i) =>
//         i === index
//           ? {
//               ...row,
//               component_type: selectedItem.component_type || "",
//               specification: selectedItem.specification || "",
//               serial_number: selectedItem.serial_number || "",
//               UOM: selectedItem.UOM || "",
//               category: selectedItem.category || "",
//               vendor_name: selectedItem.vendor_name || "",
//               status: "In_drone",
//             }
//           : row,
//       ),
//     );
//   };

//   const getUniqueComponentOptions = (index) => {
//     const searchText = (searches[index] || "").toLowerCase();

//     return Array.from(
//       new Map(
//         availableInventory
//           .filter(
//             (item) => item.status === "Available" && item.is_taken === false,
//           )
//           .filter((item) =>
//             `${item.component_type} - ${item.specification}`
//               .toLowerCase()
//               .includes(searchText),
//           )
//           .map((item) => [
//             `${item.component_type}||${item.specification}`,
//             item,
//           ]),
//       ).values(),
//     );
//   };

//   const handleSubmit = async () => {
//     const validRows = rows.filter(
//       (row) =>
//         row.component_type &&
//         row.specification &&
//         row.serial_number &&
//         row.taken_by,
//     );

//     if (validRows.length === 0) {
//       showWarningToast(
//         "Please select at least one component and choose who takes it.",
//       );
//       return;
//     }

//     if (validRows.length !== rows.length) {
//       showWarningToast("Some rows are incomplete. Please complete all rows.");
//       return;
//     }

//     try {
//       const today = new Date().toISOString().split("T")[0];

//       for (const row of validRows) {
//         const patchPayload = {
//           status: "In_drone",
//           is_taken: true,
//           taken_by: row.taken_by,
//           taken_date: today,
//           return_date: null,
//         };

//         const patchResponse = await fetch(
//           `${config.apiBaseURL}/inventory/${row.serial_number}/`,
//           {
//             method: "PATCH",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(patchPayload),
//           },
//         );

//         if (!patchResponse.ok) {
//           let errorData = {};
//           try {
//             errorData = await patchResponse.json();
//           } catch {
//             errorData = { error: "Failed to update inventory item." };
//           }
//           throw new Error(JSON.stringify(errorData));
//         }
//       }

//       showSuccessToast("Inventory updated successfully.");
//       setRows([]);
//       fetchInventory();
//     } catch (error) {
//       console.error("Error updating inventory:", error);
//       showErrorToast("Failed to update inventory.");
//     }
//   };

//   const handleReturnComponent = async (item) => {
//     try {
//       setReturningSerial(item.serial_number);

//       const today = new Date().toISOString().split("T")[0];

//       const patchPayload = {
//         status: "Available",
//         is_taken: false,
//         return_date: today,
//       };

//       const patchResponse = await fetch(
//         `${config.apiBaseURL}/inventory/${item.serial_number}/`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(patchPayload),
//         },
//       );

//       if (!patchResponse.ok) {
//         let errorData = {};
//         try {
//           errorData = await patchResponse.json();
//         } catch {
//           errorData = { error: "Failed to return inventory item." };
//         }
//         throw new Error(JSON.stringify(errorData));
//       }

//       showSuccessToast("Component returned successfully.");
//       fetchInventory();
//     } catch (error) {
//       console.error("Error returning inventory:", error);
//       showErrorToast("Failed to return component.");
//     } finally {
//       setReturningSerial("");
//     }
//   };

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "15px",
//         }}
//       >
//         <h3 style={{ margin: 0 }}>Component Request</h3>

//         <button
//           type="button"
//           onClick={handleAddRow}
//           title="Add Component"
//           style={{
//             width: "36px",
//             height: "36px",
//             borderRadius: "50%",
//             border: "none",
//             background: "#0d6efd",
//             color: "#fff",
//             fontSize: "22px",
//             cursor: "pointer",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           +
//         </button>
//       </div>

//       <div className="table-container">
//         <table border="1" cellPadding="8" cellSpacing="0" width="100%">
//           <thead>
//             <tr style={{ backgroundColor: "#f2f2f2" }}>
//               <th>Component Type</th>
//               <th>Component Specification</th>
//               <th>Unit of Measurement</th>
//               <th>Category</th>
//               <th>Vendor Name</th>
//               <th>Serial Number</th>
//               <th>Status</th>
//               <th>Taken By</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {takenInventory.map((item) => (
//               <tr
//                 key={`taken-${item.serial_number}`}
//                 style={{ backgroundColor: "#fafafa" }}
//               >
//                 <td>{item.component_type || "-"}</td>
//                 <td>{item.specification || "-"}</td>
//                 <td>{item.UOM || "-"}</td>
//                 <td>{item.category || "-"}</td>
//                 <td>{item.vendor_name || "-"}</td>
//                 <td>{item.serial_number || "-"}</td>
//                 <td>{item.status || "-"}</td>
//                 <td>
//                   {item.taken_by || "-"}
//                   {item.taken_date ? ` (${item.taken_date})` : ""}
//                 </td>
//                 <td style={{ textAlign: "center" }}>
//                   <button
//                     type="button"
//                     onClick={() => handleReturnComponent(item)}
//                     disabled={returningSerial === item.serial_number}
//                     style={{
//                       padding: "6px 12px",
//                       border: "none",
//                       borderRadius: "4px",
//                       cursor:
//                         returningSerial === item.serial_number
//                           ? "not-allowed"
//                           : "pointer",
//                       background: "#fd7e14",
//                       color: "#fff",
//                       opacity: returningSerial === item.serial_number ? 0.7 : 1,
//                     }}
//                     title="Return Component"
//                   >
//                     {returningSerial === item.serial_number
//                       ? "Returning..."
//                       : "Return"}
//                   </button>
//                 </td>
//               </tr>
//             ))}

//             {rows.map((row, index) => {
//               const componentOptions = getUniqueComponentOptions(index);

//               return (
//                 <tr key={`row-${index}`}>
//                   <td
//                     style={{ position: "relative", minWidth: "220px" }}
//                     ref={(el) => (rowRefs.current[index] = el)}
//                   >
//                     <div className="multi-select">
//                       <div
//                         className="multi-select-box"
//                         onClick={() =>
//                           setOpenIndex(openIndex === index ? null : index)
//                         }
//                         style={{
//                           border: "1px solid #ccc",
//                           padding: "8px",
//                           cursor: "pointer",
//                           display: "flex",
//                           justifyContent: "space-between",
//                           alignItems: "center",
//                           background: "#fff",
//                         }}
//                       >
//                         <span>
//                           {row.component_type
//                             ? row.component_type
//                             : "Select Component"}
//                         </span>
//                         <span>▾</span>
//                       </div>

//                       {openIndex === index && (
//                         <div
//                           ref={dropdownRef}
//                           style={{
//                             position: "fixed",
//                             top:
//                               (rowRefs.current[index]?.getBoundingClientRect()
//                                 .bottom || 0) + 4,
//                             left:
//                               rowRefs.current[index]?.getBoundingClientRect()
//                                 .left || 0,
//                             minWidth:
//                               rowRefs.current[index]?.getBoundingClientRect()
//                                 .width || 220,
//                             zIndex: 9999,
//                             maxHeight: "220px",
//                             overflowY: "auto",
//                             background: "#fff",
//                             border: "1px solid #ccc",
//                             boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
//                           }}
//                         >
//                           <input
//                             type="text"
//                             placeholder="Search components..."
//                             value={searches[index] || ""}
//                             onChange={(e) =>
//                               setSearches((prev) => ({
//                                 ...prev,
//                                 [index]: e.target.value,
//                               }))
//                             }
//                             style={{
//                               width: "100%",
//                               padding: "8px",
//                               boxSizing: "border-box",
//                               border: "none",
//                               borderBottom: "1px solid #eee",
//                               outline: "none",
//                             }}
//                           />

//                           {componentOptions.length === 0 ? (
//                             <div style={{ padding: "10px" }}>
//                               No components found
//                             </div>
//                           ) : (
//                             componentOptions.map((item) => (
//                               <div
//                                 key={`${item.component_type}-${item.specification}-${item.serial_number}`}
//                                 onClick={() => {
//                                   handleRowComponentChange(
//                                     index,
//                                     `${item.component_type}||${item.specification}`,
//                                   );
//                                   setOpenIndex(null);
//                                   setSearches((prev) => ({
//                                     ...prev,
//                                     [index]: "",
//                                   }));
//                                 }}
//                                 style={{
//                                   padding: "10px",
//                                   cursor: "pointer",
//                                   borderBottom: "1px solid #f3f3f3",
//                                 }}
//                               >
//                                 {item.component_type} - {item.specification}
//                               </div>
//                             ))
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </td>

//                   <td>{row.specification || "-"}</td>
//                   <td>{row.UOM || "-"}</td>
//                   <td>{row.category || "-"}</td>
//                   <td>{row.vendor_name || "-"}</td>
//                   <td>{row.serial_number || "-"}</td>
//                   <td>{row.status || "Available"}</td>

//                   <td>
//                     <select
//                       value={row.taken_by}
//                       onChange={(e) =>
//                         handleTakenByChange(index, e.target.value)
//                       }
//                       style={{
//                         padding: "6px",
//                         borderRadius: "4px",
//                         border: "1px solid #ccc",
//                         minWidth: "160px",
//                       }}
//                     >
//                       <option value="">Select User</option>
//                       {registeredUsers.map((user) => (
//                         <option key={user.id} value={user.name}>
//                           {user.name}
//                         </option>
//                       ))}
//                     </select>
//                   </td>

//                   <td style={{ textAlign: "center" }}>
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveRow(index)}
//                       style={{
//                         border: "none",
//                         background: "transparent",
//                         color: "red",
//                         cursor: "pointer",
//                         fontSize: "18px",
//                       }}
//                       title="Remove Row"
//                     >
//                       ✕
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}

//             {takenInventory.length === 0 && rows.length === 0 && (
//               <tr>
//                 <td
//                   colSpan="9"
//                   style={{ textAlign: "center", padding: "20px" }}
//                 >
//                   Click the + button to add a component request
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div
//         style={{
//           display: "flex",
//           justifyContent: "flex-end",
//           marginTop: "20px",
//         }}
//       >
//         <button
//           onClick={handleSubmit}
//           style={{
//             padding: "10px 18px",
//             border: "none",
//             borderRadius: "5px",
//             cursor: "pointer",
//             background: "#198754",
//             color: "#fff",
//           }}
//           className="save-button"
//         >
//           Save
//         </button>
//       </div>

//       <ToastContainerComponent />
//     </div>
//   );
// };

// export default ComponentRequest;

import React, { useEffect, useState } from "react";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx";
import { format } from "date-fns";
import config from "../Config.js";

const ComponentRequest = () => {
  const [inventory, setInventory] = useState([]);
  const [availableInventory, setAvailableInventory] = useState([]);
  const [takenInventory, setTakenInventory] = useState([]);

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("taken");
  const [returnedInventory, setReturnedInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInventory();
    fetchUsers();
    fetchProjects();
  }, []);

  // ================= FETCH =================
  const fetchInventory = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/inventory/`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];

      setAvailableInventory(
        list.filter((i) => i.status && i.status.toLowerCase() === "available"),
      );

      setTakenInventory(list.filter((i) => i.is_taken === true));

      setReturnedInventory(
        list.filter((i) => i.is_taken === false && i.return_date !== null),
      );
    } catch {
      showErrorToast("Failed to fetch inventory");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/register/`);
      const data = await res.json();
      const users = Array.isArray(data) ? data : data.results || [];

      setRegisteredUsers(
        users.map((u) => ({
          id: u.id,
          name: u.email.split("@")[0], //  ONLY BEFORE @
          fullEmail: u.email, // optional if needed later
        })),
      );
    } catch {
      showErrorToast("Failed to fetch users");
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/project/`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];

      setProjects(list);
    } catch {
      showErrorToast("Failed to fetch projects");
    }
  };

  // ================= DROPDOWNS =================
  const getCategories = () => {
    return [...new Set(availableInventory.map((i) => i.category))];
  };

  const getComponentsByCategory = (category) => {
    return [
      ...new Set(
        availableInventory
          .filter((i) => i.category === category)
          .map((i) => i.component_type),
      ),
    ];
  };

  // ================= ADD ROW =================
  const handleAddRow = () => {
    const today = new Date(); // current date

    setRows([
      ...rows,
      {
        category: "",
        component_type: "",
        specification: "",
        serial_numbers: [],
        UOM: "",
        vendor_name: "",
        taken_by: "",
        project: "",
        custom_project: "",
        taken_date: today, //  ADD THIS
      },
    ]);
  };

  const getSerials = (category, component) => {
    return availableInventory.filter(
      (i) => i.category === category && i.component_type === component,
    );
  };

  const handleSerialSelect = (index, serial, checked) => {
    const updated = [...rows];
    const current = updated[index].serial_numbers || [];

    if (checked) {
      updated[index].serial_numbers = [...current, serial];
    } else {
      updated[index].serial_numbers = current.filter((s) => s !== serial);
    }

    setRows(updated);
  };

  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (index, value) => {
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      category: value,
      component_type: "",
      specification: "",
      serial_numbers: [], //  FIXED
      UOM: "",
      vendor_name: "",
    };
    setRows(updated);
  };

  const handleComponentChange = (index, value) => {
    const row = rows[index];

    const match = availableInventory.find(
      (i) => i.category === row.category && i.component_type === value,
    );

    if (!match) {
      showWarningToast("No available item found");
      return;
    }

    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      component_type: match.component_type,
      specification: match.specification,
      serial_numbers: [], //  reset
      UOM: match.UOM,
      vendor_name: match.vendor_name,
    };

    setRows(updated);
  };

  const handleTakenByChange = (index, value) => {
    const updated = [...rows];
    updated[index].taken_by = value;
    setRows(updated);
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!rows.length) {
      showWarningToast("Add at least one row");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    try {
      for (const row of rows) {
        //  VALIDATIONS
        if (
          !row.serial_numbers ||
          row.serial_numbers.length === 0 ||
          !row.project ||
          !row.taken_by
        ) {
          showWarningToast("Select serial(s), project & user");
          return;
        }

        if (row.project === "Other" && !row.custom_project) {
          showWarningToast("Enter project name");
          return;
        }

        const finalProject =
          row.project === "Other" ? row.custom_project : row.project;

        // LOOP ALL SELECTED SERIALS
        for (const serial of row.serial_numbers) {
          const res = await fetch(`${config.apiBaseURL}/inventory/${serial}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              is_taken: true,
              status: "In_drone",
              project_name: finalProject,
              taken_date: today,
              taken_by: row.taken_by,
            }),
          });

          if (!res.ok) {
            throw new Error(`Failed for serial: ${serial}`);
          }
        }
      }

      // CLEAR FORM AFTER SUCCESS
      setRows([]);

      //  REFRESH FROM BACKEND
      await fetchInventory();

      showSuccessToast("All selected serials saved successfully ✅");
    } catch (err) {
      console.error(err);
      showErrorToast("Save failed ❌");
    }
  };

  const handleProjectChange = (index, value) => {
    const updated = [...rows];
    updated[index].project = value;

    // reset custom field
    if (value !== "Other") {
      updated[index].custom_project = "";
    }

    setRows(updated);
  };

  const handleCustomProject = (index, value) => {
    const updated = [...rows];
    updated[index].custom_project = value;
    setRows(updated);
  };

  const handleReturn = async (serial) => {
    const confirm = window.confirm(
      "Are you sure you want to return this item?",
    );
    if (!confirm) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch(`${config.apiBaseURL}/inventory/${serial}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_taken: false,
          status: "Available",
          return_date: today,
        }),
      });

      if (!res.ok) throw new Error("Return failed");

      showSuccessToast("Returned successfully ✅");
      await fetchInventory();
    } catch (err) {
      console.error(err);
      showErrorToast("Return failed ❌");
    }
  };

  const filterInventory = (list) => {
    if (!searchTerm) return list;

    return list.filter((item) => {
      return Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  };

  return (
    <div className="container">
      <h2>CR Book</h2>

      <div className="top-bar">
        {/* LEFT (empty for balance) */}
        <div className="left-space"></div>

        {/* CENTER TABS */}
        <div className="tabs">
          <button
            onClick={() => setActiveTab("taken")}
            className={activeTab === "taken" ? "active-tab" : ""}
          >
            Taken
          </button>

          <button
            onClick={() => setActiveTab("returned")}
            className={activeTab === "returned" ? "active-tab" : ""}
          >
            Returned
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === "taken" ? (
            <button className="add-btn" onClick={handleAddRow}>
              + Add Component
            </button>
          ) : (
            <div className="add-placeholder"></div>
          )}
        </div>
      </div>
      {/*  SINGLE TABLE */}
      <table className="table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Category</th>
            <th>Component</th>
            <th>Specification</th>
            <th>UOM</th>
            <th>Vendor</th>
            <th>Taken By</th>
            {activeTab === "taken" && <th>Taken Date</th>}
            <th>Serial</th>
            <th>Project</th>
            <th>{activeTab === "taken" ? "Action" : "Return Date"}</th>{" "}
          </tr>
        </thead>

        <tbody>
          {/*  NEW ROWS AT TOP */}
          {activeTab === "taken" &&
            rows.map((row, i) => (
              <tr key={`new-${i}`} className="new-row">
                <td>{i + 1}</td>

                <td>
                  <select
                    value={row.category}
                    onChange={(e) => handleCategoryChange(i, e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {getCategories().map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </td>

                <td>
                  <select
                    value={row.component_type}
                    onChange={(e) => handleComponentChange(i, e.target.value)}
                    disabled={!row.category}
                  >
                    <option value="">Select Component</option>
                    {getComponentsByCategory(row.category).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </td>

                <td>{row.specification}</td>
                <td>{row.UOM}</td>
                <td>{row.vendor_name}</td>

                <td>
                  <select
                    value={row.taken_by}
                    onChange={(e) => handleTakenByChange(i, e.target.value)}
                  >
                    <option value="">Select User</option>
                    {registeredUsers.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  {row.taken_date
                    ? format(new Date(row.taken_date), "dd-MM-yyyy")
                    : "-"}
                </td>

                <td>
                  {row.component_type && (
                    <div className="serial-box">
                      {getSerials(row.category, row.component_type).map(
                        (item) => (
                          <label key={item.serial_number}>
                            <input
                              type="checkbox"
                              checked={(row.serial_numbers || []).includes(
                                item.serial_number,
                              )}
                              onChange={(e) =>
                                handleSerialSelect(
                                  i,
                                  item.serial_number,
                                  e.target.checked,
                                )
                              }
                            />
                            {item.serial_number}
                          </label>
                        ),
                      )}
                    </div>
                  )}
                </td>

                <td>
                  <select
                    value={row.project}
                    onChange={(e) => handleProjectChange(i, e.target.value)}
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.project_id} value={p.project_name}>
                        {p.project_name}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>

                  {row.project === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter project name"
                      value={row.custom_project}
                      onChange={(e) => handleCustomProject(i, e.target.value)}
                    />
                  )}
                </td>

                {/*  ACTION COLUMN */}
                <td className="action-cell">
                  <button className="save-btn" onClick={handleSubmit}>
                    Save
                  </button>

                  <button
                    className="close-btn"
                    onClick={() => handleRemoveRow(i)}
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))}

          {activeTab === "taken" &&
            filterInventory(takenInventory).map((item, index) => (
              <tr key={item.serial_number}>
                <td>{index + 1}</td>
                <td>{item.category}</td>
                <td>{item.component_type}</td>
                <td>{item.specification}</td>
                <td>{item.UOM}</td>
                <td>{item.vendor_name}</td>
                <td>{item.taken_by}</td>
                <td>
                  {item.taken_date
                    ? format(new Date(item.taken_date), "dd-MM-yyyy")
                    : "-"}
                </td>
                <td>{item.serial_number}</td>
                <td>{item.project_name}</td>

                {/*  RETURN BUTTON */}
                {activeTab === "taken" && (
                  <td>
                    <button
                      className="return-btn"
                      onClick={() => handleReturn(item.serial_number)}
                    >
                      Return
                    </button>
                  </td>
                )}
              </tr>
            ))}

          {activeTab === "returned" &&
            filterInventory(returnedInventory).map((item, index) => (
              <tr key={item.serial_number}>
                <td>{index + 1}</td>
                <td>{item.category}</td>
                <td>{item.component_type}</td>
                <td>{item.specification}</td>
                <td>{item.UOM}</td>
                <td>{item.vendor_name}</td>
                <td>{item.taken_by}</td>

                {/*  REMOVE taken_date from here */}

                <td>{item.serial_number}</td>
                <td>{item.project_name}</td>

                {/*  SHOW RETURN DATE INSTEAD */}
                {activeTab === "returned" && (
                  <td>
                    {item.return_date
                      ? format(new Date(item.return_date), "dd-MM-yyyy")
                      : "-"}
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>

      {/*  SAVE BUTTON ONLY WHEN ROWS EXIST */}
      {activeTab === "taken" && rows.length > 0 && (
        <div className="save">
          <button onClick={handleSubmit}>Save</button>
        </div>
      )}

      <ToastContainerComponent />
    </div>
  );
};

export default ComponentRequest;
