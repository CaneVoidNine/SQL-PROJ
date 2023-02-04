import express from "express";
import ReviewsModel from "./model.js";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import UsersModel from "../users/model.js";

const reviewRouter = express.Router();

reviewRouter.post("/:productId/review", async (req, res, next) => {
  try {
    const reviewBody = { ...req.body, productId: req.params.productId };
    const { id } = await ReviewsModel.create(reviewBody);
    res.status(201).send({ id });
  } catch (error) {
    next(error);
  }
});

reviewRouter.get("/reviews", async (req, res, next) => {
  try {
    const reviews = await ReviewsModel.findAll({
      include: [{ model: UsersModel, attributes: ["name", "surname"] }],
    });
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

reviewRouter.get("/:reviewId/review", async (req, res, next) => {
  try {
    const review = await ReviewsModel.findByPk(req.params.reviewId, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (review) {
      res.send(review);
    } else {
      next(
        createHttpError(
          404,
          `review with id ${req.params.reviewId} is not found! `
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

reviewRouter.put("/:reviewId/review", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows, updatedRecords] = await ReviewsModel.update(
      req.body,
      {
        where: { id: req.params.reviewId },
        returning: true,
      }
    );
    if (numberOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(
        createHttpError(404),
        `review with id ${req.params.reviewId} is not found!`
      );
    }
  } catch (error) {
    next(error);
  }
});

reviewRouter.delete("/:reviewId/review", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ReviewsModel.destroy({
      where: { id: req.params.reviewId },
    });
    if (numberOfDeletedRows === 1) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `review with id ${req.params.reviewId} is not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default reviewRouter;
