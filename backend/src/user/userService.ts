import { User } from "@prisma/client";
import { TComeServiceInterface } from "../type/CommonInterface";
import UserRepository from "./userRepository";

const userRepository = UserRepository.getInstance();

export default class UserService implements TComeServiceInterface<User> {
  upsert(param: User): Promise<User> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async findAll(): Promise<User[]> {
    return await userRepository.findAll();
  }

}
