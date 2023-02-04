import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import { pgConnect, syncModels } from "./db.js";
import productsRouter from "./api/products/index.js";
import categoriesRouter from "./api/categories/index.js";
import usersRouter from "./api/users/index.js";
import reviewRouter from "./api/reviews/index.js";

import {
  badRequestErrorHandler,
  unauthorizedErrorHandler,
  notFoundErrorHandler,
  genericErrorHandler,
} from "./errorHandlers.js";

const server = express();
const port = process.env.port || 3001;

server.use(cors());
server.use(express.json());

server.use("/products", productsRouter);
server.use("/categories", categoriesRouter);
server.use("/users", usersRouter);
server.use("/products", reviewRouter);

server.use(badRequestErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(notFoundErrorHandler);
server.use(genericErrorHandler);

await pgConnect();
await syncModels();

server.listen(port, () => {
  console.table(listEndpoints(server), console.log(`Server port is ${port}`));
});
