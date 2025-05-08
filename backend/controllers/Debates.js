const commentsModel = require("../models/commentsModel");
const debatesModel = require("../models/debatesModel");
const likesModel = require("../models/likesModel");
const votesModel = require("../models/votesModel");

const AllDebates = async (req, res) => {
  const createdBy = req.user.email.split("@")[0];
  const { userId, role } = req.user;
  const { page = 1, isExact, votes, likegt, date, searchQuery } = req.body;
  const skip = (page - 1) * 10;

  let filters = {
    createdBy: { $ne: createdBy },
  };

  if (role === "user") {
    filters.status = { $ne: "closed" };
  }

  if (votes) {
    filters.totalVotes = { $gte: votes };
  }
  if (likegt) {
    filters.totalLikes = { $gte: likegt };
  }
  if (date) {
    filters.createdOn = { $gte: new Date(date) };
  }
  if (searchQuery) {
    const queryRegex = isExact ? `^${searchQuery}$` : `${searchQuery}`;
    filters["question"] = { $regex: queryRegex, $options: "i" };
  }

  try {
    const totalRecords = await debatesModel.countDocuments(filters);
    let debates = await debatesModel
      .find(filters)
      .skip(skip)
      .limit(10)
      .sort({ createdOn: -1 });

    if (role === "user") {
      debates = debates.map((debate) => {
        debate.options = debate.options.filter((option) => !option.isRemoved);
        return debate;
      });
    }
    const likes = await Promise.all(
      debates.map(async (debate) => {
        const like = await likesModel.findOne({ debateId: debate._id, userId });
        return like ? true : false;
      })
    );

    res.status(200).json({ totalRecords, debates, likes });
  } catch (err) {
    res.status(400).json({ message: "Server error! Try again later." });
  }
};

const MyDebates = async (req, res) => {
  const createdBy = req.user.email.split("@")[0];
  const { page } = req.query;
  const skip = (page - 1) * 10;
  try {
    const totalRecords = await debatesModel.countDocuments({ createdBy });
    let debates = await debatesModel
      .find({ createdBy })
      .skip(skip)
      .limit(10)
      .sort({ createdOn: -1 });
    debates = debates.map((debate) => {
      debate.options = debate.options.filter((option) => !option.isRemoved);
      return debate;
    });

    res.status(200).json({ totalRecords, debates });
  } catch (err) {
    // console.log(err);
    res.status(400).json({ message: "Server error! Please try again later" });
  }
};

const CreateDebate = async (req, res) => {
  const { question, options } = req.body;
  const createdBy = req.user.email.split("@")[0];
  // console.log(createdBy);

  try {
    const debateData = new debatesModel({
      question,
      options: options.map((data, i) => ({ answer: data })),
      createdOn: new Date(),
      createdBy,
    });
    await debateData.save();
    res.status(200).json({ message: "Success ! Debate created" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Server error ! Try after sometime" });
  }
};

const LikeDebate = async (req, res) => {
  const { debateId } = req.query;
  const { userId } = req.user;
  try {
    const liked = await likesModel.findOne({ debateId, userId });
    if (!liked) {
      await likesModel.create({ userId, debateId });
      await debatesModel.findByIdAndUpdate(debateId, {
        $inc: { totalLikes: 1 },
      });
      return res.json({ message: "liked" });
    }
    await likesModel.deleteOne(liked);
    await debatesModel.findByIdAndUpdate(debateId, {
      $inc: { totalLikes: -1 },
    });
    res.status(200).json({ message: "disliked" });
  } catch (err) {
    // console.log(err);
    res.status(400).json({ message: "server error" });
  }
};

const VoteDebate = async (req, res) => {
  const { debateId, voteIdx } = req.body;
  const { userId } = req.user;
  console.log(voteIdx);
  try {
    const debate = await debatesModel.findById(debateId);
    if (!debate) {
      return res.status(400).json({ message: "Debate not found" });
    }
    // let voteIndex = 0;
    // debate.options.forEach((option, index) => {
    //   if (!option.isRemoved) {
    //     option.votes += votes[voteIndex];
    //     voteIndex++;
    //   }
    // });
    
    
    debate.options[voteIdx].votes+=1;
    debate.totalVotes += 1;
    console.log(debate);
    await debate.save();
    const newVote = new votesModel({
      userId,
      debateId,
      voteIdx,
    });
    await newVote.save();
    res.status(200).json({ message: "Votes Casted Successfully !" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Server error" });
  }
};

const FetchVotes = async (req, res) => {
  const { debateId } = req.query;
  const { userId } = req.user;
  console.log(debateId, userId);
  try {
    const vote = await votesModel.findOne({ debateId, userId });
    console.log(vote);
    if (!vote) {
      return res.status(200).json({ voteIdx: -1 });
    }
    res.status(200).json({ voteIdx: vote.voteIdx });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Server error" });
  }
};

const AddComment = async (req, res) => {
  const { comment, debateId } = req.body;
  const { email } = req.user;
  const userName = email.split("@")[0];
  // console.log(comment, debateId, userName);
  try {
    if (!comment || !debateId || !userName) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newComment = new commentsModel({
      comment,
      debateId,
      userName,
    });
    await newComment.save();
    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const fetchComments = async (req, res) => {
  const { debateId } = req.params
  console.log(debateId);
  try {
    const comments = await commentsModel.find({ debateId, removed: false }).sort({
      createdOn: -1,
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

module.exports = {
  AllDebates,
  CreateDebate,
  MyDebates,
  LikeDebate,
  VoteDebate,
  FetchVotes,
  AddComment,
  fetchComments,
};
