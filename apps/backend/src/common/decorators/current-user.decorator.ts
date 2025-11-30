import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUser {
  userId: string;
  email: string;
}

function isCurrentUser(user: unknown): user is CurrentUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'userId' in user &&
    'email' in user &&
    typeof user.userId === 'string' &&
    typeof user.email === 'string'
  );
}

export const GetCurrentUser = createParamDecorator(
  (data: keyof CurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: unknown = request.user;

    if (!isCurrentUser(user)) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
