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

// Curated high quality photos for diverse categories
const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80', // Mountain lake
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1080&auto=format&fit=crop&q=80', // Travel road
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1080&auto=format&fit=crop&q=80', // Starry mountain
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1080&auto=format&fit=crop&q=80', // Photographer in nature
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1080&auto=format&fit=crop&q=80', // Turquoise lake
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&auto=format&fit=crop&q=80', // Foggy forest
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80', // Tropical beach
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1080&auto=format&fit=crop&q=80', // Portrait smile
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&auto=format&fit=crop&q=80', // Editorial portrait
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1080&auto=format&fit=crop&q=80', // Cozy restaurant
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=80', // Coffee shop
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1080&auto=format&fit=crop&q=80', // Laptop workspace
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1080&auto=format&fit=crop&q=80', // Healthy salad
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&auto=format&fit=crop&q=80', // Delicious dinner
  'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=1080&auto=format&fit=crop&q=80', // Pamir style road
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&auto=format&fit=crop&q=80', // Rocky peaks
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1080&auto=format&fit=crop&q=80', // Tree canopy
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80', // Modern architecture
  'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=1080&auto=format&fit=crop&q=80', // Desert sunset
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080&auto=format&fit=crop&q=80', // Musical instruments
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1080&auto=format&fit=crop&q=80', // Cute kitten
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1080&auto=format&fit=crop&q=80', // Girl portrait
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1080&auto=format&fit=crop&q=80', // Man portrait
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1080&auto=format&fit=crop&q=80', // Youth lifestyle
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1080&auto=format&fit=crop&q=80', // Fitness workout
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1080&auto=format&fit=crop&q=80', // Green meadow
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=1080&auto=format&fit=crop&q=80', // Breakfast table
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1080&auto=format&fit=crop&q=80', // Modern office
];

// Curated high quality short video reels with audio
const REEL_VIDEO_URLS = [
  'https://upload.wikimedia.org/wikipedia/commons/1/13/Water_flow_sound.webm', // Mountain river stream with real water sound (4.8MB)
  'https://upload.wikimedia.org/wikipedia/commons/2/29/Graceful_Birds_in_the_Sky-Amazing_Bird_Sound-User_FREE_Videos.webm', // Birds with nature sound (7.4MB)
  'https://upload.wikimedia.org/wikipedia/commons/3/37/Color_Explosion_short_Close-up_--FREE_FOOTAGE--.webm', // Color explosion visual reel (9.7MB)
  'https://upload.wikimedia.org/wikipedia/commons/b/bf/Altai_Nature_Vargan_from_Alone_1931.webm', // Nature with traditional folk music instrument
  'https://upload.wikimedia.org/wikipedia/commons/3/33/The_process_of_cooking_%22Sumanak%22.webm', // Sumanak cooking in Tajikistan with audio
  'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4', // Forest breeze
  'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4', // Sunset mountain peaks
  'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4', // Forest waterfall stream
];

// Curated portrait avatars for users
const AVATAR_URLS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80',
];

interface UserSeedData {
  userName: string;
  fullName: string;
  email: string;
  bio: string;
  website: string;
  gender: number;
  city: string;
}

