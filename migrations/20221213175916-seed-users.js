const users = require('./helpers/users.json');
const messages = require('./helpers/messages.json');

module.exports = {
  async up(db, client) {
    const { insertedIds } = await db.collection('users').insertMany(users);

    const conversations = [];
    for (const insertedId of Object.values(insertedIds)) {
      const otherIds = Object.values(insertedIds).filter(id => id !== insertedId);
      for (const otherId of otherIds) {
        const participants = [insertedId, otherId];
        const conversation = {
          participants: participants,
          messages: messages.map(
            message => {
              return { ...message, sender: participants[Math.floor(Math.random() * 2)], isSeen: true }
            }
          )
        };
        conversations.push(conversation);
      }
    }
    await db.collection('conversations').insertMany(conversations);
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
