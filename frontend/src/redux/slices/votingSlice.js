import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchVotes = createAsyncThunk(
  "fetchVotes",
  async (data, thunk) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/debates/fetchvotes/?debateId=${data}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      return response.data;
    } catch (err) {
      console.log(err);
      return thunk.rejectWithValue(
        err?.response?.data?.message || "Failed to fetch votes"
      );
    }
  }
);

const votingSlice = createSlice({
  name: "voting",
  initialState: {
    debate: {},
    liked: false,
    Qno: 0,
    voteIdx: -1,
    isVoted: false,
    isLoading: true,
  },
  reducers: {
    setVoteIdx:(state, action)=>{
      state.voteIdx=action.payload;
    },
    setQno: (state, action) => {
        state.Qno = action.payload;
    },
    setDebate: (state, action) => {
      state.debate = action.payload;
    },
    setLike: (state, action) => {
      const { act, liked } = action.payload;
      console.log(act, liked);
      if (act) {
        state.liked = !liked;
      } else {
        state.liked = liked;
      }
    },
    
    setVotes: (state, action) => {
      const { index, val } = action.payload;
      state.votes[index] = state.votes[index] + Number(val);
    },
    setDebateStatus: (state, action)=>{
      state.debate.status= action.payload;
    },
    setDebateOptionStatus: (state, action) => {
      const idx = action.payload;
      const currentStatus = state.debate.options[idx].isRemoved;
      state.debate.options[idx].isRemoved = !currentStatus;
    }
  },
  extraReducers: (builder) => { 
    builder
      .addCase(fetchVotes.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchVotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.voteIdx = action.payload.voteIdx;
        state.isVoted = state.voteIdx==-1?false:true;
      })
      .addCase(fetchVotes.rejected, (state, action) => {
        state.isLoading = false;
        state.voteIdx = -1;
      });
  },
});

export const { setQno, setDebate, setLike, setVotes, setVoteIdx, setDebateStatus, setDebateOptionStatus } = votingSlice.actions;
export default votingSlice.reducer;
