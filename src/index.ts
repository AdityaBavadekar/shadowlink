import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { _log, getHome, getLogin, getLogs, getSnapshot, getStatus, getVideo, postExec } from "./controllers";
import { decode, encode } from "./token";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 8800;
const HOST = process.env.HOST || "0.0.0.0";

const authMiddleware = (req:Request, res:Response, next:any) => {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");
      const decodedData = decode(token);
    if (!decodedData) {
        res.redirect("/login");
        return;
    }
    next();
};

const logger = (req: Request, res: Response, next: any) => {
    const method = req.method;
    const url = req.url;
    _log(`${method} request to ${url}`);
    next();
};

const app = express();

app.use(express.json());
app.use(logger);
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Hello World!, I am running!");
});

app.use("/home", authMiddleware, getHome);
app.use("/video", authMiddleware, getVideo);
app.use("/snap", authMiddleware, getSnapshot);

app.post("/exec", authMiddleware, postExec);

app.use("/ping", (req, res) => {
    res.status(200).send("OK");
});
app.use("/status", authMiddleware, getStatus);
app.use("/logs", authMiddleware, getLogs);

app.post("/login", (req, res) => {
    const { params } = req.body;
    const decodedParams = atob(params);
    const { username, password } = JSON.parse(decodedParams);
    if (!username || !password) {
        res.status(400).json({ error: true, message: "Username and password are required" });
        return;
    }
    if (username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD) {
        const token = encode({ x:"%authenticated%" }); // so that even username is not exposed 
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 60 * 1000, // 1/2 hour
        });
        res.json({ token, error: false });
        return;
    }
    res.status(401).json({ error: true, message: "Invalid credentials" });
});

app.get("/login", getLogin);

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});

app.get("/watch", authMiddleware, (req, res) => {
    res.sendFile(path.join(process.cwd(), "views/video.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
});
