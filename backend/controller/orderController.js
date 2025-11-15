import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    // Assume user is authenticated, req.user._id is available
    const userId = req.user._id;
    const { cartId, shippingDetails, paymentMethod = "cod", totalAmount } = req.body;

    // Find cart (assuming 1 user 1 cart, else use cartId from req.body)
    const cart = await Cart.findOne({ _id: cartId, user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or invalid." });
    }

    // Prepare order items array with price & vendor at order time
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      vendor: item.product.vendor,
      quantity: item.quantity,
      priceAtPurchase: item.product.sellingPrice,
    }));

    // Create Order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: { ...shippingDetails },
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      orderStatus: "pending",
    });

    await order.save();

    // Optionally clear user's cart after placing order
    cart.items = [];
    await cart.save();

    res.json({ message: "Order placed successfully!", orderId: order._id });
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ message: "Failed to place order." });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    // Fetch all orders, populate user and vendor/product info for admin view
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email") // Customer info
      .populate({
        path: "items.product",
        select: "name images", // Product info
      })
      .populate({
        path: "items.vendor",
        select: "businessName name email", // Vendor info
      });

    res.json(orders);
  } catch (err) {
    console.error("Admin orders fetch error:", err);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Get all orders where any item is sold by this vendor
    const orders = await Order.find({ "items.vendor": vendorId })
      .sort({ createdAt: -1 })
      .populate("user", "name email phone")
      .populate({
        path: "items.product",
        select: "name images",
      });

    // Optionally, filter only those items in each order that belong to this vendor:
    const myOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.filter((item) => item.vendor.toString() === vendorId.toString()),
    }));

    res.json(myOrders);
  } catch (err) {
    console.error("Vendor orders fetch error:", err);
    res.status(500).json({ message: "Failed to fetch vendor orders." });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "items.product",
        select: "name images",
      })
      .populate({
        path: "items.vendor",
        select: "businessName name",
      });
    res.json(orders);
  } catch (err) {
    console.error("User orders fetch error:", err);
    res.status(500).json({ message: "Failed to fetch your orders." });
  }
};
