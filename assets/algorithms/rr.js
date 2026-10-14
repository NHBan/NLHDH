
// assets/algorithms/rr.js

export default {
    id: "rr",
    name: "RR",
    description:
        "Mỗi tiến trình được sử dụng CPU trong tối đa một khoảng quantum. Nếu chưa hoàn thành, tiến trình được đưa về cuối hàng đợi.",
    needQuantum: true,

    run(processes, options = {}) {
        // 1. Kiểm tra dữ liệu đầu vào
        if (!Array.isArray(processes) || processes.length === 0) {
            throw new Error("Vui lòng thêm ít nhất một tiến trình.");
        }

        // Giao diện hiện tại chưa có ô nhập quantum.
        // Tạm thời sử dụng quantum mặc định bằng 2.
        const quantum =
            options.quantum === undefined ? 2 : Number(options.quantum);

        if (!Number.isFinite(quantum) || quantum <= 0) {
            throw new Error("Quantum phải là số lớn hơn 0.");
        }

        const usedPids = new Set();

        // Tạo bản sao, không thay đổi danh sách gốc.
        const jobs = processes.map((process, index) => {
            const pid = String(process.pid ?? "").trim();
            const arrival = Number(process.arrival);
            const burst = Number(process.burst);

            if (!pid) {
                throw new Error(`Tiến trình thứ ${index + 1} chưa có PID.`);
            }

            if (usedPids.has(pid)) {
                throw new Error(`PID ${pid} bị trùng.`);
            }
            usedPids.add(pid);

            if (!Number.isFinite(arrival) || arrival < 0) {
                throw new Error(`Arrival Time của ${pid} không hợp lệ.`);
            }

            if (!Number.isFinite(burst) || burst <= 0) {
                throw new Error(`Burst Time của ${pid} phải lớn hơn 0.`);
            }

            return {
                pid,
                arrival,
                burst,
                remaining: burst,
                start: null,
                finish: null,
                order: index,
            };
        });

        // 2. Sắp xếp theo thời điểm đến.
        // Nếu đến cùng lúc, giữ nguyên thứ tự nhập.
        const sortedJobs = [...jobs].sort(
            (a, b) => a.arrival - b.arrival || a.order - b.order
        );

        const readyQueue = [];
        const gantt = [];

        let currentTime = 0;
        let nextJobIndex = 0;

        // Đưa những tiến trình đã đến vào cuối hàng đợi.
        function enqueueArrivedJobs() {
            while (
                nextJobIndex < sortedJobs.length &&
                sortedJobs[nextJobIndex].arrival <= currentTime
            ) {
                readyQueue.push(sortedJobs[nextJobIndex]);
                nextJobIndex++;
            }
        }

        // 3. Mô phỏng thuật toán Round Robin.
        while (
            nextJobIndex < sortedJobs.length ||
            readyQueue.length > 0
        ) {
            enqueueArrivedJobs();

            // Nếu chưa có tiến trình nào sẵn sàng, CPU ở trạng thái rảnh.
            if (readyQueue.length === 0) {
                const nextArrival = sortedJobs[nextJobIndex].arrival;

                if (nextArrival > currentTime) {
                    gantt.push({
                        pid: "idle",
                        start: currentTime,
                        end: nextArrival,
                    });
                }

                currentTime = nextArrival;
                enqueueArrivedJobs();
            }

            // Lấy tiến trình đầu hàng đợi.
            const currentProcess = readyQueue.shift();

            // Ghi nhận lần đầu tiến trình được sử dụng CPU.
            if (currentProcess.start === null) {
                currentProcess.start = currentTime;
            }

            // Mỗi lượt chạy tối đa bằng quantum.
            const runTime = Math.min(
                quantum,
                currentProcess.remaining
            );

            const startTime = currentTime;

            currentTime += runTime;
            currentProcess.remaining -= runTime;

            // Ghi lại một đoạn trên biểu đồ Gantt.
            gantt.push({
                pid: currentProcess.pid,
                start: startTime,
                end: currentTime,
            });

            // Đưa tiến trình mới đến vào hàng đợi trước.
            // Sau đó mới đưa tiến trình chưa xong về cuối hàng.
            enqueueArrivedJobs();

            if (currentProcess.remaining > 0) {
                readyQueue.push(currentProcess);
            } else {
                currentProcess.finish = currentTime;
            }
        }

        // 4. Tính các chỉ số cho từng tiến trình.
        const table = jobs.map((process) => {
            const turnaround = process.finish - process.arrival;
            const waiting = turnaround - process.burst;

            return {
                pid: process.pid,
                arrival: process.arrival,
                burst: process.burst,
                start: process.start,
                finish: process.finish,
                waiting,
                turnaround,
            };
        });

        // 5. Tính trung bình thời gian chờ và quay vòng.
        const avgWaiting =
            table.reduce((sum, process) => sum + process.waiting, 0) /
            table.length;

        const avgTurnaround =
            table.reduce(
                (sum, process) => sum + process.turnaround,
                0
            ) / table.length;

        // Trả kết quả cho main.js hiển thị.
        return {
            gantt,
            table,
            avgWaiting,
            avgTurnaround,
        };
    },
};