const SEED_USERS: UserSeedData[] = [
  { userName: 'muhammad_dev', fullName: 'Муҳаммад Раҷабов', email: 'muhammad@example.com', bio: 'Frontend Developer & Creator 🚀 Дӯстдори технология ва рамзсозӣ', website: 'https://github.com/muhammadjn54-droid', gender: 0, city: 'Dushanbe' },
  { userName: 'shakhlo_art', fullName: 'Шаҳло Каримова', email: 'shakhlo@example.com', bio: 'Рассом ва дизайнери графикӣ 🎨 Эҷодкор аз Хуҷанд', website: 'https://shakhlo.art', gender: 1, city: 'Khujand' },
  { userName: 'farrukh_travel', fullName: 'Фаррух Саидов', email: 'farrukh@example.com', bio: 'Сайёҳи кӯҳҳои Помир 🏔️ Бо ман Тоҷикистонро кашф кунед!', website: 'https://pamirtravel.tj', gender: 0, city: 'Khorog' },
  { userName: 'anisa_style', fullName: 'Аниса Мирзоева', email: 'anisa@example.com', bio: 'Fashion, Lifestyle & Coffee ☕ Душанбе', website: 'https://anisastyle.com', gender: 1, city: 'Dushanbe' },
  { userName: 'somon_photo', fullName: 'Сомон Нозимов', email: 'somon@example.com', bio: 'Суратгир ва наворбардори тӯю маъракаҳо 📸 Ҳар лаҳза қадр дорад', website: 'https://somonphoto.tj', gender: 0, city: 'Dushanbe' },
  { userName: 'dilshod_music', fullName: 'Дилшод Раҳимов', email: 'dilshod@example.com', bio: 'Оҳангсоз ва навозандаи асбобҳои миллӣ 🎵', website: 'https://dilshodmusic.tj', gender: 0, city: 'Bokhtar' },
  { userName: 'parvina_tj', fullName: 'Парвина Аҳмадова', email: 'parvina@example.com', bio: 'Блогери саёҳат ва расмҳои кӯҳии Панҷакент 🌸', website: 'https://parvina.tj', gender: 1, city: 'Panjakent' },
  { userName: 'alisher_fit', fullName: 'Алишер Ҳасанов', email: 'alisher@example.com', bio: 'Тренери шахсӣ ва варзиши тарзи ҳаёти солим 💪', website: 'https://alisherfit.tj', gender: 0, city: 'Dushanbe' },
  { userName: 'nigina_design', fullName: 'Нигина Ҷӯраева', email: 'nigina@example.com', bio: 'Интерьер ва ороиши хонаҳо 🏡 Хуҷанди бостонӣ', website: 'https://nigina.design', gender: 1, city: 'Khujand' },
  { userName: 'rustam_nature', fullName: 'Рустам Иброҳимов', email: 'rustam@example.com', bio: 'Кӯҳнавардӣ дар Варзоб ва Ҳисор 🌲 Табиати Тоҷикистон', website: 'https://rustam-eco.tj', gender: 0, city: 'Varzob' },
  { userName: 'zarrina_life', fullName: 'Заррина Холова', email: 'zarrina@example.com', bio: 'Китобхонӣ, шеър ва саёҳат дар шаҳрҳои қадим 📖', website: 'https://zarrina.blog', gender: 1, city: 'Istaravshan' },
  { userName: 'bekhzod_tech', fullName: 'Беҳзод Умаров', email: 'bekhzod@example.com', bio: 'Software Engineer & AI explorer 💻 Роҳ ба сӯи оянда', website: 'https://bekhzod.dev', gender: 0, city: 'Dushanbe' },
  { userName: 'madina_cook', fullName: 'Мадина Назарова', email: 'madina@example.com', bio: 'Ошпази таомҳои болаззати миллӣ: оши палав, қурутоб ва самбӯса 🍲', website: 'https://madinacooks.tj', gender: 1, city: 'Kulob' },
  { userName: 'jasur_vlog', fullName: 'Ҷасур Шарипов', email: 'jasur@example.com', bio: 'Влогҳои ҷолиб аз ҳаёти ҳаррӯза ва сафарҳо 🎥', website: 'https://jasurvlog.tj', gender: 0, city: 'Isfara' },
  { userName: 'zarina_beauty', fullName: 'Зарина Маҳмудова', email: 'zarina_b@example.com', bio: 'Стилист ва ороишгари касбӣ 💄 Зебоӣ санъат аст', website: 'https://zarinabeauty.tj', gender: 1, city: 'Dushanbe' },
  { userName: 'firdavs_travel', fullName: 'Фирдавс Ғафуров', email: 'firdavs@example.com', bio: 'Сайёҳи Искандаркӯл ва кӯлҳои Марғузор 🌊', website: 'https://firdavstravel.tj', gender: 0, city: 'Ayni' },
  { userName: 'malika_fashion', fullName: 'Малика Бобоева', email: 'malika@example.com', bio: 'Либосҳои миллии атласу адрас бо нақши муосир 👗', website: 'https://malikafashion.tj', gender: 1, city: 'Khujand' },
  { userName: 'davron_photo', fullName: 'Даврон Содиқов', email: 'davron@example.com', bio: 'Street and Urban Photography 🏙️ Душанбе шаби зебо', website: 'https://davronphoto.com', gender: 0, city: 'Dushanbe' },
  { userName: 'shahnoza_art', fullName: 'Шаҳноза Зокирова', email: 'shahnoza@example.com', bio: 'Эҷоди расмҳои рақамӣ ва иллюстатсияҳо ✨', website: 'https://shahnoza.art', gender: 1, city: 'Dushanbe' },
  { userName: 'khurshed_code', fullName: 'Хуршед Юнусов', email: 'khurshed@example.com', bio: 'Full-stack разработчик (NestJS + Next.js) ⚡', website: 'https://khurshed.dev', gender: 0, city: 'Dushanbe' },
  { userName: 'takhmina_life', fullName: 'Таҳмина Қосимова', email: 'takhmina@example.com', bio: 'Модар, омӯзгор ва блогери оилавӣ 🌿', website: 'https://takhmina.life', gender: 1, city: 'Bokhtar' },
  { userName: 'mehroj_fit', fullName: 'Меҳроҷ Каримов', email: 'mehroj@example.com', bio: 'Давидан дар Боғи Рӯдакӣ ва машқҳои субҳгоҳӣ 🏃', website: 'https://mehrojrun.tj', gender: 0, city: 'Dushanbe' },
  { userName: 'gulru_crafts', fullName: 'Гулрӯ Ҳакимова', email: 'gulru@example.com', bio: 'Ҳунарҳои мардумӣ, чакандӯзӣ ва сӯзанзанӣ 🧵', website: 'https://gulrucrafts.tj', gender: 1, city: 'Kulob' },
  { userName: 'alim_music', fullName: 'Олим Муродов', email: 'alim@example.com', bio: 'Навозандаи рубоб, сетор ва доира 🎶 Фарҳанги миллӣ', website: 'https://alimmusic.tj', gender: 0, city: 'Khorog' },
  { userName: 'nozima_smile', fullName: 'Нозима Сафарова', email: 'nozima@example.com', bio: 'Табассум кунед ва зиндагиро дӯст доред 😊', website: 'https://nozima.me', gender: 1, city: 'Dushanbe' },
  { userName: 'manuchehr_nature', fullName: 'Манучеҳр Темуров', email: 'manuchehr@example.com', bio: 'Табиатшинос ва видеограф 🦅 Олами ҳайвоноти Тоҷикистон', website: 'https://manuchehr.tj', gender: 0, city: 'Varzob' },
  { userName: 'safia_travel', fullName: 'Сафия Абдуллоева', email: 'safia@example.com', bio: 'Саёҳат дар гӯшаву канори дунё ✈️ 12 кишвар дидам', website: 'https://safiatravels.com', gender: 1, city: 'Dushanbe' },
  { userName: 'umid_vlog', fullName: 'Умед Қурбонов', email: 'umid@example.com', bio: 'Авто-влогҳо ва озмоиши мошинҳо дар роҳҳои кӯҳӣ 🚗', website: 'https://umidauto.tj', gender: 0, city: 'Dushanbe' },
  { userName: 'munira_decor', fullName: 'Мунира Тоҳирова', email: 'munira@example.com', bio: 'Гулпарварӣ ва ороиши боғҳои гулпӯш 🌷', website: 'https://muniradecor.tj', gender: 1, city: 'Khujand' },
  { userName: 'sheroz_tech', fullName: 'Шероз Фозилов', email: 'sheroz@example.com', bio: 'Барномасози мобилӣ ва гаҷетҳои муосир 📱', website: 'https://sheroztech.tj', gender: 0, city: 'Dushanbe' },
  { userName: 'nargis_style', fullName: 'Наргис Ҳамидова', email: 'nargis@example.com', bio: 'Модели либосҳои замонавӣ ва анъанавӣ 👠', website: 'https://nargis.tj', gender: 1, city: 'Dushanbe' },
  { userName: 'behruz_photo', fullName: 'Беҳрӯз Султонов', email: 'behruz@example.com', bio: 'Суратгири табиати Зарафшон ва Панҷакент 📷', website: 'https://behruzphoto.tj', gender: 0, city: 'Panjakent' },
  { userName: 'nilufar_art', fullName: 'Нилуфар Шокирова', email: 'nilufar@example.com', bio: 'Хаттотӣ ва калиграфияи шарқӣ ✍️ Санъати воло', website: 'https://nilufarart.tj', gender: 1, city: 'Istaravshan' },
  { userName: 'shavkat_driver', fullName: 'Шавкат Расулов', email: 'shavkat@example.com', bio: 'Экспедицияҳои Роҳи Абрешим ва Шоҳроҳи Помир 🚙', website: 'https://shavkatpamir.tj', gender: 0, city: 'Khorog' },
  { userName: 'sabrina_beauty', fullName: 'Сабрина Олимова', email: 'sabrina@example.com', bio: 'Пӯсти солим ва зебоии табиӣ 🌿 Маслиҳатҳои фоиданок', website: 'https://sabrinabeauty.tj', gender: 1, city: 'Dushanbe' },
  { userName: 'akmal_sound', fullName: 'Акмал Набиев', email: 'akmal@example.com', bio: 'Sound designer ва эҷоди садоҳои зебо 🎧', website: 'https://akmalsound.tj', gender: 0, city: 'Dushanbe' },
  { userName: 'rukhshona_life', fullName: 'Рухшона Шарипова', email: 'rukhshona@example.com', bio: 'Гармии хонадон, тарбияи фарзанд ва китоб ☕', website: 'https://rukhshona.tj', gender: 1, city: 'Khujand' },
  { userName: 'komron_dev', fullName: 'Комрон Холиқов', email: 'komron@example.com', bio: 'Стартапҳо ва рушди тиҷорати электронӣ дар Тоҷикистон 💡', website: 'https://komron.dev', gender: 0, city: 'Dushanbe' },
  { userName: 'feruza_cook', fullName: 'Ферӯза Камолова', email: 'feruza@example.com', bio: 'Тортҳо, шириниҳо ва хӯрокҳои лазиз 🎂 Фармоиш қабул аст', website: 'https://feruzacake.tj', gender: 1, city: 'Dushanbe' },
  { userName: 'bahriddin_trip', fullName: 'Баҳриддин Юсупов', email: 'bahriddin@example.com', bio: 'Роҳбалад дар кӯлҳои зебои Кӯли Калон 🏕️', website: 'https://bahriddintrip.tj', gender: 0, city: 'Panjakent' },
  { userName: 'said_nature', fullName: 'Саид Муҳаммадов', email: 'said@example.com', bio: 'Манзараҳои қалъаи Ҳисор ва водии Ромит 🏰', website: 'https://saidnature.tj', gender: 0, city: 'Hissar' },
  { userName: 'rayhona_flow', fullName: 'Райҳона Азизова', email: 'rayhona@example.com', bio: 'Йога, оромӣ ва мувозинати равонӣ 🧘‍♀️', website: 'https://rayhonaflow.tj', gender: 1, city: 'Dushanbe' },
];

