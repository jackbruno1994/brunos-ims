import { PrepList, PrepListItem, Order, Recipe, Ingredient } from '../models';

export class PrepListService {
  /**
   * Generate optimized prep list based on upcoming orders
   */
  static async generatePrepList(
    restaurantId: string, 
    orders: Order[],
    date: Date
  ): Promise<PrepList> {
    const prepItems = await this.analyzeOrderRequirements(orders);
    const optimizedItems = await this.optimizeByShelfLife(prepItems);
    const timeOptimizedItems = await this.optimizeByPrepTime(optimizedItems);

    return {
      id: this.generateId(),
      name: `Prep List - ${date.toDateString()}`,
      restaurantId,
      date,
      status: 'draft',
      items: timeOptimizedItems,
      estimatedTotalTime: timeOptimizedItems.reduce((total, item) => total + item.estimatedTime, 0),
      createdBy: 'system', // TODO: get from context
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Analyze order requirements to determine prep needs
   */
  private static async analyzeOrderRequirements(orders: Order[]): Promise<PrepListItem[]> {
    const ingredientRequirements = new Map<string, { 
      totalQuantity: number, 
      recipes: string[], 
      priority: 'low' | 'normal' | 'high' 
    }>();

    // Aggregate ingredient requirements from all orders
    for (const order of orders) {
      for (const orderItem of order.items) {
        // TODO: Fetch recipe and ingredients from database
        const recipe = await this.getRecipeForMenuItem(orderItem.menuItemId);
        if (recipe) {
          for (const recipeIngredient of recipe.ingredients) {
            const key = recipeIngredient.ingredientId;
            const existing = ingredientRequirements.get(key);
            const quantity = recipeIngredient.quantity * orderItem.quantity;
            
            if (existing) {
              existing.totalQuantity += quantity;
              existing.recipes.push(recipe.id);
              // Increase priority based on order priority
              if (order.priority === 'urgent' || order.priority === 'high') {
                existing.priority = 'high';
              }
            } else {
              ingredientRequirements.set(key, {
                totalQuantity: quantity,
                recipes: [recipe.id],
                priority: order.priority === 'urgent' || order.priority === 'high' ? 'high' : 'normal'
              });
            }
          }
        }
      }
    }

    // Convert to prep list items
    const prepItems: PrepListItem[] = [];
    for (const [ingredientId, requirement] of ingredientRequirements) {
      const ingredient = await this.getIngredient(ingredientId);
      if (ingredient) {
        prepItems.push({
          id: this.generateId(),
          ingredientId,
          quantity: requirement.totalQuantity,
          unit: ingredient.unit,
          priority: requirement.priority,
          estimatedTime: this.calculatePrepTime(ingredient, requirement.totalQuantity),
          status: 'pending'
        });
      }
    }

    return prepItems;
  }

  /**
   * Optimize prep items by ingredient shelf life
   */
  private static async optimizeByShelfLife(items: PrepListItem[]): Promise<PrepListItem[]> {
    // Get ingredients data for all items
    const ingredientData = new Map<string, Ingredient>();
    
    for (const item of items) {
      if (!ingredientData.has(item.ingredientId)) {
        const ingredient = await this.getIngredient(item.ingredientId);
        if (ingredient) {
          ingredientData.set(item.ingredientId, ingredient);
        }
      }
    }

    // Sort by shelf life (shortest first) and priority
    return items.sort((a, b) => {
      const ingredientA = ingredientData.get(a.ingredientId);
      const ingredientB = ingredientData.get(b.ingredientId);
      
      if (!ingredientA || !ingredientB) return 0;
      
      // First sort by priority
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      // Then by shelf life (shorter shelf life first)
      return ingredientA.shelfLife - ingredientB.shelfLife;
    });
  }

  /**
   * Optimize prep items by preparation time
   */
  private static async optimizeByPrepTime(items: PrepListItem[]): Promise<PrepListItem[]> {
    // Group items that can be prepared together
    const grouped = new Map<string, PrepListItem[]>();
    
    for (const item of items) {
      const ingredient = await this.getIngredient(item.ingredientId);
      if (ingredient) {
        const category = ingredient.category;
        if (!grouped.has(category)) {
          grouped.set(category, []);
        }
        grouped.get(category)!.push(item);
      }
    }

    // Flatten back to array with optimized order
    return Array.from(grouped.values()).flat();
  }

  /**
   * Calculate preparation time based on ingredient and quantity
   */
  private static calculatePrepTime(ingredient: Ingredient, quantity: number): number {
    // Base prep time scaled by quantity with diminishing returns
    const baseTime = ingredient.prepTime;
    const scaleFactor = Math.log(quantity + 1) / Math.log(2); // Logarithmic scaling
    return Math.ceil(baseTime * scaleFactor);
  }

  /**
   * Update prep list with real-time order changes
   */
  static async updatePrepListForNewOrder(
    prepListId: string, 
    newOrder: Order
  ): Promise<PrepList> {
    // TODO: Implement real-time prep list updates
    const prepList = await this.getPrepList(prepListId);
    if (!prepList) {
      throw new Error('Prep list not found');
    }

    const newItems = await this.analyzeOrderRequirements([newOrder]);
    
    // Merge new items with existing ones
    for (const newItem of newItems) {
      const existingItem = prepList.items.find(item => item.ingredientId === newItem.ingredientId);
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
        existingItem.estimatedTime = this.calculatePrepTimeForItem(existingItem);
      } else {
        prepList.items.push(newItem);
      }
    }

    // Re-optimize the updated list
    prepList.items = await this.optimizeByShelfLife(prepList.items);
    prepList.estimatedTotalTime = prepList.items.reduce((total, item) => total + item.estimatedTime, 0);
    prepList.updatedAt = new Date();

    return prepList;
  }

  // Helper methods (would be replaced with actual database calls)
  private static async getRecipeForMenuItem(menuItemId: string): Promise<Recipe | null> {
    // TODO: Implement database query
    return null;
  }

  private static async getIngredient(ingredientId: string): Promise<Ingredient | null> {
    // TODO: Implement database query
    return null;
  }

  private static async getPrepList(prepListId: string): Promise<PrepList | null> {
    // TODO: Implement database query
    return null;
  }

  private static calculatePrepTimeForItem(item: PrepListItem): number {
    // TODO: Implement proper calculation
    return item.estimatedTime;
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}