import React, { useState } from 'react';
import { apiService } from '../services/api';
import { RecipeNote } from '../types/recipe';

interface RecipeNotesProps {
  recipeId: string;
  recipeName: string;
  notes: RecipeNote[];
  onClose: () => void;
  onNotesUpdate: (notes: RecipeNote[]) => void;
}

const RecipeNotes: React.FC<RecipeNotesProps> = ({
  recipeId,
  recipeName,
  notes: initialNotes,
  onClose,
  onNotesUpdate
}) => {
  const [notes, setNotes] = useState<RecipeNote[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'general' | 'modification' | 'tip' | 'warning'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock user data - in real app this would come from auth context
  const currentUser = {
    id: 'user-001',
    name: 'Chef Mario'
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      setError('Please enter a note');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const noteData = {
        note: newNote.trim(),
        type: noteType,
        userId: currentUser.id,
        userName: currentUser.name
      };

      const savedNote = await apiService.addRecipeNote(recipeId, noteData);
      const updatedNotes = [...notes, savedNote];
      setNotes(updatedNotes);
      onNotesUpdate(updatedNotes);
      
      // Reset form
      setNewNote('');
      setNoteType('general');
    } catch (err) {
      setError('Failed to add note');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'tip': return '#28a745';
      case 'warning': return '#dc3545';
      case 'modification': return '#ffc107';
      case 'general': return '#007bff';
      default: return '#6c757d';
    }
  };

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'tip': return '💡';
      case 'warning': return '⚠️';
      case 'modification': return '🔧';
      case 'general': return '📝';
      default: return '📝';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Recipe Notes - {recipeName}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        {/* Add New Note */}
        <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h3>Add New Note</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="noteType" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Note Type:
            </label>
            <select
              id="noteType"
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as any)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                marginBottom: '10px'
              }}
            >
              <option value="general">General Note</option>
              <option value="tip">Chef's Tip</option>
              <option value="modification">Recipe Modification</option>
              <option value="warning">Warning/Caution</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="newNote" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Note:
            </label>
            <textarea
              id="newNote"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note here..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                resize: 'vertical',
                fontSize: '14px'
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#dc3545', marginBottom: '10px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleAddNote}
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'Adding...' : 'Add Note'}
          </button>
        </div>

        {/* Existing Notes */}
        <div>
          <h3>Notes ({notes.length})</h3>
          
          {notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <p>No notes yet. Add the first note to start collaborating!</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    marginBottom: '15px',
                    padding: '15px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${getNoteTypeColor(note.type)}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{getNoteTypeIcon(note.type)}</span>
                      <span
                        style={{
                          backgroundColor: getNoteTypeColor(note.type),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          textTransform: 'capitalize'
                        }}
                      >
                        {note.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'right' }}>
                      <div>{note.userName}</div>
                      <div>{formatDate(note.createdAt)}</div>
                    </div>
                  </div>
                  
                  <p style={{ margin: 0, lineHeight: '1.5' }}>{note.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Summary */}
        {notes.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
            <h4>Notes Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', fontSize: '14px' }}>
              <div><strong>Tips:</strong> {notes.filter(n => n.type === 'tip').length}</div>
              <div><strong>Warnings:</strong> {notes.filter(n => n.type === 'warning').length}</div>
              <div><strong>Modifications:</strong> {notes.filter(n => n.type === 'modification').length}</div>
              <div><strong>General:</strong> {notes.filter(n => n.type === 'general').length}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeNotes;