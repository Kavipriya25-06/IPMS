// utils.js
import config from "../Config"; // Import config for API endpoints
/**
 * Fetch the latest price for a given product ID.
 * @param {string} productId - The product ID to fetch the price for.
 * @returns {number|null} - The latest price or null if not found.
 */
export const fetchLatestPrice = async (productId) => {
  try {
    const response = await fetch(`${config.apiBaseURL}/price_tables/`);
    const priceData = await response.json();
    const productPrices = priceData.filter(
      (price) => price.product === productId
    );

    if (productPrices.length === 0) return null;

    const latestPrice = productPrices.reduce((latest, current) =>
      new Date(latest.current_time) > new Date(current.current_time)
        ? latest
        : current
    );
    return latestPrice.price;
  } catch (error) {
    console.error("Error fetching latest price:", error);
    return null;
  }
};

/**
 * Fetch product ID for a given component ID from the Component Master.
 * @param {string} componentId - The component ID to fetch the product ID for.
 * @returns {string|null} - The product ID or null if not found.
 */
export const fetchProductId = async (componentId) => {
  try {
    const response = await fetch(`${config.apiBaseURL}/component/`);
    const componentData = await response.json();
    const component = componentData.find(
      (comp) => comp.component_id === componentId
    );
    return component?.product_id || null;
  } catch (error) {
    console.error("Error fetching product ID:", error);
    return null;
  }
};
