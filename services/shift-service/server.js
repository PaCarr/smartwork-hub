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
  AssignShift: assignShift,
  StreamScheduleUpdates: streamScheduleUpdates,
  SubmitShiftLogs: submitShiftLogs
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

function streamScheduleUpdates(call) {
  const { shift_date } = call.request;

  const filteredShifts = shifts.filter(
    shift => shift.shift_date === shift_date
  );

  filteredShifts.forEach((shift, index) => {
    setTimeout(() => {
      call.write({
        employee_name: shift.employee_name,
        shift_time: shift.shift_time,
        role: shift.role,
        update_message: "Scheduled shift"
      });

      // End stream after last item
      if (index === filteredShifts.length - 1) {
        call.end();
      }
    }, index * 1000); // delay to simulate streaming
  });

  if (filteredShifts.length === 0) {
    call.write({
      employee_name: "",
      shift_time: "",
      role: "",
      update_message: "No shifts found for this date"
    });
    call.end();
  }
}

function submitShiftLogs(call, callback) {
  let totalHours = 0;
  let totalLogs = 0;

  call.on('data', (log) => {
    console.log("Received log:", log);

    totalLogs++;
    totalHours += log.hours_worked;
  });

  call.on('end', () => {
    console.log("All logs received");

    callback(null, {
      total_logs: totalLogs,
      total_hours: totalHours,
      message: "Shift logs processed successfully"
    });
  });

  call.on('error', (err) => {
    console.error("Error receiving logs:", err);
  });
}
main();