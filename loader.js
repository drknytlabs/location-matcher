const XLSX = require('xlsx');
const path = require('path');

function loadResidentData() {
  const filePath = path.join(__dirname, 'data.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  return data.map(row => ({
    address: row.Address || '',
    resident: row.Resident || '',
    deed: row.Subdivision || '', // You can change this if deed is a separate column
    lat: parseFloat(row.Latitude),
    lng: parseFloat(row.Longitude)
  }));
}

module.exports = { loadResidentData };
