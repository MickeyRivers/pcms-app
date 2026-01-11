/**
 * PCMS Field Data Collector - Google Apps Script
 * Automatically generates PDF certificates and uploads to Dropbox
 */

// ============================================
// CONFIGURATION
// ============================================

const DROPBOX_ACCESS_TOKEN = 'YOUR_DROPBOX_ACCESS_TOKEN_HERE'; // Get from https://www.dropbox.com/developers/apps

// Certificate header information
const CERT_HEADER = {
  company: 'PCMS',
  contact: 'Mick@flow-cert.com',
  website: 'flow-cert.com',
  phone: '(555) 123-4567' // Update with your actual phone
};

// Column indices (0-based) - Update these if your columns change
const COLUMNS = {
  date: 0,
  customer: 1,
  facility: 2,
  waterWastewater: 3,
  serviceType: 4,
  manufacturer: 5,
  serialNumber: 6,
  meterReading: 7,
  methodOfVerification: 8,
  calibrationAdjustments: 9,
  programmingChanges: 10,
  pipeMaterial: 11,
  pipeSize: 12,
  primaryDeviceType: 13,
  range: 14,
  units: 15,
  measurementType: 16,
  // Closed Pipe - Before
  closedPipeValidatingFlowBefore: 17,
  closedPipeCustomerFlowBefore: 18,
  // Closed Pipe - After
  closedPipeValidatingFlowAfter: 19,
  closedPipeCustomerFlowAfter: 20,
  // Open Channel - Before
  openChannelLevelInChannelBefore: 21,
  openChannelLevelOnMeterBefore: 22,
  // Open Channel - After
  openChannelLevelInChannelAfter: 23,
  openChannelLevelOnMeterAfter: 24,
  // Chart Recorder - Before
  chartRecorderMeterBefore: 25,
  chartRecorderChartBefore: 26,
  // Chart Recorder - After
  chartRecorderMeterAfter: 27,
  chartRecorderChartAfter: 28,
  // Loop Test
  loopTestDesiredLow: 29,
  loopTestMeasuredLow: 30,
  loopTestDesiredMid: 31,
  loopTestMeasuredMid: 32,
  loopTestDesiredHigh: 33,
  loopTestMeasuredHigh: 34,
  notes: 35,
  testedBy: 36,
  photo1: 37,
  photo2: 38,
  photo3: 39,
  makeCert: 40 // Checkbox column - "Make the Cert!" is column 41 (index 40)
};

// ============================================
// MENU SETUP & TRIGGERS
// ============================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎓 PCMS Certificates')
    .addItem('⚙️ Install Trigger (First Time Setup)', 'installTrigger')
    .addItem('Setup Instructions', 'showInstructions')
    .addToUi();
}

/**
 * Install the onEdit trigger with full permissions
 * This replaces the simple trigger with an installable trigger that can access DocumentApp
 */
function installTrigger() {
  try {
    // Delete any existing onEdit triggers to avoid duplicates
    const triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === 'onEditInstallable') {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }

    // Create new installable trigger
    ScriptApp.newTrigger('onEditInstallable')
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onEdit()
      .create();

    SpreadsheetApp.getUi().alert('✅ Trigger installed successfully!\n\nYou can now use the "Make the Cert!" checkbox to generate certificates.\n\nYou only need to do this once.');
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Installation failed: ' + error.message);
  }
}

/**
 * Installable trigger when checkbox is clicked
 * This runs automatically when you check the "Make the Cert!" box
 * IMPORTANT: This is an installable trigger (not a simple trigger) so it has full permissions
 */
