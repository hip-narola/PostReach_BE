import { ApiProperty } from '@nestjs/swagger';
export class TwitterUserDataDto {
    @ApiProperty({
        description: 'Twitter user id',
    })
    id: string;

    @ApiProperty({
        description: 'Twitter user name',
    })
    name: string;

    @ApiProperty({
        description: 'Twitter user username',
    })
    username: string;

    @ApiProperty({
        description: 'Twitter user profileImageUrl',
    })
    profileImageUrl: string;

    @ApiProperty({
        description: 'Twitter publicMetrix',
    })
    publicMetrics: object;
}
