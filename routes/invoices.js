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
})


module.exports = router;