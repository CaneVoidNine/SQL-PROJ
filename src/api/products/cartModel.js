import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ProductsModel from "./model.js";
import ProductsCartModel from "./ProductsCartModel.js";

const CartModel = sequelize.define("Cart", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "active" },
});

ProductsModel.belongsToMany(CartModel, {
  through: ProductsCartModel,
  foreignKey: { name: "productId", allowNull: false },
});
CartModel.belongsToMany(ProductsModel, {
  through: ProductsCartModel,
  foreignKey: { name: "cartId", allowNull: false },
});

export default CartModel;
