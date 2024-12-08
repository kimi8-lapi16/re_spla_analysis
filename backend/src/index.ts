import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import * as swaggerDoc from "../swagger.json";
import userRouter from "./user/userRouter";

const app = express();

// CORSの設定
const corsOption = {
  origin: process.env.FRONT_URL,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOption));

// swaggerの初期化
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(express.json());

app.use("/users", userRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
