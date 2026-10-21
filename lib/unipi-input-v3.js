module.exports = function (RED) {
    function UnipiInputNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.name = String(config.name);
        node.alias = config.alias;
        node.devices = config.devices;
        node.circuits = config.circuits;
        node.property = config.property;
        node.seedev = String(config.seedev);
        node.seecirc = String(config.seecirc);
        node.seeorig = String(config.seeorig);

        // Evok 3 sends the alias as it was set, without the prefix "al_" of Evok 2
        var _name = node.alias;

        // nodes saved with the former default "input" or with an altname of Evok
        var altnames = { "input": "di", "relay": "ro", "output": "do" };
        if (altnames[node.devices])
        {
            node.devices = altnames[node.devices];
        }

        var _circuit = node.circuits;
        for (let index = 0; index < (_circuit.length); index++)
        {
            _circuit = _circuit.replace(" ", "_");
            _circuit = _circuit.replace(".", "_");
        }

        node.on('input', function (msg) {
         
            var listOfDev = [];
            var listOfCir = [];
            var sendData = false;
            var state = false;
            var _parse = typeof(msg.payload);


            if (node.seeorig == "1") 
            {
                msg.orig = msg.payload;
            }


            if (node.alias == "")
            {
                state = false;
            } 
            else 
            {
                state = true;
            }

            if (_parse == "object") 
            {

            } 
            else if (_parse == "string")
            {
                try
                {
                    msg.payload = JSON.parse(msg.payload);
                }
                catch (err)
                {
                    node.error("Invalid JSON from Evok: " + err.message, msg);
                    return;
                }
            }
            else
            {
                node.warn("Message was not properly evaulated");
            }

            // Evok 3.1 sends an error of a command only to the client which sent it
            if (msg.payload !== null && !Array.isArray(msg.payload) && msg.payload.success === false)
            {
                node.error("Evok error: " + JSON.stringify(msg.payload.errors), msg);
                return;
            }


            if (typeof (msg.payload.length) == "undefined")
            {
                msg.payload = [msg.payload];
            }


            for (let index = 0; index < msg.payload.length; index++)
             {
                if (msg.payload[index].dev == null) 
                {
                    listOfDev.push("missing");
                } 
                else
                {
                    listOfDev.push(msg.payload[index].dev);
                }
            }


            for (let index = 0; index < msg.payload.length; index++)
             {
                if (msg.payload[index].circuit == null)
                {
                    listOfCir.push("missing");
                } 
                else 
                {
                    listOfCir.push(msg.payload[index].circuit);
                }
            }

            
            if (node.seedev == "1")
            {
                msg.seedev = { "List of dev": listOfDev };
            }

            
            if (node.seecirc == "1") 
            {
               msg.seecirc = { "List of cir": listOfCir };
            }


            if (state == true) {
                for (let index = 0; index < msg.payload.length; index++) {

                    if (msg.payload[index].alias == _name) {
                        msg.payload = msg.payload[index];
                        sendData = true;
                        
                    }

                }
            }


            if (state == false) {
                for (let index = 0; index < msg.payload.length; index++) {
                    if ((msg.payload[index].dev == node.devices) && (msg.payload[index].circuit == _circuit)) {
                        msg.payload = msg.payload[index];
                        sendData = true;

                    }
                }
            }


            if (state == true) {
                if (node.property !== "")
                 {
                    if (typeof (msg.payload[node.property]) != "undefined") 
                    {
                        msg.payload = msg.payload[node.property];
                        msg.topic = node.property;
                        sendData = true;
                    }
                }

            }
            else if (state == false) 
            {
                if (node.devices !== "" && node.circuits !== "" && node.property !== "") 
                {
                    if (typeof (msg.payload[node.property]) != "undefined") 
                    {
                        msg.payload = msg.payload[node.property];
                        msg.topic = node.property;
                        sendData = true;
                    }
                }
            }


            if (sendData == true) 
            {
                node.send(msg);
            }
            else 
            {
                node.send(null);
            }

        });

    }
    RED.nodes.registerType("unipi-input-v3", UnipiInputNode);
}