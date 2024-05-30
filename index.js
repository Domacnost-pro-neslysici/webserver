const express = require("express");
const PORT = 8080;
app = express();

app.use(express.json());

let data = {
  esp32_doorbell: false,
  esp32_kettle: "not boiling",
  esp32_alarm: "off",
  esp32_fridge: "closed",
};

app.post("/devices/:topic", (req, res) => {
  const { topic } = req.params;
  const { message } = req.body;

  if (!message) {
    res.status(400).send({ message: "No message given!" });
  } else {
    if (!data.hasOwnProperty(topic)) {
      data = { ...data, [topic]: message };
    } else {
      data[topic] = message;
    }
    res.status(200).send({ message: `Recieved, ${message}` });
    console.log(data);
  }
});
app.get("/devices/", (req, res) => {
  if (data) {
    res.status(200).send(data);
  } else {
    res.status(200).send({ message: "No data available" });
  }
});

app.get("/devices/:topic", (req, res) => {
  const { topic } = req.params;
  if (data[topic]) {
    res.status(200).send(data[topic]);
  } else {
    res.status(404).send({ message: `${topic} does not exist` });
  }
});

app.listen(PORT, () => console.log(`its alive on http://localhost:${PORT}`));
