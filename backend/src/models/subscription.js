import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "is invalid email format"],
    },
    frequency: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "off"],
    },
    notificationTypes: {
      generalSummary: { type: Boolean, default: false },
      portfolioAlerts: { type: Boolean, default: false },
    },
    portfolioSymbols: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending_confirmation"],
      default: "active",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
