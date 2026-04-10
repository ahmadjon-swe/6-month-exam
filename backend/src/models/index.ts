import User from "./User";
import Product from "./Product";
import Cart from "./Cart";
import Wishlist from "./Wishlist";
import { Order, OrderItem } from "./Order";

// User <-> Products (seller)
User.hasMany(Product, { foreignKey: "seller_id", as: "products" });
Product.belongsTo(User, { foreignKey: "seller_id", as: "seller" });

// User <-> Cart
User.hasMany(Cart, { foreignKey: "user_id", as: "cart_items" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });

Product.hasMany(Cart, { foreignKey: "product_id", as: "cart_entries" });
Cart.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// User <-> Wishlist
User.hasMany(Wishlist, { foreignKey: "user_id", as: "wishlist_items" });
Wishlist.belongsTo(User, { foreignKey: "user_id", as: "user" });

Product.hasMany(Wishlist, { foreignKey: "product_id", as: "wishlist_entries" });
Wishlist.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// User <-> Orders
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Product <-> OrderItems
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "order_items" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

export { User, Product, Cart, Wishlist, Order, OrderItem };
