import { Stage } from "@prisma/client";
import StageRepository from "./stageRepository";

const stageRepository = StageRepository.getInstance();

export default class StageService {
  async getAll(): Promise<Stage[]> { 
    return await stageRepository.read();
  }
}
