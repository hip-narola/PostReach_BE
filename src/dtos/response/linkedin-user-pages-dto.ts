import { ApiProperty } from '@nestjs/swagger';

export class LinkedInUserPagesDto {
    @ApiProperty({ example: '123456789' })
    pageId: string;

    @ApiProperty({ example: 'Your Organization Name' })
    pageName: string;

    @ApiProperty({ example: 'https://media.licdn.com/dms/image/C4D0BAQ.../profile-displayphoto-shrink_800_800/0/1636884624878?e=2147483647&v=beta&t=WB2KAtFJBC0DzFKa0idI4y5rfCMVjc3_N-ZsjsCoBv8' })
    logoUrl: string | null;

    @ApiProperty({ example: true })
    isPage: boolean;  // Boolean indicating if it's an organization or user profile
}
