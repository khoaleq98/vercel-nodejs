const express = require("express");
const router = express.Router();
const credentials = require('./credentials.json')
const { google } = require("googleapis");
const product = require("./product");
const { log } = require("console");
const { createClient } = require("redis");

let customerData  = [];


const authClient = async () => {
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
  const rows = getRows.data.values
  if (!customerData.length) {
    for (const row of rows) {
      customerData = [...customerData, ...[{
        id: row[4],
        pre_name: row[0],
        name: row[1],
        company: row[2],
        level: row[3]
      }]
      ]
    }
  }
  console.log("Save data: ", customerData.length)
  return rows
}

router.get("/", async (req, res) => {
  const {
    googleSheets,
    auth
  } = await authClient();
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
    // const client = createClient({
    //   url: 'redis://default:585a80b40a904fc9bd8e24d0558d9a48@loved-doe-35622.upstash.io:35622'
    // });

    // client.on('error', err => console.log('Redis Client Error', err));
    let { id, password } = req.query;
    // await client.connect()
    // const  checkSubmited = await client.hGet('customer_submmited', `customer_id:${id}`);

    // if (checkSubmited) {
    //   return res.status(400).send('Khách mời đã checkin')
    // }

    // Write row(s) to spreadsheet
    const spreadsheetId = '1WuNzHrE9B4UIgtx5jLpcYyYMo_XyoRZVqL_lNv46ehQ' // write;
    if (!customerData.length) {
        await getRows();
    }
    const checkinPass = 'ademax_event'
    if (password.trim().toLowerCase() != checkinPass.trim().toLowerCase()) {
      console.log('password in valid: user id: ', id)
      return res.status(400).send('Id Hoặc mật khẩu không đúng')
    }

    const customer = customerData.find(item => item.id.toLowerCase() == id.trim().toLowerCase())
    if (!customer) return res.status(400).send('Id không đúng')
    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "Sheet1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[customer.pre_name, customer.name, customer.level, customer.company, id, 'Có']],
      },
    });
    // await client.hSet('customer_submmited', `customer_id:${id}`, 'true');
    // await client.disconnect();
    res.json({
      message: "Cảm ơn quý khách tham dự sự kiện!"
    })
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

router.get("/check", async (req, res) => {
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
    const client = createClient({
      url: 'redis://default:585a80b40a904fc9bd8e24d0558d9a48@loved-doe-35622.upstash.io:35622'
    });

    client.on('error', err => console.log('Redis Client Error', err));
    const { id } = req.query;
    await client.connect();
    const checkSubmited = await client.hGet('customer_submmited', `customer_id:${id}`);
    res.json({
      summited: checkSubmited
    })
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});




module.exports = (router);
