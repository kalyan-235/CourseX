import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getCourseById,
  getCourseProgress,
  updateCourseProgress,
} from "../services/courseService";

export default function Player() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [progressItem, setProgressItem] = useState(null);

  const getLessonKey = (lesson) => String(lesson?.id || lesson?._id || "");
  const getTopicKey = (topic) => String(topic?.id || topic?._id || "");

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        const courseData = await getCourseById(id);
        setCourse(courseData);

        const courseId = courseData.id || courseData._id;
        const currentProgress = getCourseProgress(courseId);
        setProgressItem(currentProgress);

        if (currentProgress?.currentTopicId) {
          const topicId = currentProgress.currentTopicId;
          setSelectedTopicId(topicId);

          for (const lesson of courseData.lessons || []) {
            const found = (lesson.topics || []).find(
              (topic) => getTopicKey(topic) === String(topicId)
            );
            if (found) {
              setSelectedLessonId(getLessonKey(lesson));
              return;
            }
          }
        }

        if (courseData.lessons?.length > 0) {
          const firstLesson = courseData.lessons[0];
          setSelectedLessonId(getLessonKey(firstLesson));

          if (firstLesson.topics?.length > 0) {
            setSelectedTopicId(getTopicKey(firstLesson.topics[0]));
          }
        }
      } catch (error) {
        console.error("Error loading player:", error);
      }
    };

    fetchCourseAndProgress();
  }, [id]);

  const selectedLesson = useMemo(() => {
    return (
      course?.lessons?.find(
        (lesson) => getLessonKey(lesson) === String(selectedLessonId)
      ) || null
    );
  }, [course, selectedLessonId]);

  const selectedTopic = useMemo(() => {
    return (
      selectedLesson?.topics?.find(
        (topic) => getTopicKey(topic) === String(selectedTopicId)
      ) || null
    );
  }, [selectedLesson, selectedTopicId]);

  const allTopics = useMemo(() => {
    return course?.lessons?.flatMap((lesson) => lesson.topics || []) || [];
  }, [course]);

  const completedTopicIds = progressItem?.completedTopicIds || [];

  const saveProgress = (updatedProgress) => {
    if (!course) return;
    const courseId = course.id || course._id;
    updateCourseProgress(courseId, updatedProgress);
    setProgressItem(updatedProgress);
  };

  const handleSelectTopic = (lessonId, topicId) => {
    setSelectedLessonId(lessonId);
    setSelectedTopicId(topicId);

    const updated = {
      ...(progressItem || {
        completedTopicIds: [],
        percent: 0,
        currentTopicId: "",
      }),
      currentTopicId: topicId,
    };

    saveProgress(updated);
  };

  const markAsComplete = () => {
    if (!selectedTopicId) return;

    let updatedCompleted = [...completedTopicIds];

    if (!updatedCompleted.includes(selectedTopicId)) {
      updatedCompleted.push(selectedTopicId);
    }

    const percent = allTopics.length
      ? Math.round((updatedCompleted.length / allTopics.length) * 100)
      : 0;

    const updated = {
      completedTopicIds: updatedCompleted,
      currentTopicId: selectedTopicId,
      percent,
    };

    saveProgress(updated);
    alert("Topic marked as completed");
  };

  const handleNextTopic = () => {
    if (!selectedTopicId || !allTopics.length) return;

    const topicIds = allTopics.map((topic) => getTopicKey(topic));
    const currentIndex = topicIds.findIndex(
      (topicId) => String(topicId) === String(selectedTopicId)
    );

    if (currentIndex === -1 || currentIndex === topicIds.length - 1) return;

    const nextTopicId = topicIds[currentIndex + 1];

    for (const lesson of course.lessons || []) {
      const found = (lesson.topics || []).find(
        (topic) => getTopicKey(topic) === String(nextTopicId)
      );

      if (found) {
        handleSelectTopic(getLessonKey(lesson), nextTopicId);
        break;
      }
    }
  };

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container player-page">
        <div className="player-main">
          <div className="video-box">
            {selectedTopic?.videoUrl ? (
              <iframe
                width="100%"
                height="380"
                src={selectedTopic.videoUrl}
                title={selectedTopic.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : course.videoUrl ? (
              <iframe
                width="100%"
                height="380"
                src={course.videoUrl}
                title={course.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="video-placeholder">No Video Available</div>
            )}
          </div>

          <div className="topic-content">
            <h2>{selectedTopic?.title || "No Topic Selected"}</h2>
            <p>{selectedTopic?.content || "No topic content available."}</p>

            {selectedTopicId && (
              <div className="card-actions">
                <button onClick={markAsComplete} className="btn btn-primary">
                  Mark Topic Complete
                </button>

                <button
                  onClick={handleNextTopic}
                  className="btn btn-light"
                  style={{ marginLeft: "10px" }}
                >
                  Next Topic
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="player-sidebar">
          <h3>{course.title}</h3>
          <p><strong>Progress:</strong> {progressItem?.percent || 0}%</p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressItem?.percent || 0}%` }}
            ></div>
          </div>

          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson) => (
              <div className="sidebar-lesson" key={getLessonKey(lesson)}>
                <h4>{lesson.order}. {lesson.title}</h4>

                <div className="topic-list">
                  {(lesson.topics || []).map((topic) => {
                    const topicId = getTopicKey(topic);
                    const isActive = String(topicId) === String(selectedTopicId);
                    const isCompleted = completedTopicIds.includes(topicId);

                    return (
                      <button
                        key={topicId}
                        className={`topic-btn ${isActive ? "active-topic" : ""}`}
                        onClick={() => handleSelectTopic(getLessonKey(lesson), topicId)}
                      >
                        <span>{topic.title}</span>
                        {isCompleted && <span>✅</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p>No lessons available for this course.</p>
          )}
        </div>
      </div>
    </>
  );
}