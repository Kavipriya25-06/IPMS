import React, { useEffect, useState } from "react";

import config from "../Config"; // Import config for API endpoints
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Back from "../assets/Back.png";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaTrashAlt, FaEdit, FaCheck } from "react-icons/fa";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showMessageToast,
  ToastContainerComponent,
} from "./Toastify.jsx"; // Import Toastify utilities
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const POOrderMaster = ({ user }) => {
  const { poId } = useParams(); // Extract PO ID from the route
  const [poDetails, setPODetails] = useState([]);
  const [poData, setPOData] = useState(null); // State for storing PO data
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDateInput, setShowDateInput] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [inwardLoadingIds, setInwardLoadingIds] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate
  const [showPlaceOrderPopup, setShowPlaceOrderPopup] = useState(false);
  const [placeOrderDateTime, setPlaceOrderDateTime] = useState(new Date());

  const [showOrderedTable, setShowOrderedTable] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const isPOCancelled = poData?.status === "Cancelled";

  const [showShippedPopup, setShowShippedPopup] = useState(false);
  const [selectedPendingItem, setSelectedPendingItem] = useState(null);
  const [shippedInput, setShippedInput] = useState({
    quantity: "",
    date: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });

  const [vendorLocation, setVendorLocation] = useState("N/A");
  const [vendorPOC, setVendorPOC] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [poPdfPopupOpen, setPoPdfPopupOpen] = useState(false);

  const [extraFields, setExtraFields] = useState({
    refDate: "",
    quotationNo: "",
    paymentTerms: "",
    deliveryMode: "",
    remarks: "",
    shippingCharges: 0,
  });

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    width: "min(720px, 96vw)",
    background: "#fff",
    borderRadius: "10px",
    padding: "16px",
    maxHeight: "85vh",
    overflow: "auto",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  };

  // Pick a sensible "location" string from a vendor_sub_list row
  const extractLocation = (row) => {
    if (!row) return null;
    return row.location || null; // your API uses "location"
  };

  // If multiple sub-rows exist for the vendor, prefer default_poc === true
  const pickBestSubRow = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const def = rows.find((r) => r.default_poc === true);
    return def || rows[0];
  };

  const fetchVendorLocation = async (resolvedVendorId) => {
    try {
      if (!resolvedVendorId) {
        setVendorLocation("N/A");
        setVendorPOC(null);
        return;
      }

      const res = await fetch(`${config.apiBaseURL}/vendor_sub_list/`);
      if (!res.ok) throw new Error("Failed to fetch vendor_sub_list");
      const list = await res.json();

      // Your sublist uses "vendor": "V_00001"
      const matches = list.filter((row) => row?.vendor === resolvedVendorId);
      const best = pickBestSubRow(matches);

      setVendorLocation(extractLocation(best) || "N/A");
      // optional: keep POC info if you want to show/email it
      setVendorPOC(
        best
          ? {
              name: best.point_of_contact || "",
              email: best.email || "",
              phone: best.phone_number || "",
            }
          : null
      );
    } catch (e) {
      console.error("fetchVendorLocation error:", e);
      setVendorLocation("N/A");
      setVendorPOC(null);
    }
  };

  useEffect(() => {
    // Prefer vendor_id from poData (your header uses poData.cart_details)
    const vid =
      poData?.cart_details?.vendor_id ??
      poDetails?.[0]?.cart_details?.vendor_id ??
      null;

    if (vid) {
      fetchVendorLocation(vid);
    } else {
      setVendorLocation("N/A");
      setVendorPOC(null);
    }
  }, [poData, poDetails]);

  // The user object is now passed as a prop
  const isAdmin = user?.role === "Admin";
  const isProcurement = user?.role === "Procurement";
  const isFinance = user?.role === "Finance";

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch PO Details
  const fetchPODetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/po_master/`);
      const result = await response.json();
      // const filteredPO = result.filter((order) => order.PO_id === poId);
      // setPODetails(filteredPO);
      const filteredPO = result
        .filter((order) => order.PO_id === poId)
        .map((item) => ({
          ...item,
          // keep the original quantity so edits can't exceed it later
          original_quantity: item.cart_details?.quantity ?? 0,
        }));
      setPODetails(filteredPO);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch PO details");
      console.error(error);
    }
  };

  // Fetch Order Status
  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/order_view/`);
      const result = await response.json();
      const filteredStatus = result.find(
        (status) => status.po_master_id === poDetails[0]?.id
      );
      setOrderStatus(filteredStatus || {});
    } catch (error) {
      console.error("Failed to fetch order status:", error.message);
    }
  };

  // Update Order Status
  const updateOrderStatus = async (newStatus, date) => {
    if (!poDetails.length) return;
    if (!date) {
      showInfoToast("Please select a date before updating the status.");
      return;
    }

    const poMasterId = poDetails[0].id;
    const payload = {
      order_placed_status:
        newStatus === "Ordered"
          ? "Ordered"
          : orderStatus?.order_placed_status || "",
      order_placed_date_time:
        newStatus === "Ordered"
          ? date
          : orderStatus?.order_placed_date_time || null,
      customer_status:
        newStatus === "Shipped"
          ? "Shipped"
          : orderStatus?.customer_status || "",
      customer_date_time:
        newStatus === "Shipped"
          ? date
          : orderStatus?.customer_date_time || null,
      received_status:
        newStatus === "Received"
          ? "Received"
          : orderStatus?.received_status || "",
      received_date:
        newStatus === "Received" ? date : orderStatus?.received_date || null,
      po_master_id: poMasterId,
    };

    try {
      const method = orderStatus?.id ? "PUT" : "POST";
      const apiUrl = orderStatus?.id
        ? `${config.apiBaseURL}/order_view/${orderStatus.id}/`
        : `${config.apiBaseURL}/order_view/`;

      const response = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`${newStatus} status updated successfully.`);
        fetchOrderStatus(); // Refresh status
        // setShowDateInput(false); // Hide date input
        setSelectedDate(""); // Reset selected date
        setSelectedStatus(null); // Reset selected status
      } else {
        console.error("Failed to update order status:", await response.json());
      }
    } catch (error) {
      console.error("Error updating order status:", error.message);
    }
  };

  const handleStatusButtonClick = (status) => {
    setSelectedStatus(status);
    // setShowDateInput(true);
    setShowPopup(true); // Show the popup
  };

  const handleUpdateStatus = () => {
    if (!selectedDate) {
      showInfoToast("Please select a date and time.");
      return;
    }
    updateOrderStatus(selectedStatus, selectedDate);
    updatePOStatus(poId, selectedStatus);
    updatePOMasterStatuses(poId, selectedStatus);
    setShowPopup(false); // Close the popup
  };

  // Fetch PO Data for PO ID
  const fetchPOData = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/po_list/`);
      const result = await response.json();

      if (Array.isArray(result)) {
        const filteredPO = result.find((order) => order.id === poId);
        setPOData(filteredPO || null);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error fetching PO data:", error.message);
    }
  };

  const updatePOStatus = async (poId, newStatus) => {
    try {
      const payload = {
        status: newStatus,
      };

      const response = await fetch(`${config.apiBaseURL}/po_list/${poId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`PO status updated to "${newStatus}" successfully.`);
        fetchPOData(); // Refresh PO data after updating status
      } else {
        const errorData = await response.json();
        console.error("Failed to update PO status:", errorData);
        showErrorToast(`Failed to update status: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error updating PO status:", error.message);
      showErrorToast("An error occurred while updating the status.");
    }
  };

  const updatePOMasterStatuses = async (poId, newStatus) => {
    try {
      // Fetch all PO Master data
      const response = await fetch(`${config.apiBaseURL}/po_master/`);
      if (!response.ok) {
        throw new Error("Failed to fetch PO Master data.");
      }
      const poMasterData = await response.json();

      // Filter entries matching the poId
      const matchingEntries = poMasterData.filter(
        (entry) => entry.PO_id === poId
      );

      if (matchingEntries.length === 0) {
        showErrorToast(`No entries found for PO ID: ${poId}`);
        return;
      }

      // Loop through matching entries and update their status
      for (const entry of matchingEntries) {
        const payload = {
          status: newStatus,
        };

        const updateResponse = await fetch(
          `${config.apiBaseURL}/po_master/${entry.id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (updateResponse.ok) {
          console.log(
            `Updated PO Master entry ID: ${entry.id} to "${newStatus}"`
          );
        } else {
          const errorData = await updateResponse.json();
          console.error(
            `Failed to update PO Master entry ID: ${entry.id}`,
            errorData
          );
          showErrorToast(`Error updating entry ID: ${entry.id}`);
        }
      }

      `Successfully updated all entries for PO ID: ${poId}`;
    } catch (error) {
      console.error("Error updating PO Master statuses:", error.message);
      showErrorToast(
        "An error occurred while updating the PO Master statuses."
      );
    }
    setPOData((prevData) => ({
      ...prevData,
      status: newStatus,
    }));
  };

  useEffect(() => {
    if (poId) {
      fetchPODetails();
      fetchPOData();
      // fetchOrderedItems(); // only when poId is valid
    }
  }, [poId]);

  useEffect(() => {
    if (poDetails[0]?.PO_id) {
      fetchOrderedItems(poDetails[0].PO_id);
    }
  }, [poDetails]);

  useEffect(() => {
    if (poDetails.length > 0) {
      fetchOrderStatus();
    }
  }, [poDetails]);

  const getCurrentStatus = () => {
    if (orderStatus.received_status === "Received") {
      return { status: "Received", date: orderStatus.received_date };
    } else if (orderStatus.customer_status === "Shipped") {
      return { status: "Shipped", date: orderStatus.customer_date_time };
    } else if (orderStatus.order_placed_status === "Ordered") {
      return { status: "Ordered", date: orderStatus.order_placed_date_time };
    } else {
      return { status: "Not Started", date: null };
    }
  };

  const currentStatus = getCurrentStatus();

  // Compute Total Price, GST, and Final Total
  const computeTotals = () => {
    const totals = poDetails.reduce(
      (acc, po) => {
        const totalquantity = parseFloat(po.edited_quantity || 0);
        const totalcost = parseFloat(po.edited_total_cost || 0);
        acc.totalquantity += totalquantity; // Exclude GST from total price
        acc.totalcost += totalcost;
        // acc.finalTotal += totalCost + gst; // Include GST in final total
        return acc;
      },
      { totalquantity: 0, totalcost: 0 }
    );

    return {
      totalquantity: totals.totalquantity.toFixed(),
      totalcost: totals.totalcost.toFixed(2),
      // finalTotal: totals.finalTotal.toFixed(2),
    };
  };

  const vendorName = poData?.cart_details?.vendor_name || "N/A";
  const vendor_gstn = poData?.cart_details?.gstn || "";

  const { totalquantity, totalcost } = computeTotals();

  const handleOpenModal = () => {
    setFormData((prev) => ({
      ...prev,
      subject: `Order Details for PO ID: ${poId}`,
      sender_title: `Order Details for PO ID: ${poId}`,
    }));
    setShowModal(true);
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedItems = [...orderedItems];
    updatedItems[index][name] = value;
    setOrderedItems(updatedItems);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Purchase Order", 105, 10, { align: "center" });
    doc.text(`PO ID: ${poId}`, 10, 20);
    doc.text(`Vendor Name: ${vendorName}`, 10, 30);
    doc.text(`Date: ${poData?.date || "N/A"}`, 10, 40);
    doc.text(`GSTIN: ${vendor_gstn}`, 10, 50);
    doc.text("Order Details:", 10, 60);

    const columns = ["Description", "UOM", "Qty", "Unit Price", "GST", "Total"];

    const rows = poDetails.map((po) => [
      po.cart_details.component_specification,
      po.cart_details.unit_of_measurement,
      po.cart_details.quantity,
      parseFloat(po.cart_details.unit_price).toFixed(2),
      parseFloat(po.cart_details.GST).toFixed(2),
      parseFloat(po.cart_details.total_cost).toFixed(2),
    ]);

    // Add totals row
    rows.push([
      "Totals",
      "",
      totalquantity,
      "",
      "",
      parseFloat(totalcost).toFixed(2),
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 70,
    });

    return doc.output("blob");
  };

  // --- FINAL generateStyledPOPdf (old + new merged) ---
  const generateStyledPOPdf = async ({
    poId,
    poData,
    poDetails,
    vendorName,
    vendor_gstn,
    vendorLocation,
    vendorPOC,
    extraFields, // ✅ added for new values
  }) => {
    const {
      refDate,
      quotationNo,
      paymentTerms,
      deliveryMode,
      remarks,
      shippingCharges,
    } = extraFields || {}; // ✅ safely destructure

    const doc = new jsPDF({ unit: "pt", format: "a4" }); // 595 x 842
    const font = "helvetica";
    const INR = (n) =>
      "INR " +
      Number(n || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const M = 32; // outer margin
    const usable = pageWidth - M * 2;
    const lh = 14; // line height

    // spacing knobs
    const GAP_AFTER_TITLE = 12;
    const GAP_BETWEEN_COLS = 14;
    const GAP_BELOW_COLS = 22;
    const SECTION_DIVIDER_H = 10;
    const BLOCK_GAP = 12;

    let y = M;

    // ───────────────── Header ─────────────────
    doc.setDrawColor(40);
    doc.line(M, y - 10, pageWidth - M, y - 10);

    if (doc.__logoDataUrl) {
      doc.addImage(
        doc.__logoDataUrl,
        "PNG",
        M,
        y - 2,
        96,
        28,
        undefined,
        "FAST"
      );
    }

    doc.setFont(font, "bold");
    doc.setFontSize(20);
    doc.text("Purchase Order", pageWidth / 2, y + 10, { align: "center" });

    doc.setFontSize(10);
    const rLabelX = pageWidth - M - 110;
    const rValueX = pageWidth - M;
    [
      ["PO No", String(poId || "")],
      [
        "Date",
        poData?.date
          ? format(new Date(poData.date), "dd.MM.yyyy")
          : format(new Date(), "dd.MM.yyyy"),
      ],
    ].forEach(([k, v], i) => {
      const yy = y + i * lh;
      doc.text(k + " :", rLabelX - 20, yy);
      doc.setFont(font, "normal");
      doc.text(v, rValueX, yy, { align: "right" });
      doc.setFont(font, "bold");
    });

    y += GAP_AFTER_TITLE + 24;
    doc.setDrawColor(180);
    doc.line(M, y, pageWidth - M, y);
    y += 12;

    // ───────────────── Invoice/Consignee ─────────────────
    const colW = Math.floor((usable - GAP_BETWEEN_COLS) / 2);

    const invoiceTo = [
      "Dronix Technologies Private Limited",
      "No.7, KRU Building, 3rd Floor, Welders Street, Mount Road, Chennai.",
      "E-mail : finance@aero360.co.in",
      "GSTIN/UIN : 33AACGDI081K1ZS",
      "State Name : Tamil Nadu, Code : 33",
    ];
    const consignee = [
      "Dronix Technologies Private Limited",
      "133, Gandhi Rd, Alappakam, New Perungalathur, Chennai,",
      "Sadhaangathapuram, Tamil Nadu 600063",
      "Phone: 099624 58751",
      "Email: finance@aero360.co.in",
    ];

    doc.setFont(font, "bold");
    doc.text("Invoice To", M, y);
    doc.text("Consignee (Ship to)", M + colW + GAP_BETWEEN_COLS, y);
    y += 10;

    doc.setFont(font, "normal");
    const leftLines = invoiceTo.flatMap((t) => doc.splitTextToSize(t, colW));
    const rightLines = consignee.flatMap((t) => doc.splitTextToSize(t, colW));

    let leftY = y;
    leftLines.forEach((t) => {
      doc.text(t, M, leftY);
      leftY += lh;
    });

    let rightY = y;
    rightLines.forEach((t) => {
      doc.text(t, M + colW + GAP_BETWEEN_COLS, rightY);
      rightY += lh;
    });

    y = Math.max(leftY, rightY) + GAP_BELOW_COLS;

    doc.setDrawColor(210);
    doc.line(M, y - SECTION_DIVIDER_H, pageWidth - M, y - SECTION_DIVIDER_H);

    // ───────────────── Supplier + Meta ─────────────────
    const leftW = Math.floor(usable * 0.55);
    const rightW = usable - leftW;

    doc.setFont(font, "bold");
    doc.text("Supplier  (Bill form)", M, y);
    y += 12;

    doc.setFont(font, "normal");
    const supplierLines = [
      poData?.cart_details?.vendor_name || vendorName || "",
      poData?.cart_details?.vendor_address || vendorLocation || "",
      `GSTIN/UIN : ${poData?.cart_details?.gstn || vendor_gstn || ""}`,
      `State Name : ${poData?.cart_details?.state_name || ""}, Code : ${
        poData?.cart_details?.state_code || ""
      }`,
    ].filter(Boolean);

    const supWrapped = supplierLines.flatMap((t) =>
      doc.splitTextToSize(String(t), leftW)
    );
    let supY = y;
    supWrapped.forEach((t) => {
      doc.text(t, M, supY);
      supY += lh;
    });

    const r2LabelX = M + leftW + 12;
    const r2ColonX = r2LabelX + 90;
    const r2ValueX = r2ColonX + 8;

    // ✅ values now come from extraFields
    const metaRows = [
      ["Ref Date", refDate ? format(new Date(refDate), "dd.MM.yyyy") : ""],
      ["Quotation No", quotationNo || ""],
      ["Payment terms", paymentTerms || ""],
      ["Mode of delivery", deliveryMode || ""],
      ["Contact Person", String(vendorPOC?.name || "")],
      ["Contact Details", String(vendorPOC?.phone || vendorPOC?.email || "")],
    ];

    let metaY = y - 12;
    metaRows.forEach(([label, value]) => {
      const wrapped = doc.splitTextToSize(value, rightW - 120);
      const h = Math.max(lh, wrapped.length * lh);
      doc.setFont(font, "bold");
      doc.text(label, r2LabelX, metaY + lh);
      doc.setFont(font, "normal");
      doc.text(":", r2ColonX, metaY + lh);
      doc.text(wrapped, r2ValueX, metaY + lh);
      metaY += h;
    });

    y = Math.max(supY, metaY) + BLOCK_GAP;

    // ───────────────── Order details ─────────────────
    const boxPad = 8;
    const innerX = M + boxPad;
    const innerW = usable - boxPad * 2;

    const boxTitleY = y + 18;
    const boxStartY = y;

    doc.setFont(font, "bold");
    doc.text("Order details", innerX, boxTitleY - 6);

    // compute rows + totals
    let baseTotal = 0;
    let gstTotal = 0;
    const bodyRows = poDetails.map((po, i) => {
      const spec = po?.cart_details?.component_specification || "";
      const uom = po?.cart_details?.unit_of_measurement || "";
      const qty = Number(po?.cart_details?.quantity || 0);
      const unit = Number(po?.cart_details?.unit_price || 0);
      const gstP = Number(po?.cart_details?.GST || 0);
      const base = unit * qty;
      const gst = (base * gstP) / 100;
      const total = base + gst;
      baseTotal += base;
      gstTotal += gst;
      return [i + 1, spec, uom, qty, INR(unit), `${gstP}%`, INR(total)];
    });

    const raw = { c0: 36, c1: 200, c2: 46, c3: 56, c4: 86, c5: 40, c6: 67 };
    const sumW = Object.values(raw).reduce((a, b) => a + b, 0);
    const scale = innerW / sumW;
    const w = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, Math.floor(v * scale)])
    );

    autoTable(doc, {
      startY: boxTitleY + 6,
      head: [
        [
          "S.no",
          "Description",
          "UOM",
          "Quantity",
          "Unit Price",
          "GST",
          "Total Cost",
        ],
      ],
      body: bodyRows,
      theme: "grid",
      margin: { left: innerX, right: innerX },
      tableWidth: innerW,
      styles: {
        font,
        fontSize: 10,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
        lineColor: [210, 210, 210],
        valign: "middle",
      },
      headStyles: {
        font,
        fontStyle: "bold",
        fillColor: [255, 153, 0],
        textColor: 255,
        halign: "center",
      },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        0: { halign: "center", cellWidth: w.c0 },
        1: { cellWidth: w.c1 },
        2: { halign: "center", cellWidth: w.c2 },
        3: { halign: "right", cellWidth: w.c3 },
        4: { halign: "right", cellWidth: w.c4 },
        5: { halign: "center", cellWidth: w.c5 },
        6: { halign: "right", cellWidth: w.c6 },
      },
    });

    let lastY = doc.lastAutoTable.finalY;

    // ✅ shipping comes from popup
    const shipping = Number(shippingCharges || 0);

    const totals = [
      ["Total Base Price", INR(baseTotal)],
      ["Total GST%", INR(gstTotal)],
      ["Shipping Charges", INR(shipping)],
      ["Grand Total(Base+GST)", INR(baseTotal + gstTotal + shipping)],
    ];

    const totalsLabelW = 260;
    const totalsValueW = 120;
    const totalsW = totalsLabelW + totalsValueW;

    autoTable(doc, {
      startY: lastY + 8,
      theme: "plain",
      body: totals,
      margin: { left: innerX + innerW - totalsW, right: innerX },
      styles: {
        font,
        fontSize: 10,
        cellPadding: { top: 6, right: 6, bottom: 6, left: 6 },
      },
      columnStyles: {
        0: { cellWidth: totalsLabelW, halign: "right", fontStyle: "bold" },
        1: { cellWidth: totalsValueW, halign: "right", fontStyle: "bold" },
      },
      didDrawCell: (d) => {
        if (d.section === "body" && d.column.index === 1) {
          doc.setDrawColor(230);
          doc.line(
            d.cell.x - totalsLabelW,
            d.cell.y + d.cell.height,
            d.cell.x + d.cell.width,
            d.cell.y + d.cell.height
          );
        }
      },
    });

    lastY = doc.lastAutoTable.finalY;
    const boxEndY = lastY + 8;

    doc.setDrawColor(120);
    doc.setLineWidth(0.7);
    doc.roundedRect(M, boxStartY, usable, boxEndY - boxStartY, 6, 6);

    // ───────────────── Remarks ─────────────────
    doc.setFont(font, "bold");
    doc.text("Remarks", M, boxEndY + 20);
    doc.setFont(font, "normal");

    const remarksTop = boxEndY + 28;
    const remarksH = 96;
    doc.setDrawColor(170);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(M, remarksTop, usable * 0.62, remarksH, 6, 6, "FD");

    const remarksText = remarks || "No remarks"; // ✅ popup value
    let ry = remarksTop + 18;
    doc.text(doc.splitTextToSize(remarksText, usable * 0.62 - 24), M + 12, ry);

    // ───────────────── Signature + footer ─────────────────
    const sigY = remarksTop + remarksH + 54;
    doc.setFont(font, "bold");
    doc.text("Authorized Signature", pageWidth - M - 160, sigY, {
      align: "left",
    });
    doc.setFont(font, "normal");
    doc.setFontSize(9);
    doc.text(
      poData?.cart_details?.company_name ||
        "For Dronix Technologies Private Limited",
      pageWidth - M - 160,
      sigY + 12
    );

    doc.setDrawColor(40);
    doc.setFontSize(8);
    doc.line(M, pageHeight - 18, pageWidth - M, pageHeight - 18);
    doc.text(
      "This is a Computer Generated Document",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    doc.save(`PO_${poId}.pdf`);
  };

  const handleSendEmail = async () => {
    try {
      const pdfBlob = generatePDF();
      const pdfFileName = `PO_${poId}.pdf`;

      const recipientList = formData.recipient.split(",").map((s) => s.trim());
      const ccList = formData.cc.split(",").map((s) => s.trim());
      const bccList = formData.bcc.split(",").map((s) => s.trim());

      const formDataUpload = new FormData();
      formDataUpload.append(
        "file",
        new File([pdfBlob], pdfFileName, { type: "application/pdf" })
      );

      const uploadResponse = await fetch(
        `${config.apiBaseURL}/file_upload_view/`,
        {
          method: "POST",
          body: formDataUpload,
        }
      );

      if (!uploadResponse.ok) {
        const err = await uploadResponse.json();
        showErrorToast(`File upload failed: ${err.error}`);
        return;
      }

      const emailPayload = new FormData();
      emailPayload.append("recipient", JSON.stringify(recipientList));
      emailPayload.append("cc", JSON.stringify(ccList));
      emailPayload.append("bcc", JSON.stringify(bccList));
      emailPayload.append(
        "subject",
        formData.subject || `Order Details for PO ID: ${poId}`
      );
      emailPayload.append("sender_title", `Order Details for PO ID: ${poId}`);
      emailPayload.append(
        "body",
        formData.body || `Please find attached the PO ID: ${poId}`
      );
      emailPayload.append(
        "filename",
        new File([pdfBlob], pdfFileName, { type: "application/pdf" })
      );

      const sendResponse = await fetch(`${config.apiBaseURL}/send-email/`, {
        method: "POST",
        body: emailPayload,
      });

      if (sendResponse.ok) {
        const emailData = await sendResponse.json();
        showSuccessToast(`Email sent successfully: ${emailData.message}`);
        setShowModal(false);
      } else {
        const emailError = await sendResponse.json();
        showErrorToast(`Failed to send email: ${emailError.error}`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      showErrorToast(
        "An error occurred while uploading the file or sending the email."
      );
    }
  };

  const fetchOrderedItems = async (poId) => {
    try {
      const response = await axios.get(
        `${config.apiBaseURL}/po_delivery/?po_id=${poId}`
      );
      if (Array.isArray(response.data)) {
        setOrderedItems(response.data);
      } else {
        console.warn(
          "Ordered items API did not return an array:",
          response.data
        );
        setOrderedItems([]);
      }
    } catch (error) {
      console.error("Error fetching ordered items:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!placeOrderDateTime) {
      showInfoToast("Please select a date and time.");
      return;
    }

    const localDateTime = new Date(
      placeOrderDateTime.getTime() -
        placeOrderDateTime.getTimezoneOffset() * 60000
    ).toISOString();

    try {
      const uniquePoMasterIds = [...new Set(poDetails.map((po) => po.id))];

      // 1. Post po_delivery entries
      for (const po of poDetails) {
        const item = po.cart_details;
        const orderDate = new Date(placeOrderDateTime); // convert to Date object if not already

        const payload = {
          po_master: po.id,
          component_id: item.component_id,
          specification: item.component_specification,
          quantity: item.quantity,
          order_placed_date_time: orderDate.toISOString(), // no timezone offset
        };

        const response = await fetch(`${config.apiBaseURL}/po_delivery/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          showErrorToast(`Failed to place order: ${JSON.stringify(error)}`);
          return;
        }
      }

      // 2. Patch each po_master
      for (const poMasterId of uniquePoMasterIds) {
        const patchResponse = await fetch(
          `${config.apiBaseURL}/po_master/${poMasterId}/`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "Ordered",
              inward_status: false,
            }),
          }
        );

        if (!patchResponse.ok) {
          const error = await patchResponse.json();
          showErrorToast(
            `Failed to update PO Master ${poMasterId}: ${JSON.stringify(error)}`
          );
          return;
        }
      }

      showSuccessToast("All order items placed successfully!");
      setShowPlaceOrderPopup(false);
      setPlaceOrderDateTime("");
      setOrderPlaced(true); //  use this to hide buttons

      // 3. Fetch ordered components using the first po_master ID
      const currentPoId = uniquePoMasterIds[0]; // pick the first one
      const fetchOrdered = await fetch(
        `${config.apiBaseURL}/po_delivery/?po_id=${poId}` // again use poId
      );

      const orderedData = await fetchOrdered.json();
      setOrderedItems(orderedData);
      setShowOrderedTable(true); //  show the new table

      // 4. Re-fetch updated poData to hide Place/Send Email buttons
      const fetchPoMaster = await fetch(
        `${config.apiBaseURL}/po_master/${currentPoId}/`
      );
      const updatedPoData = await fetchPoMaster.json();
      setPOData(updatedPoData);
    } catch (error) {
      console.error("Error placing order:", error);
      showErrorToast("Error while placing order.");
    }
  };

  const saveDeliveryUpdate = async (index, field, value) => {
    const item = orderedItems[index];
    const updatedItem = { ...item, [field]: value };

    if (field === "shipping_qty") {
      updatedItem.received_qty = Number(value);
    }

    let payload = {};

    // SHIPMENT case
    const hasShippedDate = field === "shipping_date" || item.shipping_date;
    const hasShippedQty =
      field === "shipping_qty" || item.shipping_qty || item.shipped_quantity;

    if (hasShippedDate && hasShippedQty) {
      const shippedQty = Number(
        field === "shipping_qty"
          ? value
          : updatedItem.shipping_qty || item.shipped_quantity
      );
      const shippedDate =
        field === "shipping_date"
          ? value
          : updatedItem.shipping_date || item.shipped_date;

      if (shippedQty > item.quantity) {
        showWarningToast(
          `Shipped quantity cannot exceed ordered quantity (${item.quantity})`
        );
        return;
      }

      const pendingQty = item.quantity - shippedQty;

      payload = {
        shipped_quantity: shippedQty,
        shipped_date: shippedDate,
        pending_quantity: pendingQty,
        received_quantity: shippedQty, //  force received = shipped
      };
    }

    // RECEIVED case (if applicable)
    const hasReceivedDate = field === "received_date" || item.received_date;
    const hasReceivedQty =
      field === "received_qty" || item.received_qty || item.received_quantity;

    if (hasReceivedDate && hasReceivedQty) {
      const receivedQty = Number(
        field === "received_qty"
          ? value
          : updatedItem.received_qty || item.received_quantity
      );
      const receivedDate =
        field === "received_date"
          ? value
          : updatedItem.received_date || item.received_date;

      payload = {
        ...payload,
        received_quantity: receivedQty,
        received_date: receivedDate,
      };
    }

    // Save if there’s something valid to send
    if (Object.keys(payload).length > 0) {
      try {
        const response = await fetch(
          `${config.apiBaseURL}/po_delivery/${item.id}/`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          const updatedData = await response.json();
          const newItems = [...orderedItems];
          newItems[index] = updatedData;
          setOrderedItems(newItems);
          showSuccessToast("Delivery data saved.");
        } else {
          showErrorToast("Failed to save delivery data.");
        }
      } catch (error) {
        console.error("Save error", error);
        showErrorToast("Error saving delivery data.");
      }
    }
  };

  const handleInward = async (item) => {
    // If po_master is just an ID, use it directly
    let poMasterId =
      typeof item.po_master === "object" ? item.po_master?.id : item.po_master;

    if (!poMasterId) {
      showErrorToast("PO Master ID missing. Please refresh.");
      return;
    }

    let cart = item?.po_master?.cart_details;

    // If cart details not available, fetch full PO Master
    if (!cart || !cart.component_id) {
      try {
        console.log(" Fetching PO Master with ID:", poMasterId);

        const resp = await fetch(
          `${config.apiBaseURL}/po_master/${poMasterId}/`
        );
        if (!resp.ok) throw new Error("Network response was not OK");

        const updated = await resp.json();
        item.po_master = updated;
        cart = updated.cart_details;
      } catch (e) {
        console.error("Failed to fetch PO Master:", e);
        showErrorToast("Failed to fetch complete PO details.");
        return;
      }
    }

    const receivedQty = parseInt(item.received_quantity);

    if (!receivedQty || receivedQty <= 0) {
      showWarningToast("Received quantity must be greater than 0");
      return;
    }

    try {
      for (let i = 0; i < receivedQty; i++) {
        const payload = {
          component_id: cart.component_id,
          component_type: cart.component_type,
          component_specification: cart.component_specification,
          category: cart.category,
          unit_of_measurement: cart.unit_of_measurement,
          vendor_id: cart.vendor_id,
          vendor_name: cart.vendor_name,
          po_master_id: poMasterId,
          price: cart.unit_price,
          gst: cart.GST,
          unit: 1,
          quality_check: "Pending",
        };

        console.log(` Posting inward unit ${i + 1}:`, payload);

        const response = await fetch(`${config.apiBaseURL}/inward/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          showErrorToast(
            `Inward failed for unit ${i + 1}: ${JSON.stringify(error)}`
          );
          return;
        }
      }

      const patchResp = await fetch(
        `${config.apiBaseURL}/po_delivery/${item.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inward: true }),
        }
      );

      if (patchResp.ok) {
        showSuccessToast(
          "All units posted to Inward and delivery marked as Inwarded!"
        );
        fetchOrderedItems(poId); // make sure poId is in scope
      } else {
        const err = await patchResp.json();
        showWarningToast(
          "Inwarded but failed to mark delivery: " + JSON.stringify(err)
        );
      }
    } catch (err) {
      console.error("Inward Error:", err);
      showErrorToast("Error posting units to Inward.");
    }
  };

  const pendingItems = orderedItems.filter(
    (item) =>
      item.pending_quantity > 0 &&
      item.PO_id === poId &&
      item.shipped_quantity !== undefined &&
      item.shipped_quantity !== null &&
      item.shipped_date
  );

  const CustomDateInput = React.forwardRef(({ value, onClick, item }, ref) => {
    const shippingQty =
      item.shipping_qty !== undefined
        ? item.shipping_qty
        : item.shipped_quantity || 0;

    const isDisabled =
      shippingQty > item.quantity ||
      (item.shipped_date && item.shipped_quantity) ||
      isPOCancelled;

    const handleFocus = (e) => {
      if (shippingQty > item.quantity) {
        showWarningToast("Shipped quantity cannot exceed ordered quantity.");
        e.preventDefault(); // Prevent calendar open
        return;
      }

      if (!isDisabled) {
        onClick(e); // Only open if valid
      } else {
        e.preventDefault(); // Block if disabled
      }
    };

    return (
      <input
        ref={ref}
        value={value}
        onClick={handleFocus}
        readOnly
        className={`input2 ${
          isDisabled ? "datepicker-disabled" : "datepicker-enabled"
        }`}
        placeholder="dd-mm-yyyy"
      />
    );
  });

  const CustomReceivedDateInput = React.forwardRef(
    ({ value, onClick, item }, ref) => {
      const receivedQty =
        item.received_qty !== undefined
          ? item.received_qty
          : item.received_quantity || 0;

      const shippedQty =
        item.shipping_qty !== undefined
          ? item.shipping_qty
          : item.shipped_quantity || 0;

      const isDisabled =
        receivedQty > shippedQty || // Block if over-shipped
        (item.received_date && item.received_quantity) ||
        isPOCancelled; // Already saved

      const handleFocus = (e) => {
        if (shippedQty <= 0) {
          showWarningToast(
            "Cannot select Received Date before Shipping is done."
          );
          e.preventDefault();
          return;
        }

        if (!isDisabled) {
          onClick(e);
        } else {
          e.preventDefault();
        }
      };

      return (
        <input
          ref={ref}
          value={value}
          onClick={handleFocus}
          readOnly
          className={`input2 ${
            isDisabled ? "datepicker-disabled" : "datepicker-enabled"
          }`}
          placeholder="dd-mm-yyyy"
        />
      );
    }
  );

  const generatePOCSV = (poDetails, totalquantity, totalcost) => {
    const headers = [
      "S.No",
      "Component ID",
      "Category",
      "Type",
      "Specification",
      "UOM",
      "Quantity",
      "Unit Price",
      "GST",
      "Total Cost",
    ];

    const rows = poDetails.map((po, index) => [
      index + 1,
      po.cart_details.component_id || "",
      po.cart_details.category || "",
      po.cart_details.component_type || "",
      po.cart_details.component_specification || "",
      po.cart_details.unit_of_measurement || "",
      po.cart_details.quantity || "",
      `₹${parseFloat(po.cart_details.unit_price).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      `${parseFloat(po.cart_details.GST || 0).toLocaleString("en-IN")}%`,
      `₹${parseFloat(po.cart_details.total_cost).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    ]);

    // Add Totals Row
    rows.push([
      "",
      "",
      "",
      "",
      "",
      "Totals",
      totalquantity || "",
      "",
      "",
      `₹${parseFloat(totalcost).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    // BOM to support ₹ symbol in Excel
    const BOM = "\uFEFF";

    const indianTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const formattedTime = indianTime
      .replace(/:/g, "-")
      .replace(/, /g, "_")
      .toLowerCase();

    const filename = `PO_Report_${formattedTime}.csv`;

    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // only updates value while typing
  const handleQuantityChange = (index, newQty) => {
    setPODetails((prev) => {
      const updated = [...prev];
      const po = updated[index];

      const qty = Number(newQty) || 0;
      po.edited_quantity = qty; // ✅ use edited_quantity, not cart_details.quantity

      // Recalculate total cost with GST
      const unitPrice = parseFloat(po.cart_details.unit_price) || 0;
      const gstPercent = parseFloat(po.cart_details.GST) || 0;
      const base = unitPrice * qty;
      const gst = (base * gstPercent) / 100;
      po.edited_total_cost = (base + gst).toFixed(2);

      return updated;
    });
  };

  const saveQuantity = async (index) => {
    const row = poDetails[index];
    const qty = Number(row.edited_quantity);
    const cap = Number(row.original_quantity ?? 0);

    if (!Number.isFinite(qty)) {
      showErrorToast("Invalid quantity");
      return;
    }
    if (qty > cap) {
      showErrorToast(`Quantity cannot exceed original (${cap})`);
      handleQuantityChange(index, cap);
      return;
    }
    if (qty < 1) {
      showErrorToast("Quantity must be at least 1");
      handleQuantityChange(index, 1);
      return;
    }

    // ✅ Only send edited fields
    const updatedData = {
      edited_quantity: qty,
      edited_total_cost: row.edited_total_cost,
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/po_master/${row.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error("Failed to update PO item");

      const updatedItem = await response.json();

      setPODetails((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...prev[index],
          ...updatedItem,
          cart_details: {
            ...prev[index].cart_details,
            ...updatedItem.cart_details,
          },
        };
        return updated;
      });

      showSuccessToast("Quantity updated successfully");
      setEditingIndex(null);
    } catch (error) {
      console.error("Update failed:", error);
      showErrorToast("Failed to update PO item");
    }
  };

  const handleDeleteItem = async (id) => {
    showMessageToast({
      message: "Are you sure you want to delete this item?",
      onConfirm: async () => {
        try {
          const res = await fetch(`${config.apiBaseURL}/po_master/${id}/`, {
            method: "DELETE",
          });

          if (res.ok) {
            setPODetails((prev) => prev.filter((item) => item.id !== id));
            showSuccessToast("Item deleted successfully.");
          } else {
            showErrorToast("Failed to delete item.");
          }
        } catch (err) {
          console.error(err);
          showErrorToast("Error deleting item.");
        }
      },
      onCancel: () => {
        showInfoToast("Delete cancelled.");
      },
    });
  };

  return (
    <div>
      <h2>PO Details</h2>
      <button
        onClick={() => navigate("/po-list")}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px",
        }}
        title="Back to BOM List"
      >
        <img
          src={Back}
          alt="Back to BOM list "
          style={{ width: "20px", height: "20px" }}
        />
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <div className="po-header">
            <div
              className="po-details"
              style={{ display: "flex", gap: "100px", flexWrap: "wrap" }}
            >
              <h3
                style={{
                  maxWidth: "250px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  cursor: "pointer",
                }}
                title={poId} // full content on hover
              >
                PO Number: {poId}
              </h3>
              <h3
                style={{
                  maxWidth: "250px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  cursor: "pointer",
                }}
                title={vendorName}
              >
                Vendor Name: {vendorName}
              </h3>
              <h3
                style={{
                  maxWidth: "250px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  cursor: "pointer",
                }}
                title={vendor_gstn}
              >
                GSTIN: {vendor_gstn}
              </h3>
              <h3
                style={{
                  maxWidth: "250px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  cursor: "pointer",
                }}
                title={vendorLocation}
              >
                Location: {vendorLocation}
              </h3>
            </div>

            <button
              className="generate-report-btn"
              onClick={() => setPoPdfPopupOpen(true)}
            >
              Generate Report
            </button>
          </div>
          {poPdfPopupOpen && (
            <div
              className="modal-overlay"
              onClick={(e) => {
                if (e.target === e.currentTarget) setPoPdfPopupOpen(false);
              }}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ marginTop: "5px" }}>Create Purchase Order</h2>
                <div className="form-grid">
                  <label>Ref Date</label>
                  <div className="date-input-container">
                    <DatePicker
                      selected={
                        extraFields.refDate
                          ? new Date(extraFields.refDate)
                          : null
                      }
                      onChange={(date) =>
                        setExtraFields({
                          ...extraFields,
                          refDate: date ? date.toISOString().split("T")[0] : "",
                        })
                      }
                      dateFormat="dd-MM-yyyy"
                      placeholderText="dd-mm-yyyy"
                      className="input1"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                    <i className="fas fa-calendar-alt calendar-icon"></i>
                  </div>

                  <label>Quotation No</label>
                  <input
                    type="text"
                    name="quotationNo"
                    value={extraFields.quotationNo}
                    onChange={(e) =>
                      setExtraFields({
                        ...extraFields,
                        quotationNo: e.target.value,
                      })
                    }
                    placeholder="Quotation No"
                  />

                  <label>Payment Terms</label>
                  <input
                    type="text"
                    name="paymentTerms"
                    value={extraFields.paymentTerms}
                    onChange={(e) =>
                      setExtraFields({
                        ...extraFields,
                        paymentTerms: e.target.value,
                      })
                    }
                    placeholder="Payment Terms"
                  />

                  <label htmlFor="deliveryMode">Mode of Delivery</label>
                  <select
                    value={extraFields.deliveryMode}
                    onChange={(e) =>
                      setExtraFields({
                        ...extraFields,
                        deliveryMode: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Mode</option>
                    <option value="By Sea">By Sea</option>
                    <option value="By Road">By Road</option>
                    <option value="By Air">By Air</option>
                  </select>

                  <label>Shipping Charges</label>
                  <input
                    type="number"
                    name="shippingCharges"
                    value={extraFields.shippingCharges}
                    onChange={(e) =>
                      setExtraFields({
                        ...extraFields,
                        shippingCharges: e.target.value, // keep as string
                      })
                    }
                    placeholder="Shipping Charges"
                  />

                  <label>Remarks</label>
                  <textarea
                    name="remarks"
                    value={extraFields.remarks}
                    onChange={(e) =>
                      setExtraFields({
                        ...extraFields,
                        remarks: e.target.value,
                      })
                    }
                    placeholder="Remarks"
                    rows={3}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    className="generate-report-btn"
                    onClick={() => {
                      generateStyledPOPdf({
                        poId,
                        poData,
                        poDetails,
                        vendorName,
                        vendor_gstn,
                        vendorLocation,
                        vendorPOC,
                        extraFields,
                      });
                      setPoPdfPopupOpen(false);
                    }}
                  >
                    Download PDF
                  </button>
                  <button onClick={() => setPoPdfPopupOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Component ID</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Specification</th>
                  <th>UOM</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>GST</th>
                  <th>Total Cost</th>
                  {(isAdmin || isProcurement) &&
                    poData?.status !== "Approved" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {poDetails.map((po, index) => (
                  <tr key={index}>
                    <td>{po?.cart_details?.component_id || "-"}</td>
                    <td>{po?.cart_details?.category || "-"}</td>
                    <td>{po?.cart_details?.component_type || "-"}</td>
                    <td>{po?.cart_details?.component_specification || "-"}</td>
                    <td>{po?.cart_details?.unit_of_measurement || "-"}</td>

                    <td style={{ position: "relative", paddingRight: "30px" }}>
                      {isAdmin &&
                      poData?.status !== "Approved" &&
                      editingIndex === index ? (
                        <input
                          type="number"
                          value={po.edited_quantity}
                          min="1"
                          max={po.original_quantity}
                          onChange={(e) =>
                            handleQuantityChange(index, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveQuantity(index);
                          }}
                          style={{ width: "60px" }}
                          autoFocus
                        />
                      ) : (
                        po.edited_quantity
                      )}

                      {/* Only show edit icon if not approved */}
                      {isAdmin && poData?.status !== "Approved" && (
                        <span
                          style={{
                            position: "absolute",
                            right: "5px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color:
                              editingIndex === index ? "green" : "#1f1f1fff",
                            fontSize: "14px",
                          }}
                          onClick={() => {
                            if (editingIndex === index) {
                              saveQuantity(index); // validate + toast + exit
                            } else {
                              setEditingIndex(index); // enter edit mode
                            }
                          }}
                          title={
                            editingIndex === index ? "Save Qty" : "Edit Qty"
                          }
                        >
                          {editingIndex === index ? <FaCheck /> : <FaEdit />}
                        </span>
                      )}
                    </td>

                    <td>
                      ₹
                      {parseFloat(
                        po?.cart_details?.unit_price ?? 0
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {parseFloat(po?.cart_details?.GST ?? 0).toLocaleString(
                        "en-IN"
                      )}
                      %
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ₹
                      {parseFloat(po?.edited_total_cost ?? 0).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>

                    {isAdmin && poData?.status !== "Approved" && (
                      <td style={{ textAlign: "center" }}>
                        <FaTrashAlt
                          style={{ color: "red", cursor: "pointer" }}
                          title="Delete Item"
                          onClick={() => handleDeleteItem(po.id)}
                        />
                      </td>
                    )}
                  </tr>
                ))}

                {/* Totals Row */}
                <tr style={{ fontWeight: "bold" }}>
                  <td colSpan="5">Totals</td>
                  <td>{totalquantity}</td>
                  <td></td>
                  <td></td>
                  <td style={{ textAlign: "right" }}>
                    ₹
                    {parseFloat(totalcost).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
      <div style={{ marginTop: "30px" }}>
        {/* Approved → Show 3 main buttons */}
        <div className="po-actions">
          {poData?.status === "Approved" && (
            <>
              {/* <button className="email-button" onClick={handleOpenModal}>
                Send Email
              </button> */}
              <button
                className="place-order-button"
                onClick={() => {
                  setPlaceOrderDateTime(new Date());
                  setShowPlaceOrderPopup(true);
                }}
              >
                Place Order
              </button>
            </>
          )}
          {/* 
          {(poData?.status === "Approved" || poData?.status === "Ordered") && (
            <button
              className="cancel-button"
              onClick={() => updatePOMasterStatuses(poId, "Cancelled")}
            >
              Cancel Order
            </button>
          )} */}

          {(poData?.status === "Approved" || poData?.status === "Ordered") &&
            (pendingItems.length > 0 ||
              orderedItems.some((item) => !item.inward)) && (
              <button
                className="cancel-button"
                onClick={() => updatePOMasterStatuses(poId, "Cancelled")}
              >
                Cancel Order
              </button>
            )}

          {poData?.status === "Cancelled" && (
            <div className="order-cancelled-banner">
              <strong>Order Cancelled:</strong> No further actions are allowed
              on this order.
            </div>
          )}

          {poData?.status === "Rejected" && (
            <span className="rejected-label">Order Has Rejected...</span>
          )}
        </div>

        {/* Pending → Show Approve/Reject */}
        {poData?.status !== "Approved" &&
          poData?.status !== "Rejected" &&
          poData?.status !== "Ordered" &&
          poData?.status !== "Cancelled" && (
            <div className="po-actions">
              <button
                onClick={() => updatePOMasterStatuses(poId, "Approved")}
                className="approve-button"
              >
                Approve
              </button>
              <button
                onClick={() => updatePOMasterStatuses(poId, "Rejected")}
                className="reject-button"
              >
                Reject
              </button>
            </div>
          )}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="popup">
            <h3>Send Email for PO ID: {poId}</h3>
            <form style={{ marginTop: "5px" }}>
              <div
                style={{
                  padding: 5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
                className="form-row"
              >
                <label>Recipient:</label>
                <input
                  type="text"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleEmailChange}
                  placeholder="Enter multiple emails separated by commas"
                  required
                />
              </div>

              <div
                style={{
                  padding: 5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
                className="form-row"
              >
                <label>CC:</label>
                <input
                  type="text"
                  name="cc"
                  value={formData.cc}
                  onChange={handleEmailChange}
                  placeholder="Enter multiple emails separated by commas"
                />
              </div>

              <div
                style={{
                  padding: 5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
                className="form-row"
              >
                <label>BCC:</label>
                <input
                  type="text"
                  name="bcc"
                  value={formData.bcc}
                  onChange={handleEmailChange}
                  placeholder="Enter multiple emails separated by commas"
                />
              </div>

              <div
                style={{
                  padding: 5,
                  display: "flex",
                  justifyContent: "space-between",
                }}
                className="form-row"
              >
                <label>Body:</label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={handleEmailChange}
                />
              </div>

              <div className="actions-button" style={{ marginTop: "20px" }}>
                <button
                  className="edit-button"
                  type="button"
                  onClick={handleSendEmail}
                >
                  Send Email
                </button>
                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Naveen Added */}

      {showPlaceOrderPopup && (
        <div className="modal-overlay">
          <div className="popup" style={{ marginTop: "-80px" }}>
            <div className="popup-content">
              <h3>Place Order</h3>
              <label>Select Date</label>
              <div className="date-input-containers">
                <DatePicker
                  selected={placeOrderDateTime}
                  onChange={(date) => {
                    const now = new Date(); //current time
                    const combinedDateTime = new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      now.getHours(),
                      now.getMinutes(),
                      now.getSeconds()
                    );
                    setPlaceOrderDateTime(combinedDateTime);
                  }}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  minDate={new Date()}
                />

                <i className="fas fa-calendar-alt calendar-icon"></i>
              </div>

              <div className="modal-actions">
                <button className="edit-btn" onClick={handlePlaceOrder}>
                  Submit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => setShowPlaceOrderPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="po-order-wrapper">
        {/* All your existing JSX including both tables */}

        {orderedItems.length > 0 && (
          <div className="table-container">
            <h3 style={{ marginTop: "30px" }}>Ordered Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Component ID</th>
                  <th>Specification</th>
                  <th>Ordered Qty</th>
                  <th>Ordered Date</th>
                  <th>Shipping Qty</th>
                  <th>Shipping Date</th>
                  <th>Received Qty</th>
                  <th>Received Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orderedItems.map((item, index) => {
                  const isShippingSaved =
                    item.shipped_quantity && item.shipped_date;
                  const isReceivedSaved =
                    item.received_quantity && item.received_date;
                  const inwardEnabled = isReceivedSaved;
                  const isPOCancelled = poData?.status === "Cancelled";

                  return (
                    <tr key={index}>
                      <td>{item.component_id}</td>
                      <td>{item.specification}</td>
                      <td>{item.quantity}</td>
                      <td>
                        {item.order_placed_date_time &&
                          format(
                            new Date(item.order_placed_date_time),
                            "dd-MM-yyyy"
                          )}
                      </td>

                      {/* Shipping Quantity */}
                      <td>
                        <input
                          type="number"
                          name="shipping_qty"
                          value={
                            item.shipping_qty !== undefined
                              ? item.shipping_qty
                              : item.shipped_quantity !== undefined
                              ? item.shipped_quantity
                              : ""
                          }
                          className={
                            !item.quantity ||
                            !item.order_placed_date_time ||
                            isPOCancelled ||
                            isShippingSaved
                              ? "input-disabled"
                              : "input-enabled"
                          }
                          disabled={
                            !item.quantity ||
                            !item.order_placed_date_time ||
                            isShippingSaved ||
                            isPOCancelled
                          }
                          onChange={(e) => handleChange(e, index)}
                          onBlur={(e) => {
                            const { name, value } = e.target;
                            const numericValue = Number(value);

                            if (numericValue > item.quantity) {
                              showWarningToast(
                                "Shipped quantity cannot exceed ordered quantity."
                              );
                              setTimeout(() => e.target.focus(), 0);
                              return;
                            }

                            if (value) {
                              saveDeliveryUpdate(index, name, value); // only save qty here
                            }
                          }}
                        />
                      </td>

                      {/* Shipping Date */}
                      <td>
                        <div className="date-input-container">
                          <DatePicker
                            selected={
                              item.shipping_date
                                ? new Date(item.shipping_date)
                                : item.shipped_date
                                ? new Date(item.shipped_date)
                                : null
                            }
                            onChange={(date) => {
                              const now = new Date();
                              const mergedDateTime = new Date(
                                date.getFullYear(),
                                date.getMonth(),
                                date.getDate(),
                                now.getHours(),
                                now.getMinutes(),
                                now.getSeconds()
                              );
                              const isoString = mergedDateTime.toISOString();

                              // Fix: Compare only date parts
                              const orderedDateTime =
                                item.order_placed_date_time
                                  ? new Date(item.order_placed_date_time)
                                  : null;

                              if (orderedDateTime) {
                                const shippingDateOnly = new Date(
                                  date.getFullYear(),
                                  date.getMonth(),
                                  date.getDate()
                                );
                                const orderedDateOnly = new Date(
                                  orderedDateTime.getFullYear(),
                                  orderedDateTime.getMonth(),
                                  orderedDateTime.getDate()
                                );

                                if (shippingDateOnly < orderedDateOnly) {
                                  showErrorToast(
                                    "Shipping date cannot be before ordered date"
                                  );
                                  return;
                                }
                              }

                              handleChange(
                                {
                                  target: {
                                    name: "shipping_date",
                                    value: isoString,
                                  },
                                },
                                index
                              );
                              saveDeliveryUpdate(
                                index,
                                "shipping_date",
                                isoString
                              );
                            }}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="dd-mm-yyyy"
                            className="input2"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            popperPlacement="bottom"
                            portalId="datepicker-portal-target"
                            disabled={isShippingSaved || isPOCancelled}
                            customInput={<CustomDateInput item={item} />}
                            minDate={
                              item.order_placed_date_time
                                ? new Date(item.order_placed_date_time)
                                : null
                            }
                          />

                          {/* Hide the calendar icon when date is saved */}
                          {!isShippingSaved && (
                            <i className="fas fa-calendar-alt calendar-icons"></i>
                          )}
                        </div>
                      </td>

                      {/* Received Quantity */}
                      <td>
                        <input
                          type="number"
                          name="received_qty"
                          value={
                            item.received_qty !== undefined
                              ? item.received_qty
                              : item.received_quantity !== undefined
                              ? item.received_quantity
                              : item.shipping_qty !== undefined
                              ? item.shipping_qty
                              : item.shipped_quantity || 0
                          }
                          className="input-disabled"
                          disabled
                          readOnly
                        />
                      </td>

                      {/* Received Date */}
                      <td>
                        <div className="date-input-container">
                          <DatePicker
                            selected={
                              item.received_date
                                ? new Date(item.received_date)
                                : null
                            }
                            onChange={(date) => {
                              const now = new Date();
                              const mergedDateTime = new Date(
                                date.getFullYear(),
                                date.getMonth(),
                                date.getDate(),
                                now.getHours(),
                                now.getMinutes(),
                                now.getSeconds()
                              );

                              const isoString = mergedDateTime.toISOString();

                              // Compare with shipping date (if exists)
                              const shippingDate =
                                item.shipping_date || item.shipped_date;
                              if (
                                shippingDate &&
                                new Date(mergedDateTime) <
                                  new Date(shippingDate)
                              ) {
                                showWarningToast(
                                  "Received date must be after shipping date."
                                );
                                return; // prevent saving
                              }

                              //Save only if valid
                              handleChange(
                                {
                                  target: {
                                    name: "received_date",
                                    value: isoString,
                                  },
                                },
                                index
                              );
                              saveDeliveryUpdate(
                                index,
                                "received_date",
                                isoString
                              );
                            }}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="dd-mm-yyyy"
                            className="input2"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            popperPlacement="bottom"
                            portalId="datepicker-portal-target"
                            disabled={
                              isReceivedSaved ||
                              !isShippingSaved ||
                              isPOCancelled
                            }
                            customInput={
                              <CustomReceivedDateInput item={item} />
                            }
                            minDate={
                              item.shipping_date || item.shipped_date
                                ? new Date(
                                    item.shipping_date || item.shipped_date
                                  )
                                : null
                            }
                          />

                          {/*Hide icon if date is finalized */}
                          {!isReceivedSaved && (
                            <i className="fas fa-calendar-alt calendar-icons"></i>
                          )}
                        </div>
                      </td>

                      {/* Inward Button */}
                      <td>
                        <button
                          onClick={() => handleInward(item)}
                          disabled={
                            item.inward ||
                            !item.received_date ||
                            !item.received_quantity ||
                            item.received_quantity <= 0 ||
                            isPOCancelled
                          }
                          className={`edit-btn ${
                            item.inward ||
                            !item.received_date ||
                            !item.received_quantity ||
                            isPOCancelled ||
                            item.received_quantity <= 0
                              ? "disabled-btn"
                              : ""
                          }`}
                        >
                          {item.inward ? "Inwarded" : "Inward"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pendingItems.length > 0 && (
          <div className="table-container" style={{ marginTop: "40px" }}>
            <h3>Pending Items for PO</h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
                border: "1px solid #ddd",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#fff7e6" }}>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Component ID
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Specification
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Remaining Qty
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Shipped Qty
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingItems.map((item, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {item.component_id}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {item.specification}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {item.pending_quantity}
                    </td>
                    <td
                      style={{
                        border: "1px solid #ddd",
                        padding: "8px",
                        cursor: isPOCancelled ? "not-allowed" : "pointer",
                        color: isPOCancelled ? "gray" : "blue",
                        textDecoration: isPOCancelled ? "none" : "underline",
                        opacity: isPOCancelled ? 0.6 : 1,
                      }}
                      onClick={() => {
                        if (isPOCancelled) return; // 🚫 Prevent action if cancelled

                        setSelectedPendingItem((prev) => ({
                          ...item,
                          po_master:
                            typeof item.po_master === "object"
                              ? item.po_master
                              : { id: item.po_master },
                        }));
                        setShippedInput({
                          quantity: "",
                          date: "", // fresh input
                        });
                        setShowShippedPopup(true);
                      }}
                    >
                      {item.pending_quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showShippedPopup && (
        <div className="modal-overlay">
          <div className="popup">
            <div className="popup-content">
              <h3>Update Shipped Quantity</h3>

              <label>
                Quantity:
                <input
                  type="number"
                  min="1"
                  max={selectedPendingItem?.pending_quantity}
                  value={shippedInput.quantity}
                  onChange={(e) =>
                    setShippedInput({
                      ...shippedInput,
                      quantity: e.target.value,
                    })
                  }
                  style={{ marginTop: "5px" }}
                />
              </label>

              <br />

              <label>
                Shipping Date:
                <div className="date-input-container">
                  <DatePicker
                    selected={
                      shippedInput.date ? new Date(shippedInput.date) : null
                    }
                    onChange={(date) => {
                      if (!date) return;

                      const now = new Date();
                      const mergedDateTime = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        now.getHours(),
                        now.getMinutes(),
                        now.getSeconds()
                      );

                      setShippedInput({
                        ...shippedInput,
                        date: mergedDateTime.toISOString(), // Store full datetime
                      });
                    }}
                    placeholderText="dd-mm-yyyy"
                    dateFormat="dd-MM-yyyy"
                    className="input3"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                  <i
                    className="fas fa-calendar-alt calendar-icon"
                    style={{ marginTop: "2px" }}
                  ></i>
                </div>
              </label>

              <div style={{ marginTop: "20px" }} className="modal-actions">
                <button
                  onClick={async () => {
                    const enteredQty = Number(shippedInput.quantity);
                    const pendingQty = selectedPendingItem.pending_quantity;

                    if (!enteredQty || !shippedInput.date) {
                      showWarningToast("Both fields are required.");
                      return;
                    }

                    if (enteredQty > pendingQty) {
                      showWarningToast(
                        `Entered quantity (${enteredQty}) exceeds remaining quantity (${pendingQty})`
                      );
                      return;
                    }

                    const remainingQty = pendingQty - enteredQty;

                    try {
                      // Always PATCH to reduce the pending quantity
                      const patchPayload = {
                        pending_quantity: remainingQty,
                      };

                      const patchResp = await fetch(
                        `${config.apiBaseURL}/po_delivery/${selectedPendingItem.id}/`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(patchPayload),
                        }
                      );

                      if (!patchResp.ok) {
                        const err = await patchResp.json();
                        showErrorToast(
                          "Failed to patch: " + JSON.stringify(err)
                        );
                        return;
                      }

                      // Always POST a new row for the shipped quantity
                      const postPayload = {
                        component_id: selectedPendingItem.component_id,
                        specification: selectedPendingItem.specification,
                        quantity: enteredQty,
                        shipped_quantity: enteredQty,
                        received_quantity: enteredQty,
                        shipped_date: shippedInput.date,
                        po_master: selectedPendingItem.po_master.id, // always the ID
                        order_placed_date_time:
                          selectedPendingItem.order_placed_date_time,
                        status: "Shipped",
                      };

                      const postResp = await fetch(
                        `${config.apiBaseURL}/po_delivery/`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(postPayload),
                        }
                      );

                      if (!postResp.ok) {
                        const err = await postResp.json();
                        showErrorToast(
                          "Failed to post shipped quantity: " +
                            JSON.stringify(err)
                        );
                        return;
                      }

                      showSuccessToast(
                        "Shipped quantity updated successfully."
                      );
                      setShowShippedPopup(false);
                      setSelectedPendingItem(null);
                      fetchOrderedItems(poId); // refresh updated list
                    } catch (err) {
                      console.error(err);
                      showErrorToast("Network error occurred.");
                    }
                  }}
                  className="edit-btn"
                >
                  Save
                </button>

                <button
                  onClick={() => setShowShippedPopup(false)}
                  className="delete-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainerComponent />
    </div>
  );
};

export default POOrderMaster;
