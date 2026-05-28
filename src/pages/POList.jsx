// import React, { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import config from "../Config"; // Import config for API endpoints
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { FaCalendarAlt } from "react-icons/fa";
// import { format } from "date-fns";
// import { showErrorToast, showSuccessToast, showWarningToast } from "./Toastify";
// import Filter from "../assets/Filter_icon.svg";

// const POOrderList = ({ user }) => {
//   const [poOrders, setPOOrders] = useState([]); // State to store PO orders
//   const [poMaster, setPOMaster] = useState([]); // State to store PO master data
//   const [vendorContact, setVendorContact] = useState(null);
//   const [vendorName, setVendorName] = useState(null);
//   const [poListData, setPOListData] = useState(null);
//   const [orderStatuses, setOrderStatuses] = useState([]); // State to store statuses for each PO
//   const [statusPopup, setStatusPopup] = useState(null); // State for status popup
//   const navigate = useNavigate(); // Navigation hook
//   const [showModal, setShowModal] = useState(false);
//   const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button
//   const datePickerRef = React.useRef(null);

//   const [currentPO, setCurrentPO] = useState(null); // Store the current PO for email

//   const [nameFilter, setNameFilter] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
//   const statusDropdownRef = useRef(null);

//   const [dateFilter, setDateFilter] = useState("");

//   const [sortField, setSortField] = useState("");
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [loading, setLoading] = useState(true);
//   const [showDateFilter, setShowDateFilter] = useState(false);
//   const [fromDate, setFromDate] = useState(null);
//   const [toDate, setToDate] = useState(null);

//   useEffect(() => {
//     fetchPOOrders();
//     fetchPOMaster();
//     fetchOrderStatuses();
//   }, []);

//   // The user object is now passed as a prop
//   const isAdmin = user?.role === "Admin";
//   const isProcurement = user?.role === "Procurement";
//   const isFinance = user?.role === "Finance";

//   useEffect(() => {
//     const container = document.getElementById("po-table-wrapper");

//     const handleScroll = () => {
//       if (container.scrollTop > 200) {
//         setShowScrollTop(true);
//       } else {
//         setShowScrollTop(false);
//       }
//     };

//     if (container) {
//       container.addEventListener("scroll", handleScroll);
//     }

//     return () => {
//       if (container) {
//         container.removeEventListener("scroll", handleScroll);
//       }
//     };
//   }, []);

//   const scrollToTop = () => {
//     const container = document.getElementById("po-table-wrapper");
//     if (container) {
//       container.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         statusDropdownRef.current &&
//         !statusDropdownRef.current.contains(event.target)
//       ) {
//         setStatusDropdownOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Fetch Vendor Contact and Name
//   const fetchVendorDetails = async (vendorId) => {
//     try {
//       // Fetch vendor contact details
//       const contactResponse = await fetch(
//         `${config.apiBaseURL}/vendor_sub_list/`
//       );
//       const contactResult = await contactResponse.json();
//       const contactDetails = contactResult.find(
//         (contact) => contact.vendor === vendorId
//       );
//       // console.log("Fetched vendor", vendorId);
//       // console.log("Contact details", contactResult);

//       // Fetch vendor name
//       const vendorResponse = await fetch(`${config.apiBaseURL}/vendor_list/`);
//       const vendorResult = await vendorResponse.json();
//       const vendorDetails = vendorResult.find(
//         (vendor) => vendor.vendor_id === vendorId
//       );

//       setVendorContact(contactDetails);
//       setVendorName(vendorDetails?.vendor_name);
//     } catch (err) {
//       console.error("Error fetching vendor details:", err);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const fetchPOListData = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/po_list/`);
//       const result = await response.json();
//       const filteredPO = result.find((po) => po.id === currentPO.id);
//       if (filteredPO) {
//         setPOListData(filteredPO);
//         fetchVendorDetails(filteredPO.cart_details.vendor_id); // Fetch vendor details
//       }
//     } catch (error) {
//       console.error("Error fetching PO list data:", error);
//     }
//   };

//   // Fetch PO orders
//   const fetchPOOrders = async () => {
//     try {
//       setLoading(true);

//       const response = await fetch(`${config.apiBaseURL}/po_list/`);
//       const result = await response.json();
//       if (Array.isArray(result)) {
//         setPOOrders(result);
//       } else {
//         console.error("Unexpected PO List API response:", result);
//         setPOOrders([]);
//       }
//     } catch (error) {
//       console.error("Error fetching PO List:", error);
//     } finally {
//       setLoading(false); // Stop loading after both calls
//     }
//   };

