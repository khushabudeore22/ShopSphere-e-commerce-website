export const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(Number(price))) {
    return '₹0';
  }
  return `₹${Number(price).toLocaleString('en-IN')}`;
};

export default formatPrice;
