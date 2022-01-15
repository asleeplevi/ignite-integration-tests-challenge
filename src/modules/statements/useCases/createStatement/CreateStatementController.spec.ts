import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
let connection: Connection;
describe("CreateStatementController", () => {
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
  it("should not be able make any operation without jwt token", async () => {
    const response = await request(app).post("/api/v1/statements/deposit");

    expect(response.status).toBe(401);
  });

  it("should be able to create a deposit", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "1234",
    });

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 20,
        description: "test",
      })
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toEqual(20);
  });

  it("should be able to create a withdraw grant than available amount", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "1234",
    });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 21,
        description: "test",
      })
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Insufficient funds");
  });
});
