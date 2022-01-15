import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";

let connection: Connection;
describe("ShowUserProfileController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      email: "test@email.com",
      name: "test",
      password: "1234",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should not be able get user profile without token", async () => {
    const response = await request(app).post("/api/v1/profile").send({
      id: "1234",
    });

    expect(response.status).toBe(401);
  });

  it("should be able get user profile", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "1234",
    });

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });
});
