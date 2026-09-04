import { Pool } from "@neondatabase/serverless";

let poolInstance: Pool | null = null;

function getPool(): Pool {
  if (!poolInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Please ensure environment variables are loaded."
      );
    }
    poolInstance = new Pool({ connectionString });
  }
  return poolInstance;
}

// Proxy to allow using pool as a regular object while delaying initialization
const pool = new Proxy({} as Pool, {
  get(target, prop) {
    const instance = getPool();
    const value = Reflect.get(instance, prop);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

export default pool;