//   // Fetch PO master
//   const fetchPOMaster = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/po_master/`);
//       const result = await response.json();
//       if (Array.isArray(result)) {
//         setPOMaster(result);
//       } else {
//         console.error("Unexpected PO Master API response:", result);
//         setPOMaster([]);
//       }
//     } catch (error) {
//       console.error("Error fetching PO Master:", error);
//     }
//   };

//   // Fetch order statuses
//   const fetchOrderStatuses = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/order_view/`);
//       const result = await response.json();
//       if (Array.isArray(result)) {
//         setOrderStatuses(result);
//       } else {
//         console.error("Unexpected Order Status API response:", result);
//         setOrderStatuses([]);
//       }
//     } catch (error) {
//       console.error("Error fetching Order Status:", error);
//     }
//   };

//   const finalCost = (poId) => {
//     const relevantPOMaster = poMaster.filter((po) => po.PO_id === poId);
//     const finalPrice = relevantPOMaster.reduce((acc, po) => {
//       const final_cost = parseFloat(po.cart_details.total_cost || 0);
//       return (acc += final_cost);
//     }, 0);
//     return finalPrice;
//   };

//   // Combine PO and Statuses
//   const getAggregatedStatus = (poId) => {
//     const relevantPOMaster = poMaster.filter((po) => po.PO_id === poId);
//     const poMasterIds = relevantPOMaster.map((po) => po.id);
//     const relevantStatuses = orderStatuses.filter((status) =>
//       poMasterIds.includes(status.po_master_id)
//     );

//     if (relevantStatuses.length === 0)
//       return { status: "Pending", mixed: false };

//     const uniqueStatuses = new Set(
//       relevantStatuses.map((status) => {
//         if (status.received_status === "Received") return "Received";
//         if (status.customer_status === "Shipped") return "Shipped";
//         if (status.order_placed_status === "Ordered") return "Ordered";
//         return "Pending";
//       })
//     );

//     if (uniqueStatuses.size === 1) {
//       return { status: Array.from(uniqueStatuses)[0], mixed: false };
//     }
//     return { status: "In Progress", mixed: true };
//   };

//   const handleSort = (field) => {
//     if (sortField === field) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortField(field);
//       setSortOrder("asc");
//     }
//   };

//   const formatDate = (date) =>
//     date ? new Date(date).toLocaleDateString("en-CA") : "";

// const filteredPOOrders = poOrders
//   .filter((order) => {
//     const q = (nameFilter || "").trim().toLowerCase();
//     const matchesQuery =
//       !q ||
//       (order?.cart_details?.vendor_name || "").toLowerCase().includes(q) ||
//       String(order?.id || "").toLowerCase().includes(q); // PO ID match

//     const matchesStatus = statusFilter ? order.status === statusFilter : true;

//     const matchesDate =
//       fromDate && toDate
//         ? (() => {
//             const orderDate = new Date(order.date);
//             orderDate.setHours(0, 0, 0, 0);
//             return (
//               orderDate >= new Date(fromDate.setHours(0, 0, 0, 0)) &&
//               orderDate <= new Date(toDate.setHours(23, 59, 59, 999))
//             );
//           })()
//         : true;

//     return matchesQuery && matchesStatus && matchesDate;
//   })
//   .sort((a, b) => {
//     if (!sortField) return 0;

//     let aValue, bValue;
//     if (sortField === "id") {
//       aValue = a.id;
//       bValue = b.id;
//     } else if (sortField === "total_cost") {
//       aValue = finalCost(a.id);
//       bValue = finalCost(b.id);
//     } else if (sortField === "date") {
//       aValue = new Date(a.date);
//       bValue = new Date(b.date);
//     }

//     if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
//     if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
//     return 0;
//   });

//   // Close Status Popup
//   const handleClosePopup = () => {
//     setStatusPopup(null);
//   };

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchPOOrders();
//     fetchPOMaster();
//     fetchOrderStatuses();
//   }, []);

//   useEffect(() => {
//     if (currentPO) {
//       fetchPOListData();
//     }
//   }, [currentPO]); // Dependency array includes currentPO

//   const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
//   useEffect(() => {
//     if (statusDropdownOpen && statusDropdownRef.current) {
//       const rect = statusDropdownRef.current.getBoundingClientRect();
//       setDropdownCoords({
//         top: rect.bottom + window.scrollY,
//         left: rect.left + window.scrollX,
//       });
//     }
//   }, [statusDropdownOpen]);

