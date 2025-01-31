import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toWords from "num-to-words";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import config from "../Config"; // Import config for API endpoints

const EditableField = ({ value, onChange, type = "text", style }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      border: "1px solid #ccc",
      padding: "4px",
      width: "100%",
      ...style,
    }}
  />
);

const FirstSection = ({ vendorName, vendorContact, poListData }) => {
  const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch", // Ensure both panels span the same height
    borderBottom: "1px solid black",
    marginBottom: "20px",
    paddingBottom: "10px",
  };

  const leftPanelStyle = {
    width: "50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between", // Distribute the sections evenly
  };

  const rightPanelStyle = {
    width: "50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between", // Align grid and terms of delivery
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    rowGap: "0", // Remove spacing between rows
    columnGap: "0", // Remove spacing between columns
    flexGrow: 1, // Allow the grid to grow
  };

  const gridCellStyle = {
    border: "1px solid #000",
    padding: "0", // Remove padding inside cells
    fontWeight: "bold",
  };

  const gridValueStyle = {
    border: "1px solid #000",
    padding: "0", // Remove padding inside cells
  };

  const termsStyle = {
    border: "1px solid #000",
    padding: "0", // Remove padding inside "Terms of Delivery"
    marginTop: "0", // Remove margin between grid and "Terms of Delivery"
    fontWeight: "bold",
    textAlign: "center",
    flexGrow: 1, // Allow the terms section to grow
  };

  return (
    <div style={containerStyle}>
      {/* Left Panel */}
      <div style={leftPanelStyle}>
        {/* "Invoice To" Section */}
        <div>
          <h3>Invoice To</h3>
          <p>
            <strong>Dronix Technologies Pvt Ltd</strong>
            <br />
            No.7, KRJ Building, 3rd Floor, Welders Street,
            <br />
            Mount Road, Chennai - 600002.
            <br />
            GSTIN/UIN: 33AAGCD1081K1ZS
            <br />
            State Name: Tamil Nadu, Code: 33
            <br />
            E-Mail:{" "}
            <a href="mailto:finance@aero360.co.in">finance@aero360.co.in</a>
          </p>
        </div>

        {/* "Consignee (Ship to)" Section */}
        <div>
          <h3>Consignee (Ship to)</h3>
          <p>
            <strong>Dronix Technologies Pvt Ltd</strong>
            <br />
            No.7, KRJ Building, 3rd Floor, Welders Street,
            <br />
            Mount Road, Chennai - 600002.
            <br />
            GSTIN/UIN: 33AAGCD1081K1ZS
            <br />
            State Name: Tamil Nadu, Code: 33
            <br />
            E-Mail:{" "}
            <a href="mailto:operations@aero360.co.in">
              operations@aero360.co.in
            </a>
          </p>
        </div>

        {/* "Supplier (Bill from)" Section */}
        <div>
          <h3>Supplier (Bill from)</h3>
          <p>
            <strong>{vendorName || "N/A"}</strong>
            <br />
            {vendorContact?.location || "Location not available"}
            <br />
            GSTIN/UIN: 33ABPFA9368K1ZS
            <br />
            State Name: Tamil Nadu, Code: 33
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={rightPanelStyle}>
        {/* 2x4 Grid */}
        <div style={gridStyle}>
          <div style={gridCellStyle}>PO. No.</div>
          <div style={gridCellStyle}>Date {poListData?.date || ""}</div>
          <div style={gridCellStyle}></div>
          <div style={gridCellStyle}>Mode/Terms of Payment</div>
          <div style={gridCellStyle}>Reference No. and Date</div>
          <div style={gridCellStyle}>Other References</div>
          <div style={gridCellStyle}>Dispatched through</div>
          <div style={gridCellStyle}>Destination</div>
        </div>

        {/* "Terms of Delivery" Section */}
        <div style={termsStyle}>
          <h3>Terms of Delivery</h3>
        </div>
      </div>
    </div>
  );
};

