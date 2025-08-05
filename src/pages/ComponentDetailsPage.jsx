import React, { useState, useEffect, useRef } from "react";
import config from "../Config";
import "../App.css";
import { useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "./Toastify.jsx";

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

  const handleMouseMove = (e) => {
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
      border: "1px solid rgba(0, 0, 0, 0.2)",
      boxShadow: "0 0 8px rgba(0, 0, 0, 0.3)",
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
          `${config.apiBaseURL}/vendor_master/?component_id=${componentId}`
        );
        if (!res.ok) throw new Error("Failed to fetch vendor detail");

        const data = await res.json();
        const matchingComponents = data.filter(
          (item) => item.component_id === componentId
        );
        if (matchingComponents.length === 0) {
          setNoData(true);
          setVendorDetails([]);
          setLoading(false);
          return;
        }

        setVendorDetails(matchingComponents);

        const priceRes = await fetch(
          `${config.apiBaseURL}/price_tables/?component_id=${componentId}`
        );
        const priceJson = await priceRes.json();

        const priceMap = {};
        matchingComponents.forEach((comp) => {
          const prices = priceJson.filter(
            (entry) => entry.product === comp.product_id
          );
          if (prices.length > 0) {
            priceMap[comp.product_id] = prices.sort(
              (a, b) => new Date(b.current_time) - new Date(a.current_time)
            )[0];
          }
        });

        setPriceDataMap(priceMap);

        const imageRes = await fetch(
          `${config.apiBaseURL}/component_images/by-component/${componentId}/`
        );
        const imageData = await imageRes.json();
        const images =
          Array.isArray(imageData) && imageData.length > 0
            ? imageData.map((img) => `${config.apiBaseURL}${img.image}`)
            : ["/placeholder.jpg"];

        setImageList(images);
        setMainImage(images[0]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching component detail:", err);
        showErrorToast("Failed to load component details");
        setNoData(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [componentId]);

  if (loading) return  <div className="spinner"></div>
                   
  if (noData) return <p>No information available for this component</p>;

  const firstVendor = vendorDetails[0];

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
                src={mainImage}
                alt="No Image"
                className="main-img"
              />
              {lensVisible && mainImage && mainImage !== "/placeholder.jpg" && (
                <div className="zoom-result" style={zoomResultStyle} />
              )}
            </div>
            <div className="thumbnails-wrapper">
              <div className="thumbnails">
                {imageList.map((src, index) => (
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
          </div>
        </div>

        <div className="product-right">
          <div className="product-header">
            <a href="/components" className="back-link">
              ← Back
            </a>
          </div>

          <h2 className="product-title">
            {firstVendor.product_description || "No Description"}
          </h2>

          <div className="highlights-container">
            <div className="highlights">
              <h3>Category:</h3>
              <p>{firstVendor.category || "-"}</p>
            </div>
            <div className="highlights">
              <h3>Component Type:</h3>
              <p>{firstVendor.component_type || "-"}</p>
            </div>
            <div className="highlights">
              <h3>Specification:</h3>
              <p>{firstVendor.component_specification || "-"}</p>
            </div>
            <div className="highlights">
              <h3>UOM:</h3>
              <p>{firstVendor.unit_of_measurement || "-"}</p>
            </div>
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{firstVendor.product_description || "-"}</p>
          </div>

          <div className="specifications">
            <h3>Product Details</h3>
            <ul>
              <li>
                <strong>Component ID:</strong> {firstVendor.component_id || "-"}
              </li>
              <li>
                <strong>Status:</strong>{" "}
                {firstVendor.active ? "Active" : "Inactive"}
              </li>
            </ul>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Price</th>
                  <th>Tax%</th>
                  <th>Date</th>
                  <th>Delivery Days</th>
                </tr>
              </thead>
              <tbody>
                {vendorDetails.map((vendor) => (
                  <tr key={vendor.product_id}>
                    <td className="truncate-cell" title={vendor.vendor_name}>
        {vendor.vendor_name}
      </td>
                    <td style={{ textAlign: "right" }}>
                      ₹
                      {priceDataMap[vendor.product_id]?.price ??
                        vendor.last_price ??
                        "-"}
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
        </div>
      </div>
    </div>
  );
};

export default ComponentDetailsPage;
