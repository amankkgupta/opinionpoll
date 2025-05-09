import React, { useContext, useEffect, useState } from "react";
import { format } from "date-fns";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllDebates,
  likeRequest,
  setLiked,
} from "../redux/slices/allDebatesSlice";
import { BiSolidUpvote } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
// import { FaPlus, FaMinus } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import {
  setDebateOptionStatus,
  setDebateStatus,
  setLike,
  setVoteIdx,
} from "../redux/slices/votingSlice";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { UserContext } from "../context/UserContext";
import CommentView from "../components/CommentView";

const Voting = () => {
  const { page, id } = useParams();
  // console.log(page, id);
  const { role } = useContext(UserContext);
  const { debate, liked, Qno, voteIdx, isVoted, isLoading } = useSelector(
    (states) => states.voting
  );
  const { debates, likes } = useSelector((states) => states.allDebates);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleVote = (index) => {
    if(index<0) return toast.warning("Please select your choice !");
    dispatch(setVoteIdx(index));
  };

  const handleLike = (_id, index) => {
    console.log(index);
    dispatch(likeRequest(_id));
    dispatch(setLike({ act: true, liked }));
    liked
      ? dispatch(setLiked({ index, val: -1 }))
      : dispatch(setLiked({ index, val: 1 }));
  };

  const handleSubmission = async () => {
    if (voteIdx == -1) return toast.error("Please choose an option !");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/debates/voterequest`,
        { debateId: debate._id, voteIdx },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(res.data.message);
      navigate("/userdebates");
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const handleClose = async (status) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/closedebate`,
        { debateId: debate._id, status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(setDebateStatus(status));
      toast.success(`Successfully ${status} !`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error closing debate");
    }
  };

  const removeOption = async (idx, action) => {
    if (action == -1) {
      const optionLength = debate.options.filter(
        (option) => !option.isRemoved
      ).length;
      if (optionLength < 3) {
        return toast.warning("Cannot Remove ! Minimum 2 options are required");
      }
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/removeoption`,
        { debateId: debate._id, idx },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(setDebateOptionStatus(idx));
      toast.success(`Success !`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error closing debate");
    }
  };

  useEffect(() => {
    dispatch(
      fetchAllDebates({
        page: page + 1,
        isExact: false,
        votes: 0,
        likegt: 0,
        date: "",
        searchQuery: "",
      })
    );
  }, []);

  return (
    <div className="pt-16 p-5 lg:px-48 flex items-start justify-start min-h-screen bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-500">
      {!isLoading && (
        <div className=" w-full">
          <div className="flex justify-between">
            <button
              onClick={() => navigate("/userdebates")}
              className="bg-blue-500 px-6 py-2 rounded-lg mb-4"
            >
              Go Back
            </button>
            {role == "admin" &&
              (debate.status === "open" ? (
                <button
                  onClick={() => {
                    handleClose("closed");
                  }}
                  className="bg-red-500 px-6 py-2 rounded-lg mb-4"
                >
                  Close
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleClose("open");
                  }}
                  className="bg-green-500 px-6 py-2 rounded-lg mb-4"
                >
                  Open
                </button>
              ))}
          </div>
          <div className={`bg-indigo-600 rounded-lg p-5 w-full text-white `}>
            <div className="flex justify-between items-center">
              <h1 className="font-semibold">
                Asked by{" "}
                <span className="text-red-400">{debate.createdBy}</span> on{" "}
                <span className="text-green-400">
                  {format(new Date(debate.createdOn), "dd-MM-yyyy,  hh:mm a")}
                </span>
              </h1>
              <button
                disabled={role == "admin"}
                onClick={() => {
                  handleLike(debate._id, Qno - 1);
                }}
                className={`flex gap-3 justify-center ${
                  liked ? "text-red-500" : ""
                } font-bold items-center`}
              >
                <Heart fill={liked ? "red" : "white"} />
                {debate.totalLikes}
              </button>
            </div>

            <div>
              <h1 className="font-extrabold text-xl py-2">
                {Qno}. {debate.question}
              </h1>
            </div>

            <div className="flex gap-5 flex-col justify-start md:items-center">
              <div className="options w-full">
                {debate.options.map((option, ind) => {
                  return (
                    <div
                      key={ind}
                      className={`option w-full font-bold flex justify-between py-1 items-center gap-2`}
                    >
                      <div
                        onClick={() => handleVote(ind)}
                        className={`${
                          voteIdx == ind ? "bg-emerald-500" : ""
                        } w-full bg-blue-400 rounded-lg px-2 flex gap-3 flex-wrap justify-between items-center`}
                      >
                        <h1 key={ind}>{`${ind + 1}. ${option.answer}`}</h1>
                        <button
                          className={`flex gap-2 justify-center font-bold items-center`}
                        >
                          <BiSolidUpvote size={28} fill="white" />
                          {option.votes}
                        </button>
                      </div>

                      {role == "user" ? (
                        <div></div>
                      ) : (
                        // <div className="flex justify-center items-center gap-1 md:ml-10">
                        //   <button
                        //     disabled={isVoted}
                        //     onClick={() => handleVote(ind, -1)}
                        //     className="p-2 rounded-full bg-violet-500"
                        //   >
                        //     <FaMinus size={16} />
                        //   </button>
                        //   <h1 className="px-5 py-1 bg-blue-600 rounded-xl">
                        //     {votes[ind]}
                        //   </h1>
                        //   <button
                        //     onClick={() => handleVote(ind, 1)}
                        //     className="p-2 rounded-full bg-violet-500"
                        //   >
                        //     <FaPlus size={16} />
                        //   </button>
                        // </div>
                        <div>
                          {!option.isRemoved ? (
                            <button
                              onClick={() => removeOption(ind, -1)}
                              className="bg-red-500 px-5 py-1 rounded-lg"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => removeOption(ind, 1)}
                              className="bg-green-500 px-5 py-1 rounded-lg"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="graph w-full flex justify-between items-center">
                <ResponsiveContainer width="80%" height="50%" aspect={5}>
                  <BarChart data={debate.options}>
                    <XAxis
                      dataKey=""
                      stroke="#000"
                      tickFormatter={(value, index) => index + 1}
                    />
                    <YAxis stroke="#000" />
                    <Tooltip />
                    <Bar dataKey="votes" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
                {role != "admin" && (
                  <button
                    disabled={isVoted}
                    onClick={handleSubmission}
                    className={`p-8 ${
                      isVoted ? "bg-emerald-200" : "bg-emerald-500"
                    } rounded-lg font-bold text-2xl`}
                  >
                    {isVoted ? "Voted" : "Vote"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <CommentView debateId={debate._id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Voting;
