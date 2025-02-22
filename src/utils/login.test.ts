import { assignToken, verifyToken } from "./login";
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked_token"),
  verify: jest.fn().mockReturnValue({ id: "1", email: "test@test.com", username: "test", password: "test", createdAt: new Date(), updatedAt: new Date() }),
}));

describe("Login", () => {
  it("should assign a token", () => {
    const token = assignToken({ id: "1", email: "test@test.com", username: "test", password: "test", createdAt: new Date(), updatedAt: new Date() });
    expect(token).toBeDefined();
  });

  it("should verify a token", () => {
    const token = assignToken({ id: "1", email: "test@test.com", username: "test", password: "test", createdAt: new Date(), updatedAt: new Date() });
    const decoded = verifyToken(token);
    expect(decoded).toBeDefined();
  });
});