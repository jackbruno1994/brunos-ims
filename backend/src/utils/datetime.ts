export default class DateTimeUtil {
  private static instance: DateTimeUtil;

  private constructor() {}

  public static getInstance(): DateTimeUtil {
    if (!DateTimeUtil.instance) {
      DateTimeUtil.instance = new DateTimeUtil();
    }
    return DateTimeUtil.instance;
  }

  public getCurrentUtcDate(): Date {
    return new Date();
  }

  public parseUtcDate(dateString: string): Date {
    return new Date(dateString);
  }

  public formatDate(date: Date): string {
    return date.toISOString();
  }
}