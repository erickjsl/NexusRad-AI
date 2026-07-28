// ==========================================================================
// NexusRad AI - Native Binary DICOM (.dcm) Parser & Pixel Renderer
// Strict Transfer Syntax Check (Compressed vs Uncompressed) & Embedded JPEG Extraction
// ==========================================================================

import dicomParser from 'dicom-parser';

/**
 * Extract embedded JPEG (0xFF 0xD8 0xFF) or PNG (0x89 0x50 0x4E 0x47) from DICOM byte stream
 */
export function extractEmbeddedDicomImage(byteArray) {
  if (!byteArray || byteArray.length < 10) return null;

  // Search for JPEG Start of Image (SOI) marker: 0xFF 0xD8 0xFF
  for (let i = 0; i < byteArray.length - 4; i++) {
    if (byteArray[i] === 0xFF && byteArray[i + 1] === 0xD8 && byteArray[i + 2] === 0xFF) {
      let endIdx = byteArray.length;
      for (let j = i + 3; j < byteArray.length - 1; j++) {
        if (byteArray[j] === 0xFF && byteArray[j + 1] === 0xD9) {
          endIdx = j + 2;
          break;
        }
      }

      const jpegBytes = byteArray.subarray(i, endIdx);
      if (jpegBytes.length > 1024) {
        return new Blob([jpegBytes], { type: 'image/jpeg' });
      }
    }
  }

  // Search for PNG marker: 0x89 0x50 0x4E 0x47
  for (let i = 0; i < byteArray.length - 8; i++) {
    if (byteArray[i] === 0x89 && byteArray[i + 1] === 0x50 && byteArray[i + 2] === 0x4E && byteArray[i + 3] === 0x47) {
      const pngBytes = byteArray.subarray(i);
      if (pngBytes.length > 1024) {
        return new Blob([pngBytes], { type: 'image/png' });
      }
    }
  }

  return null;
}

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
  const transferSyntax = dataSet.string('x00020010') || '';

  // Check if Transfer Syntax is uncompressed raw linear pixels
  const isUncompressed = !transferSyntax ||
    transferSyntax === '1.2.840.10008.1.2' ||
    transferSyntax === '1.2.840.10008.1.2.1' ||
    transferSyntax === '1.2.840.10008.1.2.2';

  // Extract Raw Pixel Data ONLY if transfer syntax is uncompressed
  const pixelElement = dataSet.elements.x7fe00010;
  let pixelData = null;

  if (isUncompressed && pixelElement && pixelElement.length > 0) {
    try {
      const dataView = new DataView(byteArray.buffer, byteArray.byteOffset + pixelElement.dataOffset, pixelElement.length);
      const numPixels = rows * cols;
      
      // Verify first bytes are not DICOM sequence item tags (0xFFFE E000)
      const firstTag = dataView.getUint16(0, true);
      if (firstTag !== 0xFFFE && firstTag !== 0xFEFF) {
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
      }
    } catch (err) {
      console.warn("Could not read raw pixel stream directly:", err);
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
    transferSyntax,
    pixelData
  };
}

/**
 * Render raw 16-bit DICOM pixel array to HTML5 Canvas with Dynamic Normalization
 */
export function renderRawDicomToCanvas(canvas, dicomObject, options = {}) {
  if (!canvas || !dicomObject || !dicomObject.pixelData) return false;

  const ctx = canvas.getContext('2d');
  const { rows, cols, pixelData } = dicomObject;

  if (!rows || !cols || rows < 10 || cols < 10) return false;

  canvas.width = cols;
  canvas.height = rows;

  const imgData = ctx.createImageData(cols, rows);
  const data = imgData.data;

  const totalPixels = rows * cols;
  if (pixelData.length < totalPixels) return false;

  // Calculate Dynamic Min / Max for optimal contrast
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < totalPixels; i++) {
    const val = pixelData[i];
    if (val < minVal) minVal = val;
    if (val > maxVal) maxVal = val;
  }

  if (maxVal === minVal || !isFinite(minVal) || !isFinite(maxVal)) return false;
  const range = maxVal - minVal;

  for (let i = 0; i < totalPixels; i++) {
    const rawVal = pixelData[i];
    let intensity = Math.round(((rawVal - minVal) / range) * 255);

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
