const express = require("express");
const router = express.Router();
const credentials = require('./credentials.json')
const { google } = require("googleapis");
const client = require('@upstash/redis')


/**
 * GET product list.
 *
 * @return product list | empty.
 */
let customerData = [];

const readData = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const spreadsheetId = "17eKlo8cvtabSUeS3xKFgishdgq-zbXrXiCm6uTuWHCo"; //read
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
  const rows = getRows.data.values
  // if (!customerData.length) {

  // }
  customerData = []
  for (const row of rows) {
    let index = 1

    customerData = [...customerData, ...[{
      id: row[4],
      pre_name: row[0],
      name: row[1],
      company: row[2],
      level: row[3],
      status: row[5],
      row_index: index
    }]
    ]
    index++;
  }
  console.log("Save data: ", customerData.length)


  return {
    rows: getRows.data.values,
    sheetName,
  };
}

router.get("/", async (req, res) => {
  try {
    const { rows, sheetName } = await readData()
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

router.get("/detail", async (req, res) => {
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
    const { id } = req.query;
    console.log({ id })

    const redis = new client.Redis({
      url: 'https://clear-lamprey-25211.upstash.io',
      token: 'AWJ7AAIncDEzZDUzNjNkOGQyYmU0MmVmYWQwZWI4ZWQxNjY4YjgyNHAxMjUyMTE',
    })

    const checkSubmited = await redis.hget('customer_submmited', `customer_id:${id}`);

    // if (checkSubmited) {
    //   return res.status(400).send('Khách mời đã checkin')
    // }
    if (!customerData || !customerData.length) {
      await readData()
    }

    customer = customerData.find(item => item.id == id)
    console.log({ customer })
    customer.status = checkSubmited ? "CHECKIN" : "VẮNG"
    res.json({
      customer
    })
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});




module.exports = (router);