//   return (
//     <div>
//       <div className="header">
//         <h2>PO Order List</h2>
//         <button
//           style={{
//             cursor: "pointer",
//             background: "transparent",
//             border: "none",
//           }}
//           title="Filter by Date"
//           onClick={() => setShowDateFilter(true)}
//         >
//           <img
//             src={Filter}
//             alt="Filter"
//             style={{ width: "25px", height: "30px" }}
//           />
//         </button>
//         {(fromDate || toDate) && (
//           <div style={{ fontSize: "14px", margin: "10px 0", color: "#555" }}>
//             🗓️ {fromDate && `From: ${format(fromDate, "dd-MM-yyyy")}`}
//             {fromDate && toDate && " | "}
//             {toDate && `To: ${format(toDate, "dd-MM-yyyy")}`}
//             <button
//               className="clear-date-button"
//               onClick={() => {
//                 setFromDate(null);
//                 setToDate(null);
//               }}
//               title="Clear Date Filter"
//             >
//               Clear
//             </button>
//           </div>
//         )}
//       </div>
//       <div class="center-wrapper">
//         <div className="search-bar-container">
//           <input
//             type="text"
//             placeholder="Filter by PO-ID  or Vendor Name"
//             value={nameFilter}
//             onChange={(e) => setNameFilter(e.target.value)}
//             className="search-bar"
//           />
//           <span className="search-icon">
//             <i className="fa fa-search" aria-hidden="true"></i>
//           </span>
//         </div>
//       </div>

//       <div id="po-table-wrapper" className="table-container">
//         {poOrders.length === 0 ? (
//           <p style={{ color: "gray" }}>No Purchase Orders found.</p>
//         ) : (
//           <table>
//             <thead>
//               <tr>
//                 <th
//                   onClick={() => handleSort("id")}
//                   style={{ cursor: "pointer", textDecoration: "underline" }}
//                 >
//                   PO ID{" "}
//                   {sortField === "id"
//                     ? sortOrder === "asc"
//                       ? " 🔼"
//                       : " 🔽"
//                     : ""}
//                 </th>
//                 <th className="vendor-name-filters">Vendor Name</th>

//                 <th className="status-dropdown-wrapper" ref={statusDropdownRef}>
//                   <div
//                     className="status-dropdown"
//                     onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
//                   >
//                     {statusFilter || "Status"}
//                     <span className="status-dropdown-icon">▼</span>
//                   </div>

//                   {statusDropdownOpen && (
//                     <div
//                       className="status-dropdown-options"
//                       style={{
//                         position: "fixed",
//                         top: dropdownCoords.top,
//                         left: dropdownCoords.left,
//                         zIndex: 9999,
//                         width: "150px",
//                       }}
//                     >
//                       <div
//                         className="status-dropdown-option"
//                         onClick={() => {
//                           setStatusFilter("");
//                           setStatusDropdownOpen(false);
//                         }}
//                       >
//                         All
//                       </div>
//                       {[
//                         "Pending",
//                         "Ordered",
//                         "Shipped",
//                         "Received",
//                         "Cancelled",
//                       ].map((status) => (
//                         <div
//                           key={status}
//                           className="status-dropdown-option"
//                           onClick={() => {
//                             setStatusFilter(status);
//                             setStatusDropdownOpen(false);
//                           }}
//                         >
//                           {status}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </th>

//                 <th
//                   onClick={() => handleSort("total_cost")}
//                   style={{ cursor: "pointer", textDecoration: "underline" }}
//                 >
//                   Total Cost{" "}
//                   {sortField === "total_cost"
//                     ? sortOrder === "asc"
//                       ? " 🔼"
//                       : " 🔽"
//                     : ""}
//                 </th>
//                 <th style={{ cursor: "pointer" }}>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "6px",
//                     }}
//                   >
//                     {!dateFilter && <span style={{}}>Date</span>}
//                     <FaCalendarAlt
//                       style={{
//                         fontSize: "14px",
//                         cursor: "pointer",
//                         color: "#333",
//                       }}
//                       // onClick={() => datePickerRef.current.setOpen(true)}
//                     />
//                   </div>
//                 </th>

