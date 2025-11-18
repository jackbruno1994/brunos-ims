// Mock database client for development until Prisma is fully configured
// This will be replaced with actual Prisma client once database is set up

export interface MockDatabaseClient {
  $queryRaw: (query: any) => Promise<any>;
  $disconnect: () => Promise<void>;
}

class MockDatabase implements MockDatabaseClient {
  async $queryRaw(_query: any): Promise<any> {
    // Mock database query for development
    // In production, this would be a real database connection
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
    return [{ result: 1 }];
  }

  async $disconnect(): Promise<void> {
    // Mock disconnect
    return Promise.resolve();
  }
}

// Export a mock database instance for development
const db = new MockDatabase();
export default db;