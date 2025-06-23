// // Third set of code
// // do the development here
// // src\pages\Components.jsx

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import config from "../Config"; // Import config for API endpoints
// import "../App.css";
// import { useParams } from "react-router-dom";

// import {
//   showSuccessToast,
//   showErrorToast,
//   showInfoToast,
//   showWarningToast,
//   ToastContainerComponent,
// } from "./Toastify.jsx"; // Import Toastify utilities

// const debounce = (func, delay) => {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       func(...args);
//     }, delay);
//   };
// };

// const ComponentDetailsPage = () => {
//   const [mainImage, setMainImage] = useState("/placeholder.jpg");
//   const [imageList, setImageList] = useState([]);

//   const [lensVisible, setLensVisible] = useState(false);
//   const [zoomResultStyle, setZoomResultStyle] = useState({});
//   const imgRef = useRef();

//   const handleMouseMove = (e) => {
//     const rect = imgRef.current.getBoundingClientRect();
//     const lensSize = Math.min(window.innerWidth * 0.25, 550); // Max 550px

//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const cx = 4; // Zoom factor
//     const cy = 4;

//     const backgroundX = (x / rect.width) * 100;
//     const backgroundY = (y / rect.height) * 100;

//     setZoomResultStyle({
//       position: "absolute",
//       left: `${rect.right + 20}px`, // 👈 Fixed position to the right of image
//       top: `20px`, // 👈 Aligned with top of the image
//       width: `80%`,
//       height: `100%`,
//       backgroundImage: `url(${mainImage})`,
//       backgroundRepeat: "no-repeat",
//       backgroundSize: `${rect.width * cx}px ${rect.height * cy}px`,
//       backgroundPosition: `${backgroundX}% ${backgroundY}%`,
//       border: "1px solid rgba(0, 0, 0, 0.2)",
//       boxShadow: "0 0 8px rgba(0, 0, 0, 0.3)",
//       pointerEvents: "none",
//       zIndex: 9999,
//     });
//   };

//   /////////////////////////

//   const { productId } = useParams();
//   const [vendorDetail, setVendorDetail] = useState(null);

