# Tic Tac Toe Lambda

This is a simple Tic Tac Toe game implemented as an AWS Lambda function.

## Deployment

1. Install the AWS SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html

2. Build the application:
   ```
   sam build
   ```

3. Deploy the application:
   ```
   sam deploy --guided
   ```

4. Follow the prompts to deploy your application.

## Usage

After deployment, you'll receive an API Gateway endpoint. You can make POST requests to this endpoint with a JSON body containing the 'move' key:
