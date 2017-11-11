const reqHttp = require(`http`);
const path = require(`path`);
const express = require(`express`);
const socketio = require(`socket.io`);

const app = express();
const http = reqHttp.Server(app);
const io = socketio(http);

// Make this configurable later
let password;

// Callbacks invoked for electron thread
let callbacks = {
  onPair: () => {},
  onCommand: () => {}
};

let isAuthenticated = false;

// Server controller app
app.use(express.static(path.join(__dirname, `..`, `controller`, `build`)));

io.on(`connection`, (socket) => {
  socket.on(`pair`, (user) => {
    if (password && user.password === password) {
      isAuthenticated = true;
      callbacks.onPair(user.name);
    }
  });

  socket.on(`command`, (cmd) => {
    if (isAuthenticated)
      callbacks.onCommand(cmd);
  });
});

module.exports = function startServer(cbs, pw) {
  callbacks = cbs;
  password = pw;
  http.listen(3000);
}
