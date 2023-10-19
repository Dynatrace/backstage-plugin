import { User } from '../src/types';

export const exampleUsers: User[] = [
  {
    gender: 'female',
    name: {
      title: 'Miss',
      first: 'Carolyn',
      last: 'Moore',
    },
    email: 'carolyn.moore@example.com',
    picture: 'https://api.dicebear.com/6.x/open-peeps/svg?seed=Carolyn',
    nat: 'GB',
  },
  {
    gender: 'female',
    name: {
      title: 'Ms',
      first: 'Esma',
      last: 'Berberoğlu',
    },
    email: 'esma.berberoglu@example.com',
    picture: 'https://api.dicebear.com/6.x/open-peeps/svg?seed=Esma',
    nat: 'TR',
  },
];
