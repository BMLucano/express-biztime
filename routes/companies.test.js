"use strict";

const request = require("supertest");

const app = require('../app');
const db = require("../db");

let testCompanies;
let testInvoices;

beforeEach(async function() {
  await db.query(`DELETE FROM invoices`);

  await db.query(`DELETE FROM companies`);

  let companies = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('tst', 'Test', 'Is a test'),
    ('tst2', 'Test2', 'Is also a test')`);
  testCompanies = companies.rows;

  let invoices = await db.query(`
    INSERT INTO invoices (comp_code, amt, paid, paid_date)
    VALUES ('tst', 50, FALSE, NULL),
    ('tst', 75, TRUE, NULL),
    ('tst2', 30, FALSE, NULL)`);
  testInvoices = invoices.rows;
});

afterAll(async function() {
  await db.end();
});

describe("/GET company routes", function(){
  test("GET / should get all companies", async function(){
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({companies: [
      {code: "tst", name: "Test"},
      {code: "tst2", name: "Test2"}]
    });
  });
});

describe("POST /companies", function(){
  test("add new company", async function(){
    const resp = await request(app)
        .post("/companies")
        .send({code: "add", name: "testAdd", description: "added test"});
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({company: {code: "add", name: "testAdd", description: "added test"}})

    //test database
    const results = await db.query(
    `SELECT * FROM companies WHERE name = 'testAdd'`
    )
    expect(results.rows.length).toEqual(1);
  });

} )