function onEditInstallable(e) {
  // Debug logging
  Logger.log('onEditInstallable triggered');
  Logger.log('Column edited: ' + e.range.getColumn());
  Logger.log('Row edited: ' + e.range.getRow());
  Logger.log('Value: ' + e.value);
  Logger.log('Expected column: ' + (COLUMNS.makeCert + 1));

  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const row = range.getRow();
  const col = range.getColumn();

  // Only trigger if:
  // 1. Edit is in the "Make the Cert!" column (column 41)
  // 2. Row is 4 or greater (data rows)
  // 3. Value is TRUE (checkbox checked)
  if (col === COLUMNS.makeCert + 1 && row >= 4 && e.value === 'TRUE') {
    Logger.log('All conditions met - generating certificate');
    // Generate certificate for this row
    generateCertificate(sheet, row);
  } else {
    Logger.log('Conditions not met - col: ' + col + ', expected: ' + (COLUMNS.makeCert + 1) + ', row: ' + row + ', value: ' + e.value);
  }
}

// ============================================
// CERTIFICATE GENERATION
// ============================================

/**
 * Generate a single certificate for a specific row
 * Called automatically by onEdit trigger when checkbox is checked
 */
function generateCertificate(sheet, rowNumber) {
  const ui = SpreadsheetApp.getUi();

  try {
    // Get row data
    const rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Extract data
    const data = {
      date: rowData[COLUMNS.date] || '',
      customer: rowData[COLUMNS.customer] || '',
      facility: rowData[COLUMNS.facility] || '',
      waterWastewater: rowData[COLUMNS.waterWastewater] || '',
      serviceType: rowData[COLUMNS.serviceType] || '',
      manufacturer: rowData[COLUMNS.manufacturer] || '',
      serialNumber: rowData[COLUMNS.serialNumber] || '',
      meterReading: rowData[COLUMNS.meterReading] || '',
      methodOfVerification: rowData[COLUMNS.methodOfVerification] || '',
      calibrationAdjustments: rowData[COLUMNS.calibrationAdjustments] || '',
      programmingChanges: rowData[COLUMNS.programmingChanges] || '',
      pipeMaterial: rowData[COLUMNS.pipeMaterial] || '',
      pipeSize: rowData[COLUMNS.pipeSize] || '',
      primaryDeviceType: rowData[COLUMNS.primaryDeviceType] || '',
      range: rowData[COLUMNS.range] || '',
      units: rowData[COLUMNS.units] || '',
      measurementType: rowData[COLUMNS.measurementType] || '',
      notes: rowData[COLUMNS.notes] || '',
      testedBy: rowData[COLUMNS.testedBy] || ''
    };

    // Create PDF
    const pdf = createPDF(data, rowData);

    // Upload to Dropbox
    uploadToDropbox(pdf, data);

    // Uncheck the checkbox
    sheet.getRange(rowNumber, COLUMNS.makeCert + 1).setValue(false);

    ui.alert(`Certificate generated and uploaded to Dropbox!\nCustomer: ${data.customer}\nFacility: ${data.facility}`);

  } catch (error) {
    ui.alert(`Error generating certificate: ${error.message}`);
    Logger.log('Error: ' + error.toString());
  }
}

// ============================================
// PDF GENERATION
// ============================================

/**
 * Create PDF certificate
 */
