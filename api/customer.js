const express = require("express");
const router = express.Router();
const  credentials = require('./credentials.json')
const { google } = require("googleapis");

const authClient = async() => {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });
  return {
    client,
    googleSheets,
    auth
  }
}

router.get("/", async (req, res) => {
  const {
    googleSheets,
    auth
  }= await authClient();
  try {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    // another common pattern
    // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    const { phone, name, company, email, id, come } = req.query;
    // Write row(s) to spreadsheet
    const spreadsheetId =  '1cpoR986WLMyMRhPsYuGvZ3J9q7oYZmiGBNspci428DE' // write;
    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "Sheet1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[ name , company , email, phone, id, come]],
      },
    });

    res.json({
      message: "Successfully submitted! Thank you!"
    })
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});




module.exports = (router);
