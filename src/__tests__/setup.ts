import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  // Replica set is required for multi-document transactions
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
  // Wait for collections/indexes to exist so the first transaction doesn't race collection creation
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}, 60_000); // allow up to 60s for replica set init

afterEach(async () => {
  // Wipe all collections between tests for isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet.stop();
});
