const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
  }),
);
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

// login 
app.post("/api/login", async (req, res) => {
  try {
    const response = await fetch("https://hospilot.carer.ai/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: process.env.HOSPILOT_USERNAME,
        password: process.env.HOSPILOT_PASSWORD,
      }),
    });

    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: "Failed to connect to Hospilot",
    });
  }
});

// create_session

app.post("/api/create-session", async (req, res) => {
  try {
    const { goal } = req.body;

    if (!goal || goal.trim() === "") {
      return res.status(400).json({
        error: "Goal is required",
      });
    }

    // First, log in to Hospilot
    const loginResponse = await fetch(
      "https://hospilot.carer.ai/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: process.env.HOSPILOT_USERNAME,
          password: process.env.HOSPILOT_PASSWORD,
        }),
      },
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
          console.log("Hospilot login status:", loginResponse.status);
          console.log("Hospilot login response:", loginData);

          return res.status(loginResponse.status).json({
            error: "Hospilot login failed",
            details: loginData,
          });

    }

    const token = loginData.token;

    // Create the Hospilot session
    const sessionResponse = await fetch(
      "https://hospilot.carer.ai/api/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goal: `[CANDIDATE-pranshu] ${goal}`,
          constraints: "",
          autonomous: false,
        }),
      },
    );

    const sessionData = await sessionResponse.json();
    console.log("SESSION CREATION RESPONSE:", sessionData);

    if (!sessionResponse.ok) {
      return res.status(sessionResponse.status).json(sessionData);
    }

    res.json({
      token: token,
      session_id: sessionData.session_id,
      status: sessionData.status,
    });
  } catch (error) {
    console.error("Session creation error:", error);

    res.status(500).json({
      error: "Failed to create Hospilot session",
    });
  }
});

app.get("/api/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Login again to obtain a fresh token
    const loginResponse = await fetch(
      "https://hospilot.carer.ai/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: process.env.HOSPILOT_USERNAME,
          password: process.env.HOSPILOT_PASSWORD,
        }),
      },
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      return res.status(loginResponse.status).json({
        error: "Hospilot login failed",
      });
    }

    const token = loginData.token;

    // Get the current session state
    const sessionResponse = await fetch(
      `https://hospilot.carer.ai/api/sessions/${sessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const sessionData = await sessionResponse.json();
    // console.log("Session creation response:", sessionData);
    
    
    console.log("SESSION CREATION RESPONSE:", sessionData);
    res.status(sessionResponse.status).json(sessionData);

  } catch (error) {
    console.error("Polling error:", error);

    res.status(500).json({
      error: "Failed to retrieve session",
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(process.env.HOSPILOT_USERNAME);
  console.log(process.env.HOSPILOT_PASSWORD);
});

app.get("/api/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Login again to obtain a fresh token
    const loginResponse = await fetch(
      "https://hospilot.carer.ai/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: process.env.HOSPILOT_USERNAME,
          password: process.env.HOSPILOT_PASSWORD,
        }),
      },
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      return res.status(loginResponse.status).json({
        error: "Hospilot login failed",
      });
    }

    const token = loginData.token;

    // Get the current session state
    const sessionResponse = await fetch(
      `https://hospilot.carer.ai/api/sessions/${sessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const sessionData = await sessionResponse.json();
    // console.log("Session creation response:", sessionData);

    console.log("POLLING RESPONSE:", sessionData);
    res.status(sessionResponse.status).json(sessionData);
  } catch (error) {
    console.error("Polling error:", error);

    res.status(500).json({
      error: "Failed to retrieve session",
    });
  }
});

