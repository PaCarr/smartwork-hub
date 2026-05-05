async function assignShift() {
  const data = {
    employee_id: "1",
    employee_name: document.getElementById('employeeName').value,
    shift_date: document.getElementById('shiftDate').value,
    shift_time: document.getElementById('shiftTime').value,
    role: document.getElementById('role').value
  };

  const response = await fetch('/assignShift', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  document.getElementById('output').textContent = JSON.stringify(result, null, 2);
}

async function reportHazard() {
  const data = {
    hazard_id: document.getElementById('hazardId').value,
    location: document.getElementById('hazardLocation').value,
    description: document.getElementById('hazardDescription').value,
    severity: Number(document.getElementById('hazardSeverity').value)
  };

  const response = await fetch('/reportHazard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  document.getElementById('safetyOutput').textContent = JSON.stringify(result, null, 2);
}

async function createTask() {
  const data = {
    task_id: document.getElementById('taskId').value,
    employee_id: "1",
    employee_name: document.getElementById('taskEmployeeName').value,
    task_name: document.getElementById('taskName').value,
    deadline: document.getElementById('deadline').value
  };

  const response = await fetch('/createTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  document.getElementById('productivityOutput').textContent = JSON.stringify(result, null, 2);
}