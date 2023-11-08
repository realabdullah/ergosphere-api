export const welcomeTemplate = (name) => {
    return `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    color: #333;
                    background-color: #e5e5e5;
                }
                h1 {
                    font-size: 24px;
                    color: #333;
                }
                p {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to Ergosphere!</h1>
            <p>Dear ${name},</p>
            <p>We are thrilled to have you onboard and excited to help you manage your tasks efficiently. 
                Ergosphere is a task management software that helps you keep track of your to-do lists, deadlines,
                and progress. 
                With our user-friendly interface, you can easily create, assign, and prioritize tasks, 
                and collaborate with your team members.
            </p>
            <p>If you have any questions or need assistance, 
                please don't hesitate to reach out to our support team at support@ergosphere.com. 
                We are always here to help you.
            </p>
            <p>Thank you for choosing Ergosphere!</p>
            <p>Best regards,</p>
            <p>The Ergosphere Team</p>
        </body>
      </html>
    `;
};
