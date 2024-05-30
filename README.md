# Express.js webserver

Handles post request for IoT device data and get requests for their retrieval
Built on node v18.17.1

## API

**GET** /devices  
Retrieves data from all devices

**GET** /devices/[topic]  
Retrieves data from selected device

**POST** /devices/[topic]  
Collects data from device by topic
