// import React, { useEffect, useState } from "react";
// import CustomMessagebox from "./CustomMessageBox.jsx";
// import config from "../Config"; // Import config for API endpoints

// import {
//   showSuccessToast,
//   showErrorToast,
//   showInfoToast,
//   showWarningToast,
//   ToastContainerComponent,
// } from "./Toastify.jsx"; // Import Toastify utilities

// const Inwardlist = () => {
//   const [inwardData, setInwardData] = useState([]); // State to store inward data
//   const [showQCPopup, setShowQCPopup] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showMessageBox, setShowMessageBox] = useState(false);
//   const [messageBoxContent, setMessageBoxContent] = useState("");
//   const [skuPopupVisible, setSkuPopupVisible] = useState(false);
//   const [skuSerialNumber, setSkuSerialNumber] = useState("");
//   const [skuSelectedItem, setSkuSelectedItem] = useState(null);
//   const [poMasterData, setPoMasterData] = useState([]);
//   const [components, setComponents] = useState([]);
//   const [newQuestion, setNewQuestion] = useState({
//     qc_select: "",
//     description: "",
//     Good: false,
//     bad: false,
//     remark: "",
//     component_id: null,
//   }); // State for new question

//   const [filteredData, setFilteredData] = useState([]);
//   const [showScrollTop, setShowScrollTop] = useState(false); // Track visibility of scroll-to-top button

//   // Filters
//   const [poIdFilter, setPoIdFilter] = useState("");
//   const [vendorNameFilter, setVendorNameFilter] = useState("");
//   const [dateFilter, setDateFilter] = useState("");

//   // Utility function to safely access nested fields
//   const getNestedValue = (obj, keyPath, defaultValue = "Not Available") => {
//     try {
//       return (
//         keyPath.split(".").reduce((acc, key) => acc && acc[key], obj) ||
//         defaultValue
//       );
//     } catch {
//       return defaultValue;
//     }
//   };

//   // Fetch Inward Data
//   const fetchInwardData = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/inward/`);
//       const data = await response.json();
//       const result = data.filter((item) => item.mode_to_inventory === true);

//       if (Array.isArray(result)) {
//         setInwardData(result);
//         setFilteredData(result);
//       } else {
//         console.error("Unexpected API response format:", result);
//       }
//     } catch (err) {
//       console.error("Error fetching inward data:", err);
//     }
//   };

//   const fetchComponent = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/component/`);
//       const data = await response.json();
//       setComponents(data);
//     } catch (err) {
//       console.log("unable to fetch components", err);
//     }
//   };

//   const fetchpodetails = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/po_master/`);
//       const data = await response.json();
//       setPoMasterData(data);
//     } catch (err) {
//       console.log("unable to fetch PO details", err);
//     }
//   };

//   // Filtering logic
//   useEffect(() => {
//     let data = [...inwardData];

//     if (poIdFilter.trim() !== "") {
//       data = data.filter((item) =>
//         getNestedValue(item, "po_master.PO_id")
//           .toLowerCase()
//           .includes(poIdFilter.toLowerCase())
//       );
//     }

//     if (vendorNameFilter.trim() !== "") {
//       data = data.filter((item) =>
//         getNestedValue(item, "po_master.cart.vendor_name")
//           .toLowerCase()
//           .includes(vendorNameFilter.toLowerCase())
//       );
//     }

//     if (dateFilter.trim() !== "") {
//       data = data.filter((item) => {
//         const itemDate = new Date(item.date).toLocaleDateString();
//         return itemDate.includes(dateFilter);
//       });
//     }

//     setFilteredData(data);
//   }, [poIdFilter, vendorNameFilter, dateFilter, inwardData]);

