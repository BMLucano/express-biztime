"use strict";

/** Routes about invoices */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/**GET /
 * Returns list of invoices, like {invoices: [{id, comp_code}, ...]}
*/

router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
    FROM invoices`);
  const invoices = results.rows;

  return res.json({ invoices });
});

/**GET /invoices/[id]
 * Returns obj on given invoice.
 * If invoice cannot be found, returns 404.
 * Returns
 * {invoice: {
 *    id,
 *    amt,
 *    paid,
 *    add_date,
 *    paid_date,
 *    company: {code, name, description}
 * }
 * */

router.get("/:id", async function(req,res){
  const id = req.params.id;
  const iResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
    FROM invoices
    WHERE id = $1`,
    [id]
  );
  const invoice = iResults.rows[0];
  if(!invoice) throw new NotFoundError(`No invoice matching: ${id}`);

  const cResults = await db.query(
    `SELECT code, name, description
    FROM companies
    WHERE code = $1`,
    [invoice.comp_code]
  )
  const company = cResults.rows[0];
  delete invoice.comp_code;

  invoice.company = company;
  return res.json({ invoice });
});

/**POST /invoices
 * Adds an invoice.
 * Needs to be passed in JSON body of: {comp_code, amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.post("/", async function(req, res){
  if (req.body === undefined
    || !("comp_code" in req.body)
    || !("amt" in req.body)
  ) {
    throw new BadRequestError("Need to provide valid json");
  }

  const { comp_code, amt } = req.body;

  try {
    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, Number(amt)]
    );

    const invoice = results.rows[0];

    return res.json({ invoice });
  }
  catch(err){
    throw new BadRequestError(); //currently handles comp_code not matching
  }
});

/**
 * PUT /invoices/[id]
 * Updates an invoice.
 * If invoice cannot be found, returns a 404.
 * Needs to be passed in a JSON body of {amt}
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.put("/:id", async function(req, res){
  const id = req.params.id;
  const { amt } = req.body;

  const results = await db.query(
    `UPDATE invoices
    SET amt = $1
    WHERE id = $2
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [Number(amt), id]
  );

  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No invoice matching: ${id}`);

  return res.json({ invoice });
});


module.exports = router;