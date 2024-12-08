import { User } from "@prisma/client";
import * as bcrypt from 'bcryptjs';
import { LoginBody, SingUpBody } from "../type/LoginRequest";
import UserRepository from "./userRepository";

const userRepository = UserRepository.getInstance();

export default class UserService {
  async login(param: LoginBody): Promise<User> {
    const { mailAddress, password } = param;
    console.log({ mailAddress, password })
    const user = await userRepository.findByMailAddress(mailAddress);
    if (!await this.comparePassword(password, user.password)) {
      throw new Error('Invalid Password');
    }
    console.log({user})
    return user;
  }

  async signUp(param: SingUpBody): Promise<User> {
    const { mailAddress, password, name } = param;
    console.log({ mailAddress, password, name })
    const registerDate = new Date();
    const tempUser = { name, mailAddress, password: this.hashPassword(password), registerDate }
    const user = await userRepository.create(tempUser);
    console.log({user})
    return user;
  }

  async get(id: string): Promise<User> { 
    return await userRepository.findOneById(id);
  }

  async upsert(param: User): Promise<User> {
    if (param.id) {
      return await userRepository.update(param);
    } else {
      return await userRepository.create(param);
    };
  }

  async delete(id: string): Promise<void> {
    await userRepository.delete(id);
  }

  private hashPassword(password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }

  private comparePassword = async (
    password: string,
    hashed: string
  ): Promise<boolean> => {
    return bcrypt.compare(password, hashed);
  };
}
