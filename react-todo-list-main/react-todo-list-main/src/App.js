import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faCheck } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('none');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const editInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      alert('Task cannot be empty');
      return;
    }
    if (tasks.some(task => task.text.toLowerCase() === trimmed.toLowerCase())) {
      alert('Task already exists');
      return;
    }
    setTasks(prev => [
      ...prev,
      { id: Date.now(), text: trimmed, completed: false },
    ]);
    setInput('');
  };

  const toggleCompleted = (id) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingText('');
    }
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => !task.completed));
    if (editingId !== null) {
      setEditingId(null);
      setEditingText('');
    }
  };

  const startEditing = (id, currentText) => {
    setEditingId(id);
    setEditingText(currentText);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEditing = () => {
    const trimmed = editingText.trim();
    if (!trimmed) {
      alert('Task cannot be empty');
      return;
    }
    if (
      tasks.some(
        task =>
          task.text.toLowerCase() === trimmed.toLowerCase() && task.id !== editingId
      )
    ) {
      alert('Task already exists');
      return;
    }
    setTasks(prev =>
      prev.map(task =>
        task.id === editingId ? { ...task, text: trimmed } : task
      )
    );
    setEditingId(null);
    setEditingText('');
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks];
  if (sort === 'asc') {
    sortedTasks.sort((a, b) => a.text.localeCompare(b.text));
  } else if (sort === 'desc') {
    sortedTasks.sort((a, b) => b.text.localeCompare(a.text));
  }

  const incompleteCount = tasks.filter(task => !task.completed).length;

  return (
    <div className="app-container">
      <h1 className="title">Get Things Done!</h1>

      <div className="input-section">
        <input
          type="text"
          placeholder="Add a task"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          className="task-input"
          aria-label="Add new task"
        />
        <button onClick={addTask} className="add-btn" aria-label="Add task">
          Add Task
        </button>
      </div>

      <div className="filter-sort-section">
        <div>
          <label>
            Filter:{' '}
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="select"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Sort:{' '}
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="select"
            >
              <option value="none">None</option>
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </label>
        </div>
      </div>

      <ul className="task-list">
        {sortedTasks.length === 0 ? (
          <li className="no-tasks">No tasks to display</li>
        ) : (
          sortedTasks.map(task => (
            <li
              key={task.id}
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleCompleted(task.id)}
                className="checkbox"
                aria-label={`Mark ${task.text} as completed`}
              />

              {editingId === task.id ? (
                <input
                  ref={editInputRef}
                  className="edit-input"
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  onBlur={saveEditing}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEditing();
                    else if (e.key === 'Escape') cancelEditing();
                  }}
                  aria-label={`Edit task ${task.text}`}
                />
              ) : (
                <span
                  className="task-text"
                  tabIndex={0}
                  aria-label={`Task: ${task.text}. Double click or press edit to update.`}
                >
                  {task.text}
                </span>
              )}

              <div className="icon-btns">
                {editingId === task.id ? (
                  <button
                    className="icon-btn save-btn"
                    onClick={saveEditing}
                    aria-label="Save"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                ) : (
                  <button
                    className="icon-btn edit-btn"
                    onClick={() => startEditing(task.id, task.text)}
                    aria-label="Edit"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                )}
                <button
                  className="icon-btn delete-btn"
                  onClick={() => deleteTask(task.id)}
                  aria-label="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="footer">
        <span>{incompleteCount} task{incompleteCount !== 1 ? 's' : ''} left</span>
        <button
          onClick={clearCompleted}
          className="clear-btn"
          disabled={tasks.filter(t => t.completed).length === 0}
        >
          Clear Completed
        </button>
      </div>
    </div>
  );
}

export default App;
