import WebSocket from "ws";

const wss = new WebSocket.Server({
  port: 5273,
});

wss.on("connection", (ws) => {
  console.log("Client connected.");

  ws.on("message", (data) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
