const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/resolveiq")
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error);
  });

// Complaint Schema
const complaintSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  user: String,
  title: String,
  description: String,
  category: String,
  urgency: Number,
  affected: Number,
  location: String,
  priority: String,
  score: Number,
  status: {
    type: String,
    default: "Pending"
  },
  date: String
});

const Complaint = mongoose.model("Complaint", complaintSchema);


// ===============================
// TEST API
// ===============================

app.get("/", (req, res) => {
  res.send("ResolveIQ Backend is Running");
});


// ===============================
// GET ALL COMPLAINTS
// ===============================

app.get("/api/complaints", async (req, res) => {
  try {

    const complaints = await Complaint
      .find()
      .sort({ _id: -1 });

    res.json(complaints);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Unable to fetch complaints",
      error: error.message
    });

  }
});


// ===============================
// CREATE COMPLAINT
// ===============================

app.post("/api/complaints", async (req, res) => {

  try {

    const {
      user,
      title,
      description,
      category,
      urgency,
      affected,
      location,
      priority,
      score,
      status,
      date
    } = req.body;


    const lastComplaint =
      await Complaint
        .findOne()
        .sort({ _id: -1 });


    let nextNumber = 1001;

    if (lastComplaint && lastComplaint.id) {

      const lastNumber =
        parseInt(
          lastComplaint.id.replace("CMP-", "")
        );

      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }

    }


    const complaint = new Complaint({

      id: "CMP-" + nextNumber,

      user,
      title,
      description,
      category,
      urgency,
      affected,
      location,
      priority,
      score,

      status: status || "Pending",

      date:
        date ||
        new Date().toISOString().split("T")[0]

    });


    const savedComplaint =
      await complaint.save();


    res.status(201).json({

      success: true,

      message: "Complaint submitted successfully",

      complaint: savedComplaint

    });


  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: "Unable to submit complaint",

      error: error.message

    });

  }

});


// ===============================
// UPDATE COMPLAINT STATUS
// ===============================

app.put("/api/complaints/:id/status", async (req, res) => {

  try {

    const { status } = req.body;

    const complaint =
      await Complaint.findOneAndUpdate(

        { id: req.params.id },

        { status: status },

        { new: true }

      );


    if (!complaint) {

      return res.status(404).json({

        success: false,

        message: "Complaint not found"

      });

    }


    res.json({

      success: true,

      message: "Status updated successfully",

      complaint

    });


  } catch (error) {

    res.status(500).json({

      success: false,

      message: "Unable to update status",

      error: error.message

    });

  }

});


// ===============================
// DELETE COMPLAINT
// ===============================

app.delete("/api/complaints/:id", async (req, res) => {

  try {

    const deleted =
      await Complaint.findOneAndDelete({
        id: req.params.id
      });


    if (!deleted) {

      return res.status(404).json({

        success: false,

        message: "Complaint not found"

      });

    }


    res.json({

      success: true,

      message: "Complaint deleted successfully"

    });


  } catch (error) {

    res.status(500).json({

      success: false,

      message: "Unable to delete complaint",

      error: error.message

    });

  }

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

  console.log(
    `ResolveIQ Backend running on http://localhost:${PORT}`
  );

});