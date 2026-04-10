import { Router } from "express";
import * as ProductController from "../controllers/product.controller";
import { authenticate } from "../middleware/authentication";
import { upload } from "../middleware";
import { asyncWrap } from "../utils/asyncWrap";

const router = Router();

// Public
router.get("/",                         asyncWrap(ProductController.getProducts));
router.get("/most-sold",                asyncWrap(ProductController.getMostSold));
router.get("/discounted",               asyncWrap(ProductController.getDiscountedProducts));
router.get("/:id",                      asyncWrap(ProductController.getProduct));

// Protected
router.post(
  "/",
  authenticate,
  upload.array("images", 10),
  asyncWrap(ProductController.createProduct)
);
router.put(
  "/:id",
  authenticate,
  upload.array("images", 10),
  asyncWrap(ProductController.updateProduct)
);
router.delete("/:id", authenticate, asyncWrap(ProductController.deleteProduct));

export default router;
