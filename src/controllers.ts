import os from "os";
import { exec, execSync } from "child_process";
import { promisify } from "util";
import path from "path";
import { spawn } from "child_process";
import { Request, Response } from "express";
import fs from "fs/promises";

const dirname = process.cwd();

const SCREENSHOT_SCRIPT = path.join(dirname, "scripts", "screenshot.py");
const WEBCAM_CAPTURE_SCRIPT = path.join(dirname, "scripts", "webcam_capture.py");
const SCREENSHOT_OUTPUT = path.join(dirname, "captures", "screenshot.png");
const WEBCAM_OUTPUT = path.join(dirname, "captures", "webcam_capture.png");

let logs: string[] = [];

const _log = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(`[${new Date().toISOString()}] ${message}`);
    logs.push(logMessage);
};

const getStatus = async (req: Request, res: Response) => {
    try {
        const whoOutput: string = execSync("who", { encoding: "utf8" });
        const psOutput: string = execSync("ps aux | head -20", {
            encoding: "utf8",
        });

        const systemInfo = {
            hostname: os.hostname(),
            platform: os.platform(),
            architecture: os.arch(),
            cpus: os.cpus().length,
            totalMemory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`,
            freeMemory: `${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`,
            uptime: `${Math.floor(os.uptime() / 3600)} hours`,
            battery: await _getBattery(),
            loadAvg: os.loadavg(),
            activeSessions: whoOutput
                .trim()
                .split("\n")
                .filter((line: any) => line.length > 0),
            processes: psOutput.trim().split("\n"),
        };

        res.status(200).json({
            status: "OK",
            system: systemInfo,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

const postExec = async (req: Request, res: Response) => {
    try {
        const auth0 = req.headers["auth-0"] as string; // just a header
        if (auth0 !== "YES") {
            res.status(403).json({ error: "Unauthorized: Invalid or missing authentication" });
            return;
        }

        const { command } = req.body;
        if (!command) {
            res.status(400).json({ error: "Command is required" });
            return;
        }

        _log(`Command executed: ${command}`);
        const output = execSync(command, { encoding: "utf8" });
        res.status(200).json({
            output: output.trim(),
            message: `Command executed successfully`,
            error: false,
        });
    } catch (error: any) {
        res.status(500).json({ output: error.message, error: true });
    }
};

const _captureScreenshot = async () => {
    try {
        const output = execSync(`python ${SCREENSHOT_SCRIPT}`, { encoding: "utf8" });
        console.log(`Output: ${output}`);
        if (!output.includes("1")) return null;
        return SCREENSHOT_OUTPUT;
    } catch (error: any) {
        _log(`Error capturing screenshot: ${error.message}`);
        return null;
    }
};

const _captureWebcam = async () => {
    try {
        const output = execSync(`python ${WEBCAM_CAPTURE_SCRIPT}`, { encoding: "utf8" });
        console.log(`Output: ${output}`);
        if (!output.includes("1")) return null;
        return WEBCAM_OUTPUT;
    } catch (error: any) {
        _log(`Error capturing webcam: ${error.message}`);
        return null;
    }
};

const getLogs = async (req: Request, res: Response) => {
    try {
        let logsHtml = await fs.readFile(path.join(dirname, "views", "logs.html"), "utf-8");
        logsHtml = logsHtml.replace("<!--LOGS-->", logs.map((log) => `<p>${log}</p>`).join(""));
        res.setHeader("Content-Type", "text/html");
        res.send(logsHtml);
    } catch (error) {
        console.error("Error reading logs file:", error);
        res.status(500).send("Error reading logs file.");
    }
};

const _getBattery = async () => {
    try {
        const batteryInfo = await promisify(exec)("upower -i $(upower -e | grep BAT) | grep -E 'percentage|state'");
        const batteryStatus = batteryInfo.stdout
            .trim()
            .split("\n")
            .map((line) => line.trim())
            .join(", ");
        return batteryStatus;
    } catch (error: any) {
        return null;
    }
};

const getHome = async (req: Request, res: Response) => {
    try {
        const filePath = path.join(dirname, "views/home.html");
        const data = await fs.readFile(filePath, "utf-8");
        const currentTime = new Date().toLocaleTimeString();
        const batteryStatus = (await _getBattery()) || "N/A";
        const location = "";
        const totalMemory = `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`;
        const freeMemory = `${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`;
        const uptime = `${Math.floor(os.uptime() / 3600)} hours`;
        const ip = await (await fetch("https://adiy.vercel.app/api/ip")).text();

        const renderedPage = data
            .replace("<!--CURRENT_TIME-->", currentTime)
            .replace("<!--BATTERY_STATUS-->", batteryStatus)
            .replace("<!--LOCATION-->", location)
            .replace("<!--FREE_MEMORY-->", `${freeMemory}`)
            .replace("<!--TOTAL_MEMORY-->", `${totalMemory}`)
            .replace("<!--UPTIME-->", `${uptime}`)
            .replace("<!--IP-->", `${ip}`);

        res.send(renderedPage);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error loading home page.");
        return;
    }
};

const getSnapshot = async (req: Request, res: Response) => {
    const screenshotPath = await _captureScreenshot();
    const webcamCapturePath = await _captureWebcam();

    let screenshotMime = "image/png";
    let webcamMime = "image/png";
    let screenshotBase64 = null;
    let webcamBase64 = null;

    if (screenshotPath) {
        const screenshotBuffer = await fs.readFile(screenshotPath);
        screenshotMime = path.extname(screenshotPath) === ".png" ? "image/png" : "image/jpeg";
        screenshotBase64 = screenshotBuffer.toString("base64");
    }

    if (webcamCapturePath) {
        const webcamBuffer = await fs.readFile(webcamCapturePath);
        webcamBase64 = webcamBuffer.toString("base64");
        webcamMime = path.extname(webcamCapturePath) === ".png" ? "image/png" : "image/jpeg";
    }

    let snashotsHtml = await fs.readFile(path.join(dirname, "views/snapshot.html"), "utf-8");
    snashotsHtml = snashotsHtml.replace(
        "<!--SCREENSHOT-->",
        screenshotPath
            ? `<div>
              <h2 class="text-lg mb-2 text-green-400">Screenshot</h2>
              <img src="data:${screenshotMime};base64,${screenshotBase64}" alt="Screenshot"
                   class="mx-auto max-w-full max-h-[400px] border border-green-700 rounded-lg shadow-lg" />
            </div>`
            : `<p class="text-yellow-400">Screenshot was not captured.</p>`
    );
    snashotsHtml = snashotsHtml.replace(
        "<!--WEBCAM_CAPTURE-->",
        webcamCapturePath
            ? `<div>
            <h2 class="text-lg mb-2 text-green-400">Webcam Image</h2>
            <img src="data:${webcamMime};base64,${webcamBase64}" alt="Webcam"
                 class="mx-auto max-w-full max-h-[400px] border border-green-700 rounded-lg shadow-lg" />
          </div>`
            : `<p class="text-yellow-400">Webcam image was not captured.</p>`
    );

    res.setHeader("Content-Type", "text/html");
    res.send(snashotsHtml);
};

const getVideo = (req: Request, res: Response) => {
    res.writeHead(200, {
        "Content-Type": "multipart/x-mixed-replace; boundary=frame",
        "Cache-Control": "no-cache",
        Connection: "close",
        Pragma: "no-cache",
    });

    const ffmpeg = spawn("ffmpeg", ["-f", "v4l2", "-i", "/dev/video0", "-vf", "scale=640:480", "-f", "mjpeg", "pipe:1"]);

    ffmpeg.stdout.on("data", (chunk: Buffer) => {
        res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${chunk.length}\r\n\r\n`);
        res.write(chunk);
        res.write("\r\n");
    });

    ffmpeg.stderr.on("data", (data: Buffer) => {
        console.error(`stderr: ${data}`);
    });

    const timeout = setInterval(async () => {
        ffmpeg.kill("SIGTERM");
        const imagePath = path.join(dirname, "assets/dvd.png");
        const imgBuffer = await fs.readFile(imagePath);
        res.write(`--frame\r\nContent-Type: image/png\r\nContent-Length: ${imgBuffer.length}\r\n\r\n`);
        res.write(imgBuffer);
        res.write("\r\n");
        res.end();
    }, 20 * 1000);

    // stream ends in 20sec (change if wanted)

    req.on("close", () => {
        clearTimeout(timeout);
        ffmpeg.kill("SIGTERM");
    });
};

const getLogin = async (req: Request, res: Response) => {
    res.sendFile(path.join(dirname, "views/login.html"));
};

export { _log, postExec, getHome, getSnapshot, getLogs, getStatus, getVideo, getLogin };
