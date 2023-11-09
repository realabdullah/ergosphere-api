export const workspaceInviteTemplate = (workspaceName, link, inviter) => {
    return `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    line-height: 1.6;
                    color: #333;
                }
                p {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <p>Hi there!</p>
            <p>
                You have been invited to join ${workspaceName} on Ergosphere by ${inviter}. 
            </p>
            <p>
                Ergosphere is a task management software that helps you keep track of your to-do lists, 
                deadlines, and progress. With our user-friendly interface, you can easily create, assign, 
                and prioritize tasks, and collaborate with your team members.
            </p>
            <p>
                To join the workspace, please click on this <a href="${link}">link</a>. 
                Enter your email address and create a password. And you're automatically added to the workspace!.
            </p>
            <p>
                Once you have joined the workspace, you can start creating projects, adding tasks, 
                and collaborating with your team members.
            </p>
            <p>
                If you have any questions or need assistance, please don't hesitate to reach out to 
                our support team at support@ergosphere.com. We are always here to help you.
            </p>
            <p>
                Best regards,<br />
                The Ergosphere Team
            </p>
        </body>
        </html>
    `;
};