//                 {/* {(isAdmin || isProcurement) && <th>Actions</th>} */}
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td
//                     colSpan="5"
//                     style={{ textAlign: "center", padding: "10px" }}
//                   >
//                     <div className="spinner"></div>
//                     Loading PO List...
//                   </td>
//                 </tr>
//               ) : filteredPOOrders.length === 0 && fromDate && toDate ? (
//                 <tr>
//                   <td
//                     colSpan="5"
//                     style={{
//                       textAlign: "center",
//                       color: "gray",
//                       padding: "10px",
//                     }}
//                   >
//                     No data for selected date range:{" "}
//                     {format(fromDate, "dd-MM-yyyy")} to{" "}
//                     {format(toDate, "dd-MM-yyyy")}
//                   </td>
//                 </tr>
//               ) : filteredPOOrders.length === 0 && nameFilter.trim() ? (
//                 <tr>
//                   <td
//                     colSpan="5"
//                     style={{
//                       textAlign: "center",
//                       color: "gray",
//                       padding: "10px",
//                     }}
//                   >
//                     No data found for name "{nameFilter}"
//                   </td>
//                 </tr>
//               ) : filteredPOOrders.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="5"
//                     style={{
//                       textAlign: "center",
//                       color: "gray",
//                       padding: "10px",
//                     }}
//                   >
//                     No purchase orders available.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredPOOrders.map((order) => {
//                   const { status } = getAggregatedStatus(order.id);
//                   const finalPrice = finalCost(order.id);
//                   return (
//                     <tr key={order.id}>
//                       <td
//                         style={{
//                           cursor: "pointer",
//                           textDecoration: "underline",
//                         }}
//                         onClick={() => navigate(`/po-details/${order.id}`)}
//                       >
//                         {order.id}
//                       </td>
//                       <td>{order.cart_details.vendor_name}</td>
//                       <td>{order.status}</td>
//                       <td style={{ textAlign: "right" }}>
//                         ₹
//                         {parseFloat(finalPrice).toLocaleString("en-IN", {
//                           minimumFractionDigits: 2,
//                           maximumFractionDigits: 2,
//                         })}
//                       </td>
//                       <td>{format(new Date(order.date), "dd-MM-yyyy")}</td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Status Popup */}
//       {statusPopup && (
//         <div className="popup">
//           <h3>Status for PO ID: {statusPopup.poId}</h3>
//           {Object.entries(statusPopup.groupedStatuses).map(
//             ([statusType, components]) => (
//               <div key={statusType}>
//                 <h4>{statusType}</h4>
//                 {components.length > 0 ? (
//                   <ul>
//                     {components.map((componentId, idx) => (
//                       <li key={idx}>{componentId}</li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p>No components</p>
//                 )}
//               </div>
//             )
//           )}
//           <button onClick={handleClosePopup}>Close</button>
//         </div>
//       )}

//       {showDateFilter && (
//         <div className="modal-overlay" onClick={() => setShowDateFilter(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <span
//               className="x-button"
//               style={{ fontWeight: "lighter" }}
//               onClick={() => setShowDateFilter(false)}
//             >
//               &times;
//             </span>

//             <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>
//               Filter Date
//             </h4>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//               }}
//               className=""
//             >
//               <label style={{ whiteSpace: "nowrap" }}>From Date:</label>
//               <div className="date-input-container">
//                 <DatePicker
//                   selected={fromDate}
//                   onChange={(date) => setFromDate(date)} // required to update the value
//                   dateFormat="dd-MM-yyyy"
//                   placeholderText="dd-mm-yyyy"
//                   className="input1"
//                   showMonthDropdown
//                   showYearDropdown
//                   dropdownMode="select"
//                   popperPlacement="bottom"
//                   portalId="datepicker-portal-target"
//                   style={{ marginTop: "20px" }}
//                 />

//                 <i
//                   className="fas fa-calendar-alt calendar-icon"
//                   style={{ marginTop: "-4px" }}
//                 ></i>
//               </div>
//             </div>

//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "10px",
//               }}
//             >
//               <label style={{ whiteSpace: "nowrap" }}>To Date:</label>
//               <div className="date-input-container">
//                 <DatePicker
//                   selected={toDate}
//                   onChange={(date) => setToDate(date)}
//                   dateFormat="dd-MM-yyyy"
//                   placeholderText="dd-mm-yyyy"
//                   className="input1"
//                   showMonthDropdown
//                   showYearDropdown
//                   dropdownMode="select"
//                   popperPlacement="bottom-start"
//                   portalId="datepicker-portal-target"
//                 />

//                 <i
//                   className="fas fa-calendar-alt calendar-icon"
//                   style={{ marginTop: "-4px" }}
//                 ></i>
//               </div>
//             </div>

//             <div
//               className="modal-actions"
//               style={{
//                 marginTop: "10px",
//                 display: "flex",
//                 gap: "10px",
//                 justifyContent: "flex-end",
//               }}
//             >
//               <button
//                 onClick={() => {
//                   setShowDateFilter(false); // just close the popup
//                 }}
//               >
//                 Apply
//               </button>

