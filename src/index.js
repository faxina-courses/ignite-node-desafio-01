const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }
  
  request.user = user;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const id = uuidv4();
  const newUser = {
    id,
    name,
    username,
    todos: [],
  };
  users.push(newUser);

  response.status(201).send(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);
  response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const targetTodo = user.todos.find((todo) => todo.id === id);
  if (!targetTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }
  targetTodo.title = title;
  targetTodo.deadline = new Date(deadline);

  response.status(201).json(targetTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const targetTodo = user.todos.find((todo) => todo.id === id);

  if (!targetTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  targetTodo.done = true;

  response.status(201).json(targetTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const targetTodo = user.todos.find((todo) => todo.id === id);

  if (!targetTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }
  
  user.todos = user.todos.filter((todo) => todo.id !== id);

  response.status(204).json(user);
});

module.exports = app;
