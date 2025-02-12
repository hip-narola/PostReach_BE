import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    sesClient: SESClient;

    constructor(private configService: ConfigService) {
        const region = this.configService.get<string>('REGION')
        this.sesClient = new SESClient({
            region,
        });
    }

    async sendEmail(to: string, subject: string, html: string) {
        try {
            const sendEmailCommand = new SendEmailCommand({
                Destination: {
                    ToAddresses: [to],
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: 'UTF-8',
                            Data: html,
                        },
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: subject,
                    },
                },
                Source: 'hip.narola@gmail.com', // Your verified email address in SES
            });

            // const response = await this.sesClient.send(sendEmailCommand);
            // return response;

            return null;
        } catch (error) {
            throw error;
        }
    }

    async loadTemplateWithData(
        templateName: string,
        data?: Record<string, any>,
    ): Promise<string> {
        const filePath = join(
            process.cwd(),
            'src',
            'shared',
            'email-templates',
            `${templateName}.html`,
        );

        try {
            let template = await fs.readFile(filePath, 'utf-8');

            // Replace placeholders with data from the DTO
            template = template.replace(/{{(\w+)}}/g, (_, key) => {
                return data[key] ?? ''; // Replace with value or empty string if not present
            });

            return template;
        } catch (error) {
            throw new Error(`Failed to load email template: ${templateName}`);
        }
    }
}
