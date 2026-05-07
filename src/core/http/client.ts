import axios from 'axios';

export const httpClient = axios.create({
    timeout: 30_000,
    validateStatus: () => true,
});
