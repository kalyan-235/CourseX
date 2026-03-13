import mongoose from "mongoose";
import Course from "../models/Course.js";

// Helper: find course by custom id or Mongo _id
const findCourseByAnyId = async (id) => {
  let course = await Course.findOne({ id });

  if (!course && mongoose.Types.ObjectId.isValid(id)) {
    course = await Course.findById(id);
  }

  return course;
};

// Create course
const createCourse = async (req, res) => {
  try {
    const existingCourse = await Course.findOne({ id: req.body.id });

    if (existingCourse) {
      return res.status(400).json({ message: "Course ID already exists" });
    }

    const course = await Course.create(req.body);

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

// Get single course by custom id or Mongo _id
const getCourseById = async (req, res) => {
  try {
    const course = await findCourseByAnyId(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course",
      error: error.message,
    });
  }
};

// Update course by custom id or Mongo _id
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    let updatedCourse = await Course.findOneAndUpdate(
      { id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCourse && mongoose.Types.ObjectId.isValid(id)) {
      updatedCourse = await Course.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
    }

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update course",
      error: error.message,
    });
  }
};

// Delete course by custom id or Mongo _id
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    let deletedCourse = await Course.findOneAndDelete({ id });

    if (!deletedCourse && mongoose.Types.ObjectId.isValid(id)) {
      deletedCourse = await Course.findByIdAndDelete(id);
    }

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete course",
      error: error.message,
    });
  }
};

// Add lesson
const addLessonToCourse = async (req, res) => {
  try {
    const course = await findCourseByAnyId(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.lessons.push(req.body);
    await course.save();

    res.status(200).json({
      message: "Lesson added successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add lesson",
      error: error.message,
    });
  }
};

// Update lesson
const updateLesson = async (req, res) => {
  try {
    const { id, lessonId } = req.params;
    const course = await findCourseByAnyId(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lesson = course.lessons.find((l) => String(l.id) === String(lessonId));

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    lesson.title = req.body.title ?? lesson.title;
    lesson.duration = req.body.duration ?? lesson.duration;
    lesson.order = req.body.order ?? lesson.order;
    lesson.topics = req.body.topics ?? lesson.topics;

    await course.save();

    res.status(200).json({
      message: "Lesson updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update lesson",
      error: error.message,
    });
  }
};

// Delete lesson
const deleteLesson = async (req, res) => {
  try {
    const { id, lessonId } = req.params;
    const course = await findCourseByAnyId(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.lessons = course.lessons.filter(
      (lesson) => String(lesson.id) !== String(lessonId)
    );

    await course.save();

    res.status(200).json({
      message: "Lesson deleted successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete lesson",
      error: error.message,
    });
  }
};

// Add topic
const addTopicToLesson = async (req, res) => {
  try {
    const { id, lessonId } = req.params;
    const course = await findCourseByAnyId(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lesson = course.lessons.find((l) => String(l.id) === String(lessonId));

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    lesson.topics.push(req.body);
    await course.save();

    res.status(200).json({
      message: "Topic added successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add topic",
      error: error.message,
    });
  }
};

// Update topic
const updateTopic = async (req, res) => {
  try {
    const { id, lessonId, topicId } = req.params;
    const course = await findCourseByAnyId(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lesson = course.lessons.find((l) => String(l.id) === String(lessonId));

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const topic = lesson.topics.find((t) => String(t.id) === String(topicId));

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    topic.title = req.body.title ?? topic.title;
    topic.completed = req.body.completed ?? topic.completed;
    topic.content = req.body.content ?? topic.content;
    topic.videoUrl = req.body.videoUrl ?? topic.videoUrl;

    await course.save();

    res.status(200).json({
      message: "Topic updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update topic",
      error: error.message,
    });
  }
};

// Delete topic
const deleteTopic = async (req, res) => {
  try {
    const { id, lessonId, topicId } = req.params;
    const course = await findCourseByAnyId(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lesson = course.lessons.find((l) => String(l.id) === String(lessonId));

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    lesson.topics = lesson.topics.filter(
      (topic) => String(topic.id) !== String(topicId)
    );

    await course.save();

    res.status(200).json({
      message: "Topic deleted successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete topic",
      error: error.message,
    });
  }
};

export {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLessonToCourse,
  updateLesson,
  deleteLesson,
  addTopicToLesson,
  updateTopic,
  deleteTopic,
};