# UrlShortner

UrlShortner using Amazon Web Services, Serverless Application Model. For this service we use [CloudFormation](https://aws.amazon.com/cloudformation/) to build a stack composed by [API Gateway](https://aws.amazon.com/api-gateway/), [Lambda](https://aws.amazon.com/lambda/) and [DynamoDB](https://aws.amazon.com/dynamodb/) powered by [DAX](https://aws.amazon.com/dynamodb/dax/).

## Architecture

![architecture](https://d2908q01vomqb2.cloudfront.net/887309d048beef83ad3eabf2a79a64a389ab1c9f/2018/04/19/Arch-Diagram.jpg)


## Development

For local development, follow the steps below:

1. First, we need to setup a local *DynamoDB*. For this, run the command **from the root project**. This will run docker with the configurations in the `docker-compose.yml` file
    ```bash
    docker-compose up -d
    ```
2. Install node dependencies
    ```bash
    npm install
    ```
3. Now, we are ready to go. To run lambda, you just need to run the command provided below and change json payload on `lambda/test.js` file, which represents the payload lambda will receive from *API Gateway*
    ```bash
    npm run local
    ```

## Deployment

1. Make a zip file with necessary folders
    ```bash
    zip -qur urlshortner node_modules lambda
    ```
2. Create a S3 bucket in case you don't have one
    ```bash
    aws s3 mb s3://<bucket-name>
    ```
3. Create an AWS CloudFormation package of the code in that bucket
    ```bash
    aws cloudformation package --template-file template.yaml --output-template-file packaged-template.yaml --s3-bucket <bucket-name>
    ```
4. Finally, deploy the AWS CloudFormation stack which will create all the resources defined in the YAML file
    ```bash
    aws cloudformation deploy --template-file packaged-template.yaml --stack-name urlshortner
    ```
