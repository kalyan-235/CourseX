import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getAuthUser,
  getCourseProgress,
  getCourses,
  getEnrolledCourses,
} from "../services/courseService";

export default function MyCourses() {
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    const fetchMyCourses = async () => {
      const user = getAuthUser();
      if (!user) return;

      try {
        const courses = await getCourses();
        const enrolledIds = getEnrolledCourses().map((id) => String(id));

        const enrolledCourses = courses
          .filter((course) => {
            const courseId = String(course.id || course._id);
            return enrolledIds.includes(courseId);
          })
          .map((course) => {
            const courseId = course.id || course._id;
            const progress = getCourseProgress(courseId);

            return {
              ...course,
              percent: progress?.percent || 0,
            };
          });

        setMyCourses(enrolledCourses);
      } catch (error) {
        console.error("Error fetching my courses:", error);
      }
    };

    fetchMyCourses();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>My Courses</h1>

        <div className="grid">
          {myCourses.length > 0 ? (
            myCourses.map((course) => {
              const courseId = course.id || course._id;

              return (
                <div className="card" key={courseId}>
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="card-image"
                  />
                  <div className="card-body">
                    <h3>{course.title}</h3>
                    <p><strong>Instructor:</strong> {course.instructor}</p>
                    <p><strong>Duration:</strong> {course.duration}</p>
                    <p><strong>Lessons:</strong> {course.lessons?.length || 0}</p>
                    <p><strong>Progress:</strong> {course.percent}%</p>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.percent}%` }}
                      ></div>
                    </div>

                    <div className="card-actions">
                      <Link
                        to={`/player/${courseId}`}
                        className="btn btn-primary full-btn"
                      >
                        Start Learning
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No enrolled courses found.</p>
          )}
        </div>
      </div>
    </>
  );
}