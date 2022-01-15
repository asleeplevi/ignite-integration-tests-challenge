import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
let connection: Connection;
describe("AuthenticateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  it("should not be able a create a session with wrong password", async () => {
    await request(app).post("/api/v1/users").send({
      email: "test@email.com",
      name: "test",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "4321",
    });

    expect(response.status).toBe(401);
  });

  it("should be able a create a session", async () => {
    await request(app).post("/api/v1/users").send({
      email: "test@email.com",
      name: "test",
      password: "1234",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "1234",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
  });
});
