import { Prisma, User } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import BaseRepository from "../baseRepository";
import { BaseCrudRepositoryInterface, SingletonServiceInterface } from "../type/CommonInterface";

class UserRepository extends BaseRepository implements SingletonServiceInterface<UserRepository>, BaseCrudRepositoryInterface<User> {
  private static instance: UserRepository
  private static user: Prisma.UserDelegate<DefaultArgs>;

  private constructor() {
    super();
    UserRepository.instance = this;
    UserRepository.user = this.client.user;
  }

  getInstance(): UserRepository {
    return UserRepository.getInstance();
  }

  static getInstance(): UserRepository {
    if (this.instance) {
      return this.instance;
    } else {
      return new UserRepository();
    }
  }

  async findOneById(id: string): Promise<User> {
    return await UserRepository.user.findUniqueOrThrow({
      where: {
        id
      }
    });
  }

  async findByMailAddress(mailAddress: string): Promise<User> {
    return await UserRepository.user.findUniqueOrThrow({
      where: {
        mailAddress
      }
    })
  }

  async read(): Promise<User[]> {
    return await UserRepository.user.findMany();
  }

  async create(tempUser: Omit<User, "id" | "cancelDate">): Promise<User> {
    return await UserRepository.user.create({
      data: {
        ...tempUser
      }
    })
  }

  async update(param: User): Promise<User> {
    return await UserRepository.user.update({
      where: {
        id: param.id
      },
      data: {
        ...param
      }
    })
  }

  async delete(id: string): Promise<void> {
    await UserRepository.user.delete({
      where: {
        id
      }
    })
  }
}

export default UserRepository;
