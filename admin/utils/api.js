import axios from "axios";
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`, // e.g. http://localhost:8080/api or https://seahorse-app-...
  withCredentials: true, // MUST
});
export default api;
