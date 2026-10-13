// assets/algorithms/fcfs.js
export default {
  id: "fcfs",
  name: "FCFS",
  description: "Tiến trình đến trước được cấp CPU trước (First-Come, First-Served).",
  needQuantum: false,

  run(processes, options = {}) {
    if (!processes || processes.length === 0) {
      throw new Error("Vui lòng thêm ít nhất 1 tiến trình!");
    }

    // 1. Validate & Clone mảng để không ảnh hưởng mảng gốc, sau đó sắp xếp theo Arrival Time
    const procs = processes.map(p => {
      if (p.burst <= 0) throw new Error(`Tiến trình ${p.pid} có Burst Time không hợp lệ (phải > 0)`);
      if (p.arrival < 0) throw new Error(`Tiến trình ${p.pid} có Arrival Time không hợp lệ (phải >= 0)`);
      return { ...p };
    }).sort((a, b) => a.arrival - b.arrival);

    let currentTime = 0;
    let gantt = [];
    let table = [];
    let totalWaiting = 0;
    let totalTurnaround = 0;

    // 2. Chạy thuật toán
    for (let p of procs) {
      // Nếu CPU rảnh (chưa có tiến trình nào tới)
      if (currentTime < p.arrival) {
        gantt.push({ pid: "idle", start: currentTime, end: p.arrival });
        currentTime = p.arrival;
      }

      let start = currentTime;
      let finish = start + p.burst;
      let turnaround = finish - p.arrival;
      let waiting = turnaround - p.burst; // Hoặc: start - p.arrival

      // Cập nhật biểu đồ Gantt và bảng kết quả
      gantt.push({ pid: p.pid, start, end: finish });
      table.push({ 
        pid: p.pid, arrival: p.arrival, burst: p.burst, 
        start, finish, waiting, turnaround 
      });

      totalWaiting += waiting;
      totalTurnaround += turnaround;
      currentTime = finish; // Tiến CPU tới thời điểm hoàn thành
    }

    // 3. Trả về kết quả
    return {
      gantt,
      table,
      avgWaiting: totalWaiting / procs.length,
      avgTurnaround: totalTurnaround / procs.length
    };
  }
};