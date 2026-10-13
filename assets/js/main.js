// assets/js/main.js
import { algorithms } from "../algorithms/index.js";

let processList = [];
let processCount = 0;

// DOM Elements
const formAdd = document.getElementById("form-add-process");
const tableBody = document.getElementById("process-table-body");
const selectAlgo = document.getElementById("algo-select");
const btnRun = document.getElementById("btn-run");
const resultSection = document.getElementById("result-section");
const ganttChart = document.getElementById("gantt-chart");
const resultTableBody = document.getElementById("result-table-body");
const avgWtSpan = document.getElementById("avg-wt");
const avgTatSpan = document.getElementById("avg-tat");

// Load danh sách thuật toán vào Select
algorithms.forEach(algo => {
  const option = document.createElement("option");
  option.value = algo.id;
  option.textContent = algo.name;
  selectAlgo.appendChild(option);
});

// Thêm tiến trình
formAdd.addEventListener("submit", (e) => {
  e.preventDefault();
  const arrival = parseInt(document.getElementById("arrival-time").value);
  const burst = parseInt(document.getElementById("burst-time").value);
  
  processCount++;
  const pid = `P${processCount}`;
  processList.push({ pid, arrival, burst });
  
  renderProcessTable();
  formAdd.reset();
});

function renderProcessTable() {
  tableBody.innerHTML = processList.map((p, index) => `
    <tr>
      <td>${p.pid}</td>
      <td>${p.arrival}</td>
      <td>${p.burst}</td>
      <td><button class="btn btn-sm btn-danger" onclick="removeProcess(${index})">Xóa</button></td>
    </tr>
  `).join("");
}

// Xóa tiến trình (đưa ra Window để gọi được từ inline onclick)
window.removeProcess = (index) => {
  processList.splice(index, 1);
  renderProcessTable();
};

// Chạy mô phỏng
btnRun.addEventListener("click", () => {
  try {
    const algoId = selectAlgo.value;
    const algorithm = algorithms.find(a => a.id === algoId);
    if (!algorithm) throw new Error("Thuật toán chưa được hỗ trợ!");

    // Chạy thuật toán
    const result = algorithm.run(processList);
    
    // Hiển thị kết quả
    renderResults(result);
  } catch (error) {
    alert("Lỗi: " + error.message);
  }
});

function renderResults(result) {
  resultSection.classList.remove("d-none");
  
  // 1. Bảng kết quả (Giữ nguyên)
  resultTableBody.innerHTML = result.table.map(r => `
    <tr>
      <td>${r.pid}</td>
      <td>${r.arrival}</td>
      <td>${r.burst}</td>
      <td>${r.start}</td>
      <td>${r.finish}</td>
      <td>${r.waiting}</td>
      <td>${r.turnaround}</td>
    </tr>
  `).join("");

  avgWtSpan.textContent = result.avgWaiting.toFixed(2);
  avgTatSpan.textContent = result.avgTurnaround.toFixed(2);

  // 2. Vẽ Gantt Chart (Đã thêm setTimeout)
  ganttChart.innerHTML = "";
  const totalTime = result.gantt[result.gantt.length - 1].end;

  result.gantt.forEach((block, index) => {
    // Delay mỗi khối 800ms x số thứ tự của nó
    setTimeout(() => {
      const widthPercent = ((block.end - block.start) / totalTime) * 100;
      const isIdle = block.pid === "idle";
      
      const blockDiv = document.createElement("div");
      blockDiv.className = `gantt-block ${isIdle ? 'gantt-idle' : 'gantt-process'}`;
      blockDiv.style.width = `${widthPercent}%`;
      blockDiv.innerHTML = `
        <div class="pid">${isIdle ? 'Trống' : block.pid}</div>
        ${index === 0 ? `<div class="time-marker start">${block.start}</div>` : ''}
        <div class="time-marker end">${block.end}</div>
      `;
      ganttChart.appendChild(blockDiv);
    }, index * 800); 
  });
}