import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import CategoriesModel from "../categories/model.js";
import ReviewsModel from "../reviews/model.js";
import ProductsCategoryModel from "./ProductsCategoryModel.js";
const ProductsModel = sequelize.define("product", {
  productId: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: { type: DataTypes.STRING, allowNull: false },

  image: { type: DataTypes.STRING, allowNull: false },

  price: { type: DataTypes.FLOAT, allowNull: false },
});

ProductsModel.belongsToMany(CategoriesModel, {
  through: ProductsCategoryModel,
  foreignKey: { name: "productId", allowNull: false },
});
CategoriesModel.belongsToMany(ProductsModel, {
  through: ProductsCategoryModel,
  foreignKey: { name: "categoryId", allowNull: false },
});

ProductsModel.hasMany(ReviewsModel, { foreignKey: { name: "productId" } });
ReviewsModel.belongsTo(ProductsModel);

export default ProductsModel;
