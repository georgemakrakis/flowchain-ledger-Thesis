let WebSocketClient = require('websocket').client;
let ip = require('ip');
let fs = require('fs')

let client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket client connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        let deserialize = JSON.parse(message.utf8Data);
        let newMessage = {temperature: deserialize.temperature, timestampSend: deserialize.timestampSend,
        timestampReceived: Date.now()};
        console.log(newMessage);
    });

    //getFileReadyResponseTime();
    getFileReadyRTT();
    let limit = 0;
    function sendNumber() {
        if (connection.connected && limit!==10)
        {
            let number = Math.round(Math.random() * 0xFFFFFF);
            let lucky = Math.round(Math.random() * 100 + 1);
            let obj = {temperature: lucky, timestampSend: Date.now()};

            console.log('[SEND]', JSON.stringify(obj));

            connection.sendUTF(JSON.stringify(obj));

            //*******SECTION for Response Time*********
            // fs.appendFile('data_send_ResponseTime', obj.temperature + ',' + Date.now() + '\n', function (err) {
            //     if (err)
            //     {
            //         return console.log(err);
            //     }
            // });

            //*******SECTION for Service Time - RTT*********
            // client.on('RTT', function(connection) {
            //     //*******SECTION for RTT*********
            //     fs.appendFile('data_send_RTT', obj.temperature + ',' + Date.now() + '\n', function (err) {
            //         if (err)
            //         {
            //             return console.log(err);
            //         }
            //     });
            // });


            limit++;
            setTimeout(sendNumber, 1000);


        }
        else if(limit===10)
        {
            connection.close();
        }
    }

    sendNumber();
});

client.connect('ws://'+ip.address()+':8001/object/frontdoor/send', '');
//client.connect('ws://192.168.1.2:8001/object/frontdoor/send', '');

function getFileReadyResponseTime(){
    fs.writeFile('data_published_responseTime', '', function (err) {
        if (err)
        {
            return console.log(err);
        }
    });
    fs.appendFile('data_published_responseTime', 'message_num,time_created' + '\n', function (err) {
        if (err)
        {
            return console.log(err);
        }
    });
}

function getFileReadyRTT(){
    fs.writeFile('data_received_RTT', '', function (err) {
        if (err)
        {
            return console.log(err);
        }
    });
    fs.appendFile('data_received_RTT', 'message_num,time_send,time_received' + '\n', function (err) {
        if (err)
        {
            return console.log(err);
        }
    });
}



