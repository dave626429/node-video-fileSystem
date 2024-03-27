const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

const VIDEO_PATH = "C:/Users/BLUE-AURA/Downloads/Video/dream girl.mp4";

// Serve index.html for all routes
app.get("/", (req, res) => {
  // Read index.html file
  res.sendFile(__dirname + "/index.html");
});

// Define route for streaming video
app.get("/video", (req, res) => {
  const range = req.headers.range;

  const videoSize = fs.statSync(VIDEO_PATH).size;

  const chunk = 50 ** 4;

  console.log(range);
  const start = Number(range.replace(/\D/g, ""));
  console.log(start);

  const end = Math.min(start + chunk - 1, videoSize - 1);

  const contentLenght = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLenght,
    "Content-Type": "video/mp4",
  };

  // 206 to tell browser the data is comming in chuncks
  res.writeHead(206, headers);

  // Create video stream
  const videoStream = fs.createReadStream(VIDEO_PATH, { start, end });

  videoStream.on("error", (err) => {
    console.error("Error reading video file:", err);
  });

  videoStream.on("data", (chunk) => {
    if (!res.write(chunk)) {
      // If write buffer is full, pause the stream
      console.log("paused");
      videoStream.pause();
    }
  });

  res.on("drain", () => {
    console.log("drain");
    videoStream.resume();
  });

  videoStream.on("end", () => {
    res.end();
  });

  // videoStream.pipe(res);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
