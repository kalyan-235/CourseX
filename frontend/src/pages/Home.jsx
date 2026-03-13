import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getAuthUser,
  getCourses,
  getEnrolledCourses,
} from "../services/courseService";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  const user = getAuthUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(Array.isArray(coursesData) ? coursesData : []);

        if (user && !user.isAdmin) {
          const myCourses = getEnrolledCourses();
          setEnrolledCourseIds(myCourses.map((id) => String(id)));
        } else {
          setEnrolledCourseIds([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchData();
  }, [user?.id, user?.email, user?.isAdmin]);

  const categories = [
    "All",
    ...new Set(courses.map((c) => c.category).filter(Boolean)),
  ];

  const levels = [
    "All",
    ...new Set(courses.map((c) => c.level).filter(Boolean)),
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const title = course.title || "";
      const matchSearch = title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || course.category === category;
      const matchLevel = level === "All" || course.level === level;

      return matchSearch && matchCategory && matchLevel;
    });
  }, [courses, search, category, level]);

  return (
    <>
      <Navbar />

      <div className="container">
        <div className="filters">
          <input
            type="text"
            placeholder="Search course by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => {
              const courseId = course.id || course._id;
              const isEnrolled = enrolledCourseIds.includes(String(courseId));

              return (
                <div className="card" key={courseId}>
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="card-image"
                  />

                  <div className="card-body">
                    <h3>{course.title}</h3>

                    <p>
                      <strong>Instructor:</strong> {course.instructor}
                    </p>
                    <p>
                      <strong>Duration:</strong> {course.duration}
                    </p>
                    <p>
                      <strong>Category:</strong> {course.category}
                    </p>
                    <p>
                      <strong>Level:</strong> {course.level}
                    </p>
                    <p>
                      <strong>Lessons:</strong> {course.lessons?.length || 0}
                    </p>

                    <div className="card-actions">
                      <Link
                        to={`/course/${courseId}`}
                        className="btn btn-light full-btn"
                        style={{ marginBottom: "10px" }}
                      >
                        View Details
                      </Link>

                      {user && !user.isAdmin && isEnrolled ? (
                        <Link
                          to={`/player/${courseId}`}
                          className="btn btn-primary full-btn"
                        >
                          Start Learning
                        </Link>
                      ) : (
                        <Link
                          to={`/course/${courseId}`}
                          className="btn btn-primary full-btn"
                        >
                          {isEnrolled ? "Already Enrolled" : "Enroll Now"}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No courses found.</p>
          )}
        </div>
      </div>
    </>
  );
}