// Middle Section Component
const MiddleSection = ({ poData }) => {
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  };

  const thTdStyle = {
    border: "1px solid #000",
    padding: "6px",
    textAlign: "left",
  };

  const handleRowChange = (index, field, value) => {
    const updatedData = [...poData];
    updatedData[index][field] = value;
    onUpdatePoData(updatedData);
  };

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thTdStyle}>Sl No.</th>
          <th style={thTdStyle}>Description of Goods</th>
          <th style={thTdStyle}>Due on</th>
          <th style={thTdStyle}>Quantity</th>
          <th style={thTdStyle}>Rate</th>
          <th style={thTdStyle}>UOM</th>
          <th style={thTdStyle}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {poData.map((po, index) => (
          <tr key={po.id}>
            <td style={thTdStyle}>{index + 1}</td>
            <td style={thTdStyle}>{po.cart_details.component_specification}</td>
            <td style={thTdStyle}>{po.due_date || "N/A"}</td>
            <td style={thTdStyle}>{po.cart_details.quantity}</td>
            <td style={thTdStyle}>{po.cart_details.unit_price}</td>
            <td style={thTdStyle}>{po.cart_details.unit_of_measurement}</td>
            <td style={thTdStyle}>
              {(po.cart_details.unit_price * po.cart_details.quantity).toFixed(
                2
              )}
            </td>
          </tr>
        ))}

        {/* Total Row */}
        <tr>
          <td align="right" colSpan="6">
            Sub Total
          </td>
          <td>
            {poData
              .reduce((sum, po) => {
                const total =
                  po.cart_details.unit_price * po.cart_details.quantity || 0;
                return sum + total;
              }, 0)
              .toFixed(2)}
          </td>
        </tr>
        {/* CGST Row */}
        <tr>
          <td align="right" colSpan="6">
            CGST (9%)
          </td>
          <td>
            {(
              poData.reduce((sum, po) => {
                const total =
                  po.cart_details.unit_price * po.cart_details.quantity || 0;
                return sum + total;
              }, 0) * 0.09
            ).toFixed(2)}
          </td>
        </tr>

        {/* SGST Row */}
        <tr>
          <td align="right" colSpan="6">
            SGST (9%)
          </td>
          <td>
            {(
              poData.reduce((sum, po) => {
                const total =
                  po.cart_details.unit_price * po.cart_details.quantity || 0;
                return sum + total;
              }, 0) * 0.09
            ).toFixed(2)}
          </td>
        </tr>

        {/* Grand Total Row */}
        <tr>
          <td align="right" colSpan="6">
            Total
          </td>
          <td>
            {(
              poData.reduce((sum, po) => {
                const total =
                  po.cart_details.unit_price * po.cart_details.quantity || 0;
                return sum + total;
              }, 0) * 1.18
            ).toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

// Bottom Section Component
const BottomSection = ({ grandTotal, totalInWords }) => {
  const footerStyle = {
    textAlign: "right",
    marginTop: "30px",
    fontStyle: "italic",
  };

  const computerStyle = {
    alignItems: "center",
    textAlign: "center",
    fontStyle: "italic",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p>
          Amount Chargeable (in words): <br />
          <strong>INR {totalInWords}</strong>
        </p>
        <p style={{ margin: 0 }}>E. & O.E</p>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />

      <p style={footerStyle}>
        <br />
        <strong>for Dronix Technologies Pvt Ltd</strong>
        <br />
        <br />
        <br />
        <br />
        Authorised Signatory
        <br />
      </p>
      <p style={computerStyle}>
        <small>This is a Computer Generated Document</small>
      </p>
    </div>
  );
};

// Main PurchaseOrder Component
const PurchaseOrder = () => {
  const formRef = useRef();
  const { id } = useParams();
  const [poData, setPOData] = useState([]);
  const [poListData, setPOListData] = useState(null);
  const [vendorContact, setVendorContact] = useState(null);
  const [vendorName, setVendorName] = useState(null);
  const [loading, setLoading] = useState(true); // State to manage loading
  const [error, setError] = useState(null); // State to manage errors

  // Fetch PO data by ID
  const fetchPOData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/po_master/`);
      const result = await response.json();
      console.log("PO master data", response, "And the result", result);

      if (Array.isArray(result)) {
        // Filter the array for matching PO ID and set state with the result
        const filteredPOs = result.filter((po) => po.PO_id === id);

        if (filteredPOs.length > 0) {
          setPOData(filteredPOs); // Set POData as an array of matching results
        } else {
          setError("No Purchase Orders found matching the given ID.");
        }
      } else {
        setError("Unexpected response format: Expected an array.");
      }
    } catch (err) {
      setError("Error fetching Purchase Order data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPOData();
  }, [id]);

  // Fetch PO data
  const fetchPOListData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/po_list/`);
      const result = await response.json();
      console.log("PO list data", response, "And the result", result);
      const filteredPO = result.find((po) => po.id === id);
      if (filteredPO) {
        setPOListData(filteredPO);
        fetchVendorDetails(filteredPO.cart_details.vendor_id);
      } else {
        setError("Purchase Order not found.");
      }
    } catch (err) {
      setError("Error fetching Purchase Order data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Vendor Contact and Name
  const fetchVendorDetails = async (vendorId) => {
    try {
      // Fetch vendor contact details
      const contactResponse = await fetch(
        `${config.apiBaseURL}/vendor_sub_list/`
      );
      const contactResult = await contactResponse.json();
      const contactDetails = contactResult.find(
        (contact) => contact.vendor === vendorId
      );
      console.log("Fetched vendor", vendorId);
      console.log("Contact details", contactResult);

      // Fetch vendor name
      const vendorResponse = await fetch(`${config.apiBaseURL}/vendor_list/`);
      const vendorResult = await vendorResponse.json();
      const vendorDetails = vendorResult.find(
        (vendor) => vendor.vendor_id === vendorId
      );

      setVendorContact(contactDetails);
      setVendorName(vendorDetails?.vendor_name);
    } catch (err) {
      console.error("Error fetching vendor details:", err);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPOListData();
  }, [id]);

  // Render content
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const convertNumberToWords = (number) => {
    const rupees = Math.floor(number); // Get the rupee part
    const paise = Math.round((number - rupees) * 100); // Get the paise part

    const rupeesInWords = `${toWords(rupees)} Rupees`;
    const paiseInWords = paise > 0 ? ` and ${toWords(paise)} Paise` : "";

    return `${rupeesInWords}${paiseInWords} Only`.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
  };

  {
    /* Calculate the grand total */
  }
  const grandTotal = (
    poData.reduce((sum, po) => {
      const total = po.cart_details.unit_price * po.cart_details.quantity || 0;
      return sum + total;
    }, 0) * 1.18
  ).toFixed(2);

  const totalInWords = convertNumberToWords(parseFloat(grandTotal));

  const containerStyle = {
    width: "210mm", // A4 width
    height: "297mm", // A4 height
    margin: "0 auto",
    padding: "10mm", // Add a small padding for aesthetics
    boxSizing: "border-box",
    border: "1px solid #000",
    fontFamily: "Arial, sans-serif",
    fontSize: "10px",
  };

  const handleDownload = () => {
    const input = formRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save("PurchaseOrder.pdf");
    });
  };

  return (
    <div>
      <div ref={formRef} style={containerStyle}>
        <h3 style={{ textAlign: "center" }}>PURCHASE ORDER</h3>
        <FirstSection
          vendorName={vendorName}
          vendorContact={vendorContact}
          poListData={poListData}
        />
        <MiddleSection poData={poData} />
        <BottomSection grandTotal={grandTotal} totalInWords={totalInWords} />
      </div>
      <button
        onClick={handleDownload}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        Download as PDF
      </button>
    </div>
  );
};

export default PurchaseOrder;
