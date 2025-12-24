"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const reaction_service_1 = require("../src/services/reaction.service");
const comment_model_1 = require("../src/models/comment.model");
const commentReaction_model_1 = require("../src/models/commentReaction.model");
let mongod;
describe("ReactionService", () => {
    beforeAll(async () => {
        mongod = await mongodb_memory_server_1.MongoMemoryServer.create();
        await mongoose_1.default.connect(mongod.getUri());
    });
    afterAll(async () => {
        await mongoose_1.default.disconnect();
        await mongod.stop();
    });
    beforeEach(async () => {
        await comment_model_1.CommentModel.deleteMany({});
        await commentReaction_model_1.CommentReactionModel.deleteMany({});
    });
    it("like -> increments likeCount and sets myReaction", async () => {
        const comment = await comment_model_1.CommentModel.create({
            entityType: "post",
            entityId: "p1",
            parentId: null,
            authorId: new mongoose_1.default.Types.ObjectId(),
            content: "hello"
        });
        const userId = new mongoose_1.default.Types.ObjectId().toString();
        const r = await reaction_service_1.ReactionService.react({ commentId: comment._id.toString(), userId, action: "like" });
        expect(r.likeCount).toBe(1);
        expect(r.dislikeCount).toBe(0);
        expect(r.myReaction).toBe("like");
    });
    it("like again -> toggles clear and decrements likeCount", async () => {
        const comment = await comment_model_1.CommentModel.create({
            entityType: "post",
            entityId: "p1",
            parentId: null,
            authorId: new mongoose_1.default.Types.ObjectId(),
            content: "hello"
        });
        const userId = new mongoose_1.default.Types.ObjectId().toString();
        await reaction_service_1.ReactionService.react({ commentId: comment._id.toString(), userId, action: "like" });
        const r2 = await reaction_service_1.ReactionService.react({ commentId: comment._id.toString(), userId, action: "like" });
        expect(r2.likeCount).toBe(0);
        expect(r2.dislikeCount).toBe(0);
        expect(r2.myReaction).toBe(null);
    });
    it("like -> dislike switch updates both counts", async () => {
        const comment = await comment_model_1.CommentModel.create({
            entityType: "post",
            entityId: "p1",
            parentId: null,
            authorId: new mongoose_1.default.Types.ObjectId(),
            content: "hello"
        });
        const userId = new mongoose_1.default.Types.ObjectId().toString();
        await reaction_service_1.ReactionService.react({ commentId: comment._id.toString(), userId, action: "like" });
        const r2 = await reaction_service_1.ReactionService.react({ commentId: comment._id.toString(), userId, action: "dislike" });
        expect(r2.likeCount).toBe(0);
        expect(r2.dislikeCount).toBe(1);
        expect(r2.myReaction).toBe("dislike");
    });
});
//# sourceMappingURL=reaction.service.test.js.map