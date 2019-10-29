# Topcoder Leaderboard Ranking Processor

## Dependencies

- nodejs https://nodejs.org/en/ (v10)
- Kafka (v2)

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
- KAFKA_GROUP_ID: Kafka group id
- CREATE_DATA_TOPIC: Kafka topic related to creation
- UPDATE_DATA_TOPIC: Kafka topic related to update
- DELETE_DATA_TOPIC: Kafka topic related to deletion
- LEADERBOARD_API_URL: Leaderboard API URL
- SUBMISSION_API_URL: Submission API URL
- AUTH0_URL: Auth0 URL, used to get TC M2M token
- AUTH0_AUDIENCE: Auth0 audience, used to get TC M2M token
- TOKEN_CACHE_TIME: Auth0 token cache time, used to get TC M2M token
- AUTH0_CLIENT_ID: Auth0 client id, used to get TC M2M token
- AUTH0_CLIENT_SECRET: Auth0 client secret, used to get TC M2M token
- AUTH0_PROXY_SERVER_URL: Proxy Auth0 URL, used to get TC M2M token

Also note that there is a `/health` endpoint that checks for the health of the app. This sets up an expressjs server and listens on the environment variable `PORT`. It's not part of the configuration file and needs to be passed as an environment variable

Configuration for the tests is at `config/test.js`, only add such new configurations different from `config/default.js`
- WAIT_TIME: wait time used in test, default is 1000 or one second
- LEADERBOARD_API_URL: Leaderboard API URL used in testing
- SUBMISSION_API_URL: Submission API URL used in testing

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
  bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic submission.notification.delete
```

- verify that the topics are created:
  `bin/kafka-topics.sh --list --zookeeper localhost:2181`,
  it should list out the created topics
- run the producer and then write some message into the console to send to the topic `submission.notification.create`:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.create`
- In the console, write some message, one message per line:

```bash
  { "topic":"submission.notification.create", "originator":"submission-api", "timestamp":"2018-08-06T15:46:05.575Z", "mime-type":"application/json", "payload":{ "resource":"reviewSummation", "id": "d24d4180-65aa-42ec-a945-5fd21dec0508", "submissionId": "a34e1158-2c27-4d38-b079-5e5cca1bdcf7", "aggregateScore": 88, "scoreCardId": "b25a4180-65aa-42ec-a945-5fd21dec0503", "isPassing": true, "created": "2018-05-20T07:00:30.123Z", "updated": "2018-06-01T07:36:28.178Z", "createdBy": "admin", "updatedBy": "admin" } }
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

1. Ensure that Kafka is up and running and the topics `submission.notification.create, submission.notification.update and submission.notification.delete` are created in Kafka

2. Refer `README.md` in `leaderboard-api` to start leaderboard api, all operations are under `leaderboard-api` project root folder

- Start mock app and it will listen on 3001 PORT.

```bash
npm run mock-api
```

- Ensure you have start MongoDB and properly configure `MONGODB_URL`. Run the following commands to clear and insert test data, step up environment variables and start the app(it will listen on 3002 PORT!).

```bash
npm run init-db
npm run test-data
export CHALLENGE_API_URL=http://localhost:3001/challenges
export MEMBER_API_URL=http://localhost:3001/users
export PORT=3002
npm start
```

3. Run the following command to start processor app(Under this project's root folder)
```bash
export AUTH0_URL=https://topcoder-dev.auth0.com/oauth/token
export AUTH0_AUDIENCE=https://m2m.topcoder-dev.com/
export TOKEN_CACHE_TIME=90
export AUTH0_CLIENT_ID=8QovDh27SrDu1XSs68m21A1NBP8isvOt
export AUTH0_CLIENT_SECRET=3QVxxu20QnagdH-McWhVz0WfsQzA1F8taDdGDI4XphgpEYZPcMTF4lX3aeOIeCzh
export LEADERBOARD_API_URL=http://localhost:3002/v5/leaderboard
export SUBMISSION_API_URL=http://localhost:3001/submissions
npm start
```

3. Attach to the topic `submission.notification.create` using Kafka console producer

```bash
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.create
```

4. Write the following message to the Console

```bash
{ "topic":"submission.notification.create", "originator":"submission-api", "timestamp":"2018-08-06T15:46:05.575Z", "mime-type":"application/json", "payload":{ "resource":"reviewSummation", "id": "d24d4180-65aa-42ec-a945-5fd21dec0508", "submissionId": "a34e1158-2c27-4d38-b079-5e5cca1bdcf7", "aggregateScore": 90, "scoreCardId": "b25a4180-65aa-42ec-a945-5fd21dec0503", "isPassing": true, "metadata": { "assertions": { "pending": 0, "failed": 1, "total": 10}, "tests": { "total": 10 } }, "created": "2018-05-20T07:00:30.123Z", "updated": "2018-06-01T07:36:28.178Z", "createdBy": "admin", "updatedBy": "admin" } }
```

5. You could see in the console that message will be processed, and find the following message: `Record with Challenge ID # 30051825 and Member ID # 8547899 does not exists in database. Creating the record`. Also check the leaderboard-api console for more information(Console in step 2)

6. Attach to the topic `submission.notification.update` using Kafka console producer

```bash
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.update
```

7. Write the following message to the Console

```bash
{ "topic":"submission.notification.update", "originator":"submission-api", "timestamp":"2018-08-06T15:46:05.575Z", "mime-type":"application/json", "payload":{ "resource":"reviewSummation", "id": "d24d4180-65aa-42ec-a945-5fd21dec0508", "submissionId": "a34e1158-2c27-4d38-b079-5e5cca1bdcf7", "aggregateScore": 80, "scoreCardId": "b25a4180-65aa-42ec-a945-5fd21dec0503", "isPassing": true, "metadata": { "assertions": { "pending": 0, "failed": 1, "total": 5}, "tests": { "total": 5 } }, "created": "2018-05-20T07:00:30.123Z", "updated": "2018-06-01T07:36:28.178Z", "createdBy": "admin", "updatedBy": "admin" } }
```

8. You could see in the console that message will be processed, and find the following message: `Record with Challenge ID # 30051825 and Member ID # 8547899 exists in database. Updating the score`. Also check the leaderboard-api console for more information(Console in step 2)

9. Attach to the topic `submission.notification.delete` using Kafka console producer

```bash
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.delete
```

10. Write the following message to the Console. Also check the leaderboard-api console for more information(Console in step 2)

```bash
{ "topic":"submission.notification.delete", "originator":"submission-api", "timestamp":"2018-08-06T15:46:05.575Z", "mime-type":"application/json", "payload":{ "resource":"reviewSummation", "id": "d24d4180-65aa-42ec-a945-5fd21dec0508" } }
```

11. You could see in the console that message will be processed

### Tests
Note: you need to stop the processor app before execute test.

- Run the following command to execute unit test and generate coverage report

```bash
npm run test
```

- Run the following command to execute e2e test and generate coverage report

```bash
npm run e2e
```
