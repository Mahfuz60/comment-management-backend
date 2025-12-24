import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { CommentService } from "../src/services/comment.service";
import { CommentModel } from "../src/models/comment.model";
import { UserModel } from "../src/models/user.model";

let mongod: MongoMemoryServer;

describe("CommentService", () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    await CommentModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  it("lists comments with basic DTO fields", async () => {
    const user = await UserModel.create({ name: "A", email: "a@a.com", passwordHash: "x" });

    await CommentModel.create({
      entityType: "post",
      entityId: "p1",
      parentId: null,
      authorId: user._id,
      content: "c1"
    });

    const { totalCount, data } = await CommentService.list({
      entityType: "post",
      entityId: "p1",
      parentId: null,
      sort: "newest",
      skip: 0,
      limit: 10,
      userId: user._id.toString()
    });

    expect(totalCount).toBe(1);
    expect(data.length).toBe(1);
    expect(data[0].content).toBe("c1");
    expect(data[0].canEdit).toBe(true);
  });
});
