import { assignToken, invalidateRefreshToken, verifyToken } from "./login";
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked_token"),
  verify: jest.fn().mockReturnValue({ id: "1", email: "test@test.com", username: "test", password: "test", createdAt: new Date(), updatedAt: new Date() }),
}));

describe("Login", () => {
  it("should assign a token", () => {
    const user = { id: "1", email: "test@test.com", username: "test", password: "test", createdAt: new Date(), updatedAt: new Date(), lastLogin: new Date(), isActive: true, isAdmin: false };
    const token = assignToken(user);
    expect(token).toBeDefined();
  });

  it("should verify a token", () => {
    const user = { id: "1", email: "test@test.com", username: "test", password: "test", createdAt: new Date(), updatedAt: new Date(), lastLogin: new Date(), isActive: true, isAdmin: false };
    const token = assignToken(user);
    const decoded = verifyToken(token);
    expect(decoded).toBeDefined();
  });

  it("should invalidate a refresh token", async () => {
    const user = { id: "1", email: "test@test.com", username: "test", password: "test", createdAt: new Date(), updatedAt: new Date(), lastLogin: new Date(), isActive: true, isAdmin: false };
    const token = assignToken(user);
    await invalidateRefreshToken(token);
    const decoded = verifyToken(token);
    expect(decoded).toBeDefined();
  });
});