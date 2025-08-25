import { Parser } from 'json2csv';
import { AuditLog } from '../types/audit.types';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export class ExportUtil {
  private static instance: ExportUtil;

  private constructor() {}

  public static getInstance(): ExportUtil {
    if (!ExportUtil.instance) {
      ExportUtil.instance = new ExportUtil();
    }
    return ExportUtil.instance;
  }

  /**
   * Export audit logs to CSV format
   */
  public exportToCsv(logs: AuditLog[]): string {
    const fields = ['id', 'action', 'entityType', 'entityId', 'userId', 'timestamp'];
    const parser = new Parser({ fields });
    
    const data = logs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp).toISOString(),
      changes: JSON.stringify(log.changes)
    }));

    return parser.parse(data);
  }

  /**
   * Export audit logs to PDF format
   */
  public async exportToPdf(logs: AuditLog[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Add title
        doc.fontSize(16).text('Audit Log Report', { align: 'center' });
        doc.moveDown();

        // Add timestamp
        doc.fontSize(10)
           .text(`Generated at: ${new Date().toISOString()}`, { align: 'right' });
        doc.moveDown();

        // Add table header
        const tableTop = 150;
        this.addTableHeader(doc, tableTop);

        // Add table rows
        let yPosition = tableTop + 20;
        logs.forEach((log, index) => {
          this.addTableRow(doc, log, yPosition);
          yPosition += 30;

          // Add new page if needed
          if (yPosition > 700) {
            doc.addPage();
            this.addTableHeader(doc, 50);
            yPosition = 70;
          }
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addTableHeader(doc: PDFKit.PDFDocument, y: number): void {
    doc.fontSize(10)
       .text('ID', 50, y)
       .text('Action', 150, y)
       .text('Entity Type', 250, y)
       .text('Entity ID', 350, y)
       .text('User ID', 450, y);
  }

  private addTableRow(doc: PDFKit.PDFDocument, log: AuditLog, y: number): void {
    doc.fontSize(8)
       .text(log.id.substring(0, 8), 50, y)
       .text(log.action, 150, y)
       .text(log.entityType, 250, y)
       .text(log.entityId, 350, y)
       .text(log.userId, 450, y);
  }
}

export default ExportUtil;