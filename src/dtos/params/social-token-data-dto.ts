export class SocialTokenDataDTO {
    token_type: string;
    encrypted_access_token: string;
    refresh_token?: string;
    encryption_key_id?: string;
    expires_in: number;
    scope: string;
    platform: string;
    user_id: number;
    connected_at: Date;
    created_at: Date;
    updated_at: Date;
    page_id: string;
    instagram_Profile: string;
    facebook_Profile: string;
    name: string;
    user_name: string;
    user_profile: string;
    file_name: string;
    social_media_user_id: string;
    isDisconnect: boolean;
    
    constructor(data: any) {
        this.user_name = data.user_name || null;
        this.user_profile = data.user_profile || null;
        this.instagram_Profile = data.instagram_Profile || null;
        this.facebook_Profile = data.facebook_Profile || null;
        this.page_id = data.page_id || null;
        this.token_type = data.token_type;
        this.encrypted_access_token = data.access_token;
        this.refresh_token = data.refresh_token || '';
        this.encryption_key_id = data.encryption_key_id || '';
        this.expires_in = data.expires_in;
        this.scope = data.scope;
        this.file_name = data.file_name;
        this.isDisconnect = false;
    }
}