import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import settingsRouter from "./settings";
import bannersRouter from "./banners";
import couponsRouter from "./coupons";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(settingsRouter);
router.use(bannersRouter);
router.use(couponsRouter);
router.use(authRouter);

export default router;
