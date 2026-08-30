import { MongoClient, type Db } from "mongodb";

/**
 * Usa MONGODB_URI en servidor (recomendado). También lee NEXT_PUBLIC_MONGO_DB
 * por compatibilidad, pero esa variable expone el string al cliente — muévelo
 * a MONGODB_URI cuando puedas.
 */
function getMongoUri(): string | undefined {
  return process.env.MONGODB_URI ?? process.env.NEXT_PUBLIC_MONGO_DB;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      "Falta MONGODB_URI (o NEXT_PUBLIC_MONGO_DB) en variables de entorno.",
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = MongoClient.connect(uri);
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    clientPromise = MongoClient.connect(uri);
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  const dbName = process.env.MONGODB_DB_NAME;
  return dbName ? client.db(dbName) : client.db();
}

export const PLAYERS_COLLECTION = "players";
export const USERS_COLLECTION = "users";
