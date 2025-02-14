export const NotificationType = {
    POST_SCHEDULED: 'Post Scheduled',
    POST_PUBLISHED: 'Post Published',
    POST_FAILED: 'Post Failed',
    TRIAL_SUBSCRIPTION_STARTED: 'Trial Subscription Started',
    SUBSCRIPTION_STARTED: 'Subscription Started',
    TRIAL_SUBSCRIPTION_FAILED: 'Trial Subscription Failed',
    SOCIAL_CREDIT_ADDED: 'social credit added',
    SUBSCRIPTION_CANCELLED: 'Subscription cancelled',
    SIGNUP_DONE: 'Sign up compeleted'
};

export const NotificationMessage = {
    [NotificationType.POST_SCHEDULED]: 'Your post has been scheduled successfully!',
    [NotificationType.POST_PUBLISHED]: 'Your post has been published successfully!',
    [NotificationType.POST_FAILED]: 'Your post has been failed!',
    [NotificationType.TRIAL_SUBSCRIPTION_STARTED]: 'Your Trial has been started!',
    [NotificationType.SUBSCRIPTION_STARTED]: 'Your payment has been successfully processed, and your subscription is now active.',
    [NotificationType.TRIAL_SUBSCRIPTION_FAILED]: 'Your payment has been unsuccessful!',
    [NotificationType.SOCIAL_CREDIT_ADDED]: 'Your credit has been added for',
    [NotificationType.SUBSCRIPTION_CANCELLED]: 'Your subscription hs been cancelled by system administator!',
    [NotificationType.SIGNUP_DONE]: 'Thank you for signing up! Your registration is complete, and your account is now active.',
};