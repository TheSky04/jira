import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error("❌ .env dosyasındaki veritabanı bilgileri eksik!");
}

export const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    console.log("✅ MySQL veritabanına bağlanıldı.");
    return connection;
  } catch (error) {
    console.error("❌ Veritabanı bağlantı hatası:", error);
    process.exit(1);
  }
};
