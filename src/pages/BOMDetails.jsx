// import React, { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import config from "../Config";
// import DeleteIcon from "../assets/Delete.png";
// import AddIcon from "../assets/Add.png";
// import { format, parseISO } from "date-fns";

// import {
//   showSuccessToast,
//   showErrorToast,
//   showInfoToast,
//   showWarningToast,
//   ToastContainerComponent,
// } from "./Toastify.jsx";
// import { FaArrowLeft } from "react-icons/fa";
// import { useAuth } from "../AuthContext.jsx";

// const BOMDetails = () => {
//   const { user } = useAuth();
//   const { bomId } = useParams();
//   const navigate = useNavigate();

//   const [selectedBom, setSelectedBom] = useState(null);
//   const [selectedComponents, setSelectedComponents] = useState([]);
//   const [showAddComponentForm, setShowAddComponentForm] = useState(false);
//   const [searchText, setSearchText] = useState("");

//   const [newComponent, setNewComponent] = useState({
//     componentType: "",
//     component: "",
//     vendor: "",
//     quantity: "",
//     price: "",
//     tax: "",
//   });

//   const [vendors, setVendors] = useState([]);
//   const [components, setComponents] = useState([]);
//   const [loadingVendors, setLoadingVendors] = useState(true);
//   const [loadingComponents, setLoadingComponents] = useState(true);
//   const [priceTables, setPriceTables] = useState([]);
//   const [showLatestPrice, setShowLatestPrice] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [vendorMasterData, setVendorMasterData] = useState([]);

//   const totalQuantity = useMemo(
//     () =>
//       (selectedComponents || []).reduce(
//         (sum, row) => sum + (Number(row?.quantity) || 0),
//         0,
//       ),
//     [selectedComponents],
//   );

//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         setLoading(true);
//         setLoadingComponents(true);
//         setLoadingVendors(true);

//         const [
//           bomRes,
//           bomMasterRes,
//           vendorRes,
//           componentRes,
//           priceRes,
//           vendorMasterRes,
//         ] = await Promise.all([
//           fetch(`${config.apiBaseURL}/bom_list/`),
//           fetch(`${config.apiBaseURL}/bom_master/`),
//           fetch(`${config.apiBaseURL}/vendor_list/`),
//           fetch(`${config.apiBaseURL}/component/`),
//           fetch(`${config.apiBaseURL}/price_tables/`),
//           fetch(`${config.apiBaseURL}/vendor_master/`),
//         ]);

//         const [
//           bomData,
//           bomMasterData,
//           vendorData,
//           componentData,
//           priceData,
//           vendorMasterJson,
//         ] = await Promise.all([
//           bomRes.json(),
//           bomMasterRes.json(),
//           vendorRes.json(),
//           componentRes.json(),
//           priceRes.json(),
//           vendorMasterRes.json(),
//         ]);

//         setSelectedBom(bomData.find((b) => b.bom_id === bomId) || null);
//         setSelectedComponents(bomMasterData.filter((b) => b.bom === bomId));
//         setVendors(vendorData || []);
//         setComponents(componentData || []);
//         setPriceTables(priceData || []);
//         setVendorMasterData(vendorMasterJson || []);
//       } catch (err) {
//         console.error("Error loading BOM data:", err);
//         showErrorToast("Failed to load BOM details.");
//       } finally {
//         setLoading(false);
//         setLoadingComponents(false);
//         setLoadingVendors(false);
//       }
//     };

//     fetchAllData();
//   }, [bomId]);

//   const fmtINR = (n) =>
//     `₹${(Number.isFinite(n) ? n : 0).toLocaleString("en-IN", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })}`;

//   const getLatestPriceInfo = (componentObj, vendorObj) => {
//     if (!componentObj || !vendorObj) return { price: "-", tax: "-", date: "-" };

//     const { component_id } = componentObj;
//     const { vendor_id } = vendorObj;

//     const vendorEntry = vendorMasterData.find(
//       (entry) =>
//         entry.component_id === component_id && entry.vendor === vendor_id,
//     );

//     if (!vendorEntry) return { price: "-", tax: "-", date: "-" };

//     const productId = vendorEntry.product_id;
//     const prices = priceTables.filter((entry) => entry.product === productId);
//     if (prices.length === 0) return { price: "-", tax: "-", date: "-" };

//     const latest = prices.sort(
//       (a, b) => new Date(b.current_time) - new Date(a.current_time),
//     )[0];

//     return {
//       price: parseFloat(latest.price),
//       tax: parseFloat(latest?.tax ?? 0),
//       date: format(parseISO(latest.current_time), "dd-MM-yyyy"),
//     };
//   };

//   const resetNewComponent = () => {
//     setNewComponent({
//       componentType: "",
//       component: "",
//       vendor: "",
//       quantity: "",
//       price: "",
//       tax: "",
//     });
//   };

//   const handleAddComponent = async () => {
//     try {
//       const exists = selectedComponents.some(
//         (component) =>
//           component.component?.component_id === newComponent.component,
//       );

//       if (exists) {
//         showWarningToast("This component is already added to the BOM.");
//         return;
//       }

//       if (
//         !newComponent.component ||
//         !newComponent.vendor ||
//         !newComponent.quantity
//       ) {
//         showInfoToast("All fields are required.");
//         return;
//       }

//       const matchedEntry = vendorMasterData.find(
//         (entry) =>
//           entry.component_id === newComponent.component &&
//           entry.vendor === newComponent.vendor,
//       );

//       if (!matchedEntry) {
//         showInfoToast("No vendor entry found for the selected component.");
//         return;
//       }

//       const productId = matchedEntry.product_id;

//       const matchingPrices = priceTables.filter(
//         (entry) => entry.product === productId,
//       );
//       const latestPriceEntry = matchingPrices.sort(
//         (a, b) => new Date(b.current_time) - new Date(a.current_time),
//       )[0];

//       if (!latestPriceEntry) {
//         showInfoToast("No price data found for this component.");
//         return;
//       }

//       const latestDate = latestPriceEntry.current_time.split("T")[0];

//       const payload = {
//         bom: bomId,
//         component: newComponent.component,
//         vendor: newComponent.vendor,
//         quantity: newComponent.quantity,
//         price: latestPriceEntry.price,
//         tax: latestPriceEntry.tax,
//         date: latestDate,
//       };

//       const response = await fetch(`${config.apiBaseURL}/bom_master/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         showSuccessToast("Component added successfully!");
//         const refreshed = await fetch(`${config.apiBaseURL}/bom_master/`);
//         const updated = await refreshed.json();
//         setSelectedComponents(updated.filter((b) => b.bom === bomId));
//         setShowAddComponentForm(false);
//         resetNewComponent();
//       } else {
//         const error = await response.json();
//         showErrorToast(`Failed to add component: ${JSON.stringify(error)}`);
//       }
//     } catch (error) {
//       console.error("Error adding component:", error);
//       showErrorToast("Error while adding component.");
//     }
//   };

//   const handleDeleteComponent = async (bomComponentId) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this component from the BOM?",
//       )
//     )
//       return;

//     try {
//       const response = await fetch(
//         `${config.apiBaseURL}/bom_master/${bomComponentId}/`,
//         {
//           method: "DELETE",
//         },
//       );

//       if (response.ok) {
//         showSuccessToast("Component deleted successfully.");
//         setSelectedComponents((prev) =>
//           prev.filter((component) => component.id !== bomComponentId),
//         );
//       } else {
//         showErrorToast("Failed to delete component.");
//       }
//     } catch (error) {
//       console.error("Error deleting component:", error);
//       showErrorToast("An error occurred while deleting.");
//     }
//   };

//   const calculateTotalPrice = (useLatest = false) => {
//     let baseTotal = 0;
//     let totalTaxAmount = 0;

//     selectedComponents.forEach((row) => {
//       const qty = parseFloat(row.quantity || 0);

//       let unitPrice = parseFloat(row.price || 0);
//       let taxRate = parseFloat(row.tax || 0);

//       if (useLatest) {
//         const latest = getLatestPriceInfo(row.component, row.vendor);
//         if (Number.isFinite(latest.price)) unitPrice = latest.price;
//         if (Number.isFinite(latest.tax)) taxRate = latest.tax;
//       }

//       const base = unitPrice * qty;
//       const taxAmount = (base * taxRate) / 100;

//       baseTotal += base;
//       totalTaxAmount += taxAmount;
//     });

//     return {
//       baseTotal,
//       totalTaxAmount,
//       grandTotal: baseTotal + totalTaxAmount,
//     };
//   };

//   const generateCSV = (data, totals, filename = "BOM_Report") => {
//     const headers = [
//       "S.No",
//       "Category",
//       "Component Type",
//       "Specification",
//       "UOM",
//       "Quantity",
//       "Vendor",
//       "Date",
//       "Price",
//       "Tax",
//       "Latest Price",
//       "Latest Date",
//     ];

//     const rows = data.map((item) =>
//       headers
//         .map((h) => `"${String(item[h] ?? "").replace(/"/g, '""')}"`)
//         .join(","),
//     );

