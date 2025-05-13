# ShadowLink

_Server to access and moniter your PC from anywhere in the world_

- ShadowLink is a secure, remote access server, helping you to access your PC's resources from anywhere via an authenticated web interface.

- Tunneling with **Ngrok** allows global access, while token-based authentication ensures secure connections.

<div align="center">
<img src="screenshots/_.png" width="50%">
</div>

| **Route** | **Description**                                                                                                                                          | **Screenshot** |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `/home`   | Authenticated home page | ![Home Screenshot](/screenshots/home.png)      |
| `/snap`   | Displays two images: (1) Screenshot of the screen, and (2) Image captured using Webcam. _Both images are instantly taken the moment you visit this route._     | ![Snapshot Screenshot](/screenshots/snap.png)  |
| `/logs`   | Server logs  | ![Logs Screenshot](/screenshots/logs.png)      |
| `/login`  | Login page   | ![Login Screenshot](/screenshots/login.png)    |
| `/logout` | Logout route |                                                |


## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/AdityaBavadekar/shadow-link.git
   cd shadow-link
   ```

2. **Create `.env` file**

   * On Unix/Linux/macOS:

     ```bash
     cp .env.example .env
     ```
   * On Windows:

     ```powershell
     copy .env.example .env
     ```
   * Edit `.env` to update:

     * `AUTH_USERNAME`
     * `AUTH_PASSWORD`
     * `JWT_SECRET`

3. **Install dependencies**
   - 1
      ```bash
      pnpm install
      ```
   - 2
      ```bash
      pip install -r requirements.txt
      ```

4. **Run the server locally**

   ```bash
   pnpm run dev
   ```

   * Server will be live at: [http://localhost:8800](http://localhost:8800)

5. **(Optional) Expose your server via Ngrok**

   Use your preferred method to expose port `8800`:

     ```bash
     ngrok http 8800
     ```

6. **(Optional (Linux only)) Auto start server and Ngrok - Instead of running 2 steps everytime, direct bash script**

   Run the helper script:

   ```bash
   ./run.sh
   ```


## License
```
   Copyright 2025 Aditya Bavadekar

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

```