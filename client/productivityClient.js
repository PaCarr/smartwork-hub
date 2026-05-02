const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
  __dirname + '/../protos/productivity.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const productivityProto = grpc.loadPackageDefinition(packageDefinition).productivity;

const client = new productivityProto.ProductivityService(
  'localhost:50053',
  grpc.credentials.createInsecure()
);

// Unary
function testCreateTask() {
  client.CreateTask(
    {
      task_id: "T1",
      employee_id: "1",
      employee_name: "Paul",
      task_name: "Stock Check"
    },
    (err, res) => {
      if (err) console.error(err);
      else console.log("CreateTask Response:", res);
    }
  );
}

// Server streaming
function testStreamProgress() {
  const call = client.StreamTaskProgress({
    employee_id: "1"
  });

  call.on('data', (data) => {
    console.log("Task Progress:", data);
  });

  call.on('end', () => {
    console.log("Progress stream ended");
  });

  call.on('error', (err) => {
    console.error("Stream error:", err.message);
  });
}

// Run tests
testCreateTask();

setTimeout(() => {
  testStreamProgress();
}, 1000);