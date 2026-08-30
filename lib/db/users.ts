import { ObjectId, type WithId } from "mongodb";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";
import type {
  CreateUserInput,
  User,
  UserDocument,
  UserRole,
} from "@/lib/types/user";

export const USERS_COLLECTION = "users";

function mapUser(doc: WithId<UserDocument>): User {
  return {
    id: doc._id.toString(),
    username: doc.username,
    name: doc.name,
    role: doc.role,
    active: doc.active,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function usersCollection() {
  const db = await getDb();
  return db.collection<UserDocument>(USERS_COLLECTION);
}

export async function ensureUsersIndexes() {
  const collection = await usersCollection();
  await collection.createIndex({ username: 1 }, { unique: true });
}

export async function listUsers(): Promise<User[]> {
  const collection = await usersCollection();
  const docs = await collection.find().sort({ username: 1 }).toArray();
  return docs.map(mapUser);
}

export async function getUserByUsername(
  username: string,
): Promise<WithId<UserDocument> | null> {
  const collection = await usersCollection();
  return collection.findOne({
    username: username.trim().toLowerCase(),
  });
}

export async function countUsers(): Promise<number> {
  const collection = await usersCollection();
  return collection.countDocuments();
}

export async function createUser(input: CreateUserInput): Promise<User> {
  await ensureUsersIndexes();
  const collection = await usersCollection();
  const username = input.username.trim().toLowerCase();
  const name = input.name.trim();
  const role: UserRole = input.role ?? "admin";

  if (!username || !input.password || !name) {
    throw new Error("username, password y name son obligatorios");
  }
  if (input.password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  const existing = await collection.findOne({ username });
  if (existing) {
    throw new Error("Ese usuario ya existe");
  }

  const now = new Date();
  const passwordHash = await bcrypt.hash(input.password, 12);
  const doc: Omit<UserDocument, "_id"> = {
    username,
    passwordHash,
    name,
    role,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as UserDocument);
  const inserted = await collection.findOne({ _id: result.insertedId });
  if (!inserted) throw new Error("No se pudo crear el usuario");
  return mapUser(inserted);
}

export async function updateUserPassword(
  id: string,
  password: string,
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }
  const collection = await usersCollection();
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { passwordHash, updatedAt: new Date() } },
  );
  return result.matchedCount === 1;
}

export async function setUserActive(
  id: string,
  active: boolean,
): Promise<User | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await usersCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { active, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return result ? mapUser(result) : null;
}

export async function deleteUser(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await usersCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function authenticateUser(
  username: string,
  password: string,
): Promise<User | null> {
  await ensureBootstrapAdmin();

  const doc = await getUserByUsername(username);
  if (!doc || !doc.active) return null;

  const ok = await bcrypt.compare(password, doc.passwordHash);
  if (!ok) return null;

  return mapUser(doc);
}

/**
 * Si no hay usuarios en Mongo, crea el primer admin desde ADMIN_USER / ADMIN_PASSWORD.
 * Solo corre una vez (bootstrap).
 */
export async function ensureBootstrapAdmin(): Promise<{ created: boolean }> {
  await ensureUsersIndexes();
  const total = await countUsers();
  if (total > 0) return { created: false };

  const username = process.env.ADMIN_USER?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "No hay usuarios en MongoDB. Configura ADMIN_USER y ADMIN_PASSWORD para crear el primero.",
    );
  }

  await createUser({
    username,
    password,
    name: "Administrador",
    role: "admin",
  });

  return { created: true };
}