//     const totalRows = [
//       [],
//       ["", "", "", "", "", "", "", "Total Base Price:", `₹${totals.baseTotal}`],
//       ["", "", "", "", "", "", "", "Total Tax (GST):", `₹${totals.totalTax}`],
//       ["", "", "", "", "", "", "", "Grand Total:", `₹${totals.grandTotal}`],
//     ].map((row) => row.join(","));

//     const csvContent = [headers.join(","), ...rows, ...totalRows].join("\n");

//     const BOM = "\uFEFF";
//     const blob = new Blob([BOM + csvContent], {
//       type: "text/csv;charset=utf-8;",
//     });

//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.setAttribute("download", `${filename}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleGenerateReport = () => {
//     if (!selectedComponents || selectedComponents.length === 0) {
//       showInfoToast("No components selected for report.");
//       return;
//     }

//     const data = selectedComponents.map((component, index) => {
//       const { price, tax, date } = getLatestPriceInfo(
//         component.component,
//         component.vendor,
//       );

//       return {
//         "S.No": index + 1,
//         Category: component.component.category,
//         "Component Type": component.component.component_type,
//         Specification: component.component.component_specification,
//         UOM: component.component.unit_of_measurement,
//         Quantity: component.quantity,
//         Vendor: component.vendor.vendor_name,
//         Date: component.date
//           ? format(parseISO(component.date), "dd-MM-yyyy")
//           : "-",
//         Price: `₹${parseFloat(component.price || 0).toFixed(2)}`,
//         Tax: `${component.tax}%`,
//         "Latest Price": showLatestPrice
//           ? `₹${parseFloat(price || 0).toFixed(2)}`
//           : "",
//         "Latest Date": showLatestPrice && date ? date : "",
//       };
//     });

//     const { baseTotal, totalTaxAmount, grandTotal } = calculateTotalPrice();

//     generateCSV(data, {
//       baseTotal: baseTotal.toFixed(2),
//       totalTax: totalTaxAmount.toFixed(2),
//       grandTotal: grandTotal.toFixed(2),
//     });
//   };

//   const filteredSpecifications = components.filter(
//     (comp) => comp.component_type === newComponent.componentType,
//   );

//   const filteredVendors = vendorMasterData.filter(
//     (v) =>
//       v.component_type === newComponent.componentType &&
//       v.component_id === newComponent.component,
//   );

//   const compactInputStyle = {
//     width: "100%",
//     minWidth: 0,
//     padding: "6px 8px",
//     fontSize: "12px",
//     border: "1px solid #d1d5db",
//     borderRadius: "6px",
//     boxSizing: "border-box",
//   };

//   const truncateCellStyle = {
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   if (loading)
//     return (
//       <div style={{ textAlign: "center", marginTop: "50px" }}>
//         <div className="spinner"></div>
//         Loading BOM Details...
//       </div>
//     );

//   return (
//     <div style={{ padding: "20px", width: "100%", boxSizing: "border-box" }}>
//       {selectedBom && (
//         <>
//           <div className="header-back">
//             <button
//               className="back-btn"
//               onClick={() => navigate(-1)}
//               title="Back to BOM List"
//             >
//               <FaArrowLeft />
//             </button>
//             <h3>Selected BOM: {selectedBom.bom_name}</h3>
//           </div>

//           <p>
//             <strong>BOM ID:</strong> {selectedBom.bom_id}
//           </p>

//           {selectedBom.wbom && (
//             <p style={{ color: "gray", marginTop: "10px" }}>
//               This is a Final BOM. Components cannot be added or removed.
//             </p>
//           )}

//           <div style={{ display: "flex", justifyContent: "flex-end" }}>
//             {user?.role !== "Finance" && (
//               <button
//                 onClick={() => {
//                   if (!selectedBom.wbom) setShowAddComponentForm(true);
//                 }}
//                 style={{
//                   background: "transparent",
//                   border: "none",
//                   cursor: selectedBom.wbom ? "not-allowed" : "pointer",
//                   padding: "4px",
//                   opacity: selectedBom.wbom ? 0.5 : 1,
//                 }}
//                 title={
//                   selectedBom.wbom
//                     ? "Cannot add component in Final BOM"
//                     : "Add New Component"
//                 }
//                 disabled={selectedBom.wbom}
//               >
//                 <img
//                   src={AddIcon}
//                   alt="Add"
//                   style={{ width: "20px", height: "20px" }}
//                 />
//               </button>
//             )}
//           </div>

//           <div className="price-button-wrapper">
//             <button
//               onClick={() => setShowLatestPrice(true)}
//               className="show-latest-price-btn"
//               title="Show Latest Price Info"
//             >
//               Show Latest Price Info
//             </button>

//             <button
//               className="generate-report-btn"
//               onClick={handleGenerateReport}
//             >
//               Generate Report
//             </button>
//           </div>

//           <div
//             className="table-container"
//             style={{
//               width: "100%",
//               overflowX: "auto",
//               border: "1px solid #ddd",
//               borderRadius: "8px",
//             }}
//           >
//             <table
//               border="1"
//               style={{
//                 width: "100%",
//                 minWidth: "1200px",
//                 borderCollapse: "collapse",
//                 tableLayout: "fixed",
//                 fontSize: "12px",
//               }}
//             >
//               <colgroup>
//                 <col style={{ width: "95px" }} />
//                 <col style={{ width: "95px" }} />
//                 <col style={{ width: "110px" }} />
//                 <col style={{ width: "170px" }} />
//                 <col style={{ width: "65px" }} />
//                 <col style={{ width: "75px" }} />
//                 <col style={{ width: "130px" }} />
//                 <col style={{ width: "85px" }} />
//                 <col style={{ width: "95px" }} />
//                 <col style={{ width: "65px" }} />
//                 <col style={{ width: "85px" }} />
//                 <col style={{ width: "95px" }} />
//                 <col style={{ width: "75px" }} />
//                 <col style={{ width: "85px" }} />
//               </colgroup>

//               <thead>
//                 <tr>
//                   <th>Component ID</th>
//                   <th>Category</th>
//                   <th>Component Type</th>
//                   <th>Specification</th>
//                   <th>UOM</th>
//                   <th>Quantity</th>
//                   <th>Vendor</th>
//                   <th>Date</th>
//                   <th>Price</th>
//                   <th>Tax</th>
//                   <th style={{ backgroundColor: "#82817f" }}>Latest Date</th>
//                   <th style={{ backgroundColor: "#82817f" }}>Latest Price</th>
//                   <th style={{ backgroundColor: "#82817f" }}>Latest Tax</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {!selectedBom.wbom && showAddComponentForm && (
//                   <tr style={{ background: "#fff7ed" }}>
//                     <td>-</td>
//                     <td>-</td>

//                     <td>
//                       <select
//                         value={newComponent.componentType || ""}
//                         onChange={(e) => {
//                           const selectedType = e.target.value;
//                           setNewComponent({
//                             componentType: selectedType,
//                             component: "",
//                             vendor: "",
//                             quantity: "",
//                             price: "",
//                             tax: "",
//                           });
//                         }}
//                         style={compactInputStyle}
//                       >
//                         <option value="">Select Type</option>
//                         {Array.from(
//                           new Set(components.map((c) => c.component_type)),
//                         ).map((type) => (
//                           <option key={type} value={type}>
//                             {type}
//                           </option>
//                         ))}
//                       </select>
//                     </td>

//                     <td>
//                       <select
//                         value={newComponent.component}
//                         onChange={(e) => {
//                           const componentId = e.target.value;

//                           setNewComponent((prev) => ({
//                             ...prev,
//                             component: componentId,
//                             vendor: "",
//                             price: "",
//                             tax: "",
//                           }));
//                         }}
//                         style={compactInputStyle}
//                       >
//                         <option value="">Select Specification</option>
//                         {filteredSpecifications.map((comp) => (
//                           <option
//                             key={comp.component_id}
//                             value={comp.component_id}
//                           >
//                             {comp.component_specification}
//                           </option>
//                         ))}
//                       </select>
//                     </td>

//                     <td style={truncateCellStyle}>
//                       {components.find(
//                         (c) => c.component_id === newComponent.component,
//                       )?.unit_of_measurement || "-"}
//                     </td>

//                     <td>
//                       <input
//                         type="number"
//                         placeholder="Qty"
//                         value={newComponent.quantity}
//                         onChange={(e) =>
//                           setNewComponent({
//                             ...newComponent,
//                             quantity: e.target.value,
//                           })
//                         }
//                         style={compactInputStyle}
//                       />
//                     </td>

//                     <td>
//                       <select
//                         value={newComponent.vendor}
//                         onChange={(e) => {
//                           const vendorId = e.target.value;
//                           const componentId = newComponent.component;

//                           setNewComponent((prev) => ({
//                             ...prev,
//                             vendor: vendorId,
//                             price: "",
//                             tax: "",
//                           }));

//                           if (componentId && vendorId) {
//                             const matchedEntry = vendorMasterData.find(
//                               (entry) =>
//                                 entry.component_id === componentId &&
//                                 entry.vendor === vendorId,
//                             );

//                             if (!matchedEntry) {
//                               showWarningToast(
//                                 "No matching vendor entry found for this component.",
//                               );
//                               return;
//                             }

