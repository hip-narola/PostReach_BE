export interface UserAnswersWithQuestionsAndSocialMediaDTO {
    userName: string | null;
    socialMedia: {
      platform: string | null;
      isDisconnect: boolean ;
    } | null;
    userSubscription: {
      id: string | null;
      cycle: number | null ;
      end_Date: Date | null;
      start_Date: Date | null;
    } | null;
    userBusiness: {
      id: number | null;
      brandName: string | null;
      website: string | null;
      use: string | null;
    } | null;
    userAnswers: Array<{
      id: number | null;
      answerText: string | null;
      question: {
        id: number | null;
        question: string | null;
        questionType: string | null;
        questionName: string | null;
      } | null;
    }> | null;
  }
  