import { Analysis } from "@prisma/client";
import { SearchCondtions } from "../type/SearchRequest";
import AnalysisRepository from "./analysisRepository";

const repository = AnalysisRepository.getInstance();

export default class AnalysisService {
  async findByConditions(conditions: SearchCondtions): Promise<Analysis[]> {
    console.log(conditions);
    return await repository.read();
  }
}