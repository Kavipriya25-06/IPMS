import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const PurchaseOrder = () => {
  const formRef = useRef();
  const { id } = useParams(); // Extract the PO ID from the route
  const [poData, setPOData] = useState(null); // State to store PO data
  const [loading, setLoading] = useState(true); // State to manage loading
  const [error, setError] = useState(null); // State to manage errors

  // Fetch PO data by ID
  const fetchPOData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_master/");
      const result = await response.json();

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

  // Render content
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handleDownload = () => {
    const input = formRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4"); // A4 size: Portrait mode, mm units
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const aspectRatio = canvasHeight / canvasWidth;

      const imageHeight = pdfWidth * aspectRatio; // Scale height proportionally to fit A4 width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imageHeight);

      pdf.save("PurchaseOrder.pdf");
    });
  };

  const containerStyle = {
    width: "210mm", // Match A4 width
    margin: "0 auto",
    padding: "20px",
    border: "2px solid #000",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
  };

  const titleStyle = {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: "20px",
  };

  const sectionStyle = {
    marginBottom: "20px",
    lineHeight: "1.5",
  };

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

  const totalStyle = {
    textAlign: "right",
    fontWeight: "bold",
    marginRight: "20px",
  };

  const footerStyle = {
    textAlign: "center",
    marginTop: "30px",
    fontStyle: "italic",
  };

  return (
    <div>
      <div ref={formRef} style={containerStyle}>
        <h1 style={titleStyle}>PURCHASE ORDER</h1>

        <div style={sectionStyle}>
          <h3>Invoice To</h3>
          <p>
            <strong>Dronix Technologies Pvt Ltd</strong>
            <br />
            No.7, KRJ Building, 3rd Floor, Welders Street, Mount Road, Chennai -
            600002.
            <br />
            GSTIN/UIN: 33AAGCD1081K1ZS
            <br />
            State Name: Tamil Nadu, Code: 33
            <br />
            E-Mail:{" "}
            <a href="mailto:finance@aero360.co.in">finance@aero360.co.in</a>
          </p>
        </div>

        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={thTdStyle}>Voucher No.</td>
              <td style={thTdStyle}>11/24-25</td>
              <td style={thTdStyle}>Dated</td>
              <td style={thTdStyle}>19-Oct-24</td>
            </tr>
            <tr>
              <td style={thTdStyle}>Mode/Terms of Payment</td>
              <td style={thTdStyle}></td>
              <td style={thTdStyle}>Reference No. & Date</td>
              <td style={thTdStyle}>11/24-25</td>
            </tr>
            <tr>
              <td style={thTdStyle}>Other References</td>
              <td style={thTdStyle}></td>
              <td style={thTdStyle}>Dispatched through</td>
              <td style={thTdStyle}></td>
            </tr>
          </tbody>
        </table>

        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={thTdStyle} colSpan="4">
                <h3>Consignee (Ship to)</h3>
                <p>
                  <strong>Dronix Technologies Pvt Ltd</strong>
                  <br />
                  No.7, KRJ Building, 3rd Floor, Welders Street, Mount Road,
                  Chennai - 600002.
                  <br />
                  E-Mail:{" "}
                  <a href="mailto:finance@aero360.co.in">
                    finance@aero360.co.in
                  </a>
                  <br />
                  GSTIN/UIN: 33AAGCD1081K1ZS
                  <br />
                  State Name: Tamil Nadu, Code: 33
                </p>
              </td>
            </tr>
            <tr>
              <td style={thTdStyle} colSpan="4">
                <h3>Supplier (Bill from)</h3>
                <p>
                  <strong>Amuse</strong>
                  <br />
                  No.8 Oil Monger Street, Triplicane
                  <br />
                  GSTIN/UIN: 33ABPFA9368K1ZS
                  <br />
                  State Name: Tamil Nadu, Code: 33
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Sl No.</th>
              <th style={thTdStyle}>Description of Goods</th>
              <th style={thTdStyle}>Due on</th>
              <th style={thTdStyle}>Quantity</th>
              <th style={thTdStyle}>Rate</th>
              <th style={thTdStyle}>Per</th>
              <th style={thTdStyle}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {poData.map((po, index) => (
              <tr key={po.id}>
                <td style={thTdStyle}>{index + 1}</td>
                <td style={thTdStyle}>
                  {po.cart_details.component_specification}
                </td>
                <td style={thTdStyle}>{po.due_date || "N/A"}</td>{""}
                
                <td style={thTdStyle}>
                  {po.cart_details.quantity}{""}
                  {po.cart_details.unit_of_measurement}
                </td>
                <td style={thTdStyle}>{po.cart_details.unit_price}</td>
                <td style={thTdStyle}>{po.cart_details.unit_of_measurement}</td>
                <td style={thTdStyle}>{po.cart_details.total_cost}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={totalStyle}>Total: ₹ 913.32</p>
        <p>
          Amount Chargeable (in words): INR Nine Hundred Thirteen and Thirty Two
          Paise Only
        </p>
        <p style={footerStyle}>
          E. & O.E
          <br />
          <strong>for Dronix Technologies Pvt Ltd</strong>
          <br />
          <br />
          Authorised Signatory
          <br />
          <small>This is a Computer Generated Document</small>
        </p>
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
