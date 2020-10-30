import axios from 'axios';
console.log('inside axios')
//AXIOS INSTANCES
const auth_axios = axios.create({});

const refreshAccessToken = async () => {
  const refToken = localStorage.getItem('refresh-token');
  const headers = { Authorization: `Basic ${refToken}` };
  await axios.post('/users/refresh', null, { headers })
    .then(res => {
      localStorage.setItem('access-token', res.data.accessToken);
      auth_axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.accessToken;
    }).catch(err => {
      console.log(err.response.data)
    })
}

const setGlobalConfig = (instance) => {
  instance.interceptors.request.use(req => {
    const accToken = localStorage.getItem('access-token');
    accToken && (req.headers.Authorization = `Bearer ${accToken}`);
    return req;
  }, err => {
    return Promise.reject(err);
  });

  instance.interceptors.response.use(res => {
    return res;
  },
    async err => {
      const originalRequest = err.config;
      if (err.response.data.message.includes('TokenExpiredError') && !originalRequest._retry) {
        originalRequest._retry = true;
        await refreshAccessToken();
        return auth_axios(originalRequest);
      }
      return Promise.reject(err);
    }
  );
}

setGlobalConfig(auth_axios);

export { auth_axios };