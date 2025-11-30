export class User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class UserSecret {
  userId: string;
  password: string;
}
