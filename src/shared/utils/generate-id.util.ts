import { randomBytes } from 'crypto';
import * as moment from 'moment';


export const generateId = (idType: IdType): string => {
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const randomId = randomBytes(4).toString('hex');
  return `${idType}-${timestamp}-${randomId}`;
};


export enum IdType {
  API_COUNTER = 'api_counter',
  SHARE_DOCUMENT = 'share_document',
  PERMISSION_ACCESS = 'permission_access',
  CONTENT = 'content',
  CONTENT_SUMMARY = 'content_summary',
  CONTENT_SUMMARY_BY_TOPIC = 'content_summary_by_topic',
  USER_SUMMARY_TASK = 'user_summary_task',
  DOCUMENT = 'document',
  HIGHLIGHT_NOTE = 'highlightNote',
  HIGHLIGHT_LIKE = 'highlight_like',
  HIGHLIGHT_LIKE_COUNT = 'highlight_like_count',
  DOCUMENT_LIKE = 'document_like',
  DOCUMENT_TAG = 'document_tag',
  DOCUMENT_LIKE_COUNT = 'document_like_count',
  IDEMPOTENT_CONTROL = 'idempotent_control',
  SUBSCRIPTION = 'sub',
  USER_SUBSCRIPTION = 'user_sub',
  USER_SUBSCRIPTION_CREDIT = 'user_credit',
  USER_USAGE = 'user_usage',
  USER_FREE_SUB_HISTORY = 'user_free_sub_history',
  CUSTOMER = 'customer',
  MARKETING_CONSENT = 'marketingConsent',
  FORBIDDEN_CONTENT = 'forbiddenContent',
  SHARE_DOCUMENT_LIST = 'share_document_list',
  POST_RETRY = 'post_retry',
}
