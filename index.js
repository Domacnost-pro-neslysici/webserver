const express = require("express");
app = express();
const { json } = require("express/lib/response");
const PORT = 8080;

var mqtt = require("mqtt");

app.use(express.json());

var MQTT_TOPIC_SUB = "esp32/#";
var MQTT_TOPIC_PUB = "esp32/doorbell";
var MQTT_ADDR = "mqtt://192.168.62.112";
var MQTT_PORT = 1883;

var client = mqtt.connect(MQTT_ADDR, {
  clientId: "bgtestnodejs",
  protocolId: "MQIsdp",
  protocolVersion: 3,
  connectTimeout: 1000,
  debug: true,
});

let data = {
  esp32_doorbell: false,
  esp32_kettle: "not boiling",
  esp32_alarm: "off",
  esp32_fridge: "closed",
};

client.on("connect", function () {
  client.subscribe(MQTT_TOPIC_SUB);
  client.publish(MQTT_TOPIC_PUB, "Hello mqtt");
});

client.on("message", function (topic, message) {
  // message is Buffer
  let dataTopics = Object.keys(data);
  let topicExist = true;

  for (i = 0; i < dataTopics.length; i++) {
    let currentTopic = dataTopics[i].replace("_", "/");

    if (topic.toString() == currentTopic) {
      data[dataTopics[i]] = message.toString();
      i = dataTopics.length;
    } else {
      topicExist = false;
    }
  }
  if (!topicExist) {
    data = { ...data, [topic.replace("/", "_")]: message.toString() };
  }

  console.log(message.toString());
  //client.end();
});

client.on("error", function () {
  console.log("ERROR");
  //client.end()
});

app.post("/devices/:topic", (req, res) => {
  const { topic } = req.params;
  const { message } = req.body;

  if (!message) {
    res.status(400).send({ message: "No message given!" });
  } else {
    if (!data.hasOwnProperty(topic)) {
      console.log(topic);
      data = { ...data, [topic]: message };
    } else {
      data[topic] = message;
      console.log(topic);
    }
    res.status(200).send({ message: `Recieved, ${message}` });
    console.log(data);
  }
  console.log("Topic: " + topic);
  if (topic == "esp32_alarm") {
    setTimeout(() => {
      client.publish(MQTT_TOPIC_PUB, "ring");
    }, message);
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
