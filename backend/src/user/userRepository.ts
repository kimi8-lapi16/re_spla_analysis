import { Prisma, User } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import BaseRepository from "../baseRepository";
import { SingletonServiceInterface } from "../type/CommonInterface";

class UserRepository extends BaseRepository implements SingletonServiceInterface<UserRepository> {
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

  async findAll(): Promise<User[]> {
    return await UserRepository.user.findMany();
  }

}

export default UserRepository;