//   useEffect(() => {
//     fetchInwardData();
//     fetchComponent();
//     fetchpodetails();
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 300) {
//         setShowScrollTop(true);
//       } else {
//         setShowScrollTop(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: "smooth", // Smooth scroll effect
//     });
//   };

//   return (
//     <div>
//       <div className="header">
//         <h2>Inward</h2>
//       </div>

//       {/* Render CustomMessagebox when showMessageBox is true */}
//       {showMessageBox && (
//         <CustomMessagebox
//           message={messageBoxContent}
//           onClose={() => setShowMessageBox(false)}
//         />
//       )}

//       <div className="table-container">
//         <table>
//           <thead>
//             <tr>
//               <th>PO_ID</th>
//               <th>Component ID</th>
//               <th>Component Specification</th>
//               <th>Vendor Name</th>
//               <th>Date</th>
//               <th>Invoice No</th>
//               <th>Invoice Date</th>
//               <th>Quantity</th>
//               <th>Unit Price</th>
//               <th>GST</th>
//               <th>Grand Total</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredData.map((item, index) => (
//               <tr key={index}>
//                 <td>{getNestedValue(item, "po_master.PO_id")}</td>
//                 <td>{getNestedValue(item, "po_master.cart.component_id")}</td>
//                 <td
//                   className="specification-cell"
//                   title={
//                     getNestedValue(
//                       item,
//                       "po_master.cart.component_specification"
//                     ) || "-"
//                   }
//                 >
//                   {getNestedValue(
//                     item,
//                     "po_master.cart.component_specification"
//                   )}
//                 </td>
//                 <td
//                   className="specification-cell"
//                   title={
//                     getNestedValue(item, "po_master.cart.vendor_name") || "-"
//                   }
//                 >
//                   {getNestedValue(item, "po_master.cart.vendor_name")}
//                 </td>
//                 <td>
//                   {new Date(item.date).toLocaleDateString() || "Not Available"}
//                 </td>
//                 <td></td>
//                 <td></td>
//                 <td></td>
//                 <td></td>
//                 <td></td>
//                 <td></td>
//                 <td className="action-buttons-cell">
//                   <button
//                     className="qc-button"
//                     onClick={() => handleQCClick(item)}
//                     disabled={
//                       item.quality_check === "Pass" ||
//                       item.quality_check === "Fail"
//                     }
//                   >
//                     QC
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <ToastContainerComponent />
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

// export default Inwardlist;

import React, { useEffect, useState } from "react";
import CustomMessagebox from "./CustomMessageBox.jsx";
import config from "../Config.js";
import { useNavigate } from "react-router-dom";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities

const Inwardlist = () => {
  const [inwardData, setInwardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Filters
  const [poIdFilter, setPoIdFilter] = useState("");
  const [vendorNameFilter, setVendorNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const navigate = useNavigate();

  // Utility function to safely access nested fields
  const getNestedValue = (obj, keyPath, defaultValue = "Not Available") => {
    try {
      return (
        keyPath.split(".").reduce((acc, key) => acc && acc[key], obj) ||
        defaultValue
      );
    } catch {
      return defaultValue;
    }
  };

  // Fetch Inward Data
  const fetchInwardData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/inward/`);
      const data = await response.json();
      const result = data.filter((item) => item.mode_to_inventory === true);

      const grouped = {};
      result.forEach((item) => {
        const poId = getNestedValue(item, "po_master.PO_id", "");
        const componentId = getNestedValue(
          item,
          "po_master.cart.component_id",
          ""
        );
        const key = `${poId}_${componentId}`;

        if (!grouped[key]) {
          grouped[key] = {
            ...item,
            quantity: 1,
            totalPrice: item.price || 0,
            gst: item.gst || 0,
          };
        } else {
          grouped[key].quantity += 1;
          grouped[key].totalPrice += item.price || 0;
        }
      });

      const groupedData = Object.values(grouped);
      setInwardData(groupedData);
      setFilteredData(groupedData);
    } catch (err) {
      console.error("Error fetching inward data:", err);
    }
  };

  useEffect(() => {
    fetchInwardData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calculateGrandTotal = (unitPrice, quantity, gst) => {
    const subtotal = unitPrice * quantity;
    const gstAmount = subtotal * (gst / 100);
    return subtotal + gstAmount;
  };

  return (
    <div>
      <div className="header">
        <h2>Inward</h2>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>PO_ID</th>
              <th>Component ID</th>
              <th>Component Specification</th>
              <th>Vendor Name</th>
              <th>Date</th>
              <th>Invoice No</th>
              <th>Invoice Date</th>
              <th style={{ textAlign: "right" }}>Quantity</th>
              <th style={{ textAlign: "right" }}>Unit Price</th>
              <th style={{ textAlign: "right" }}>GST</th>
              <th style={{ textAlign: "right" }}>Grand Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>{getNestedValue(item, "po_master.PO_id")}</td>
                <td>{getNestedValue(item, "po_master.cart.component_id")}</td>
                <td>
                  {getNestedValue(
                    item,
                    "po_master.cart.component_specification"
                  )}
                </td>
                <td>{getNestedValue(item, "po_master.cart.vendor_name")}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.invoice_number || "-"}</td>
                <td>{item.invoice_date || "-"}</td>
                <td style={{ textAlign: "right" }}>{item.quantity}</td>
                <td style={{ textAlign: "right" }}>{item.price || "-"}</td>
                <td style={{ textAlign: "right" }}>
                  {item.gst % 1 === 0
                    ? parseInt(item.gst)
                    : parseFloat(item.gst)}
                  %
                </td>
                <td style={{ textAlign: "right" }}>
                  {calculateGrandTotal(
                    item.price,
                    item.quantity,
                    item.gst
                  ).toFixed(2)}
                </td>
                <td>
                  <button
                    className="qc-button"
                    onClick={() =>
                      navigate(
                        `/inward?po_id=${getNestedValue(
                          item,
                          "po_master.PO_id"
                        )}&component_id=${getNestedValue(
                          item,
                          "po_master.cart.component_id"
                        )}`
                      )
                    }
                  >
                    QC
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToastContainerComponent />
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

export default Inwardlist;
