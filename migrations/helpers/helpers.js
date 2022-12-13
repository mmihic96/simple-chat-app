// Generate array of objects, each object should contain firstName, lastName, profileImageUrl and status
// status should be set to offline
// profileImageUrl should be set to empty string
// firstName and lastName should be random strings
//

const { faker } = require('@faker-js/faker');
const fs = require('fs');

const users = Array.from({ length: 30 }, () => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  profileImageUrl: faker.image.animals(),
  status: 'OFFLINE',
}));

// fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));

// Conversation 

const messages = Array.from({ length: 100 }, () => ({
  text: faker.lorem.sentence((Math.random() * 10) + 1),
  timestamp: Date.now().valueOf(),
}));

// fs.writeFileSync('./messages.json', JSON.stringify(messages, null, 2));