function createPDF(data, rowData) {
  // Create a new Google Doc (temporary)
  const doc = DocumentApp.create(`TEMP_${data.customer}_${data.facility}_Certificate`);
  const body = doc.getBody();

  // Clear existing content
  body.clear();

  // Add header
  const header = body.appendParagraph('CALIBRATION CERTIFICATE');
  header.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  header.setFontSize(18);
  const headerText = header.editAsText();
  headerText.setBold(0, headerText.getText().length - 1, true);

  body.appendParagraph(''); // Spacing

  // Contact info
  const contact = body.appendParagraph(`${CERT_HEADER.company} | ${CERT_HEADER.contact} | ${CERT_HEADER.website}`);
  contact.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  contact.setFontSize(10);

  body.appendParagraph(''); // Spacing
  body.appendHorizontalRule();
  body.appendParagraph(''); // Spacing

  // Service Information
  addField(body, 'Date', formatDate(data.date));
  addField(body, 'Customer', data.customer);
  addField(body, 'Facility/Location', data.facility);
  addField(body, 'Water/Wastewater', data.waterWastewater);
  addField(body, 'Service Type', data.serviceType);
  addField(body, 'Manufacturer/Model', data.manufacturer);
  addField(body, 'Serial Number', data.serialNumber);
  addField(body, 'Meter Reading', data.meterReading);
  addField(body, 'Method of Verification', data.methodOfVerification);

  body.appendParagraph(''); // Spacing

  // Service-specific data
  const serviceType = data.serviceType.toLowerCase();

  if (serviceType.includes('closed pipe')) {
    addServiceSection(body, 'FLOW RATE COMPARISON');

    // Get values
    const valFlow = rowData[COLUMNS.closedPipeValidatingFlowBefore] || 'N/A';
    const cusFlow = rowData[COLUMNS.closedPipeCustomerFlowBefore] || 'N/A';

    // Calculate accuracy
    let accuracy = 'N/A';
    try {
      if (valFlow !== 'N/A' && cusFlow !== 'N/A') {
        const valNum = parseFloat(valFlow);
        const cusNum = parseFloat(cusFlow);
        if (valNum !== 0) {
          accuracy = ((cusNum / valNum) * 100).toFixed(1) + '%';
        }
      }
    } catch (e) {
      accuracy = 'N/A';
    }

    addMeasurementTable(body, [
      ['Validating Meter (GPM)', 'Customer Meter (GPM)', 'Accuracy'],
      [valFlow, cusFlow, accuracy]
    ]);
    addField(body, 'Pipe Material', data.pipeMaterial);
    addField(body, 'Pipe Size (O.D.)', data.pipeSize);
  }

  if (serviceType.includes('open channel')) {
    addServiceSection(body, 'LEVEL MEASUREMENTS');

    // Get values
    const beforeVal = rowData[COLUMNS.openChannelLevelInChannelBefore] || 'N/A';
    const afterVal = rowData[COLUMNS.openChannelLevelOnMeterAfter] || 'N/A';

    // Calculate % difference
    let percentDiff = 'N/A';
    try {
      if (beforeVal !== 'N/A' && afterVal !== 'N/A') {
        const beforeNum = parseFloat(beforeVal);
        const afterNum = parseFloat(afterVal);
        if (beforeNum !== 0) {
          const diff = Math.abs(afterNum - beforeNum) / beforeNum * 100;
          percentDiff = diff.toFixed(1) + '%';
        }
      }
    } catch (e) {
      percentDiff = 'N/A';
    }

    addMeasurementTable(body, [
      ['Before Adjustment', 'After Adjustment', '% Difference'],
      [beforeVal, afterVal, percentDiff]
    ]);
    addField(body, 'Primary Device Type', data.primaryDeviceType);
  }

  if (serviceType.includes('chart recorder')) {
    addServiceSection(body, 'CHART RECORDER TEST RESULTS');

    // Get values
    const meterBefore = rowData[COLUMNS.chartRecorderMeterBefore] || 'N/A';
    const chartBefore = rowData[COLUMNS.chartRecorderChartBefore] || 'N/A';
    const meterAfter = rowData[COLUMNS.chartRecorderMeterAfter] || 'N/A';
    const chartAfter = rowData[COLUMNS.chartRecorderChartAfter] || 'N/A';

    // Calculate % difference for before
    let percentDiffBefore = 'N/A';
    try {
      if (meterBefore !== 'N/A' && chartBefore !== 'N/A') {
        const meterNum = parseFloat(meterBefore);
        const chartNum = parseFloat(chartBefore);
        if (chartNum !== 0) {
          const diff = Math.abs(meterNum - chartNum) / chartNum * 100;
          percentDiffBefore = diff.toFixed(1) + '%';
        }
      }
    } catch (e) {
      percentDiffBefore = 'N/A';
    }

    // Calculate % difference for after
    let percentDiffAfter = 'N/A';
    try {
      if (meterAfter !== 'N/A' && chartAfter !== 'N/A') {
        const meterNum = parseFloat(meterAfter);
        const chartNum = parseFloat(chartAfter);
        if (chartNum !== 0) {
          const diff = Math.abs(meterNum - chartNum) / chartNum * 100;
          percentDiffAfter = diff.toFixed(1) + '%';
        }
      }
    } catch (e) {
      percentDiffAfter = 'N/A';
    }

    addMeasurementTable(body, [
      ['Measurement', 'Before Adjustment', 'After Adjustment', '% Difference (Before)', '% Difference (After)'],
      ['Value on Meter', meterBefore, meterAfter, percentDiffBefore, percentDiffAfter],
      ['Value on Chart Recorder', chartBefore, chartAfter, '', '']
    ]);
  }

  if (serviceType.includes('loop test')) {
    addServiceSection(body, 'LOOP TEST RESULTS');

    // Get values
    const desiredLow = rowData[COLUMNS.loopTestDesiredLow] || 'N/A';
    const measuredLow = rowData[COLUMNS.loopTestMeasuredLow] || 'N/A';
    const desiredMid = rowData[COLUMNS.loopTestDesiredMid] || 'N/A';
    const measuredMid = rowData[COLUMNS.loopTestMeasuredMid] || 'N/A';
    const desiredHigh = rowData[COLUMNS.loopTestDesiredHigh] || 'N/A';
    const measuredHigh = rowData[COLUMNS.loopTestMeasuredHigh] || 'N/A';

    // Calculate accuracy for Low point
    let accuracyLow = 'N/A';
    try {
      if (desiredLow !== 'N/A' && measuredLow !== 'N/A') {
        const desiredNum = parseFloat(desiredLow);
        const measuredNum = parseFloat(measuredLow);
        if (desiredNum !== 0) {
          accuracyLow = ((measuredNum / desiredNum) * 100).toFixed(1) + '%';
        }
      }
    } catch (e) {
      accuracyLow = 'N/A';
    }

    // Calculate accuracy for Mid point
    let accuracyMid = 'N/A';
    try {
      if (desiredMid !== 'N/A' && measuredMid !== 'N/A') {
        const desiredNum = parseFloat(desiredMid);
        const measuredNum = parseFloat(measuredMid);
        if (desiredNum !== 0) {
          accuracyMid = ((measuredNum / desiredNum) * 100).toFixed(1) + '%';
        }
      }
    } catch (e) {
      accuracyMid = 'N/A';
    }

    // Calculate accuracy for High point
    let accuracyHigh = 'N/A';
    try {
      if (desiredHigh !== 'N/A' && measuredHigh !== 'N/A') {
        const desiredNum = parseFloat(desiredHigh);
        const measuredNum = parseFloat(measuredHigh);
        if (desiredNum !== 0) {
          accuracyHigh = ((measuredNum / desiredNum) * 100).toFixed(1) + '%';
        }
      }
    } catch (e) {
      accuracyHigh = 'N/A';
    }

    addMeasurementTable(body, [
      ['Point', 'Desired Output (mA)', 'Measured Output (mA)', 'Accuracy'],
      ['Low', desiredLow, measuredLow, accuracyLow],
      ['Mid', desiredMid, measuredMid, accuracyMid],
      ['High', desiredHigh, measuredHigh, accuracyHigh]
    ]);
  }

  body.appendParagraph(''); // Spacing

  // Additional Info
  addField(body, 'Calibration Adjustments', data.calibrationAdjustments);
  addField(body, 'Programming Changes', data.programmingChanges);
  addField(body, 'Range', data.range);
  addField(body, 'Units', data.units);
  addField(body, 'Measurement Type', data.measurementType);

  if (data.notes) {
    body.appendParagraph(''); // Spacing
    addField(body, 'Notes', data.notes);
  }

  body.appendParagraph(''); // Spacing
  body.appendHorizontalRule();

  // Technician signature
  const signature = body.appendParagraph(`Tested by: ${data.testedBy}`);
  const signatureText = signature.editAsText();
  signatureText.setBold(0, signatureText.getText().length - 1, true);

  // Save and convert to PDF
  doc.saveAndClose();

  const docFile = DriveApp.getFileById(doc.getId());
  const pdfBlob = docFile.getAs('application/pdf');

  // Delete temp doc
  DriveApp.getFileById(doc.getId()).setTrashed(true);

  return pdfBlob;
}

