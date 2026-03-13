import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL 
const COURSE_API_URL = `${API_URL}/api/courses`;
const AUTH_API_URL = `${API_URL}/api/auth`;

// -------------------- AUTH --------------------

export const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const loginUser = async (data) => {
  const res = await axios.post(`${AUTH_API_URL}/login`, data);
  return res.data;
};

export const signupUser = async (data) => {
  const res = await axios.post(`${AUTH_API_URL}/register`, data);
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  // enrolled courses / progress ni remove cheyyakudadhu
};

// -------------------- COURSES --------------------

export const getCourses = async () => {
  const res = await fetch(COURSE_API_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }
  return res.json();
};

export const getCourseById = async (id) => {
  if (!id) {
    throw new Error("Course id is required");
  }

  const res = await fetch(`${COURSE_API_URL}/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch course");
  }
  return res.json();
};

export const addCourse = async (course) => {
  const token = getToken();

  const res = await fetch(COURSE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(course),
  });

  if (!res.ok) {
    throw new Error("Failed to add course");
  }
  return res.json();
};

export const updateCourse = async (id, data) => {
  const token = getToken();

  const res = await fetch(`${COURSE_API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update course");
  }
  return res.json();
};

export const deleteCourse = async (id) => {
  const token = getToken();

  const res = await fetch(`${COURSE_API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete course");
  }
  return res.json();
};

// -------------------- USER WISE LOCAL STORAGE HELPERS --------------------

const getUserStorageKey = (type) => {
  const user = getAuthUser();
  if (!user) return null;

  const userId = user.id || user._id || user.email;
  return `${type}_${userId}`;
};

// -------------------- ENROLLMENT (user-wise localStorage) --------------------

export const getEnrolledCourses = () => {
  const key = getUserStorageKey("enrolledCourses");
  if (!key) return [];

  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

export const saveEnrolledCourses = (courseIds) => {
  const key = getUserStorageKey("enrolledCourses");
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(courseIds));
};

export const enrollInCourse = (courseId) => {
  const enrolled = getEnrolledCourses();
  const normalizedCourseId = String(courseId);

  if (!enrolled.includes(normalizedCourseId)) {
    enrolled.push(normalizedCourseId);
    saveEnrolledCourses(enrolled);
  }
};

export const isCourseEnrolled = (courseId) => {
  const enrolled = getEnrolledCourses();
  return enrolled.includes(String(courseId));
};

// -------------------- PROGRESS (user-wise localStorage) --------------------

export const getCourseProgressMap = () => {
  const key = getUserStorageKey("courseProgress");
  if (!key) return {};

  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
};

export const saveCourseProgressMap = (progressMap) => {
  const key = getUserStorageKey("courseProgress");
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(progressMap));
};

export const getCourseProgress = (courseId) => {
  const progressMap = getCourseProgressMap();

  return (
    progressMap[String(courseId)] || {
      completedTopicIds: [],
      percent: 0,
      currentTopicId: "",
    }
  );
};

export const updateCourseProgress = (courseId, progressData) => {
  const progressMap = getCourseProgressMap();
  progressMap[String(courseId)] = progressData;
  saveCourseProgressMap(progressMap);
};