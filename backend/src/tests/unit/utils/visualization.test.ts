import VisualizationUtil from '../../../utils/visualization';

describe('VisualizationUtil', () => {
  const util = VisualizationUtil.getInstance();

  describe('generateActionChart', () => {
    test('should generate correct chart data', () => {
      const actionsByType = {
        CREATE: 5,
        UPDATE: 3,
        DELETE: 2
      };

      const chart = util.generateActionChart(actionsByType);
      
      expect(chart.labels).toEqual(['CREATE', 'UPDATE', 'DELETE']);
      expect(chart.data).toEqual([5, 3, 2]);
    });
  });

  describe('generateUserActivityChart', () => {
    test('should generate correct chart data', () => {
      const actionsByUser = {
        user1: 10,
        user2: 5,
        user3: 3
      };

      const chart = util.generateUserActivityChart(actionsByUser);
      
      expect(chart.labels).toEqual(['user1', 'user2', 'user3']);
      expect(chart.data).toEqual([10, 5, 3]);
    });
  });
});