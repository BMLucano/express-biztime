"use strict";

/** Routes about companies */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/**GET /
 * Returns list of companies, like {companies: [{code, name}, ...]}
*/
router.get("/", async function(req, res){
  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;

  return res.json({ companies });
})

/**GET /[code]
 * Return obj of company: {company: {code, name, description}}
 * Return 404 if company not found
 */
router.get("/:code", async function(req, res){
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description
        FROM companies
        WHERE code = $1`,
        [code]
  );
  const company = results.rows[0];

  if(!company) throw new NotFoundError(`No company matching ${code}`);

  return res.json({ company });
})

module.exports = router;