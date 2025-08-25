export class DateTimeUtil {
  private static instance: DateTimeUtil;

  private constructor() {}

  public static getInstance(): DateTimeUtil {
    if (!DateTimeUtil.instance) {
      DateTimeUtil.instance = new DateTimeUtil();
    }
    return DateTimeUtil.instance;
  }

  /**
   * Parse UTC date string to Date object
   */
  public parseUtcDate(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Get current UTC timestamp
   */
  public getCurrentUtc(): Date {
    return new Date();
  }

  /**
   * Format date to ISO string
   */
  public toIsoString(date: Date): string {
    return date.toISOString();
  }
}

export default DateTimeUtil;