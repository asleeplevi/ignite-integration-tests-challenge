import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
let connection: Connection;
describe("CreateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  it("should not be able a create wihtout password", async () => {
    const response = await request(app).post("/api/v1/users").send({
      email: "test@email.com",
      name: "test",
    });

    expect(response.status).toBe(500);
  });
  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      email: "test@email.com",
      name: "test",
      password: "123",
    });

    expect(response.status).toBe(201);
  });
});
