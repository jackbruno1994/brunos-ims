import React, { useState, useEffect } from 'react';
import { searchService, analyticsService } from '../services/orderProcessingService';

interface QuickAccessItem {
  id: string;
  type: 'recipe' | 'ingredient' | 'menu_item' | 'prep_task';
  title: string;
  description: string;
  status?: 'pending' | 'in_progress' | 'completed';
  estimatedTime?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface QuickAccessModeProps {
  userId: string;
  restaurantId: string;
  role: string;
}

const QuickAccessMode: React.FC<QuickAccessModeProps> = ({ userId, restaurantId, role }) => {
  const [quickAccessItems, setQuickAccessItems] = useState<QuickAccessItem[]>([]);
  const [currentTasks, setCurrentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadQuickAccessItems();
    loadCurrentTasks();

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId, restaurantId]);

  const loadQuickAccessItems = async () => {
    try {
      const items = await searchService.getQuickAccessItems(userId);
      setQuickAccessItems(items);
    } catch (error) {
      console.error('Failed to load quick access items:', error);
    }
  };

  const loadCurrentTasks = async () => {
    try {
      // Load tasks based on user role
      const dashboard = await analyticsService.getRoleDashboard(restaurantId, userId, role);
      
      if (role === 'line_cook') {
        setCurrentTasks(dashboard.assignedOrders || []);
      } else if (role === 'prep_cook') {
        setCurrentTasks(dashboard.assignedTasks || []);
      }
    } catch (error) {
      console.error('Failed to load current tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string, taskType: string) => {
    try {
      // Queue operation for offline sync if offline
      if (!isOnline) {
        // TODO: Queue offline operation
        console.log('Queuing task completion for offline sync');
      }

      // Update task status locally
      setCurrentTasks(tasks => 
        tasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed', completedAt: new Date() }
            : task
        )
      );

      // TODO: Make API call to complete task
      console.log(`Completing ${taskType} task: ${taskId}`);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const markStepComplete = async (taskId: string, stepIndex: number) => {
    try {
      setCurrentTasks(tasks => 
        tasks.map(task => {
          if (task.id === taskId && task.steps) {
            const updatedSteps = [...task.steps];
            updatedSteps[stepIndex] = {
              ...updatedSteps[stepIndex],
              status: 'completed',
              completedAt: new Date()
            };
            return { ...task, steps: updatedSteps };
          }
          return task;
        })
      );

      console.log(`Marking step ${stepIndex} complete for task ${taskId}`);
    } catch (error) {
      console.error('Failed to mark step complete:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'normal': return '#28a745';
      case 'low': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in_progress': return '#007bff';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="quick-access-loading">
        <div className="loading-spinner"></div>
        <p>Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="quick-access-mode">
      <div className="quick-access-header">
        <h2>Quick Access Mode</h2>
        <div className="status-indicators">
          <span className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
          <span className="role-badge">{role.replace('_', ' ').toUpperCase()}</span>
        </div>
      </div>

      <div className="quick-access-grid">
        {/* Quick Access Items */}
        <div className="quick-access-section">
          <h3>Quick Access</h3>
          <div className="quick-items-grid">
            {quickAccessItems.map(item => (
              <div 
                key={item.id} 
                className="quick-item"
                onClick={() => {
                  searchService.recordSelection(userId, item.id);
                  // Navigate to item details
                }}
              >
                <div className="item-icon">
                  {item.type === 'recipe' && '👨‍🍳'}
                  {item.type === 'ingredient' && '🥕'}
                  {item.type === 'menu_item' && '🍽️'}
                  {item.type === 'prep_task' && '📋'}
                </div>
                <div className="item-info">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Tasks */}
        <div className="current-tasks-section">
          <h3>Current Tasks</h3>
          <div className="tasks-list">
            {currentTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <h4>{task.title || task.name}</h4>
                  <div className="task-meta">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                {task.estimatedTime && (
                  <div className="task-timing">
                    <span>⏱️ Est. {task.estimatedTime} min</span>
                  </div>
                )}

                {task.steps && (
                  <div className="task-steps">
                    <h5>Steps:</h5>
                    {task.steps.map((step: any, index: number) => (
                      <div key={index} className="step-item">
                        <label className="step-checkbox">
                          <input 
                            type="checkbox"
                            checked={step.status === 'completed'}
                            onChange={() => markStepComplete(task.id, index)}
                          />
                          <span className="step-text">{step.instruction}</span>
                        </label>
                        {step.estimatedTime && (
                          <span className="step-time">({step.estimatedTime}min)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="task-actions">
                  {task.status !== 'completed' && (
                    <button 
                      className="complete-task-btn"
                      onClick={() => completeTask(task.id, task.type || 'task')}
                    >
                      ✅ Mark Complete
                    </button>
                  )}
                  {task.notes && (
                    <div className="task-notes">
                      <strong>Notes:</strong> {task.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {currentTasks.length === 0 && (
              <div className="no-tasks">
                <p>🎉 No tasks assigned right now. Great work!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .quick-access-mode {
          padding: 20px;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .quick-access-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .status-indicators {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .connection-status {
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 14px;
          font-weight: bold;
        }

        .connection-status.online {
          background: #d4edda;
          color: #155724;
        }

        .connection-status.offline {
          background: #f8d7da;
          color: #721c24;
        }

        .role-badge {
          padding: 5px 12px;
          background: #007bff;
          color: white;
          border-radius: 15px;
          font-size: 12px;
          font-weight: bold;
        }

        .quick-access-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 30px;
        }

        .quick-access-section, .current-tasks-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .quick-items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .quick-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-item:hover {
          border-color: #007bff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .item-icon {
          font-size: 24px;
        }

        .item-info h4 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }

        .item-info p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .task-card {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          background: #fff;
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .task-meta {
          display: flex;
          gap: 10px;
        }

        .priority-badge, .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .task-timing {
          margin-bottom: 15px;
          color: #666;
        }

        .task-steps {
          margin-bottom: 20px;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          padding: 8px;
          border-radius: 4px;
          background: #f8f9fa;
        }

        .step-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          flex: 1;
        }

        .step-text {
          flex: 1;
        }

        .step-time {
          color: #666;
          font-size: 12px;
        }

        .task-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .complete-task-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .complete-task-btn:hover {
          background: #218838;
        }

        .task-notes {
          margin-top: 10px;
          padding: 10px;
          background: #fff3cd;
          border-radius: 4px;
          font-size: 14px;
        }

        .no-tasks {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .quick-access-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .quick-access-grid {
            grid-template-columns: 1fr;
          }
          
          .quick-items-grid {
            grid-template-columns: 1fr;
          }
        }
        `
      }} />
    </div>
  );
};

export default QuickAccessMode;