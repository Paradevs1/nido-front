import { WaitlistResponse, WaitlistSubmission } from '@/types';
import { apiClient, API_ENDPOINTS } from './config';



export const waitlistAPI = {
  async submit(data: WaitlistSubmission): Promise<WaitlistResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WAITLIST.SUBMIT, data);
      return response;
    } catch (error) {
      console.error('Waitlist submission error:', error);
      throw error;
    }
  }
};

export type { WaitlistSubmission };
