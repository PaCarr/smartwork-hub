const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load proto
const packageDefinition = protoLoader.loadSync(
  __dirname + '/../protos/shift.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const shiftProto = grpc.loadPackageDefinition(packageDefinition).shift;

// Create client
const client = new shiftProto.ShiftService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Test unary RPC
function testAssignShift() {
  client.AssignShift(
    {
      employee_id: "1",
      employee_name: "Paul",
      shift_date: "2026-05-01",
      shift_time: "09:00",
      role: "Manager"
    },
    (error, response) => {
      if (error) {
        console.error(error);
      } else {
        console.log("AssignShift Response:", response);
      }
    }
  );
}

// Test server streaming
function testStreamSchedule() {
  const call = client.StreamScheduleUpdates({
    shift_date: "2026-05-01"
  });

  call.on('data', (data) => {
    console.log("Streamed update:", data);
  });

  call.on('end', () => {
    console.log("Stream ended");
  });

  call.on('error', (error) => {
  console.error("Stream error:", error.message);
});

}

// Run tests
testAssignShift();

setTimeout(() => {
  testStreamSchedule();
}, 1000);