"use strict";

/** Routes about companies */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/**GET /
 * Returns list of companies, like {companies: [{code, name}, ...]}
*/

router.get("/", async function (req, res) {
  const results = await db.query(`SELECT code, name
    FROM companies`);
  const companies = results.rows;

  return res.json({ companies });
});

/**GET /[code]
 * Returns obj of company: {company: {code, name, description}}
 * Returns 404 if company not found
 */

router.get("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description
        FROM companies
        WHERE code = $1`,
    [code]
  );
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No company matching ${code}`);

  return res.json({ company });
});

/**POST /
 * Adds a company.
 * Needs to be given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
 */

router.post("/", async function (req, res) {
  if (req.body === undefined
    || !("name" in req.body)
    || !("description" in req.body)
    || !("code" in req.body)
  ) {
    throw new BadRequestError("Need to provide valid json");
  }

  const { code, name, description } = req.body;
  const results = await db.query(
    `INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`,
    [code, name, description]);
  const company = results.rows[0];
  return res.status(201).json({ company });
});

/**PUT /[code]
 * Edits existing company.
 * Returns 404 if company cannot be found.
 * Needs to be given JSON like: {name, description}
 * Returns update company object: {company: {code, name, description}}
 */

router.put("/:code", async function (req, res) {
  if (req.body === undefined
    || !("name"in req.body)
    || !("description" in req.body)
  ) {
    throw new BadRequestError("Need to provide valid json");
  }

  const code = req.params.code;
  const { name, description } = req.body;

  const results = await db.query(
    `UPDATE companies
        SET name = $1, description = $2
        WHERE code = $3
        RETURNING code, name, description`,
    [name, description, code]
  );

  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No company matching ${code}`);
  return res.json({ company });
});

/** DELETE /[code]
 * Deletes company.
 * Returns 404 if company cannot be found.
 * Returns {status: "deleted"} if successful*/

router.delete("/:code", async function(req,res){
  const code = req.params.code;
  const results = await db.query(
    `DELETE FROM companies
    WHERE code = $1
    RETURNING code` ,
    [code]
  );
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No company matching ${code}`);
  return res.json({ status: "deleted" });
})


module.exports = router;