import jsPDF from 'jspdf';
import { ProgressBlockData } from '../types';

/**
 * Exports a canvas as a PNG or JPG image.
 * @param canvas The HTMLCanvasElement to export.
 * @param format 'png' or 'jpg'.
 * @param filename The desired filename.
 */
export const exportTimelineAsImage = (canvas: HTMLCanvasElement, format: 'png' | 'jpg', filename: string) => {
  const dataUrl = canvas.toDataURL(`image/${format}`, 1.0); // 1.0 for max quality
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports a canvas as a PDF document.
 * @param canvas The HTMLCanvasElement to export.
 * @param filename The desired filename.
 */
export const exportTimelineAsPdf = (canvas: HTMLCanvasElement, filename: string) => {
  const imgData = canvas.toDataURL('image/jpeg', 1.0); // Use JPEG for smaller PDF sizes
  // A4 Landscape dimensions
  const imgWidth = 297; // A4 width in mm (Landscape)
  const pageHeight = 210; // A4 height in mm (Landscape)
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;

  const doc = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
  let position = 0;

  doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    doc.addPage();
    doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  doc.save(filename);
};

/**
 * Exports the current timeline data as a JSON file.
 * @param data The timeline data object to export.
 * @param filename The desired filename.
 */
export const exportTimelineAsJson = (data: {
  startYear: number;
  endYear: number;
  topSectionLabel: string;
  bottomSectionLabel: string;
  progressBlocks: ProgressBlockData[];
}, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2); // Pretty-print JSON
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up the object URL
};