//               <button
//                 onClick={() => {
//                   setFromDate(null);
//                   setToDate(null);
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//           <div id="datepicker-portal-target"></div>
//         </div>
//       )}
//       <style>{`
//               .disabled-row {
//                 background-color: #e0e0e0;
//                 color: #a0a0a0;
//                 pointer-events: none;
//               }
//               .disabled-row button {
//                 cursor: not-allowed;
//               }

//               .react-datepicker__day,
//               .react-datepicker__day-name {
//                 width: 2em;
//                 line-height: 2em;
//               }

//               .react-datepicker__current-month,
//               .react-datepicker__header {
//                 font-size: 14px;
//               }

//               .return-button {
//                 background-color: red;
//                 color: white;
//                 border: none;
//                 padding: 5px 10px;
//                 cursor: pointer;
//                 border-radius: 4px;
//                 font-size: 12px;
//                 margin-left: 10px;
//               }
//               .return-button:hover {
//                 background-color: darkred;
//               }
//               .modal {
//                 position: fixed;
//                 top: 50%;
//                 left: 50%;
//                 display: flex;
//                 justify-content: center;
//                 align-items: center;
//                 transform: translate(-50%, -50%);
//               }
//               .modal-content {
//                 background: white;
//                 padding: 15px;
//                 width: 350px;
//                 text-align: center;
//                 position:absolute;
//               }
//               .modal-content input {
//                 width: 100%;
//                 padding: 8px;
//                 margin-top: 5px;
//                 margin-bottom: 10px;
//                 border: 1px solid #ccc;
//                 border-radius: 5px;
//               }
//               .modal-buttons {
//                 display: flex;
//                 justify-content: space-between;
//               }
//               .confirm-button {
//                 background-color: green;
//                 color: white;
//                 padding: 8px 12px;
//                 border: none;
//                 cursor: pointer;
//                 border-radius: 5px;
//               }
//               .confirm-button:hover {
//                 background-color: darkgreen;
//               }
//               .cancel-button {
//                 background-color: gray;
//                 color: white;
//                 padding: 8px 12px;
//                 border: none;
//                 cursor: pointer;
//                 border-radius: 5px;
//               }
//               .cancel-button:hover {
//                 background-color: darkgray;
//               }

//             `}</style>

//       {showScrollTop && (
//         <button
//           style={{
//             position: "fixed",
//             bottom: "20px",
//             right: "20px",
//             padding: "10px 15px",
//             fontSize: "18px",
//             backgroundColor: "#f57c00",
//             color: "white",
//             border: "none",
//             borderRadius: "5px",
//             cursor: "pointer",
//             zIndex: 1000,
//           }}
//           onClick={scrollToTop}
//         >
//           ↑
//         </button>
//       )}
//     </div>
//   );
// };

// export default POOrderList;

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import config from "../Config"; // Import config for API endpoints
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";
import { showErrorToast, showSuccessToast, showWarningToast } from "./Toastify";
import Filter from "../assets/Filter_icon.svg";

