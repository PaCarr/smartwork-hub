const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load proto
const packageDefinition = protoLoader.loadSync(
  __dirname + '/../../protos/shift.proto'
);

const shiftProto = grpc.loadPackageDefinition(packageDefinition).shift;

// Simple in memory storage
let shifts = [];

// Unary RPC; AssignShift
function assignShift(call, callback) {
  const data = call.request;

  if (!data.employee_id || !data.employee_name) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "Missing required employee details"
    });
  }

  const newShift = {
    employee_id: data.employee_id,
    employee_name: data.employee_name,
    shift_date: data.shift_date,
    shift_time: data.shift_time,
    role: data.role
  };

  shifts.push(newShift);

  console.log("New shift added:", newShift);

  callback(null, {
    success: true,
    message: `Shift assigned to ${data.employee_name}`
  });
}

// Start server
function main() {
  const server = new grpc.Server();

  server.addService(shiftProto.ShiftService.service, {
    AssignShift: assignShift
  });

  server.bindAsync(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("Shift Service running on port 50051");
      server.start();
    }
  );
}

main();