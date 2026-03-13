import express from "express";
import {
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
} from "../controllers/courseController.js";

const router = express.Router();

// Course routes
router.post("/", createCourse);
router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

// Lesson routes
router.post("/:id/lessons", addLessonToCourse);
router.put("/:id/lessons/:lessonId", updateLesson);
router.delete("/:id/lessons/:lessonId", deleteLesson);

// Topic routes
router.post("/:id/lessons/:lessonId/topics", addTopicToLesson);
router.put("/:id/lessons/:lessonId/topics/:topicId", updateTopic);
router.delete("/:id/lessons/:lessonId/topics/:topicId", deleteTopic);

export default router;