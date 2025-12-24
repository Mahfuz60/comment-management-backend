import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ReactionService } from "../src/services/reaction.service";
import { CommentModel } from "../src/models/comment.model";
import { CommentReactionModel } from "../src/models/commentReaction.model";

let mongod: MongoMemoryServer;

describe("ReactionService", () => {
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
    await CommentReactionModel.deleteMany({});
  });

  it("like -> increments likeCount and sets myReaction", async () => {
    const comment = await CommentModel.create({
      entityType: "post",
      entityId: "p1",
      parentId: null,
      authorId: new mongoose.Types.ObjectId(),
      content: "hello"
    });

    const userId = new mongoose.Types.ObjectId().toString();

    const r = await ReactionService.react({ commentId: comment._id.toString(), userId, action: "like" });
    expect(r.likeCount).toBe(1);
    expect(r.dislikeCount).toBe(0);
    expect(r.myReaction).toBe("like");
  });

  it("like again -> toggles clear and decrements likeCount", async () => {
    const comment = await CommentModel.create({
      entityType: "post",
      entityId: "p1",
      parentId: null,
      authorId: new mongoose.Types.ObjectId(),
      content: "hello"
    });

    const userId = new mongoose.Types.ObjectId().toString();

    await ReactionService.react({ commentId: comment._id.toString(), userId, action: "like" });
    const r2 = await ReactionService.react({ commentId: comment._id.toString(), userId, action: "like" });

    expect(r2.likeCount).toBe(0);
    expect(r2.dislikeCount).toBe(0);
    expect(r2.myReaction).toBe(null);
  });

  it("like -> dislike switch updates both counts", async () => {
    const comment = await CommentModel.create({
      entityType: "post",
      entityId: "p1",
      parentId: null,
      authorId: new mongoose.Types.ObjectId(),
      content: "hello"
    });

    const userId = new mongoose.Types.ObjectId().toString();

    await ReactionService.react({ commentId: comment._id.toString(), userId, action: "like" });
    const r2 = await ReactionService.react({ commentId: comment._id.toString(), userId, action: "dislike" });

    expect(r2.likeCount).toBe(0);
    expect(r2.dislikeCount).toBe(1);
    expect(r2.myReaction).toBe("dislike");
  });
});
