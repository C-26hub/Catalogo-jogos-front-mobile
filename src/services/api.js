import axios from "axios";

const api = axios.create({
  baseURL: "https://catalogo-jogos.onrender.com"
});

export default api;