/**
 * Add a field to the document
 */
function addField(body, label, value) {
  if (!value || value === '') return;

  const para = body.appendParagraph(`${label}: ${value}`);
  const text = para.editAsText();
  text.setBold(0, label.length - 1, true);
}

/**
 * Add a service section header
 */
function addServiceSection(body, title) {
  body.appendParagraph(''); // Spacing
  const section = body.appendParagraph(title);
  section.setFontSize(14);
  const sectionText = section.editAsText();
  sectionText.setBold(0, sectionText.getText().length - 1, true);
  body.appendParagraph(''); // Spacing
}

/**
 * Add a simple measurement table
 */
function addMeasurementTable(body, data) {
  const table = body.appendTable(data);

  // Style header row
  const headerRow = table.getRow(0);
  for (let i = 0; i < headerRow.getNumCells(); i++) {
    headerRow.getCell(i).setBackgroundColor('#2d5016');
    headerRow.getCell(i).editAsText().setBold(true).setForegroundColor('#ffd60a');
  }

  return table;
}

/**
 * Format date for display
 */
function formatDate(date) {
  if (!date) return '';
  if (date instanceof Date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'MM/dd/yyyy');
  }
  return date.toString();
}

// ============================================
// DROPBOX UPLOAD
// ============================================

/**
 * Upload PDF to Dropbox
 */
