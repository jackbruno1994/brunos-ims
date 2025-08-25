import { format, parseISO, isValid } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export class DateTimeUtil {
  private static instance: DateTimeUtil;
  private readonly defaultFormat = 'yyyy-MM-dd HH:mm:ss';
  private readonly defaultTimezone = 'UTC';

  private constructor() {}

  public static getInstance(): DateTimeUtil {
    if (!DateTimeUtil.instance) {
      DateTimeUtil.instance = new DateTimeUtil();
    }
    return DateTimeUtil.instance;
  }

  /**
   * Get current UTC datetime
   * @returns Date object in UTC
   */
  public getCurrentUtcDate(): Date {
    return new Date();
  }

  /**
   * Format date to string in UTC
   * @param date Date to format
   * @param formatStr Optional format string
   * @returns Formatted date string
   */
  public formatUtcDate(date: Date, formatStr?: string): string {
    const utcDate = toZonedTime(date, this.defaultTimezone);
    return format(utcDate, formatStr || this.defaultFormat);
  }

  /**
   * Parse UTC date string to Date object
   * @param dateStr Date string in UTC
   * @returns Date object
   */
  public parseUtcDate(dateStr: string): Date {
    const parsedDate = parseISO(dateStr);
    if (!isValid(parsedDate)) {
      throw new Error('Invalid date format');
    }
    return fromZonedTime(parsedDate, this.defaultTimezone);
  }

  /**
   * Validate if string is a valid UTC date
   * @param dateStr Date string to validate
   * @returns boolean
   */
  public isValidUtcDate(dateStr: string): boolean {
    try {
      const date = this.parseUtcDate(dateStr);
      return isValid(date);
    } catch {
      return false;
    }
  }
}

export default DateTimeUtil;