//                             const productId = matchedEntry.product_id;

//                             const matchingPrices = priceTables
//                               .filter((p) => p.product === productId)
//                               .sort(
//                                 (a, b) =>
//                                   new Date(b.current_time) -
//                                   new Date(a.current_time),
//                               );

//                             const latest = matchingPrices[0];

//                             if (!latest) {
//                               showWarningToast(
//                                 "No price found for this vendor-product match.",
//                               );
//                               return;
//                             }

//                             setNewComponent((prev) => ({
//                               ...prev,
//                               price: latest.price,
//                               tax: latest.tax?.toString() || "",
//                             }));
//                           }
//                         }}
//                         style={compactInputStyle}
//                       >
//                         <option value="">Select Vendor</option>
//                         {filteredVendors.map((v) => {
//                           const vendorName =
//                             vendors.find((ven) => ven.vendor_id === v.vendor)
//                               ?.vendor_name || "Unnamed Vendor";
//                           return (
//                             <option key={v.product_id} value={v.vendor}>
//                               {vendorName}
//                             </option>
//                           );
//                         })}
//                       </select>
//                     </td>

//                     <td>Auto</td>

//                     <td style={{ textAlign: "right", ...truncateCellStyle }}>
//                       {newComponent.price
//                         ? `₹${parseFloat(newComponent.price).toLocaleString(
//                             "en-IN",
//                             {
//                               minimumFractionDigits: 2,
//                               maximumFractionDigits: 2,
//                             },
//                           )}`
//                         : "-"}
//                     </td>

//                     <td style={truncateCellStyle}>
//                       {newComponent.tax ? `${newComponent.tax}%` : "-"}
//                     </td>

//                     <td>-</td>
//                     <td>-</td>
//                     <td>-</td>

//                     <td>
//                       <div
//                         style={{
//                           display: "flex",
//                           gap: "6px",
//                           justifyContent: "center",
//                           flexWrap: "wrap",
//                         }}
//                       >
//                         <button
//                           onClick={handleAddComponent}
//                           className="edit-btn"
//                           style={{ padding: "5px 8px", fontSize: "12px" }}
//                         >
//                           Submit
//                         </button>
//                         <button
//                           onClick={() => {
//                             setShowAddComponentForm(false);
//                             resetNewComponent();
//                           }}
//                           className="delete-button"
//                           style={{ padding: "5px 8px", fontSize: "12px" }}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 )}

//                 {selectedComponents.map((component, index) => {
//                   const { price, tax, date } = getLatestPriceInfo(
//                     component.component,
//                     component.vendor,
//                   );

//                   return (
//                     <tr key={index}>
//                       <td style={truncateCellStyle}>
//                         <Link
//                           to={`/components/${component.component.component_id}`}
//                           style={{
//                             textDecoration: "underline",
//                             color: "inherit",
//                           }}
//                           title={`Open ${component.component.component_id} in CDP`}
//                         >
//                           {component.component.component_id}
//                         </Link>
//                       </td>
//                       <td style={truncateCellStyle}>
//                         {component.component.category}
//                       </td>
//                       <td style={truncateCellStyle}>
//                         {component.component.component_type}
//                       </td>
//                       <td
//                         title={component.component.component_specification}
//                         style={truncateCellStyle}
//                       >
//                         {component.component.component_specification}
//                       </td>
//                       <td style={truncateCellStyle}>
//                         {component.component.unit_of_measurement}
//                       </td>
//                       <td style={truncateCellStyle}>{component.quantity}</td>
//                       <td
//                         title={component.vendor.vendor_name}
//                         style={truncateCellStyle}
//                       >
//                         {component.vendor.vendor_name}
//                       </td>
//                       <td style={truncateCellStyle}>
//                         {component.date
//                           ? format(parseISO(component.date), "dd-MM-yyyy")
//                           : "-"}
//                       </td>
//                       <td style={{ textAlign: "right", ...truncateCellStyle }}>
//                         ₹
//                         {parseFloat(component.price || 0).toLocaleString(
//                           "en-IN",
//                           {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           },
//                         )}
//                       </td>
//                       <td style={truncateCellStyle}>{component.tax}%</td>
//                       <td style={truncateCellStyle}>
//                         {showLatestPrice ? date : ""}
//                       </td>
//                       <td style={{ textAlign: "right", ...truncateCellStyle }}>
//                         {showLatestPrice
//                           ? `₹${parseFloat(price || 0).toLocaleString("en-IN", {
//                               minimumFractionDigits: 2,
//                               maximumFractionDigits: 2,
//                             })}`
//                           : ""}
//                       </td>
//                       <td style={{ textAlign: "right", ...truncateCellStyle }}>
//                         {showLatestPrice
//                           ? `${Number.isFinite(tax) ? tax : 0}%`
//                           : ""}
//                       </td>
//                       <td>
//                         <button
//                           style={{
//                             border: "none",
//                             background: "transparent",
//                             padding: "5px",
//                             cursor: selectedBom.wbom
//                               ? "not-allowed"
//                               : "pointer",
//                             opacity: selectedBom.wbom ? 0.5 : 1,
//                           }}
//                           onClick={() => {
//                             if (!selectedBom.wbom) {
//                               handleDeleteComponent(component.id);
//                             }
//                           }}
//                           title={
//                             selectedBom.wbom
//                               ? "Cannot delete component in Final BOM"
//                               : "Delete Component"
//                           }
//                           disabled={selectedBom.wbom}
//                         >
//                           <img
//                             src={DeleteIcon}
//                             alt="Delete"
//                             style={{ width: "18px", height: "18px" }}
//                           />
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>

//               <tfoot>
//                 {(() => {
//                   const { baseTotal, totalTaxAmount, grandTotal } =
//                     calculateTotalPrice(false);
//                   const latestTotals = calculateTotalPrice(true);
//                   const cell = {
//                     textAlign: "right",
//                     fontWeight: "bold",
//                     fontSize: "12px",
//                   };

//                   return (
//                     <>
//                       <tr>
//                         <td colSpan="5" style={cell}>
//                           Total Quantity:
//                         </td>
//                         <td colSpan="1" style={cell}>
//                           {totalQuantity.toLocaleString("en-IN")}
//                         </td>
//                         <td colSpan="2" style={cell}>
//                           Total Base Price:
//                         </td>
//                         <td colSpan="1" style={cell}>
//                           {fmtINR(baseTotal)}
//                         </td>

//                         {showLatestPrice ? (
//                           <>
//                             <td colSpan="2" style={cell}>
//                               Total Base Price (Latest):
//                             </td>
//                             <td style={cell}>
//                               {fmtINR(latestTotals.baseTotal)}
//                             </td>
//                           </>
//                         ) : (
//                           <>
//                             <td colSpan="2" />
//                             <td />
//                           </>
//                         )}

//                         <td />
//                       </tr>

//                       <tr>
//                         <td colSpan="8" style={cell}>
//                           Total Tax (GST):
//                         </td>
//                         <td colSpan="1" style={cell}>
//                           {fmtINR(totalTaxAmount)}
//                         </td>

//                         {showLatestPrice ? (
//                           <>
//                             <td colSpan="2" style={cell}>
//                               Total Tax (GST) (Latest):
//                             </td>
//                             <td style={cell}>
//                               {fmtINR(latestTotals.totalTaxAmount)}
//                             </td>
//                           </>
//                         ) : (
//                           <>
//                             <td colSpan="2" />
//                             <td />
//                           </>
//                         )}

//                         <td />
//                       </tr>

//                       <tr>
//                         <td colSpan="8" style={cell}>
//                           Grand Total (Price + GST):
//                         </td>
//                         <td colSpan="1" style={cell}>
//                           {fmtINR(grandTotal)}
//                         </td>

//                         {showLatestPrice ? (
//                           <>
//                             <td colSpan="2" style={cell}>
//                               Grand Total (Price + GST) (Latest):
//                             </td>
//                             <td style={cell}>
//                               {fmtINR(latestTotals.grandTotal)}
//                             </td>
//                           </>
//                         ) : (
//                           <>
//                             <td colSpan="2" />
//                             <td />
//                           </>
//                         )}

//                         <td />
//                       </tr>
//                     </>
//                   );
//                 })()}
//               </tfoot>
//             </table>
//           </div>
//         </>
//       )}

//       <ToastContainerComponent />
//     </div>
//   );
// };

