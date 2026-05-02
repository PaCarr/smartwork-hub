const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
  __dirname + '/../../protos/safety.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const safetyProto = grpc.loadPackageDefinition(packageDefinition).safety;

// Simple storage
let hazards = [];

// Unary RPC
function reportHazard(call, callback) {
  const data = call.request;

  if (!data.hazard_id || !data.description) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "Missing hazard details"
    });
  }

  hazards.push(data);

  console.log("Hazard reported:", data);

  callback(null, {
    success: true,
    message: "Hazard reported successfully"
  });
}

// Server Streaming
function streamSafetyAlerts(call) {
  hazards.forEach((hazard, index) => {
    setTimeout(() => {
      call.write({
        alert_id: hazard.hazard_id,
        location: hazard.location,
        description: hazard.description,
        status: "Active"
      });

      if (index === hazards.length - 1) {
        call.end();
      }
    }, index * 1000);
  });

  if (hazards.length === 0) {
    call.write({
      alert_id: "",
      location: "",
      description: "No alerts",
      status: "None"
    });
    call.end();
  }
}

// Client Streaming
function uploadSafetyChecks(call, callback) {
  let total = 0;
  let passed = 0;

  call.on('data', (check) => {
    total++;
    if (check.passed) passed++;
  });

  call.on('end', () => {
    callback(null, {
      total_checks: total,
      passed_checks: passed,
      failed_checks: total - passed,
      message: "Safety checks processed"
    });
  });
}

// Bidirectional
function liveEmergencyChannel(call) {
  call.on('data', (msg) => {
    console.log("Emergency message:", msg);

    call.write({
      sender: "Server",
      message: `Received: ${msg.message}`,
      level: msg.level,
      timestamp: new Date().toISOString()
    });
  });

  call.on('end', () => {
    call.end();
  });
}

// Start server
function main() {
  const server = new grpc.Server();

  server.addService(safetyProto.SafetyService.service, {
    ReportHazard: reportHazard,
    StreamSafetyAlerts: streamSafetyAlerts,
    UploadSafetyChecks: uploadSafetyChecks,
    LiveEmergencyChannel: liveEmergencyChannel
  });

  server.bindAsync(
    '0.0.0.0:50052',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Safety Service running on port ${port}`);
    }
  );
}

main();