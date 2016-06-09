##This program can achieve basic communication between device and Azure IoT hub

This program is using Node.js and running on Raspberry Pi

Require **socket.io**
```
$ npm install socket.io
```

Open **test.js**, navigate to
```
var connectionString = '[Your connection string]';
```
Replace the `[Your connection string]`

Save and run:
```
$ node test.js
```

At last go to 
```
127.0.0.1:8080
```
