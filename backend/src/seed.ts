import { DataSource } from 'typeorm';
import bcrypt from 'bcryptjs';
import {
  User,
  Profile,
  Follow,
  Location,
  Post,
  PostImage,
  PostLike,
  PostView,
  Comment,
  Favorite,
  Story,
  StoryLike,
  StoryView,
  Chat,
  Message,
  SearchHistory,
} from './entities/index.js';

async function seed() {
  console.log('🌱 Starting database seed...');

  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: './data/app.sqlite',
    synchronize: true,
    entities: [
      User,
      Profile,
      Follow,
      Location,
      Post,
      PostImage,
      PostLike,
      PostView,
      Comment,
      Favorite,
      Story,
      StoryLike,
      StoryView,
      Chat,
      Message,
      SearchHistory,
    ],
  });

  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const profileRepo = dataSource.getRepository(Profile);
  const locationRepo = dataSource.getRepository(Location);
  const postRepo = dataSource.getRepository(Post);
  const postImageRepo = dataSource.getRepository(PostImage);
  const postLikeRepo = dataSource.getRepository(PostLike);
  const postViewRepo = dataSource.getRepository(PostView);
  const commentRepo = dataSource.getRepository(Comment);
  const favoriteRepo = dataSource.getRepository(Favorite);
  const followRepo = dataSource.getRepository(Follow);
  const storyRepo = dataSource.getRepository(Story);
  const chatRepo = dataSource.getRepository(Chat);
  const messageRepo = dataSource.getRepository(Message);

  // Clean existing data
  await messageRepo.clear();
  await chatRepo.clear();
  await storyRepo.clear();
  await favoriteRepo.clear();
  await commentRepo.clear();
  await postLikeRepo.clear();
  await postViewRepo.clear();
  await postImageRepo.clear();
  await postRepo.clear();
  await followRepo.clear();
  await locationRepo.clear();
  await profileRepo.clear();
  await userRepo.clear();

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  const userAlex = userRepo.create({
    userName: 'alex_photographer',
    fullName: 'Alex River',
    email: 'alex@example.com',
    password: defaultPassword,
  });
  const savedAlex = await userRepo.save(userAlex);

  await profileRepo.save(
    profileRepo.create({
      userId: savedAlex.id,
      bio: 'Landscape & Travel Photographer 📸',
      avatar: '/uploads/alex.jpg',
      website: 'https://alexphotos.com',
      gender: 0,
    }),
  );

  const userMaria = userRepo.create({
    userName: 'maria_art',
    fullName: 'Maria Ivanova',
    email: 'maria@example.com',
    password: defaultPassword,
  });
  const savedMaria = await userRepo.save(userMaria);

  await profileRepo.save(
    profileRepo.create({
      userId: savedMaria.id,
      bio: 'Digital Artist & UI/UX Designer 🎨',
      avatar: '/uploads/maria.jpg',
      website: 'https://maria.art',
      gender: 1,
    }),
  );

  const userJohn = userRepo.create({
    userName: 'john_traveler',
    fullName: 'John Doe',
    email: 'john@example.com',
    password: defaultPassword,
  });
  const savedJohn = await userRepo.save(userJohn);

  await profileRepo.save(
    profileRepo.create({
      userId: savedJohn.id,
      bio: 'Wandering the world ✈️ Next stop: Tajikistan',
      avatar: '/uploads/john.jpg',
      website: 'https://johntravels.blog',
      gender: 0,
    }),
  );

  // 2. Locations
  const locDushanbe = await locationRepo.save(
    locationRepo.create({
      name: 'Rudaki Park',
      city: 'Dushanbe',
      country: 'Tajikistan',
      zipCode: '734000',
    }),
  );

  const locParis = await locationRepo.save(
    locationRepo.create({
      name: 'Eiffel Tower',
      city: 'Paris',
      country: 'France',
      zipCode: '75007',
    }),
  );

  // 3. Follows
  await followRepo.save([
    followRepo.create({ followerId: savedAlex.id, followingId: savedMaria.id }),
    followRepo.create({ followerId: savedJohn.id, followingId: savedAlex.id }),
    followRepo.create({ followerId: savedJohn.id, followingId: savedMaria.id }),
  ]);

  // 4. Posts
  const post1 = await postRepo.save(
    postRepo.create({
      userId: savedAlex.id,
      locationId: locDushanbe.id,
      title: 'Sunrise in the Fann Mountains',
      content: 'Breathtaking morning view at Iskanderkul Lake! #mountains #tajikistan',
      isReel: false,
    }),
  );
  await postImageRepo.save(
    postImageRepo.create({ postId: post1.id, url: '/uploads/seed_mountains.jpg', order: 0 }),
  );

  const post2 = await postRepo.save(
    postRepo.create({
      userId: savedMaria.id,
      locationId: locParis.id,
      title: 'New digital illustration',
      content: 'Experimenting with warm colors and cyberpunk themes! 🎨✨',
      isReel: false,
    }),
  );
  await postImageRepo.save(
    postImageRepo.create({ postId: post2.id, url: '/uploads/seed_art.jpg', order: 0 }),
  );

  const post3 = await postRepo.save(
    postRepo.create({
      userId: savedAlex.id,
      title: 'Waterfall slow motion',
      content: 'Sound of crystal clear water in Varzob Gorge 🌊',
      isReel: true,
    }),
  );
  await postImageRepo.save(
    postImageRepo.create({ postId: post3.id, url: '/uploads/seed_waterfall.jpg', order: 0 }),
  );

  const post4 = await postRepo.save(
    postRepo.create({
      userId: savedJohn.id,
      locationId: locDushanbe.id,
      title: 'Exploring Dushanbe city center',
      content: 'Visiting the National Library and monument today!',
      isReel: false,
    }),
  );
  await postImageRepo.save(
    postImageRepo.create({ postId: post4.id, url: '/uploads/seed_city.jpg', order: 0 }),
  );

  const post5 = await postRepo.save(
    postRepo.create({
      userId: savedMaria.id,
      title: 'Cozy coffee break',
      content: 'Morning sketch and hot cappuccino ☕',
      isReel: false,
    }),
  );
  await postImageRepo.save(
    postImageRepo.create({ postId: post5.id, url: '/uploads/seed_coffee.jpg', order: 0 }),
  );

  // 5. Likes & Comments & Favorites
  await postLikeRepo.save([
    postLikeRepo.create({ postId: post1.id, userId: savedMaria.id }),
    postLikeRepo.create({ postId: post1.id, userId: savedJohn.id }),
    postLikeRepo.create({ postId: post2.id, userId: savedAlex.id }),
  ]);

  await commentRepo.save([
    commentRepo.create({
      postId: post1.id,
      userId: savedMaria.id,
      content: 'Stunning landscape Alex! 👏',
    }),
    commentRepo.create({
      postId: post2.id,
      userId: savedAlex.id,
      content: 'Love the lighting and palette on this one! 🔥',
    }),
  ]);

  await favoriteRepo.save(
    favoriteRepo.create({ postId: post1.id, userId: savedJohn.id }),
  );

  // 6. Stories (expires in 24 hours)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await storyRepo.save([
    storyRepo.create({
      userId: savedAlex.id,
      imageUrl: '/uploads/seed_story1.jpg',
      expiresAt: tomorrow,
    }),
    storyRepo.create({
      userId: savedMaria.id,
      imageUrl: '/uploads/seed_story2.jpg',
      expiresAt: tomorrow,
    }),
  ]);

  // 7. Chat & Messages
  const chat = await chatRepo.save(
    chatRepo.create({
      user1Id: savedAlex.id,
      user2Id: savedMaria.id,
    }),
  );

  await messageRepo.save([
    messageRepo.create({
      chatId: chat.id,
      senderId: savedAlex.id,
      text: 'Hi Maria! Loved your new artwork!',
      isRead: true,
    }),
    messageRepo.create({
      chatId: chat.id,
      senderId: savedMaria.id,
      text: 'Thanks Alex! How was your trip to the Fann Mountains?',
      isRead: true,
    }),
    messageRepo.create({
      chatId: chat.id,
      senderId: savedAlex.id,
      text: 'Incredible! I will post more photos soon.',
      isRead: false,
    }),
  ]);

  await dataSource.destroy();

  console.log('\n=========================================');
  console.log('✅ DATABASE SEED COMPLETE!');
  console.log('=========================================');
  console.log('Test User Credentials:');
  console.log('1. Username: alex_photographer  | Password: Password123!');
  console.log('2. Username: maria_art          | Password: Password123!');
  console.log('3. Username: john_traveler      | Password: Password123!');
  console.log('=========================================\n');
}

seed().catch((err) => {
  console.error('❌ Error seeding database:', err);
  process.exit(1);
});
