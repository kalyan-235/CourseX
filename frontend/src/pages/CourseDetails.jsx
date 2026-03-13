import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  enrollInCourse,
  getAuthUser,
  getCourseById,
  getCourseProgress,
  isCourseEnrolled,
  updateCourseProgress,
} from "../services/courseService";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!id) {
          setLoading(false);
          return;
        }

        const data = await getCourseById(id);
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course details:", error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    const user = getAuthUser();

    if (!user || user.isAdmin || !course) return;

    const courseId = course.id || course._id;
    setAlreadyEnrolled(isCourseEnrolled(courseId));
  }, [course]);

  const handleEnroll = () => {
    const user = getAuthUser();

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.isAdmin) {
      alert("Admin cannot enroll in courses");
      return;
    }

    if (alreadyEnrolled || !course) return;

    const courseId = course.id || course._id;

    enrollInCourse(courseId);

    const progress = getCourseProgress(courseId);

    if (!progress.currentTopicId) {
      updateCourseProgress(courseId, {
        completedTopicIds: [],
        percent: 0,
        currentTopicId: "",
      });
    }

    setAlreadyEnrolled(true);
    alert("Course enrolled successfully");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Course not found.</p>
        </div>
      </>
    );
  }

  const courseId = course.id || course._id;

  return (
    <>
      <Navbar />

      <div className="container details-layout">
        <div className="details-left">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="details-image"
          />
        </div>

        <div className="details-right">
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <p><strong>Instructor:</strong> {course.instructor}</p>
          <p><strong>Duration:</strong> {course.duration}</p>
          <p><strong>Level:</strong> {course.level}</p>
          <p><strong>Category:</strong> {course.category}</p>
          <p><strong>Rating:</strong> {course.rating}</p>
          <p><strong>Total Lessons:</strong> {course.lessons?.length || 0}</p>

          <div className="card-actions">
            {!alreadyEnrolled ? (
              <button onClick={handleEnroll} className="btn btn-primary">
                Enroll Now
              </button>
            ) : (
              <>
                <button
                  className="btn btn-light"
                  disabled
                  style={{ marginRight: "10px" }}
                >
                  Already Enrolled
                </button>

                <Link to={`/player/${courseId}`} className="btn btn-primary">
                  Start Learning
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <h2>Lessons List</h2>

        <div className="lesson-list">
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson) => (
              <div key={lesson.id || lesson._id} className="lesson-item">
                <div>
                  <h4>
                    {lesson.order}. {lesson.title}
                  </h4>
                  <p>Duration: {lesson.duration}</p>
                  <p>Topics: {lesson.topics?.length || 0}</p>
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