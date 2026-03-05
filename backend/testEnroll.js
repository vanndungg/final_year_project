const axios = require('axios');

(async () => {
    try {
        // login with seeded user
        const base = 'http://localhost:5000/api';
        const loginRes = await axios.post(`${base}/login`, {
            email: 'student@gmail.com',
            password: '123456'
        });
        const token = loginRes.data.access_token;
        console.log('token', token);

        // get courses list
        const coursesRes = await axios.get(`${base}/courses`);
        const courseId = coursesRes.data.courses[0]._id;
        console.log('using course', courseId);

        // try enroll
        const enrollRes = await axios.patch(`${base}/users/enroll`, { courseId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('enroll response', enrollRes.data);
    } catch (err) {
        if (err.response) {
            console.error('status', err.response.status);
            console.error('data', err.response.data);
        } else {
            console.error(err.message);
        }
    }
})();