const POOrderList = ({ user }) => {
  const [poOrders, setPOOrders] = useState([]); // State to store PO orders
  const [poMaster, setPOMaster] = useState([]); // State to store PO master data
  const [vendorContact, setVendorContact] = useState(null);
  const [vendorName, setVendorName] = useState(null);
  const [poListData, setPOListData] = useState(null);
  const [orderStatuses, setOrderStatuses] = useState([]); // State to store statuses for each PO
  const [statusPopup, setStatusPopup] = useState(null); // State for status popup
  const navigate = useNavigate(); // Navigation hook
  const [showModal, setShowModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button
  const datePickerRef = React.useRef(null);

  const [currentPO, setCurrentPO] = useState(null); // Store the current PO for email

  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  const [dateFilter, setDateFilter] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  useEffect(() => {
    fetchPOOrders();
    fetchPOMaster();
    fetchOrderStatuses();
  }, []);

  // The user object is now passed as a prop
  const isAdmin = user?.role === "Admin";
  const isProcurement = user?.role === "Procurement";
  const isFinance = user?.role === "Finance";

  useEffect(() => {
    const container = document.getElementById("po-table-wrapper");

    const handleScroll = () => {
      if (container.scrollTop > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    const container = document.getElementById("po-table-wrapper");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch Vendor Contact and Name
  const fetchVendorDetails = async (vendorId) => {
    try {
      // Fetch vendor contact details
      const contactResponse = await fetch(
        `${config.apiBaseURL}/vendor_sub_list/`,
      );
      const contactResult = await contactResponse.json();
      const contactDetails = contactResult.find(
        (contact) => contact.vendor === vendorId,
      );
      // console.log("Fetched vendor", vendorId);
      // console.log("Contact details", contactResult);

      // Fetch vendor name
      const vendorResponse = await fetch(`${config.apiBaseURL}/vendor_list/`);
      const vendorResult = await vendorResponse.json();
      const vendorDetails = vendorResult.find(
        (vendor) => vendor.vendor_id === vendorId,
      );

      setVendorContact(contactDetails);
      setVendorName(vendorDetails?.vendor_name);
    } catch (err) {
      console.error("Error fetching vendor details:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchPOListData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/po_list/`);
      const result = await response.json();
      const filteredPO = result.find((po) => po.id === currentPO.id);
      if (filteredPO) {
        setPOListData(filteredPO);
        fetchVendorDetails(filteredPO.cart_details.vendor_id); // Fetch vendor details
      }
    } catch (error) {
      console.error("Error fetching PO list data:", error);
    }
  };

  // Fetch PO orders
  const fetchPOOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${config.apiBaseURL}/po_list/`);
      const result = await response.json();
      if (Array.isArray(result)) {
        setPOOrders(result);
      } else {
        console.error("Unexpected PO List API response:", result);
        setPOOrders([]);
      }
    } catch (error) {
      console.error("Error fetching PO List:", error);
    } finally {
      setLoading(false); // Stop loading after both calls
    }
  };

  // Fetch PO master
  const fetchPOMaster = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/po_master/`);
      const result = await response.json();
      if (Array.isArray(result)) {
        setPOMaster(result);
      } else {
        console.error("Unexpected PO Master API response:", result);
        setPOMaster([]);
      }
    } catch (error) {
      console.error("Error fetching PO Master:", error);
    }
  };

  // Fetch order statuses
  const fetchOrderStatuses = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/order_view/`);
      const result = await response.json();
      if (Array.isArray(result)) {
        setOrderStatuses(result);
      } else {
        console.error("Unexpected Order Status API response:", result);
        setOrderStatuses([]);
      }
    } catch (error) {
      console.error("Error fetching Order Status:", error);
    }
  };

  const finalCost = (poId) => {
    const relevantPOMaster = poMaster.filter((po) => po.PO_id === poId);
    const finalPrice = relevantPOMaster.reduce((acc, po) => {
      const final_cost = parseFloat(po.cart_details.total_cost || 0);
      return (acc += final_cost);
    }, 0);
    return finalPrice;
  };

  // Combine PO and Statuses
  const getAggregatedStatus = (poId) => {
    const relevantPOMaster = poMaster.filter((po) => po.PO_id === poId);
    const poMasterIds = relevantPOMaster.map((po) => po.id);
    const relevantStatuses = orderStatuses.filter((status) =>
      poMasterIds.includes(status.po_master_id),
    );

    if (relevantStatuses.length === 0)
      return { status: "Pending", mixed: false };

    const uniqueStatuses = new Set(
      relevantStatuses.map((status) => {
        if (status.received_status === "Received") return "Received";
        if (status.customer_status === "Shipped") return "Shipped";
        if (status.order_placed_status === "Ordered") return "Ordered";
        return "Pending";
      }),
    );

    if (uniqueStatuses.size === 1) {
      return { status: Array.from(uniqueStatuses)[0], mixed: false };
    }
    return { status: "In Progress", mixed: true };
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-CA") : "";

  const filteredPOOrders = poOrders
    .filter((order) => {
      const q = (nameFilter || "").trim().toLowerCase();
      const matchesQuery =
        !q ||
        (order?.cart_details?.vendor_name || "").toLowerCase().includes(q) ||
        String(order?.id || "")
          .toLowerCase()
          .includes(q); // PO ID match

      const matchesStatus = statusFilter ? order.status === statusFilter : true;

      const matchesDate =
        fromDate && toDate
          ? (() => {
              const orderDate = new Date(order.date);
              orderDate.setHours(0, 0, 0, 0);
              return (
                orderDate >= new Date(fromDate.setHours(0, 0, 0, 0)) &&
                orderDate <= new Date(toDate.setHours(23, 59, 59, 999))
              );
            })()
          : true;

      return matchesQuery && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue, bValue;
      if (sortField === "id") {
        aValue = a.id;
        bValue = b.id;
      } else if (sortField === "vendor_name") {
        aValue = a?.cart_details?.vendor_name?.toLowerCase() || "";
        bValue = b?.cart_details?.vendor_name?.toLowerCase() || "";
      } else if (sortField === "total_cost") {
        aValue = finalCost(a.id);
        bValue = finalCost(b.id);
      } else if (sortField === "date") {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Close Status Popup
  const handleClosePopup = () => {
    setStatusPopup(null);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPOOrders();
    fetchPOMaster();
    fetchOrderStatuses();
  }, []);

  useEffect(() => {
    if (currentPO) {
      fetchPOListData();
    }
  }, [currentPO]); // Dependency array includes currentPO

  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (statusDropdownOpen && statusDropdownRef.current) {
      const rect = statusDropdownRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [statusDropdownOpen]);

  return (
    <div>
      <div className="header">
        <h2>PO Order List</h2>
        <button
          style={{
            cursor: "pointer",
            background: "transparent",
            border: "none",
          }}
          title="Filter by Date"
          onClick={() => setShowDateFilter(true)}
        >
          <img
            src={Filter}
            alt="Filter"
            style={{ width: "25px", height: "30px" }}
          />
        </button>
        {(fromDate || toDate) && (
          <div style={{ fontSize: "14px", margin: "10px 0", color: "#555" }}>
            🗓️ {fromDate && `From: ${format(fromDate, "dd-MM-yyyy")}`}
            {fromDate && toDate && " | "}
            {toDate && `To: ${format(toDate, "dd-MM-yyyy")}`}
            <button
              className="clear-date-button"
              onClick={() => {
                setFromDate(null);
                setToDate(null);
              }}
              title="Clear Date Filter"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <div class="center-wrapper">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Filter by PO-ID  or Vendor Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="search-bar"
          />
          <span className="search-icon">
            <i className="fa fa-search" aria-hidden="true"></i>
          </span>
        </div>
      </div>

      <div id="po-table-wrapper" className="table-container">
        {poOrders.length === 0 ? (
          <p style={{ color: "gray" }}>No Purchase Orders found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("id")}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  PO ID{" "}
                  {sortField === "id"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th
                  onClick={() => handleSort("vendor_name")}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  Vendor Name{" "}
                  {sortField === "vendor_name"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th className="status-dropdown-wrapper" ref={statusDropdownRef}>
                  <div
                    className="status-dropdown"
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  >
                    {statusFilter || "Status"}
                    <span className="status-dropdown-icon">▼</span>
                  </div>

                  {statusDropdownOpen && (
                    <div
                      className="status-dropdown-options"
                      style={{
                        position: "fixed",
                        top: dropdownCoords.top,
                        left: dropdownCoords.left,
                        zIndex: 9999,
                        width: "150px",
                      }}
                    >
                      <div
                        className="status-dropdown-option"
                        onClick={() => {
                          setStatusFilter("");
                          setStatusDropdownOpen(false);
                        }}
                      >
                        All
                      </div>
                      {[
                        "Pending",
                        "Ordered",
                        "Shipped",
                        "Received",
                        "Cancelled",
                      ].map((status) => (
                        <div
                          key={status}
                          className="status-dropdown-option"
                          onClick={() => {
                            setStatusFilter(status);
                            setStatusDropdownOpen(false);
                          }}
                        >
                          {status}
                        </div>
                      ))}
                    </div>
                  )}
                </th>

                <th
                  onClick={() => handleSort("total_cost")}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  Total Cost{" "}
                  {sortField === "total_cost"
                    ? sortOrder === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : ""}
                </th>
                <th style={{ cursor: "pointer" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {!dateFilter && <span style={{}}>Date</span>}
                    <FaCalendarAlt
                      style={{
                        fontSize: "14px",
                        cursor: "pointer",
                        color: "#333",
                      }}
                      // onClick={() => datePickerRef.current.setOpen(true)}
                    />
                  </div>
                </th>

                {/* {(isAdmin || isProcurement) && <th>Actions</th>} */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "10px" }}
                  >
                    <div className="spinner"></div>
                    Loading PO List...
                  </td>
                </tr>
              ) : filteredPOOrders.length === 0 && fromDate && toDate ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "gray",
                      padding: "10px",
                    }}
                  >
                    No data for selected date range:{" "}
                    {format(fromDate, "dd-MM-yyyy")} to{" "}
                    {format(toDate, "dd-MM-yyyy")}
                  </td>
                </tr>
              ) : filteredPOOrders.length === 0 && nameFilter.trim() ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "gray",
                      padding: "10px",
                    }}
                  >
                    No data found for name "{nameFilter}"
                  </td>
                </tr>
              ) : filteredPOOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "gray",
                      padding: "10px",
                    }}
                  >
                    No purchase orders available.
                  </td>
                </tr>
              ) : (
                filteredPOOrders.map((order) => {
                  const { status } = getAggregatedStatus(order.id);
                  const finalPrice = finalCost(order.id);
                  return (
                    <tr key={order.id}>
                      <td
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => navigate(`/po-details/${order.id}`)}
                      >
                        {order.id}
                      </td>
                      <td>{order.cart_details.vendor_name}</td>
                      <td>{order.status}</td>
                      <td style={{ textAlign: "right" }}>
                        ₹
                        {parseFloat(finalPrice).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>{format(new Date(order.date), "dd-MM-yyyy")}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Status Popup */}
      {statusPopup && (
        <div className="popup">
          <h3>Status for PO ID: {statusPopup.poId}</h3>
          {Object.entries(statusPopup.groupedStatuses).map(
            ([statusType, components]) => (
              <div key={statusType}>
                <h4>{statusType}</h4>
                {components.length > 0 ? (
                  <ul>
                    {components.map((componentId, idx) => (
                      <li key={idx}>{componentId}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No components</p>
                )}
              </div>
            ),
          )}
          <button onClick={handleClosePopup}>Close</button>
        </div>
      )}

      {showDateFilter && (
        <div className="modal-overlay" onClick={() => setShowDateFilter(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span
              className="x-button"
              style={{ fontWeight: "lighter" }}
              onClick={() => setShowDateFilter(false)}
            >
              &times;
            </span>

            <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>
              Filter Date
            </h4>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              className=""
            >
              <label style={{ whiteSpace: "nowrap" }}>From Date:</label>
              <div className="date-input-container">
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)} // required to update the value
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  popperPlacement="bottom"
                  portalId="datepicker-portal-target"
                  style={{ marginTop: "20px" }}
                />

                <i
                  className="fas fa-calendar-alt calendar-icon"
                  style={{ marginTop: "-4px" }}
                ></i>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <label style={{ whiteSpace: "nowrap" }}>To Date:</label>
              <div className="date-input-container">
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  popperPlacement="bottom-start"
                  portalId="datepicker-portal-target"
                />

                <i
                  className="fas fa-calendar-alt calendar-icon"
                  style={{ marginTop: "-4px" }}
                ></i>
              </div>
            </div>

            <div
              className="modal-actions"
              style={{
                marginTop: "10px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowDateFilter(false); // just close the popup
                }}
              >
                Apply
              </button>

              <button
                onClick={() => {
                  setFromDate(null);
                  setToDate(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          <div id="datepicker-portal-target"></div>
        </div>
      )}
      <style>{`
              .disabled-row {
                background-color: #e0e0e0;
                color: #a0a0a0;
                pointer-events: none;
              }
              .disabled-row button {
                cursor: not-allowed;
              }
      
              .react-datepicker__day,
              .react-datepicker__day-name {
                width: 2em;
                line-height: 2em;
              }
      
              .react-datepicker__current-month,
              .react-datepicker__header {
                font-size: 14px;
              }
      
              .return-button {
                background-color: red;
                color: white;
                border: none;
                padding: 5px 10px;
                cursor: pointer;
                border-radius: 4px;
                font-size: 12px;
                margin-left: 10px;
              }
              .return-button:hover {
                background-color: darkred;
              }
              .modal {
                position: fixed;
                top: 50%;
                left: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                transform: translate(-50%, -50%);
              }
              .modal-content {
                background: white;
                padding: 15px; 
                width: 350px;
                text-align: center;
                position:absolute;
              }
              .modal-content input {
                width: 100%;
                padding: 8px;
                margin-top: 5px;
                margin-bottom: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
              }
              .modal-buttons {
                display: flex;
                justify-content: space-between;
              }
              .confirm-button {
                background-color: green;
                color: white;
                padding: 8px 12px;
                border: none;
                cursor: pointer;
                border-radius: 5px;
              }
              .confirm-button:hover {
                background-color: darkgreen;
              }
              .cancel-button {
                background-color: gray;
                color: white;
                padding: 8px 12px;
                border: none;
                cursor: pointer;
                border-radius: 5px;
              }
              .cancel-button:hover {
                background-color: darkgray;
              }
      
      
            `}</style>

      {showScrollTop && (
        <button
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 15px",
            fontSize: "18px",
            backgroundColor: "#f57c00",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: 1000,
          }}
          onClick={scrollToTop}
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default POOrderList;
