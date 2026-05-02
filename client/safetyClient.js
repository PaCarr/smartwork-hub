const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load proto
const packageDefinition = protoLoader.loadSync(
  __dirname + '/../protos/safety.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const safetyProto = grpc.loadPackageDefinition(packageDefinition).safety;

// Create client
const client = new safetyProto.SafetyService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

// Unary RPC
function testReportHazard() {
  client.ReportHazard(
    {
      hazard_id: "H1",
      location: "Warehouse",
      description: "Spill on floor",
      severity: 3
    },
    (error, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log("ReportHazard Response:", response);
      }
    }
  );
}

// Server streaming
function testStreamAlerts() {
  const call = client.StreamSafetyAlerts({
    location: "Warehouse"
  });

  call.on('data', (data) => {
    console.log("Safety Alert:", data);
  });

  call.on('end', () => {
    console.log("Alert stream ended");
  });

  call.on('error', (err) => {
    console.error("Stream error:", err.message);
  });
}

// Run tests
testReportHazard();

setTimeout(() => {
  testStreamAlerts();
}, 1000);