import Explore from "../models/Explore.js";
import User from "../models/User.js";
import SwapRequest from "../models/SwapRequest.js";
import Notification from "../models/Notification.js";

export const createSkill = async (req, res) => {
  const { name, description, category, languages, duration, durationUnit, startDate, endDate, desiredSkill } = req.body;
  const ownerId = req.user._id;

  try {
    // Check for pending mutual reviews before allowing a new skill to be shared
    const pendingReview = await SwapRequest.findOne({
      $and: [
        { $or: [{ sender: ownerId }, { receiver: ownerId }] },
        { status: { $in: ["accepted", "completed"] } },
        {
          $or: [
            { sender: ownerId, senderReviewed: false },
            { receiver: ownerId, receiverReviewed: false }
          ]
        }
      ]
    });

    if (pendingReview) {
      return res.status(400).json({ 
        message: "You must complete your review for your current/previous swap before you can share a new skill." 
      });
    }

    const exploreItem = await Explore.create({
      name,
      description,
      category,
      owner: ownerId,
      languages,
      duration,
      durationUnit,
      startDate,
      endDate,
      desiredSkill,
      status: "open"
    });

    // Update lastActive when user interacts
    await User.findByIdAndUpdate(ownerId, { lastActive: new Date() });

    res.status(201).json(exploreItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getSkills = async (req, res) => {
  try {
    const skills = await Explore.find().populate("owner", "name email avatar lastActive bio skills country");
    
    // Advanced Logic: Rank skills based on profile completeness (Trust Score)
    const rankedSkills = skills.sort((a, b) => {
      const getScore = (user) => {
        if (!user) return 0;
        let score = 0;
        if (user.avatar) score += 20; // Visual Identity
        if (user.bio) score += 20;    // Narrative Depth
        if (user.country) score += 10; // Geographic Validation
        if (user.skills && user.skills.length > 2) score += 30; // Expertise Level
        if (user.lastActive && (new Date() - new Date(user.lastActive) < 3 * 24 * 60 * 60 * 1000)) score += 20; // Recency/Activity
        return score;
      };
      return getScore(b.owner) - getScore(a.owner);
    });

    res.json(rankedSkills);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getSkillById = async (req, res) => {
  try {
    const skill = await Explore.findById(req.params.id).populate(
      "owner",
      "name email avatar lastActive",
    );
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const skill = await Explore.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (skill.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to update this skill" });
    }

    const updatedSkill = await Explore.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { returnDocument: 'after' }
    );

    // If skill is marked as completed, mark the associated accepted swap request as completed too
    if (req.body.status === "completed") {
      await SwapRequest.findOneAndUpdate(
        {
          $or: [{ senderSkill: req.params.id }, { receiverSkill: req.params.id }],
          status: "accepted"
        },
        { status: "completed" }
      );
    }
    
    // Update lastActive
    await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() });

    res.json(updatedSkill);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const repostSkill = async (req, res) => {
  try {
    const skill = await Explore.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (skill.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Reset status and possibly update dates/info if provided in body
    if (skill.status === "completed") {
      const pendingReview = await SwapRequest.findOne({
        $and: [
          { $or: [{ senderSkill: skill._id }, { receiverSkill: skill._id }] },
          { status: { $in: ["accepted", "completed"] } },
          {
            $or: [
              { sender: req.user._id, senderReviewed: false },
              { receiver: req.user._id, receiverReviewed: false }
            ]
          }
        ]
      });

      if (pendingReview) {
        return res.status(400).json({ 
          message: "You must complete your review for the previous swap before you can repost this skill." 
        });
      }
    }

    const repostedData = {
      ...req.body,
      status: "open",
    };

    const updatedSkill = await Explore.findByIdAndUpdate(
      req.params.id,
      repostedData,
      { returnDocument: 'after' }
    );

    res.json(updatedSkill);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const skill = await Explore.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (skill.owner.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this skill" });
    }

    await Explore.findByIdAndDelete(req.params.id);

    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const endorseSkill = async (req, res) => {
  try {
    const skill = await Explore.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (skill.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot endorse your own skill" });
    }

    if (!skill.endorsements) {
      skill.endorsements = [];
    }

    const hasEndorsed = skill.endorsements.some(id => id.toString() === req.user._id.toString());

    if (hasEndorsed) {
      // Remove endorsement
      skill.endorsements.pull(req.user._id);
      await User.findByIdAndUpdate(skill.owner, { $inc: { totalEndorsements: -1 } });
    } else {
      // Add endorsement
      skill.endorsements.push(req.user._id);
      await User.findByIdAndUpdate(skill.owner, { $inc: { totalEndorsements: 1 } });

      // Create notification
      await Notification.create({
        recipient: skill.owner,
        sender: req.user._id,
        type: "endorsement",
        title: "Skill Endorsed",
        description: `${req.user.name} endorsed your skill: ${skill.name}`,
      });
    }

    await skill.save();
    res.json({ message: hasEndorsed ? "Endorsement removed" : "Skill endorsed", endorsements: skill.endorsements });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

