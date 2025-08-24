import React, { useState, useEffect } from 'react';
import { Recipe, RecipeIngredient, RecipeInstruction } from '../types';

interface RecipeFormProps {
  recipe?: Recipe | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  onSubmit,
  onCancel,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    preparationTime: 0,
    cookingTime: 0,
    servingSize: 1,
    published: false,
    author: 'current-user', // In real app, get from auth context
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    tags: [] as string[],
    allergens: [] as string[]
  });

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { ingredientId: '', quantity: 0, unit: '' }
  ]);

  const [instructions, setInstructions] = useState<RecipeInstruction[]>([
    { stepNumber: 1, description: '' }
  ]);

  const [tagInput, setTagInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        preparationTime: recipe.preparationTime,
        cookingTime: recipe.cookingTime,
        servingSize: recipe.servingSize,
        published: recipe.published,
        author: recipe.author,
        difficulty: recipe.difficulty || 'easy',
        tags: recipe.tags || [],
        allergens: recipe.allergens || []
      });
      setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [{ ingredientId: '', quantity: 0, unit: '' }]);
      setInstructions(recipe.instructions.length > 0 ? recipe.instructions : [{ stepNumber: 1, description: '' }]);
    }
  }, [recipe]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const filteredIngredients = ingredients.filter(ing => ing.ingredientId.trim() && ing.quantity > 0);
    const filteredInstructions = instructions.filter(inst => inst.description.trim());

    if (filteredIngredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }

    if (filteredInstructions.length === 0) {
      alert('Please add at least one instruction');
      return;
    }

    onSubmit({
      ...formData,
      ingredients: filteredIngredients,
      instructions: filteredInstructions.map((inst, index) => ({
        ...inst,
        stepNumber: index + 1
      }))
    });
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { ingredientId: '', quantity: 0, unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, { stepNumber: instructions.length + 1, description: '' }]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const updateInstruction = (index: number, field: keyof RecipeInstruction, value: any) => {
    const updated = [...instructions];
    updated[index] = { ...updated[index], [field]: value };
    setInstructions(updated);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const addAllergen = () => {
    if (allergenInput.trim() && !formData.allergens.includes(allergenInput.trim())) {
      setFormData({
        ...formData,
        allergens: [...formData.allergens, allergenInput.trim()]
      });
      setAllergenInput('');
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData({
      ...formData,
      allergens: formData.allergens.filter(a => a !== allergen)
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold' as const,
    color: '#333'
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
        <h3 style={{ marginTop: 0 }}>{recipe ? 'Edit Recipe' : 'Create New Recipe'}</h3>

        {/* Basic Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Recipe Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select Category</option>
              <option value="Italian">Italian</option>
              <option value="Chinese">Chinese</option>
              <option value="Mexican">Mexican</option>
              <option value="Indian">Indian</option>
              <option value="American">American</option>
              <option value="French">French</option>
              <option value="Mediterranean">Mediterranean</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            required
          />
        </div>

        {/* Timing and Serving */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Prep Time (min)</label>
            <input
              type="number"
              value={formData.preparationTime}
              onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })}
              style={inputStyle}
              min="0"
            />
          </div>
          <div>
            <label style={labelStyle}>Cook Time (min)</label>
            <input
              type="number"
              value={formData.cookingTime}
              onChange={(e) => setFormData({ ...formData, cookingTime: parseInt(e.target.value) || 0 })}
              style={inputStyle}
              min="0"
            />
          </div>
          <div>
            <label style={labelStyle}>Serving Size</label>
            <input
              type="number"
              value={formData.servingSize}
              onChange={(e) => setFormData({ ...formData, servingSize: parseInt(e.target.value) || 1 })}
              style={inputStyle}
              min="1"
            />
          </div>
          <div>
            <label style={labelStyle}>Difficulty</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
              style={inputStyle}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Ingredients */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Ingredients *</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
              <div style={{ flex: 2 }}>
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.ingredientId}
                  onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={ingredient.quantity || ''}
                  onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                  style={inputStyle}
                  min="0"
                  step="0.1"
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Unit (g, ml, cups, etc.)"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                disabled={ingredients.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Ingredient
          </button>
        </div>

        {/* Instructions */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Instructions *</label>
          {instructions.map((instruction, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'start' }}>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '8px 12px', 
                borderRadius: '4px',
                minWidth: '40px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </div>
              <textarea
                placeholder="Describe this step..."
                value={instruction.description}
                onChange={(e) => updateInstruction(index, 'description', e.target.value)}
                style={{ 
                  ...inputStyle, 
                  flex: 1, 
                  minHeight: '60px',
                  resize: 'vertical'
                }}
              />
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}
                disabled={instructions.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Step
          </button>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Tags</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Add tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={addTag}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {formData.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: '#e9ecef',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6c757d',
                    cursor: 'pointer',
                    padding: '0',
                    fontSize: '14px'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Allergens */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Allergens</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Add allergen"
              value={allergenInput}
              onChange={(e) => setAllergenInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={addAllergen}
              style={{
                backgroundColor: '#ffc107',
                color: '#212529',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {formData.allergens.map((allergen) => (
              <span
                key={allergen}
                style={{
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {allergen}
                <button
                  type="button"
                  onClick={() => removeAllergen(allergen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#856404',
                    cursor: 'pointer',
                    padding: '0',
                    fontSize: '14px'
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Published Status */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            />
            Publish recipe (make it visible to others)
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Saving...' : (recipe ? 'Update Recipe' : 'Create Recipe')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;