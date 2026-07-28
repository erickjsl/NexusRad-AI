// ==========================================================================
// NexusRad AI - Native Binary DICOM (.dcm) Parser & Pixel Renderer
// Correct 8-bit / 16-bit Endian DataView Pixel Extraction & Canvas Scaling
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
  const bitsAllocated = dataSet.uint16('x00280100') || 16;
  const pixelRepresentation = dataSet.uint16('x00280103') || 0; // 0 = unsigned, 1 = signed

  // Extract Pixel Data safely using DataView to handle odd byte offsets
  const pixelElement = dataSet.elements.x7fe00010;
  let pixelData = null;

  if (pixelElement && pixelElement.length > 0) {
    try {
      const dataView = new DataView(byteArray.buffer, byteArray.byteOffset + pixelElement.dataOffset, pixelElement.length);
      const numPixels = rows * cols;
      pixelData = new Int32Array(numPixels);

      if (bitsAllocated === 8) {
        for (let i = 0; i < numPixels && i < pixelElement.length; i++) {
          pixelData[i] = dataView.getUint8(i);
        }
      } else {
        // 16-bit Little Endian (Standard DICOM Explicit VR)
        const isLittleEndian = true;
        for (let i = 0; i < numPixels && (i * 2 + 1) < pixelElement.length; i++) {
          if (pixelRepresentation === 1) {
            pixelData[i] = dataView.getInt16(i * 2, isLittleEndian);
          } else {
            pixelData[i] = dataView.getUint16(i * 2, isLittleEndian);
          }
        }
      }
    } catch (err) {
      console.warn("Could not read raw pixel stream directly, fallback to image renderer:", err);
      pixelData = null;
    }
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

  const ww = options.windowWidth || windowWidth || 400;
  const wl = options.windowLevel || windowCenter || 40;

  const lowerBound = wl - ww / 2;
  const upperBound = wl + ww / 2;

  const totalPixels = rows * cols;
  if (pixelData.length < totalPixels) return false;

  for (let i = 0; i < totalPixels; i++) {
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
