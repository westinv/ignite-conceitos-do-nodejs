const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user["username"] === username);

  if (!user) {
    return response.status(404).json({ error: "User Not Found" });
  }
  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  if (!username)
    return response.status(400).json({ message: "Complete all the fields" });

  if (users.some((user) => user.username == username)) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/users", checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.status(200).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos).send();
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  if (!deadline) return response.status(400).send();

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;
  const { username } = request.headers;

  const todoToUpdate = user["todos"].find((todo) => todo["id"] == id);

  if (!todoToUpdate)
    return response.status(404).json({ error: "Todo not found" });

  todoToUpdate["title"] = title;
  todoToUpdate["deadline"] = deadline;

  return response.status(200).json(todoToUpdate);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoToUpdate = user.todos.find((todo) => todo.id === id);

  if (!todoToUpdate) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }
  todoToUpdate.done = true;
  return response.status(200).json(todoToUpdate);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const exists = user.todos.some((todo) => todo.id === id);

  if (!exists)
    return response.status(404).json({ error: "Todo does not exist" });

  user.todos.splice(id, 1);

  return response.status(204).send();
});

module.exports = app;