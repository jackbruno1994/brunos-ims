interface ChartData {
  labels: string[];
  data: number[];
}

export class VisualizationUtil {
  private static instance: VisualizationUtil;

  private constructor() {}

  public static getInstance(): VisualizationUtil {
    if (!VisualizationUtil.instance) {
      VisualizationUtil.instance = new VisualizationUtil();
    }
    return VisualizationUtil.instance;
  }

  /**
   * Generate Chart.js configuration for action distribution
   */
  public generateActionChart(actionsByType: Record<string, number>): ChartData {
    const labels = Object.keys(actionsByType);
    const data = Object.values(actionsByType);

    return { labels, data };
  }

  /**
   * Generate Chart.js configuration for user activity
   */
  public generateUserActivityChart(actionsByUser: Record<string, number>): ChartData {
    const labels = Object.keys(actionsByUser);
    const data = Object.values(actionsByUser);

    return { labels, data };
  }

  /**
   * Generate Chart.js configuration for entity changes over time
   */
  public generateTimelineChart(logs: Array<{ timestamp: Date; count: number }>): ChartData {
    const labels = logs.map(log => 
      new Date(log.timestamp).toLocaleDateString()
    );
    const data = logs.map(log => log.count);

    return { labels, data };
  }
}

export default VisualizationUtil;