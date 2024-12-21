import { Router } from "express";
import AnalysisController from "./analysisController";

const analysisRouter = Router();
const controller = new AnalysisController();

analysisRouter.get('/search', controller.search);

export default analysisRouter;