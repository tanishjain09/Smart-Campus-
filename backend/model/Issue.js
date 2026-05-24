const mongoose = require("mongoose");
const generateTicketId = require("../utils/generateTicketId");
const { DEPARTMENTS, ISSUE_PRIORITIES, ISSUE_STATUSES } = require("../constants/issueConstants");

/**
 * Core issue schema for the complaint lifecycle.
 */
const issueSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
    trim: true
  },

  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 120
  },

  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },

  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60
  },

  department: {
    type: String,
    required: true,
    enum: DEPARTMENTS,
    default: "administration"
  },

  priority: {
    type: String,
    enum: ISSUE_PRIORITIES,
    default: "medium"
  },

  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },

  status: {
    type: String,
    enum: ISSUE_STATUSES,
    default: "reported"
  },

  attachments: [{
    url: {
      type: String,
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    },
    originalName: {
      type: String,
      trim: true
    },
    format: {
      type: String,
      trim: true
    },
    bytes: {
      type: Number,
      min: 0
    }
  }],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  escalationLevel: {
    type: Number,
    default: 0,
    min: 0
  },

  escalationDeadline: {
    type: Date
  },

  escalatedAt: {
    type: Date
  },

  resolvedAt: {
    type: Date
  },

  lastStatusChangedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

/**
 * Assigns a unique ticket id before validation when one is not already set.
 *
 * @returns {Promise<void>}
 */
issueSchema.pre("validate", async function issueTicketId() {
  if (!this.ticketId) {
    this.ticketId = await generateTicketId();
  }
});

/**
 * Sets lifecycle timestamps and escalation defaults before save.
 *
 * @returns {void}
 */
issueSchema.pre("save", function setOperationalDefaults() {
  if (this.isNew && !this.escalationDeadline) {
    this.escalationDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
  }

  if (this.isModified("status")) {
    this.lastStatusChangedAt = new Date();
    this.resolvedAt = this.status === "resolved" ? new Date() : null;
  }
});

issueSchema.index({ status: 1, category: 1, createdAt: -1 });
issueSchema.index({ createdBy: 1, createdAt: -1 });
issueSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
issueSchema.index({ department: 1, status: 1, priority: -1, createdAt: -1 });
issueSchema.index({ escalationDeadline: 1, status: 1 });
issueSchema.index({ title: "text", description: "text", location: "text", category: "text" });

module.exports = mongoose.model("Issue", issueSchema);
