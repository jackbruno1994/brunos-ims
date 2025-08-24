export interface SearchResult {
  id: string;
  type: 'recipe' | 'ingredient' | 'menu_item' | 'prep_task' | 'order';
  title: string;
  description: string;
  relevanceScore: number;
  category?: string;
  tags: string[];
  metadata: any;
}

export interface SearchPattern {
  userId: string;
  query: string;
  results: SearchResult[];
  selectedResult?: string;
  timestamp: Date;
  context: string; // 'prep', 'cooking', 'menu_planning', etc.
}

export interface UserSearchBehavior {
  userId: string;
  commonQueries: { query: string; frequency: number }[];
  preferredResultTypes: { type: string; preference: number }[];
  searchContexts: { context: string; frequency: number }[];
  quickAccessItems: string[];
  lastUpdated: Date;
}

export class SmartSearchService {
  private static searchHistory = new Map<string, SearchPattern[]>(); // keyed by userId
  private static userBehavior = new Map<string, UserSearchBehavior>(); // keyed by userId
  private static searchIndex = new Map<string, SearchResult[]>(); // keyed by restaurantId

  /**
   * Perform intelligent search with learning
   */
  static async search(
    query: string,
    userId: string,
    restaurantId: string,
    context: string = 'general'
  ): Promise<SearchResult[]> {
    // Get base search results
    const baseResults = await this.performBaseSearch(query, restaurantId);
    
    // Apply personalization based on user behavior
    const personalizedResults = this.personalizeResults(baseResults, userId, context);
    
    // Record search pattern for learning
    this.recordSearchPattern({
      userId,
      query,
      results: personalizedResults,
      timestamp: new Date(),
      context
    });
    
    // Update user behavior model
    await this.updateUserBehavior(userId, query, context);
    
    return personalizedResults;
  }

