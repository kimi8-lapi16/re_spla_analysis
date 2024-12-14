import { User } from "@prisma/client";
import * as bcrypt from 'bcryptjs';
import { LoginBody, SingUpBody } from "../type/AuthenticateRequest";
import UserRepository from "./userRepository";

const userRepository = UserRepository.getInstance();

export default class UserService {
  async login(param: LoginBody): Promise<User> {
    const { mailAddress, password } = param;
    const user = await userRepository.findByMailAddress(mailAddress);
    if (!await this.comparePassword(password, user.password)) {
      throw new Error('Invalid Password');
    }
    return user;
  }

  async signUp(param: SingUpBody): Promise<User> {
    const { mailAddress, password, name } = param;
    const registerDate = new Date();
    // TODO: mailAddressのバリデーションとパスワードのポリシーチェック
    const newUser = { name, mailAddress, password: this.hashPassword(password), registerDate }
    return await userRepository.create(newUser);
  }

  async get(id: string): Promise<User> { 
    return await userRepository.findOneById(id);
  }

  async upsert(user: User): Promise<User> {
    if (user.id) {
      return await userRepository.update(user);
    } else {
      return await userRepository.create(user);
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
    return await bcrypt.compare(password, hashed);
  };
}
