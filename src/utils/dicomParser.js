// ==========================================================================
// NexusRad AI - Native Binary DICOM (.dcm) Parser & Pixel Renderer
// ==========================================================================

import dicomParser from 'dicom-parser';

/**
 * Parse an ArrayBuffer containing a raw .dcm DICOM file
 */
export function parseDicomFile(arrayBuffer) {
  const byteArray = new Uint8Array(arrayBuffer);
  let dataSet;

  try {
    dataSet = dicomParser.parseDicom(byteArray);
  } catch (err) {
    console.error("Failed to parse binary DICOM tags:", err);
    return null;
  }

  // Extract DICOM Metadata Tags
  const patientName = dataSet.string('x00100010') || 'PACIENTE DICOM LOCAL';
  const patientId = dataSet.string('x00100020') || 'ID: DCM-LOCAL-99';
  const modality = dataSet.string('x00080060') || 'CT';
  const studyDescription = dataSet.string('x00081030') || 'EXAME DICOM IMPORTADO';
  const rows = dataSet.uint16('x00280010') || 512;
  const cols = dataSet.uint16('x00280011') || 512;
  const windowWidth = parseFloat(dataSet.string('x00281051') || '400');
  const windowCenter = parseFloat(dataSet.string('x00281050') || '40');
  const rescaleSlope = parseFloat(dataSet.string('x00281053') || '1');
  const rescaleIntercept = parseFloat(dataSet.string('x00281052') || '0');

  // Extract Pixel Data
  const pixelElement = dataSet.elements.x7fe00010;
  let pixelData = null;

  if (pixelElement) {
    const pixelBytes = byteArray.subarray(pixelElement.dataOffset, pixelElement.dataOffset + pixelElement.length);
    pixelData = new Int16Array(pixelBytes.buffer, pixelBytes.byteOffset, pixelBytes.length / 2);
  }

  return {
    patientName: cleanDicomString(patientName),
    patientId: cleanDicomString(patientId),
    modality: cleanDicomString(modality),
    studyDescription: cleanDicomString(studyDescription),
    rows,
    cols,
    windowWidth,
    windowCenter,
    rescaleSlope,
    rescaleIntercept,
    pixelData
  };
}

/**
 * Render raw 16-bit DICOM pixel array to HTML5 Canvas
 */
export function renderRawDicomToCanvas(canvas, dicomObject, options = {}) {
  if (!canvas || !dicomObject || !dicomObject.pixelData) return false;

  const ctx = canvas.getContext('2d');
  const { rows, cols, pixelData, windowWidth, windowCenter, rescaleSlope, rescaleIntercept } = dicomObject;

  canvas.width = cols;
  canvas.height = rows;

  const imgData = ctx.createImageData(cols, rows);
  const data = imgData.data;

  const ww = options.windowWidth || windowWidth;
  const wl = options.windowLevel || windowCenter;

  const lowerBound = wl - ww / 2;
  const upperBound = wl + ww / 2;

  const totalPixels = rows * cols;
  for (let i = 0; i < totalPixels; i++) {
    // Convert raw pixel value to Hounsfield Units (HU)
    const rawVal = pixelData[i];
    const huVal = rawVal * rescaleSlope + rescaleIntercept;

    let intensity = 0;
    if (huVal <= lowerBound) {
      intensity = 0;
    } else if (huVal >= upperBound) {
      intensity = 255;
    } else {
      intensity = Math.round(((huVal - lowerBound) / ww) * 255);
    }

    if (options.inverted) {
      intensity = 255 - intensity;
    }

    const idx = i * 4;
    data[idx] = intensity;     // R
    data[idx + 1] = intensity; // G
    data[idx + 2] = intensity; // B
    data[idx + 3] = 255;       // Alpha
  }

  ctx.putImageData(imgData, 0, 0);
  return true;
}

function cleanDicomString(str) {
  if (!str) return '';
  return str.replace(/\^/g, ' ').replace(/\0/g, '').trim();
}
