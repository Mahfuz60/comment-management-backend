"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const comment_service_1 = require("../src/services/comment.service");
const comment_model_1 = require("../src/models/comment.model");
const user_model_1 = require("../src/models/user.model");
let mongod;
describe("CommentService", () => {
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
        await user_model_1.UserModel.deleteMany({});
    });
    it("lists comments with basic DTO fields", async () => {
        const user = await user_model_1.UserModel.create({ name: "A", email: "a@a.com", passwordHash: "x" });
        await comment_model_1.CommentModel.create({
            entityType: "post",
            entityId: "p1",
            parentId: null,
            authorId: user._id,
            content: "c1"
        });
        const { totalCount, data } = await comment_service_1.CommentService.list({
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
//# sourceMappingURL=comment.service.test.js.map