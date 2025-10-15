const BASE_URL = process.env.REACT_APP_API_URL;

export const login = (email, password) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(res => res.json());

export const getBlogs = (token) =>
  fetch(`${BASE_URL}/blogs`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json());

export const createBlog = (token, blog) =>
  fetch(`${BASE_URL}/blogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(blog)
  }).then(res => res.json());
