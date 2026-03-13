import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    }
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      required: true,
    },
    topics: {
      type: [topicSchema],
      default: [],
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;