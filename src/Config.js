
// src/config.js
const config = {


       apiBaseURL: "http://127.0.0.1:8000",
    
    //apiBaseURL: "http://148.135.138.195:8000",

    //apiBaseURL: "http://dms.aero360.co.in:8000",

    endpoints: {
      // Admin endpoint
      admin: "/admin/",
  
      // BOM endpoints
      bomList: "/bom_list/",
      bomDetail: (bom_id) => `/bom_list/${bom_id}/`,
      bomNames: "/bom_names/",
      bomMaster: "/bom_master/",
      bomMasterDetail: (id) => `/bom_master/${id}/`,
  
      // Request endpoints
      requestList: "/request_list/",
      requestDetail: (request_id) => `/request_list/${request_id}/`,
      requestMaster: "/request_master/",
  
      // Vendor endpoints
      vendorList: "/vendor_list/",
      vendorDetail: (vendor_id) => `/vendor_list/${vendor_id}/`,
      vendorMaster: "/vendor_master/",
      vendorMasterDetail: (vendor) => `/vendor_master/${vendor}/`,
      deleteVendor: (product_id) => `/vendor_master_delete/${product_id}/`,
      updateVendorMaster: (product_id) => `/vendor_master_put/${product_id}/`,
  
      // Inventory and Component endpoints
      inventory: "/inventory/",
      component: "/component/",
      componentDetail: (component_id) => `/component/${component_id}/`,
  
      // Cart endpoint
      cart: "/cart/",

      // Mrfrequest:"/create_MRF/",
    },
  };
  
  export default config;
  