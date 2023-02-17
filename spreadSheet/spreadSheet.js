const { google } = require('googleapis');
const sheets = google.sheets('v4');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    keyFilePath: "../credentials.json"
  });
  const authToken = await auth.getClient();
  return authToken;
}

async function getSpreadSheet({spreadsheetId, auth}) {
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    auth,
  });
  return res;
}

async function getSpreadSheetValues({spreadsheetId, auth, sheetName}) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    auth,
    range: sheetName
  });
  return res;
}

async function postSpreadSheetValues({spreadsheetId, auth, sheetName, data = []}) {
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    auth,
    range: sheetName,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        data
      ]
    }
  })

  return res;
}


module.exports = {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues,
  postSpreadSheetValues
}