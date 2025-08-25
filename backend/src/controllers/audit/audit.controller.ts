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
        entityType,
        entityId,
        userId,
        action,
        startDate,
        endDate,
        page,
        limit
      } = req.query;

      const filters = {
        entityType: entityType as string,
        entityId: entityId as string,
        userId: userId as string,
        action: action as string,
        startDate: startDate ? this.dateUtil.parseUtcDate(startDate as string) : undefined,
        endDate: endDate ? this.dateUtil.parseUtcDate(endDate as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      };

      const result = await this.service.getAuditLogs(filters);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  public getEntityAuditTrail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityType, entityId } = req.params;
      const trail = await this.service.getEntityAuditTrail(entityType, entityId);
      res.status(200).json(trail);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  public generateReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        entityType,
        userId
      } = req.query;

      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      const report = await this.service.generateAuditReport({
        startDate: this.dateUtil.parseUtcDate(startDate as string),
        endDate: this.dateUtil.parseUtcDate(endDate as string),
        entityType: entityType as string,
        userId: userId as string
      });

      res.status(200).json(report);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}

export default AuditController;