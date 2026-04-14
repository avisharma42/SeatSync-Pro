import mongoose from "mongoose";

const releaseWindowSchema = new mongoose.Schema(
    {
        date: { type: String, required: true, unique: true },
        releasedAt: { type: Date, required: true }
    },
    { timestamps: true }
);

const ReleaseWindow = mongoose.model("ReleaseWindow", releaseWindowSchema);

export default ReleaseWindow;
