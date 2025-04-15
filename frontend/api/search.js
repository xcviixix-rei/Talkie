export const fetchQuery = async (query) => {
    try {
        if (!query || query.trim() === '') {
            return [];
        }

        const response = await fetch(`http://10.0.2.2:5000/api/users/matches/${encodeURIComponent(query)}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Search failed with status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Fetch user matches failed:", error);
        return [];
    }
};