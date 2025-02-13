const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'User 11111',
    email: 'user1@nextmail.com',
    password: '123456',
    image_url: '/users/delba-de-oliveira.png',
  },
  {
    id: 'c8640814-19d5-48e8-b1b8-0a8e6851beb9',
    name: 'User 22222',
    email: 'user2@nextmail.com',
    password: '123456',
    image_url: '/users/lee-robinson.png',
  },
];

const events = [
  {
    id: '47ea6615-10ca-42f0-9581-bdac1c5ccc67',
    status: 'in progress',
    date_start: '2022-12-06',
    date_end: '2022-12-06',
    location: 'Singapore',
    name: 'event 1',
    description: 'description',
    image_url: '',
    user_ids: [users[0].id],
  },
  {
    id: 'af864b13-5c10-4eec-9a47-70a2d3743cfd',
    status: 'in progress',
    date_start: '2022-11-14',
    date_end: '2022-12-14',
    location: 'Singapore',
    name: 'event 2',
    description: 'description',
    image_url: '',
    user_ids: [],
  },
  {
    id: 'a528416b-44b9-453e-94ed-49534bc2fdb8',
    status: 'completed',
    date_start: '2022-10-29',
    date_end: '2022-12-29',
    location: 'Singapore',
    name: 'event 3',
    description: 'description',
    image_url: '',
    user_ids: [],
  },
  {
    id: '58bd7a83-3d7e-45c5-ad8f-878134e525a5',
    status: 'completed',
    date_start: '2023-09-10',
    date_end: '2023-12-10',
    location: 'Singapore',
    name: 'event 4',
    description: 'description',
    image_url: '',
    user_ids: [],
  },
  {
    id: '8861b868-a827-4781-b073-c757ce386f09',
    status: 'cancelled',
    date_start: '2023-08-05',
    date_end: '2023-12-05',
    location: 'Singapore',
    name: 'event 5',
    description: 'description',
    image_url: '',
    user_ids: [],
  },
];

module.exports = {
  users,
  events,
};
