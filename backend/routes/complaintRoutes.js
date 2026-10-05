const express = require("express");
const Complaint = require("../models/Complaint");

const router = express.Router();

// Priority calculate karne ka function
function calculatePriority(urgency, impact) {
  const urgencyScore = {
    Low: 1,
    Medium: 2,
    High: 3,
  };

  const impactScore = {
    Low: 1,
    Medium: 2,
    High: 3,
  };

  const score = urgencyScore[urgency] + impactScore[impact];

  if (score >= 6) return "Critical";
  if (score >= 5) return "High";
  if (score >= 3) return "Medium";

  return "Low";
}

// CREATE complaint
router.post("/", async (req, res) => {
  try {
    const { title, description, category, urgency, impact } = req.body;

    const priority = calculatePriority(urgency, impact);

    const complaint = new Complaint({
      title,
      description,
      category,
      urgency,
      impact,
      priority,
    });

    const savedComplaint = await complaint.save();

    res.status(201).json(savedComplaint);
  } catch (error) {
    res.status(500).json({
      message: "Error creating complaint",
      error: error.message,
    });
  }
});

// GET all complaints
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching complaints",
      error: error.message,
    });
  }
});

// GET one complaint
router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching complaint",
      error: error.message,
    });
  }
});

// UPDATE complaint status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({
      message: "Error updating status",
      error: error.message,
    });
  }
});

// DELETE complaint
router.delete("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.json({
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting complaint",
      error: error.message,
    });
  }
});

module.exports = router;