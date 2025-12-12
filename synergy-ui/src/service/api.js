import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.REACT_APP_SERVER_URL}`,
    headers: {
        "content-Type": "application/json",
        "Accept": "application/json",
    },
    withCredentials: true,
});

api.interceptors.request.use(
    async (config) => {

        const JWTtoken = localStorage.getItem("JWT_TOKEN");

        if (JWTtoken) {
            config.headers.Authorization = `Bearer ${JWTtoken}`;
        }

        let csrfToken = localStorage.getItem("CSRF_TOKEN");

        if (csrfToken) {
            config.headers["X-XSRF-TOKEN"] = csrfToken;
        } else {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_SERVER_URL}/auth/csrf`,
                    { withCredentials: true }
                );
                csrfToken = response.data.token;
                localStorage.setItem("CSRF_TOKEN",csrfToken);
                config.headers["X-XSRF-TOKEN"] = csrfToken;
            }catch(error){
                console.log("error fetching the CSRF token",error);
            }
        }        

        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);

export default api;