# Topcoder Leaderboard Ranking Processor

## Dependencies

- nodejs https://nodejs.org/en/ (v10)
- Kafka (v2)
- Mongodb (v4)

## Configuration

Configuration for the application is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- LOG_LEVEL: the log level
- PORT: the server port
- KAFKA_URL: comma separated Kafka hosts
- KAFKA_CLIENT_CERT: Kafka connection certificate, optional;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to certificate file or certificate content
- KAFKA_CLIENT_CERT_KEY: Kafka connection private key, optional;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to private key file or private key content
- CREATE_DATA_TOPIC: Kafka topic related to creation
- UPDATE_DATA_TOPIC: Kafka topic related to update
- DELETE_DATA_TOPIC: Kafka topic related to deletion
- GROUP_IDS: List of Group IDs which should be used for filtering
- SUBMISSION_API_URL: Submission API URL
- CHALLENGE_API_URL: Challenge API URL
- MEMBER_API_URL: Member API URL
- All variables starting with prefix `AUTH0` corresponds to Auth0 related credentials
- MONGODB_URL: Mongo DB URL

## Local Kafka setup

- `http://kafka.apache.org/quickstart` contains details to setup and manage Kafka server,
  below provides details to setup Kafka server in Mac, Windows will use bat commands in bin/windows instead
- download kafka at `https://www.apache.org/dyn/closer.cgi?path=/kafka/1.1.0/kafka_2.11-1.1.0.tgz`
- extract out the downloaded tgz file
- go to the extracted directory kafka_2.11-0.11.0.1
- start ZooKeeper server:
  `bin/zookeeper-server-start.sh config/zookeeper.properties`
- use another terminal, go to same directory, start the Kafka server:
  `bin/kafka-server-start.sh config/server.properties`
- note that the zookeeper server is at localhost:2181, and Kafka server is at localhost:9092
- use another terminal, go to same directory, create some topics:

```bash
  bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic submission.notification.create
  bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic submission.notification.update
  bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic notifications.autopilot.events
```

- verify that the topics are created:
  `bin/kafka-topics.sh --list --zookeeper localhost:2181`,
  it should list out the created topics
- run the producer and then write some message into the console to send to the topic `submission.notification.create`:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.create`
- In the console, write some message, one message per line:

```bash
  { "topic":"submission.notification.create", "originator":"submission-api", "timestamp":"2018-08-06T15:46:05.575Z", "mime-type":"application/json", "payload":{ "resource":"review", "id": "d34d4180-65aa-42ec-a945-5fd21dec0502", "score": 92.0, "typeId": "c56a4180-65aa-42ec-a945-5fd21dec0501", "reviewerId": "c23a4180-65aa-42ec-a945-5fd21dec0503", "scoreCardId": "b25a4180-65aa-42ec-a945-5fd21dec0503", "submissionId": "fad49103-37ac-4a04-8294-c840483178a5", "created": "2018-05-20T07:00:30.123Z", "updated": "2018-06-01T07:36:28.178Z", "createdBy": "admin", "updatedBy": "admin" } }
```

- optionally, use another terminal, go to same directory, start a consumer to view the messages:

```bash
  bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic submission.notification.create --from-beginning
```

- writing/reading messages to/from other topics are similar

## Local deployment

- From the project root directory, run the following command to install the dependencies

```bash
npm i
```

- To run linters if required

```bash
npm run lint

npm run lint:fix # To fix possible lint errors
```

- Start the processor

```bash
npm start
```

## Heroku Deployment

- git init
- git add .
- git commit -m init
- heroku create
- heroku config:set KAFKA_URL=... AUTH0_URL=... 
- git push heroku master

## Verification

1. Ensure that Kafka is up and running and the topics `submission.notification.create, submission.notification.update and notifications.autopilot.events` are created in Kafka

2. Ensure that MONGODB_URL configured is correct and ensure that Submission API URL is pointing to `https://api.topcoder-dev.com/v5/submissions` (To verify based on the data present in Dev)

3. Attach to the topic `submission.notification.create` using Kafka console producer

```bash
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.create
```

4. Write the following message to the Console

```bash
{ "topic":"submission.notification.create", "originator":"submission-api", "timestamp":"2018-08-06T15:46:05.575Z", "mime-type":"application/json", "payload":{ "resource":"reviewSummation", "id": "d24d4180-65aa-42ec-a945-5fd21dec0507", "aggregateScore": 87.5, "isPassing": true, "scoreCardId": "b25a4180-65aa-42ec-a945-5fd21dec0503", "submissionId": "fad49103-37ac-4a04-8294-c840483178a5", "created": "2018-05-20T07:00:30.123Z", "updated": "2018-06-01T07:36:28.178Z", "createdBy": "admin", "updatedBy": "admin" } }
```

5. You could see in the console that message will be processed

6. Data in the Database could be verified directly or by using the `/leaderboard` end point

7. Open Postman and import the environment, collection in `docs` directory

8. Trigger the `leaderboard` end point to the verify the data present in Mongo DB

9. Attach to the topic `submission.notifcation.update` using Kafka console producer and write the below message

```bash
{ "topic":"submission.notification.update", "originator":"submission-api", "timestamp":"2018-08-06T15:46:05.575Z", "mime-type":"application/json", "payload":{ "resource":"reviewSummation", "id": "d24d4180-65aa-42ec-a945-5fd21dec0507", "aggregateScore": 85.83 } }
```

10. Validate the data using Postman

11. Attach to the topic `submission.notifcation.delete` using Kafka console producer and write the below message

```bash
{ "topic":"submission.notification.delete", "originator":"submission-api", "timestamp":"2018-08-06T15:46:05.575Z", "mime-type":"application/json", "payload":{ "resource":"reviewSummation", "id": "d24d4180-65aa-42ec-a945-5fd21dec0507" } }
```

12. Validate the data using Postman

## Running unit tests and coverage

To run tests, following Environment variables need to be set up

- TEST_MONGODB_URL MongoDB URL pointing to Test DB instance

To run unit tests alone

```bash
npm run test
```

To run unit tests with coverage report

```bash
npm run cov
```
