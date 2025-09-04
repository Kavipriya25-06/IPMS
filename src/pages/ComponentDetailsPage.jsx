import React, { useState, useEffect, useRef } from "react";
import config from "../Config";
import "../App.css";
import { useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useAuth } from "../AuthContext";
import Add from "../assets/Add.png";

import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  ToastContainerComponent,
} from "./Toastify.jsx";
import emptyFile from "../assets/emptyfile.svg"; // adjust path as needed
import { FaEdit } from "react-icons/fa";

/** Fallback POST helper for price create — tries multiple likely endpoints */
const postPriceRow = async (baseURL, payload) => {
  const candidates = [
    `${baseURL}/price_tables/`,
    `${baseURL}/price_tables/create/`,
    `${baseURL}/price_table/`,
    `${baseURL}/price-table/`,
  ];

  for (const url of candidates) {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (resp.ok) return await resp.json();
    if (resp.status !== 404) {
      const text = await resp.text();
      throw new Error(`POST ${url} failed: ${resp.status} ${text}`);
    }
  }

  throw new Error(
    "No working price create endpoint found (404 on all tried URLs). Check Django urls.py/router."
  );
};

const ComponentDetailsPage = () => {
  const [mainImage, setMainImage] = useState("/placeholder.jpg");
  const [imageList, setImageList] = useState([]);
  const [lensVisible, setLensVisible] = useState(false);
  const [zoomResultStyle, setZoomResultStyle] = useState({});
  const imgRef = useRef();
  const { componentId } = useParams();

  const [vendorDetails, setVendorDetails] = useState([]);
  const [priceDataMap, setPriceDataMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  // Add-row UI state (vendors)
  const [showAddRow, setShowAddRow] = useState(false);
  const [vendorOptions, setVendorOptions] = useState([]); // [{id, name}]
  const [newRow, setNewRow] = useState({
    vendor_id: "",
    vendor_name: "",
    price: "",
    tax: "",
    delivery_days: "",
  });
  const [savingNewRow, setSavingNewRow] = useState(false);
  const firstVendor = vendorDetails[0]; // used to copy component fields

  // NEW: image upload state
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(
    firstVendor?.product_description || ""
  );

  const { user } = useAuth();

  const allowedRoles = ["Admin", "Sub-Admin", "Inventory", "Procurement"];
  const canEdit = allowedRoles.includes(user?.role);
  const [componentInfo, setComponentInfo] = useState(null);

  const allowedRolesPlus = ["Admin", "Sub-Admin", "Procurement"];
  const canEditPlus = allowedRolesPlus.includes(user?.role);
  const isPlaceholder = (src) => {
    if (!src) return true;
    const s = String(src).toLowerCase();
    return (
      s.includes("emptyfile.svg") ||
      s.includes("/placeholder.jpg") ||
      s.includes("placeholder.jpg") ||
      s === "null"
    );
  };

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    if (isPlaceholder(mainImage)) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = 4;
    const cy = 4;
    const backgroundX = (x / rect.width) * 100;
    const backgroundY = (y / rect.height) * 100;

    setZoomResultStyle({
      position: "absolute",
      left: `${rect.right + 20}px`,
      top: `10px`,
      width: `400px`,
      height: `350px`,
      backgroundImage: `url(${mainImage})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${rect.width * cx}px ${rect.height * cy}px`,
      backgroundPosition: `${backgroundX}% ${backgroundY}%`,
      // border: "1px solid rgba(0, 0, 0, 0.2)`,
      // boxShadow: "0 0 8px rgba(0, 0, 0, 0.3)`,
      pointerEvents: "none",
      zIndex: 9999,
    });
  };

  useEffect(() => {
    if (!componentId) {
      showErrorToast("Invalid component ID");
      setNoData(true);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setNoData(false);

        // ✅ Vendors
        const res = await fetch(
          `${config.apiBaseURL}/vendor_master/?component_id=${componentId}`
        );
        if (!res.ok) throw new Error("Failed to fetch vendor detail");
        const data = await res.json();
        const matching = data.filter(
          (item) => item.component_id === componentId
        );
        setVendorDetails(matching);

        // ✅ Prices
        const priceRes = await fetch(
          `${config.apiBaseURL}/price_tables/?component_id=${componentId}`
        );
        const priceJson = await priceRes.json();
        const map = {};
        matching.forEach((comp) => {
          const prices = priceJson.filter(
            (entry) => entry.product === comp.product_id
          );
          if (prices.length > 0) {
            map[comp.product_id] = prices.sort(
              (a, b) => new Date(b.current_time) - new Date(a.current_time)
            )[0];
          }
        });
        setPriceDataMap(map);

        // ✅ Images
        const imageRes = await fetch(
          `${config.apiBaseURL}/component_images/by-component/${componentId}/`
        );
        const imageData = await imageRes.json();
        const images =
          Array.isArray(imageData) && imageData.length > 0
            ? imageData.map((img) =>
                String(img.image).startsWith("http")
                  ? img.image
                  : `${config.apiBaseURL}${img.image}`
              )
            : ["/placeholder.jpg"];
        setImageList(images);
        setMainImage(images[0]);

        // ✅ Request component (for category, spec, uom, etc.)
        const compRes = await fetch(`${config.apiBaseURL}/request_component/`);
        if (compRes.ok) {
          const compData = await compRes.json();
          if (Array.isArray(compData)) {
            const match = compData.find(
              (item) => item.component_id === componentId
            );
            if (match) {
              setComponentInfo(match); // this has "id", "category", "uom", etc.
            } else {
              console.warn("No request_component found for:", componentId);
              setComponentInfo(null);
            }
          }
        } else {
          console.error("Failed to fetch request_component list");
        }
      } catch (err) {
        console.error("Error fetching component detail:", err);
        showErrorToast("Failed to load component details");
        setNoData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [componentId]);

  // Vendor dropdown from vendor_list
  useEffect(() => {
    const loadVendorOptions = async () => {
      try {
        const r = await fetch(`${config.apiBaseURL}/vendor_list/`);
        if (!r.ok) throw new Error("Failed to fetch vendor_list");
        const data = await r.json();

        // Normalize to [{id, name}]
        const options = (Array.isArray(data) ? data : []).map((v, idx) => {
          if (typeof v === "string") return { id: v, name: v };
          return {
            id:
              v.id ??
              v.vendor_id ??
              v.pk ??
              v.uuid ??
              (v.vendor_name || v.name || v.company_name || `row-${idx}`),
            name:
              v.vendor_name ?? v.name ?? v.company_name ?? String(v.id ?? ""),
          };
        });
        setVendorOptions(options.filter((o) => o.name));
      } catch (e) {
        const names = Array.from(
          new Set(vendorDetails.map((v) => v.vendor_name).filter(Boolean))
        ).map((name) => ({ id: name, name }));
        setVendorOptions(names);
      }
    };
    loadVendorOptions();
  }, [vendorDetails]);

  const refreshVendorsAndPrices = async () => {
    const res = await fetch(
      `${config.apiBaseURL}/vendor_master/?component_id=${componentId}`
    );
    const data = await res.json();
    const matching = data.filter((item) => item.component_id === componentId);
    setVendorDetails(matching);

    const priceRes = await fetch(
      `${config.apiBaseURL}/price_tables/?component_id=${componentId}`
    );
    const priceJson = await priceRes.json();
    const map = {};
    matching.forEach((comp) => {
      const prices = priceJson.filter(
        (entry) => entry.product === comp.product_id
      );
      if (prices.length > 0) {
        map[comp.product_id] = prices.sort(
          (a, b) => new Date(b.current_time) - new Date(a.current_time)
        )[0];
      }
    });
    setPriceDataMap(map);
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <div className="spinner"></div>
        Loading Component Details...
      </div>
    );

  if (noData) return <p>No information available for this component</p>;

  // Inline-add handlers (vendors)
  const onChangeNewRow = (field, value) =>
    setNewRow((p) => ({ ...p, [field]: value }));

  const onChangeVendorSelect = (value) => {
    const opt = vendorOptions.find((o) => String(o.id) === String(value));
    setNewRow((p) => ({
      ...p,
      vendor_id: opt?.id || "",
      vendor_name: opt?.name || "",
    }));
  };

  const cancelNewRow = () => {
    setShowAddRow(false);
    setNewRow({
      vendor_id: "",
      vendor_name: "",
      price: "",
      tax: "",
      delivery_days: "",
    });
  };

  // Save: vendor_master (with required fields) -> price create (with fallback)
  const saveNewRow = async () => {
    if (!newRow.vendor_id) {
      showWarningToast("Please select a vendor");
      return;
    }
    if (newRow.price === "" || newRow.price === null) {
      showWarningToast("Please enter a price");
      return;
    }
    if (!componentInfo) {
      showErrorToast("Component details not available to create vendor");
      return;
    }
    if (vendorDetails.some((v) => v.vendor_name === newRow.vendor_name)) {
      showWarningToast("This vendor is already linked to the component");
      return;
    }

    setSavingNewRow(true);
    try {
      const vendorPayload = {
        vendor: newRow.vendor_id,
        component_id: componentId,
        product_description: componentInfo.product_description || "N/A",
        unit_of_measurement: componentInfo.uom || "", //  use request_component.uom
        category: componentInfo.category || "", //  request_component.category
        component_type: componentInfo.component_type || "",
        component_specification: componentInfo.component_specification || "",
        vendor_name: newRow.vendor_name,
        product_link: null,
        delivery_days:
          newRow.delivery_days !== "" ? Number(newRow.delivery_days) : null,
      };

      const vResp = await fetch(`${config.apiBaseURL}/vendor_master/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorPayload),
      });
      if (!vResp.ok) {
        const errorText = await vResp.text();
        console.error("vendor_master POST failed:", errorText);
        showErrorToast("Failed to add vendor (check required fields)");
        setSavingNewRow(false);
        return;
      }
      const createdVendor = await vResp.json();
      const productId = createdVendor.product_id;

      const pricePayload = {
        product: productId,
        price: Number(newRow.price),
        tax:
          newRow.tax !== "" && newRow.tax !== null ? Number(newRow.tax) : null,
        delivery_days:
          newRow.delivery_days !== "" && newRow.delivery_days !== null
            ? Number(newRow.delivery_days)
            : null,
        current_time: new Date().toISOString(),
      };

      await postPriceRow(config.apiBaseURL, pricePayload);

      showSuccessToast("Vendor & price added");
      await refreshVendorsAndPrices();
      cancelNewRow();
    } catch (e) {
      console.error(e);
      showErrorToast(
        "Failed to create price row. " + (e?.message || "Check API route.")
      );
    } finally {
      setSavingNewRow(false);
    }
  };

  const saveDescription = async () => {
    if (!firstVendor) {
      showErrorToast("No vendor available to update");
      return;
    }

    try {
      // Decide which key to send
      const payload = { product_description: editedDescription };

      const vResp = await fetch(
        `${config.apiBaseURL}/vendor_master/${
          firstVendor.id || firstVendor.product_id
        }/`,
        {
          method: "PATCH", // try PUT if PATCH fails
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!vResp.ok) {
        const errorText = await vResp.text();
        console.error("Failed to update vendor description:", errorText);
        showErrorToast("Failed to update description in vendor_master");
        return;
      }

      // ✅ Update local state for UI
      setVendorDetails((prev) =>
        prev.map((v) =>
          v.product_id === firstVendor.product_id
            ? { ...v, product_description: editedDescription }
            : v
        )
      );

      showSuccessToast("Description updated");
      setIsEditingDescription(false);
    } catch (err) {
      console.error("Save error:", err);
      showErrorToast("Failed to update description");
    }
  };

  // ========== NEW: Image Upload Handlers ==========
  const onPickImages = (e) => {
    const files = Array.from(e.target.files || []);

    const existingFiles = new Set(
      imageList.map((url) => url.split("/").pop().toLowerCase()) // saved names
    );

    const added = [];
    files.forEach((file) => {
      const uniqueKey = `${file.name.toLowerCase()}-${file.size}`;
      // check against newImages
      const alreadyInPreview = newImages.some(
        (img) =>
          img.file.name.toLowerCase() === file.name.toLowerCase() &&
          img.file.size === file.size
      );
      // check against existing saved images (by ignoring random suffixes)
      const baseName = file.name.toLowerCase().split(".")[0];
      const isAlreadySaved = Array.from(existingFiles).some(
        (saved) => saved.startsWith(baseName) // "prppellar" matches "prppellar_<RANDOM>.avif"
      );

      if (alreadyInPreview || isAlreadySaved) {
        showInfoToast(
          `"${file.name}" is already uploaded, please upload another one`
        );
        return;
      }

      added.push({
        file,
        preview: URL.createObjectURL(file),
      });
    });

    setNewImages((prev) => [...prev, ...added]);
    e.target.value = ""; // reset picker
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => {
      // cleanup object URL to avoid memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const cancelImages = () => {
    // cleanup previews
    newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setIsEditingImage(false);
    setNewImages([]);
  };

  const saveImages = async () => {
    if (!componentId) {
      showErrorToast("Invalid component ID");
      return;
    }
    if (!newImages.length) {
      showWarningToast("Please choose one or more images");
      return;
    }

    const formData = new FormData();
    newImages.forEach(({ file }) => {
      formData.append("images", file);
    });

    setUploadingImages(true);
    try {
      const response = await fetch(
        `${config.apiBaseURL}/component_images/by-component/${componentId}/`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const txt = await response.text();
        console.error("Upload failed:", txt);
        showErrorToast("Failed to upload images.");
        setUploadingImages(false);
        return;
      }

      const uploaded = await response.json();
      const toAbs = (p) =>
        String(p).startsWith("http") ? p : `${config.apiBaseURL}${p}`;
      const uploadedUrls = (Array.isArray(uploaded) ? uploaded : [])
        .map((item) => item?.image)
        .filter(Boolean)
        .map(toAbs)
        .filter((u) => !isPlaceholder(u));

      setImageList((prev) => {
        const cleanedPrev = (prev || []).filter((p) => !isPlaceholder(p));
        return [...cleanedPrev, ...uploadedUrls];
      });

      if (isPlaceholder(mainImage) && uploadedUrls.length) {
        setMainImage(uploadedUrls[0]);
      }

      newImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setNewImages([]);
      setIsEditingImage(false);
      showSuccessToast("Images uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      showErrorToast("Error uploading images.");
    } finally {
      setUploadingImages(false);
    }
  };
  const validThumbnails = Array.isArray(imageList)
    ? imageList.filter((s) => !isPlaceholder(s))
    : [];
  const showThumbnails =
    validThumbnails.length > 0 && !isPlaceholder(mainImage);
  // ================================================

  return (
    <div className="product-detail-container">
      <div className="product-row">
        <div className="product-left">
          <div className="product-images">
            <div
              className="main-image"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setLensVisible(true)}
              onMouseLeave={() => setLensVisible(false)}
            >
              <img
                ref={imgRef}
                src={
                  mainImage && mainImage !== "/placeholder.jpg"
                    ? mainImage
                    : emptyFile
                }
                alt="No Image"
                className="main-img"
              />

              {lensVisible && mainImage && mainImage !== "/placeholder.jpg" && (
                <div className="zoom-result" style={zoomResultStyle} />
              )}
            </div>

            {showThumbnails && (
              <div className="thumbnails-wrapper">
                <div className="thumbnails">
                  {validThumbnails.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Image ${index + 1}`}
                      className={mainImage === src ? "active-thumbnail" : ""}
                      onClick={() => setMainImage(src)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* NEW: Image upload controls */}
            <div className="image-upload-controls">
              {!isEditingImage ? (
                <>
                  {/* Show Add Images button only if role allowed */}
                  {canEdit && (
                    <button onClick={() => setIsEditingImage(true)}>
                      Add Images
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* File picker */}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onPickImages}
                  />

                  {/* Preview thumbnails BELOW input */}
                  {newImages.length > 0 && (
                    <div className="file-preview-list">
                      {newImages.map((img, index) => (
                        <div key={index} className="file-preview-item">
                          <img
                            src={img.preview}
                            alt="preview"
                            className="thumb"
                          />

                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeNewImage(index)}
                          ></button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="image-actions">
                    <button onClick={saveImages} disabled={uploadingImages}>
                      {uploadingImages ? "Uploading..." : "Save"}
                    </button>
                    <button onClick={cancelImages} disabled={uploadingImages}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>

            {isEditingImage && newImages.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#555" }}>
                {newImages.length} file(s) selected
              </div>
            )}
          </div>
        </div>

        <div className="product-right">
          <div className="product-header">
            <a href="/app1/components" className="back-link">
              ← Back
            </a>
          </div>

          <h2 className="product-title">
            {firstVendor?.product_description || "No Description"}
          </h2>

          <div className="highlights-container">
            <div className="highlights">
              <h3>Category:</h3>
              <p>{componentInfo?.category || firstVendor?.category|| "-"}</p>
            </div>
            <div className="highlights">
              <h3>Component Type:</h3>
              <p>{componentInfo?.component_type || firstVendor?.component_type||"-"}</p>
            </div>
            <div className="highlights">
              <h3>Specification:</h3>
              <p>{componentInfo?.component_specification || firstVendor?.component_specification|| "-"}</p>
            </div>
            <div className="highlights">
              <h3>UOM:</h3>
              <p>{firstVendor?.unit_of_measurement|| "-"}</p>
            </div>
          </div>

          <div className="description">
            <h3>Description</h3>
            {isEditingDescription ? (
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="form-input"
                    style={{ width: "90%" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    className="edit-btn"
                    onClick={saveDescription}
                    disabled={!editedDescription.trim()}
                    style={{ padding: "6px 10px" }}
                  >
                    Save
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => setIsEditingDescription(false)}
                    style={{ padding: "6px 10px" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p>{firstVendor?.product_description || "N/A"}</p>

                {canEditPlus && (
                  <FaEdit
                    onClick={() => {
                      setEditedDescription(
                        firstVendor?.product_description || ""
                      );
                      setIsEditingDescription(true);
                    }}
                    style={{
                      cursor: "pointer",
                      fontSize: "18px",
                      color: "#555",
                    }}
                    title="Edit Description"
                  />
                )}
              </div>
            )}
          </div>

          <div className="specifications">
            <h3>Product Details</h3>
            <ul>
              <li>
                <strong>Component ID:</strong>{" "}
                {componentInfo?.component_id || firstVendor?.component_id|| "-"}
              </li>
              <li>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color: firstVendor?.active ? "green" : "#d32f2f",
                    fontWeight: "bold",
                  }}
                >
                  {firstVendor?.active ? "Active" : "Inactive"}
                </span>
              </li>
            </ul>
          </div>

          {/* + button above table */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "8px 0",
            }}
          >
            <>
              {/* Show Add Images button only if role allowed */}
              {canEditPlus && (
                <button
                  className="plus-button"
                  title="Add Vendor & price"
                  onClick={() => setShowAddRow((s) => !s)}
                  style={{
                    cursor: "pointer",
                    background: "transparent",
                    border: "none",
                    padding: "4px",
                    marginBottom: "-25px",
                  }}
                >
                  {" "}
                  <img src={Add} alt="Add Vendor & price" />{" "}
                </button>
              )}
            </>
          </div>

          <div className="table-vendor-container">
            <table>
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Price</th>
                  <th>Tax%</th>
                  <th>Date</th>
                  <th>Delivery Days</th>
                  {canEditPlus && canEdit && showAddRow && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {/* Inline add row */}
                {showAddRow && (
                  <tr className="new-row">
                    <td>
                      <select
                        className="form-select"
                        value={newRow.vendor_id}
                        onChange={(e) => onChangeVendorSelect(e.target.value)}
                      >
                        <option value="">Select vendor</option>
                        {vendorOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        placeholder="Price"
                        className="form-input"
                        value={newRow.price}
                        onChange={(e) =>
                          onChangeNewRow("price", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        placeholder="Tax %"
                        className="form-input"
                        value={newRow.tax}
                        onChange={(e) => onChangeNewRow("tax", e.target.value)}
                      />
                    </td>
                    <td>—</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        placeholder="Days"
                        className="form-input"
                        value={newRow.delivery_days}
                        onChange={(e) =>
                          onChangeNewRow("delivery_days", e.target.value)
                        }
                      />
                    </td>

                    {canEditPlus && canEdit && showAddRow && (
                      <td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            className="edit-btn"
                            onClick={saveNewRow}
                            disabled={savingNewRow}
                          >
                            {savingNewRow ? "Saving..." : "Save"}
                          </button>
                          <button
                            className="delete-button"
                            onClick={cancelNewRow}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )}

                {vendorDetails.map((vendor) => (
                  <tr key={vendor.product_id}>
                    <td className="truncate-cell" title={vendor.vendor_name}>
                      {vendor.vendor_name}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ₹
                      {(() => {
                        const rawPrice =
                          priceDataMap[vendor.product_id]?.price ??
                          vendor.last_price ??
                          "-";
                        if (rawPrice === "-") return "-";

                        const str = String(rawPrice);

                        if (str.includes(".")) {
                          const [intPart, decPart] = str.split(".");
                          // If all decimals are zeros → show 2 decimals (.00)
                          if (/^0+$/.test(decPart)) {
                            return `${intPart}.00`;
                          }
                          // If decimals > 2 → keep full decimal part
                          if (decPart.length > 2) {
                            return `${intPart}.${decPart}`;
                          }
                          // If decimals ≤ 2 → normalize to 2 decimals
                          return Number(str).toFixed(2);
                        }

                        // No decimals → force .00
                        return Number(str).toFixed(2);
                      })()}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      {priceDataMap[vendor.product_id]?.tax ??
                        vendor.tax ??
                        "-"}
                      %
                    </td>
                    <td>
                      {priceDataMap[vendor.product_id]?.current_time
                        ? format(
                            parseISO(
                              priceDataMap[vendor.product_id].current_time
                            ),
                            "dd-MM-yyyy"
                          )
                        : "-"}
                    </td>
                    <td>
                      {priceDataMap[vendor.product_id]?.delivery_days ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ToastContainerComponent />
        </div>
      </div>
    </div>
  );
};

export default ComponentDetailsPage;
