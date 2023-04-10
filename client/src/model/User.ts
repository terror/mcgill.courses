export interface User {
  id: string;
  mail: string;
}

export type UserResponse = {
  user: User;
};
