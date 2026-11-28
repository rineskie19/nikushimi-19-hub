import { MongoClient, type Db } from "mongodb";

const state = globalThis as typeof globalThis & { nikushimiMongo?: Promise<MongoClient> };

export async function database(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Database connection is not configured.");
  if (!state.nikushimiMongo) {
    const client = new MongoClient(uri, { maxPoolSize: 8, serverSelectionTimeoutMS: 5000 });
    state.nikushimiMongo = client.connect().catch(async () => {
      state.nikushimiMongo = undefined;
      await client.close();
      throw new Error("The hub database is unavailable.");
    });
  }
  return (await state.nikushimiMongo).db(process.env.MONGODB_DB || "nikushimi_hub");
}
