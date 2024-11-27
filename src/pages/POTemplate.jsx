import React, { useRef } from "react";
import toWords from "num-to-words"; // Import the library
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const PurchaseOrder = () => {
  const formRef = useRef();
  const { id } = useParams(); // Extract the PO ID from the route
  const [poData, setPOData] = useState([]); // State to store PO data
  const [poListData, setPOListData] = useState(null);
  const [vendorContact, setVendorContact] = useState(null);
  const [vendorName, setVendorName] = useState(null);
  const [loading, setLoading] = useState(true); // State to manage loading
  const [error, setError] = useState(null); // State to manage errors

  // Fetch PO data by ID
  const fetchPOData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/po_master/");
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
      const response = await fetch("http://127.0.0.1:8000/po_list/");
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
        "http://127.0.0.1:8000/vendor_sub_list/"
      );
      const contactResult = await contactResponse.json();
      const contactDetails = contactResult.find(
        (contact) => contact.vendor === vendorId
      );
      console.log("Fetched vendor", vendorId);
      console.log("Contact details", contactResult);

      // Fetch vendor name
      const vendorResponse = await fetch("http://127.0.0.1:8000/vendor_list/");
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

  // Convert grand total to words
  // const totalInWords = grandTotal
  //   ? toWords(parseFloat(grandTotal).toFixed(0)) + " Rupees Only"
  //   : "";
  const totalInWords = convertNumberToWords(parseFloat(grandTotal));

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
              <td style={thTdStyle}>{poListData.date}</td>
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
                  <strong>{vendorName || "N/A"}</strong>
                  <br />
                  {vendorContact?.location || "Location not available"}
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
            {poData && poData.length > 0 ? (
              poData.map((po, index) => (
                <tr key={po.id}>
                  <td style={thTdStyle}>{index + 1}</td>
                  <td style={thTdStyle}>
                    {po.cart_details.component_specification}
                  </td>
                  <td style={thTdStyle}>{po.due_date || "N/A"}</td>
                  {""}

                  <td style={thTdStyle}>
                    {po.cart_details.quantity}
                    {""}
                    {po.cart_details.unit_of_measurement}
                  </td>
                  <td style={thTdStyle}>{po.cart_details.unit_price}</td>
                  <td style={thTdStyle}>
                    {po.cart_details.unit_of_measurement}
                  </td>
                  <td style={thTdStyle}>
                    {po.cart_details.unit_price && po.cart_details.quantity
                      ? (
                          po.cart_details.unit_price * po.cart_details.quantity
                        ).toFixed(2)
                      : "0.00"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={thTdStyle} colSpan="7">
                  No Purchase Orders found.
                </td>
              </tr>
            )}

            {/* Total Row */}
            <tr>
              <td align="right" colSpan="6">
                Total
              </td>
              <td>
                {poData
                  .reduce((sum, po) => {
                    const total =
                      po.cart_details.unit_price * po.cart_details.quantity ||
                      0;
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
                      po.cart_details.unit_price * po.cart_details.quantity ||
                      0;
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
                      po.cart_details.unit_price * po.cart_details.quantity ||
                      0;
                    return sum + total;
                  }, 0) * 0.09
                ).toFixed(2)}
              </td>
            </tr>

            {/* Grand Total Row */}
            <tr>
              <td colSpan="6">Grand Total</td>
              <td>
                {(
                  poData.reduce((sum, po) => {
                    const total =
                      po.cart_details.unit_price * po.cart_details.quantity ||
                      0;
                    return sum + total;
                  }, 0) * 1.18
                ).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* <p style={totalStyle}>Total: ₹ 913.32</p> */}
        {/* <p>
          Amount Chargeable (in words): INR Nine Hundred Thirteen and Thirty Two
          Paise Only
        </p> */}
        <p>
          Amount Chargeable (in words): <strong>INR {totalInWords}</strong>
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
