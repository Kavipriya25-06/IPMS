import React, { useState, useEffect, useRef } from "react";
import config from "../Config";
import "../App.css";
import { useParams, useNavigate } from "react-router-dom";
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
import emptyFile from "../assets/emptyfile.svg";
import { FaEdit } from "react-icons/fa";
import { FaPlus, FaTimes } from "react-icons/fa";

const backendRoot = "http://127.0.0.1:8000/";

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
    "No working price create endpoint found (404 on all tried URLs). Check Django urls.py/router.",
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

  const [showAddRow, setShowAddRow] = useState(false);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [newRow, setNewRow] = useState({
    vendor_id: "",
    vendor_name: "",
    price: "",
    tax: "",
    delivery_days: "",
  });
  const [savingNewRow, setSavingNewRow] = useState(false);
  const firstVendor = vendorDetails[0];

  const [selectedComponents, setSelectedComponents] = useState({
    vendor: null,
  });

  const [vendorOpenIndex, setVendorOpenIndex] = useState(null);
  const [vendorSearches, setVendorSearches] = useState({});
  const [dropdownHeight, setDropdownHeight] = useState(0);

  const vendorDropdownRefs = useRef([]);
  const dropdownRef = useRef(null);

  const [isEditingImage, setIsEditingImage] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(
    firstVendor?.product_description || "",
  );

  const { user } = useAuth();

  const allowedRoles = ["Admin", "Sub-Admin", "Inventory", "Procurement"];
  const canEdit = allowedRoles.includes(user?.role);

  const allowedRolesPlus = ["Admin", "Sub-Admin", "Procurement"];
  const canEditPlus = allowedRolesPlus.includes(user?.role);

  const [componentInfo, setComponentInfo] = useState(null);
  const [componentList, setComponentList] = useState([]);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    component_type: "",
    component_specification: "",
    unit_of_measurement: "",
  });

  // -------- NEW: Add Vendor Modal State --------
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [savingVendorModal, setSavingVendorModal] = useState(false);
  const [vendorModalData, setVendorModalData] = useState({
    vendor_name: "",
    gstn: "",
    active: true,
    point_of_contact: "",
    email: "",
    phone_number: "",
    location: "",
    default_poc: true,
  });

  const resetVendorModal = () => {
    setVendorModalData({
      vendor_name: "",
      gstn: "",
      active: true,
      point_of_contact: "",
      email: "",
      phone_number: "",
      location: "",
      default_poc: true,
    });
  };

  const openVendorModal = () => {
    setShowVendorModal(true);
  };

  const closeVendorModal = () => {
    setShowVendorModal(false);
    resetVendorModal();
  };

  const onChangeVendorModal = (field, value) => {
    setVendorModalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const loadVendorOptions = async () => {
    try {
      const r = await fetch(`${config.apiBaseURL}/vendor_list/`);
      if (!r.ok) throw new Error("Failed to fetch vendor_list");
      const data = await r.json();

      const options = (Array.isArray(data) ? data : []).map((v, idx) => {
        if (typeof v === "string") return { id: v, name: v };

        return {
          id:
            v.id ??
            v.vendor_id ??
            v.pk ??
            v.uuid ??
            (v.vendor_name || v.name || v.company_name || `row-${idx}`),
          name: v.vendor_name ?? v.name ?? v.company_name ?? String(v.id ?? ""),
        };
      });

      setVendorOptions(options.filter((o) => o.name));
    } catch (e) {
      const names = Array.from(
        new Set(vendorDetails.map((v) => v.vendor_name).filter(Boolean)),
      ).map((name) => ({ id: name, name }));
      setVendorOptions(names);
    }
  };

  const createVendorAndSublist = async () => {
    if (!vendorModalData.vendor_name.trim()) {
      showWarningToast("Vendor name is required");
      return;
    }
    if (!vendorModalData.point_of_contact.trim()) {
      showWarningToast("Point of contact is required");
      return;
    }
    if (!vendorModalData.phone_number.trim()) {
      showWarningToast("Phone number is required");
      return;
    }
    if (!vendorModalData.location.trim()) {
      showWarningToast("Location is required");
      return;
    }

    try {
      setSavingVendorModal(true);

      const vendorPayload = {
        vendor_name: vendorModalData.vendor_name.trim(),
        gstn: vendorModalData.gstn.trim(),
        active: !!vendorModalData.active,
      };

      const vendorResp = await fetch(`${config.apiBaseURL}/vendor_list/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(vendorPayload),
      });

      if (!vendorResp.ok) {
        const txt = await vendorResp.text();
        throw new Error(`vendor_list POST failed: ${vendorResp.status} ${txt}`);
      }

      const createdVendor = await vendorResp.json();
      const createdVendorId =
        createdVendor.vendor_id ||
        createdVendor.id ||
        createdVendor.pk ||
        createdVendor.vendor;

      if (!createdVendorId) {
        throw new Error("Vendor created, but vendor_id was not returned");
      }

      const sublistPayload = {
        point_of_contact: vendorModalData.point_of_contact.trim(),
        email: vendorModalData.email.trim(),
        phone_number: vendorModalData.phone_number.trim(),
        location: vendorModalData.location.trim(),
        default_poc: !!vendorModalData.default_poc,
        vendor: createdVendorId,
      };

      const subResp = await fetch(`${config.apiBaseURL}/vendor_sub_list/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(sublistPayload),
      });

      if (!subResp.ok) {
        const txt = await subResp.text();
        throw new Error(`vendor_sublist POST failed: ${subResp.status} ${txt}`);
      }

      await loadVendorOptions();

      setSelectedComponents({
        vendor: {
          vendor_name: createdVendor.vendor_name || vendorModalData.vendor_name,
          vendor_id: createdVendorId,
        },
      });

      setNewRow((prev) => ({
        ...prev,
        vendor_id: createdVendorId,
        vendor_name: createdVendor.vendor_name || vendorModalData.vendor_name,
      }));

      showSuccessToast("Vendor added successfully");
      closeVendorModal();
      setVendorOpenIndex(null);
      setVendorSearches((prev) => ({ ...prev, 0: "" }));
    } catch (err) {
      console.error(err);
      showErrorToast(err.message || "Failed to create vendor");
    } finally {
      setSavingVendorModal(false);
    }
  };

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

        const res = await fetch(
          `${config.apiBaseURL}/vendor_master/?component_id=${componentId}`,
        );
        if (!res.ok) throw new Error("Failed to fetch vendor detail");
        const data = await res.json();
        const matching = data.filter(
          (item) => item.component_id === componentId,
        );
        setVendorDetails(matching);

        const priceRes = await fetch(
          `${config.apiBaseURL}/price_tables/?component_id=${componentId}`,
        );
        const priceJson = await priceRes.json();
        const map = {};
        matching.forEach((comp) => {
          const prices = priceJson.filter(
            (entry) => entry.product === comp.product_id,
          );
          if (prices.length > 0) {
            map[comp.product_id] = prices.sort(
              (a, b) => new Date(b.current_time) - new Date(a.current_time),
            )[0];
          }
        });
        setPriceDataMap(map);

        const imageRes = await fetch(
          `${config.apiBaseURL}/component_images/by-component/${componentId}/`,
        );
        const imageData = await imageRes.json();
        const images =
          Array.isArray(imageData) && imageData.length > 0
            ? imageData.map((img) =>
                String(img.image).startsWith("https")
                  ? img.image
                  : `${backendRoot}${img.image}`,
              )
            : ["/placeholder.jpg"];
        setImageList(images);
        setMainImage(images[0]);

        const compRes = await fetch(
          `${config.apiBaseURL}/component/${componentId}/`,
        );
        if (compRes.ok) {
          const compData = await compRes.json();
          setComponentInfo(compData);
        } else {
          setComponentInfo(null);
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

  useEffect(() => {
    loadVendorOptions();
  }, [vendorDetails]);

  const refreshVendorsAndPrices = async () => {
    const res = await fetch(
      `${config.apiBaseURL}/vendor_master/?component_id=${componentId}`,
    );
    const data = await res.json();
    const matching = data.filter((item) => item.component_id === componentId);
    setVendorDetails(matching);

    const priceRes = await fetch(
      `${config.apiBaseURL}/price_tables/?component_id=${componentId}`,
    );
    const priceJson = await priceRes.json();
    const map = {};
    matching.forEach((comp) => {
      const prices = priceJson.filter(
        (entry) => entry.product === comp.product_id,
      );
      if (prices.length > 0) {
        map[comp.product_id] = prices.sort(
          (a, b) => new Date(b.current_time) - new Date(a.current_time),
        )[0];
      }
    });
    setPriceDataMap(map);
  };

  const onChangeNewRow = (field, value) =>
    setNewRow((p) => ({ ...p, [field]: value }));

  const cancelNewRow = () => {
    setShowAddRow(false);
    setSelectedComponents({ vendor: null });
    setNewRow({
      vendor_id: "",
      vendor_name: "",
      price: "",
      tax: "",
      delivery_days: "",
    });
  };

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
        unit_of_measurement: componentInfo.unit_of_measurement || "",
        category: componentInfo.category || "",
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
        showErrorToast("Failed to add vendor to component");
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
        "Failed to create price row. " + (e?.message || "Check API route."),
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
      const payload = { product_description: editedDescription };

      const vResp = await fetch(
        `${config.apiBaseURL}/vendor_master/${
          firstVendor.id || firstVendor.product_id
        }/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!vResp.ok) {
        const errorText = await vResp.text();
        console.error("Failed to update vendor description:", errorText);
        showErrorToast("Failed to update description in vendor_master");
        return;
      }

      setVendorDetails((prev) =>
        prev.map((v) =>
          v.product_id === firstVendor.product_id
            ? { ...v, product_description: editedDescription }
            : v,
        ),
      );

      showSuccessToast("Description updated");
      setIsEditingDescription(false);
    } catch (err) {
      console.error("Save error:", err);
      showErrorToast("Failed to update description");
    }
  };

  const onPickImages = (e) => {
    const files = Array.from(e.target.files || []);

    const existingFiles = new Set(
      imageList.map((url) => url.split("/").pop().toLowerCase()),
    );

    const added = [];
    files.forEach((file) => {
      const alreadyInPreview = newImages.some(
        (img) =>
          img.file.name.toLowerCase() === file.name.toLowerCase() &&
          img.file.size === file.size,
      );

      const baseName = file.name.toLowerCase().split(".")[0];
      const isAlreadySaved = Array.from(existingFiles).some((saved) =>
        saved.startsWith(baseName),
      );

      if (alreadyInPreview || isAlreadySaved) {
        showInfoToast(
          `"${file.name}" is already uploaded, please upload another one`,
        );
        return;
      }

      added.push({
        file,
        preview: URL.createObjectURL(file),
      });
    });

    setNewImages((prev) => [...prev, ...added]);
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const cancelImages = () => {
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
        { method: "POST", body: formData },
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

  useEffect(() => {
    if (componentInfo) {
      setFormData({
        category: componentInfo.category || "",
        component_type: componentInfo.component_type || "",
        component_specification: componentInfo.component_specification || "",
        unit_of_measurement: componentInfo.unit_of_measurement || "",
      });
    }
  }, [componentInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${config.apiBaseURL}/component/${componentId}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (res.ok) {
        const updated = await res.json();

        setFormData({
          category: updated.category,
          component_type: updated.component_type,
          component_specification: updated.component_specification,
          unit_of_measurement: updated.unit_of_measurement,
        });
        setComponentInfo(updated);
        setIsEditing(false);
        showSuccessToast("Component details updated successfully");
      } else {
        showErrorToast("Failed to update component details");
      }
    } catch (err) {
      console.error("Error saving component:", err);
      showErrorToast("Error updating component details");
    }
  };

  useEffect(() => {
    const fetchAllComponents = async () => {
      try {
        const res = await fetch(`${config.apiBaseURL}/component/`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setComponentList(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch component list:", err);
      }
    };
    fetchAllComponents();
  }, []);

  const currentIndex = componentList.findIndex(
    (c) => String(c.component_id) === String(componentId),
  );

  const prevComponentId =
    currentIndex > 0 ? componentList[currentIndex - 1].component_id : null;
  const nextComponentId =
    currentIndex >= 0 && currentIndex < componentList.length - 1
      ? componentList[currentIndex + 1].component_id
      : null;

  const goPrev = () => {
    if (prevComponentId) {
      navigate(`/components/${prevComponentId}`);
    }
  };

  const goNext = () => {
    if (nextComponentId) {
      navigate(`/components/${nextComponentId}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        vendorDropdownRefs.current.every(
          (ref) => ref && !ref.contains(e.target),
        )
      ) {
        setVendorOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownHeight(rect.height);
    }
  }, [vendorOpenIndex]);

  const formatUnitPrice = (value) => {
    if (value == null) return "-";
    const num = parseFloat(value);

    if (Number.isInteger(num * 100)) {
      return num.toFixed(2);
    }

    return parseFloat(num.toFixed(2));
  };

  // ---------- FIX ADDED HERE ----------
  const isMobile = window.innerWidth < 768;

  const modalStyles = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.38)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
      padding: "20px",
    },
    modal: {
      width: "760px",
      maxWidth: "95vw",
      maxHeight: "90vh",
      overflowY: "auto",
      background: "#ffffff",
      borderRadius: "20px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.16)",
      position: "relative",
      border: "1px solid #f1d6b8",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 24px 16px",
      borderBottom: "1px solid #f3e2cf",
      position: "sticky",
      top: 0,
      background: "#fffaf5",
      zIndex: 2,
      borderTopLeftRadius: "20px",
      borderTopRightRadius: "20px",
    },
    headerLeft: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    title: {
      margin: 0,
      fontSize: "22px",
      fontWeight: 700,
      color: "#9a3412",
    },
    subtitle: {
      margin: 0,
      fontSize: "13px",
      color: "#7c5a3c",
    },
    closeBtn: {
      width: "38px",
      height: "38px",
      borderRadius: "50%",
      border: "1px solid #efc9a5",
      background: "#fff7ed",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      color: "#9a3412",
    },
    body: {
      padding: "22px 24px",
      background: "#fff",
    },
    sectionTitle: {
      fontSize: "14px",
      fontWeight: 700,
      color: "#c2410c",
      marginBottom: "14px",
      marginTop: "4px",
      letterSpacing: "0.2px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "18px 18px",
    },
    fullWidth: {
      gridColumn: isMobile ? "auto" : "1 / span 2",
    },
    fieldGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#7c2d12",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      border: "1px solid #f0c9a6",
      borderRadius: "12px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      background: "#fffdfb",
      color: "#111827",
    },
    select: {
      width: "100%",
      padding: "12px 14px",
      border: "1px solid #f0c9a6",
      borderRadius: "12px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      background: "#fffdfb",
      color: "#111827",
      cursor: "pointer",
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      border: "1px solid #f0c9a6",
      borderRadius: "12px",
      fontSize: "14px",
      outline: "none",
      resize: "vertical",
      minHeight: "92px",
      boxSizing: "border-box",
      background: "#fffdfb",
      color: "#111827",
    },
    helperText: {
      fontSize: "12px",
      color: "#8a6a4a",
      marginTop: "-2px",
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      padding: "18px 24px 22px",
      borderTop: "1px solid #f3e2cf",
      background: "#fffaf5",
      borderBottomLeftRadius: "20px",
      borderBottomRightRadius: "20px",
      position: "sticky",
      bottom: 0,
    },
    cancelBtn: {
      padding: "11px 18px",
      borderRadius: "12px",
      border: "1px solid #efc9a5",
      background: "#ffffff",
      color: "#9a3412",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      minWidth: "110px",
    },
    saveBtn: {
      padding: "11px 18px",
      borderRadius: "12px",
      border: "none",
      background: "linear-gradient(135deg, #f97316, #ea580c)",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      minWidth: "140px",
      boxShadow: "0 8px 20px rgba(234, 88, 12, 0.28)",
    },
    statusPill: {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      background: "#fff1e6",
      color: "#c2410c",
      width: "fit-content",
      marginTop: "4px",
      border: "1px solid #f5c9a5",
    },
  };
  // ---------- FIX ENDS HERE ----------

  const validThumbnails = Array.isArray(imageList)
    ? imageList.filter((s) => !isPlaceholder(s))
    : [];
  const showThumbnails =
    validThumbnails.length > 0 && !isPlaceholder(mainImage);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <div className="spinner"></div>
        Loading Component Details...
      </div>
    );

  if (noData) return <p>No information available for this component</p>;

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

            <div className="image-upload-controls">
              {!isEditingImage ? (
                <>
                  {canEdit && (
                    <button onClick={() => setIsEditingImage(true)}>
                      Add Images
                    </button>
                  )}
                </>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onPickImages}
                  />

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
          <div
            className="product-header"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <a href="/app1/components" className="back-link">
              ← Back to List
            </a>
            <div className="nav-buttons">
              <button
                className={`nav-btn prev ${!prevComponentId ? "disabled" : ""}`}
                onClick={goPrev}
                disabled={!prevComponentId}
              >
                <i className="fas fa-arrow-left"></i> Previous
              </button>

              <button
                className={`nav-btn next ${!nextComponentId ? "disabled" : ""}`}
                onClick={goNext}
                disabled={!nextComponentId}
              >
                Next <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <h2 className="product-title">
            {formData?.component_specification || "No Description"}
          </h2>

          <div className="highlights-container">
            <div className="highlights">
              <h3>Category:</h3>
              {isEditing ? (
                <input
                  type="text"
                  name="category"
                  value={formData?.category}
                  onChange={handleChange}
                />
              ) : (
                <p>{formData?.category || "-"}</p>
              )}
            </div>

            <div className="highlights">
              <h3>Component Type:</h3>
              {isEditing ? (
                <input
                  type="text"
                  name="component_type"
                  value={formData?.component_type}
                  onChange={handleChange}
                />
              ) : (
                <p>{formData?.component_type || "-"}</p>
              )}
            </div>

            <div className="highlights">
              <h3>Specification:</h3>
              {isEditing ? (
                <input
                  type="text"
                  name="component_specification"
                  value={formData?.component_specification}
                  onChange={handleChange}
                />
              ) : (
                <p>{formData?.component_specification || "-"}</p>
              )}
            </div>

            <div className="highlights">
              <h3>UOM:</h3>
              {isEditing ? (
                <input
                  type="text"
                  name="unit_of_measurement"
                  value={formData?.unit_of_measurement}
                  onChange={handleChange}
                />
              ) : (
                <p>{formData?.unit_of_measurement || "-"}</p>
              )}
            </div>

            {canEditPlus &&
              (!isEditing ? (
                <FaEdit
                  onClick={() => setIsEditing(true)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#555",
                  }}
                  title="Edit Highlights"
                />
              ) : (
                <div
                  className="action-buttons"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button onClick={handleSave} className="edit-btn">
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="delete-button"
                    style={{ padding: "6px 10px" }}
                  >
                    Cancel
                  </button>
                </div>
              ))}
          </div>

          <div className="description" style={{ position: "relative" }}>
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
              <div style={{ display: "flex", alignItems: "center" }}>
                <p style={{ marginRight: "30px" }}>
                  {firstVendor?.product_description || "N/A"}
                </p>

                {canEditPlus && (
                  <FaEdit
                    onClick={() => {
                      setEditedDescription(
                        firstVendor?.product_description || "",
                      );
                      setIsEditingDescription(true);
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
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
                {componentInfo?.component_id ||
                  firstVendor?.component_id ||
                  "-"}
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

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              margin: "8px 0",
            }}
          >
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
                <img src={Add} alt="Add Vendor & price" />
              </button>
            )}
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
                {showAddRow && (
                  <tr className="new-row">
                    <td
                      className="specification-cells"
                      style={{ position: "relative" }}
                      ref={(el) => (vendorDropdownRefs.current[0] = el)}
                    >
                      <div className="multi-select">
                        <div
                          className="multi-select-box"
                          onClick={() =>
                            setVendorOpenIndex(vendorOpenIndex === 0 ? null : 0)
                          }
                        >
                          <span className="selected-names">
                            {selectedComponents.vendor?.vendor_name ||
                              "Select Vendor"}
                          </span>
                          <span className="dropdown-caret">▾</span>
                        </div>

                        {vendorOpenIndex === 0 && (
                          <div
                            ref={dropdownRef}
                            className="multi-select-dropdown"
                            style={{
                              position: "fixed",
                              top: (() => {
                                const rect =
                                  vendorDropdownRefs.current[0]?.getBoundingClientRect();
                                if (!rect) return 0;
                                const viewportHeight = window.innerHeight;
                                const dropdownHeight =
                                  dropdownRef.current?.offsetHeight || 200;
                                const spaceBelow = viewportHeight - rect.bottom;
                                const spaceAbove = rect.top;

                                return spaceBelow >= dropdownHeight ||
                                  spaceBelow >= spaceAbove
                                  ? rect.bottom
                                  : rect.top - dropdownHeight;
                              })(),
                              left:
                                vendorDropdownRefs.current[0]?.getBoundingClientRect()
                                  .left + "px",
                              minWidth:
                                vendorDropdownRefs.current[0]?.getBoundingClientRect()
                                  .width + "px",
                              zIndex: 9999,
                              maxHeight: "240px",
                              overflowY: "auto",
                              background: "#fff",
                              border: "1px solid #ccc",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px",
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Search vendor"
                                value={vendorSearches[0] || ""}
                                onChange={(e) =>
                                  setVendorSearches({
                                    ...vendorSearches,
                                    0: e.target.value,
                                  })
                                }
                                className="multi-select-input"
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              />

                              <button
                                type="button"
                                title="Add new vendor"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openVendorModal();
                                }}
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  borderRadius: "50%",
                                  border: "1px solid #ccc",
                                  background: "#fff",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <FaPlus size={12} />
                              </button>
                            </div>

                            {(() => {
                              const filteredVendors = vendorOptions.filter(
                                (v) =>
                                  (v.name?.toLowerCase() || "").includes(
                                    (vendorSearches[0] || "").toLowerCase(),
                                  ),
                              );

                              if (filteredVendors.length === 0) {
                                return (
                                  <div
                                    className="multi-select-no-results"
                                    style={{ padding: "10px" }}
                                  >
                                    No vendor found for "{vendorSearches[0]}"
                                  </div>
                                );
                              }

                              return filteredVendors.map((v) => (
                                <div
                                  key={v.id}
                                  className="multi-select-item"
                                  style={{
                                    padding: "10px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #f3f3f3",
                                  }}
                                  onClick={() => {
                                    setSelectedComponents({
                                      vendor: {
                                        vendor_name: v.name,
                                        vendor_id: v.id,
                                      },
                                    });
                                    setNewRow((prev) => ({
                                      ...prev,
                                      vendor_id: v.id,
                                      vendor_name: v.name,
                                    }));
                                    setVendorOpenIndex(null);
                                    setVendorSearches({ 0: "" });
                                  }}
                                >
                                  {v.name}
                                </div>
                              ));
                            })()}
                          </div>
                        )}
                      </div>
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
                    <td
                      style={{ textAlign: "right" }}
                      title={
                        priceDataMap[vendor.product_id]?.price ??
                        vendor.last_price ??
                        "-"
                      }
                    >
                      ₹
                      {(() => {
                        const rawPrice =
                          priceDataMap[vendor.product_id]?.price ??
                          vendor.last_price ??
                          "-";

                        if (rawPrice === "-") return "-";
                        return formatUnitPrice(rawPrice);
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
                              priceDataMap[vendor.product_id].current_time,
                            ),
                            "dd-MM-yyyy",
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

          {showVendorModal && (
            <div style={modalStyles.overlay}>
              <div style={modalStyles.modal}>
                <div style={modalStyles.header}>
                  <div style={modalStyles.headerLeft}>
                    <h3 style={modalStyles.title}>Add New Vendor</h3>
                    <p style={modalStyles.subtitle}>
                      Create vendor master and contact details
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeVendorModal}
                    style={modalStyles.closeBtn}
                    title="Close"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div style={modalStyles.body}>
                  <div style={modalStyles.sectionTitle}>Vendor Information</div>

                  <div style={modalStyles.grid}>
                    <div style={modalStyles.fieldGroup}>
                      <label style={modalStyles.label}>Vendor Name</label>
                      <input
                        type="text"
                        style={modalStyles.input}
                        value={vendorModalData.vendor_name}
                        onChange={(e) =>
                          onChangeVendorModal("vendor_name", e.target.value)
                        }
                        placeholder="Enter vendor name"
                      />
                    </div>

                    <div style={modalStyles.fieldGroup}>
                      <label style={modalStyles.label}>GSTN</label>
                      <input
                        type="text"
                        style={modalStyles.input}
                        value={vendorModalData.gstn}
                        onChange={(e) =>
                          onChangeVendorModal("gstn", e.target.value)
                        }
                        placeholder="Enter GSTN"
                      />
                    </div>

                    <div style={modalStyles.fieldGroup}>
                      <label style={modalStyles.label}>Status</label>
                      <select
                        style={modalStyles.select}
                        value={vendorModalData.active ? "true" : "false"}
                        onChange={(e) =>
                          onChangeVendorModal(
                            "active",
                            e.target.value === "true",
                          )
                        }
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                      <span style={modalStyles.statusPill}>
                        {vendorModalData.active
                          ? "Currently Active"
                          : "Currently Inactive"}
                      </span>
                    </div>

                    <div style={modalStyles.fieldGroup}>
                      <label style={modalStyles.label}>Default POC</label>
                      <select
                        style={modalStyles.select}
                        value={vendorModalData.default_poc ? "true" : "false"}
                        onChange={(e) =>
                          onChangeVendorModal(
                            "default_poc",
                            e.target.value === "true",
                          )
                        }
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                      <span style={modalStyles.helperText}>
                        Mark this contact as the default point of contact
                      </span>
                    </div>
                  </div>

                  <div style={{ height: "18px" }} />

                  <div style={modalStyles.sectionTitle}>
                    Contact Information
                  </div>

                  <div style={modalStyles.grid}>
                    <div style={modalStyles.fieldGroup}>
                      <label style={modalStyles.label}>Point of Contact</label>
                      <input
                        type="text"
                        style={modalStyles.input}
                        value={vendorModalData.point_of_contact}
                        onChange={(e) =>
                          onChangeVendorModal(
                            "point_of_contact",
                            e.target.value,
                          )
                        }
                        placeholder="Enter contact person"
                      />
                    </div>

                    <div style={modalStyles.fieldGroup}>
                      <label style={modalStyles.label}>Phone Number</label>
                      <input
                        type="text"
                        style={modalStyles.input}
                        value={vendorModalData.phone_number}
                        onChange={(e) =>
                          onChangeVendorModal("phone_number", e.target.value)
                        }
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div style={modalStyles.fieldGroup}>
                      <label style={modalStyles.label}>Email</label>
                      <input
                        type="email"
                        style={modalStyles.input}
                        value={vendorModalData.email}
                        onChange={(e) =>
                          onChangeVendorModal("email", e.target.value)
                        }
                        placeholder="Enter email"
                      />
                    </div>

                    <div
                      style={{
                        ...modalStyles.fieldGroup,
                        ...modalStyles.fullWidth,
                      }}
                    >
                      <label style={modalStyles.label}>
                        Location / Address
                      </label>
                      <textarea
                        style={modalStyles.textarea}
                        value={vendorModalData.location}
                        onChange={(e) =>
                          onChangeVendorModal("location", e.target.value)
                        }
                        placeholder="Enter location / address"
                      />
                    </div>
                  </div>
                </div>

                <div style={modalStyles.footer}>
                  <button
                    type="button"
                    onClick={closeVendorModal}
                    disabled={savingVendorModal}
                    style={modalStyles.cancelBtn}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={createVendorAndSublist}
                    disabled={savingVendorModal}
                    style={{
                      ...modalStyles.saveBtn,
                      opacity: savingVendorModal ? 0.7 : 1,
                      cursor: savingVendorModal ? "not-allowed" : "pointer",
                    }}
                  >
                    {savingVendorModal ? "Saving..." : "Save Vendor"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <ToastContainerComponent />
        </div>
      </div>
    </div>
  );
};

export default ComponentDetailsPage;
