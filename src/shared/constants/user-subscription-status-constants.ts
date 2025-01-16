export const UserSubscriptionStatusType = {
  TRIAL: 1,
  ACTIVE: 2,
  FAILED: 3,
  CANCELLED: 4,
  UPGRADED: 5,
  EXPIRED: 6,
  INACTIVE: 7,
};

export const UserSubscriptionStatusTypeNames = {
  [UserSubscriptionStatusType.TRIAL]: 'trial',
  [UserSubscriptionStatusType.ACTIVE]: 'active',
  [UserSubscriptionStatusType.FAILED]: 'failed',
  [UserSubscriptionStatusType.CANCELLED]: 'cancelled',
  [UserSubscriptionStatusType.UPGRADED]: 'upgraded',
  [UserSubscriptionStatusType.EXPIRED]: 'expired',
  [UserSubscriptionStatusType.INACTIVE]: 'inactive',
};

export const planType = {
  TRIAL: 'Trial',
  PRO_PACKAGE: 'Pro Package',
  ULTIMATE_PACKAGE: 'Ultimate Package',
  STARTER_PACKAGE: 'Starter Package',
}
