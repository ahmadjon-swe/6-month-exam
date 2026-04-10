import { Router } from "express";
import * as WishlistController from "../controllers/wishlist.controller";
import { authenticate } from "../middleware/authentication";
import { asyncWrap } from "../utils/asyncWrap";

const router = Router();

router.use(authenticate);

router.get("/",                                 asyncWrap(WishlistController.getWishlist));
router.post("/",                                asyncWrap(WishlistController.toggleWishlist));
router.post("/move-to-cart/:productId",         asyncWrap(WishlistController.moveToCart));

export default router;
