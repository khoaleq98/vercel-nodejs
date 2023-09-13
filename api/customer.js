const express = require("express");
const router = express.Router();
const  credentials = require('./credentials.json')
const { google } = require("googleapis");
const product = require("./product");
const { log } = require("console");

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

const getRows = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const spreadsheetId = "16TYKzK1K4y-zZInyxBzGmzKXao0bPYBNbJ8qH5zbiPs"; //read
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
  return getRows.data.values
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
    const { id, password } = req.query;
    // Write row(s) to spreadsheet
    const spreadsheetId =  '1cpoR986WLMyMRhPsYuGvZ3J9q7oYZmiGBNspci428DE' // write;
    const rows = await getRows();
    const customer = rows.find(item => item[4].toLowerCase() == id.toLowerCase() && item[5].toLowerCase() == password.toLowerCase())
    if (!customer) return res.status(400)
    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "Sheet1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[ customer[0] , customer[2] , customer[3], customer[1], id, 'Có']],
      },
    });

    res.json({
      message: "Cảm ơn quý khách tham dự sự kiện!"
    })
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});




module.exports = (router);