// export default BOMDetails;

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import config from "../Config"; // Import config for API endpoints
import DeleteIcon from "../assets/Delete.png"; //
import AddIcon from "../assets/Add.png";
import Back from "../assets/Back.png";
import { format, parseISO } from "date-fns";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities
import { FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../AuthContext.jsx";
import ReactDOM from "react-dom";

//
const BOMDetails = () => {
  const { user, logout } = useAuth();
  const { bomId } = useParams(); // Retrieve bomId from URL
  const navigate = useNavigate(); // Initialize useNavigate
  const [selectedBom, setSelectedBom] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [showAddComponentForm, setShowAddComponentForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showAddRow, setShowAddRow] = useState(false);
  const [newComponent, setNewComponent] = useState({
    componentType: "",
    component: "",
    vendor: "",
    quantity: "",
    price: "",
    tax: "",
    date: "",
  });
  const [vendors, setVendors] = useState([]);
  const [components, setComponents] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingComponents, setLoadingComponents] = useState(true);
  const [priceTables, setPriceTables] = useState([]);
  const [showLatestPrice, setShowLatestPrice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorMasterData, setVendorMasterData] = useState([]);
  const username = user?.email?.split("@")[0];
  const [isRequestMode, setIsRequestMode] = useState(false);
  const [requestedComponents, setRequestedComponents] = useState([]);
  const [requestComponent, setRequestComponent] = useState({
    category: "",
    component_type: "",
    component_specification: "",
    uom: "",
    quantity: "",
    product_link: "",
    hsn_number: "",
    part_number: "",
  });

  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [rejectId, setRejectId] = useState(null);

  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData] = useState({});

  // Sum of quantities in this BOM (same definition as Number of Components in the list)
  const totalQuantity = useMemo(
    () =>
      (selectedComponents || []).reduce(
        (sum, row) => sum + (Number(row?.quantity) || 0),
        0,
      ),
    [selectedComponents],
  );

  // Fetch BOM details and related components
  useEffect(() => {
    const fetchBomDetails = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${config.apiBaseURL}/bom_list/`);
        const data = await response.json();
        const bom = data.find((b) => b.bom_id === bomId);
        setSelectedBom(bom);
      } catch (error) {
        console.error("Error fetching BOM details:", error);
      } finally {
        setLoading(false); // Stop loading after both calls
      }
    };

    const fetchBomComponents = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/bom_master/`);
        const data = await response.json();
        const bomComponents = data.filter((b) => b.bom === bomId); // Filter components by BOM ID
        setSelectedComponents(bomComponents); // Store BOM components
      } catch (error) {
        console.error("Error fetching BOM components:", error);
      }
    };

    const fetchVendors = async () => {
      try {
        setLoadingVendors(true); // Set loading to true
        const response = await fetch(`${config.apiBaseURL}/vendor_list/`);
        const data = await response.json();
        setVendors(data); // Store the vendor list
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setLoadingVendors(false); // Set loading to false
      }
    };

    const fetchVendorMaster = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/vendor_master/`);
        const data = await response.json();
        setVendorMasterData(data);
      } catch (error) {
        console.error("Error fetching vendor master data:", error);
      }
    };

    const fetchComponents = async () => {
      try {
        setLoadingComponents(true);
        const response = await fetch(`${config.apiBaseURL}/component/`);
        const data = await response.json();
        setComponents(data);
      } catch (error) {
        console.error("Error fetching components:", error);
      } finally {
        setLoadingComponents(false);
      }
    };

    const fetchAllData = async () => {
      try {
        const [bomRes, bomMasterRes, vendorRes, componentRes, priceRes] =
          await Promise.all([
            fetch(`${config.apiBaseURL}/bom_list/`),
            fetch(`${config.apiBaseURL}/bom_master/`),
            fetch(`${config.apiBaseURL}/vendor_list/`),
            fetch(`${config.apiBaseURL}/component/`),
            fetch(`${config.apiBaseURL}/price_tables/`),
          ]);

        const [bomData, bomMasterData, vendorData, componentData, priceData] =
          await Promise.all([
            bomRes.json(),
            bomMasterRes.json(),
            vendorRes.json(),
            componentRes.json(),
            priceRes.json(),
          ]);

        setSelectedBom(bomData.find((b) => b.bom_id === bomId));
        setSelectedComponents(bomMasterData.filter((b) => b.bom === bomId));
        setVendors(vendorData);
        setComponents(componentData);
        setPriceTables(priceData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoadingComponents(false);
        setLoadingVendors(false);
      }
    };
    // Fetch all data
    fetchBomDetails();
    fetchBomComponents();
    fetchVendors();
    fetchVendorMaster();
    fetchComponents();
    fetchAllData();
  }, [bomId]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/request_component/`);
      const data = await res.json();

      const username = user?.email?.split("@")[0];

      const filtered = data.filter((r) => {
        const bomIdMatch =
          String(r.bom) === String(selectedBom?.bom_id) ||
          String(r.bom?.bom_id) === String(selectedBom?.bom_id);

        if (user?.role === "Inventory" || user?.role === "Admin") {
          return bomIdMatch;
        } else {
          return bomIdMatch && r.name === username;
        }
      });

      setRequestedComponents(filtered);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    if (selectedBom) {
      fetchRequests();
    }
  }, [selectedBom]);

  const fmtINR = (n) =>
    `₹${(Number.isFinite(n) ? n : 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getLatestPriceInfo = (componentObj, vendorObj) => {
    if (!componentObj || !vendorObj) return { price: "-", tax: "-", date: "-" };

    const { component_id } = componentObj;
    const { vendor_id } = vendorObj;

    // Find matching vendor master entry to get the product_id
    const vendorEntry = vendorMasterData.find(
      (entry) =>
        entry.component_id === component_id && entry.vendor === vendor_id,
    );

    if (!vendorEntry) return { price: "-", tax: "-", date: "-" };

    const productId = vendorEntry.product_id;

    // Now find matching price table entry
    const prices = priceTables.filter((entry) => entry.product === productId);
    if (prices.length === 0) return { price: "-", tax: "-", date: "-" };

    const latest = prices.sort(
      (a, b) => new Date(b.current_time) - new Date(a.current_time),
    )[0];

    return {
      price: parseFloat(latest.price),
      tax: parseFloat(latest?.tax ?? 0),
      date: format(parseISO(latest.current_time), "dd-MM-yyyy"),
    };
  };

  const handleAddComponent = async () => {
    try {
      // ✅ REQUEST MODE
      if (isRequestMode) {
        if (
          !requestComponent.category ||
          !requestComponent.component_type ||
          !requestComponent.component_specification ||
          !requestComponent.uom ||
          !requestComponent.quantity
        ) {
          showInfoToast("All request fields are required.");
          return;
        }

        const response = await fetch(
          `${config.apiBaseURL}/request_component/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bom: selectedBom?.bom_id,
              ...requestComponent,
              name: user?.email?.split("@")[0],
            }),
          },
        );

        if (response.ok) {
          showSuccessToast("Component request submitted!");
          await fetchRequests();
          setShowAddRow(false);
          setIsRequestMode(false);

          setRequestComponent({
            category: "",
            component_type: "",
            component_specification: "",
            uom: "",
            quantity: "",
            product_link: "",
            hsn_number: "",
            part_number: "",
          });
        } else {
          showErrorToast("Failed to submit request.");
        }

        return;
      }

      // ✅ NORMAL MODE
      if (!newComponent.component || !newComponent.quantity) {
        showInfoToast("Component and Quantity are required.");
        return;
      }

      let price = null;
      let tax = null;
      let latestDate = null;

      // ✅ ONLY IF vendor is selected → fetch price
      if (newComponent.vendor) {
        const matchedEntry = vendorMasterData.find(
          (entry) =>
            entry.component_id === newComponent.component &&
            entry.vendor === newComponent.vendor,
        );

        if (matchedEntry) {
          const productId = matchedEntry.product_id;

          const matchingPrices = priceTables.filter(
            (entry) => entry.product === productId,
          );

          const latestPriceEntry = matchingPrices.sort(
            (a, b) => new Date(b.current_time) - new Date(a.current_time),
          )[0];

          if (latestPriceEntry) {
            price = latestPriceEntry.price;
            tax = latestPriceEntry.tax;
            latestDate = latestPriceEntry.current_time.split("T")[0];
          }
        }
        // ❗ NO ERROR if vendor not found → just skip
      }

      const payload = {
        bom: selectedBom?.bom_id,
        component: newComponent.component,
        vendor_id: newComponent.vendor || null,
        quantity: Number(newComponent.quantity),
        name: username,
      };

      if (newComponent.vendor) {
        payload.price = price;
        payload.tax = tax;
        payload.date = latestDate;
      }

      const response = await fetch(`${config.apiBaseURL}/bom_master/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showSuccessToast("Component added successfully!");

        const refreshed = await fetch(`${config.apiBaseURL}/bom_master/`);
        const updated = await refreshed.json();
        setSelectedComponents(updated.filter((b) => b.bom === bomId));

        setShowAddComponentForm(false);
        setNewComponent({
          component: "",
          quantity: "",
          vendor: "",
          price: "",
          tax: "",
        });
      } else {
        const error = await response.json();
        showErrorToast(`Failed to add component: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error("Error adding component:", error);
    }
  };

  const handleDeleteComponent = async (bomComponentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this component from the BOM?",
      )
    )
      return;

    try {
      const response = await fetch(
        `${config.apiBaseURL}/bom_master/${bomComponentId}/`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        showSuccessToast("Component deleted successfully.");
        setSelectedComponents((prev) =>
          prev.filter((component) => component.id !== bomComponentId),
        );
      } else {
        showErrorToast("Failed to delete component.");
      }
    } catch (error) {
      console.error("Error deleting component:", error);
      showErrorToast("An error occurred while deleting.");
    }
  };
  const calculateTotalPrice = (useLatest = false) => {
    let baseTotal = 0;
    let totalTaxAmount = 0;

    selectedComponents.forEach((row) => {
      const qty = parseFloat(row.quantity || 0);

      let unitPrice = parseFloat(row.price || 0);
      let taxRate = parseFloat(row.tax || 0);

      if (useLatest) {
        const latest = getLatestPriceInfo(row.component, row.vendor);
        if (Number.isFinite(latest.price)) unitPrice = latest.price;
        if (Number.isFinite(latest.tax)) taxRate = latest.tax;
      }

      const base = unitPrice * qty;
      const taxAmount = (base * taxRate) / 100;

      baseTotal += base;
      totalTaxAmount += taxAmount;
    });

    return {
      baseTotal,
      totalTaxAmount,
      grandTotal: baseTotal + totalTaxAmount,
    };
  };

  ///

  const handleShowLatestPrice = (productId) => {
    const matchingPrices = priceTables.filter((p) => p.product === productId);
    if (matchingPrices.length === 0) {
      showWarningToast("No price entry found for this component.");
      return;
    }

    const latest = matchingPrices.sort(
      (a, b) => new Date(b.current_time) - new Date(a.current_time),
    )[0];

    const formattedDate = new Date(latest.current_time).toLocaleDateString(
      "en-IN",
    );

    showInfoToast(
      `Latest Price: ₹${latest.price}, Tax: ${latest.tax}%, Date: ${formattedDate}`,
    );
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await fetch(`${config.apiBaseURL}/bom_master/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: editData.quantity,
          vendor: editData.vendor || null, // ✅ FIX HERE
          price: editData.price || null,
          tax: editData.tax || null,
          date: editData.date || null,
        }),
      });

      if (response.ok) {
        showSuccessToast("Updated successfully!");

        // Refresh list
        const refreshed = await fetch(`${config.apiBaseURL}/bom_master/`);
        const updated = await refreshed.json();
        setSelectedComponents(updated.filter((b) => b.bom === bomId));

        // Reset edit mode
        setEditRowId(null);
        setEditData({});
      } else {
        showErrorToast("Failed to update.");
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Error updating.");
    }
  };

  const generateCSV = (data, totals, filename = "BOM_Report") => {
    const headers = [
      "S.No",
      "Category",
      "Component Type",
      "Specification",
      "UOM",
      "Quantity",
      "Vendor",
      "Date",
      "Price",
      "Tax",
      "Latest Price",
      "Latest Date",
    ];

    // Convert each row to CSV format and escape quotes
    const rows = data.map((item) =>
      headers
        .map((h) => `"${String(item[h] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    );

    // Add an empty row and total summary rows
    const totalRows = [
      [], // Empty row for separation
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Total Base Price:", // up to column 6
        `₹${totals.baseTotal}`,
        "",
        "",
        "", // base total at column 7
      ],
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Total Tax (GST):",
        `₹${totals.totalTax}`,
        "",
        "",
        "",
      ],
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Grand Total:",
        `₹${totals.grandTotal}`,
        "",
        "",
        "",
      ],
    ].map((row) => row.join(","));

    const csvContent = [headers.join(","), ...rows, ...totalRows].join("\n");

    // Add BOM to ensure Excel renders ₹ correctly
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateReport = () => {
    if (!selectedComponents || selectedComponents.length === 0) {
      showInfoToast("No components selected for report.");
      return;
    }

    const data = selectedComponents.map((component, index) => {
      const { price, tax, date } = getLatestPriceInfo(
        component.component,
        component.vendor,
      );

      return {
        "S.No": index + 1,
        Category: component.component.category,
        "Component Type": component.component.component_type,
        Specification: component.component.component_specification,
        UOM: component.component.unit_of_measurement,
        Quantity: component.quantity,
        Vendor: component.vendor.vendor_name,
        Date: component.date
          ? format(parseISO(component.date), "dd-MM-yyyy")
          : "-",
        Price: `₹${parseFloat(component.price || 0).toFixed(2)}`,
        Tax: `${component.tax}%`,
        "Latest Price": showLatestPrice
          ? `₹${parseFloat(price || 0).toFixed(2)}`
          : "",
        "Latest Date": showLatestPrice && date ? date : "",
      };
    });

    const { baseTotal, totalTaxAmount, grandTotal } = calculateTotalPrice();

    generateCSV(data, {
      baseTotal: baseTotal.toFixed(2),
      totalTax: totalTaxAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    });
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <div className="spinner"></div>
        Loading BOM Details...
      </div>
    );

  const handleApprove = async (req) => {
    try {
      // STEP 1: Get latest component list
      const compRes = await fetch(`${config.apiBaseURL}/component/`);
      const compData = await compRes.json();

      const lastIdNumber =
        compData.length > 0
          ? Math.max(
              ...compData.map((c) =>
                parseInt(c.component_id.replace("C_", ""), 10),
              ),
            )
          : 0;

      const newComponentId = `C_${String(lastIdNumber + 1).padStart(5, "0")}`;

      // STEP 2: Create Component
      const newComponentPayload = {
        component_id: newComponentId,
        category: req.category,
        component_type: req.component_type,
        component_specification: req.component_specification,
        unit_of_measurement: req.uom,
        tally_reference: req.component_specification,
        hsn_numbers: req.hsn_number ? [req.hsn_number] : [],
        sku_numbers: [],
        part_numbers: req.part_number ? [req.part_number] : [],
      };

      const createRes = await fetch(`${config.apiBaseURL}/component/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComponentPayload),
      });

      if (!createRes.ok) {
        showErrorToast("Component creation failed");
        return;
      }

      // STEP 3: Add to BOM
      const bomPayload = {
        bom: selectedBom?.bom_id,
        component: newComponentId,
        quantity: req.quantity,
        vendor: null,
        price: 0,
        tax: 0,
        date: new Date().toISOString().split("T")[0],
        name: user?.email?.split("@")[0],
      };

      const bomRes = await fetch(`${config.apiBaseURL}/bom_master/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bomPayload),
      });

      if (!bomRes.ok) {
        showErrorToast("Component created but BOM update failed");
        return;
      }

      // STEP 4: Update request status
      const updateRes = await fetch(
        `${config.apiBaseURL}/request_component/${req.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Added",
            component_id: newComponentId,
          }),
        },
      );

      if (!updateRes.ok) {
        showErrorToast("Status update failed");
        return;
      }

      // ✅ STEP 5: UPDATE UI STATE (IMPORTANT FIX)

      // 1. Remove REQ row immediately
      setRequestedComponents((prev) =>
        prev.filter((item) => item.id !== req.id),
      );

      // 2. Add new BOM row locally (no full refresh needed)
      const newBomRow = {
        id: Date.now(), // temp id
        bom: selectedBom?.bom_id,
        component: {
          component_id: newComponentId,
          category: req.category,
          component_type: req.component_type,
          component_specification: req.component_specification,
          unit_of_measurement: req.uom,
        },
        quantity: req.quantity,
        vendor: null,
        price: 0,
        tax: 0,
        date: new Date().toISOString().split("T")[0],
      };

      setSelectedComponents((prev) => [...prev, newBomRow]);

      showSuccessToast("Approved, Component created & added to BOM");
    } catch (err) {
      console.error(err);
      showErrorToast("Something went wrong");
    }
  };
  const handleReject = async () => {
    try {
      const res = await fetch(
        `${config.apiBaseURL}/request_component/${rejectId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Rejected",
            remarks: rejectRemark, // ✅ send remark
          }),
        },
      );

      if (res.ok) {
        showSuccessToast("Request Rejected");

        setRequestedComponents((prev) =>
          prev.map((r) =>
            r.id === rejectId
              ? { ...r, status: "Rejected", remark: rejectRemark }
              : r,
          ),
        );

        setShowRejectPopup(false);
        setRejectRemark("");
        fetchRequests();
      } else {
        showErrorToast("Failed to reject");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // if (noData) return <p>No information available for this BOM</p>;

  ///
  return (
    <div style={{ padding: "20px" }}>
      {selectedBom && (
        <>
          <div className="header-back">
            <button
              className="back-btn"
              onClick={() => navigate(-1)}
              title="Back to BOM List"
            >
              <FaArrowLeft />
            </button>
            <h3>Selected BOM: {selectedBom.bom_name}</h3>
          </div>{" "}
          <p>
            <strong>BOM ID:</strong> {selectedBom.bom_id}
          </p>
          {selectedBom.wbom && (
            <p style={{ color: "gray", marginTop: "10px" }}>
              This is a Final BOM. Components cannot be added or removed.
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {user?.role !== "Finance" && (
              <button
                onClick={() => {
                  if (!selectedBom.wbom) setShowAddRow(true);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: selectedBom.wbom ? "not-allowed" : "pointer",
                  padding: "4px",
                  opacity: selectedBom.wbom ? 0.5 : 1,
                }}
                title={
                  selectedBom.wbom
                    ? "Cannot add component in Final BOM"
                    : "Add New Component"
                }
                disabled={selectedBom.wbom}
              >
                <img
                  src={AddIcon}
                  alt="Add"
                  style={{ width: "20px", height: "20px" }}
                />
              </button>
            )}
          </div>
          {(user?.role === "Inventory" || user?.role === "Admin") && (
            <div className="price-button-wrapper">
              <button
                onClick={() => setShowLatestPrice(true)}
                className="show-latest-price-btn"
                title="Show Latest Price Info"
              >
                Show Latest Price Info
              </button>

              <button
                className="generate-report-btn"
                onClick={handleGenerateReport}
              >
                Generate Report
              </button>
            </div>
          )}
          {/* <h4>Components:</h4> */}
          <div className="table-container">
            <table
              border="1"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th>Component ID</th>
                  <th>Category</th>
                  <th>Component Type</th>
                  <th>Specification</th>
                  <th>UOM</th>
                  <th>Quantity</th>
                  {(user?.role === "Inventory" || user?.role === "Admin") && (
                    <>
                      <th>Vendor</th>
                      <th>Date</th>
                      <th>Price</th>
                      <th>Tax</th>
                      <th style={{ backgroundColor: "#82817f" }}>
                        Latest Date
                      </th>
                      <th style={{ backgroundColor: "#82817f" }}>
                        Latest Price
                      </th>
                      <th style={{ backgroundColor: "#82817f" }}>Latest Tax</th>
                    </>
                  )}
                  <th>Action</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {showAddRow && (
                  <tr style={{ backgroundColor: "#f9f9f9" }}>
                    <td>
                      {isRequestMode ? (
                        <span>New Request</span>
                      ) : (
                        <>
                          New
                          <button
                            style={{
                              marginLeft: "8px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                            onClick={() => setIsRequestMode(true)}
                          >
                            + Request Component
                          </button>
                        </>
                      )}
                    </td>
                    {/* Category (auto) */}
                    <td>
                      {isRequestMode ? (
                        <select
                          value={requestComponent.category}
                          onChange={(e) =>
                            setRequestComponent({
                              ...requestComponent,
                              category: e.target.value,
                            })
                          }
                        >
                          <option value="">Select</option>
                          {Array.from(
                            new Set(components.map((c) => c.category)),
                          ).map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      ) : (
                        components.find(
                          (c) => c.component_id === newComponent.component,
                        )?.category || "-"
                      )}
                    </td>

                    {/* Component Type */}
                    <td style={{ position: "relative" }}>
                      {isRequestMode ? (
                        // 🔥 REQUEST MODE (manual input)
                        <select
                          value={requestComponent.component_type}
                          onChange={(e) =>
                            setRequestComponent((prev) => ({
                              ...prev,
                              component_type: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select</option>
                          {components
                            .filter(
                              (c) =>
                                !requestComponent.category ||
                                c.category === requestComponent.category,
                            )
                            .map((c) => c.component_type)
                            .filter((v, i, a) => a.indexOf(v) === i) // unique
                            .map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                        </select>
                      ) : (
                        // 🔥 NORMAL MODE (your dropdown)
                        <div className="custom-dropdown">
                          {/* Header */}
                          <div
                            className="bom-dropdown-header"
                            onClick={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();

                              setNewComponent((prev) => ({
                                ...prev,
                                openDropdown: !prev.openDropdown,
                                dropdownPos: {
                                  top: rect.bottom,
                                  left: rect.left,
                                  width: rect.width,
                                },
                              }));
                            }}
                          >
                            <span className="bom-dropdown-text">
                              {newComponent.componentType || "Select"}
                            </span>

                            <span className="bom-dropdown-icon">▼</span>
                          </div>

                          {/* Portal Dropdown */}
                          {newComponent.openDropdown &&
                            ReactDOM.createPortal(
                              <div
                                className="bom-dropdown-body-portal"
                                style={{
                                  position: "fixed",
                                  top: newComponent.dropdownPos?.top || 0,
                                  left: newComponent.dropdownPos?.left || 0,
                                  width: newComponent.dropdownPos?.width || 180,
                                  zIndex: 9999,
                                }}
                              >
                                {/* 🔍 Search */}
                                <input
                                  type="text"
                                  className="bom-dropdown-search"
                                  placeholder="Search..."
                                  value={searchText}
                                  onChange={(e) =>
                                    setSearchText(e.target.value)
                                  }
                                  autoFocus
                                />

                                {/* Options */}
                                <div className="bom-dropdown-list">
                                  {Array.from(
                                    new Set(
                                      components.map((c) => c.component_type),
                                    ),
                                  )
                                    .filter((type) =>
                                      type
                                        .toLowerCase()
                                        .includes(searchText.toLowerCase()),
                                    )
                                    .map((type) => (
                                      <div
                                        key={type}
                                        className="bom-dropdown-item"
                                        onClick={() => {
                                          setNewComponent((prev) => ({
                                            ...prev,
                                            componentType: type,
                                            component: "",
                                            vendor: "",
                                            openDropdown: false,
                                          }));
                                          setSearchText("");
                                        }}
                                      >
                                        {type}
                                      </div>
                                    ))}

                                  {/* ❌ No Data */}
                                  {Array.from(
                                    new Set(
                                      components.map((c) => c.component_type),
                                    ),
                                  ).filter((type) =>
                                    type
                                      .toLowerCase()
                                      .includes(searchText.toLowerCase()),
                                  ).length === 0 && (
                                    <div className="bom-dropdown-item no-data">
                                      No results found
                                    </div>
                                  )}
                                </div>
                              </div>,
                              document.body,
                            )}
                        </div>
                      )}
                    </td>

                    {/* Specification */}
                    <td style={{ position: "relative" }}>
                      {isRequestMode ? (
                        <input
                          type="text"
                          placeholder="Enter Specification"
                          value={requestComponent.component_specification}
                          onChange={(e) =>
                            setRequestComponent({
                              ...requestComponent,
                              component_specification: e.target.value,
                            })
                          }
                          style={{ width: "150px" }}
                        />
                      ) : (
                        <div className="custom-dropdown">
                          {/* Header */}
                          <div
                            className="bom-dropdown-header"
                            onClick={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();

                              setNewComponent((prev) => ({
                                ...prev,
                                openSpecDropdown: !prev.openSpecDropdown,
                                specDropdownPos: {
                                  top: rect.bottom,
                                  left: rect.left,
                                  width: rect.width,
                                },
                              }));
                            }}
                          >
                            <span className="bom-dropdown-text">
                              {components.find(
                                (c) =>
                                  c.component_id === newComponent.component,
                              )?.component_specification || "Select"}
                            </span>

                            <span className="dropdown-icon">▼</span>
                          </div>

                          {/* Portal Dropdown */}
                          {newComponent.openSpecDropdown &&
                            ReactDOM.createPortal(
                              <div
                                className="bom-dropdown-body-portal"
                                style={{
                                  position: "fixed",
                                  top: newComponent.specDropdownPos?.top || 0,
                                  left: newComponent.specDropdownPos?.left || 0,
                                }}
                              >
                                <input
                                  type="text"
                                  className="bom-dropdown-search"
                                  placeholder="Search specification..."
                                  value={searchText}
                                  onChange={(e) =>
                                    setSearchText(e.target.value)
                                  }
                                  autoFocus
                                />

                                <div className="bom-dropdown-list">
                                  {components
                                    .filter(
                                      (c) =>
                                        c.component_type ===
                                          newComponent.componentType &&
                                        c.component_specification
                                          .toLowerCase()
                                          .includes(searchText.toLowerCase()),
                                    )
                                    .map((c) => (
                                      <div
                                        key={c.component_id}
                                        className="bom-dropdown-item"
                                        onClick={() => {
                                          setNewComponent((prev) => ({
                                            ...prev,
                                            component: c.component_id,
                                            vendor: "",
                                            openSpecDropdown: false,
                                          }));
                                          setSearchText("");
                                        }}
                                      >
                                        {c.component_specification}
                                      </div>
                                    ))}

                                  {components.filter(
                                    (c) =>
                                      c.component_type ===
                                        newComponent.componentType &&
                                      c.component_specification
                                        .toLowerCase()
                                        .includes(searchText.toLowerCase()),
                                  ).length === 0 && (
                                    <div className="bom-dropdown-item no-data">
                                      No results found
                                    </div>
                                  )}
                                </div>
                              </div>,
                              document.body,
                            )}
                        </div>
                      )}
                    </td>

                    {/* UOM */}
                    <td>
                      {isRequestMode ? (
                        <input
                          type="text"
                          placeholder="Enter UOM"
                          value={requestComponent.uom}
                          onChange={(e) =>
                            setRequestComponent({
                              ...requestComponent,
                              uom: e.target.value,
                            })
                          }
                          style={{ width: "80px" }}
                        />
                      ) : (
                        components.find(
                          (c) => c.component_id === newComponent.component,
                        )?.unit_of_measurement || "-"
                      )}
                    </td>

                    {/* Quantity */}
                    <td>
                      <input
                        type="number"
                        value={
                          isRequestMode
                            ? requestComponent.quantity
                            : newComponent.quantity
                        }
                        onChange={(e) => {
                          const value = e.target.value;

                          if (isRequestMode) {
                            setRequestComponent({
                              ...requestComponent,
                              quantity: value,
                            });
                          } else {
                            setNewComponent({
                              ...newComponent,
                              quantity: value,
                            });
                          }
                        }}
                        style={{ width: "70px" }}
                      />
                    </td>

                    {/* Vendor */}
                    {(user?.role === "Inventory" || user?.role === "Admin") && (
                      <td
                        style={{
                          position: "relative",
                          opacity: isRequestMode ? 0.6 : 1,
                        }}
                      >
                        <div className="custom-dropdown">
                          <div
                            className="bom-dropdown-header"
                            onClick={(e) => {
                              if (isRequestMode) return; // ❌ disable click

                              const rect =
                                e.currentTarget.getBoundingClientRect();

                              setNewComponent((prev) => ({
                                ...prev,
                                openVendorDropdown: !prev.openVendorDropdown,
                                vendorDropdownPos: {
                                  top: rect.bottom,
                                  left: rect.left,
                                },
                              }));
                            }}
                            style={{
                              cursor: isRequestMode ? "not-allowed" : "pointer",
                              background: isRequestMode ? "#f3f3f3" : "white",
                            }}
                          >
                            <span className="bom-dropdown-text">
                              {isRequestMode
                                ? "Disabled"
                                : vendors.find(
                                    (v) => v.vendor_id === newComponent.vendor,
                                  )?.vendor_name || "Select"}
                            </span>

                            <span className="bom-dropdown-icon">▼</span>
                          </div>

                          {!isRequestMode &&
                            newComponent.openVendorDropdown &&
                            ReactDOM.createPortal(
                              <div
                                className="bom-dropdown-body-portal"
                                style={{
                                  position: "fixed",
                                  top: newComponent.vendorDropdownPos?.top || 0,
                                  left:
                                    newComponent.vendorDropdownPos?.left || 0,
                                }}
                              >
                                <input
                                  type="text"
                                  className="bom-dropdown-search"
                                  placeholder="Search vendor..."
                                  value={vendorSearch}
                                  onChange={(e) =>
                                    setVendorSearch(e.target.value)
                                  }
                                  autoFocus
                                />

                                <div className="bom-dropdown-list">
                                  {vendorMasterData
                                    .filter(
                                      (v) =>
                                        v.component_id ===
                                          newComponent.component &&
                                        vendors
                                          .find(
                                            (ven) => ven.vendor_id === v.vendor,
                                          )
                                          ?.vendor_name?.toLowerCase()
                                          .includes(vendorSearch.toLowerCase()),
                                    )
                                    .map((v) => {
                                      const vendorName =
                                        vendors.find(
                                          (ven) => ven.vendor_id === v.vendor,
                                        )?.vendor_name || "Vendor";

                                      return (
                                        <div
                                          key={v.vendor}
                                          className="bom-dropdown-item"
                                          onClick={() => {
                                            const vendorId = v.vendor;
                                            const componentId =
                                              newComponent.component;

                                            setNewComponent((prev) => ({
                                              ...prev,
                                              vendor: vendorId,
                                              price: "",
                                              tax: "",
                                              date: "",
                                              openVendorDropdown: false,
                                            }));

                                            setVendorSearch("");

                                            if (componentId && vendorId) {
                                              const matchedEntry =
                                                vendorMasterData.find(
                                                  (entry) =>
                                                    entry.component_id ===
                                                      componentId &&
                                                    entry.vendor === vendorId,
                                                );

                                              if (!matchedEntry) return;

                                              const productId =
                                                matchedEntry.product_id;

                                              const matchingPrices = priceTables
                                                .filter(
                                                  (p) =>
                                                    p.product === productId,
                                                )
                                                .sort(
                                                  (a, b) =>
                                                    new Date(b.current_time) -
                                                    new Date(a.current_time),
                                                );

                                              const latest = matchingPrices[0];
                                              if (!latest) return;

                                              const formattedDate =
                                                latest.current_time.split(
                                                  "T",
                                                )[0];

                                              setNewComponent((prev) => ({
                                                ...prev,
                                                price: latest.price,
                                                tax: latest.tax,
                                                date: formattedDate,
                                              }));
                                            }
                                          }}
                                        >
                                          {vendorName}
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>,
                              document.body,
                            )}
                        </div>
                      </td>
                    )}

                    {(user?.role === "Inventory" || user?.role === "Admin") && (
                      <td
                        style={{
                          background: isRequestMode ? "#f3f3f3" : "transparent",
                        }}
                      >
                        {isRequestMode
                          ? "-"
                          : newComponent.date
                            ? format(parseISO(newComponent.date), "dd-MM-yyyy")
                            : "-"}
                      </td>
                    )}

                    {/* Price */}
                    {(user?.role === "Inventory" || user?.role === "Admin") && (
                      <td
                        style={{
                          background: isRequestMode ? "#f3f3f3" : "transparent",
                        }}
                      >
                        {isRequestMode
                          ? "-"
                          : newComponent.price
                            ? `₹${parseFloat(newComponent.price).toFixed(2)}`
                            : "-"}
                      </td>
                    )}

                    {/* Tax */}
                    {(user?.role === "Inventory" || user?.role === "Admin") && (
                      <td
                        style={{
                          background: isRequestMode ? "#f3f3f3" : "transparent",
                        }}
                      >
                        {isRequestMode
                          ? "-"
                          : newComponent.tax
                            ? `${newComponent.tax}%`
                            : "-"}
                      </td>
                    )}
                    {(user?.role === "Inventory" || user?.role === "Admin") && (
                      <>
                        <td></td>

                        <td></td>

                        <td></td>
                      </>
                    )}

                    {/* Actions */}
                    <td className="action-cell">
                      <button className="save-btn" onClick={handleAddComponent}>
                        {isRequestMode ? "Submit Request" : "Save"}
                      </button>
                      <button
                        className="close-btn"
                        onClick={() => setShowAddRow(false)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                )}
                {selectedComponents.map((component, index) => {
                  const { price, tax, date } = getLatestPriceInfo(
                    component.component,
                    component.vendor,
                  );

                  return (
                    <tr key={index}>
                      <td>
                        <Link
                          to={`/components/${component.component.component_id}`}
                          style={{
                            textDecoration: "underline",
                            color: "inherit",
                          }}
                          title={`Open ${component.component.component_id} in CDP`}
                        >
                          {component.component.component_id}
                        </Link>
                      </td>
                      <td>{component.component.category}</td>
                      <td>{component.component.component_type}</td>
                      <td
                        className="specification-cell"
                        title={component.component.component_specification}
                      >
                        {component.component.component_specification}
                      </td>
                      <td>{component.component.unit_of_measurement}</td>
                      <td>
                        {editRowId === component.id ? (
                          <input
                            type="number"
                            value={editData.quantity}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                quantity: e.target.value,
                              })
                            }
                          />
                        ) : (
                          component.quantity
                        )}
                      </td>{" "}
                      {(user?.role === "Inventory" ||
                        user?.role === "Admin") && (
                        <>
                          <td>
                            {editRowId === component.id ? (
                              <div className="custom-dropdown">
                                <div
                                  className="bom-dropdown-header"
                                  onClick={(e) => {
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();

                                    setEditData((prev) => ({
                                      ...prev,
                                      openVendorDropdown:
                                        !prev.openVendorDropdown,
                                      vendorDropdownPos: {
                                        top: rect.bottom,
                                        left: rect.left,
                                      },
                                    }));
                                  }}
                                >
                                  <span className="bom-dropdown-text">
                                    {vendors.find(
                                      (v) => v.vendor_id === editData.vendor,
                                    )?.vendor_name || "Select"}
                                  </span>

                                  <span className="bom-dropdown-icon">▼</span>
                                </div>

                                {editData.openVendorDropdown &&
                                  ReactDOM.createPortal(
                                    <div
                                      className="bom-dropdown-body-portal"
                                      style={{
                                        position: "fixed",
                                        top:
                                          editData.vendorDropdownPos?.top || 0,
                                        left:
                                          editData.vendorDropdownPos?.left || 0,
                                      }}
                                    >
                                      <input
                                        type="text"
                                        className="bom-dropdown-search"
                                        placeholder="Search vendor..."
                                        value={vendorSearch}
                                        onChange={(e) =>
                                          setVendorSearch(e.target.value)
                                        }
                                        autoFocus
                                      />

                                      <div className="bom-dropdown-list">
                                        {vendorMasterData
                                          .filter(
                                            (v) =>
                                              v.component_id ===
                                                component.component
                                                  .component_id &&
                                              vendors
                                                .find(
                                                  (ven) =>
                                                    ven.vendor_id === v.vendor,
                                                )
                                                ?.vendor_name?.toLowerCase()
                                                .includes(
                                                  vendorSearch.toLowerCase(),
                                                ),
                                          )
                                          .map((v) => {
                                            const vendorName =
                                              vendors.find(
                                                (ven) =>
                                                  ven.vendor_id === v.vendor,
                                              )?.vendor_name || "Vendor";

                                            return (
                                              <div
                                                key={v.vendor}
                                                className="bom-dropdown-item"
                                                onClick={() => {
                                                  const vendorId = v.vendor;
                                                  const componentId =
                                                    component.component
                                                      .component_id;

                                                  let price = null;
                                                  let tax = null;
                                                  let latestDate = null;

                                                  const matchedEntry =
                                                    vendorMasterData.find(
                                                      (entry) =>
                                                        entry.component_id ===
                                                          componentId &&
                                                        entry.vendor ===
                                                          vendorId,
                                                    );

                                                  if (matchedEntry) {
                                                    const productId =
                                                      matchedEntry.product_id;

                                                    const matchingPrices =
                                                      priceTables
                                                        .filter(
                                                          (p) =>
                                                            p.product ===
                                                            productId,
                                                        )
                                                        .sort(
                                                          (a, b) =>
                                                            new Date(
                                                              b.current_time,
                                                            ) -
                                                            new Date(
                                                              a.current_time,
                                                            ),
                                                        );

                                                    const latest =
                                                      matchingPrices[0];

                                                    if (latest) {
                                                      price = latest.price;
                                                      tax = latest.tax;
                                                      latestDate =
                                                        latest.current_time.split(
                                                          "T",
                                                        )[0];
                                                    }
                                                  }

                                                  setEditData((prev) => ({
                                                    ...prev,
                                                    vendor: vendorId,
                                                    price: price,
                                                    tax: tax,
                                                    date: latestDate,
                                                    openVendorDropdown: false,
                                                  }));

                                                  setVendorSearch("");
                                                }}
                                              >
                                                {vendorName}
                                              </div>
                                            );
                                          })}
                                      </div>
                                    </div>,
                                    document.body,
                                  )}
                              </div>
                            ) : (
                              component.vendor?.vendor_name || "-"
                            )}
                          </td>
                          <td>
                            {editRowId === component.id
                              ? editData.date
                                ? format(parseISO(editData.date), "dd-MM-yyyy")
                                : "-"
                              : component.date
                                ? format(parseISO(component.date), "dd-MM-yyyy")
                                : "-"}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {editRowId === component.id
                              ? editData.price != null
                                ? `₹${parseFloat(editData.price).toFixed(2)}`
                                : "-"
                              : component.price != null
                                ? `₹${parseFloat(
                                    component.price,
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}`
                                : "-"}
                          </td>
                          <td>
                            {editRowId === component.id
                              ? editData.tax != null
                                ? `${editData.tax}%`
                                : "-"
                              : component.tax != null
                                ? `${component.tax}%`
                                : "-"}
                          </td>{" "}
                          <td>{showLatestPrice ? date : ""}</td>
                          <td style={{ textAlign: "right" }}>
                            {showLatestPrice
                              ? `₹${parseFloat(price || 0).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}`
                              : ""}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {showLatestPrice
                              ? `${Number.isFinite(tax) ? tax : 0}%`
                              : ""}
                          </td>
                          <td className="action-cell">
                            {editRowId === component.id ? (
                              <>
                                {/* ✅ SAVE */}
                                <button
                                  onClick={() => handleSaveEdit(component.id)}
                                  className="approve-btn"
                                >
                                  Save
                                </button>

                                {/* ❌ CANCEL */}
                                <button
                                  onClick={() => {
                                    setEditRowId(null);
                                    setEditData({});
                                  }}
                                  className="reject-btn"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                {/* ✏️ EDIT */}
                                <button
                                  onClick={() => {
                                    setEditRowId(component.id);
                                    setEditData({
                                      quantity: component.quantity,
                                      vendor: component.vendor?.vendor_id || "",
                                      date: component.date || "",
                                      price: component.price || "",
                                      tax: component.tax || "",
                                    });
                                  }}
                                >
                                  ✏️
                                </button>

                                {/* 🗑️ DELETE */}
                                <button
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: "5px",
                                    cursor: selectedBom.wbom
                                      ? "not-allowed"
                                      : "pointer",
                                    opacity: selectedBom.wbom ? 0.5 : 1,
                                  }}
                                  onClick={() => {
                                    if (!selectedBom.wbom) {
                                      handleDeleteComponent(component.id);
                                    }
                                  }}
                                  disabled={selectedBom.wbom}
                                >
                                  <img
                                    src={DeleteIcon}
                                    alt="Delete"
                                    style={{ width: "20px", height: "20px" }}
                                  />
                                </button>
                              </>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}

                {requestedComponents
                  .filter((req) => req.status !== "Added") // 🔥 hides approved rows
                  .map((req, index) => (
                    <tr
                      key={`req-${index}`}
                      style={{
                        backgroundColor:
                          req.status === "Rejected" ? "#f8d7da" : "#fff3cd",
                        opacity: req.status === "Rejected" ? 0.6 : 1,
                      }}
                    >
                      <td>REQ</td>
                      <td>{req.category}</td>
                      <td>{req.component_type}</td>
                      <td>{req.component_specification}</td>
                      <td>{req.uom}</td>
                      <td>{req.quantity}</td>
                      {(user?.role === "Inventory" ||
                        user?.role === "Admin") && (
                        <>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </>
                      )}

                      <td>
                        {user?.role === "Inventory" ||
                        user?.role === "Admin" ? (
                          req.status === "Rejected" ? (
                            <div>
                              <span
                                style={{ color: "red", fontWeight: "bold" }}
                              >
                                Rejected
                              </span>
                            </div>
                          ) : (
                            <div className="action-cell">
                              {/* APPROVE */}
                              <button
                                className="approve-btn"
                                disabled={req.status === "Added"}
                                onClick={() => handleApprove(req)}
                              >
                                {req.status === "Added" ? "Added" : "Approve"}
                              </button>

                              {/* REJECT */}
                              <button
                                className="reject-btn"
                                disabled={req.status === "Rejected"}
                                onClick={() => {
                                  setRejectId(req.id);
                                  setShowRejectPopup(true);
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          )
                        ) : (
                          <div>
                            <span
                              style={{ color: "orange", fontWeight: "bold" }}
                            >
                              {req.status}
                            </span>
                          </div>
                        )}
                      </td>

                      <td>
                        {req.remarks ? (
                          <span
                            style={{
                              color: req.status === "Rejected" ? "red" : "#333",
                            }}
                          >
                            {req.remarks}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
              {(user?.role === "Inventory" || user?.role === "Admin") && (
                <tfoot>
                  {(() => {
                    const { baseTotal, totalTaxAmount, grandTotal } =
                      calculateTotalPrice(false);
                    const latestTotals = calculateTotalPrice(true);
                    const cell = { textAlign: "right", fontWeight: "bold" };

                    return (
                      <>
                        {/* Row 1: Quantity + Base Price (+ latest base price on the right) */}
                        <tr>
                          <td colSpan="5" style={cell}>
                            Total Quantity:
                          </td>
                          <td colSpan="1" style={cell}>
                            {totalQuantity.toLocaleString("en-IN")}
                          </td>
                          <td colSpan="2" style={cell}>
                            Total Base Price:
                          </td>
                          <td colSpan="1" style={cell}>
                            {fmtINR(baseTotal)}
                          </td>

                          {showLatestPrice ? (
                            <>
                              {/* under Latest Date + Latest Price */}
                              <td colSpan="2" style={cell}>
                                Total Base Price (Latest):
                              </td>
                              {/* under Latest Tax */}
                              <td style={cell}>
                                {fmtINR(latestTotals.baseTotal)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td colSpan="2" />
                              <td />
                            </>
                          )}

                          {/* Actions col to keep grid/borders intact */}
                          <td />
                        </tr>

                        {/* Row 2: Tax */}
                        <tr>
                          <td colSpan="8" style={cell}>
                            Total Tax (GST):
                          </td>
                          <td colSpan="1" style={cell}>
                            {fmtINR(totalTaxAmount)}
                          </td>

                          {showLatestPrice ? (
                            <>
                              <td colSpan="2" style={cell}>
                                Total Tax (GST) (Latest):
                              </td>
                              <td style={cell}>
                                {fmtINR(latestTotals.totalTaxAmount)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td colSpan="2" />
                              <td />
                            </>
                          )}

                          <td />
                        </tr>

                        {/* Row 3: Grand total */}
                        <tr>
                          <td colSpan="8" style={cell}>
                            Grand Total (Price + GST):
                          </td>
                          <td colSpan="1" style={cell}>
                            {fmtINR(grandTotal)}
                          </td>

                          {showLatestPrice ? (
                            <>
                              <td colSpan="2" style={cell}>
                                Grand Total (Price + GST) (Latest):
                              </td>
                              <td style={cell}>
                                {fmtINR(latestTotals.grandTotal)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td colSpan="2" />
                              <td />
                            </>
                          )}

                          <td />
                        </tr>
                      </>
                    );
                  })()}
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}

      {showRejectPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h4>Reject Reason</h4>

            <textarea
              placeholder="Enter reason for rejection..."
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              rows={4}
              style={{ width: "100%" }}
            />

            <div className="popup-actions">
              <button
                className="save-btn"
                onClick={handleReject}
                disabled={!rejectRemark.trim()}
              >
                Submit
              </button>

              <button
                className="close-btn"
                onClick={() => {
                  setShowRejectPopup(false);
                  setRejectRemark("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainerComponent />
    </div>
  );
};

export default BOMDetails;
