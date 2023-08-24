import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { error } from 'console';
require ('dotenv') . config ()

const ses = new SESClient({});

function CreateSendEmailCommand(toAddress: string, fromAddress:string, message: string){
    return new SendEmailCommand({
        Source: fromAddress,
        Destination: {
            ToAddresses: [toAddress]
        },
        Message: {
            Subject: {
                Charset: 'UTF-8',
                Data: 'Your one-time passord'
            },
            Body: {
                Text: { 
                    Charset: 'UTF-8',
                    Data: message
                }
            }
        }
    })
}

export async function sendEmailToken (email:string, token: string){
    console.log(`Sending email to ${email} with token ${token}`);
    const command = CreateSendEmailCommand(email, "your-email@gmail.com",`Your one time password: ${token}`);

    try{
        return await ses.send(command);
    }catch(e){
        console.log(e);
        return error;
    }
}