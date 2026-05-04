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