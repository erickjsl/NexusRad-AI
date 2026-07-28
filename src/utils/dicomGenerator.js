// ==========================================================================
// NexusRad AI - DICOM Engine & Procedural Canvas Renderer
// ==========================================================================

/**
 * Render procedural DICOM image based on modality and slice index
 */
export function renderDicomSlice(canvas, study, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width || 512;
  const height = canvas.height || 512;
  
  const {
    sliceIndex = 1,
    windowWidth = 400,
    windowLevel = 40,
    inverted = false,
    showAiOverlay = false,
    zoom = 1,
    pan = { x: 0, y: 0 },
    measurements = []
  } = options;

  // Clear background
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Apply Pan and Zoom
  ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
  ctx.scale(zoom, zoom);
  ctx.translate(-width / 2, -height / 2);

  // Generate modality image
  switch (study.modality) {
    case 'CT':
      drawChestCT(ctx, width, height, sliceIndex, windowWidth, windowLevel);
      break;
    case 'DX':
    case 'CR':
      drawChestXRay(ctx, width, height, windowWidth, windowLevel);
      break;
    case 'MR':
      drawKneeMRI(ctx, width, height, sliceIndex, windowWidth, windowLevel);
      break;
    case 'MG':
      drawMammogram(ctx, width, height, windowWidth, windowLevel);
      break;
    case 'US':
      drawUltrasound(ctx, width, height, sliceIndex);
      break;
    default:
      drawChestCT(ctx, width, height, sliceIndex, windowWidth, windowLevel);
  }

  // Invert colors if active
  if (inverted) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];     // Red
      data[i + 1] = 255 - data[i + 1]; // Green
      data[i + 2] = 255 - data[i + 2]; // Blue
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // Draw AI Bounding Box & Annotations
  if (showAiOverlay && study.aiFinding) {
    drawAiDetectionBox(ctx, width, height, study.aiFinding);
  }

  // Draw Measurement Overlays
  measurements.forEach(m => drawMeasurement(ctx, m));

  ctx.restore();
}

/**
 * Procedural Chest CT Generator (Axial Slice)
 */
