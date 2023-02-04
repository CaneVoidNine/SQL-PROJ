import express from "express";
import ProductsModel from "./model.js";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import ProductsCategoryModel from "./ProductsCategoryModel.js";
import ReviewsModel from "../reviews/model.js";
import CategoriesModel from "../categories/model.js";
import UsersModel from "../users/model.js";
import CartModel from "./cartModel.js";
import ProductsCartModel from "./ProductsCartModel.js";

const productsRouter = express.Router();

productsRouter.post("/", async (req, res, next) => {
  try {
    const { productId } = await ProductsModel.create(req.body);
    if (req.body.categories) {
      await ProductsCategoryModel.bulkCreate(
        req.body.categories.map((cats) => {
          return { categoryId: cats, productId };
        })
      );
    }
    res.status(201).send({ productId });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.category)
      query.product = { [Op.iLike]: `${req.query.category}%` };
    const products = await ProductsModel.findAll({
      include: [
        {
          model: ReviewsModel,
          include: [{ model: UsersModel }],
          attributes: ["comment", "rate"],
        },
        {
          model: CategoriesModel,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      where: { ...query },
      limit: 10,
    });
    res.send(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findByPk(req.params.productId, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: ReviewsModel,
          include: [{ model: UsersModel }],
          attributes: ["comment", "rate"],
        },
        {
          model: CategoriesModel,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      where: { ...query },
      limit: 10,
    });
    if (product) {
      res.send(product);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} is not found! `
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows, updatedRecords] = await ProductsModel.update(
      req.body,
      {
        where: { id: req.params.productId },
        returning: true,
      }
    );
    if (numberOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(
        createHttpError(404),
        `Product with id ${req.params.productId} is not found!`
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId/category", async (req, res, next) => {
  try {
    const { id } = await ProductsCategoryModel.create({
      productId: req.params.productId,
      categoryId: req.body.categoryId,
    });
    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ProductsModel.destroy({
      where: { id: req.params.productId },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} is not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.post("/:productId/:userId/cart", async (req, res, next) => {
  try {
    const activeCart = await CartModel.findAll({
      where: {
        [Op.and]: [{ userId: req.params.userId }, { status: "active" }],
      },
    });
    if (activeCart.length === 0) {
      await CartModel.create({ userId: req.params.userId, status: "active" });
    }
    console.log("CART!!!!!", activeCart);
    const productIsThere = await ProductsCartModel.findAll({
      where: {
        [Op.and]: [
          { productId: req.params.productId },
          { cartId: activeCart[0].dataValues.id },
        ],
      },
    });
    console.log("PRODUCT!!!!!", productIsThere);
    if (productIsThere.length === 0) {
      await ProductsCartModel.create({
        ...req.body,
        cartId: activeCart[0].dataValues.id,
        productId: req.params.productId,
      });
    } else {
      await ProductsCartModel.update(
        { quantity: req.body.quantity + productIsThere[0].dataValues.quantity },
        {
          where: {
            [Op.and]: [
              { productId: req.params.productId },
              { cartId: activeCart[0].dataValues.id },
            ],
          },
          returning: true,
        }
      );
    }
    res.status(201).send();
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
