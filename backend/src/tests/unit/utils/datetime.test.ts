import DateTimeUtil from '../../../utils/datetime';

describe('DateTimeUtil', () => {
  const dateUtil = DateTimeUtil.getInstance();

  describe('getInstance', () => {
    test('should return same instance (singleton)', () => {
      const instance1 = DateTimeUtil.getInstance();
      const instance2 = DateTimeUtil.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getCurrentUtcDate', () => {
    test('should return current date in UTC', () => {
      const date = dateUtil.getCurrentUtcDate();
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });
  });

  describe('formatUtcDate', () => {
    test('should format date to UTC string', () => {
      const date = new Date('2025-08-25T09:25:51Z');
      const formatted = dateUtil.formatUtcDate(date);
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test('should format date with custom format', () => {
      const date = new Date('2025-08-25T09:25:51Z');
      const formatted = dateUtil.formatUtcDate(date, 'yyyy-MM-dd');
      expect(formatted).toBe('2025-08-25');
    });
  });

  describe('parseUtcDate', () => {
    test('should parse UTC date string', () => {
      const dateStr = '2025-08-25T09:25:51.000Z';
      const parsed = dateUtil.parseUtcDate(dateStr);
      expect(parsed).toBeInstanceOf(Date);
    });

    test('should throw error for invalid date', () => {
      expect(() => {
        dateUtil.parseUtcDate('invalid-date');
      }).toThrow('Invalid date format');
    });
  });

  describe('isValidUtcDate', () => {
    test('should return true for valid date string', () => {
      const dateStr = '2025-08-25T09:25:51.000Z';
      const isValid = dateUtil.isValidUtcDate(dateStr);
      expect(isValid).toBe(true);
    });

    test('should return false for invalid date string', () => {
      const isValid = dateUtil.isValidUtcDate('invalid-date');
      expect(isValid).toBe(false);
    });
  });
});