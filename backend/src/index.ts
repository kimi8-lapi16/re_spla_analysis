import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { expressjwt } from "express-jwt";
import swaggerUi from "swagger-ui-express";
import * as swaggerDoc from "../swagger.json";
import getTokenFromCookie from "./getToken";
import ruleRouter from "./rule/ruleRouter";
import stageRouter from "./stage/stageRouter";
import userRouter from "./user/userRouter";
import weaponRouter from "./weapon/weaponRouter";

const app = express();

// CORSの設定
const corsOption = {
  origin: process.env.FRONT_URL,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOption));
app.use(cookieParser());

// swaggerの初期化
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(express.json());

// 認証不要なエンドポイントの設定
const skipAuthRoutes = new Set(["/users/login", "/users/signUp"]);
app.use((req, res, next) => {
  if (skipAuthRoutes.has(req.path)) {
    return next(); // 認証をスキップ
  }
  return expressjwt({ secret: process.env.JWT_SECRET_KEY!, algorithms: ["HS256"], getToken: req => getTokenFromCookie(req) })(req, res, next);
});

// ルーティング設定
app.use("/users", userRouter);
app.use("/weapons", weaponRouter);
app.use("/stages", stageRouter);
app.use("/rules", ruleRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
