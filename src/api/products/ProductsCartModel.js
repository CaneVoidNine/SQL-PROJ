import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const ProductsCartModel = sequelize.define("productCart", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: { type: DataTypes.INTEGER },
});

export default ProductsCartModel;