  /**
   * Perform base search across all content types
   */
  private static async performBaseSearch(query: string, restaurantId: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // Search recipes
    const recipeResults = await this.searchRecipes(query, restaurantId);
    results.push(...recipeResults);
    
    // Search ingredients
    const ingredientResults = await this.searchIngredients(query, restaurantId);
    results.push(...ingredientResults);
    
    // Search menu items
    const menuResults = await this.searchMenuItems(query, restaurantId);
    results.push(...menuResults);
    
    // Search prep tasks
    const prepResults = await this.searchPrepTasks(query, restaurantId);
    results.push(...prepResults);
    
    // Sort by relevance score
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Personalize search results based on user behavior
   */
  private static personalizeResults(
    results: SearchResult[], 
    userId: string, 
    context: string
  ): SearchResult[] {
    const behavior = this.userBehavior.get(userId);
    if (!behavior) return results;

    return results.map(result => {
      let personalizedScore = result.relevanceScore;
      
      // Boost score based on user's preferred result types
      const typePreference = behavior.preferredResultTypes.find(p => p.type === result.type);
      if (typePreference) {
        personalizedScore *= (1 + typePreference.preference * 0.2);
      }
      
      // Boost if item is in quick access
      if (behavior.quickAccessItems.includes(result.id)) {
        personalizedScore *= 1.5;
      }
      
      // Context-based boosting
      if (this.isContextRelevant(result, context)) {
        personalizedScore *= 1.3;
      }
      
      return {
        ...result,
        relevanceScore: personalizedScore
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Record search pattern for learning
   */
  private static recordSearchPattern(pattern: SearchPattern): void {
    const userId = pattern.userId;
    
    if (!this.searchHistory.has(userId)) {
      this.searchHistory.set(userId, []);
    }
    
    const history = this.searchHistory.get(userId)!;
    history.push(pattern);
    
    // Keep only last 1000 searches per user
    if (history.length > 1000) {
      history.shift();
    }
  }

  /**
   * Update user behavior model based on search patterns
   */
  private static async updateUserBehavior(
    userId: string, 
    query: string, 
    context: string
  ): Promise<void> {
    let behavior = this.userBehavior.get(userId);
    
    if (!behavior) {
      behavior = {
        userId,
        commonQueries: [],
        preferredResultTypes: [],
        searchContexts: [],
        quickAccessItems: [],
        lastUpdated: new Date()
      };
      this.userBehavior.set(userId, behavior);
    }
    
    // Update common queries
    this.updateQueryFrequency(behavior, query);
    
    // Update search contexts
    this.updateContextFrequency(behavior, context);
    
    // Analyze result type preferences from history
    this.analyzeResultTypePreferences(behavior, userId);
    
    behavior.lastUpdated = new Date();
  }

  /**
   * Update query frequency in user behavior
   */
  private static updateQueryFrequency(behavior: UserSearchBehavior, query: string): void {
    const existing = behavior.commonQueries.find(q => q.query === query);
    
    if (existing) {
      existing.frequency++;
    } else {
      behavior.commonQueries.push({ query, frequency: 1 });
    }
    
    // Sort by frequency and keep top 50
    behavior.commonQueries.sort((a, b) => b.frequency - a.frequency);
    behavior.commonQueries = behavior.commonQueries.slice(0, 50);
  }

  /**
   * Update context frequency in user behavior
   */
  private static updateContextFrequency(behavior: UserSearchBehavior, context: string): void {
    const existing = behavior.searchContexts.find(c => c.context === context);
    
    if (existing) {
      existing.frequency++;
    } else {
      behavior.searchContexts.push({ context, frequency: 1 });
    }
    
    // Sort by frequency
    behavior.searchContexts.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Analyze user's result type preferences from search history
   */
  private static analyzeResultTypePreferences(behavior: UserSearchBehavior, userId: string): void {
    const history = this.searchHistory.get(userId);
    if (!history) return;
    
    const typeClicks = new Map<string, number>();
    
    // Analyze which result types user typically selects
    for (const pattern of history.slice(-100)) { // Last 100 searches
      if (pattern.selectedResult) {
        const selectedResult = pattern.results.find(r => r.id === pattern.selectedResult);
        if (selectedResult) {
          const current = typeClicks.get(selectedResult.type) || 0;
          typeClicks.set(selectedResult.type, current + 1);
        }
      }
    }
    
    // Convert to preference scores
    const totalClicks = Array.from(typeClicks.values()).reduce((sum, count) => sum + count, 0);
    
    behavior.preferredResultTypes = Array.from(typeClicks.entries()).map(([type, count]) => ({
      type,
      preference: count / totalClicks
    }));
  }

  /**
   * Get search suggestions based on user behavior
   */
  static getSearchSuggestions(userId: string, partialQuery: string): string[] {
    const behavior = this.userBehavior.get(userId);
    if (!behavior) return [];
    
    const suggestions = behavior.commonQueries
      .filter(q => q.query.toLowerCase().includes(partialQuery.toLowerCase()))
      .slice(0, 5)
      .map(q => q.query);
    
    return suggestions;
  }

  /**
   * Get quick access items for user
   */
  static getQuickAccessItems(userId: string): SearchResult[] {
    const behavior = this.userBehavior.get(userId);
    if (!behavior) return [];
    
    // Get most frequently accessed items
    const history = this.searchHistory.get(userId) || [];
    const accessCounts = new Map<string, number>();
    
    for (const pattern of history.slice(-200)) { // Last 200 searches
      if (pattern.selectedResult) {
        const current = accessCounts.get(pattern.selectedResult) || 0;
        accessCounts.set(pattern.selectedResult, current + 1);
      }
    }
    
    // Get top 10 most accessed items
    const topItems = Array.from(accessCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);
    
    // Update user behavior
    behavior.quickAccessItems = topItems;
    
    // Return actual search results for these items
    return this.getResultsByIds(topItems);
  }

  /**
   * Record result selection for learning
   */
  static recordResultSelection(userId: string, resultId: string): void {
    const history = this.searchHistory.get(userId);
    if (!history || history.length === 0) return;
    
    // Update the most recent search pattern
    const lastPattern = history[history.length - 1];
    lastPattern.selectedResult = resultId;
  }

  /**
   * Bulk index content for search
   */
  static async indexContent(restaurantId: string): Promise<void> {
    const results: SearchResult[] = [];
    
    // Index recipes
    const recipes = await this.getAllRecipes(restaurantId);
    for (const recipe of recipes) {
      results.push(this.createRecipeSearchResult(recipe));
    }
    
    // Index ingredients
    const ingredients = await this.getAllIngredients(restaurantId);
    for (const ingredient of ingredients) {
      results.push(this.createIngredientSearchResult(ingredient));
    }
    
    // Index menu items
    const menuItems = await this.getAllMenuItems(restaurantId);
    for (const menuItem of menuItems) {
      results.push(this.createMenuItemSearchResult(menuItem));
    }
    
    this.searchIndex.set(restaurantId, results);
  }

  // Search implementation methods
  private static async searchRecipes(query: string, restaurantId: string): Promise<SearchResult[]> {
    // TODO: Implement recipe search with fuzzy matching
    return [];
  }

  private static async searchIngredients(query: string, restaurantId: string): Promise<SearchResult[]> {
    // TODO: Implement ingredient search
    return [];
  }

  private static async searchMenuItems(query: string, restaurantId: string): Promise<SearchResult[]> {
    // TODO: Implement menu item search
    return [];
  }

  private static async searchPrepTasks(query: string, restaurantId: string): Promise<SearchResult[]> {
    // TODO: Implement prep task search
    return [];
  }

  private static isContextRelevant(result: SearchResult, context: string): boolean {
    const contextRelevance: { [key: string]: string[] } = {
      'prep': ['recipe', 'ingredient', 'prep_task'],
      'cooking': ['recipe', 'menu_item'],
      'menu_planning': ['menu_item', 'recipe'],
      'inventory': ['ingredient']
    };
    
    return contextRelevance[context]?.includes(result.type) || false;
  }

  private static getResultsByIds(ids: string[]): SearchResult[] {
    // TODO: Implement getting results by IDs
    return [];
  }

  // Content retrieval methods (placeholders)
  private static async getAllRecipes(restaurantId: string): Promise<any[]> { return []; }
  private static async getAllIngredients(restaurantId: string): Promise<any[]> { return []; }
  private static async getAllMenuItems(restaurantId: string): Promise<any[]> { return []; }

  // Search result creation methods (placeholders)
  private static createRecipeSearchResult(recipe: any): SearchResult {
    return {
      id: recipe.id,
      type: 'recipe',
      title: recipe.name,
      description: recipe.description,
      relevanceScore: 1.0,
      tags: [],
      metadata: recipe
    };
  }

  private static createIngredientSearchResult(ingredient: any): SearchResult {
    return {
      id: ingredient.id,
      type: 'ingredient',
      title: ingredient.name,
      description: `${ingredient.category} - ${ingredient.unit}`,
      relevanceScore: 1.0,
      tags: [ingredient.category],
      metadata: ingredient
    };
  }

  private static createMenuItemSearchResult(menuItem: any): SearchResult {
    return {
      id: menuItem.id,
      type: 'menu_item',
      title: menuItem.name,
      description: menuItem.description,
      relevanceScore: 1.0,
      tags: [menuItem.category],
      metadata: menuItem
    };
  }
}