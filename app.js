require('dotenv').config()

const tmi = require('tmi.js');
const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: 'trivia__bot',
    password: process.env.OAUTH_TOKEN
  },
  channels: ['hiikyu']
});
client.connect()
  .then(() => {
    questionLoop('hiikyu');
  }).catch(console.error);

const questions = [
  {
    question: 'What is the capital of Japan?',
    answers: [
      'Tokyo'
    ],
  },
  {
    question: 'What is the capital of the United States?',
    answers: [
      'Washington D.C.',
    ],
  },
  {
    question: 'What is the capital of France?',
    answers: [
      'Paris'
    ],
  },
  {
    question: 'How many eggs are there in a dozen?',
    answers: [
      '12',
    ],
  },
  {
    question: 'What\s the name of Mario\'s brother?',
    answers: [
      'Luigi',
    ],
  },
  {
    question: 'What is the name of the main character in the game Mario?',
    answers: [
      'Mario',
    ],
  },
  {
    question: 'How many Items are in a stack of Minecraft Blocks?',
    answers: [
      '64',
    ],
  },
  {
    question: 'What is the name of the main character in the game Minecraft?',
    answers: [
      'Steve',
    ],
  },
  {
    question: 'Name an element that starts with the letter \'S\'.',
    answers: [
      'Sulfur',
      'Sodium',
      'Selenium'
    ],
  },
  {
    question: 'What\'s the 13th letter of the alphabet?',
    answers: [
      'M',
    ],
  },
  {
    question: 'What\'s the 8th Pokemon?',
    answers: [
      'Wartortle',
    ],
  },
];

const channels = {
  hiikyu: {
    state: 'idle',
    currentQuestion: null,
    answeredUsers: []
  }
}

const users = {
}

function questionLoop(channelName) {
  const channel = channels[channelName];

  if (channel.state === 'idle') {
    channel.state = 'question';
    channel.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    client.say(channelName, `${channel.currentQuestion.question}`);
  }

  setTimeout(() => {
    if (channel.state === 'question' && channel.answeredUsers.length === 0) {
      channel.state = 'sleep';
      channel.currentQuestion = null;
      client.say(channelName, 'Too bad, no one could answer the question');
      return questionLoop(channelName);
    }
    if (channel.state === 'sleep') {
      channel.state = 'idle';
      return questionLoop(channelName);
    }
    if (channel.state === 'answered') {
      channel.state = 'sleep';
      channel.answeredUsers = [];
      return questionLoop(channelName);
    }
  }, 10000);
}

client.on('message', (c, tags, message, self) => {
  if (self) return;

  const channelName = c.replace('#', '');
  const channel = channels[channelName];

  if (channel.state === 'question') {
    const answers = channel.currentQuestion.answers.map(answer => answer.toLowerCase().trim());

    if (answers.includes(message.toLowerCase().trim())) {

      if (!users[tags.username]) {
        users[tags.username] = {
          points: 0
        }
      }
      users[tags.username].points += 1;

      channel.answeredUsers.push(tags.username);
      channel.state = 'answered';
      client.say(channelName, `(${users[tags.username].points}) ${tags.username} got the answer! It was "${channel.currentQuestion.answers[0]}".`);

      return;
    }
  }
});