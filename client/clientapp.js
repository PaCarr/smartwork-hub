const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// Load Shift Proto
const shiftPackage = protoLoader.loadSync(
  __dirname + '/../protos/shift.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);
const shiftProto = grpc.loadPackageDefinition(shiftPackage).shift;

// Create client for Shift Service
const shiftClient = new shiftProto.ShiftService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Example route (Assign Shift)
app.post('/assignShift', (req, res) => {
  shiftClient.AssignShift(req.body, (err, response) => {
    if (err) {
      return res.status(500).send(err.details);
    }
    res.send(response);
  });
});

app.post('/reportHazard', (req, res) => {
  safetyClient.ReportHazard(req.body, (err, response) => {
    if (err) {
      return res.status(500).send(err.details);
    }
    res.send(response);
  });
});

app.post('/createTask', (req, res) => {
  productivityClient.CreateTask(req.body, (err, response) => {
    if (err) {
      return res.status(500).send(err.details);
    }
    res.send(response);
  });
});

// Load Safety Proto
const safetyPackage = protoLoader.loadSync(
  __dirname + '/../protos/safety.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);
const safetyProto = grpc.loadPackageDefinition(safetyPackage).safety;

const safetyClient = new safetyProto.SafetyService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

// Load Productivity Proto
const productivityPackage = protoLoader.loadSync(
  __dirname + '/../protos/productivity.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);
const productivityProto = grpc.loadPackageDefinition(productivityPackage).productivity;

const productivityClient = new productivityProto.ProductivityService(
  'localhost:50053',
  grpc.credentials.createInsecure()
);

// Start server
app.listen(3000, () => {
  console.log('GUI running at http://localhost:3000');
});