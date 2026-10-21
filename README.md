# node-red-contrib-unipi-evok
This module provides nodes in Node-RED to quickly access the Unipi device. For more information about Unipi devices see <a href="https://www.unipi.technology/">here</a>.

The nodes communicate with the Unipi device through the WebSocket API of the <a href="https://github.com/UnipiTechnology/evok">EVOK</a> utility.

## Pre-requisites

The node-red-contrib-unipi-evok requires <a href="https://nodered.org">Node-RED</a> to be installed.

## Install

 Use the `Menu - Manage palette` to install the Unipi nodes and search for `@unipitechnology/node-red-contrib-unipi-evok`or use the keywords `evok` or `unipi` or run the following command in your Node-RED user directory (typically `~/.node-red`):

    npm install @unipitechnology/node-red-contrib-unipi-evok

## Usage

#### Basic information
Once `@unipitechnology/node-red-contrib-unipi-evok` is installed into the Node-RED these nodes are added:

   - **Unipi input v3** node (`unipi-input-v3`) - primary a filter for the Unipi data (from the websocket). Helps to easily access the needed data and work with them through the flow/s.
   - **Unipi output v3** node (`unipi-output-v3`) - helps to see the ***all*** data by the request, ***filter*** the choosen data or to ***set*** the features *relay*, *digital output* and *led* -> to switch ON/OFF or set *analog output* to desired value.
   - **Unipi devices v3** node (`unipi-devices-v3`) - lists the devices of the Unipi device with their circuits, aliases and the addresses of the 1-Wire sensors.
   - **Unipi input** and **Unipi output** nodes (`unipi-input`, `unipi-output`) - the original nodes for EVOK 2, they use the device names of EVOK 2 (`input`, `relay`). Use the v3 nodes with EVOK 3.

#### Preparation
EVOK 3.1 has to be installed on the Unipi device. Its WebSocket API is disabled by default, enable it in `/etc/evok/config.yaml` and restart EVOK by `systemctl restart evok`:

```yaml
apis:
  address: 127.0.0.1
  # ^ the default, enough when Node-RED runs on the Unipi device
  # ^ set it empty to listen on all interfaces when Node-RED runs on another computer
  websocket:
    enabled: true
```

The address of the WebSocket is `ws://[adress of the Unipi device]:8080/ws`, e.g. `ws://127.0.0.1:8080/ws` when Node-RED runs on the Unipi device. Set the websocket nodes as ***connect to*** this address.

If a `token` is set in the configuration of EVOK, add it to the address: `ws://[adress of the Unipi device]:8080/ws?token=[token]`. With the `read_token` the command ***set*** is refused. See the security in the <a href="https://github.com/UnipiTechnology/evok">EVOK documentation</a>.

#### Connection
Now only connect the *websocket input node* with the *Unipi input node* and/or the *Unipi output node* with the *websocket output node*. *Input* couple serves as a *data input (to Node-RED)* from the Unipi device and *output* couple serves as a *data output (from Node-RED)* to the Unipi device.

#### Devices and circuits
The device types are the types of EVOK 3: `ro` (relay), `di` (digital input), `do` (digital output), `ai`, `ao`, `led`, 1-Wire sensors (`temp`, `1wdevice`), `data_point` and `register`. The `register` is the deprecated REGISTER of EVOK 3.1, its circuits are e.g. `1_100` or `1_100_inp` of an input register; use DATA_POINT with `datatype: uint16` in EVOK and `data_point` in the nodes. The circuit is written as in the web interface of EVOK (e.g. `1.01`) or as in the messages (e.g. `1_01`).

An alias set in EVOK can be used in place of the circuit. It is written exactly as it was set in EVOK (e.g. `pump`). The *Unipi output v3* node needs also the device type of the aliased device, EVOK refuses an alias of another device type.

#### Filter
The command ***filter*** sets the device types whose changes EVOK sends: relays, digital inputs and outputs, analog inputs and outputs, leds, 1-Wire sensors, data points and registers. The disabled filter, or the enabled filter without any checked type, restores the default filter of EVOK, which sends the changes of all devices.

#### List of the devices
Connect the *Unipi devices v3* node to the *websocket input node* and send the command ***All*** by the *Unipi output v3* node. The node sends the list of the devices in `msg.payload`, e.g.:

```json
[{"dev": "ro", "circuit": "1_01", "alias": "pump"}, {"dev": "temp", "circuit": "284E2025090000FF", "address": "28.4E2025090000.FF", "type": "DS18B20"}]
```

The list can be limited to a device type, e.g. to the 1-Wire sensors. The node sends a new list only when a device appears (e.g. a new 1-Wire sensor) or its alias changes. The circuit from the list is used in the *Circuits* of the *Unipi input v3* node.

#### Errors
EVOK replies to an invalid command (e.g. ***set*** of an unknown circuit or alias, or with the `read_token`) with `{"success": false, "errors": {...}}` only to the websocket which sent it. The *Unipi input v3* node reports such reply as an error, which can be handled by the `catch` node, and sends no message. Every *Unipi input v3* node connected to the websocket reports it.

#### Example of the flow
```
[{"id":"1183c4dd.40bdcb","type":"tab","label":"Unipi","disabled":false,"info":""},{"id":"dbb4f694.5f6858","type":"inject","z":"1183c4dd.40bdcb","name":"","topic":"","payload":"true","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":265,"y":180,"wires":[["bda1b09.49cad5"]]},{"id":"b012802f.7d721","type":"debug","z":"1183c4dd.40bdcb","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":595,"y":119,"wires":[]},{"id":"3fe20ea9.48b9c2","type":"unipi-input-v3","z":"1183c4dd.40bdcb","name":"","alias":"","devices":"ro","circuits":"1.01","property":"","seedev":"0","seecirc":"0","seeorig":"0","x":425,"y":119,"wires":[["b012802f.7d721"]]},{"id":"bda1b09.49cad5","type":"unipi-output-v3","z":"1183c4dd.40bdcb","name":"","cmd":"set","alias":"","devices":"ro","circuits":"1.01","enableFil":"1","inputFil":"","relayFil":"","digoutFil":"","analoutFil":"","analinFil":"","ledFil":"","sensorFil":"","datapointFil":"","x":425,"y":201,"wires":[["544c7cc1.949a74"]]},{"id":"544c7cc1.949a74","type":"websocket out","z":"1183c4dd.40bdcb","name":"","server":"","client":"fa87ece.ccc5b1","x":686,"y":201,"wires":[]},{"id":"cac3232a.e0135","type":"websocket in","z":"1183c4dd.40bdcb","name":"","server":"","client":"fa87ece.ccc5b1","x":184,"y":119,"wires":[["3fe20ea9.48b9c2"]]},{"id":"f855be37.5bcbd","type":"inject","z":"1183c4dd.40bdcb","name":"","topic":"","payload":"false","payloadType":"bool","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":262,"y":220,"wires":[["bda1b09.49cad5"]]},{"id":"fa87ece.ccc5b1","type":"websocket-client","z":"","path":"ws://127.0.0.1:8080/ws","tls":"","wholemsg":"false"}]
```
#### Image of the example
![example](https://raw.githubusercontent.com/UniPiTechnology/node-red-contrib-unipi-evok/master/images/flow_example.png)
