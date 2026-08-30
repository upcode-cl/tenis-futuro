export type UserRole = "admin" | "editor";

export type User = {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserDocument = {
  _id: import("mongodb").ObjectId;
  username: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  username: string;
  password: string;
  name: string;
  role?: UserRole;
};