async function seed() {
  console.log('🌱 Starting comprehensive database seed with 40+ users, photos and video reels...');

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
  console.log('🧹 Cleaning previous records...');
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

  // 1. Create Core Locations
  console.log('📍 Seeding locations...');
  const locDushanbe = await locationRepo.save(
    locationRepo.create({ name: 'Боғи Рӯдакӣ', city: 'Dushanbe', country: 'Tajikistan', zipCode: '734000' }),
  );
  const locIskanderkul = await locationRepo.save(
    locationRepo.create({ name: 'Искандаркӯл (Iskanderkul Lake)', city: 'Fann Mountains', country: 'Tajikistan', zipCode: '735500' }),
  );
  const locPamir = await locationRepo.save(
    locationRepo.create({ name: 'Шоҳроҳи Помир (Pamir Highway)', city: 'Khorog', country: 'Tajikistan', zipCode: '736000' }),
  );
  const locKhujand = await locationRepo.save(
    locationRepo.create({ name: 'Қалъаи Хуҷанд (Khujand Fortress)', city: 'Khujand', country: 'Tajikistan', zipCode: '735700' }),
  );
  const locVarzob = await locationRepo.save(
    locationRepo.create({ name: 'Дараи Варзоб (Varzob Gorge)', city: 'Varzob', country: 'Tajikistan', zipCode: '735400' }),
  );
  const locHissar = await locationRepo.save(
    locationRepo.create({ name: 'Қалъаи Ҳисор (Hissar Fortress)', city: 'Hissar', country: 'Tajikistan', zipCode: '735900' }),
  );

  const locations = [locDushanbe, locIskanderkul, locPamir, locKhujand, locVarzob, locHissar];

  // 2. Create 42+ Users and Profiles
  console.log(`👥 Creating ${SEED_USERS.length} users with profiles...`);
  const savedUsers: User[] = [];

  for (let i = 0; i < SEED_USERS.length; i++) {
    const data = SEED_USERS[i];
    const user = userRepo.create({
      userName: data.userName,
      fullName: data.fullName,
      email: data.email,
      password: defaultPassword,
    });
    const saved = await userRepo.save(user);
    savedUsers.push(saved);

    const avatarUrl = AVATAR_URLS[i % AVATAR_URLS.length];

    await profileRepo.save(
      profileRepo.create({
        userId: saved.id,
        bio: data.bio,
        avatar: avatarUrl,
        website: data.website,
        gender: data.gender,
      }),
    );
  }

  // 3. Create Follow Network
  console.log('🤝 Building follower connections...');
  const followEntities: Follow[] = [];
  for (let i = 0; i < savedUsers.length; i++) {
    // Each user follows 5-8 other users
    const current = savedUsers[i];
    for (let j = 1; j <= 6; j++) {
      const target = savedUsers[(i + j) % savedUsers.length];
      if (current.id !== target.id) {
        followEntities.push(followRepo.create({ followerId: current.id, followingId: target.id }));
      }
    }
  }
  await followRepo.save(followEntities);

  // 4. Create 4 Posts for EVERY User (2 Photos + 2 Video Reels with Sound)
  console.log('📸 Generating 2 photos and 2 video reels with sound for each user (168 posts)...');

  const photoCaptions = [
    'Субҳи содиқ дар кӯҳҳои зебои диёр! Ҳавои тоза ва манзараи дилкаш 🏔️✨ #tajikistan #nature #mountains',
    'Рӯзи нав бо қаҳваи гарм ва нақшаҳои калон сар шуд ☕ Ҳамеша ба пеш! #dushanbe #morning #inspiration',
    'Зебогии шаҳри мо шабона беҳамтост 🌃 Равшаниҳои Душанбе #nightcity #dushanbe #lights',
    'Санъат ва ҳунар дар ҳар як лаҳзаи ҳаёт пайдост 🎨 Офариниши нави ман #art #design #creative',
    'Сафар ба кӯлҳои Марғузор — ҷое, ки об ранги зумуррад дорад 🌊 #travel #pamir #lakes',
    'Таоми миллии хушмаззаи тоҷикӣ: оши палав бо дӯстон 🍲 Ош шавад! #food #osh #tajikcuisine',
    'Лаҳзаҳои фаромӯшнашаванда дар ҳалқаи дӯстон ва наздикон ❤️ #friends #life #moments',
    'Офтобшинии дилкаш дар болои қуллаҳои осмонбӯс 🌅 #sunset #naturephotography #beautiful',
  ];

  const reelCaptions = [
    'Овози оби мусаффои Варзоб 🌊 Гӯш кунед ва оромӣ бахшед! Овози аслӣ #reels #varzob #sound #relax #tajikistan',
    'Парвози паррандагон ва навои дилангези субҳ дар осмони соф 🕊️ #birds #nature #sound #sky #reels',
    'Энергия ва ҳаракат дар як лаҳза! Зебогии рангҳо ва навои мусиқӣ 💥🎨 #motion #art #reels #trending',
    'Овози сеҳрноки асбоби миллии мардумӣ 🎵 Фарҳанги қадимаи тоҷикон #music #folk #sound #tajikistan',
    'Суманаки Наврӯзӣ — пухтани суманак бо таронаву шодмонӣ 🍲🎶 #sumanak #navruz #tajikistan #reels',
    'Насими форами шомгоҳӣ ва навои дарахтони сарсабз 🍃 Садои табиат #breeze #nature #asmr #reels',
    'Манзараи ғуруби офтоб аз баландии кӯҳҳо 🌄 Ҳисси парвоз #sunset #mountains #reelsvideo',
    'Шаршараи баланд ва навои кӯҳсори диёр 💦 Бо овоз тамошо кунед! #waterfall #reels #sound #nature',
  ];

  const allPosts: Post[] = [];

  for (let i = 0; i < savedUsers.length; i++) {
    const user = savedUsers[i];
    const loc = locations[i % locations.length];

    // Post 1: Photo
    const photoImg1 = PHOTO_URLS[(i * 2) % PHOTO_URLS.length];
    const p1 = await postRepo.save(
      postRepo.create({
        userId: user.id,
        locationId: loc.id,
        title: `Сурат аз ${loc.name}`,
        content: photoCaptions[(i * 2) % photoCaptions.length],
        isReel: false,
      }),
    );
    await postImageRepo.save(postImageRepo.create({ postId: p1.id, url: photoImg1, order: 0 }));
    allPosts.push(p1);

    // Post 2: Photo
    const photoImg2 = PHOTO_URLS[(i * 2 + 1) % PHOTO_URLS.length];
    const p2 = await postRepo.save(
      postRepo.create({
        userId: user.id,
        locationId: locations[(i + 1) % locations.length].id,
        title: `Лаҳзаҳои рангин дар ${locations[(i + 1) % locations.length].name}`,
        content: photoCaptions[(i * 2 + 1) % photoCaptions.length],
        isReel: false,
      }),
    );
    await postImageRepo.save(postImageRepo.create({ postId: p2.id, url: photoImg2, order: 0 }));
    allPosts.push(p2);

    // Post 3: Video Reel with Sound
    const reelVideo1 = REEL_VIDEO_URLS[(i * 2) % REEL_VIDEO_URLS.length];
    const p3 = await postRepo.save(
      postRepo.create({
        userId: user.id,
        locationId: loc.id,
        title: `Reels бо овоз: ${reelCaptions[(i * 2) % reelCaptions.length].slice(0, 30)}…`,
        content: reelCaptions[(i * 2) % reelCaptions.length],
        isReel: true,
      }),
    );
    await postImageRepo.save(postImageRepo.create({ postId: p3.id, url: reelVideo1, order: 0 }));
    allPosts.push(p3);

    // Post 4: Video Reel with Sound
    const reelVideo2 = REEL_VIDEO_URLS[(i * 2 + 1) % REEL_VIDEO_URLS.length];
    const p4 = await postRepo.save(
      postRepo.create({
        userId: user.id,
        locationId: locations[(i + 2) % locations.length].id,
        title: `Reels бо наво: ${reelCaptions[(i * 2 + 1) % reelCaptions.length].slice(0, 30)}…`,
        content: reelCaptions[(i * 2 + 1) % reelCaptions.length],
        isReel: true,
      }),
    );
    await postImageRepo.save(postImageRepo.create({ postId: p4.id, url: reelVideo2, order: 0 }));
    allPosts.push(p4);
  }

  // 5. Add Realistic Likes, Views, and Comments
  console.log('❤️ Generating realistic post engagements (likes, comments, views)...');
  const likesToSave: PostLike[] = [];
  const viewsToSave: PostView[] = [];
  const commentsToSave: Comment[] = [];
  const favoritesToSave: Favorite[] = [];

  const sampleComments = [
    'Офарин! Манзараи бисёр зебо ва дилкаш 👏',
    'Овози аҷоиб дорад, кайфият бахшид! 🔥',
    'Зебогии диёр ҳамеша дилрабост ❤️',
    'Бисёр зӯр баромадааст, боз интизори наворҳои нав ҳастем! 👍',
    'Олиҷаноб! Ба ман хеле писанд омад ✨',
    'Раҳмат барои чунин лаҳзаи зебову хотирмон 🌸',
    'Зӯр шудааст бародар, муваффақият! 🚀',
  ];

  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    // Give 3 to 10 likes per post
    const likeCount = 4 + (i % 6);
    for (let l = 0; l < likeCount; l++) {
      const liker = savedUsers[(i + l + 1) % savedUsers.length];
      likesToSave.push(postLikeRepo.create({ postId: post.id, userId: liker.id }));
      viewsToSave.push(postViewRepo.create({ postId: post.id, userId: liker.id }));
    }

    // Give 1 to 3 comments per post
    const commentCount = 1 + (i % 3);
    for (let c = 0; c < commentCount; c++) {
      const commenter = savedUsers[(i + c + 3) % savedUsers.length];
      commentsToSave.push(
        commentRepo.create({
          postId: post.id,
          userId: commenter.id,
          content: sampleComments[(i + c) % sampleComments.length],
        }),
      );
    }

    // Save favorites for some posts
    if (i % 3 === 0) {
      favoritesToSave.push(favoriteRepo.create({ postId: post.id, userId: savedUsers[0].id }));
    }
  }

  await postLikeRepo.save(likesToSave);
  await postViewRepo.save(viewsToSave);
  await commentRepo.save(commentsToSave);
  await favoriteRepo.save(favoritesToSave);

  // 6. Active Stories (24h validity)
  console.log('✨ Creating active 24-hour stories...');
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const storyEntities: Story[] = [];

  for (let i = 0; i < 15; i++) {
    storyEntities.push(
      storyRepo.create({
        userId: savedUsers[i].id,
        imageUrl: PHOTO_URLS[i % PHOTO_URLS.length],
        expiresAt: tomorrow,
      }),
    );
  }
  await storyRepo.save(storyEntities);

  // 7. Chats and direct messages
  console.log('💬 Creating direct messages...');
  const chat1 = await chatRepo.save(
    chatRepo.create({ user1Id: savedUsers[0].id, user2Id: savedUsers[1].id }),
  );
  await messageRepo.save([
    messageRepo.create({
      chatId: chat1.id,
      senderId: savedUsers[0].id,
      text: 'Салом Шаҳло! Асарҳои нават бисёр аҷоиб баромадаанд!',
      isRead: true,
    }),
    messageRepo.create({
      chatId: chat1.id,
      senderId: savedUsers[1].id,
      text: 'Салом Муҳаммад! Ташаккури зиёд, кӯшиш карда истодаам 🎨',
      isRead: true,
    }),
  ]);

  const chat2 = await chatRepo.save(
    chatRepo.create({ user1Id: savedUsers[0].id, user2Id: savedUsers[2].id }),
  );
  await messageRepo.save([
    messageRepo.create({
      chatId: chat2.id,
      senderId: savedUsers[2].id,
      text: 'Салом Муҳаммад, видеоҳои нави Помирро дидӣ? Бо овоз бин, ҳавои кӯҳҳост!',
      isRead: true,
    }),
    messageRepo.create({
      chatId: chat2.id,
      senderId: savedUsers[0].id,
      text: 'Ҳа дидам, кайфияти дигар дорад! Барори кор дар сафарҳо!',
      isRead: false,
    }),
  ]);

  await dataSource.destroy();

  console.log('\n======================================================');
  console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log(`👤 Total Users Created: ${savedUsers.length} (> 40 users)`);
  console.log(`🖼️ Total Posts Created: ${allPosts.length} (84 Photos + 84 Video Reels with Sound)`);
  console.log('🔐 All accounts use password: Password123!');
  console.log('Primary Login: muhammad_dev  | Password: Password123!');
  console.log('======================================================\n');
}

seed().catch((err) => {
  console.error('❌ Error seeding database:', err);
  process.exit(1);
});
