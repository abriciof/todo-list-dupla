import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = "http://localhost:5555/tasks";

function App() {
  const [tasks, setTasks] = useState({ todo_1: [], todo_2: [] });
  const [task1, setTask1] = useState('');
  const [task2, setTask2] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    buscarTarefas();
  }, []);

  const buscarTarefas = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  };

  const handleInputChange = (e, todoId) => {
    if (todoId === 'todo_1') {
      setTask1(e.target.value);
    } else {
      setTask2(e.target.value);
    }
  };

  const adicionarTarefa = async (todoId) => {
    const taskContent = todoId === 'todo_1' ? task1 : task2;
    if (taskContent.trim()) {
      try {
        await axios.post(API_URL, { task: taskContent, todo_id: todoId });
        buscarTarefas();
        if (todoId === 'todo_1') {
          setTask1('');
        } else {
          setTask2('');
        }
      } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
      }
    }
  };

  const deletarTarefa = async (todoId, taskId) => {
    console.log(todoId);
    console.log(taskId);
    try {
      await axios.delete(`${API_URL}/${todoId}/${taskId}`);
      buscarTarefas();
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    const results = [];
    if (e.target.value.trim()) {
      Object.keys(tasks).forEach(todoId => {
        tasks[todoId].forEach(task => {
          if (task.task.includes(e.target.value)) {
            results.push({ ...task, todoId });
          }
        });
      });
    }
    setSearchResults(results);
  };

  return (
    <div className="App container">
       <div className="row my-5">
        <div className="col-3">
          <h2>Buscar Tarefas</h2>
          <div className="input-group mb-3">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              className="form-control"
              placeholder="Buscar tarefas"
            />
          </div>
          <ul className="list-group">
            {searchResults.map(result => (
              <li key={`${result.id}-${result.todoId}`} className="list-group-item">
                {result.task} ({result.todoId})
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="row my-5">
        <div className="col">
          <h2>To-Do 1</h2>
          <div className="input-group mb-3">
            <input
              type="text"
              value={task1}
              onChange={(e) => handleInputChange(e, 'todo_1')}
              className="form-control"
              placeholder="Adicionar uma nova tarefa"
            />
            <button className="btn btn-primary" onClick={() => adicionarTarefa('todo_1')}>Adicionar</button>
          </div>
          <ul className="list-group">
            {tasks.todo_1.map(task => (
              <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                {task.task}
                <button className="btn btn-danger btn-sm" onClick={() => deletarTarefa('todo_1', task.id)}>Deletar</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="col">
          <h2>To-Do 2</h2>
          <div className="input-group mb-3">
            <input
              type="text"
              value={task2}
              onChange={(e) => handleInputChange(e, 'todo_2')}
              className="form-control"
              placeholder="Adicionar uma nova tarefa"
            />
            <button className="btn btn-primary" onClick={() => adicionarTarefa('todo_2')}>Adicionar</button>
          </div>
          <ul className="list-group">
            {tasks.todo_2.map(task => (
              <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                {task.task}
                <button className="btn btn-danger btn-sm" onClick={() => deletarTarefa('todo_2', task.id)}>Deletar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

     
    </div>
  );
}

export default App;