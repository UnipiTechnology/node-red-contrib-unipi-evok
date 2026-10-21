module.exports = function (RED) {
    function UnipiDevicesNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.name = config.name;
        node.devices = config.devices || "all";

        // the device types of the choice, the 1-Wire sensors are sent as "temp" and "1wdevice"
        var types = {
            "1wire": ["temp", "1wdevice"]
        };

        // the devices seen in the messages of Evok, by "dev circuit"
        var known = {};

        function selected(dev)
        {
            if (node.devices == "all")
            {
                return true;
            }
            return (types[node.devices] || [node.devices]).indexOf(dev) >= 0;
        }

        function describe(state)
        {
            var item = { "dev": state.dev, "circuit": state.circuit };
            if (state.alias)
            {
                item.alias = state.alias;
            }
            if (state.address !== undefined)
            {
                item.address = state.address;
            }
            if (state.type !== undefined)
            {
                item.type = state.type;
            }
            return item;
        }

        node.on('input', function (msg) {

            var states = msg.payload;

            if (typeof (states) == "string")
            {
                try
                {
                    states = JSON.parse(states);
                }
                catch (err)
                {
                    // not a message of Evok, e.g. a trigger of the flow
                    return;
                }
            }

            if (states === null || typeof (states) != "object")
            {
                return;
            }

            // the reply to "all" and the events are lists, the reply to "full" is one state
            if (!Array.isArray(states))
            {
                states = [states];
            }

            var changed = false;

            for (let index = 0; index < states.length; index++)
            {
                var state = states[index];
                if (state === null || typeof (state) != "object" || state.dev == null || state.circuit == null)
                {
                    continue;
                }
                if (!selected(state.dev))
                {
                    continue;
                }

                var key = state.dev + " " + state.circuit;
                var item = describe(state);
                if (JSON.stringify(known[key]) != JSON.stringify(item))
                {
                    known[key] = item;
                    changed = true;
                }
            }

            if (changed == false)
            {
                return;
            }

            var list = Object.keys(known).sort().map(function (key) { return known[key]; });

            node.status({ fill: "green", shape: "dot", text: list.length + " devices" });

            msg.payload = list;
            msg.topic = "devices";
            node.send(msg);

        });

    }
    RED.nodes.registerType("unipi-devices-v3", UnipiDevicesNode);
}
