import { Request, Response } from 'express';
import { AuditService } from '../../services/audit/audit.service';
import DateTimeUtil from '../../utils/datetime';

export class AuditController {
  private service: AuditService;
  private dateUtil: DateTimeUtil;

  constructor() {
    this.service = AuditService.getInstance();
    this.dateUtil = DateTimeUtil.getInstance();
  }

  public getAuditLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        entityType,
        userId,
        limit,
        offset
      } = req.query;

      const filters = {
        startDate: startDate ? this.dateUtil.parseUtcDate(startDate as string) : undefined,
        endDate: endDate ? this.dateUtil.parseUtcDate(endDate as string) : undefined,
        entityType: entityType as string,
        userId: userId as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      };

      const result = await this.service.getAuditLogs(filters);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public getAuditLogById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const auditLog = await this.service.getAuditLogById(id);

      if (!auditLog) {
        res.status(404).json({ error: 'Audit log not found' });
        return;
      }

      res.status(200).json(auditLog);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public createAuditLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { action, entityType, entityId, changes } = req.body;
      const user = (req as any).user;

      if (!action || !entityType || !entityId || !user?.id) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const auditLog = await this.service.createAuditLog({
        action,
        entityType,
        entityId,
        userId: user.id,
        changes: changes || {}
      });

      res.status(201).json(auditLog);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public exportToCsv = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        entityType,
        userId
      } = req.query;

      const filters = {
        startDate: startDate ? this.dateUtil.parseUtcDate(startDate as string) : undefined,
        endDate: endDate ? this.dateUtil.parseUtcDate(endDate as string) : undefined,
        entityType: entityType as string,
        userId: userId as string
      };

      const csv = await this.service.exportToCsv(filters);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      res.status(200).send(csv);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public exportToPdf = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        entityType,
        userId
      } = req.query;

      const filters = {
        startDate: startDate ? this.dateUtil.parseUtcDate(startDate as string) : undefined,
        endDate: endDate ? this.dateUtil.parseUtcDate(endDate as string) : undefined,
        entityType: entityType as string,
        userId: userId as string
      };

      const pdf = await this.service.exportToPdf(filters);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.pdf');
      res.status(200).send(pdf);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  public getVisualizationData = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        entityType,
        userId
      } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'Start date and end date are required' });
        return;
      }

      const data = await this.service.generateVisualizationData({
        startDate: this.dateUtil.parseUtcDate(startDate as string),
        endDate: this.dateUtil.parseUtcDate(endDate as string),
        entityType: entityType as string,
        userId: userId as string
      });

      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };
}

export default AuditController;