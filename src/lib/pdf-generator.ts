import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export interface LandCertificateMetadata {
  ownerName: string;
  ownerId: string;
  landLocation: string;
  landArea: string;
  landType: string;
  certificateNumber: string;
  registryName: string;
  issueDate: string;
  serialNumber: string;
  batchId?: string;
  verifyBaseUrl?: string;
}

export class VeridexPdfGenerator {
  /**
   * Generates a high-quality verifiable Land Certificate PDF using pdf-lib
   */
  static async generateCertificate(meta: LandCertificateMetadata): Promise<{ pdfBytes: Uint8Array; serialNumber: string }> {
    const pdfDoc = await PDFDocument.create();
    
    // Landscape A4: 841.89 x 595.28
    const width = 842;
    const height = 595;
    const page = pdfDoc.addPage([width, height]);

    // Embed fonts
    const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontBody = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
    const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

    // Color palette
    const bgDark = rgb(0.04, 0.05, 0.08); // #0a0d14
    const bgCard = rgb(0.07, 0.09, 0.14); // #121724
    const purpleMonad = rgb(0.51, 0.43, 0.98); // #836EF9
    const cyanCyber = rgb(0.0, 0.94, 1.0); // #00F0FF
    const goldAccent = rgb(0.96, 0.77, 0.26); // #F5C542
    const textWhite = rgb(0.96, 0.97, 1.0);
    const textMuted = rgb(0.62, 0.66, 0.78);
    const landGreen = rgb(0.12, 0.72, 0.45); // #1EB873

    // 1. Draw Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: bgDark,
    });

    // 2. Draw Decorative Card Background
    page.drawRectangle({
      x: 25,
      y: 25,
      width: width - 50,
      height: height - 50,
      color: bgCard,
      borderColor: landGreen,
      borderWidth: 2,
    });

    // 3. Inner Decorative Border
    page.drawRectangle({
      x: 35,
      y: 35,
      width: width - 70,
      height: height - 70,
      borderColor: rgb(0.2, 0.25, 0.38),
      borderWidth: 1,
    });

    // Corner decorative accents
    const cornerSize = 24;
    // Top-left
    page.drawLine({ start: { x: 30, y: height - 30 }, end: { x: 30 + cornerSize, y: height - 30 }, color: goldAccent, thickness: 3 });
    page.drawLine({ start: { x: 30, y: height - 30 }, end: { x: 30, y: height - 30 - cornerSize }, color: goldAccent, thickness: 3 });
    // Top-right
    page.drawLine({ start: { x: width - 30, y: height - 30 }, end: { x: width - 30 - cornerSize, y: height - 30 }, color: goldAccent, thickness: 3 });
    page.drawLine({ start: { x: width - 30, y: height - 30 }, end: { x: width - 30, y: height - 30 - cornerSize }, color: goldAccent, thickness: 3 });
    // Bottom-left
    page.drawLine({ start: { x: 30, y: 30 }, end: { x: 30 + cornerSize, y: 30 }, color: goldAccent, thickness: 3 });
    page.drawLine({ start: { x: 30, y: 30 }, end: { x: 30, y: 30 + cornerSize }, color: goldAccent, thickness: 3 });
    // Bottom-right
    page.drawLine({ start: { x: width - 30, y: 30 }, end: { x: width - 30 - cornerSize, y: 30 }, color: goldAccent, thickness: 3 });
    page.drawLine({ start: { x: width - 30, y: 30 }, end: { x: width - 30, y: 30 + cornerSize }, color: goldAccent, thickness: 3 });

    // 4. Header: Platform Brand
    page.drawText('VERIDEX RWA PROTOCOL', {
      x: 65,
      y: height - 75,
      size: 16,
      font: fontTitle,
      color: landGreen,
    });

    page.drawText('LAND CERTIFICATE • POWERED BY MONAD TESTNET', {
      x: 65,
      y: height - 92,
      size: 8.5,
      font: fontMono,
      color: purpleMonad,
    });

    // 5. Main Title: "SERTIFIKAT HAK ATAS TANAH"
    const certTitle = 'SERTIFIKAT HAK ATAS TANAH';
    const certTitleWidth = fontTitle.widthOfTextAtSize(certTitle, 24);
    page.drawText(certTitle, {
      x: (width - certTitleWidth) / 2,
      y: height - 140,
      size: 24,
      font: fontTitle,
      color: goldAccent,
    });

    const subTitle = `${meta.landType} — TOKENIZED ON-CHAIN RWA CREDENTIAL`;
    const subTitleWidth = fontMono.widthOfTextAtSize(subTitle, 9);
    page.drawText(subTitle, {
      x: (width - subTitleWidth) / 2,
      y: height - 158,
      size: 9,
      font: fontMono,
      color: textMuted,
    });

    // 6. Certificate Number
    const certNumText = `No. Sertifikat: ${meta.certificateNumber}`;
    const certNumWidth = fontTitle.widthOfTextAtSize(certNumText, 12);
    page.drawText(certNumText, {
      x: (width - certNumWidth) / 2,
      y: height - 185,
      size: 12,
      font: fontTitle,
      color: cyanCyber,
    });

    // 7. Owner Name
    const nameText = meta.ownerName.toUpperCase();
    const nameSize = 26;
    const nameWidth = fontSerif.widthOfTextAtSize(nameText, nameSize);
    page.drawText(nameText, {
      x: (width - nameWidth) / 2,
      y: height - 230,
      size: nameSize,
      font: fontSerif,
      color: textWhite,
    });

    // Underline for name
    page.drawLine({
      start: { x: (width - Math.max(nameWidth + 60, 320)) / 2, y: height - 243 },
      end: { x: (width + Math.max(nameWidth + 60, 320)) / 2, y: height - 243 },
      color: landGreen,
      thickness: 1.5,
    });

    // 8. Land Details Grid
    const detailStartY = height - 280;
    const col1X = 120;
    const col2X = width / 2 + 30;

    // Left column
    page.drawText('LOKASI TANAH:', { x: col1X, y: detailStartY, size: 8, font: fontMono, color: textMuted });
    const locationLines = meta.landLocation.length > 40 
      ? [meta.landLocation.substring(0, 40), meta.landLocation.substring(40)]
      : [meta.landLocation];
    locationLines.forEach((line, i) => {
      page.drawText(line, { x: col1X, y: detailStartY - 15 - (i * 12), size: 10, font: fontBody, color: textWhite });
    });

    page.drawText('NIK PEMILIK:', { x: col1X, y: detailStartY - 50, size: 8, font: fontMono, color: textMuted });
    page.drawText(meta.ownerId || '-', { x: col1X, y: detailStartY - 65, size: 10, font: fontMono, color: textWhite });

    // Right column
    page.drawText('LUAS TANAH:', { x: col2X, y: detailStartY, size: 8, font: fontMono, color: textMuted });
    page.drawText(meta.landArea, { x: col2X, y: detailStartY - 15, size: 14, font: fontTitle, color: cyanCyber });

    page.drawText('JENIS HAK:', { x: col2X, y: detailStartY - 50, size: 8, font: fontMono, color: textMuted });
    page.drawText(meta.landType, { x: col2X, y: detailStartY - 65, size: 14, font: fontTitle, color: goldAccent });

    // 9. Generate QR Code for Verification
    const verifyUrl = `${meta.verifyBaseUrl || 'https://veridex.monad.xyz'}/verify?serial=${encodeURIComponent(meta.serialNumber)}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 140,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    // Embed QR PNG into PDF
    const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    const qrDimension = 75;
    
    // Draw QR code container box
    page.drawRectangle({
      x: width - 155,
      y: 65,
      width: qrDimension + 10,
      height: qrDimension + 10,
      color: rgb(1, 1, 1),
    });
    page.drawImage(qrImage, {
      x: width - 150,
      y: 70,
      width: qrDimension,
      height: qrDimension,
    });
    page.drawText('SCAN TO VERIFY', {
      x: width - 147,
      y: 52,
      size: 7,
      font: fontMono,
      color: textMuted,
    });

    // 10. Metadata Blocks
    page.drawText(`SERIAL ID: ${meta.serialNumber}`, {
      x: 65,
      y: 115,
      size: 9,
      font: fontMono,
      color: textWhite,
    });
    page.drawText(`ISSUED DATE: ${meta.issueDate}`, {
      x: 65,
      y: 98,
      size: 9,
      font: fontMono,
      color: textMuted,
    });
    page.drawText(`REGISTRY: ${meta.registryName}`, {
      x: 65,
      y: 81,
      size: 8.5,
      font: fontMono,
      color: textMuted,
    });
    page.drawText(`BATCH REF: ${meta.batchId || 'BPN-MONAD-2026'}`, {
      x: 65,
      y: 64,
      size: 8.5,
      font: fontMono,
      color: purpleMonad,
    });

    // Center: Cryptographic Seal text
    const sealText = 'CRYPTOGRAPHICALLY ANCHORED IN MONAD TESTNET • RWA LAND TOKEN';
    page.drawText(sealText, {
      x: (width - fontMono.widthOfTextAtSize(sealText, 7.5)) / 2,
      y: 68,
      size: 7.5,
      font: fontMono,
      color: landGreen,
    });
    const subNotice = 'TAMPER RESISTANT • MERKLE PROOF VERIFIED • REAL WORLD ASSET';
    page.drawText(subNotice, {
      x: (width - fontMono.widthOfTextAtSize(subNotice, 6.5)) / 2,
      y: 54,
      size: 6.5,
      font: fontMono,
      color: textMuted,
    });

    // Save and return
    const pdfBytes = await pdfDoc.save();
    return {
      pdfBytes,
      serialNumber: meta.serialNumber,
    };
  }

  /**
   * Generates a tampered copy of the PDF by altering one byte in the stream.
   * This guarantees that SHA-256 changes completely and fails verification!
   */
  static tamperPdf(validPdfBytes: Uint8Array): Uint8Array {
    const tampered = new Uint8Array(validPdfBytes.length);
    tampered.set(validPdfBytes);
    
    // Modify one byte in the middle of content
    const targetIdx = Math.floor(tampered.length / 2);
    tampered[targetIdx] = tampered[targetIdx] ^ 0xff; // Flip bits
    return tampered;
  }
}
