import authorize from "../middlewares/authorize";

import express from "express";
const router = express.Router();

import BalanceController from "../controllers/balance.controller";

router.get("/", authorize, BalanceController.getAll);
router.post("/create", authorize, BalanceController.create);
router.get(
  "/get-by-wallet-and-blockchain",
  authorize,
  BalanceController.getByWalletAndBlockchain
);
router.get("/get-by-user/:userId", authorize, BalanceController.getByUser);
router.get(
  "/get-by-current-user",
  authorize,
  BalanceController.getByCurrentUser
);

export default router;
