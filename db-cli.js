const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const Group = require('./models/Group');

dotenv.config({ path: './config/config.env' });

const users = [
  {
    _id: mongoose.Types.ObjectId('5fabc9b118e72914acae9039'),
    fullname: 'Jack',
    username: 'jack',
    email: 'jack@mail.com',
    password: '123456',
    avatar: 'default-avatar-5.jpg'
  },
  {
    _id: mongoose.Types.ObjectId('5fabc9b118e72914acae9040'),
    fullname: 'Test',
    username: 'test',
    email: 'test@mail.com',
    password: '123456',
    avatar: 'default-avatar-3.jpg'
  }
];

const groups = [
  {
    name: 'Gaming',
    color: '#6a6af3',
    user: mongoose.Types.ObjectId('5fabc9b118e72914acae9039')
  }
];

const init = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });

  console.log(`MongoDB Connected ${conn.connection.host}`.cyan.underline);

  try {
    switch (process.argv[2]) {
      case '--clean':
        await User.deleteMany({});
        await Group.deleteMany({});
        console.log('Cleaned!'.red);
        break;

      case '--seed':
        for await (user of users) {
          await User.create(user);
        }

        for await (group of groups) {
          await Group.create(group);
        }

        console.log('Seeded!'.green);
        break;

      default:
        console.log('Unrecognized Command'.yellow);
        break;
    }
  } catch (err) {
    console.log(err);
  } finally {
    process.exit(0);
  }
};

init();
