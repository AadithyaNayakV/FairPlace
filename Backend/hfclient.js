const axios = require("axios");
require("dotenv").config();

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL_URL = "https://api-inference.huggingface.co/models/unitary/toxic-bert";

async function isTextSafe(text) {
  try {
    const response = await axios.post(
      HF_MODEL_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const scores = response.data[0];
    let threat = 0, toxic = 0, severe_toxic = 0;

    for (const s of scores) {
      if (s.label === "threat") threat = s.score;
      if (s.label === "toxic") toxic = s.score;
      if (s.label === "severe_toxic") severe_toxic = s.score;
    }

    if (threat > 0.5 || severe_toxic > 0.5 || toxic > 0.6) {
      return { ok: false, decision: "REJECT", raw: scores };
    }
    return { ok: true, decision: "ACCEPT", raw: scores };
  } catch (err) {
    console.error("Hugging Face API Error:", err.message);
    return { ok: false, decision: "ERROR", error: err.message };
  }
}

module.exports = { isTextSafe };
