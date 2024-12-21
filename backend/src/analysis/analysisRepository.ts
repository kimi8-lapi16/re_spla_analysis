import { Analysis, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import BaseRepository from "../baseRepository";
import { BaseCrudRepositoryInterface, SingletonRepositoryInterface } from "../type/RepositoryInterface";

export default class AnalysisRepository extends BaseRepository implements SingletonRepositoryInterface<AnalysisRepository>, BaseCrudRepositoryInterface<Analysis, Prisma.AnalysisWhereInput> {
  private static instance: AnalysisRepository
  private static analysis: Prisma.AnalysisDelegate<DefaultArgs>;

  private constructor() {
    super();
    AnalysisRepository.instance = this;
    AnalysisRepository.analysis = this.client.analysis;
  }

  async findOneById(id: string): Promise<Analysis> {
    return await AnalysisRepository.analysis.findUniqueOrThrow({
      where: {
        id
      }
    })
  }

  async read(where?: Prisma.AnalysisWhereInput): Promise<Analysis[]> {
    return await AnalysisRepository.analysis.findMany({
      where
    })
  }

  async create(param: Omit<Analysis, "id">): Promise<Analysis> {
    return await AnalysisRepository.analysis.create({
      data: {
        ...param
      }
    })
  }

  async update(param: Analysis): Promise<Analysis> {
    return await AnalysisRepository.analysis.update({
      where: {
        id: param.id
      },
      data: {
        ...param
      }
    })
  }

  async delete(id: string): Promise<void> {
    await AnalysisRepository.analysis.delete({
      where: {
        id
      }
    })
  }

  getInstance(): AnalysisRepository {
    return AnalysisRepository.getInstance();
  }

  static getInstance(): AnalysisRepository {
    if (this.instance) {
      return this.instance;
    } else {
      return new AnalysisRepository();
    }
  }
}