function uploadToDropbox(pdfBlob, data) {
  // Check if access token is configured
  if (DROPBOX_ACCESS_TOKEN === 'YOUR_DROPBOX_ACCESS_TOKEN_HERE') {
    throw new Error('Please configure your Dropbox Access Token in the script. See Setup Instructions.');
  }

  // Create filename
  const year = new Date(data.date).getFullYear() || new Date().getFullYear();
  const filename = `${year}-${data.customer}-${data.facility}.pdf`.replace(/[^a-zA-Z0-9.-]/g, '_');

  // Dropbox API endpoint
  const url = 'https://content.dropboxapi.com/2/files/upload';

  // Dropbox API parameters
  const dropboxParams = {
    path: `/PCMS_Certificates/${filename}`,
    mode: 'add',
    autorename: true,
    mute: false
  };

  // Upload to Dropbox
  const options = {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${DROPBOX_ACCESS_TOKEN}`,
      'Dropbox-API-Arg': JSON.stringify(dropboxParams),
      'Content-Type': 'application/octet-stream'
    },
    payload: pdfBlob.getBytes(),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();

  if (responseCode !== 200) {
    throw new Error(`Dropbox upload failed: ${response.getContentText()}`);
  }

  Logger.log(`Successfully uploaded ${filename} to Dropbox`);
}

// ============================================
// INSTRUCTIONS
// ============================================

/**
 * Show setup instructions
 */
function showInstructions() {
  const ui = SpreadsheetApp.getUi();
  const instructions = `
PCMS Certificate Generator - Setup Instructions

1. GET DROPBOX ACCESS TOKEN:
   - Go to https://www.dropbox.com/developers/apps
   - Click "Create app"
   - Choose "Scoped access"
   - Choose "Full Dropbox"
   - Name it "PCMS Certificates"
   - Click "Create app"
   - In "Permissions" tab, enable "files.content.write"
   - In "Settings" tab, click "Generate access token"
   - Copy the token

2. ADD TOKEN TO SCRIPT:
   - In Google Sheets, go to Extensions > Apps Script
   - Find line 11: const DROPBOX_ACCESS_TOKEN = 'YOUR_DROPBOX_ACCESS_TOKEN_HERE';
   - Replace YOUR_DROPBOX_ACCESS_TOKEN_HERE with your actual token
   - Click Save

3. USAGE:
   - Enter your data in the spreadsheet
   - Use "PCMS Certificates" menu > "Make the Cert! (Selected Row)" for current row
   - OR check the checkbox and use "Make All Checked Certs" for multiple rows
   - Certificates will be uploaded to Dropbox/PCMS_Certificates folder

Need help? Contact support.
  `;

  ui.alert('Setup Instructions', instructions, ui.ButtonSet.OK);
}
