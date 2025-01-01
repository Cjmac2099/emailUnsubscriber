// Google Gmail API
// axios for API calls
import axios from 'axios';

// GET request - gmail account
async function GetUserAccount(userId: string) {
    try {
        const response = await axios({
            method: 'get',
            url: `https://gmail.googleapis.com/gmail/v1/users/${userId}/profile`,
        });
        return response.data;  // Return the response data
        // "emailAddress": string,
        // "messagesTotal": integer,
        // "threadsTotal": integer,
        // "historyId": string
        
    } catch (error) {
        console.error('Error fetching user account:', error);
        throw error;  
    }
}
