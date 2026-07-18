import api from './client';

export const getSettlements = async () => {
    const response = await client.get('/settlements/me');
    return response.data.data;
};
