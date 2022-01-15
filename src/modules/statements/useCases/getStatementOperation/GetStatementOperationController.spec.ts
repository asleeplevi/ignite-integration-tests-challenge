import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
let connection: Connection;
describe("GetStatementOperationController", () => {
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

  it("should not be able to get statements without jwt token", async () => {
    const response = await request(app).get("/api/v1/statements/1234");

    expect(response.status).toBe(401);
  });

  it("should be able get statements", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "1234",
    });

    const statementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 20,
        description: "test",
      })
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${statementResponse.body.id}`)
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    expect(response.status).toBe(200);
  });
});
