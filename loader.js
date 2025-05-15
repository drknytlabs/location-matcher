const XLSX = require('xlsx');
const path = require('path');

function loadResidentData() {
  const filePath = path.join(__dirname, 'data.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const cleaned = rawData.map(row => {
    const lat = parseFloat(row['Latitude']);
    const lng = parseFloat(row['Longitude']);

    return {
      apn: row['APN / Parcel Number'] || '',
      apn_text: row['APN / Parcel Number (text)'] || '',
      site_address: row['Site Address'] || '',
      site_city: row['Site City'] || '',
      site_state: row['Site State'] || '',
      site_zip: row['Site Zip Code'] || '',
      county: row['County'] || '',
      lat,
      lng,
      carrier_route: row['Site Carrier Route'] || '',
      bedrooms: row['Bedrooms'] || '',
      baths: row['Baths'] || '',
      building_size: row['Building Size'] || '',
      lot_size_sqft: row['Lot Size (SqFt)'] || '',
      acreage: row['Acreage'] || '',
      property_type: row['Property Type'] || '',
      owner_occupied: row['Owner Occupied'] || '',
      first_name: row["1st Owner's First Name"] || '',
      last_name: row["1st Owner's Last Name"] || '',
      second_first: row["2nd Owner's First Name"] || '',
      second_last: row["2nd Owner's Last Name"] || '',
      spouse_first: row["Primary Owner's Spouse's First Name"] || '',
      spouse_middle: row["Primary Owner's Spouse's Middle Name"] || '',
      all_owners: row['All Owners'] || '',
      purchase_date: row['Purchase Date'] || '',
      purchase_price: row['Purchase Price'] || '',
      subdivision: row['Subdivision'] || '',
      year_built: row['Year Built'] || '',
      mailing_address: row['Mail Address'] || '',
      mailing_city: row['Mailing City'] || '',
      mailing_zip: row['Mailing Zip Code'] || '',
      mailing_state: row['Mailing State'] || '',
      mailing_zip_ext: row['Mailing Extended Zip Code'] || '',
      legal_desc: row['Legal Description'] || '',
      num_units: row['Number of Units'] || '',
      garage_type: row['Primary Garage Type'] || '',
      fireplace: row['Fireplace'] || '',
      view: row['View'] || '',
      pool: row['Pool'] || '',
      stories: row['Number Of Stories'] || '',
      zoning: row['Zoning Code'] || '',
      alt_apn: row['Alternate Parcel Number'] || '',
      tax_area: row['Tax Rate Area'] || '',
      census_tract: row['Census Tract'] || '',
      tax_delinquency_year: row['Most Recent Year of Tax Delinquency'] || '',
      delinquent_taxes: row['Amount of Delinquent Taxes'] || '',
      assessed_value: row['Assessed Value'] || '',
      market_value: row['Market Value (Assessed)'] || '',
      benuid: row['BENUID'] || '',
      notes: row['Notes'] || '',
 // Key fields for matching
      address: row['Site Address'] || '',
      resident: `${row["1st Owner's First Name"] || ''} ${row["1st Owner's Last Name"] || ''}`.trim(),
      deed: row['Subdivision'] || ''
    };
  });

  console.log('[✅ Loaded]', cleaned.length, 'records');
  console.log('[🔍 Sample]', cleaned[0]);

  return cleaned;
}

module.exports = { loadResidentData };