function drawChestCT(ctx, w, h, slice, ww, wl) {
  const cx = w / 2;
  const cy = h / 2;
  const sliceRatio = slice / 32;

  // Windowing factor adjustment
  const contrast = Math.min(2.5, Math.max(0.5, 800 / Math.max(1, ww)));
  const brightness = Math.min(50, Math.max(-50, (wl - 40) * 0.1));

  // Body Outline (Soft Tissue)
  ctx.beginPath();
  ctx.ellipse(cx, cy, 210, 160, 0, 0, Math.PI * 2);
  const bodyGradient = ctx.createRadialGradient(cx, cy, 50, cx, cy, 210);
  bodyGradient.addColorStop(0, `rgb(${40 + brightness}, ${40 + brightness}, ${45 + brightness})`);
  bodyGradient.addColorStop(1, `rgb(${15 + brightness}, ${15 + brightness}, ${20 + brightness})`);
  ctx.fillStyle = bodyGradient;
  ctx.fill();
  ctx.strokeStyle = `rgba(180, 180, 190, ${0.4 * contrast})`;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Spine / Vertebra (Dense Bone - High HU)
  const spineY = cy + 100;
  ctx.beginPath();
  ctx.ellipse(cx, spineY, 28, 22, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgb(${220 * contrast}, ${220 * contrast}, ${225 * contrast})`;
  ctx.fill();
  
  // Spinal Canal
  ctx.beginPath();
  ctx.ellipse(cx, spineY - 2, 8, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#050505';
  ctx.fill();

  // Ribcage (Bones along body perimeter)
  ctx.fillStyle = `rgb(${200 * contrast}, ${200 * contrast}, ${200 * contrast})`;
  for (let a = -0.8; a <= 0.8; a += 0.25) {
    const rx1 = cx + Math.cos(a) * 195;
    const ry1 = cy + Math.sin(a) * 145;
    const rx2 = cx - Math.cos(a) * 195;
    ctx.beginPath();
    ctx.arc(rx1, ry1, 8, 0, Math.PI * 2);
    ctx.arc(rx2, ry1, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sternum (Front Bone)
  ctx.beginPath();
  ctx.ellipse(cx, cy - 145, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lungs (Hypodense - Air / Dark HU)
  const leftLungX = cx - 90;
  const rightLungX = cx + 90;
  const lungY = cy - 10;
  const lungRadiusX = 65 + Math.sin(sliceRatio * Math.PI) * 10;
  const lungRadiusY = 100 + Math.cos(sliceRatio * Math.PI) * 5;

  ctx.fillStyle = '#07090E';
  // Left Lung
  ctx.beginPath();
  ctx.ellipse(leftLungX, lungY, lungRadiusX, lungRadiusY, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Right Lung
  ctx.beginPath();
  ctx.ellipse(rightLungX, lungY, lungRadiusX, lungRadiusY, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Bronchovascular Tree (White streaks in lungs)
  ctx.strokeStyle = `rgba(160, 170, 180, ${0.5 * contrast})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(leftLungX + 20, lungY);
    ctx.quadraticCurveTo(leftLungX - 20, lungY - 30 + i * 15, leftLungX - 45, lungY - 40 + i * 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightLungX - 20, lungY);
    ctx.quadraticCurveTo(rightLungX + 20, lungY - 30 + i * 15, rightLungX + 45, lungY - 40 + i * 20);
    ctx.stroke();
  }

  // Heart & Aorta (Mediastinum)
  ctx.beginPath();
  ctx.ellipse(cx - 20, cy + 15, 45, 55, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = `rgb(${70 + brightness}, ${70 + brightness}, ${80 + brightness})`;
  ctx.fill();

  // Simulated Lung Nodule / Effusion if slice 12-20
  if (slice >= 10 && slice <= 22) {
    ctx.beginPath();
    ctx.arc(rightLungX + 25, lungY + 30, 12, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${150 * contrast}, ${150 * contrast}, ${160 * contrast})`;
    ctx.fill();
  }
}

/**
 * Procedural Chest X-Ray Generator
 */
function drawChestXRay(ctx, w, h, ww, wl) {
  const cx = w / 2;
  const cy = h / 2;
  const contrast = Math.min(2.5, Math.max(0.5, 1000 / Math.max(1, ww)));

  // Body Silhouette
  ctx.fillStyle = '#0A0C10';
  ctx.fillRect(0, 0, w, h);

  // Thoracic Cavity
  ctx.beginPath();
  ctx.ellipse(cx, cy, 180, 210, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgb(${30 * contrast}, ${35 * contrast}, ${45 * contrast})`;
  ctx.fill();

  // Lungs
  ctx.fillStyle = '#040508';
  ctx.beginPath();
  ctx.ellipse(cx - 80, cy - 20, 60, 140, -0.05, 0, Math.PI * 2);
  ctx.ellipse(cx + 80, cy - 20, 60, 140, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Clavicles
  ctx.strokeStyle = `rgb(${210 * contrast}, ${210 * contrast}, ${220 * contrast})`;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(cx - 160, cy - 160);
  ctx.quadraticCurveTo(cx - 80, cy - 180, cx - 10, cy - 145);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + 160, cy - 160);
  ctx.quadraticCurveTo(cx + 80, cy - 180, cx + 10, cy - 145);
  ctx.stroke();

  // Ribcage Pairs
  ctx.lineWidth = 4;
  for (let i = 0; i < 9; i++) {
    const yOffset = cy - 120 + i * 28;
    ctx.beginPath();
    ctx.arc(cx - 80, yOffset, 65, -0.4, 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 80, yOffset, 65, Math.PI - 0.4, Math.PI + 0.4);
    ctx.stroke();
  }

  // Cardiac Silhouette (Heart)
  ctx.beginPath();
  ctx.ellipse(cx - 25, cy + 30, 65, 75, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(180, 185, 195, ${0.45 * contrast})`;
  ctx.fill();

  // Spine (Vertebral Column)
  ctx.fillStyle = `rgb(${190 * contrast}, ${190 * contrast}, ${200 * contrast})`;
  for (let y = cy - 170; y < cy + 180; y += 18) {
    ctx.fillRect(cx - 10, y, 20, 14);
  }
}

/**
 * Procedural Knee MRI Generator
 */
function drawKneeMRI(ctx, w, h, slice, ww, wl) {
  const cx = w / 2;
  const cy = h / 2;

  ctx.fillStyle = '#020305';
  ctx.fillRect(0, 0, w, h);

  // Soft tissue outline
  ctx.beginPath();
  ctx.ellipse(cx, cy, 140, 180, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#1E2430';
  ctx.fill();

  // Femur (Top Bone)
  ctx.beginPath();
  ctx.ellipse(cx, cy - 85, 75, 65, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#808A9E';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy - 85, 55, 45, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#10141D';
  ctx.fill();

  // Tibia (Bottom Bone)
  ctx.beginPath();
  ctx.ellipse(cx, cy + 90, 85, 60, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#808A9E';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + 90, 65, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#10141D';
  ctx.fill();

  // Meniscus Medial (Triangular dark band)
  ctx.fillStyle = '#05070B';
  ctx.beginPath();
  ctx.moveTo(cx - 70, cy);
  ctx.lineTo(cx - 30, cy - 15);
  ctx.lineTo(cx - 30, cy + 15);
  ctx.closePath();
  ctx.fill();

  // Meniscal Tear Signal (White hyperintense line inside meniscus)
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 65, cy);
  ctx.lineTo(cx - 40, cy + 5);
  ctx.stroke();

  // Patella
  ctx.beginPath();
  ctx.ellipse(cx + 120, cy - 40, 25, 40, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#808A9E';
  ctx.fill();
}

/**
 * Procedural Mammogram Generator
 */
function drawMammogram(ctx, w, h, ww, wl) {
  const cx = w / 2;
  const cy = h / 2;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // Breast Parenchyma Contour
  ctx.beginPath();
  ctx.moveTo(40, 40);
  ctx.bezierCurveTo(w - 60, 60, w - 80, h - 80, 40, h - 40);
  ctx.closePath();
  const mammGrad = ctx.createRadialGradient(200, 250, 40, 200, 250, 220);
  mammGrad.addColorStop(0, '#5A6578');
  mammGrad.addColorStop(0.7, '#242C3A');
  mammGrad.addColorStop(1, '#080A0E');
  ctx.fillStyle = mammGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.stroke();

  // Fibroglandular Dense Tissue (White clouds)
  ctx.fillStyle = 'rgba(220, 225, 235, 0.4)';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(150 + i * 18, 180 + (i % 3) * 30, 35 - i * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Microcalcifications Group
  ctx.fillStyle = '#FFFFFF';
  for (let j = 0; j < 12; j++) {
    const rx = 240 + Math.random() * 25;
    const ry = 170 + Math.random() * 25;
    ctx.fillRect(rx, ry, 2, 2);
  }
}

/**
 * Procedural Ultrasound Generator
 */
function drawUltrasound(ctx, w, h, slice) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // US Sector Cone
  ctx.beginPath();
  ctx.moveTo(w / 2, 40);
  ctx.lineTo(w - 60, h - 40);
  ctx.arc(w / 2, 40, h - 80, 0.3, Math.PI - 0.3);
  ctx.closePath();
  
  const usGrad = ctx.createRadialGradient(w / 2, 40, 20, w / 2, 40, h - 80);
  usGrad.addColorStop(0, '#101726');
  usGrad.addColorStop(0.5, '#2A364F');
  usGrad.addColorStop(1, '#0A0E17');
  ctx.fillStyle = usGrad;
  ctx.fill();

  // Speckle Noise simulation
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let k = 0; k < 300; k++) {
    const rx = w / 2 + (Math.random() - 0.5) * 260;
    const ry = 100 + Math.random() * (h - 180);
    ctx.fillRect(rx, ry, 1, 1);
  }
}

/**
 * Draw AI Detection Box Overlay
 */
function drawAiDetectionBox(ctx, w, h, aiFinding) {
  const box = aiFinding.box;
  const x = (box.x / 100) * w;
  const y = (box.y / 100) * h;
  const bw = (box.width / 100) * w;
  const bh = (box.height / 100) * h;

  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(x, y, bw, bh);
  ctx.setLineDash([]);

  // Tag Badge
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(x, y - 24, bw > 140 ? bw : 140, 22);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillText(`⚡ NEXUS AI: ${aiFinding.confidence}`, x + 6, y - 8);
}

/**
 * Draw Line / Angle / ROI Measurement on Canvas
 */
function drawMeasurement(ctx, m) {
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#00E5FF';
  ctx.font = '12px JetBrains Mono';

  if (m.type === 'line') {
    ctx.beginPath();
    ctx.moveTo(m.x1, m.y1);
    ctx.lineTo(m.x2, m.y2);
    ctx.stroke();
    // Handles
    ctx.arc(m.x1, m.y1, 4, 0, Math.PI * 2);
    ctx.arc(m.x2, m.y2, 4, 0, Math.PI * 2);
    ctx.fill();
    // Distance math
    const dist = Math.hypot(m.x2 - m.x1, m.y2 - m.y1) * 0.45; // mm scale
    ctx.fillText(`${dist.toFixed(1)} mm`, (m.x1 + m.x2) / 2 + 10, (m.y1 + m.y2) / 2);
  } else if (m.type === 'roi') {
    ctx.beginPath();
    ctx.ellipse(m.cx, m.cy, m.rx, m.ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillText(`ROI Area: ${(Math.PI * m.rx * m.ry * 0.2).toFixed(0)} mm²`, m.cx - m.rx, m.cy + m.ry + 16);
    ctx.fillText(`Mean HU: 42.5 ± 8.1`, m.cx - m.rx, m.cy + m.ry + 30);
  }
}
