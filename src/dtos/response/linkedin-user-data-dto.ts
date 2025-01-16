import { ApiProperty } from '@nestjs/swagger';

export class LinkedInUserDataDto {
    @ApiProperty({
        description: 'Linkedin user id',
    })
    id: string;

    @ApiProperty({
        description: 'Linkedin user firstName',
    })
    firstName: string;

    @ApiProperty({
        description: 'Linkedin user lastName',
    })
    lastName: string;

    @ApiProperty({
        description: 'Linkedin user profilePicture',
    })
    profilePicture: string;
}
