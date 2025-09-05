const express = require("express");
const router = express.Router();
const  credentials = require('./credentials.json')
const { google } = require("googleapis");

/**
 * GET product list.
 *
 * @return product list | empty.
 */

const readData = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const spreadsheetId = "1ZGE0jKyH5F-Z5vDSKzqo_e9eM4z6PDzkohI1MMly5to"; //read
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });
  const sheetName = metaData.data.properties.title;
  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1",
  });
  return {
    rows: getRows.data.values,
    sheetName,
  };
}

router.get("/", async (req, res) => {
  try {
    const {rows, sheetName} = await readData()
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    // another common pattern
    // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    res.json({
      rows,
      sheetName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});




module.exports = (router);
