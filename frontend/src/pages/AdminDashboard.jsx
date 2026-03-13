import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
  addCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from "../services/courseService.js";

export default function AdminDashboard() {
  const emptyCourseForm = {
    title: "",
    description: "",
    instructor: "",
    duration: "",
    level: "Beginner",
    category: "Frontend",
    thumbnail: "",
    rating: 4.5,
    videoUrl: "",
  };

  const emptyLessonForm = {
    selectedLessonId: "",
    lessonTitle: "",
    lessonDuration: "",
  };

  const emptyTopicForm = {
    selectedTopicId: "",
    topicTitle: "",
    topicContent: "",
    topicVideoUrl: "",
  };

  const [courses, setCourses] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [topicForm, setTopicForm] = useState(emptyTopicForm);
  const [draftLessons, setDraftLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCourseKey = (course) => String(course?.id || course?._id || "");
  const getLessonKey = (lesson) => String(lesson?.id || lesson?._id || "");
  const getTopicKey = (topic) => String(topic?.id || topic?._id || "");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const selectedCourse = useMemo(() => {
    return (
      courses.find((course) => getCourseKey(course) === String(editingCourseId)) ||
      null
    );
  }, [courses, editingCourseId]);

  const activeLessons = editingCourseId
    ? selectedCourse?.lessons || []
    : draftLessons;

  const activeSelectedLesson = useMemo(() => {
    return (
      activeLessons.find(
        (lesson) => getLessonKey(lesson) === String(lessonForm.selectedLessonId)
      ) || null
    );
  }, [activeLessons, lessonForm.selectedLessonId]);

  const activeTopics = activeSelectedLesson?.topics || [];

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLessonChange = (e) => {
    const { name, value } = e.target;
    setLessonForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTopicChange = (e) => {
    const { name, value } = e.target;
    setTopicForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetTopicForm = () => {
    setTopicForm(emptyTopicForm);
  };

  const resetLessonAndTopicForms = () => {
    setLessonForm(emptyLessonForm);
    setTopicForm(emptyTopicForm);
  };

  const resetAllForms = () => {
    setEditingCourseId(null);
    setCourseForm(emptyCourseForm);
    setLessonForm(emptyLessonForm);
    setTopicForm(emptyTopicForm);
    setDraftLessons([]);
  };

  const handleAddOrUpdateCourse = async (e) => {
    e.preventDefault();

    if (
      !courseForm.title.trim() ||
      !courseForm.description.trim() ||
      !courseForm.instructor.trim() ||
      !courseForm.duration.trim()
    ) {
      alert("Please fill all required course fields");
      return;
    }

    const payload = {
      title: courseForm.title.trim(),
      description: courseForm.description.trim(),
      instructor: courseForm.instructor.trim(),
      duration: courseForm.duration.trim(),
      level: courseForm.level,
      category: courseForm.category,
      thumbnail: courseForm.thumbnail.trim(),
      rating: Number(courseForm.rating),
      videoUrl: courseForm.videoUrl.trim(),
      lessons: activeLessons,
    };

    try {
      if (editingCourseId) {
        await updateCourse(editingCourseId, payload);
        alert("Course updated successfully");
      } else {
        await addCourse({
          id: Date.now().toString(),
          ...payload,
        });
        alert("Course added successfully");
      }

      resetAllForms();
      await fetchCourses();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong");
    }
  };

  const handleEditCourse = (course) => {
    const courseKey = getCourseKey(course);
    setEditingCourseId(courseKey);

    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      instructor: course.instructor || "",
      duration: course.duration || "",
      level: course.level || "Beginner",
      category: course.category || "Frontend",
      thumbnail: course.thumbnail || "",
      rating: course.rating || 4.5,
      videoUrl: course.videoUrl || "",
    });

    setDraftLessons([]);

    const firstLesson = course.lessons?.[0];

    if (firstLesson) {
      setLessonForm({
        selectedLessonId: getLessonKey(firstLesson),
        lessonTitle: firstLesson.title || "",
        lessonDuration: firstLesson.duration || "",
      });

      const firstTopic = firstLesson.topics?.[0];
      if (firstTopic) {
        setTopicForm({
          selectedTopicId: getTopicKey(firstTopic),
          topicTitle: firstTopic.title || "",
          topicContent: firstTopic.content || "",
          topicVideoUrl: firstTopic.videoUrl || "",
        });
      } else {
        setTopicForm(emptyTopicForm);
      }
    } else {
      setLessonForm(emptyLessonForm);
      setTopicForm(emptyTopicForm);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDeleteCourse = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteCourse(id);
      alert("Course deleted successfully");

      if (String(editingCourseId) === String(id)) {
        resetAllForms();
      }

      await fetchCourses();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete course");
    }
  };

  const handleSelectLesson = (e) => {
    const lessonId = e.target.value;

    if (!lessonId) {
      setLessonForm(emptyLessonForm);
      setTopicForm(emptyTopicForm);
      return;
    }

    const lesson = activeLessons.find(
      (item) => getLessonKey(item) === String(lessonId)
    );

    if (!lesson) return;

    setLessonForm({
      selectedLessonId: getLessonKey(lesson),
      lessonTitle: lesson.title || "",
      lessonDuration: lesson.duration || "",
    });

    const firstTopic = lesson.topics?.[0];
    if (firstTopic) {
      setTopicForm({
        selectedTopicId: getTopicKey(firstTopic),
        topicTitle: firstTopic.title || "",
        topicContent: firstTopic.content || "",
        topicVideoUrl: firstTopic.videoUrl || "",
      });
    } else {
      setTopicForm(emptyTopicForm);
    }
  };

  const handleSelectTopic = (e) => {
    const topicId = e.target.value;

    if (!topicId) {
      resetTopicForm();
      return;
    }

    const topic = activeTopics.find(
      (item) => getTopicKey(item) === String(topicId)
    );

    if (!topic) return;

    setTopicForm({
      selectedTopicId: getTopicKey(topic),
      topicTitle: topic.title || "",
      topicContent: topic.content || "",
      topicVideoUrl: topic.videoUrl || "",
    });
  };

  const handleSaveLesson = () => {
    if (!lessonForm.lessonTitle.trim() || !lessonForm.lessonDuration.trim()) {
      alert("Please fill lesson title and duration");
      return;
    }

    if (editingCourseId) {
      const course = courses.find(
        (item) => getCourseKey(item) === String(editingCourseId)
      );
      if (!course) return;

      let updatedLessons = [...(course.lessons || [])];

      if (lessonForm.selectedLessonId) {
        updatedLessons = updatedLessons.map((lesson, index) => {
          if (getLessonKey(lesson) !== String(lessonForm.selectedLessonId)) {
            return lesson;
          }

          return {
            ...lesson,
            title: lessonForm.lessonTitle.trim(),
            duration: lessonForm.lessonDuration.trim(),
            order: index + 1,
          };
        });
      } else {
        updatedLessons.push({
          id: `lesson-${Date.now()}`,
          title: lessonForm.lessonTitle.trim(),
          duration: lessonForm.lessonDuration.trim(),
          order: updatedLessons.length + 1,
          topics: [],
        });
      }

      updateCourse(editingCourseId, { lessons: updatedLessons })
        .then(async () => {
          alert(lessonForm.selectedLessonId ? "Lesson updated" : "Lesson added");
          await fetchCourses();

          const refreshed = await getCourses();
          const refreshedCourse = refreshed.find(
            (item) => getCourseKey(item) === String(editingCourseId)
          );
          setCourses(refreshed);

          if (refreshedCourse?.lessons?.length) {
            const targetLesson =
              refreshedCourse.lessons.find(
                (l) => getLessonKey(l) === String(lessonForm.selectedLessonId)
              ) || refreshedCourse.lessons[refreshedCourse.lessons.length - 1];

            setLessonForm({
              selectedLessonId: getLessonKey(targetLesson),
              lessonTitle: targetLesson.title || "",
              lessonDuration: targetLesson.duration || "",
            });
            setTopicForm(emptyTopicForm);
          }
        })
        .catch((error) => {
          console.error(error);
          alert(error.message || "Failed to save lesson");
        });
    } else {
      let updatedDraftLessons = [...draftLessons];

      if (lessonForm.selectedLessonId) {
        updatedDraftLessons = updatedDraftLessons.map((lesson, index) => {
          if (getLessonKey(lesson) !== String(lessonForm.selectedLessonId)) {
            return lesson;
          }

          return {
            ...lesson,
            title: lessonForm.lessonTitle.trim(),
            duration: lessonForm.lessonDuration.trim(),
            order: index + 1,
          };
        });
      } else {
        updatedDraftLessons.push({
          id: `lesson-${Date.now()}`,
          title: lessonForm.lessonTitle.trim(),
          duration: lessonForm.lessonDuration.trim(),
          order: updatedDraftLessons.length + 1,
          topics: [],
        });
      }

      setDraftLessons(updatedDraftLessons);

      const targetLesson =
        updatedDraftLessons.find(
          (l) => getLessonKey(l) === String(lessonForm.selectedLessonId)
        ) || updatedDraftLessons[updatedDraftLessons.length - 1];

      setLessonForm({
        selectedLessonId: getLessonKey(targetLesson),
        lessonTitle: targetLesson.title || "",
        lessonDuration: targetLesson.duration || "",
      });

      setTopicForm(emptyTopicForm);
      alert(lessonForm.selectedLessonId ? "Lesson updated" : "Lesson added");
    }
  };

  const handleSaveTopic = () => {
    if (!lessonForm.selectedLessonId) {
      alert("First select or create a lesson");
      return;
    }

    if (!topicForm.topicTitle.trim() || !topicForm.topicContent.trim()) {
      alert("Please fill topic title and content");
      return;
    }

    const applyTopicChanges = (lessons) => {
      return lessons.map((lesson) => {
        if (getLessonKey(lesson) !== String(lessonForm.selectedLessonId)) {
          return lesson;
        }

        const existingTopics = lesson.topics || [];
        let updatedTopics = [...existingTopics];

        if (topicForm.selectedTopicId) {
          updatedTopics = updatedTopics.map((topic) => {
            if (getTopicKey(topic) !== String(topicForm.selectedTopicId)) {
              return topic;
            }

            return {
              ...topic,
              title: topicForm.topicTitle.trim(),
              content: topicForm.topicContent.trim(),
              videoUrl: topicForm.topicVideoUrl.trim(),
            };
          });
        } else {
          updatedTopics.push({
            id: `topic-${Date.now()}`,
            title: topicForm.topicTitle.trim(),
            completed: false,
            content: topicForm.topicContent.trim(),
            videoUrl: topicForm.topicVideoUrl.trim(),
          });
        }

        return {
          ...lesson,
          topics: updatedTopics,
        };
      });
    };

    if (editingCourseId) {
      const course = courses.find(
        (item) => getCourseKey(item) === String(editingCourseId)
      );
      if (!course) return;

      const updatedLessons = applyTopicChanges(course.lessons || []);

      updateCourse(editingCourseId, { lessons: updatedLessons })
        .then(async () => {
          alert(topicForm.selectedTopicId ? "Topic updated" : "Topic added");
          await fetchCourses();

          const refreshed = await getCourses();
          const refreshedCourse = refreshed.find(
            (item) => getCourseKey(item) === String(editingCourseId)
          );
          setCourses(refreshed);

          const lesson = refreshedCourse?.lessons?.find(
            (l) => getLessonKey(l) === String(lessonForm.selectedLessonId)
          );

          const topic =
            lesson?.topics?.find(
              (t) => getTopicKey(t) === String(topicForm.selectedTopicId)
            ) || lesson?.topics?.[lesson.topics.length - 1];

          if (topic) {
            setTopicForm({
              selectedTopicId: getTopicKey(topic),
              topicTitle: topic.title || "",
              topicContent: topic.content || "",
              topicVideoUrl: topic.videoUrl || "",
            });
          } else {
            setTopicForm(emptyTopicForm);
          }
        })
        .catch((error) => {
          console.error(error);
          alert(error.message || "Failed to save topic");
        });
    } else {
      const updatedDraftLessons = applyTopicChanges(draftLessons);
      setDraftLessons(updatedDraftLessons);

      const lesson = updatedDraftLessons.find(
        (l) => getLessonKey(l) === String(lessonForm.selectedLessonId)
      );

      const topic =
        lesson?.topics?.find(
          (t) => getTopicKey(t) === String(topicForm.selectedTopicId)
        ) || lesson?.topics?.[lesson.topics.length - 1];

      if (topic) {
        setTopicForm({
          selectedTopicId: getTopicKey(topic),
          topicTitle: topic.title || "",
          topicContent: topic.content || "",
          topicVideoUrl: topic.videoUrl || "",
        });
      } else {
        setTopicForm(emptyTopicForm);
      }

      alert(topicForm.selectedTopicId ? "Topic updated" : "Topic added");
    }
  };

  const handleDeleteSelectedLesson = () => {
    if (!lessonForm.selectedLessonId) {
      alert("Please select a lesson");
      return;
    }

    const confirmDelete = window.confirm("Are you sure to delete this lesson?");
    if (!confirmDelete) return;

    if (editingCourseId) {
      const course = courses.find(
        (item) => getCourseKey(item) === String(editingCourseId)
      );
      if (!course) return;

      const updatedLessons = (course.lessons || [])
        .filter(
          (lesson) => getLessonKey(lesson) !== String(lessonForm.selectedLessonId)
        )
        .map((lesson, index) => ({
          ...lesson,
          order: index + 1,
        }));

      updateCourse(editingCourseId, { lessons: updatedLessons })
        .then(async () => {
          alert("Lesson deleted");
          await fetchCourses();
          setLessonForm(emptyLessonForm);
          setTopicForm(emptyTopicForm);
        })
        .catch((error) => {
          console.error(error);
          alert(error.message || "Failed to delete lesson");
        });
    } else {
      const updatedDraftLessons = draftLessons
        .filter(
          (lesson) => getLessonKey(lesson) !== String(lessonForm.selectedLessonId)
        )
        .map((lesson, index) => ({
          ...lesson,
          order: index + 1,
        }));

      setDraftLessons(updatedDraftLessons);
      setLessonForm(emptyLessonForm);
      setTopicForm(emptyTopicForm);
      alert("Lesson removed");
    }
  };

  const handleDeleteSelectedTopic = () => {
    if (!lessonForm.selectedLessonId || !topicForm.selectedTopicId) {
      alert("Please select a topic");
      return;
    }

    const removeTopic = (lessons) =>
      lessons.map((lesson) => {
        if (getLessonKey(lesson) !== String(lessonForm.selectedLessonId)) {
          return lesson;
        }

        return {
          ...lesson,
          topics: (lesson.topics || []).filter(
            (topic) => getTopicKey(topic) !== String(topicForm.selectedTopicId)
          ),
        };
      });

    if (editingCourseId) {
      const course = courses.find(
        (item) => getCourseKey(item) === String(editingCourseId)
      );
      if (!course) return;

      const updatedLessons = removeTopic(course.lessons || []);

      updateCourse(editingCourseId, { lessons: updatedLessons })
        .then(async () => {
          alert("Topic deleted");
          await fetchCourses();
          setTopicForm(emptyTopicForm);
        })
        .catch((error) => {
          console.error(error);
          alert(error.message || "Failed to delete topic");
        });
    } else {
      const updatedDraftLessons = removeTopic(draftLessons);
      setDraftLessons(updatedDraftLessons);
      setTopicForm(emptyTopicForm);
      alert("Topic removed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h1>Admin Dashboard</h1>

        {loading && <p>Loading courses...</p>}

        <div className="admin-grid">
          <form className="admin-card" onSubmit={handleAddOrUpdateCourse}>
            <h2>{editingCourseId ? "Edit Course" : "Add New Course"}</h2>

            <input
              type="text"
              name="title"
              placeholder="Course title"
              value={courseForm.title}
              onChange={handleCourseChange}
            />

            <textarea
              name="description"
              placeholder="Course description"
              value={courseForm.description}
              onChange={handleCourseChange}
              rows="4"
            />

            <input
              type="text"
              name="instructor"
              placeholder="Instructor name"
              value={courseForm.instructor}
              onChange={handleCourseChange}
            />

            <input
              type="text"
              name="duration"
              placeholder="Duration"
              value={courseForm.duration}
              onChange={handleCourseChange}
            />

            <select
              name="level"
              value={courseForm.level}
              onChange={handleCourseChange}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              name="category"
              value={courseForm.category}
              onChange={handleCourseChange}
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Full Stack">Full Stack</option>
              <option value="Database">Database</option>
              <option value="Programming">Programming</option>
            </select>

            <input
              type="text"
              name="thumbnail"
              placeholder="Thumbnail image URL"
              value={courseForm.thumbnail}
              onChange={handleCourseChange}
            />

            <input
              type="number"
              step="0.1"
              name="rating"
              placeholder="Rating"
              value={courseForm.rating}
              onChange={handleCourseChange}
            />

            <input
              type="text"
              name="videoUrl"
              placeholder="Course video embed URL"
              value={courseForm.videoUrl}
              onChange={handleCourseChange}
            />

            <button className="btn btn-primary full-btn" type="submit">
              {editingCourseId ? "Update Course" : "Add Course"}
            </button>

            {(draftLessons.length > 0 || editingCourseId) && (
              <button
                type="button"
                className="btn btn-light full-btn"
                onClick={resetAllForms}
              >
                {editingCourseId ? "Cancel Edit" : "Clear New Course"}
              </button>
            )}
          </form>

          <div className="admin-card">
            <h2>
              {editingCourseId
                ? "Lessons / Topics Editor"
                : "Add Lessons & Topics While Creating Course"}
            </h2>

            <select
              name="selectedLessonId"
              value={lessonForm.selectedLessonId}
              onChange={handleSelectLesson}
            >
              <option value="">New Lesson</option>
              {activeLessons.map((lesson) => (
                <option key={getLessonKey(lesson)} value={getLessonKey(lesson)}>
                  {lesson.order}. {lesson.title}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="lessonTitle"
              placeholder="Lesson title"
              value={lessonForm.lessonTitle}
              onChange={handleLessonChange}
            />

            <input
              type="text"
              name="lessonDuration"
              placeholder="Lesson duration"
              value={lessonForm.lessonDuration}
              onChange={handleLessonChange}
            />

            <button
              className="btn btn-primary full-btn"
              type="button"
              onClick={handleSaveLesson}
            >
              {lessonForm.selectedLessonId ? "Update Lesson" : "Add Lesson"}
            </button>

            <button
              type="button"
              className="btn btn-light full-btn"
              onClick={() => {
                setLessonForm(emptyLessonForm);
                setTopicForm(emptyTopicForm);
              }}
            >
              New Lesson Mode
            </button>

            {lessonForm.selectedLessonId && (
              <button
                type="button"
                className="btn btn-dark full-btn"
                onClick={handleDeleteSelectedLesson}
              >
                Delete Selected Lesson
              </button>
            )}

            <hr style={{ margin: '18px 0' }} />

            <h3>Topics</h3>

            <select
              name="selectedTopicId"
              value={topicForm.selectedTopicId}
              onChange={handleSelectTopic}
              disabled={!lessonForm.selectedLessonId}
            >
              <option value="">New Topic</option>
              {activeTopics.map((topic) => (
                <option key={getTopicKey(topic)} value={getTopicKey(topic)}>
                  {topic.title}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="topicTitle"
              placeholder="Topic title"
              value={topicForm.topicTitle}
              onChange={handleTopicChange}
              disabled={!lessonForm.selectedLessonId}
            />

            <textarea
              name="topicContent"
              placeholder="Topic content"
              value={topicForm.topicContent}
              onChange={handleTopicChange}
              rows="4"
              disabled={!lessonForm.selectedLessonId}
            />

            <input
              type="text"
              name="topicVideoUrl"
              placeholder="Topic video embed URL"
              value={topicForm.topicVideoUrl}
              onChange={handleTopicChange}
              disabled={!lessonForm.selectedLessonId}
            />

            <button
              className="btn btn-primary full-btn"
              type="button"
              onClick={handleSaveTopic}
              disabled={!lessonForm.selectedLessonId}
            >
              {topicForm.selectedTopicId ? "Update Topic" : "Add Topic"}
            </button>

            <button
              type="button"
              className="btn btn-light full-btn"
              onClick={resetTopicForm}
              disabled={!lessonForm.selectedLessonId}
            >
              New Topic Mode
            </button>

            {topicForm.selectedTopicId && (
              <button
                type="button"
                className="btn btn-dark full-btn"
                onClick={handleDeleteSelectedTopic}
              >
                Delete Selected Topic
              </button>
            )}
          </div>
        </div>

        {activeLessons.length > 0 && (
          <div className="course-table-wrap">
            <h2>
              {editingCourseId
                ? `Editing Course Lessons: ${selectedCourse?.title || ""}`
                : "New Course Lessons Preview"}
            </h2>

            <div className="lesson-admin-list">
              {activeLessons.map((lesson) => (
                <div className="lesson-admin-item" key={getLessonKey(lesson)}>
                  <div className="lesson-admin-info">
                    <h4>
                      {lesson.order}. {lesson.title}
                    </h4>
                    <p>
                      <strong>Duration:</strong> {lesson.duration}
                    </p>
                    <p>
                      <strong>Topics:</strong> {lesson.topics?.length || 0}
                    </p>

                    {(lesson.topics || []).length > 0 && (
                      <div style={{ marginTop: "8px" }}>
                        {(lesson.topics || []).map((topic) => (
                          <p key={getTopicKey(topic)}>
                            • {topic.title}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="course-table-wrap">
          <h2>All Courses</h2>

          <div className="table-like">
            {courses.length > 0 ? (
              courses.map((course) => {
                const courseKey = getCourseKey(course);

                return (
                  <div className="table-row admin-course-row" key={courseKey}>
                    <div>
                      <h4>{course.title}</h4>
                      <p>
                        <strong>Instructor:</strong> {course.instructor}
                      </p>
                      <p>
                        <strong>Category:</strong> {course.category}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong>Level:</strong> {course.level}
                      </p>
                      <p>
                        <strong>Duration:</strong> {course.duration}
                      </p>
                      <p>
                        <strong>Lessons:</strong> {course.lessons?.length || 0}
                      </p>
                    </div>

                    <div className="admin-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditCourse(course)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-dark"
                        onClick={() => handleDeleteCourse(courseKey, course.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              !loading && <p>No courses available.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}