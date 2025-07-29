import { UserContext } from "@/UserContext";
import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"
function Review() {
  const navigate = useNavigate();
  const location = useLocation();

  const id = location.state?.id ?? "";
  const seller_email= location.state?.seller_email ?? "";
 const { email } = useContext(UserContext);  
 const [text, setText] = useState("");
  const [reviews, setReviews] = useState([]);   // expecting an array
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [emaill, setemail] = useState(null);

  async function getReview() {
    try {
      setLoading(true);
      setErr(null);

      // If your API expects a query param with the id/email:
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/getreview`,{
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
    if (!text.trim()){ 
      
      alert(
"Add Review "
      )
    
      return;}
      if(emaill===seller_email){
        alert("You Cannot Review to Your Product")
        return
      }
 

    try {
      setErr(null);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/sendreview`, {
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
      
    }
  }

  useEffect(() => {
    getReview();
    // Optionally include id so it refetches if user changes
  }, [id]);
  useEffect(() => {
    async function fetchEmail() {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/getemail`, {
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
    <div className="flex flex-col gap-6 p-6">
  {emaill ? <h4></h4> : <h4>Login is needed</h4>}
  <h2 className="text-black-800 font-bold">Reviews for: {seller_email || "Unknown user"} 's product</h2>

  {loading && (
    <Button size="sm" disabled>
      <Loader2Icon className="animate-spin" />
      Please wait
    </Button>
  )}
  {/* {err && <p style={{ color: "red" }}>{err}</p>} */}

  {/* Review List */}
  <div className="border-1 rounded-2xl p-6 flex flex-col">
    {reviews.length === 0 && !loading ? (
      <p>No messages yet.</p>
    ) : (
      reviews.map((r, i) => (
        <div
          className="p-2 border-1 shadow-2xl hover:scale-102  border-gray-100 rounded-md bg-blue-500 mb-2"
          key={r._id ?? i}
        >
          <strong className="text-blue-900">{r.reviewer_email || "Anonymous"}:</strong> {r.comment || r.text || ""}
        </div>
      ))
    )}
  </div>

  {/* Fixed Bottom Input Bar */}
  <div className="fixed bottom-0 left-0 w-full bg-white p-3 border-t flex flex-col sm:flex-row gap-3 items-center">
    <input
      className="border shadow rounded-2xl px-4 py-2 flex-1"
      placeholder="message here"
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
    <button
      className="bg-green-500 hover:bg-green-700 text-white rounded-2xl px-3 py-2"
      onClick={sendReview}
    >
      Add
    </button>
    <button
      className="bg-red-500 hover:bg-red-700 text-white rounded-2xl px-3 py-2"
      onClick={() => navigate(-1)}
    >
      Back
    </button>
  </div>
</div>

  );
}

export default Review;
