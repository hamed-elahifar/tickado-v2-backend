import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { INestApplication } from '@nestjs/common';

export class MongoMemoryDatabase {
  private static mongod: MongoMemoryServer;

  static async start(): Promise<string> {
    this.mongod = await MongoMemoryServer.create();
    return this.mongod.getUri();
  }

  static async stop(): Promise<void> {
    await this.mongod.stop();
  }

  static async cleanup(
    app: INestApplication,
    connection: Connection,
  ): Promise<void> {
    if (connection) {
      const collections = connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    }
  }
}
