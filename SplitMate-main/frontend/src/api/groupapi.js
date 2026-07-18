import api from './client';

export const getGroups = async () => {
    const response = await api.get('/groups');
    return response.data.data;
};
