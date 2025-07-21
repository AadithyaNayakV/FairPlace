import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Review() {
  const navigate = useNavigate();
  const location = useLocation();

  // Grab whatever you stored in navigation state (e.g., email)
  const id = location.state?.id ?? "";

  const [text, setText] = useState("");
  const [reviews, setReviews] = useState([]);   // expecting an array
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function getReview() {
    try {
      setLoading(true);
      setErr(null);

      // If your API expects a query param with the id/email:
      const res = await fetch(`http://localhost:5000/api/getreview`,{
        method:'post',
         headers: {
        "Content-Type": "application/json",
      },
      body:JSON.stringify({id})

      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json(); // expecting array
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendReview() {
    if (!text.trim()) return;

    try {
      setErr(null);

      const res = await fetch("http://localhost:5000/api/sendreview", {
        method: "POST",
        credentials:'include',
        headers: {
          "Content-Type": "application/json",
        },
        // send the id + message text
        body: JSON.stringify({ id, text }),
      });
      const data1 = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data1.message)
        throw new Error(`Server error: ${res.status}`);
      }
      const msg1 = data1.message
      alert("Review added");
      setText("");
      getReview(); // refresh list
    } catch (e) {
      console.error(e);
      setErr(e.message);
      alert(e.message);
    }
  }

  useEffect(() => {
    getReview();
    // Optionally include id so it refetches if user changes
  }, [id]);
const [emaill, setemail] = useState(null);
  useEffect(() => {
    async function fetchEmail() {
      const res = await fetch("http://localhost:5000/api/getemail", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setemail(data.email);
      } else {
        alert('login is needed')
        navigate('/')
        setemail(null);
      }
    }
    fetchEmail();
  }, []);
  return (
    <div>  {emaill ? <h4>Logged in as: {emaill}</h4> : <h4>Login is needed</h4>}
      <h2>Reviews for: {id || "Unknown user"}</h2>

      {loading && <p>Loading...</p>}
      {err && <p style={{ color: "red" }}></p>}

      <div>
        {reviews.length === 0 && !loading ? (
          <p>No messages yet.</p>
        ) : (
          reviews.map((r, i) => (
            <div key={r._id ?? i} style={{ marginBottom: "8px" }}>
              {/* Adjust field names to match your API response */}
              <strong>{r.reviewer_email  || "Anonymous"}:</strong> {r.comment || r.text || ""}
            </div>
          ))
        )}
      </div>

      <input
        placeholder="message here"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={sendReview}>Add</button>

      <br />
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}

export default Review;
