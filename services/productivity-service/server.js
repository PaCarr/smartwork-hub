const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
  __dirname + '/../../protos/productivity.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const productivityProto = grpc.loadPackageDefinition(packageDefinition).productivity;

let tasks = [];

// Unary RPC
function createTask(call, callback) {
  const data = call.request;

  if (!data.task_id || !data.employee_name || !data.task_name) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "Missing required task details"
    });
  }

  tasks.push(data);

  console.log("Task created:", data);

  callback(null, {
    success: true,
    message: `Task '${data.task_name}' created for ${data.employee_name}`
  });
}

// Server streaming RPC
function streamTaskProgress(call) {
  const { employee_id } = call.request;

  const employeeTasks = tasks.filter(task => task.employee_id === employee_id);

  if (employeeTasks.length === 0) {
    call.write({
      task_id: "",
      task_name: "",
      progress_percent: 0,
      status: "No tasks found"
    });
    call.end();
    return;
  }

  employeeTasks.forEach((task, index) => {
    setTimeout(() => {
      call.write({
        task_id: task.task_id,
        task_name: task.task_name,
        progress_percent: 50,
        status: "In progress"
      });

      if (index === employeeTasks.length - 1) {
        call.end();
      }
    }, index * 1000);
  });
}

// Client streaming RPC
function submitWorkLogs(call, callback) {
  let totalEntries = 0;
  let totalHours = 0;

  call.on('data', (log) => {
    console.log("Work log received:", log);

    totalEntries++;
    totalHours += log.hours_worked;
  });

  call.on('end', () => {
    callback(null, {
      total_entries: totalEntries,
      total_hours: totalHours,
      productivity_message: "Work logs processed successfully"
    });
  });

  call.on('error', (err) => {
    console.error("Error receiving work logs:", err);
  });
}

// Bidirectional streaming RPC
function liveTaskCollaboration(call) {
  call.on('data', (msg) => {
    console.log("Collaboration message:", msg);

    call.write({
      sender: "Server",
      message: `Task update received: ${msg.message}`,
      task_id: msg.task_id,
      timestamp: new Date().toISOString()
    });
  });

  call.on('end', () => {
    call.end();
  });

  call.on('error', (err) => {
    console.error("Collaboration stream error:", err);
  });
}

function main() {
  const server = new grpc.Server();

  server.addService(productivityProto.ProductivityService.service, {
    CreateTask: createTask,
    StreamTaskProgress: streamTaskProgress,
    SubmitWorkLogs: submitWorkLogs,
    LiveTaskCollaboration: liveTaskCollaboration
  });

  server.bindAsync(
    '0.0.0.0:50053',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Failed to start Productivity Service:", err);
        return;
      }

      console.log(`Productivity Service running on port ${port}`);
    }
  );
}

main();