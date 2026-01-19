import { useState, useEffect } from 'react'
import './App.css'
import supabase from './supabase-client.js'

function App() {
  const [todoList, setTodoList] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.className = `${theme}-theme`;
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchTodoList()
  }, [])

  const fetchTodoList = async () => {
    const { data, error } = await supabase.from("TodoList").select("*").order("id", { ascending: true })
    if (error) {
      console.log("Error fetching todo list:", error)
    } else {
      setTodoList(data || [])
    }
  }

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const newTodoData = {
      name: newTodo,
      isCompleted: false
    }
    const { data, error } = await supabase.from("TodoList").insert([newTodoData]).select()
    if (error) {
      console.log("Error adding todo:", error)
    } else {
      if (data) {
        setTodoList((prev) => [...prev, ...data]);
      }
      setNewTodo('')
    }
  }

  const deleteTodo = async (id) => {
    const { error } = await supabase.from("TodoList").delete().eq("id", id)
    if (error) {
      console.log("Error deleting todo:", error)
    } else {
      setTodoList((prev) => prev.filter((todo) => todo.id !== id))
    }
  }

  const toggleComplete = async (id, isCompleted) => {
    const { data, error } = await supabase.from("TodoList").update({ isCompleted: !isCompleted }).eq("id", id).select()
    if (error) {
      console.log("Error updating todo:", error)
    } else {
      if (data) {
        setTodoList((prev) => prev.map((todo) => todo.id === id ? data[0] : todo))
      }
    }
  }

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="container">
      <div className="todo-card">
        <div className="app-header">
          <h1>Todo List</h1>
          <button className="theme-switcher" onClick={toggleTheme}>
            <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
        </div>
        <div className="input-group">
          <input
            type="text"
            placeholder='What needs to be done?'
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
          />
          <button className="add-btn" onClick={addTodo}>
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
        <ul className="todo-list">
          {todoList.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.isCompleted ? 'completed' : ''}`}>
              <span className="todo-text">{todo.name}</span>
              <div className="actions">
                {todo.isCompleted ? (
                  <button
                    className="undo-btn"
                    onClick={() => toggleComplete(todo.id, todo.isCompleted)}
                  >
                    <i className="fa-solid fa-rotate-left"></i>
                  </button>
                ) : (
                  <button
                    className="complete-btn"
                    onClick={() => toggleComplete(todo.id, todo.isCompleted)}
                  >
                    <i className="fa-solid fa-check"></i>
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
