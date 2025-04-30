import React, { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import { ThumbsDown } from "lucide-react";

const CommentView = ({ debateId }) => {
  console.log(debateId);
  const [comment, setComment] = useState("");
  const [allComments, setAllComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/debates/fetchcomments/${debateId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setAllComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!comment.trim()) return;
    const token = localStorage.getItem("token");
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/debates/addcomment`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment, debateId }),
      });
      if (res.ok) {
        fetchComments();
        setComment("");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  return (
    <div className="mt-4 rounded-lg">
      <div className="flex gap-3">
        <textarea
          className="w-full p-2 border rounded focus:outline-none focus:ring"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={1}
        />
        <button
          onClick={handlePost}
          className="bg-blue-600 px-6 py-2 text-white rounded hover:bg-blue-700"
        >
          Post
        </button>
      </div>

      <div>
        <div className="mt-2 space-y-2">
          {allComments.map((c) => (
            <div key={c._id} className="p-2 bg-gray-100 rounded">
              <div className="text-sm text-gray-700 flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-green-600 rounded-full h-8 w-8 flex justify-center items-center">
                    {c.userName[0]}
                  </div>
                  {c.userName}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {new Date(c.createdOn).toLocaleString()}
                </div>
              </div>
              <div className="py-2">{c.comment}</div>
              <div className="flex gap-5">
                <div className="flex gap-2">
                  <ThumbsUp size={22} />
                  {c.likes}
                </div>
                <div className="flex gap-2">
                  <ThumbsDown size={22} />
                  {c.dislikes}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentView;