//   console.log("the product id is", productId);
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const res = await fetch(
//           `${config.apiBaseURL}/vendor_master/${productId}/`
//         );
//         const data = await res.json();
//         setVendorDetail(data);

//         const base = config.apiBaseURL;

//         let images = [];

//         // Use attachments (multiple image files)
//         if (Array.isArray(data.attachments) && data.attachments.length > 0) {
//           images = data.attachments.map((path) => `${base}${path}`);
//         } else if (data.img) {
//           images = [`${base}${data.img}`];
//         } else {
//           images = ["/placeholder.jpg"];
//         }

//         setImageList(images);
//         setMainImage(images[0]); // First image becomes main
//       } catch (error) {
//         console.error("Error fetching product:", error);
//       }
//     };

//     fetchProduct();
//   }, [productId]);

//   const [vendorList, setVendorList] = useState(null);

//   useEffect(() => {
//     if (vendorDetail?.vendor) {
//       fetch(`${config.apiBaseURL}/vendor_list/${vendorDetail.vendor}/`)
//         .then((res) => res.json())
//         .then((data) => setVendorList(data))
//         .catch((err) => console.error("Vendor list fetch failed:", err));
//     }
//   }, [vendorDetail]);

//   if (!vendorDetail) return <p>Loading...</p>;

//   return (
//     <div className="product-detail-container">
//       <div className="product-row">
//         <div className="product-left">
//           <div className="product-images">
//             <div
//               className="main-image"
//               onMouseMove={handleMouseMove}
//               onMouseEnter={() => setLensVisible(true)}
//               onMouseLeave={() => setLensVisible(false)}
//             >
//               <img
//                 ref={imgRef}
//                 src={mainImage}
//                 alt="No Image"
//                 className="main-img"
//               />
//               {lensVisible && mainImage && mainImage !== "/placeholder.jpg" && (
//                 <div className="zoom-result" style={zoomResultStyle} />
//               )}
//             </div>
//             <div className="thumbnails-wrapper">
//               <div className="thumbnails">
//                 {imageList.map((src, index) => (
//                   <img
//                     key={index}
//                     src={src}
//                     alt={`Not found ${index + 1}`}
//                     className={mainImage === src ? "active-thumbnail" : ""}
//                     onClick={() => setMainImage(src)}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//           <div className="action-buttons">
//             <button className="btn btn-add">Add to Cart</button>
//             <button className="btn btn-buy">Buy Now</button>
//           </div>
//         </div>
//         <div className="product-right">
//           <div className="product-header">
//             <a href="/components" className="back-link">
//               ← Back
//             </a>
//             <span className="share">🔗 Share</span>
//           </div>
//           <h2 className="product-title">
//             Canon EOS R Mirrorless Camera Body with Single Lens: RF24-105 mm
//             f/4L IS USM Lens (Black)
//           </h2>
//           {/* <div className="price-details">
//             <span className="actual-price">₹2,28,525</span>
//             <span className="discounted-price">₹2,56,995</span>
//             <span className="discount">11% off</span>
//           </div> */}
//           <div className="highlights-container">
//             <div className="highlights">
//               <h3>Categories:</h3>
//               <p>{vendorDetail.category}</p>
//             </div>
//             <div className="highlights">
//               <h3>Components:</h3>
//               <p>{vendorDetail.component_type}</p>
//             </div>
//           </div>

//           <div className="description">
//             <h3>Description</h3>
//             <p>{vendorDetail.product_description}</p>
//           </div>
//           <div className="specifications">
//             <h3>Specifications</h3>
//             <ul>
//               <li>
//                 <strong>Brand:</strong> Canon
//               </li>
//               <li>
//                 <strong>Model Number:</strong> EOS R
//               </li>
//               <li>
//                 <strong>Type:</strong> Mirrorless
//               </li>
//               <li>
//                 <strong>Effective Pixels:</strong> 30.3 MP
//               </li>
//               <li>
//                 <strong>WiFi:</strong> Yes
//               </li>
//               <li>
//                 <strong>Lens Mount:</strong> Canon EF Mount
//               </li>
//               <li>
//                 <strong>Image Sensor Size:</strong> 36 x 24 mm
//               </li>
//               <li>
//                 <strong>Shutter Speed:</strong> 1/8000 - 30 sec
//               </li>
//               <li>
//                 <strong>Display Type:</strong> TFT, 3.15 inch
//               </li>
//               <li>
//                 <strong>Compatible Card:</strong> SD Card
//               </li>
//               <li>
//                 <strong>Battery Type:</strong> Lithium
//               </li>
//               <li>
//                 <strong>Weight:</strong> 0.66 kg
//               </li>
//             </ul>
//           </div>
//           <div>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Vendor Name</th>
//                   <th>Price</th>
//                   <th>Tax%</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {vendorList ? (
//                   <tr>
//                     <td>{vendorList.vendor_name}</td>
//                     <td>{vendorDetail.last_price}</td>
//                     <td>{vendorDetail.tax}%</td>
//                   </tr>
//                 ) : (
//                   <tr>
//                     <td colSpan="3">Loading vendor info...</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ComponentDetailsPage;
// src\pages\Components.jsx

import React, { useState, useEffect, useRef } from "react";
import config from "../Config";
import "../App.css";
import { useParams } from "react-router-dom";

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

  const [vendorDetail, setVendorDetail] = useState(null);
  const [vendorList, setVendorList] = useState(null);

  const [priceData, setPriceData] = useState(null);

  const handleMouseMove = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const lensSize = Math.min(window.innerWidth * 0.25, 550);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = 4;
    const cy = 4;
    const backgroundX = (x / rect.width) * 100;
    const backgroundY = (y / rect.height) * 100;

    setZoomResultStyle({
      position: "absolute",
      left: `${rect.right + 20}px`,
      top: `20px`,
      width: `80%`,
      height: `100%`,
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
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${config.apiBaseURL}/vendor_master/?component_id=${componentId}`
        );
        if (!res.ok) throw new Error("Failed to fetch vendor detail");

        const data = await res.json();
        const matchingComponent = data.find(
          (item) => item.component_id === componentId
        );

        if (!matchingComponent) throw new Error("Component not found");

        setVendorDetail(matchingComponent);

        try {
          const priceRes = await fetch(
            `${config.apiBaseURL}/price_tables/?component_id=${componentId}`
          );
          if (!priceRes.ok) throw new Error("Failed to fetch price table");

          const priceJson = await priceRes.json();
          const latestEntry = Array.isArray(priceJson)
            ? priceJson
                .filter(
                  (entry) => entry.product === matchingComponent.product_id
                )
                .sort(
                  (a, b) => new Date(b.current_time) - new Date(a.current_time)
                )[0]
            : null;

          setPriceData(latestEntry);
        } catch (priceErr) {
          console.error("Error fetching price table:", priceErr);
        }

        //  New: fetch images from /component_images/<component_id>/
        try {
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
        } catch (imgErr) {
          console.error("Error fetching component images:", imgErr);
          setImageList(["/placeholder.jpg"]);
          setMainImage("/placeholder.jpg");
        }
      } catch (error) {
        console.error("Error fetching vendor detail:", error);
        showErrorToast("Failed to load vendor details");
      }
    };

    fetchProduct();
  }, [componentId]);

  useEffect(() => {
    if (vendorDetail?.vendor) {
      fetch(`${config.apiBaseURL}/vendor_list/${vendorDetail.vendor}/`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch vendor info");
          return res.json();
        })
        .then((data) => setVendorList(data))
        .catch((err) => {
          console.error("Vendor list fetch failed:", err);
          showWarningToast("Vendor info unavailable");
        });
    }
  }, [vendorDetail]);

  if (!vendorDetail) return <p>Loading...</p>;

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
          {/* <div className="action-buttons">
            <button className="btn btn-add">Add to Cart</button>
            <button className="btn btn-buy">Buy Now</button>
          </div> */}
        </div>

        <div className="product-right">
          <div className="product-header">
            <a href="/components" className="back-link">
              ← Back
            </a>
            {/* <span className="share">🔗 Share</span> */}
          </div>

          <h2 className="product-title">
            {vendorDetail.product_description || "No Description"}
          </h2>

          <div className="highlights-container">
            <div className="highlights">
              <h3>Category:</h3>
              <p>{vendorDetail.category || "-"}</p>
            </div>
            <div className="highlights">
              <h3>Component Type:</h3>
              <p>{vendorDetail.component_type || "-"}</p>
            </div>
            <div className="highlights">
              <h3>Specification:</h3>
              <p>{vendorDetail.component_specification || "-"}</p>
            </div>
            <div className="highlights">
              <h3>UOM:</h3>
              <p>{vendorDetail.unit_of_measurement || "-"}</p>
            </div>
          </div>

          <div className="description">
            <h3>Description</h3>
            <p>{vendorDetail.product_description || "-"}</p>
          </div>

          <div className="specifications">
            <h3>Product Details</h3>
            <ul>
              <li>
                <strong>Product ID:</strong> {vendorDetail.product_id || "-"}
              </li>
              <li>
                <strong>Component ID:</strong>{" "}
                {vendorDetail.component_id || "-"}
              </li>
              <li>
                <strong>Status:</strong>{" "}
                {vendorDetail.active ? "Active" : "Inactive"}
              </li>
            </ul>
          </div>

          <div>
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
                {vendorList ? (
                  <tr>
                    <td>{vendorDetail.vendor_name || "-"}</td>
                    <td>{vendorDetail.last_price || "-"}</td>
                    <td>
                      {vendorDetail.tax != null ? `${vendorDetail.tax}%` : "-"}
                    </td>
                    <td>
                      {priceData?.current_time
                        ? new Date(priceData.current_time).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>{priceData?.delivery_days ?? "-"}</td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="3">Loading vendor info...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentDetailsPage;
