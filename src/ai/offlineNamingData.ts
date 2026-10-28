import { nonEuropeanCatalogExpansions } from './offlineNamingGlobalExpansion'
import { webGet, webPut } from '../data/webDatabase'
import {
  ancientArchaeologicalPersonPeriodKeys,
  ancientCultureConfigs,
  ancientCultureRegions,
  ancientExpansionCultureIds,
  ancientLocalizedNames,
  ancientPeriodFictionalProfiles,
  ancientPeriodGivenNames,
  ancientPeriodReferenceCatalogs,
} from './offlineNamingAncientExpansion'
import type { AncientExpansionCulture } from './offlineNamingAncientExpansion'

export type OfflineNameKind = 'character' | 'location' | 'organization' | 'item'
export type OfflineCulture =
  | 'chinese' | 'japanese' | 'korean' | 'english' | 'french' | 'german' | 'italian' | 'iberian'
  | 'norse' | 'icelandic' | 'ancient-greek' | 'ancient-rome' | 'egyptian'
  | 'india-north' | 'india-south' | 'vietnamese' | 'thai' | 'malay' | 'filipino'
  | 'yoruba' | 'amharic' | 'swahili' | 'zulu-xhosa' | 'north-american' | 'mesoamerican' | 'andean' | 'russian-siberian' | 'mongolian'
  | 'tibetan' | 'arabic' | 'persian' | 'turkic-central-asian' | 'celtic' | 'slavic-east' | 'hausa-fulani' | 'indigenous-north-american' | 'polynesian'
  | 'manchu' | 'burmese' | 'khmer-lao' | 'bengali' | 'punjabi-urdu' | 'ottoman-turkish' | 'somali' | 'igbo-akan' | 'brazilian-tupi' | 'caribbean' | 'maori'
  | 'dutch-lowlands' | 'roman-low-countries' | 'early-slavic' | 'baltic' | 'balkan' | 'caucasus' | 'kurdish' | 'tamil-telugu' | 'javanese-sundanese' | 'oromo-shona' | 'amazonian'
  | 'polish' | 'hungarian' | 'armenian' | 'georgian' | 'marathi-gujarati' | 'kannada-malayalam' | 'malagasy' | 'melanesian-australian'
  | 'hebrew-jewish' | 'assyrian' | 'romani' | 'sami' | 'canadian-french' | 'australian-aboriginal'
  | 'finnish' | 'albanian-romanian' | 'amazigh-tuareg' | 'pashtun-tajik' | 'nepali-sinhala' | 'inuit' | 'mapuche' | 'micronesian-fijian'
  | 'uyghur' | 'kazakh' | 'kyrgyz' | 'uzbek' | 'turkmen' | 'tajik' | 'navajo-apache' | 'haudenosaunee' | 'pueblo' | 'northwest-coast' | 'maya' | 'nahuatl' | 'quechua' | 'aymara'
  | 'modern-greek' | 'portuguese' | 'balinese' | 'minangkabau' | 'akan' | 'igbo' | 'hausa' | 'fulani' | 'wolof' | 'kongo' | 'azerbaijani' | 'chechen-dagestan' | 'hawaiian' | 'samoan-tongan'
  | 'dong-son-au-lac' | 'sa-huynh-champa' | 'funan-chenla' | 'pyu-city-states' | 'dvaravati-mon' | 'old-malay-srivijaya' | 'old-javanese-medang' | 'old-bali'
  | AncientExpansionCulture
export type OfflineGender = 'any' | 'female' | 'male'
export type OfflineLocationType = 'settlement' | 'region' | 'fortress' | 'natural'
export type OfflineCatalogMode = 'mixed' | 'reference' | 'fictional'

export type OfflinePeriod = { id: string; label: string; personData?: 'archaeological' }
export type OfflineNameCandidate = {
  id: string
  name: string
  nativeName: string
  kind: OfflineNameKind
  culture: OfflineCulture
  cultureLabel: string
  period: string
  periodLabel: string
  gender: OfflineGender
  meaning: string
  pattern: string
  reading?: string
  components: string
  sourceClass: 'historical' | 'modern' | 'regional' | 'controlled'
  createdAt: number
  favorite?: boolean
}

export type OfflineNameOptions = {
  kind: OfflineNameKind
  culture: OfflineCulture
  period: string
  gender?: OfflineGender
  locationType?: OfflineLocationType
  surname?: string
  catalogMode?: OfflineCatalogMode
  count?: number
  exclude?: string[]
}

type PersonDatum = { name: string; gender?: OfflineGender; reading?: string; meaning?: string; sourceClass?: OfflineNameCandidate['sourceClass'] }
type CultureConfig = { label: string; periods: OfflinePeriod[]; surnames: PersonDatum[]; given: PersonDatum[]; structure: string; sourceClass: OfflineNameCandidate['sourceClass']; patronymic?: boolean }

const p = (id: string, label: string, personData?: OfflinePeriod['personData']): OfflinePeriod => ({ id, label, ...(personData ? { personData } : {}) })
const person = (name: string, gender: OfflineGender = 'any', reading?: string, meaning?: string): PersonDatum => ({ name, gender, reading, meaning })

const cultures: Record<OfflineCulture, CultureConfig> = {
  chinese: { label: '中式', periods: [p('pre-qin-han', '先秦两汉'), p('wei-jin-tang', '魏晋隋唐'), p('song-yuan', '宋元'), p('ming-qing', '明清'), p('republic', '民国'), p('modern', '现代')], surnames: '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛范彭郎鲁韦昌马苗凤花方俞任袁柳史唐薛雷贺倪汤罗毕郝安常傅卞齐康伍余顾孟平黄和穆萧尹姚邵汪祁毛禹狄米贝明臧成戴谈宋庞熊纪舒屈项祝董梁杜阮蓝闵席季麻强贾路江童颜郭梅盛林钟徐邱骆高夏蔡田樊胡凌霍虞万柯管卢莫房裘解宗丁宣邓郁杭洪包左石崔吉龚程邢裴陆荣荀羊惠甄曲家封芮羿储靳松井段富巫乌焦弓牧山谷车侯全班仰秋仲伊宫宁仇栾暴甘厉戎祖武符刘景詹束龙叶幸司黎薄白蒲从索赖卓蔺屠蒙池乔阴胥苍双闻党翟谭劳姬申扶堵冉桑桂濮牛寿通边燕浦尚农温庄晏柴瞿阎充慕连茹艾鱼容向古易慎戈廖庾终居衡步都耿满弘匡国文寇广禄阙东欧利师巩聂晁勾敖融冷辛简饶曾丰巢关相查荆红游竺权盖桓公'.split('').map((name) => person(name)), given: ['文', '武', '昭', '明', '景', '安', '宁', '清', '远', '修', '瑾', '瑜', '珩', '衡', '川', '舟', '云', '山', '松', '柏', '兰', '竹', '梅', '荷', '月', '星', '霜', '雪', '鸿', '鹤', '归', '澜', '汐', '棠', '书', '言', '知', '微', '思', '齐', '怀', '信', '承', '志', '守', '真', '若', '初', '晚', '晴', '嘉', '禾', '予', '安', '清和', '知远', '景行', '修远', '怀瑾', '令仪', '含章', '静姝', '闻溪', '望舒', '子衿', '明夷', '云深', '观澜', '临川', '既白', '扶光', '南枝', '砚秋', '鹤鸣', '庭芳', '思齐', '书宁', '长庚', '青禾', '嘉言', '知行', '言初', '时安', '云舟', '清晏', '远舟'].map((name) => person(name)), structure: '姓 + 名（单名或双字名）', sourceClass: 'historical' },
  japanese: { label: '日本', periods: [p('asuka-nara', '飞鸟至奈良'), p('heian', '平安'), p('kamakura-muromachi', '镰仓至室町'), p('sengoku-azuchi', '战国至安土桃山'), p('edo', '江户'), p('meiji-showa', '明治至昭和前期'), p('modern', '战后至现代')], surnames: ['佐藤', '铃木', '高桥', '田中', '伊藤', '渡边', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐佐木', '山口', '松本', '井上', '木村', '林', '清水', '斋藤', '森', '池田', '桥本', '阿部', '石川', '前田', '藤田', '冈田', '后藤', '长谷川'].map((name) => person(name)), given: [person('大和', 'male', 'Yamato'), person('拓海', 'male', 'Takumi'), person('直人', 'male', 'Naoto'), person('健一', 'male', 'Kenichi'), person('悠真', 'male', 'Yuma'), person('春树', 'male', 'Haruki'), person('莲', 'male', 'Ren'), person('美咲', 'female', 'Misaki'), person('葵', 'female', 'Aoi'), person('樱', 'female', 'Sakura'), person('阳子', 'female', 'Yoko'), person('千代', 'female', 'Chiyo'), person('凛', 'female', 'Rin'), person('和子', 'female', 'Kazuko'), person('千寻', 'female', 'Chihiro'), person('结衣', 'female', 'Yui'), person('优奈', 'female', 'Yuna'), person('琴音', 'female', 'Kotone'), person('真央', 'female', 'Mao')], structure: '姓 + 名；按所选时代使用相应姓氏与名', sourceClass: 'historical' },
  korean: { label: '韩国/朝鲜', periods: [p('three-kingdoms', '三国时代'), p('unified-silla', '统一新罗'), p('goryeo', '高丽'), p('early-joseon', '朝鲜前期'), p('late-joseon', '朝鲜后期'), p('korean-empire', '大韩帝国'), p('colonial', '近代殖民时期'), p('south-modern', '战后韩国'), p('north-modern', '战后朝鲜')], surnames: ['金', '李', '朴', '崔', '郑', '姜', '赵', '尹', '张', '林', '韩', '吴', '申', '徐', '权', '黄', '安', '宋', '柳', '洪'].map((name) => person(name)), given: [person('民俊', 'male', 'Min-jun'), person('志勋', 'male', 'Ji-hoon'), person('贤宇', 'male', 'Hyun-woo'), person('俊赫', 'male', 'Jun-hyuk'), person('道允', 'male', 'Do-yoon'), person('瑞妍', 'female', 'Seo-yeon'), person('恩智', 'female', 'Eun-ji'), person('秀妍', 'female', 'Soo-yeon'), person('智秀', 'female', 'Ji-soo'), person('娜恩', 'female', 'Na-eun'), person('善宇', 'any', 'Sun-woo'), person('成民', 'male', 'Sung-min'), person('贞淑', 'female', 'Jeong-suk')], structure: '姓 + 名；按时期及战后南北语境分别取名', sourceClass: 'historical' },
  english: { label: '英格兰', periods: [p('medieval', '中世纪英格兰'), p('early-modern', '近世英格兰'), p('modern', '现代英格兰')], surnames: ['Smith', 'Taylor', 'Brown', 'Wilson', 'Parker', 'Bennett', 'Thomas', 'Roberts', 'Johnson', 'Williams', 'Jones', 'Miller', 'Anderson', 'White', 'Harris', 'Martin', 'Thompson', 'Walker', 'Clark', 'Lewis', 'Hall', 'Young', 'King', 'Wright', 'Green', 'Baker', 'Hill', 'Wood', 'Cooper', 'Turner'].map((name) => person(name)), given: ['William', 'Henry', 'Edward', 'Thomas', 'John', 'George', 'Arthur', 'Richard', 'James', 'Robert', 'Charles', 'Alfred', 'Edmund', 'Philip', 'Alice', 'Eleanor', 'Elizabeth', 'Margaret', 'Anne', 'Catherine', 'Jane', 'Mary', 'Lucy', 'Emma', 'Charlotte', 'Rose', 'Clara', 'Helen', 'Grace', 'Beatrice'].map((name, index) => person(name, index < 15 ? 'male' : 'female')), structure: '名 + 英格兰家族姓', sourceClass: 'historical' },
  french: { label: '法国', periods: [p('medieval', '中世纪'), p('ancien-regime', '近世'), p('modern', '现代')], surnames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'].map((name) => person(name)), given: ['Jean', 'Pierre', 'Louis', 'Henri', 'Charles', 'Antoine', 'François', 'Étienne', 'Hugo', 'Gabriel', 'Julien', 'Alain', 'Marie', 'Jeanne', 'Claire', 'Élise', 'Madeleine', 'Camille', 'Sophie', 'Amélie', 'Colette', 'Marguerite'].map((name, index) => person(name, index < 12 ? 'male' : 'female')), structure: '名 + 家族姓', sourceClass: 'historical' },
  german: { label: '德意志地区', periods: [p('medieval', '中世纪德意志'), p('early-modern', '近世德意志'), p('modern', '现代德国')], surnames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann'].map((name) => person(name)), given: ['Johann', 'Hans', 'Friedrich', 'Wilhelm', 'Heinrich', 'Karl', 'Otto', 'Konrad', 'Georg', 'Ludwig', 'Ernst', 'Maximilian', 'Anna', 'Clara', 'Greta', 'Klara', 'Elisabeth', 'Margarete', 'Hanna', 'Sophie'].map((name, index) => person(name, index < 12 ? 'male' : 'female')), structure: '名 + 德意志家族姓', sourceClass: 'historical' },
  italian: { label: '意大利', periods: [p('medieval', '中世纪'), p('renaissance', '文艺复兴'), p('modern', '现代')], surnames: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti'].map((name) => person(name)), given: ['Giovanni', 'Marco', 'Luca', 'Matteo', 'Francesco', 'Leonardo', 'Alessandro', 'Dante', 'Paolo', 'Antonio', 'Pietro', 'Giuseppe', 'Maria', 'Lucia', 'Sofia', 'Beatrice', 'Giulia', 'Caterina', 'Elena', 'Chiara'].map((name, index) => person(name, index < 12 ? 'male' : 'female')), structure: '名 + 家族姓', sourceClass: 'historical' },
  iberian: { label: '西班牙', periods: [p('medieval', '中世纪西班牙诸王国'), p('early-modern', '近世西班牙'), p('modern', '现代西班牙')], surnames: ['García', 'Fernández', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Díaz', 'Hernández', 'Ruiz', 'Jiménez', 'Moreno', 'Navarro', 'Alonso', 'Romero', 'Torres', 'Ortega', 'Ramos'].map((name) => person(name)), given: ['Juan', 'Carlos', 'Miguel', 'Diego', 'Fernando', 'Alfonso', 'Rodrigo', 'Javier', 'Luis', 'Antonio', 'José', 'Mateo', 'María', 'Isabel', 'Carmen', 'Teresa', 'Inés', 'Sofía', 'Elena', 'Beatriz'].map((name, index) => person(name, index < 12 ? 'male' : 'female')), structure: '名 + 父姓 + 母姓（现代常见）', sourceClass: 'modern' },
  norse: { label: '挪威/古诺斯', periods: [p('viking', '挪威维京时代'), p('medieval', '中世纪挪威'), p('modern', '现代挪威')], surnames: [], given: ['Harald', 'Hakon', 'Olav', 'Eirik', 'Sigurd', 'Halfdan', 'Guttorm', 'Bjorn', 'Ragnvald', 'Torstein', 'Astrid', 'Ragnhild', 'Gunnhild', 'Asa', 'Gyda', 'Sigrid', 'Ingeborg', 'Gudrun', 'Tora', 'Bergljot'].map((name, index) => person(name, index < 10 ? 'male' : 'female')), structure: '历史期为名 + 父名属格 + son/dóttir；现代期为名 + 挪威固定家族姓', sourceClass: 'historical', patronymic: true },
  icelandic: { label: '冰岛', periods: [p('medieval', '中世纪冰岛'), p('modern', '现代冰岛')], surnames: [], given: ['Jón', 'Gunnar', 'Magnús', 'Einar', 'Ólafur', 'Björn', 'Arnar', 'Kristján', 'Sigríður', 'Guðrún', 'Jónína', 'Elín', 'Halla', 'Anna'].map((name, index) => person(name, index < 8 ? 'male' : 'female')), structure: '名 + 父名/母名的属格形式 + son/dóttir；通常无固定家族姓', sourceClass: 'historical', patronymic: true },
  'ancient-greek': { label: '古希腊', periods: [p('archaic', '古风时期'), p('classical', '古典时期'), p('hellenistic', '希腊化时期')], surnames: [], given: ['Achilleus', 'Alexandros', 'Athenodoros', 'Demetrios', 'Dionysios', 'Leonidas', 'Nikomachos', 'Perikles', 'Sokrates', 'Theodoros', 'Xenophon', 'Andromache', 'Ariadne', 'Aspasia', 'Calliope', 'Daphne', 'Helene', 'Irene', 'Penelope', 'Thais'].map((name, index) => person(name, index < 11 ? 'male' : 'female')), structure: '个人名 + 父名/城邦或族属标识（按语境）', sourceClass: 'historical' },
  'ancient-rome': { label: '古罗马', periods: [p('republic', '罗马共和国'), p('empire', '罗马帝国')], surnames: ['Julius', 'Cornelius', 'Tullius', 'Fabius', 'Aurelius', 'Claudius', 'Flavius', 'Valerius', 'Antonius', 'Octavius'].map((name) => person(name)), given: ['Marcus', 'Gaius', 'Lucius', 'Publius', 'Quintus', 'Titus', 'Aulus', 'Decimus', 'Sextus', 'Julia', 'Livia', 'Cornelia', 'Aurelia', 'Claudia', 'Octavia'].map((name, index) => person(name, index < 9 ? 'male' : 'female')), structure: '本名 + 氏族名 + 家族支系名（男性三名制）', sourceClass: 'historical' },
  egyptian: { label: '埃及', periods: [p('ancient', '古埃及'), p('ptolemaic', '托勒密埃及'), p('modern', '现代埃及')], surnames: [], given: ['Ramesses', 'Thutmose', 'Amenhotep', 'Akhenaten', 'Hatshepsut', 'Nefertiti', 'Cleopatra', 'Ptah', 'Osiris', 'Isis', 'Meryre', 'Ahmose'].map((name, index) => person(name, index < 8 ? 'male' : 'female')), structure: '个人名 + 神祇/王室/家族关联（随时期变化）', sourceClass: 'historical' },
  'india-north': { label: '印度北部', periods: [p('ancient', '古代'), p('medieval', '中世纪'), p('modern', '现代')], surnames: ['Sharma', 'Singh', 'Patel', 'Gupta', 'Verma', 'Mehta', 'Khan', 'Rao'].map((name) => person(name)), given: ['Arjun', 'Dev', 'Ravi', 'Vikram', 'Amit', 'Rahul', 'Aditya', 'Karan', 'Priya', 'Ananya', 'Kavya', 'Meera'].map((name, index) => person(name, index < 8 ? 'male' : 'female')), structure: '名 + 家族姓（地区、宗教和社群会影响结构）', sourceClass: 'historical' },
  'india-south': { label: '印度南部', periods: [p('ancient', '古代'), p('medieval', '中世纪'), p('modern', '现代')], surnames: ['Iyer', 'Nair', 'Menon', 'Reddy', 'Pillai', 'Rao', 'Naidu'].map((name) => person(name)), given: ['Arun', 'Kumar', 'Vijay', 'Suresh', 'Mohan', 'Ravi', 'Lakshmi', 'Anjali', 'Kavita', 'Priya', 'Meena', 'Divya'].map((name, index) => person(name, index < 6 ? 'male' : 'female')), structure: '名 + 家族/社群姓；部分地区可使用父名或出生地名', sourceClass: 'historical' },
  vietnamese: { label: '越南', periods: [p('dynastic', '历史王朝'), p('colonial', '近代'), p('modern', '现代')], surnames: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Võ', 'Đặng', 'Bùi'].map((name) => person(name)), given: ['Minh Anh', 'Tấn Dũng', 'Quốc Huy', 'Thanh Bình', 'Đức Minh', 'Gia Bảo', 'Ngọc Lan', 'Mai Anh', 'Thùy Linh', 'Phương Thảo'].map((name, index) => person(name, index < 6 ? 'male' : 'female')), structure: '姓 + 中间名/名；姓通常在前', sourceClass: 'historical' },
  thai: { label: '泰国', periods: [p('traditional', '传统时期'), p('modern', '现代')], surnames: ['Srisuk', 'Sukhum', 'Chaiyaporn', 'Wongsa', 'Kittisak', 'Rattanakul'].map((name) => person(name)), given: ['Somchai', 'Anan', 'Prasert', 'Niran', 'Kittipong', 'Suda', 'Mali', 'Nok', 'Sirin', 'Pimchanok'].map((name, index) => person(name, index < 5 ? 'male' : 'female')), structure: '名 + 家族姓；日常通常另用昵称', sourceClass: 'modern' },
  malay: { label: '马来/印度尼西亚', periods: [p('traditional', '传统时期'), p('modern', '现代')], surnames: [], given: ['Ahmad', 'Ismail', 'Hafiz', 'Rizal', 'Farid', 'Aisyah', 'Siti', 'Nur', 'Zahra', 'Maya'].map((name, index) => person(name, index < 5 ? 'male' : 'female')), structure: '名 + bin/binti + 父名；不强制固定家族姓', sourceClass: 'modern', patronymic: true },
  filipino: { label: '菲律宾', periods: [p('precolonial', '前殖民时期'), p('colonial', '殖民时期'), p('modern', '现代')], surnames: ['Santos', 'Reyes', 'Cruz', 'Garcia', 'Bautista', 'Mendoza'].map((name) => person(name)), given: ['Juan', 'Jose', 'Miguel', 'Andres', 'Emilio', 'Maria', 'Rosa', 'Luz', 'Ana', 'Isabel'].map((name, index) => person(name, index < 5 ? 'male' : 'female')), structure: '名 + 中间姓（常为母姓）+ 家族姓', sourceClass: 'modern' },
  yoruba: { label: '西非约鲁巴', periods: [p('traditional', '传统时期'), p('modern', '现代')], surnames: ['Adeyemi', 'Adebayo', 'Okafor', 'Balogun', 'Ogunleye', 'Fashola'].map((name) => person(name)), given: ['Babajide', 'Akin', 'Chinedu', 'Kehinde', 'Tunde', 'Adesewa', 'Yetunde', 'Folake', 'Amara', 'Ngozi'].map((name, index) => person(name, index < 5 ? 'male' : 'female')), structure: '个人名 + 家族名；宗教和出生事件常影响名字', sourceClass: 'historical' },
  amharic: { label: '东非阿姆哈拉', periods: [p('imperial', '帝国时期'), p('modern', '现代')], surnames: [], given: ['Dawit', 'Mekonnen', 'Tadesse', 'Haile', 'Yonas', 'Meron', 'Almaz', 'Hana', 'Saron', 'Tigist'].map((name, index) => person(name, index < 5 ? 'male' : 'female')), structure: '名 + 父名；通常不使用固定家族姓', sourceClass: 'historical', patronymic: true },
  swahili: { label: '东非斯瓦希里', periods: [p('precolonial', '前殖民时期'), p('modern', '现代')], surnames: ['Mwangi', 'Odhiambo', 'Kiptoo', 'Mushi', 'Juma', 'Hassan'].map((name) => person(name)), given: ['Jabari', 'Baraka', 'Khalil', 'Musa', 'Amani', 'Zuri', 'Nia', 'Asha', 'Neema', 'Imani'].map((name, index) => person(name, index < 5 ? 'male' : 'female')), structure: '名 + 家族/父名；班图、阿拉伯和伊斯兰传统交汇', sourceClass: 'historical' },
  'zulu-xhosa': { label: '南部非洲祖鲁/科萨', periods: [p('precolonial', '前殖民时期'), p('modern', '现代')], surnames: ['Dlamini', 'Ndlovu', 'Mthembu', 'Mkhize', 'Khumalo', 'Mabena'].map((name) => person(name)), given: ['Thabo', 'Sipho', 'Lwazi', 'Bongani', 'Sizwe', 'Nomsa', 'Ayanda', 'Lerato', 'Thandi', 'Zanele'].map((name, index) => person(name, index < 5 ? 'male' : 'female')), structure: '名 + 家族姓；姓名常带有语义和出生背景', sourceClass: 'modern' },
  'north-american': { label: '北美英语区', periods: [p('colonial', '殖民时期'), p('modern', '现代')], surnames: ['Johnson', 'Williams', 'Brown', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor'].map((name) => person(name)), given: ['James', 'Michael', 'William', 'Robert', 'Daniel', 'Ethan', 'Emily', 'Olivia', 'Hannah', 'Mia'].map((name, index) => person(name, index < 6 ? 'male' : 'female')), structure: '名 + 中间名（可选）+ 家族姓', sourceClass: 'modern' },
  mesoamerican: { label: '中美洲（纳瓦特尔/玛雅资料包）', periods: [p('precolonial', '前殖民时期'), p('colonial', '殖民时期'), p('modern', '现代')], surnames: ['Xochitl', 'Itzcoatl', 'Cuauhtémoc', 'Balam', 'Canek', 'Tz\'ikin'].map((name) => person(name)), given: ['Tenoch', 'Acatl', 'Iktan', 'Yaxkin', 'Kukulkan', 'Metztli', 'Xunaxi', 'Ixchel', 'Citlali', 'Itzel'].map((name, index) => person(name, index < 5 ? 'male' : 'female')), structure: '个人名 + 氏族/家族标识；不同民族差异很大', sourceClass: 'historical' },
  andean: { label: '安第斯（克丘亚/艾马拉资料包）', periods: [p('precolonial', '前殖民时期'), p('colonial', '殖民时期'), p('modern', '现代')], surnames: ['Quispe', 'Mamani', 'Condori', 'Huamán', 'Flores', 'Rojas'].map((name) => person(name)), given: ['Inti', 'Tupac', 'Amaru', 'Pacha', 'Kuntur', 'Killa', 'Sumaq', 'Nayra', 'Mayu', 'Illari'].map((name, index) => person(name, index < 5 ? 'male' : 'female')), structure: '个人名 + 家族/社群姓；现代常与西语姓氏并存', sourceClass: 'historical' },
  'russian-siberian': { label: '俄罗斯/西伯利亚', periods: [p('tsardom', '沙皇时期'), p('imperial', '帝国时期'), p('soviet', '苏联时期'), p('modern', '现代')], surnames: ['Ivanov', 'Petrov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov', 'Lebedev', 'Kozlov', 'Novikov', 'Morozov', 'Volkov', 'Fedorov', 'Mikhailov', 'Pavlov', 'Semenov', 'Egorov'].map((name) => person(name)), given: [...['Aleksandr', 'Dmitri', 'Mikhail', 'Nikolai', 'Sergei', 'Viktor', 'Yuri', 'Pavel', 'Ilya', 'Andrei', 'Fyodor', 'Timofei'].map((name) => person(name, 'male')), ...['Anastasia', 'Ekaterina', 'Natalia', 'Svetlana', 'Tatiana', 'Olga', 'Irina', 'Vera', 'Elena', 'Daria', 'Larisa', 'Mariya'].map((name) => person(name, 'female'))], structure: '名 + 父称 + 家族姓；父称随性别变化', sourceClass: 'historical' },
  mongolian: { label: '蒙古草原', periods: [p('pre-empire', '部落联盟时期'), p('empire', '蒙古帝国时期'), p('northern-yuan', '北元时期'), p('oirat-khanates', '瓦剌与准噶尔时期'), p('qing', '清代蒙古'), p('socialist', '社会主义时期'), p('modern', '现代蒙古')], surnames: ['Borjigin', 'Kiyad', 'Jalair', 'Onggirat', 'Khongirad', 'Uriankhai', 'Mergen', 'Baatar', 'Erdene', 'Tumen'].map((name) => person(name)), given: [...['Temur', 'Batu', 'Kubilai', 'Sukh', 'Batsaikhan', 'Munkh', 'Enkh', 'Tseren', 'Altan', 'Chuluun'].map((name) => person(name, 'male')), ...['Saran', 'Erdene', 'Naran', 'Altantsetseg', 'Oyuna', 'Tungalag', 'Bolormaa', 'Anu', 'Khulan', 'Suvd'].map((name) => person(name, 'female'))], structure: '历史时期为氏族/部属 + 本名；近现代为父名 + 本名', sourceClass: 'historical' },
  tibetan: { label: '藏区', periods: [p('empire', '吐蕃时期'), p('fragmentation', '分裂割据时期'), p('sakya-yuan', '萨迦与元代'), p('phagmodrupa', '帕木竹巴时期'), p('ganden-phodrang', '甘丹颇章时期'), p('modern', '近现代藏区')], surnames: [], given: [...['Tenzin', 'Sonam', 'Pema', 'Jigme', 'Kalsang', 'Dawa', 'Lobsang', 'Ngawang'].map((name) => person(name, 'male')), ...['Dolma', 'Yangchen', 'Dechen', 'Tsering', 'Pema', 'Kunsang', 'Lhamo', 'Metok'].map((name) => person(name, 'female'))], structure: '个人名（常为双名或宗教名；通常无固定家族姓）', sourceClass: 'historical' },
  arabic: { label: '阿拉伯语区', periods: [p('classical', '古典时期'), p('medieval', '中世纪'), p('modern', '现代')], surnames: ['Al-Hassan', 'Al-Rashid', 'Al-Karim', 'Al-Mansur', 'Al-Farisi', 'Al-Najjar', 'Al-Hakim', 'Al-Qasim'].map((name) => person(name)), given: [...['Abdullah', 'Ahmad', 'Ali', 'Hassan', 'Ibrahim', 'Khalid', 'Omar', 'Zayd'].map((name) => person(name, 'male')), ...['Amina', 'Fatima', 'Khadija', 'Layla', 'Maryam', 'Nour', 'Salma', 'Zahra'].map((name) => person(name, 'female'))], structure: '名 + 家族名；可按语境使用 ibn/bint、kunya 或 nisba', sourceClass: 'historical' },
  persian: { label: '波斯语区', periods: [p('ancient', '古波斯'), p('classical', '古典波斯'), p('modern', '现代')], surnames: ['Farahani', 'Khosravi', 'Mehrabi', 'Shirazi', 'Tabrizi', 'Yazdani', 'Daryaei', 'Azadi'].map((name) => person(name)), given: [...['Ardashir', 'Bahram', 'Darius', 'Farhad', 'Kaveh', 'Mehrdad', 'Rostam', 'Shahram'].map((name) => person(name, 'male')), ...['Anahita', 'Azar', 'Darya', 'Farah', 'Golnaz', 'Mahin', 'Roxana', 'Shirin'].map((name) => person(name, 'female'))], structure: '名 + 家族姓；波斯语历史与诗歌传统', sourceClass: 'historical' },
  'turkic-central-asian': { label: '突厥/中亚', periods: [p('steppe', '草原时期'), p('khanate', '汗国时期'), p('modern', '现代')], surnames: ['Aydin', 'Bekov', 'Karimov', 'Nazarov', 'Sadykov', 'Tursunov', 'Yildiz', 'Boran'].map((name) => person(name)), given: [...['Alp', 'Arslan', 'Bekir', 'Bora', 'Emir', 'Kemal', 'Timur', 'Yusuf'].map((name) => person(name, 'male')), ...['Ayla', 'Aynur', 'Dilara', 'Gul', 'Nargiz', 'Sevda', 'Tumar', 'Yulduz'].map((name) => person(name, 'female'))], structure: '名 + 家族名/父名；突厥语与中亚草原传统', sourceClass: 'historical' },
  celtic: { label: '爱尔兰盖尔', periods: [p('ogham', '欧甘铭文期爱尔兰（约4—7世纪）'), p('early-medieval', '早期中世纪爱尔兰'), p('medieval', '盖尔中世纪'), p('modern', '现代爱尔兰')], surnames: ["O'Brien", "O'Malley", "O'Donnell", 'Murphy', 'Kelly', 'Doyle', "O'Sullivan", "O'Connor", "O'Neill", 'McCarthy', 'Gallagher', 'Byrne', 'Kennedy', 'Lynch', 'Quinn', 'Brennan', 'Ryan', 'Murray'].map((name) => person(name)), given: [...['Aidan', 'Bran', 'Ciaran', 'Declan', 'Eamon', 'Finn', 'Niall', 'Ronan'].map((name) => person(name, 'male')), ...['Aoife', 'Brigid', 'Ciara', 'Deirdre', 'Eimear', 'Maeve', 'Niamh', 'Riona'].map((name) => person(name, 'female'))], structure: '欧甘铭文期保留铭文姓名形式；早期使用个人名与父名；中世纪以后使用 Ó/Mac 氏族名，现代为固定家族姓', sourceClass: 'historical' },
  'slavic-east': { label: '乌克兰/鲁塞尼亚', periods: [p('medieval', '基辅罗斯与鲁塞尼亚'), p('imperial', '近世乌克兰与鲁塞尼亚'), p('modern', '现代乌克兰')], surnames: ['Kovalenko', 'Melnyk', 'Shevchenko', 'Bondarenko', 'Tkachenko', 'Kravchenko', 'Boyko', 'Kovalchuk', 'Savchenko', 'Marchenko', 'Polishchuk', 'Honcharenko', 'Lysenko', 'Oliinyk', 'Klymenko', 'Kozak', 'Kushnir', 'Hrytsenko'].map((name) => person(name)), given: [...['Bohdan', 'Danylo', 'Miroslav', 'Ostap', 'Sviatoslav', 'Taras', 'Vadym', 'Yaroslav'].map((name) => person(name, 'male')), ...['Bohdana', 'Ivanna', 'Kateryna', 'Mariya', 'Oksana', 'Solomiya', 'Vira', 'Zoryana'].map((name) => person(name, 'female'))], structure: '中世纪以个人名、父名或领地称号为主；近现代为名 + 乌克兰家族姓', sourceClass: 'historical' },
  'hausa-fulani': { label: '豪萨/富拉尼', periods: [p('sahel', '萨赫勒传统时期'), p('emirate', '埃米尔时期'), p('modern', '现代')], surnames: ['Abubakar', 'Bello', 'Danjuma', 'Garba', 'Ibrahim', 'Sani', 'Usman', 'Yahaya'].map((name) => person(name)), given: [...['Adamu', 'Bashir', 'Haruna', 'Ibrahim', 'Musa', 'Suleiman', 'Umar', 'Yusuf'].map((name) => person(name, 'male')), ...['Aisha', 'Binta', 'Fadima', 'Hauwa', 'Khadija', 'Maryam', 'Rukayya', 'Zainab'].map((name) => person(name, 'female'))], structure: '名 + 家族/父名；萨赫勒与伊斯兰传统交汇', sourceClass: 'historical' },
  'indigenous-north-american': { label: '北美原住民（通用参考）', periods: [p('precontact', '接触前时期'), p('historical', '历史时期'), p('modern', '现代')], surnames: ['Redbird', 'Running Bear', 'Tallchief', 'Whitecloud', 'Yellowtail', 'Black Elk'].map((name) => person(name)), given: [...['Ahyoka', 'Chayton', 'Kitchi', 'Makwa', 'Nokose', 'Takoda'].map((name) => person(name, 'male')), ...['Aiyana', 'Kiona', 'Nokomis', 'Sakari', 'Tallulah', 'Winona'].map((name) => person(name, 'female'))], structure: '不同民族差异很大；仅作泛北美原住民创作参考，需在设定中进一步指定民族', sourceClass: 'historical' },
  polynesian: { label: '波利尼西亚', periods: [p('precontact', '接触前时期'), p('voyaging', '航海传统时期'), p('modern', '现代')], surnames: ['Alofa', 'Fetu', 'Katoa', 'Matai', 'Moana', 'Tui'].map((name) => person(name)), given: [...['Afa', 'Koa', 'Mana', 'Rangi', 'Tane', 'Tui'].map((name) => person(name, 'male')), ...['Hina', 'Leilani', 'Moana', 'Tala', 'Tehani', 'Vai'].map((name) => person(name, 'female'))], structure: '名 + 家族/岛屿语境；波利尼西亚航海与岛屿传统', sourceClass: 'historical' },
  manchu: { label: '满洲', periods: [p('jin-jurchen', '金代女真'), p('late-jurchen', '明代女真'), p('later-jin', '后金时期'), p('early-qing', '清前中期'), p('late-qing', '清后期'), p('modern', '近现代满族')], surnames: ['Aisin Gioro', 'Nara', 'Guwalgiya', 'Hala', 'Fuca', 'Niohuru'].map((name) => person(name)), given: [...['Nurhaci', 'Bujantai', 'Dorgon', 'Fiyanggū', 'Nikan', 'Sengge', 'Manggūltai', 'Jirgalang'].map((name) => person(name, 'male')), ...['Donggo', 'Monggo', 'Saran', 'Jerjer', 'Harjol', 'Mukushen', 'Mangguji', 'Bumbutai'].map((name) => person(name, 'female'))], structure: '历史时期为哈拉/氏族 + 名；近现代为汉字姓 + 名', sourceClass: 'historical' },
  burmese: { label: '缅甸', periods: [p('pagan', '蒲甘时期'), p('konbaung', '贡榜时期'), p('modern', '现代')], surnames: [], given: [...['Anawrahta', 'Bayinnaung', 'Alaungpaya', 'Minye', 'Minkhaung', 'Thado', 'Zeya', 'Aung'].map((name) => person(name, 'male')), ...['Shin Saw', 'Supayalat', 'Mya', 'Khin', 'Thazin', 'Hnin', 'May', 'Su'].map((name) => person(name, 'female'))], structure: '通常无固定家族姓；名由语义、排行与敬称组成', sourceClass: 'historical' },
  'khmer-lao': { label: '高棉/老挝', periods: [p('angkor', '吴哥时期'), p('lan-xang', '澜沧时期'), p('modern', '现代')], surnames: ['Sok', 'Chan', 'Khem', 'Phan', 'Siv', 'Bounmy'].map((name) => person(name)), given: [...['Jayavarman', 'Suryavarman', 'Fa Ngum', 'Setthathirath', 'Kham', 'Vannak', 'Dara', 'Sokha'].map((name) => person(name, 'male')), ...['Indradevi', 'Kossomak', 'Bopha', 'Kanya', 'Malina', 'Sophea', 'Noy', 'Dao'].map((name) => person(name, 'female'))], structure: '名 + 家族姓或宗族标识；高棉与老挝传统有差异', sourceClass: 'historical' },
  bengali: { label: '孟加拉', periods: [p('pala', '波罗时期'), p('sultanate', '苏丹时期'), p('modern', '现代')], surnames: ['Chatterjee', 'Mukherjee', 'Rahman', 'Hossain', 'Sen', 'Roy', 'Das', 'Bose'].map((name) => person(name)), given: [...['Arindam', 'Debashis', 'Fahim', 'Imran', 'Rahul', 'Sourav', 'Tanvir', 'Anik'].map((name) => person(name, 'male')), ...['Ananya', 'Farzana', 'Madhuri', 'Moumita', 'Nusrat', 'Rina', 'Sharmila', 'Tania'].map((name) => person(name, 'female'))], structure: '名 + 家族/宗教社群姓；孟加拉语区传统', sourceClass: 'historical' },
  'punjabi-urdu': { label: '旁遮普/乌尔都', periods: [p('sultanate', '苏丹时期'), p('mughal', '莫卧儿时期'), p('modern', '现代')], surnames: ['Kaur', 'Singh', 'Malik', 'Butt', 'Gill', 'Khan', 'Awan', 'Chaudhry'].map((name) => person(name)), given: [...['Arjan', 'Dilawar', 'Fateh', 'Gurpreet', 'Hamza', 'Imran', 'Jaswinder', 'Ranjit'].map((name) => person(name, 'male')), ...['Ayesha', 'Gurleen', 'Hira', 'Iqra', 'Kiran', 'Mehak', 'Noor', 'Simran'].map((name) => person(name, 'female'))], structure: '名 + 社群/家族姓；旁遮普、锡克与乌尔都传统交汇', sourceClass: 'historical' },
  'ottoman-turkish': { label: '奥斯曼土耳其', periods: [p('rise', '崛起时期'), p('classical', '古典时期'), p('late', '晚期')], surnames: ['Pasha', 'Efendi', 'Çelebi', 'Ağa', 'Sokollu', 'Köprülü'].map((name) => person(name)), given: [...['Mehmed', 'Murad', 'Osman', 'Selim', 'Sinan', 'Süleyman', 'Yavuz', 'Kemal'].map((name) => person(name, 'male')), ...['Ayşe', 'Fatma', 'Hürrem', 'Kösem', 'Mihrimah', 'Nurbanu', 'Safiye', 'Şah'].map((name) => person(name, 'female'))], structure: '名 + 父名/职衔/家族称号；奥斯曼宫廷与伊斯兰语境', sourceClass: 'historical' },
  somali: { label: '索马里', periods: [p('sultanate', '苏丹国时期'), p('colonial', '近代'), p('modern', '现代')], surnames: [], given: [...['Abdi', 'Aden', 'Bashir', 'Hassan', 'Ismail', 'Mahad', 'Omar', 'Yasin'].map((name) => person(name, 'male')), ...['Asha', 'Fadumo', 'Hodan', 'Ifrah', 'Khadra', 'Maryan', 'Sahra', 'Yasmin'].map((name) => person(name, 'female'))], structure: '名 + 父名 + 祖父名；通常不使用固定家族姓', sourceClass: 'historical', patronymic: true },
  'igbo-akan': { label: '伊博/阿肯', periods: [p('kingdoms', '王国时期'), p('colonial', '近代'), p('modern', '现代')], surnames: ['Mensah', 'Agyeman', 'Boateng', 'Okoye', 'Nwosu', 'Eze', 'Kofi', 'Owusu'].map((name) => person(name)), given: [...['Chukwu', 'Kwame', 'Kofi', 'Nana', 'Obinna', 'Osei', 'Uche', 'Yaw'].map((name) => person(name, 'male')), ...['Adwoa', 'Ama', 'Amara', 'Chiamaka', 'Esi', 'Ngozi', 'Yaa', 'Zainab'].map((name) => person(name, 'female'))], structure: '名 + 家族/出生日名；伊博与阿肯传统不能混作单一民族', sourceClass: 'historical' },
  'brazilian-tupi': { label: '巴西/图皮-瓜拉尼', periods: [p('precolonial', '前殖民时期'), p('colonial', '殖民时期'), p('modern', '现代')], surnames: ['da Silva', 'dos Santos', 'Guarani', 'Tupinamba', 'Pereira', 'Carvalho'].map((name) => person(name)), given: [...['Arani', 'Cauã', 'Jaci', 'Jurema', 'Kaique', 'Piatã', 'Tupã', 'Ubiratã'].map((name) => person(name, 'male')), ...['Araí', 'Iara', 'Jaciara', 'Jandira', 'Potira', 'Tainá', 'Yara', 'Irapuã'].map((name) => person(name, 'female'))], structure: '原住民名字与葡语姓氏在现代巴西并存；前殖民时期结构不同', sourceClass: 'historical' },
  caribbean: { label: '加勒比', periods: [p('precolonial', '前殖民时期'), p('colonial', '殖民时期'), p('modern', '现代')], surnames: ['Charles', 'Joseph', 'Pierre', 'Roberts', 'Williams', 'Gonzalez'].map((name) => person(name)), given: [...['Arawak', 'Bastian', 'Diego', 'Enrique', 'Jamal', 'Kwesi', 'Mateo', 'Rafael'].map((name) => person(name, 'male')), ...['Anacaona', 'Celeste', 'Isla', 'Marisol', 'Nia', 'Soraya', 'Yara', 'Zoe'].map((name) => person(name, 'female'))], structure: '加勒比原住民、非洲、法语、西语和英语传统交汇，需按具体岛屿细化', sourceClass: 'historical' },
  maori: { label: '毛利', periods: [p('precontact', '接触前时期'), p('tribal', '部族时期'), p('modern', '现代')], surnames: ['Ngata', 'Rangi', 'Te Rangi', 'Tāne', 'Whānau', 'Kingi'].map((name) => person(name)), given: [...['Aroha', 'Hemi', 'Kauri', 'Matiu', 'Rangi', 'Tama', 'Tane', 'Wiremu'].map((name) => person(name, 'male')), ...['Aroha', 'Hinemoa', 'Kiri', 'Mere', 'Ngaio', 'Te Rina', 'Whetu', 'Marama'].map((name) => person(name, 'female'))], structure: '名 + iwi/家族标识；毛利语音节与部族传统', sourceClass: 'historical' },
  'dutch-lowlands': { label: '荷兰/尼德兰低地', periods: [p('medieval', '中世纪尼德兰低地'), p('early-modern', '荷兰共和国时期'), p('modern', '现代荷兰语区')], surnames: ['Van Dijk', 'De Vries', 'Van den Berg', 'Janssen', 'Bakker', 'Visser', 'De Boer', 'Koning', 'De Jong', 'Smit', 'Meijer', 'Mulder', 'De Groot', 'Bos', 'Vos', 'Dekker', 'Brouwer', 'Dijkstra'].map((name) => person(name)), given: [...['Willem', 'Hendrik', 'Jan', 'Pieter', 'Maarten', 'Dirk', 'Bram', 'Koen'].map((name) => person(name, 'male')), ...['Anna', 'Eva', 'Liesbeth', 'Marieke', 'Sanne', 'Femke', 'Iris', 'Noor'].map((name) => person(name, 'female'))], structure: '中世纪使用个人名 + 父名、职业别称或出处称号；近世以后才逐渐固定为家族姓', sourceClass: 'historical' },
  'roman-low-countries': { label: '罗马时期莱茵河下游', periods: [p('roman', '罗马时期低地（约前1世纪—4世纪）')], surnames: [], given: ['Gaius Julius Civilis', 'Claudius Labeo', 'Julius Briganticus', 'Julius Paulus', 'Brinno', 'Chariovalda', 'Mallius', 'Verritus', 'Malorix', 'Cruptorix'].map((name) => person(name, 'any', undefined, '罗马时期莱茵河下游文献所见姓名')), structure: '本地单名或罗马化姓名；不使用中世纪或现代荷兰固定姓氏', sourceClass: 'historical' },
  'early-slavic': { label: '早期斯拉夫', periods: [p('migration-era', '迁徙时期早期斯拉夫（6—8世纪）')], surnames: [], given: ['Daurentius', 'Musokios', 'Ardagast', 'Peiragastus', 'Mezamer', 'Idariz', 'Kelagast', 'Akamir', 'Sclagamar', 'Chatzon', 'Perboundos', 'Dabragezas'].map((name) => person(name, 'any', undefined, '6—8世纪希腊语或拉丁语史料记录的早期斯拉夫姓名形式')), structure: '史料记录的个人名；不附加基辅罗斯父名或现代东斯拉夫姓氏', sourceClass: 'historical' },
  baltic: { label: '立陶宛', periods: [p('medieval', '中世纪立陶宛大公国'), p('early-modern', '近世立陶宛'), p('modern', '现代立陶宛')], surnames: ['Kazlauskas', 'Jankauskas', 'Petrauskas', 'Stankevičius', 'Vasiliauskas', 'Žukauskas', 'Butkus', 'Paulauskas', 'Urbonas', 'Kavaliauskas'].map((name) => person(name)), given: [...['Vytautas', 'Mindaugas', 'Gediminas', 'Algirdas', 'Kęstutis', 'Jonas', 'Mantas', 'Tadas', 'Lukas', 'Dominykas'].map((name) => person(name, 'male')), ...['Birutė', 'Morta', 'Aldona', 'Ona', 'Rūta', 'Eglė', 'Gabija', 'Ieva', 'Austėja', 'Ugnė'].map((name) => person(name, 'female'))], structure: '中世纪以个人名为主；近世及现代为名 + 具有性别形式的立陶宛家族姓', sourceClass: 'historical' },
  balkan: { label: '塞尔维亚', periods: [p('medieval', '中世纪塞尔维亚'), p('ottoman', '奥斯曼统治与革命时期塞尔维亚'), p('modern', '现代塞尔维亚')], surnames: ['Jovanović', 'Petrović', 'Nikolić', 'Marković', 'Đorđević', 'Stojanović', 'Ilić', 'Stanković', 'Pavlović', 'Milošević', 'Savić', 'Popović', 'Živković', 'Lukić', 'Ristić', 'Radić', 'Kovačević', 'Tomić', 'Đurić', 'Stevanović'].map((name) => person(name)), given: [...['Luka', 'Stefan', 'Lazar', 'Nikola', 'Miloš', 'Marko', 'Nemanja', 'Aleksandar'].map((name) => person(name, 'male')), ...['Milica', 'Jelena', 'Ana', 'Marija', 'Teodora', 'Sofija', 'Katarina', 'Jovana'].map((name) => person(name, 'female'))], structure: '中世纪和奥斯曼统治时期使用个人名 + 父名/别称；现代为名 + 固定家族姓', sourceClass: 'historical' },
  caucasus: { label: '奥塞梯/阿兰', periods: [p('alanian', '阿兰王国与奥塞梯版纳尔特传统'), p('imperial', '俄国统治时期奥塞梯'), p('modern', '现代奥塞梯')], surnames: ['Khetagurov', 'Gagloyev', 'Tibilov', 'Sanakoyev', 'Dzhioyev', 'Pliev', 'Kabisov', 'Tsarakhov', 'Dzagurov', 'Kesaev', 'Gazdanov', 'Dzasokhov', 'Mamsurov', 'Tedeyev', 'Totoonov'].map((name) => person(name)), given: [...['Alan', 'Akhsar', 'Akhsartag', 'Batraz', 'Soslan', 'Atsamaz', 'Uruzmag', 'Khetag', 'Taimuraz', 'Kazbek'].map((name) => person(name, 'male')), ...['Zarina', 'Agunda', 'Dzerassa', 'Satana', 'Azau', 'Zalina', 'Madina', 'Fatima', 'Zarema', 'Alana'].map((name) => person(name, 'female'))], structure: '阿兰史料名与奥塞梯版纳尔特角色名不套后世固定姓；近现代为名 + 具有性别形式的奥塞梯家族姓', sourceClass: 'historical' },
  kurdish: { label: '库尔德', periods: [p('medieval', '中世纪'), p('emirate', '埃米尔时期'), p('modern', '现代')], surnames: ['Barzani', 'Husseini', 'Khan', 'Qaderi', 'Rashid', 'Soran', 'Hewleri', 'Zagrosi'].map((name) => person(name)), given: [...['Azad', 'Baran', 'Dara', 'Haval', 'Karwan', 'Rojhat', 'Soran', 'Zana'].map((name) => person(name, 'male')), ...['Avin', 'Berfin', 'Dilan', 'Hevi', 'Rojin', 'Shilan', 'Viyan', 'Zelal'].map((name) => person(name, 'female'))], structure: '名 + 家族/部族/地域名；库尔德语地区传统', sourceClass: 'historical' },
  'tamil-telugu': { label: '泰米尔/泰卢固', periods: [p('ancient', '古代'), p('medieval', '中世纪'), p('modern', '现代')], surnames: ['Iyer', 'Pillai', 'Chettiar', 'Reddy', 'Naidu', 'Gowda', 'Nair', 'Menon'].map((name) => person(name)), given: [...['Aravind', 'Kannan', 'Karthik', 'Madhavan', 'Ravi', 'Srinivas', 'Venkatesh', 'Vijay'].map((name) => person(name, 'male')), ...['Ammu', 'Anitha', 'Kavya', 'Meena', 'Nandini', 'Priya', 'Revathi', 'Sowmya'].map((name) => person(name, 'female'))], structure: '名 + 父名/家族名；南印度语言区结构差异明显', sourceClass: 'historical' },
  'javanese-sundanese': { label: '爪哇/巽他', periods: [p('majapahit', '满者伯夷时期'), p('sultanate', '苏丹时期'), p('modern', '现代')], surnames: [], given: [...['Aditya', 'Bima', 'Darma', 'Joko', 'Raden', 'Surya', 'Wira', 'Yuda'].map((name) => person(name, 'male')), ...['Ayu', 'Citra', 'Dewi', 'Indah', 'Kartika', 'Lestari', 'Ratih', 'Sari'].map((name) => person(name, 'female'))], structure: '常无固定家族姓；爪哇敬称、阶层和单名传统重要', sourceClass: 'historical' },
  'oromo-shona': { label: '奥罗莫/绍纳', periods: [p('kingdoms', '王国时期'), p('colonial', '近代'), p('modern', '现代')], surnames: ['Bekele', 'Desta', 'Girma', 'Moyo', 'Ncube', 'Sibanda', 'Tadesse', 'Zondo'].map((name) => person(name)), given: [...['Abebe', 'Chibwe', 'Dawit', 'Kebede', 'Mandla', 'Tendai', 'Tewodros', 'Zuberi'].map((name) => person(name, 'male')), ...['Almaz', 'Emebet', 'Makda', 'Meryem', 'Nokuthula', 'Rudo', 'Selam', 'Tsitsi'].map((name) => person(name, 'female'))], structure: '名 + 父名/家族名；奥罗莫与绍纳不可视为单一民族', sourceClass: 'historical' },
  amazonian: { label: '亚马孙流域', periods: [p('precontact', '接触前时期'), p('colonial', '殖民时期'), p('modern', '现代')], surnames: ['Arana', 'Mendoza', 'Tupinamba', 'Yawanawa', 'Guarani', 'da Silva'].map((name) => person(name)), given: [...['Aru', 'Cauã', 'Iva', 'Kauê', 'Napo', 'Tupã', 'Yari', 'Yuma'].map((name) => person(name, 'male')), ...['Aira', 'Iara', 'Ima', 'Jaci', 'Naiara', 'Potira', 'Tainá', 'Yara'].map((name) => person(name, 'female'))], structure: '具体民族差异极大；应先指定河域或民族，再选择名称', sourceClass: 'historical' },
  polish: { label: '波兰', periods: [p('medieval', '中世纪'), p('early-modern', '近世'), p('modern', '现代')], surnames: ['Kowalski', 'Nowak', 'Wisniewski', 'Wojcik', 'Kaminski', 'Zielinski', 'Szymanski', 'Dabrowski'].map((name) => person(name)), given: [...['Boleslaw', 'Kazimierz', 'Mieszko', 'Wladyslaw', 'Jan', 'Michal', 'Piotr', 'Stanislaw'].map((name) => person(name, 'male')), ...['Agnieszka', 'Barbara', 'Elzbieta', 'Jadwiga', 'Katarzyna', 'Malgorzata', 'Zofia', 'Irena'].map((name) => person(name, 'female'))], structure: '名 + 家族姓；波兰语姓名常有性别词尾变化', sourceClass: 'historical' },
  hungarian: { label: '匈牙利', periods: [p('medieval', '中世纪'), p('early-modern', '近世'), p('modern', '现代')], surnames: ['Nagy', 'Kovacs', 'Toth', 'Szabo', 'Horvath', 'Varga', 'Kiss', 'Molnar'].map((name) => person(name)), given: [...['Andras', 'Bela', 'Ferenc', 'Gabor', 'Istvan', 'Laszlo', 'Miklos', 'Zoltan'].map((name) => person(name, 'male')), ...['Agnes', 'Anna', 'Erzsebet', 'Ilona', 'Katalin', 'Rozalia', 'Eszter', 'Judit'].map((name) => person(name, 'female'))], structure: '家族姓 + 名；匈牙利语姓名顺序与多数欧洲语言相反', sourceClass: 'historical' },
  armenian: { label: '亚美尼亚', periods: [p('medieval', '中世纪'), p('kingdom', '王国时期'), p('modern', '现代')], surnames: ['Grigoryan', 'Petrosyan', 'Sargsyan', 'Hakobyan', 'Karapetyan', 'Manukyan', 'Mkrtchyan', 'Hovhannisyan'].map((name) => person(name)), given: [...['Aram', 'Ashot', 'Gagik', 'Hagop', 'Levon', 'Tigran', 'Vardan', 'Vazgen'].map((name) => person(name, 'male')), ...['Anahit', 'Arpine', 'Hasmik', 'Lusine', 'Mariam', 'Narine', 'Siranush', 'Tatevik'].map((name) => person(name, 'female'))], structure: '名 + -yan 家族姓；亚美尼亚教会和高加索传统', sourceClass: 'historical' },
  georgian: { label: '格鲁吉亚', periods: [p('medieval', '中世纪'), p('kingdom', '王国时期'), p('modern', '现代')], surnames: ['Beridze', 'Kapanadze', 'Maisuradze', 'Gelashvili', 'Tsiklauri', 'Japaridze', 'Chikovani', 'Dadiani'].map((name) => person(name)), given: [...['Besarion', 'Davit', 'Giorgi', 'Irakli', 'Levan', 'Revaz', 'Shota', 'Vakhtang'].map((name) => person(name, 'male')), ...['Elene', 'Ketevan', 'Mariam', 'Natia', 'Nino', 'Rusudan', 'Salome', 'Tamar'].map((name) => person(name, 'female'))], structure: '名 + 家族姓；-shvili/-dze 等姓氏后缀具有地域特征', sourceClass: 'historical' },
  'marathi-gujarati': { label: '马拉地/古吉拉特', periods: [p('medieval', '中世纪'), p('maratha', '马拉地时期'), p('modern', '现代')], surnames: ['Patil', 'Deshmukh', 'Joshi', 'Kulkarni', 'Shah', 'Mehta', 'Desai', 'Parekh'].map((name) => person(name)), given: [...['Abhijit', 'Dattatreya', 'Harish', 'Mahesh', 'Nilesh', 'Ramesh', 'Sanjay', 'Vishal'].map((name) => person(name, 'male')), ...['Asha', 'Bhakti', 'Hetal', 'Kavita', 'Madhuri', 'Pallavi', 'Rekha', 'Snehal'].map((name) => person(name, 'female'))], structure: '名 + 社群/职业姓；马拉地与古吉拉特传统有差异', sourceClass: 'historical' },
  'kannada-malayalam': { label: '卡纳达/马拉雅拉姆', periods: [p('ancient', '古代'), p('medieval', '中世纪'), p('modern', '现代')], surnames: ['Nair', 'Menon', 'Pillai', 'Namboothiri', 'Shetty', 'Rao', 'Hegde', 'Gowda'].map((name) => person(name)), given: [...['Anand', 'Krishna', 'Madhav', 'Prakash', 'Raghav', 'Sandeep', 'Vishwanath', 'Yashwanth'].map((name) => person(name, 'male')), ...['Anjali', 'Deepa', 'Lakshmi', 'Meera', 'Parvathi', 'Shobha', 'Sreedevi', 'Vidya'].map((name) => person(name, 'female'))], structure: '名 + 父名/家族或社群姓；南印度地区结构差异较大', sourceClass: 'historical' },
  malagasy: { label: '马达加斯加', periods: [p('kingdom', '王国时期'), p('colonial', '近代'), p('modern', '现代')], surnames: ['Rakoto', 'Razanakoto', 'Andriamihaja', 'Raharison', 'Randria', 'Raveloson'].map((name) => person(name)), given: [...['Andry', 'Hery', 'Lova', 'Mamy', 'Nirina', 'Solofo', 'Tahina', 'Tiana'].map((name) => person(name, 'male')), ...['Fara', 'Hasina', 'Lalaina', 'Mialy', 'Noro', 'Soa', 'Voahirana', 'Zo'].map((name) => person(name, 'female'))], structure: '名 + 家族名；马达加斯加高地与沿海社群差异', sourceClass: 'historical' },
  'melanesian-australian': { label: '美拉尼西亚/澳洲原住民通用参考', periods: [p('precontact', '接触前时期'), p('colonial', '近代'), p('modern', '现代')], surnames: ['Makoa', 'Tavita', 'Waqa', 'Bai', 'Ngalu', 'Marika'].map((name) => person(name)), given: [...['Bai', 'Jone', 'Koa', 'Lani', 'Maro', 'Tama', 'Waru', 'Yarran'].map((name) => person(name, 'male')), ...['Aila', 'Daku', 'Kiri', 'Mere', 'Nala', 'Tala', 'Wunala', 'Yindi'].map((name) => person(name, 'female'))], structure: '不同岛屿、语言和澳洲原住民族差异极大，仅作通用参考', sourceClass: 'historical' },
  'hebrew-jewish': { label: '希伯来/犹太', periods: [p('biblical', '圣经时期'), p('diaspora', '散居时期'), p('modern', '现代')], surnames: ['Cohen', 'Levi', 'Ben-David', 'Mizrahi', 'Ashkenazi', 'Rosenberg', 'Shapiro', 'Goldberg'].map((name) => person(name)), given: [...['Avraham', 'David', 'Eliyahu', 'Isaac', 'Jacob', 'Mordechai', 'Moshe', 'Yosef'].map((name) => person(name, 'male')), ...['Adina', 'Leah', 'Miriam', 'Rachel', 'Rivka', 'Sarah', 'Tamar', 'Yael'].map((name) => person(name, 'female'))], structure: '名 + 父名/家族姓；圣经、散居与现代希伯来传统不同', sourceClass: 'historical' },
  assyrian: { label: '亚述/美索不达米亚', periods: [p('ancient', '古代亚述'), p('medieval', '中世纪'), p('modern', '现代')], surnames: ['Bet-Mahdi', 'Yacoub', 'Ninos', 'Eshoo', 'Qasha', 'Mikhail'].map((name) => person(name)), given: [...['Ashur', 'Baruch', 'Daniel', 'Ephraim', 'Gabriel', 'Naram', 'Sargon', 'Tammuz'].map((name) => person(name, 'male')), ...['Ator', 'Diana', 'Mariam', 'Nahrain', 'Ruth', 'Shamiram', 'Talia', 'Yasmin'].map((name) => person(name, 'female'))], structure: '名 + 父名/家族名；亚述、叙利亚基督教与美索不达米亚传统', sourceClass: 'historical' },
  romani: { label: '罗姆', periods: [p('medieval', '中世纪迁徙时期'), p('early-modern', '近世'), p('modern', '现代')], surnames: ['Petulengro', 'Boswell', 'Stanescu', 'Demeter', 'Lakatos', 'Markovic'].map((name) => person(name)), given: [...['Ando', 'Baro', 'Dani', 'Janko', 'Miro', 'Sandro', 'Tibor', 'Zoran'].map((name) => person(name, 'male')), ...['Biba', 'Luma', 'Mira', 'Rada', 'Sinti', 'Vera', 'Zlata', 'Zora'].map((name) => person(name, 'female'))], structure: '不同社群差异很大；通常与当地语言和罗姆家族传统结合', sourceClass: 'historical' },
  sami: { label: '萨米', periods: [p('precontact', '接触前时期'), p('traditional', '传统时期'), p('modern', '现代')], surnames: ['Gaup', 'Hætta', 'Kitti', 'Labba', 'Sarak', 'Turi'].map((name) => person(name)), given: [...['Ailu', 'Aslak', 'Biera', 'Elle', 'Johan', 'Lemet', 'Nils', 'Risten'].map((name) => person(name, 'male')), ...['Elle', 'Inga', 'Máret', 'Risten', 'Sunniva', 'Turi', 'Unni', 'Vár'].map((name) => person(name, 'female'))], structure: '名 + 家族/地域标识；萨米各语言群的形式不同', sourceClass: 'historical' },
  'canadian-french': { label: '法裔加拿大', periods: [p('colonial', '殖民时期'), p('confederation', '联邦时期'), p('modern', '现代')], surnames: ['Tremblay', 'Gagnon', 'Roy', 'Côté', 'Bouchard', 'Lefebvre', 'Beaulieu', 'Desjardins'].map((name) => person(name)), given: [...['Antoine', 'Benoit', 'Étienne', 'François', 'Gabriel', 'Jean-Baptiste', 'Louis', 'Rémi'].map((name) => person(name, 'male')), ...['Adele', 'Claudette', 'Émilie', 'Geneviève', 'Lucie', 'Madeleine', 'Suzanne', 'Yvette'].map((name) => person(name, 'female'))], structure: '名 + 法语家族姓；殖民、新法兰西与现代魁北克传统', sourceClass: 'historical' },
  'australian-aboriginal': { label: '澳洲原住民通用参考', periods: [p('precontact', '接触前时期'), p('colonial', '近代'), p('modern', '现代')], surnames: ['Nungurrayi', 'Nakamarra', 'Jampijinpa', 'Tjakamarra', 'Puruntatameri', 'Mabo'].map((name) => person(name)), given: [...['Daku', 'Jirrawun', 'Kumanjayi', 'Marlu', 'Namatjira', 'Wunala'].map((name) => person(name, 'male')), ...['Alinta', 'Kirra', 'Marli', 'Tali', 'Yindi', 'Yurala'].map((name) => person(name, 'female'))], structure: '各语言群、氏族与土地关系差异极大，仅作通用参考', sourceClass: 'historical' },
  finnish: { label: '芬兰', periods: [p('medieval', '中世纪'), p('national', '民族复兴时期'), p('modern', '现代')], surnames: ['Korhonen', 'Virtanen', 'Mäkinen', 'Nieminen', 'Mäkelä', 'Hämäläinen'].map((name) => person(name)), given: [...['Aapo', 'Eero', 'Juhani', 'Kalevi', 'Mikko', 'Tapio'].map((name) => person(name, 'male')), ...['Aino', 'Kaisa', 'Marja', 'Sanni', 'Tuuli', 'Veera'].map((name) => person(name, 'female'))], structure: '名 + 家族姓；芬兰语自然词根与卡累利阿传统', sourceClass: 'historical' },
  'albanian-romanian': { label: '阿尔巴尼亚/罗马尼亚', periods: [p('medieval', '中世纪'), p('ottoman', '奥斯曼时期'), p('modern', '现代')], surnames: ['Popescu', 'Ionescu', 'Hoxha', 'Krasniqi', 'Dumitru', 'Bardhi'].map((name) => person(name)), given: [...['Arben', 'Dritan', 'Ilir', 'Mihai', 'Sorin', 'Vlad'].map((name) => person(name, 'male')), ...['Adelina', 'Elira', 'Ioana', 'Luminita', 'Mirela', 'Teuta'].map((name) => person(name, 'female'))], structure: '名 + 家族姓；阿尔巴尼亚与罗马尼亚应按具体语境细分', sourceClass: 'historical' },
  'amazigh-tuareg': { label: '阿马齐格/图阿雷格', periods: [p('ancient', '古代'), p('caravan', '撒哈拉商路时期'), p('modern', '现代')], surnames: ['Ait Ahmed', 'Ag Alhassane', 'Oulhaj', 'Taziri', 'Idir', 'Aksel'].map((name) => person(name)), given: [...['Aksel', 'Idir', 'Massinissa', 'Mehdi', 'Tayri', 'Yuba'].map((name) => person(name, 'male')), ...['Tafukt', 'Taziri', 'Tanirt', 'Tinhinan', 'Yemma', 'Ziri'].map((name) => person(name, 'female'))], structure: '名 + 部族/父名；阿马齐格、图阿雷格与阿拉伯语影响并存', sourceClass: 'historical' },
  'pashtun-tajik': { label: '普什图/塔吉克', periods: [p('medieval', '中世纪'), p('emirate', '埃米尔时期'), p('modern', '现代')], surnames: ['Ahmadi', 'Khan', 'Qasimi', 'Rahimi', 'Safavi', 'Wali'].map((name) => person(name)), given: [...['Ahmad', 'Farid', 'Hamid', 'Jamal', 'Nawid', 'Zubair'].map((name) => person(name, 'male')), ...['Farzana', 'Gul', 'Laila', 'Mahsa', 'Nasrin', 'Parwana'].map((name) => person(name, 'female'))], structure: '名 + 父名/家族或部族称号；普什图与塔吉克传统不同', sourceClass: 'historical' },
  'nepali-sinhala': { label: '尼泊尔/僧伽罗', periods: [p('ancient', '古代'), p('kingdom', '王国时期'), p('modern', '现代')], surnames: ['Shrestha', 'Gurung', 'Thapa', 'Perera', 'Fernando', 'Jayasinghe'].map((name) => person(name)), given: [...['Arjun', 'Bikash', 'Kamal', 'Nimal', 'Sanjay', 'Suraj'].map((name) => person(name, 'male')), ...['Anjali', 'Chandra', 'Ishara', 'Malini', 'Nisha', 'Sujata'].map((name) => person(name, 'female'))], structure: '名 + 家族/社群姓；尼泊尔与僧伽罗传统不能混作同一结构', sourceClass: 'historical' },
  inuit: { label: '因纽特通用参考', periods: [p('precontact', '接触前时期'), p('historical', '历史时期'), p('modern', '现代')], surnames: ['Aglukkaq', 'Kalla', 'Kauki', 'Nukappiak', 'Qamaniq', 'Sikku'].map((name) => person(name)), given: [...['Aputi', 'Ivalu', 'Nanuq', 'Nutaq', 'Siku', 'Tuktu'].map((name) => person(name, 'male')), ...['Aka', 'Nivi', 'Paniq', 'Sila', 'Tasiq', 'Ula'].map((name) => person(name, 'female'))], structure: '因纽特各语言群与命名习惯差异大，仅作通用参考', sourceClass: 'historical' },
  mapuche: { label: '马普切', periods: [p('precontact', '接触前时期'), p('colonial', '殖民时期'), p('modern', '现代')], surnames: ['Antilef', 'Calfunao', 'Huenchumilla', 'Maripan', 'Nahuelpan', 'Quilapan'].map((name) => person(name)), given: [...['Antu', 'Lautaro', 'Nahuel', 'Rayen', 'Wenu', 'Aukan'].map((name) => person(name, 'male')), ...['Ailen', 'Ayelen', 'Kuyen', 'Likan', 'Millaray', 'Rayen'].map((name) => person(name, 'female'))], structure: '名 + Mapuche 家族姓；马普切语义与土地关系重要', sourceClass: 'historical' },
  'micronesian-fijian': { label: '密克罗尼西亚/斐济', periods: [p('precontact', '接触前时期'), p('chiefdom', '酋邦时期'), p('modern', '现代')], surnames: ['Ratu', 'Tui', 'Katoa', 'Mara', 'Niuma', 'Waqa'].map((name) => person(name)), given: [...['Jone', 'Kelepi', 'Leka', 'Maro', 'Tui', 'Viliame'].map((name) => person(name, 'male')), ...['Adi', 'Litia', 'Mere', 'Salome', 'Tala', 'Vika'].map((name) => person(name, 'female'))], structure: '岛屿与语言群差异极大；密克罗尼西亚和斐济仅作通用参考', sourceClass: 'historical' },
  uyghur: { label: '维吾尔', periods: [p('silk-road', '丝路时期'), p('khanate', '汗国时期'), p('modern', '现代')], surnames: ['Abdulla', 'Memet', 'Tursun', 'Kadir', 'Yusup', 'Ablimit'].map((name) => person(name)), given: [...['Abdukerim', 'Eli', 'Mamat', 'Rahman', 'Sabit', 'Yalkun'].map((name) => person(name, 'male')), ...['Aygul', 'Gulnisa', 'Mahire', 'Munire', 'Ruqiye', 'Zuhre'].map((name) => person(name, 'female'))], structure: '名 + 父名/家族姓；维吾尔语与伊斯兰、绿洲城市传统', sourceClass: 'historical' },
  kazakh: { label: '哈萨克', periods: [p('steppe', '草原时期'), p('khanate', '汗国时期'), p('modern', '现代')], surnames: ['Akhmetov', 'Baimukhanov', 'Nurgaliyev', 'Sarsembayev', 'Tulegenov', 'Zhaksylykov'].map((name) => person(name)), given: [...['Aibek', 'Baurzhan', 'Dauren', 'Erlan', 'Nursultan', 'Serik'].map((name) => person(name, 'male')), ...['Aigerim', 'Aizhan', 'Dana', 'Gulzira', 'Madina', 'Zarina'].map((name) => person(name, 'female'))], structure: '名 + 父名/家族姓；草原氏族与俄语转写并存', sourceClass: 'historical' },
  kyrgyz: { label: '吉尔吉斯', periods: [p('steppe', '草原时期'), p('khanate', '汗国时期'), p('modern', '现代')], surnames: ['Abdiev', 'Aitmatov', 'Isakov', 'Mambetov', 'Sadykov', 'Tursunov'].map((name) => person(name)), given: [...['Azamat', 'Bekbolot', 'Kubanych', 'Manas', 'Nurlan', 'Taalai'].map((name) => person(name, 'male')), ...['Ainura', 'Begimai', 'Cholpon', 'Gulzat', 'Kanykei', 'Meerim'].map((name) => person(name, 'female'))], structure: '名 + 父名/家族姓；吉尔吉斯史诗与游牧传统', sourceClass: 'historical' },
  uzbek: { label: '乌兹别克', periods: [p('timurid', '帖木儿时期'), p('khanate', '汗国时期'), p('modern', '现代')], surnames: ['Karimov', 'Mirzaev', 'Rakhimov', 'Tashpulatov', 'Usmanov', 'Yuldashev'].map((name) => person(name)), given: [...['Akmal', 'Bobur', 'Jasur', 'Kamol', 'Mirzo', 'Sherzod'].map((name) => person(name, 'male')), ...['Dilnoza', 'Gulchehra', 'Malika', 'Nargiza', 'Shahnoza', 'Zebo'].map((name) => person(name, 'female'))], structure: '名 + 家族姓；突厥语、波斯语与绿洲城市传统', sourceClass: 'historical' },
  turkmen: { label: '土库曼', periods: [p('tribal', '部族时期'), p('khanate', '汗国时期'), p('modern', '现代')], surnames: ['Annayev', 'Berdimuhamedov', 'Gurbanov', 'Orazov', 'Saparov', 'Yazov'].map((name) => person(name)), given: [...['Atamyrat', 'Berdy', 'Gurban', 'Myrat', 'Oraz', 'Serdar'].map((name) => person(name, 'male')), ...['Ayna', 'Gulnar', 'Mahri', 'Ogul', 'Shirin', 'Yulduz'].map((name) => person(name, 'female'))], structure: '名 + 家族姓；土库曼部族、织毯和绿洲传统', sourceClass: 'historical' },
  tajik: { label: '塔吉克', periods: [p('samanid', '萨曼王朝时期'), p('emirate', '埃米尔时期'), p('modern', '现代')], surnames: ['Davlatov', 'Karimov', 'Nazarov', 'Rahmonov', 'Safarov', 'Usmonov'].map((name) => person(name)), given: [...['Bahrom', 'Farrukh', 'Jamshid', 'Parviz', 'Rustam', 'Suhrob'].map((name) => person(name, 'male')), ...['Farzona', 'Gulchehra', 'Mahina', 'Nargis', 'Rukhshona', 'Sitora'].map((name) => person(name, 'female'))], structure: '名 + 家族姓；塔吉克波斯语与山地/绿洲传统', sourceClass: 'historical' },
  'navajo-apache': { label: '纳瓦霍/阿帕奇通用参考', periods: [p('precontact', '接触前时期'), p('historical', '历史时期'), p('modern', '现代')], surnames: ['Begay', 'Yazzie', 'Nez', 'Tsosie', 'Goyathlay', 'Mescalero'].map((name) => person(name)), given: [...['Ashkii', 'Bidziil', 'Koda', 'Nantan', 'Taza', 'Waya'].map((name) => person(name, 'male')), ...['Altsoba', 'Ashkii', 'Doli', 'Kachina', 'Nizhoni', 'Tsegi'].map((name) => person(name, 'female'))], structure: '纳瓦霍与阿帕奇差异显著，仅作南阿萨巴斯卡语支参考', sourceClass: 'historical' },
  haudenosaunee: { label: '易洛魁/豪德诺绍尼', periods: [p('precontact', '接触前时期'), p('confederacy', '联盟时期'), p('modern', '现代')], surnames: ['Hill', 'Johnson', 'Sky', 'Thomas', 'White', 'Williams'].map((name) => person(name)), given: [...['Ayonwatha', 'Deganawida', 'Hiawatha', 'Kahionhes', 'Onondaga', 'Tadodaho'].map((name) => person(name, 'male')), ...['Jigonsaseh', 'Kahentawaks', 'Ohsweken', 'Tekonwatonti', 'Teyoninhokarawen', 'Watahonti'].map((name) => person(name, 'female'))], structure: '联盟、氏族和长屋体系相关；不同语言群形式不同', sourceClass: 'historical' },
  pueblo: { label: '普韦布洛', periods: [p('ancestral', '祖先普韦布洛时期'), p('historical', '历史时期'), p('modern', '现代')], surnames: ['Naranjo', 'Pino', 'Tafoya', 'Tewa', 'Vigil', 'Yazzie'].map((name) => person(name)), given: [...['Awan', 'Kachina', 'Kewa', 'Lomahongva', 'Pueblo', 'Tewa'].map((name) => person(name, 'male')), ...['Hopi', 'Kokopelli', 'Lomahongva', 'Mala', 'Sewa', 'Tewa'].map((name) => person(name, 'female'))], structure: '霍皮、祖尼、特瓦等差异很大，仅作普韦布洛文化带参考', sourceClass: 'historical' },
  'northwest-coast': { label: '西北海岸原住民通用参考', periods: [p('precontact', '接触前时期'), p('historical', '历史时期'), p('modern', '现代')], surnames: ['Campbell', 'Joseph', 'Nisga', 'Tait', 'Williams', 'Young'].map((name) => person(name)), given: [...['Kwak', 'Raven', 'Sgaana', 'Taan', 'Tlingit', 'Yax'].map((name) => person(name, 'male')), ...['Cedar', 'Kaya', 'Nika', 'Sgaana', 'Taan', 'Yukon'].map((name) => person(name, 'female'))], structure: '海达人、特林吉特、夸扣特尔等差异极大，仅作区域参考', sourceClass: 'historical' },
  maya: { label: '玛雅', periods: [p('preclassic', '前古典时期'), p('classic', '古典时期'), p('modern', '现代')], surnames: ['Balam', 'Canul', 'Cauich', 'Cetz', 'Pech', 'Xiu'].map((name) => person(name)), given: [...['Ajaw', 'Balam', 'Itzamna', 'Kukulkan', 'Pakal', 'Yaxkin'].map((name) => person(name, 'male')), ...['Ixchel', 'Ixtab', 'Kabah', 'Saknikte', 'Xunaxi', 'Yaxche'].map((name) => person(name, 'female'))], structure: '不同玛雅语言群差异很大；城邦、历法和王名传统重要', sourceClass: 'historical' },
  nahuatl: { label: '纳瓦特尔/阿兹特克', periods: [p('precontact', '前殖民时期'), p('empire', '三方同盟时期'), p('modern', '现代')], surnames: ['Acatl', 'Cuauhtemoc', 'Itzcoatl', 'Motecuhzoma', 'Tenoch', 'Xochitl'].map((name) => person(name)), given: [...['Cipactli', 'Cuauhtli', 'Iztli', 'Ocelotl', 'Tenoch', 'Tlaloc'].map((name) => person(name, 'male')), ...['Atotoztli', 'Citlali', 'Malinalxochitl', 'Miahuatl', 'Xochitl', 'Yaretzi'].map((name) => person(name, 'female'))], structure: '名 + 氏族/家族标识；纳瓦特尔语语义与历法传统重要', sourceClass: 'historical' },
  quechua: { label: '克丘亚', periods: [p('inca', '印加时期'), p('colonial', '殖民时期'), p('modern', '现代')], surnames: ['Ccalla', 'Choque', 'Huaman', 'Quispe', 'Tupac', 'Yupanqui'].map((name) => person(name)), given: [...['Apu', 'Inti', 'Kuntur', 'Rumi', 'Sumaq', 'Tupac'].map((name) => person(name, 'male')), ...['Killa', 'Nayra', 'Qori', 'Sisa', 'Tika', 'Yana'].map((name) => person(name, 'female'))], structure: '名 + 家族/社群姓；克丘亚语言群与印加后殖民传统', sourceClass: 'historical' },
  aymara: { label: '艾马拉', periods: [p('preinca', '前印加时期'), p('colonial', '殖民时期'), p('modern', '现代')], surnames: ['Apaza', 'Choque', 'Condori', 'Mamani', 'Quispe', 'Ticona'].map((name) => person(name)), given: [...['Apu', 'Chuki', 'Illapa', "Jach'a", 'Mallku', 'Qhapaq'].map((name) => person(name, 'male')), ...['Anata', 'Chaska', 'Killa', 'Lupita', 'Suma', 'Wara'].map((name) => person(name, 'female'))], structure: '名 + 家族/社群姓；艾马拉语与高原社区传统', sourceClass: 'historical' },
  'modern-greek': { label: '现代希腊', periods: [p('byzantine', '拜占庭时期'), p('independence', '独立时期'), p('modern', '现代')], surnames: ['Papadopoulos', 'Nikolaidis', 'Georgiou', 'Dimitriou', 'Kostas', 'Vassilis'].map((name) => person(name)), given: [...['Andreas', 'Dimitris', 'Giorgos', 'Kostas', 'Nikos', 'Theodoros'].map((name) => person(name, 'male')), ...['Eleni', 'Katerina', 'Maria', 'Sofia', 'Theodora', 'Vasiliki'].map((name) => person(name, 'female'))], structure: '名 + 家族姓；现代希腊语不同于古希腊名制', sourceClass: 'modern' },
  portuguese: { label: '葡萄牙语区', periods: [p('medieval', '中世纪'), p('colonial', '殖民时期'), p('modern', '现代')], surnames: ['Silva', 'Santos', 'Oliveira', 'Pereira', 'Costa', 'Rodrigues'].map((name) => person(name)), given: [...['Afonso', 'Bruno', 'Diogo', 'João', 'Miguel', 'Tiago'].map((name) => person(name, 'male')), ...['Beatriz', 'Ines', 'Leonor', 'Mariana', 'Rita', 'Sofia'].map((name) => person(name, 'female'))], structure: '名 + 父姓/母姓；葡萄牙与巴西语境可分别选时期', sourceClass: 'historical' },
  balinese: { label: '巴厘', periods: [p('majapahit', '满者伯夷时期'), p('kingdom', '王国时期'), p('modern', '现代')], surnames: [], given: [...['Gede', 'Made', 'Nyoman', 'Ketut', 'Wayan', 'Putu'].map((name) => person(name, 'male')), ...['Ayu', 'Kadek', 'Komang', 'Luh', 'Ni', 'Putu'].map((name) => person(name, 'female'))], structure: '常按出生顺序与性别命名；敬称和阶层语境重要', sourceClass: 'historical' },
  minangkabau: { label: '米南加保', periods: [p('sultanate', '苏丹时期'), p('adat', '习惯法时期'), p('modern', '现代')], surnames: ['Chaniago', 'Koto', 'Piliang', 'Sikumbang', 'Tanjung', 'Melayu'].map((name) => person(name)), given: [...['Fauzan', 'Rajo', 'Rizki', 'Sutan', 'Yusuf', 'Zainal'].map((name) => person(name, 'male')), ...['Andam', 'Bundo', 'Citra', 'Mutiara', 'Puti', 'Rani'].map((name) => person(name, 'female'))], structure: '名 + 母系氏族名；米南加保母系社会传统', sourceClass: 'historical' },
  akan: { label: '阿肯', periods: [p('kingdoms', '王国时期'), p('colonial', '近代'), p('modern', '现代')], surnames: ['Agyeman', 'Asante', 'Boateng', 'Mensah', 'Owusu', 'Tetteh'].map((name) => person(name)), given: [...['Kofi', 'Kwaku', 'Kwame', 'Kwesi', 'Yaw', 'Yao'].map((name) => person(name, 'male')), ...['Abena', 'Adwoa', 'Afia', 'Akosua', 'Ama', 'Yaa'].map((name) => person(name, 'female'))], structure: '出生日名 + 家族名；阿肯日名传统不可与伊博混同', sourceClass: 'historical' },
  igbo: { label: '伊博', periods: [p('kingdoms', '王国时期'), p('colonial', '近代'), p('modern', '现代')], surnames: ['Eze', 'Nwosu', 'Obi', 'Okafor', 'Okoye', 'Ude'].map((name) => person(name)), given: [...['Chibuzo', 'Chukwuemeka', 'Ifeanyi', 'Obinna', 'Uche', 'Ugochukwu'].map((name) => person(name, 'male')), ...['Adaeze', 'Amara', 'Chiamaka', 'Ifeoma', 'Ngozi', 'Nneka'].map((name) => person(name, 'female'))], structure: '语义名 + 家族名；伊博语宗教与家庭关系语义明显', sourceClass: 'historical' },
  hausa: { label: '豪萨', periods: [p('sahel', '萨赫勒传统时期'), p('emirate', '埃米尔时期'), p('modern', '现代')], surnames: ['Abubakar', 'Danjuma', 'Garba', 'Sani', 'Yahaya', 'Zubairu'].map((name) => person(name)), given: [...['Adamu', 'Bashir', 'Haruna', 'Musa', 'Sule', 'Umar'].map((name) => person(name, 'male')), ...['Aisha', 'Binta', 'Fadima', 'Hauwa', 'Rukayya', 'Zainab'].map((name) => person(name, 'female'))], structure: '名 + 父名/家族名；豪萨城邦与伊斯兰传统', sourceClass: 'historical' },
  fulani: { label: '富拉尼', periods: [p('pastoral', '游牧传统时期'), p('emirate', '埃米尔时期'), p('modern', '现代')], surnames: ['Bah', 'Diallo', 'Jallow', 'Sow', 'Sy', 'Wane'].map((name) => person(name)), given: [...['Amadou', 'Boubacar', 'Ibrahima', 'Mamadou', 'Ousmane', 'Seydou'].map((name) => person(name, 'male')), ...['Aissatou', 'Aminata', 'Binta', 'Fatou', 'Mariama', 'Penda'].map((name) => person(name, 'female'))], structure: '名 + 家族名；富拉尼牧畜、迁徙与伊斯兰传统', sourceClass: 'historical' },
  wolof: { label: '沃洛夫', periods: [p('kingdoms', '王国时期'), p('colonial', '近代'), p('modern', '现代')], surnames: ['Diop', 'Fall', 'Ndiaye', 'Sarr', 'Seck', 'Thiam'].map((name) => person(name)), given: [...['Babacar', 'Cheikh', 'Ibrahima', 'Mamadou', 'Moussa', 'Pape'].map((name) => person(name, 'male')), ...['Aminata', 'Coumba', 'Dieynaba', 'Fatou', 'Mame', 'Ndeye'].map((name) => person(name, 'female'))], structure: '名 + 家族姓；塞内冈比亚与沃洛夫社会传统', sourceClass: 'historical' },
  kongo: { label: '刚果文化带', periods: [p('kingdoms', '刚果王国时期'), p('colonial', '近代'), p('modern', '现代')], surnames: ['Kabila', 'Kalala', 'Lukusa', 'Mbemba', 'Mbuyi', 'Nsakala'].map((name) => person(name)), given: [...['Banza', 'Kiala', 'Kimbangu', 'Lukeni', 'Mwene', 'Nzinga'].map((name) => person(name, 'male')), ...['Beti', 'Kadi', 'Lemba', 'Mabiala', 'Mpemba', 'Nsimba'].map((name) => person(name, 'female'))], structure: '名 + 家族名；刚果语族文化带差异仍需按民族细化', sourceClass: 'historical' },
  azerbaijani: { label: '阿塞拜疆', periods: [p('medieval', '中世纪'), p('khanate', '汗国时期'), p('modern', '现代')], surnames: ['Aliyev', 'Huseynov', 'Mammadov', 'Rahimov', 'Safarov', 'Valiyev'].map((name) => person(name)), given: [...['Aydin', 'Elchin', 'Farhad', 'Kamran', 'Rashad', 'Tural'].map((name) => person(name, 'male')), ...['Aygun', 'Gulnar', 'Leyla', 'Nargiz', 'Sevda', 'Zahra'].map((name) => person(name, 'female'))], structure: '名 + 家族姓；突厥语、波斯语与高加索传统交汇', sourceClass: 'historical' },
  'chechen-dagestan': { label: '车臣/达吉斯坦通用参考', periods: [p('mountain', '山地传统时期'), p('imperial', '帝国时期'), p('modern', '现代')], surnames: ['Akhmadov', 'Gadzhiev', 'Kadyrov', 'Magomedov', 'Umarov', 'Yusupov'].map((name) => person(name)), given: [...['Aslan', 'Dzhabrail', 'Khamzat', 'Murat', 'Shamil', 'Zelimkhan'].map((name) => person(name, 'male')), ...['Aminat', 'Aset', 'Khadizhat', 'Madinat', 'Patimat', 'Zarema'].map((name) => person(name, 'female'))], structure: '多山地民族差异极大，仅作东北高加索通用参考', sourceClass: 'historical' },
  hawaiian: { label: '夏威夷', periods: [p('precontact', '接触前时期'), p('kingdom', '王国时期'), p('modern', '现代')], surnames: ['Kamehameha', 'Kahele', 'Kahale', 'Kealoha', 'Pua', 'Wong'].map((name) => person(name)), given: [...['Ikaika', 'Kaleo', 'Keanu', 'Koa', 'Makai', 'Nalu'].map((name) => person(name, 'male')), ...['Anuhea', 'Halia', 'Kailani', 'Leilani', 'Malia', 'Noelani'].map((name) => person(name, 'female'))], structure: '名 + 家族名；夏威夷语自然与亲属语义重要', sourceClass: 'historical' },
  'samoan-tongan': { label: '萨摩亚/汤加', periods: [p('precontact', '接触前时期'), p('chiefdom', '酋邦时期'), p('modern', '现代')], surnames: ['Fale', 'Fonua', 'Latu', 'Mafile', 'Tupou', 'Vaea'].map((name) => person(name)), given: [...['Fetu', 'Lasoani', 'Manu', 'Sione', 'Tavita', 'Tui'].map((name) => person(name, 'male')), ...['Alisi', 'Fia', 'Lasoani', 'Mele', 'Sina', 'Tala'].map((name) => person(name, 'female'))], structure: '名 + 家族/酋邦语境；萨摩亚与汤加需按岛屿继续细化', sourceClass: 'historical' },
  'dong-son-au-lac': { label: '红河流域（东山—瓯雒）', periods: [p('archaeological', '东山文化与瓯雒（约前600—前111年，考古参考）', 'archaeological')], surnames: [], given: [], structure: '文字资料不足，不生成未经证实的个人姓名', sourceClass: 'historical' },
  'sa-huynh-champa': { label: '越南中部（沙黄—早期占婆）', periods: [p('sa-huynh', '沙黄文化（约前1000—公元200年，考古参考）', 'archaeological'), p('early-champa', '林邑与早期占婆（约2—7世纪）')], surnames: [], given: [], structure: '沙黄层不生成人名；早期占婆使用碑铭所见单名、王号或梵语名', sourceClass: 'historical' },
  'funan-chenla': { label: '湄公河下游（扶南—真腊）', periods: [p('funan', '扶南（约1—6世纪）'), p('chenla', '真腊（约6—8世纪）')], surnames: [], given: [], structure: '使用汉文记载或碑铭所见个人名、王号；不添加现代高棉或越南姓氏', sourceClass: 'historical' },
  'pyu-city-states': { label: '伊洛瓦底江流域（骠人城邦）', periods: [p('pyu', '骠人城邦（约2世纪前后—9世纪）')], surnames: [], given: [], structure: '使用骠文、梵文或巴利文铭文所见名号；不套用蒲甘以后缅甸姓名', sourceClass: 'historical' },
  'dvaravati-mon': { label: '湄南河流域（堕罗钵底—孟人）', periods: [p('dvaravati', '堕罗钵底与早期孟人城邦（约6—11世纪）', 'archaeological')], surnames: [], given: [], structure: '个人姓名材料不足时只提供考古与制度参考，不套用现代泰国姓名', sourceClass: 'historical' },
  'old-malay-srivijaya': { label: '古马来（古吉打—室利佛逝）', periods: [p('kedah', '古吉打与马来半岛港市（约2—7世纪）', 'archaeological'), p('srivijaya', '室利佛逝（约7—13世纪）')], surnames: [], given: [], structure: '使用古马来语、梵语碑铭名号；不使用伊斯兰式 bin/binti', sourceClass: 'historical' },
  'old-javanese-medang': { label: '古爪哇（诃陵—马打兰）', periods: [p('kalingga', '诃陵与早期爪哇（约5—8世纪）'), p('medang', '古马打兰—卡胡里潘（约8—11世纪）')], surnames: [], given: [], structure: '使用古爪哇碑铭所见名号、头衔或单名；不套用现代爪哇姓名', sourceClass: 'historical' },
  'old-bali': { label: '古巴厘（佩坚—瓦尔马德瓦）', periods: [p('pejeng', '佩坚青铜文化（考古参考）', 'archaeological'), p('warmadewa', '古巴厘与瓦尔马德瓦王朝（约9—11世纪）')], surnames: [], given: [], structure: '佩坚层不生成人名；王朝期使用碑铭名号，不套用后世出生顺序名', sourceClass: 'historical' },
  ...ancientCultureConfigs,
}

// Broad modern labels are not projected backwards into periods where the
// language, polity, and naming structure were materially different.
cultures.chinese = {
  ...cultures.chinese,
  label: '中国（华夏—汉文化）',
  periods: [
    p('paleolithic-reference', '中国旧石器时代（约前170万—前1万年，考古参考）', 'archaeological'),
    p('neolithic-reference', '中国新石器时代文化群（约前1万—前1900年，考古参考）', 'archaeological'),
    p('xia-erlitou', '夏与二里头文化（约前2070—前1600年，考古与文献参照）', 'archaeological'),
    p('shang-western-zhou', '商与西周（约前1600—前771年）'),
    p('eastern-zhou', '春秋战国（前770—前221年）'),
    p('qin-han', '秦汉（前221—220年）'),
    p('wei-jin-tang', '魏晋隋唐'), p('song-yuan', '宋元'), p('ming-qing', '明清'),
    p('republic', '民国'), p('modern', '现代'),
  ],
  structure: '商周使用实证个人名、氏族或国族标识；秦汉以后为姓 + 名',
}
cultures.japanese = {
  ...cultures.japanese,
  label: '日本列岛',
  periods: [...ancientCultureConfigs['prehistoric-japan'].periods, ...cultures.japanese.periods],
  structure: '绳文至古坟期使用考古资料、汉文史籍或早期王名；飞鸟以后按所选时代使用相应姓名结构，不向早期投射现代姓氏',
}
cultures.korean = {
  ...cultures.korean,
  label: '朝鲜半岛',
  periods: [...ancientCultureConfigs['early-korea'].periods, ...cultures.korean.periods],
  structure: '栉文至三韩期使用考古资料、汉文史籍所见名号或明确标注的传说人物；三国以后按所选时代使用相应姓名结构，不向早期投射后世姓氏',
}
cultures['india-north'] = {
  ...cultures['india-north'],
  label: '北印度（恒河—印度河历史区）',
  periods: [p('vedic-mahajanapada', '吠陀晚期与十六大国（约前800—前321年）'), p('maurya-gupta', '孔雀—笈多时期（约前321—公元550年）'), p('medieval', '中世纪北印度'), p('modern', '现代北印度')],
  structure: '古代使用个人名、父名、母名或族属标识；现代才使用对应社群的固定姓氏',
}
cultures['india-south'] = {
  ...cultures['india-south'],
  label: '南印度（早期泰米尔—德干）',
  periods: [p('sangam-satavahana', '桑伽姆—萨塔瓦哈纳时期（约前300—公元300年）'), p('early-kingdoms', '早期南印度王国（约300—900年）'), p('medieval', '中世纪南印度'), p('modern', '现代南印度')],
  structure: '古代使用个人名、父名、王朝或出生地标识；现代姓名结构按具体语言区处理',
}
cultures.bengali = {
  ...cultures.bengali,
  label: '孟加拉（古代—现代）',
  periods: [p('vanga-gauda', '文伽—高达古代孟加拉（约前300—公元750年）'), p('pala', '波罗时期'), p('sultanate', '苏丹时期'), p('modern', '现代孟加拉')],
}
cultures['punjabi-urdu'] = {
  ...cultures['punjabi-urdu'],
  label: '旁遮普/乌尔都（中古以后）',
  periods: [p('sultanate', '苏丹时期'), p('mughal', '莫卧儿时期'), p('modern', '现代旁遮普/乌尔都语区')],
}
cultures['marathi-gujarati'] = {
  ...cultures['marathi-gujarati'],
  label: '马拉地/古吉拉特（西印度与德干）',
  periods: [p('satavahana-western-deccan', '萨塔瓦哈纳—西部刹帝利古代德干（约前100—公元400年）'), p('medieval', '中世纪西印度'), p('maratha', '马拉地时期'), p('modern', '现代西印度')],
}

const cultureRegions: Record<OfflineCulture, string> = {
  chinese: '东亚', japanese: '东亚', korean: '东亚', mongolian: '东亚', tibetan: '东亚',
  'russian-siberian': '北亚与中亚', 'turkic-central-asian': '北亚与中亚',
  'india-north': '南亚', 'india-south': '南亚',
  vietnamese: '东南亚', thai: '东南亚', malay: '东南亚', filipino: '东南亚',
  arabic: '西亚与高加索', persian: '西亚与高加索',
  english: '欧洲', french: '欧洲', german: '欧洲', italian: '欧洲', iberian: '欧洲', norse: '欧洲', icelandic: '欧洲', celtic: '欧洲', 'slavic-east': '欧洲', 'ancient-greek': '欧洲', 'ancient-rome': '欧洲',
  egyptian: '非洲', yoruba: '非洲', amharic: '非洲', swahili: '非洲', 'zulu-xhosa': '非洲', 'hausa-fulani': '非洲',
  'north-american': '北美', 'indigenous-north-american': '北美', mesoamerican: '中美洲', andean: '南美洲',
  polynesian: '大洋洲',
  manchu: '东亚', burmese: '东南亚', 'khmer-lao': '东南亚', bengali: '南亚', 'punjabi-urdu': '南亚', 'ottoman-turkish': '西亚与高加索',
  somali: '非洲', 'igbo-akan': '非洲', 'brazilian-tupi': '南美洲', caribbean: '北美', maori: '大洋洲',
  'dutch-lowlands': '欧洲', 'roman-low-countries': '欧洲', 'early-slavic': '欧洲', baltic: '欧洲', balkan: '欧洲', caucasus: '西亚与高加索', kurdish: '西亚与高加索', 'tamil-telugu': '南亚', 'javanese-sundanese': '东南亚', 'oromo-shona': '非洲', amazonian: '南美洲',
  polish: '欧洲', hungarian: '欧洲', armenian: '西亚与高加索', georgian: '西亚与高加索', 'marathi-gujarati': '南亚', 'kannada-malayalam': '南亚', malagasy: '非洲', 'melanesian-australian': '大洋洲',
  'hebrew-jewish': '西亚与高加索', assyrian: '西亚与高加索', romani: '欧洲', sami: '北亚与中亚', 'canadian-french': '北美', 'australian-aboriginal': '大洋洲',
  finnish: '欧洲', 'albanian-romanian': '欧洲', 'amazigh-tuareg': '非洲', 'pashtun-tajik': '北亚与中亚', 'nepali-sinhala': '南亚', inuit: '北美', mapuche: '南美洲', 'micronesian-fijian': '大洋洲',
  uyghur: '北亚与中亚', kazakh: '北亚与中亚', kyrgyz: '北亚与中亚', uzbek: '北亚与中亚', turkmen: '北亚与中亚', tajik: '北亚与中亚', 'navajo-apache': '北美', haudenosaunee: '北美', pueblo: '北美', 'northwest-coast': '北美', maya: '中美洲', nahuatl: '中美洲', quechua: '南美洲', aymara: '南美洲',
  'modern-greek': '欧洲', portuguese: '欧洲', balinese: '东南亚', minangkabau: '东南亚', akan: '非洲', igbo: '非洲', hausa: '非洲', fulani: '非洲', wolof: '非洲', kongo: '非洲', azerbaijani: '西亚与高加索', 'chechen-dagestan': '西亚与高加索', hawaiian: '大洋洲', 'samoan-tongan': '大洋洲',
  'dong-son-au-lac': '东南亚', 'sa-huynh-champa': '东南亚', 'funan-chenla': '东南亚', 'pyu-city-states': '东南亚', 'dvaravati-mon': '东南亚', 'old-malay-srivijaya': '东南亚', 'old-javanese-medang': '东南亚', 'old-bali': '东南亚',
  ...ancientCultureRegions,
}

const sexed = (male: string[], female: string[], maleReadings: Record<string, string> = {}, femaleReadings: Record<string, string> = {}) => [
  ...male.map((name) => person(name, 'male', maleReadings[name])),
  ...female.map((name) => person(name, 'female', femaleReadings[name])),
]

const localizedTokens: Record<string, string> = Object.fromEntries(`William=威廉
Henry=亨利
Edward=爱德华
Thomas=托马斯
John=约翰
George=乔治
Arthur=亚瑟
Richard=理查德
James=詹姆斯
Robert=罗伯特
Charles=查尔斯
Alfred=阿尔弗雷德
Edmund=埃德蒙
Philip=菲利普
Oliver=奥利弗
Noah=诺亚
Harry=哈里
Jack=杰克
Leo=利奥
Oscar=奥斯卡
Theodore=西奥多
Freddie=弗雷迪
Archie=阿奇
Charlie=查理
Alfie=阿尔菲
Finley=芬利
Benjamin=本杰明
Alice=爱丽丝
Eleanor=埃莉诺
Elizabeth=伊丽莎白
Margaret=玛格丽特
Anne=安妮
Catherine=凯瑟琳
Jane=简
Mary=玛丽
Lucy=露西
Emma=艾玛
Charlotte=夏洛特
Rose=罗丝
Clara=克拉拉
Helen=海伦
Grace=格蕾丝
Ella=艾拉
Ivy=艾薇
Freya=芙蕾雅
Evie=伊薇
Poppy=波比
Isabella=伊莎贝拉
Florence=弗洛伦丝
Willow=薇洛
Beatrice=比阿特丽斯
Amelia=阿米莉娅
Olivia=奥利维娅
Isla=艾拉
Ava=艾娃
Mia=米娅
Lily=莉莉
Sophia=索菲娅
Smith=史密斯
Taylor=泰勒
Brown=布朗
Wilson=威尔逊
Davies=戴维斯
Evans=埃文斯
Roberts=罗伯茨
Johnson=约翰逊
Williams=威廉姆斯
Jones=琼斯
Miller=米勒
Anderson=安德森
White=怀特
Harris=哈里斯
Martin=马丁
Thompson=汤普森
Walker=沃克
Clark=克拉克
Lewis=刘易斯
Hall=霍尔
Young=杨
King=金
Wright=莱特
Green=格林
Baker=贝克
Hill=希尔
Wood=伍德
Scott=斯科特
Turner=特纳
Jean=让
Pierre=皮埃尔
Louis=路易
Henri=亨利
Antoine=安托万
François=弗朗索瓦
Étienne=艾蒂安
Hugo=雨果
Gabriel=加布里埃尔
Julien=朱利安
Marie=玛丽
Jeanne=让娜
Élise=埃莉丝
Madeleine=玛德琳
Colette=科莱特
Guillaume=纪尧姆
Geoffroi=若弗鲁瓦
Philippe=菲利普
Isabelle=伊莎贝尔
Aliénor=埃莉诺
Agnès=阿涅丝
Mathilde=玛蒂尔德
Müller=米勒
Schmidt=施密特
Schneider=施奈德
Fischer=菲舍尔
Weber=韦伯
Meyer=迈耶
Wagner=瓦格纳
Becker=贝克尔
Schulz=舒尔茨
Hoffmann=霍夫曼
Koch=科赫
Bauer=鲍尔
Richter=里希特
Klein=克莱因
Wolf=沃尔夫
Johann=约翰
Hans=汉斯
Friedrich=腓特烈
Wilhelm=威廉
Heinrich=海因里希
Karl=卡尔
Otto=奥托
Konrad=康拉德
Georg=格奥尔格
Ludwig=路德维希
Ernst=恩斯特
Maximilian=马克西米利安
Anna=安娜
Greta=格丽塔
Elisabeth=伊丽莎白
Margarete=玛格丽特
Sophie=索菲
Rossi=罗西
Russo=鲁索
Ferrari=费拉里
Esposito=埃斯波西托
Bianchi=比安基
Romano=罗马诺
Colombo=科伦坡
Ricci=里奇
Marino=马里诺
Greco=格雷科
Bruno=布鲁诺
Gallo=加洛
Conti=孔蒂
Mancini=曼奇尼
Costa=科斯塔
Giordano=乔尔达诺
Giovanni=乔瓦尼
Marco=马尔科
Luca=卢卡
Matteo=马泰奥
Francesco=弗朗切斯科
Leonardo=莱昂纳多
Alessandro=亚历山德罗
Dante=但丁
Paolo=保罗
Antonio=安东尼奥
Pietro=彼得罗
Giuseppe=朱塞佩
Lucia=露琪亚
Sofia=索菲娅
Beatrice=贝娅特丽切
Giulia=朱莉娅
Caterina=卡特琳娜
Elena=埃莱娜
Chiara=基娅拉
García=加西亚
Fernández=费尔南德斯
González=冈萨雷斯
Rodríguez=罗德里格斯
López=洛佩斯
Martínez=马丁内斯
Sánchez=桑切斯
Pérez=佩雷斯
Gómez=戈麦斯
Díaz=迪亚斯
Hernández=埃尔南德斯
Ruiz=鲁伊斯
Jiménez=希梅内斯
Moreno=莫雷诺
Navarro=纳瓦罗
Alonso=阿隆索
Romero=罗梅罗
Torres=托雷斯
Silva=席尔瓦
Santos=桑托斯
Juan=胡安
Carlos=卡洛斯
Miguel=米格尔
Diego=迭戈
Fernando=费尔南多
Alfonso=阿方索
Rodrigo=罗德里戈
Javier=哈维尔
Luis=路易斯
José=何塞
Hugo=雨果
Martín=马丁
Lucía=露西亚
Martina=玛蒂娜
Paula=宝拉
Erik=埃里克
Leif=莱夫
Bjorn=比约恩
Harald=哈拉尔德
Sven=斯文
Knut=克努特
Ragnar=拉格纳
Olaf=奥拉夫
Gunnar=贡纳尔
Ivar=伊瓦尔
Astrid=阿斯特丽德
Freydis=弗蕾迪丝
Sigrid=西格丽德
Ingrid=英格丽德
Thyra=蒂拉
Solveig=索尔薇格
Lars=拉尔斯
Anders=安德斯
Johan=约翰
Emil=埃米尔
Elsa=艾尔莎
Maja=玛雅
Nora=诺拉
Jón=约恩
Gunnarsson=贡纳尔松
Jónsson=约恩松
Magnús=马格努斯
Einar=埃纳尔
Ólafur=奥拉维尔
Björn=比约恩
Sigríður=西格丽德
Guðrún=古德伦
Jónína=约妮娜
Elín=埃琳
Ramesses=拉美西斯
Thutmose=图特摩斯
Amenhotep=阿蒙霍特普
Akhenaten=阿肯那顿
Hatshepsut=哈特谢普苏特
Nefertiti=娜芙蒂蒂
Cleopatra=克娄巴特拉
Ptolemaios=托勒密
Alexandros=亚历山德罗斯
Mohamed=穆罕默德
Ahmed=艾哈迈德
Mahmoud=马哈茂德
Omar=奥马尔
Youssef=优素福
Karim=卡里姆
Mariam=玛丽亚姆
Nour=努尔
Salma=萨尔玛
Aya=阿雅
Farida=法里达
Layla=莱拉
Arjun=阿尔琼
Dev=德夫
Ravi=拉维
Vikram=维克拉姆
Amit=阿米特
Rahul=拉胡尔
Aditya=阿迪提亚
Karan=卡兰
Priya=普里娅
Ananya=阿南娅
Kavya=卡维娅
Meera=米拉
Lakshmi=拉克希米
Anjali=安贾莉
Kumar=库马尔
Vijay=维杰
Suresh=苏雷什
Mohan=莫汉
Divya=迪维娅
Nguyễn=阮
Trần=陈
Lê=黎
Phạm=范
Huỳnh=黄
Võ=武
Đặng=邓
Bùi=裴
Minh=明
Anh=英
Quốc=国
Huy=辉
Thanh=清
Bình=平
Đức=德
Gia=嘉
Bảo=宝
Ngọc=玉
Lan=兰
Mai=梅
Thùy=垂
Linh=灵
Phương=芳
Thảo=草
Somchai=颂猜
Anan=阿南
Prasert=巴实
Niran=尼兰
Kittipong=吉迪蓬
Suda=素达
Mali=玛丽
Sirin=西琳
Pimchanok=平查诺
Ahmad=艾哈迈德
Ismail=伊斯梅尔
Hafiz=哈菲兹
Rizal=里扎尔
Farid=法里德
Aisyah=阿伊莎
Siti=茜蒂
Nur=努尔
Zahra=扎赫拉
Maya=玛雅
bin=本
binti=宾蒂
Adeyemi=阿德耶米
Adebayo=阿德巴约
Okafor=奥卡福
Balogun=巴洛贡
Ogunleye=奥贡莱耶
Fashola=法绍拉
Babajide=巴巴吉德
Akin=阿金
Chinedu=奇内杜
Kehinde=凯因德
Tunde=通德
Adesewa=阿德塞瓦
Yetunde=耶通德
Folake=福拉克
Amara=阿玛拉
Ngozi=恩戈齐
Dawit=达维特
Mekonnen=梅科嫩
Tadesse=塔德塞
Haile=海尔
Yonas=约纳斯
Meron=梅隆
Almaz=阿尔马兹
Hana=哈娜
Saron=萨隆
Tigist=提吉斯特
Jabari=贾巴里
Baraka=巴拉卡
Khalil=哈利勒
Musa=穆萨
Amani=阿曼尼
Zuri=祖里
Nia=尼娅
Asha=阿莎
Neema=妮玛
Imani=伊玛尼
Thabo=塔博
Sipho=西波
Lwazi=卢瓦齐
Bongani=邦加尼
Sizwe=西兹韦
Nomsa=诺姆萨
Ayanda=阿扬达
Lerato=莱拉托
Thandi=坦迪
Zanele=扎内莱
Michael=迈克尔
Daniel=丹尼尔
Ethan=伊桑
Emily=艾米丽
Hannah=汉娜
Tenoch=特诺奇
Acatl=阿卡特尔
Iktan=伊克坦
Yaxkin=亚什金
Kukulkan=库库尔坎
Metztli=梅茨特利
Xunaxi=舒纳希
Ixchel=伊什切尔
Citlali=西特拉莉
Itzel=伊采尔
Inti=因蒂
Tupac=图帕克
Amaru=阿马鲁
Pacha=帕查
Kuntur=昆图尔
Killa=基利亚
Sumaq=苏马克
Nayra=奈拉
Mayu=马尤
Illari=伊拉里
Sharma=夏尔马
Singh=辛格
Patel=帕特尔
Gupta=古普塔
Verma=维尔马
Mehta=梅赫塔
Khan=汗
Rao=拉奥
Iyer=艾耶尔
Nair=奈尔
Menon=梅农
Reddy=雷迪
Pillai=皮莱
Naidu=奈杜
Srisuk=西素
Sukhum=素坤
Chaiyaporn=猜亚蓬
Wongsa=翁萨
Kittisak=吉迪萨克
Rattanakul=拉达纳库
Reyes=雷耶斯
Cruz=克鲁兹
Garcia=加西亚
Bautista=包蒂斯塔
Mendoza=门多萨
Mwangi=姆旺吉
Odhiambo=奥迪安博
Kiptoo=基普图
Mushi=穆希
Juma=朱马
Hassan=哈桑
Dlamini=德拉米尼
Ndlovu=恩德洛武
Mthembu=姆特姆布
Mkhize=姆基泽
Khumalo=库马洛
Mabena=马贝纳
Quispe=基斯佩
Mamani=马马尼
Condori=孔多里
Huamán=瓦曼
Flores=弗洛雷斯
Rojas=罗哈斯
Xochitl=索奇特尔
Itzcoatl=伊茨科瓦特尔
Cuauhtémoc=夸乌特莫克
Balam=巴拉姆
Canek=卡内克
Manchester=曼彻斯特
Toulouse=图卢兹
Nice=尼斯
München=慕尼黑
Frankfurt=法兰克福
Barcelona=巴塞罗那
Porto=波尔图
Göteborg=哥德堡
Malmö=马尔默
Keflavík=凯夫拉维克
Westfjords=西峡湾
Hekla=赫克拉
London=伦敦
York=约克
Oxford=牛津
Canterbury=坎特伯雷
Winchester=温彻斯特
Cambridge=剑桥
Dover=多佛
Yorkshire=约克郡
Thames=泰晤士
Birmingham=伯明翰
Leeds=利兹
Liverpool=利物浦
Westbridge=西桥
Ashford=阿什福德
Oakham=橡树镇
Ravenwick=渡鸦镇
Greenhaven=绿港
Stoneleigh=斯通利
Black Forest=黑森林
House=家族
of=的
The=王室
Crown=王冠
Guard=卫队
Guild=行会
Paris=巴黎
Orléans=奥尔良
Rouen=鲁昂
Lyon=里昂
Bordeaux=波尔多
Marseille=马赛
Loire=卢瓦尔
Normandy=诺曼底
Beaumont=博蒙
Clairmont=克莱蒙
Valcour=瓦勒库尔
Rochefort=罗什福尔
Saint-Laurent=圣洛朗
Berlin=柏林
Köln=科隆
Nürnberg=纽伦堡
Wien=维也纳
Bremen=不来梅
Rhein=莱茵
Schwarzwald=黑森林
Falkenberg=法尔肯贝格
Lindenburg=林登堡
Rosenheim=罗森海姆
Steinbach=施泰因巴赫
Roma=罗马
Firenze=佛罗伦萨
Venezia=威尼斯
Milano=米兰
Napoli=那不勒斯
Siena=锡耶纳
Toscana=托斯卡纳
Toledo=托莱多
Madrid=马德里
Sevilla=塞维利亚
Lisboa=里斯本
Granada=格拉纳达
Valencia=瓦伦西亚
Oslo=奥斯陆
Bergen=卑尔根
Uppsala=乌普萨拉
Trondheim=特隆赫姆
Reykjavík=雷克雅未克
Akureyri=阿克雷里
Athens=雅典
Sparta=斯巴达
Thebes=底比斯
Corinth=科林斯
Delphi=德尔斐
Crete=克里特
Cairo=开罗
Alexandria=亚历山大城
Giza=吉萨
Luxor=卢克索
Aswan=阿斯旺
Varanasi=瓦拉纳西
Delhi=德里
Agra=阿格拉
Ganga=恒河
Madurai=马杜赖
Thanjavur=坦贾武尔
Kaveri=卡韦里河
Hanoi=河内
Hue=顺化
Saigon=西贡
Mekong=湄公河
Malacca=马六甲
Aceh=亚齐
Java=爪哇
Sumatra=苏门答腊
Manila=马尼拉
Cebu=宿务
Luzon=吕宋
Mindanao=棉兰老
Lagos=拉各斯
Zanzibar=桑给巴尔
Mombasa=蒙巴萨
Gondar=贡德尔
Lalibela=拉利贝拉
Addis Ababa=亚的斯亚贝巴
Boston=波士顿
New York=纽约
New Orleans=新奥尔良
Mississippi=密西西比
Appalachia=阿巴拉契亚
Tenochtitlan=特诺奇蒂特兰
Palenque=帕伦克
Yucatán=尤卡坦
Cusco=库斯科
Quito=基多
Andes=安第斯
Tz'ikin=齐金`.split('\n').map((line) => line.split('=')))

const supplementalLocalizedTokens: Record<string, string> = Object.fromEntries(`Ari=阿里
Kjartan=夏尔坦
Grettir=格雷蒂尔
Hrafn=赫拉夫恩
Kolbeinn=科尔贝因
Thorvald=托尔瓦尔德
Bjarni=比亚尼
Arndis=阿恩迪斯
Bryndis=布琳迪斯
Hekla=赫克拉
Ragnheidur=拉格恩海杜尔
Svala=斯瓦拉
Unnur=温努尔
Vala=瓦拉
Halfdan=哈尔夫丹
Egil=埃吉尔
Hakon=哈康
Styrbjorn=斯蒂尔比约恩
Torsten=托斯滕
Ulf=乌尔夫
Vidar=维达尔
Orm=奥姆
Thora=托拉
Svanhild=斯万希尔德
Gunnhild=贡希尔德
Helga=赫尔加
Ylva=于尔娃
Vigdis=维格迪斯
Eystein=埃斯泰因
Hrolf=赫罗尔夫
Torleif=托尔莱夫
Aslak=阿斯拉克
Bard=巴德
Steinar=斯泰纳尔
Mikkel=米克尔
Signe=西格妮
Renaud=雷诺
Thibaut=蒂博
Godefroy=戈德弗鲁瓦
Amaury=阿莫里
Raoul=拉乌尔
Eudes=厄德
Bertrand=贝特朗
Gautier=戈捷
Adele=阿黛尔
Blanche=布朗什
Alienor=阿丽埃诺尔
Aveline=阿维琳
Melisende=梅利桑德
Heloise=爱洛伊丝
Ermengarde=埃尔芒加德
Sibylle=西比勒
Baptiste=巴蒂斯特
Theo=提奥
Raphael=拉斐尔
Maxime=马克西姆
Chloe=克洛艾
Manon=玛侬
Leonie=莱奥妮
Juliette=朱丽叶特
Camille=卡米耶
Margot=玛戈
Ines=伊内斯
Albrecht=阿尔布雷希特
Berthold=贝特霍尔德
Eberhard=埃贝哈德
Gottfried=戈特弗里德
Hartmann=哈特曼
Rudolf=鲁道夫
Siegfried=齐格弗里德
Ulrich=乌尔里希
Bertrada=贝特拉达
Brunhild=布伦希尔德
Elsbeth=埃尔斯贝特
Irmingard=伊尔明加德
Richenza=里琴察
Walburga=瓦尔布加
Matthias=马蒂亚斯
Nikolaus=尼古拉斯
Sebastian=塞巴斯蒂安
Wolfgang=沃尔夫冈
Friederike=弗里德里克
Katharina=卡塔琳娜
Magdalena=玛格达莱娜
Theresia=特蕾西亚
Lorenzo=洛伦佐
Tommaso=托马索
Edoardo=爱德华多
Gabriele=加布里埃莱
Riccardo=里卡尔多
Giacomo=贾科莫
Simone=西蒙内
Valentina=瓦伦蒂娜
Alejandro=亚历杭德罗
Alvaro=阿尔瓦罗
Gonzalo=贡萨洛
Iker=伊克尔
Pablo=巴勃罗
Sergio=塞尔希奥
Adrian=阿德里安
Aitana=艾塔娜
Claudia=克劳迪娅
Irene=伊雷内
Nerea=内雷娅
Valeria=瓦莱里娅
Violeta=维奥莱塔
Abdelrahman=阿卜杜勒拉赫曼
Hisham=希沙姆
Tarek=塔里克
Fathi=法蒂
Samir=萨米尔
Nabil=纳比勒
Walid=瓦利德
Hazem=哈泽姆
Dina=迪娜
Heba=希芭
Rania=拉尼娅
Rawan=拉万
Yasmin=亚斯敏
Dalia=达莉娅
Huda=胡达
Nadia=娜迪娅
Aarav=阿拉夫
Dhruv=德鲁夫
Ishaan=伊尚
Kabir=卡比尔
Manav=马纳夫
Nikhil=尼基尔
Rohan=罗汉
Varun=瓦伦
Aditi=阿迪蒂
Diya=迪娅
Isha=伊莎
Ishita=伊希塔
Nandini=南迪妮
Riya=里娅
Sneha=斯内哈
Tara=塔拉
Advaith=阿德维特
Dhanush=达努什
Harish=哈里什
Karthik=卡尔蒂克
Manoj=马诺吉
Naveen=纳文
Pranav=普拉纳夫
Surya=苏里亚
Aishwarya=艾什瓦娅
Bhavana=巴瓦娜
Harini=哈里妮
Keerthi=基尔蒂
Nithya=妮蒂娅
Pooja=普贾
Shreya=施蕾娅
Vaishnavi=维什纳维
Azlan=阿兹兰
Faisal=费萨尔
Hakim=哈基姆
Irfan=伊尔凡
Syafiq=沙菲克
Zulkifli=祖尔基夫利
Haziq=哈兹克
Fikri=菲克里
Alya=阿莉娅
Farah=法拉
Husna=胡斯娜
Intan=英丹
Nabila=纳比拉
Qistina=基斯蒂娜
Sofea=索菲娅
Wani=瓦妮
Paolo=保罗
Carlo=卡洛
Enrique=恩里克
Ramon=拉蒙
Nico=尼科
Ariana=阿丽亚娜
Bianca=比安卡
Danica=达妮卡
Mikaela=米凯拉
Adekunle=阿德昆莱
Babatope=巴巴托佩
Femi=费米
Ibrahim=易卜拉欣
Kayode=卡约德
Olumide=奥卢米德
Segun=塞贡
Yemi=耶米
Abimbola=阿宾博拉
Bukola=布科拉
Folashade=福拉莎德
Ifeoma=伊菲奥玛
Kudirat=库迪拉特
Modupe=莫杜佩
Oluwakemi=奥卢瓦凯米
Temitope=特米托佩
Abebe=阿贝贝
Bekele=贝克莱
Getachew=盖塔丘
Girma=吉尔马
Kebede=凯贝德
Solomon=所罗门
Tesfaye=特斯法耶
Worku=沃尔库
Betty=贝蒂
Emebet=埃梅贝特
Liya=莉娅
Mulu=穆卢
Rahel=拉赫尔
Selam=塞拉姆
Yodit=约迪特
Abdalla=阿卜达拉
Bakari=巴卡里
Hamad=哈马德
Kassim=卡西姆
Mbarak=姆巴拉克
Salim=萨利姆
Yusuf=优素福
Halima=哈莉玛
Jamila=贾米拉
Mariam=玛丽亚姆
Nuru=努鲁
Rehema=雷赫玛
Saida=赛伊达
Zainabu=扎伊纳布
Andile=安迪莱
Bheki=贝基
Lungile=隆吉莱
Mandla=曼德拉
Mthokozisi=姆托科齐西
Siyabonga=西亚邦加
Vusi=武西
Xolani=科拉尼
Busisiwe=布西西韦
Lindiwe=林迪韦
Nokuthula=诺库图拉
Nolwazi=诺拉齐
Thulisile=图利西莱
Zandile=赞迪莱
Zodwa=佐德瓦
Ximena=希梅娜
Joaquin=华金
Rodrigo=罗德里戈
Luciana=卢西亚娜`.split('\n').map((line) => line.split('=')))

Object.assign(supplementalLocalizedTokens, {
  Aleksandr: '亚历山大', Dmitri: '德米特里', Mikhail: '米哈伊尔', Nikolai: '尼古拉', Sergei: '谢尔盖', Viktor: '维克托', Yuri: '尤里', Pavel: '帕维尔', Ilya: '伊利亚', Andrei: '安德烈', Fyodor: '费奥多尔', Timofei: '季莫费',
  Aleksandrovich: '亚历山德罗维奇', Aleksandrovna: '亚历山德罗芙娜', Dmitrievich: '德米特里耶维奇', Dmitrievna: '德米特里耶芙娜', Mikhailovich: '米哈伊洛维奇', Mikhailovna: '米哈伊洛芙娜', Nikolaevich: '尼古拉耶维奇', Nikolaevna: '尼古拉耶芙娜', Sergeevich: '谢尔盖耶维奇', Sergeevna: '谢尔盖耶芙娜', Viktorovich: '维克托罗维奇', Viktorovna: '维克托罗芙娜', Yurievich: '尤里耶维奇', Yurievna: '尤里耶芙娜', Pavlovich: '帕夫洛维奇', Pavlovna: '帕夫洛芙娜', Ilyich: '伊里奇', Ilyinichna: '伊利尼奇娜', Andreevich: '安德烈耶维奇', Andreevna: '安德烈耶芙娜', Fyodorovich: '费奥多罗维奇', Fyodorovna: '费奥多罗芙娜', Timofeevich: '季莫费耶维奇', Timofeevna: '季莫费耶芙娜',
  Anastasia: '阿纳斯塔西娅', Ekaterina: '叶卡捷琳娜', Natalia: '娜塔莉娅', Svetlana: '斯维特拉娜', Tatiana: '塔季扬娜', Olga: '奥尔加', Irina: '伊琳娜', Vera: '薇拉', Yelena: '叶莲娜', Daria: '达莉娅', Larisa: '拉丽萨', Mariya: '玛丽娅',
  Ivanov: '伊万诺夫', Petrov: '彼得罗夫', Sidorov: '西多罗夫', Volkov: '沃尔科夫', Morozov: '莫罗佐夫', Sokolov: '索科洛夫', Kuznetsov: '库兹涅佐夫', Popov: '波波夫', Fedorov: '费奥多罗夫', Belov: '别洛夫', Yakovlev: '雅科夫列夫', Orlov: '奥尔洛夫', Chernov: '切尔诺夫', Zaitsev: '扎伊采夫', Gromov: '格罗莫夫', Taigin: '泰金',
  Temur: '帖木儿', Batu: '拔都', Kubilai: '忽必烈', Sukh: '苏赫', Batsaikhan: '巴特赛汗', Munkh: '蒙赫', Enkh: '恩赫', Tseren: '策仁', Altan: '阿勒坦', Chuluun: '楚伦', Saran: '萨兰', Erdene: '额尔登', Naran: '那仁', Altantsetseg: '阿勒坦策策格', Oyuna: '奥云娜', Tungalag: '通嘎拉格', Bolormaa: '宝勒玛', Anu: '阿努', Khulan: '忽兰', Suvd: '苏芙德', Borjigin: '孛儿只斤', Kiyad: '乞颜', Jalair: '札剌亦儿', Onggirat: '弘吉剌', Khongirad: '翁吉剌', Uriankhai: '兀良哈', Mergen: '墨尔根', Baatar: '巴特尔', Tumen: '图们',
  Karakorum: '哈拉和林', Orkhon: '鄂尔浑', Valley: '河谷', Khovd: '科布多', Uvs: '乌布苏', Lake: '湖', Altai: '阿尔泰', Mountains: '山脉', Gobi: '戈壁', Desert: '沙漠', Onon: '鄂嫩', Kherlen: '克鲁伦', River: '河', Khan: '汗', Court: '庭', Kurultai: '忽里勒台', Keshig: '怯薛', Guard: '卫队', Steppe: '草原', Caravan: '商队', Scribes: '书记官', Horse: '马匹', Breeders: '牧马人', Council: '议会', composite: '复合', bow: '弓', gerege: '牌符', morin: '马头', khuur: '琴', felt: '毡', deel: '袍', silver: '银制', saddle: '马鞍', horsehair: '马鬃', banner: '旗',
})

// Iberian period packs keep the local spelling in nativeName while using
// established Chinese forms in the UI instead of syllable-by-syllable output.
Object.assign(supplementalLocalizedTokens, {
  Dinis: '迪尼斯', Henrique: '恩里克', Martim: '马尔廷', Vasco: '瓦斯科', Mafalda: '玛法尔达', Branca: '布兰卡',
  Cristóbal: '克里斯托瓦尔', Hernando: '埃尔南多', Duarte: '杜阿尔特', Joana: '若阿娜', Margarida: '玛格丽达', Filipa: '菲莉帕',
  Guilherme: '吉列尔梅', Tomás: '托马斯', Inês: '伊内斯', Matilde: '玛蒂尔德',
  Trastámara: '特拉斯塔马拉', Borgonha: '勃艮第', Avis: '阿维什', Lara: '拉腊', Castro: '卡斯特罗', Haro: '阿罗',
  Mendoza: '门多萨', Guzmán: '古斯曼', Sousa: '索萨', Meneses: '梅内塞斯', Bragança: '布拉干萨', Aragón: '阿拉贡',
  Alba: '阿尔瓦', Silva: '席尔瓦', Velasco: '贝拉斯科', Távora: '塔沃拉', Borja: '博尔哈', Noronha: '诺罗尼亚',
  Mascarenhas: '马斯卡雷尼亚斯', Coutinho: '库蒂尼奥',
})

Object.assign(supplementalLocalizedTokens, {
  Arne: '阿尔内', Ketil: '凯蒂尔', Rolf: '罗尔夫', Skarde: '斯卡德', Trygve: '特里格维', Aud: '奥德', Brynhild: '布伦希尔德', Geirhild: '盖尔希尔德', Runa: '鲁娜', Tove: '托芙',
  Birger: '比耶尔', Erlend: '埃伦德', Gorm: '戈姆', Kjell: '谢尔', Valdemar: '瓦尔德马', Dagmar: '达格玛', Eline: '埃琳', Kirsten: '基尔斯滕', Ragnfrid: '拉格弗里德', Tora: '托拉',
  Henrik: '亨里克', Jonas: '约纳斯', Mats: '马茨', Viggo: '维戈', Alma: '阿尔玛', Frida: '弗丽达', Linnea: '林内娅', Tuva: '图瓦',
  'Þorvaldur': '索尔瓦尔德', 'Skarphéðinn': '斯卡菲丁', 'Gísli': '吉斯利', 'Þorgeir': '索尔盖尔', 'Hallfreður': '哈尔弗雷德', Ketill: '凯蒂尔',
  'Auður': '奥德', 'Guðrún': '古德伦', 'Þuríður': '索里杜尔', 'Ingibjörg': '英吉比约格', 'Sigrún': '西格伦', 'Jórunn': '约伦', 'Ásdís': '奥斯迪丝', Hallbera: '哈尔贝拉', 'Ragnheiður': '拉格希杜尔', Steinunn: '斯泰宁', 'Þórdís': '索尔迪丝',
  'Hákon': '哈康', 'Kristján': '克里斯蒂安', 'Eiríkur': '埃里库尔', 'Guðmundur': '居德蒙德', 'Sigurður': '西居尔德', 'Þórður': '索尔德', Andri: '安德里', 'Kári': '卡里',
  'Árndís': '奥恩迪丝', 'Bryndís': '布伦迪丝', 'Elísabet': '伊丽莎白', Embla: '恩布拉', Katla: '卡特拉', Lilja: '莉莉娅', 'Sóley': '索莱',
})

Object.assign(supplementalLocalizedTokens, {
  Gracchus: '格拉古', Licinius: '李锡尼乌斯', Licinia: '李锡尼娅', Sulla: '苏拉', Verrucosus: '韦鲁科苏斯', Cato: '加图', Domitius: '多米蒂乌斯', Ulpius: '乌尔皮乌斯', Paullus: '保卢斯', Porcius: '波尔基乌斯', Pulcher: '普尔刻尔', Sempronius: '森普罗尼乌斯', Manlius: '曼利乌斯', Septimius: '塞普蒂米乌斯', Augustus: '奥古斯都', Naso: '纳索', Antonia: '安东尼娅', Brutus: '布鲁图斯', Scipio: '西庇阿', Aemilia: '艾米莉娅', Fabia: '法比娅', Fulvia: '富尔维娅', Iulia: '尤利娅', Servilia: '塞维莉娅',
  Mustafa: '穆斯塔法', Reem: '丽姆', Soliman: '苏莱曼', Nermine: '纳尔明', Abdelaziz: '阿卜杜勒阿齐兹', Amr: '阿姆尔', 'El-Sayed': '赛义德', Farouk: '法鲁克', Sherif: '谢里夫', Tamer: '塔梅尔', Zaki: '扎基', Mansour: '曼苏尔', Ghoneim: '戈奈姆', Menna: '门娜', Sabry: '萨布里', Gamal: '贾迈勒', Mona: '莫娜', 'El-Masry': '马斯里', Ezzat: '伊扎特', Hegazy: '希贾齐',
  Agariste: '阿伽里斯忒', Archidamia: '阿基达弥亚', Gorgo: '戈尔戈', Hipparchia: '希帕基娅', Kallimachos: '卡利马科斯', Nikaia: '尼凯娅', Timarete: '蒂玛瑞特', Ada: '阿达', Aischines: '埃斯基涅斯', Alkibiades: '阿尔基比亚德', Alkman: '阿尔克曼', Ampharete: '安法瑞特', Anaxandra: '阿那克珊德拉', Anaximandros: '阿那克西曼德', Anaximenes: '阿那克西美尼', Antisthenes: '安提西尼', Anyte: '阿倪忒', Apama: '阿帕玛', Apollonia: '阿波罗尼娅', Aratos: '阿拉托斯', Archilochos: '阿尔基洛科斯', Archimedes: '阿基米德', Arete: '阿瑞忒', Arignote: '阿里格诺忒', Aristarete: '阿里斯塔瑞忒', Aristippos: '阿里斯提波', Aristodike: '阿里斯托狄刻', Aristomache: '阿里斯托玛刻', Aristophanes: '阿里斯托芬', Axiothea: '阿克西奥忒娅',
  Bias: '比亚斯', Brasidas: '伯拉西达', Chrysippos: '克律西波', Demosthenes: '德摩斯梯尼', Diogenes: '第欧根尼', Eirene: '厄瑞涅', Epameinondas: '伊巴密浓达', Epimenides: '埃庇米尼德', Eumenes: '欧迈尼斯', Eumetis: '欧墨提斯', Euripides: '欧里庇得斯', Eurydike: '欧律狄刻', Gorgophone: '戈尔戈福涅', Hesiodos: '赫西俄德', Hippokrates: '希波克拉底', Homeros: '荷马', Ibykos: '伊比科斯', Isokrates: '伊索克拉底',
  Klearete: '克莱阿瑞特', Kleino: '克莱诺', Kleis: '克莱伊丝', Kleoboule: '克莱奥布勒', Kleobouline: '克莱奥布利涅', Kleoboulos: '克莱奥布洛斯', Ladike: '拉狄刻', Lais: '莱斯', Lampito: '兰皮托', Laodike: '劳狄刻', Lastheneia: '拉斯忒涅娅', Leontion: '莱昂提翁', Lysias: '吕西阿斯', Lysimache: '吕西玛刻', Lysimachos: '吕西马科斯', Mania: '玛尼娅', Megakleia: '墨伽克莱娅', Megakles: '墨伽克勒斯', Melitta: '墨利塔', Miltiades: '米太亚德', Mimnermos: '密姆涅尔摩斯', Mnesarete: '姆涅萨瑞特', Moero: '墨罗', Myrrhine: '密里涅', Myrtis: '密尔提斯',
  Nikarete: '尼卡瑞特', Nikerate: '尼刻瑞特', Nikias: '尼基阿斯', Nikoboule: '尼科布勒', Nossis: '诺西斯', Peisistratos: '庇西特拉图', Pelopidas: '佩洛皮达斯', Periandros: '佩里安德', Pherekydes: '费雷居德', Philinna: '菲琳娜', Phokylides: '福居利德', Phrasikleia: '弗拉西克莱娅', Phryne: '芙律涅', Pittakos: '庇塔库斯', Platon: '柏拉图', Praxiteles: '普拉克西特列斯', Pythagoras: '毕达哥拉斯', Rhodopis: '罗多庇斯', Sappho: '萨福', Seleukos: '塞琉古', Solon: '梭伦', Sophokles: '索福克勒斯', Speusippos: '斯珀西波', Stesichoros: '斯特西科罗斯', Stratonike: '斯特拉托妮刻', Thales: '泰勒斯', Theodote: '忒奥多忒', Theognis: '忒奥格尼斯', Theophrastos: '忒奥弗拉斯托斯', Theoxena: '忒奥克塞娜', Thukydides: '修昔底德', Tyrtaios: '提尔泰奥斯', Xanthippe: '克珊提佩', Xenokrates: '色诺克拉底', Xenophanes: '色诺芬尼',
  Horemheb: '霍伦海布', Imhotep: '伊姆霍特普', Khufu: '胡夫', Kiya: '基娅', Manethon: '曼涅托', Mentuhotep: '曼图霍特普', Meritaten: '梅利塔吞', Neithhotep: '奈特霍特普', Sitamun: '西塔蒙', Tutankhamun: '图坦卡蒙',
})

Object.assign(supplementalLocalizedTokens, {
  Qabul: '合不勒', Ambaghai: '俺巴孩', Qutula: '忽图剌', Yesugei: '也速该', Tooril: '脱斡邻', Jamuqa: '札木合', Qasar: '合撒儿', Belgutei: '别勒古台', 'Alan Goa': '阿阑豁阿', Hoelun: '诃额仑', Borte: '孛儿帖', Sochigel: '速赤格勒', Temulun: '帖木仑', Qutui: '忽秃亦', 'Al Altan': '阿勒阿勒坦', Yisui: '也遂', Mongke: '蒙哥', Qadan: '合丹', Arghun: '阿鲁浑', Qaidu: '海都', Jebe: '哲别', Subedei: '速不台', Sorghaghtani: '唆鲁禾帖尼', Doquz: '脱古思', Qutulun: '忽秃伦', Chabi: '察必', 'Oghul Qaimish': '海迷失', Bulughan: '卜鲁罕', Almaliq: '阿力麻里', Yisugen: '也速干', Dayan: '达延', Toghon: '脱欢', Esen: '也先', Manduul: '满都鲁', 'Bodi Alagh': '博迪阿剌克', 'Tumen Zasagt': '图们札萨克', 'Buyan Sechen': '布延彻辰', Ligdan: '林丹', Mandukhai: '满都海', Samur: '萨穆尔', Yunggen: '永根', Sarnai: '萨尔奈', Qutughai: '忽都海', Tsetseg: '策策格', Tsewang: '策妄', Dawaachi: '达瓦齐', Amursana: '阿睦尔撒纳', Baatur: '巴图尔', 'Khara Khula': '哈喇忽剌', Sesen: '彻辰', Ulaan: '乌兰', Oyuun: '奥云', Tserendulam: '策仁杜拉姆', Handmaa: '杭德玛', Dulmaa: '杜拉玛', Norjmaa: '诺尔吉玛', Oyuunchimeg: '奥云其木格', Narmandakh: '那仁满都呼', Tsend: '曾德', Choibalsan: '乔巴山', Tsedenbal: '泽登巴尔', Jamsran: '扎木斯朗', Luvsan: '鲁布桑', Gombo: '贡布', Dashdorj: '达希道尔吉', Suren: '苏伦', Enkhtuya: '恩赫图雅', Narantsetseg: '那仁策策格', Sarantsetseg: '萨仁策策格', Temuulen: '特木伦', Ankhbayar: '安赫巴雅尔', Bilguun: '毕力贡', Ganbold: '钢宝力德', Munkhbayar: '蒙赫巴雅尔', Erdenebat: '额尔登巴特', Enkhjin: '恩赫金', Nomin: '诺敏', Tayichiud: '泰赤乌', Kerait: '克烈', Naiman: '乃蛮', Merkit: '蔑儿乞', Oirat: '卫拉特', Chakhar: '察哈尔', Khalkha: '喀尔喀', Tumet: '土默特', Ordos: '鄂尔多斯', Khorchin: '科尔沁', Choros: '绰罗斯', Dorbet: '杜尔伯特', Torghut: '土尔扈特', Khoshut: '和硕特', Khoid: '辉特', Bayad: '巴雅特', Zakhchin: '扎哈沁', Myangad: '明阿特', Barga: '巴尔虎', Besud: '别速惕', Olkhonud: '斡勒忽讷兀惕', Sartuul: '萨尔图勒',
  Aguda: '阿骨打', Wuqimai: '吴乞买', Hela: '斡鲁', Loushi: '娄室', Zongbi: '宗弼', Zonghan: '宗翰', Wannu: '万奴', Hushahu: '胡沙虎', Tangkuo: '唐括', Pucha: '蒲察', Wulinda: '乌林答', Tushan: '徒单', Wanyan: '完颜', Pusan: '蒲鲜', Wugulun: '乌古论', Jiagu: '夹谷', Bujantai: '布占泰', 'Monggo Temur': '猛哥帖木儿', 'Wang Gao': '王杲', Giocangga: '觉昌安', Taksi: '塔克世', 'Nikan Wailan': '尼堪外兰', Surhaci: '舒尔哈齐', 'Šurhaci': '舒尔哈齐', Gintaisi: '金台石', 'Hada Nara': '哈达那拉', 'Ula Nara': '乌拉那拉', 'Yehe Nara': '叶赫那拉', 'Hoifa Nara': '辉发那拉', Nurhaci: '努尔哈赤', 'Hong Taiji': '皇太极', Daisan: '代善', Amin: '阿敏', Manggultai: '莽古尔泰', Abatai: '阿巴泰', Jirgalang: '济尔哈朗', Abahai: '阿巴亥', Jerjer: '哲哲', Harjol: '海兰珠', Bumbutai: '布木布泰', Mangguji: '莽古济', Mukushen: '穆库什', Donggo: '董鄂', Monggo: '孟古', Ajige: '阿济格', Dodo: '多铎', Fulin: '福临', Xuanye: '玄烨', Yinzhen: '胤禛', Hongli: '弘历', Fuheng: '傅恒', Sumalagu: '苏麻喇姑', Yongqi: '永琪', Mianning: '绵宁', Yizhu: '奕詝', Zaichun: '载淳', Zaitian: '载湉', Yikuang: '奕劻', Shanqi: '善耆', Puyi: '溥仪', Cixi: '慈禧', Cian: '慈安', Longyu: '隆裕', Zhenfei: '珍妃', Jingfen: '静芬', Wanrong: '婉容', Wenxiu: '文绣', Hengxiang: '恒香', Yehenara: '叶赫那拉', Tatara: '他他拉', Uya: '乌雅', Fuca: '富察',
})

Object.assign(supplementalLocalizedTokens, {
  Yum: '雍', Agas: '阿噶斯', Nasang: '那桑', Oyun: '奥云', Bumtsend: '布木增德', Dondov: '敦多布', Gonchig: '贡其格', Jambal: '占巴拉', Rinchin: '仁钦', Sonom: '索诺木', Nalan: '纳兰',
  Wulu: '兀鲁', Dingge: '定哥', Shige: '石哥', Alihu: '阿里虎', Mile: '弥勒', Guige: '贵哥', Cuige: '崔哥', Yicha: '乂察',
  Yeshe: '益西', Gyaltsen: '坚赞', Rinchen: '仁钦', Zangpo: '桑布', Wangmo: '旺姆', Karma: '噶玛', Changchub: '强曲', Chokyi: '曲吉', Drakpa: '扎巴', Drub: '珠巴', Jamyang: '嘉央', Kunga: '贡噶', Namgyal: '南杰', Phagmo: '帕姆', Shakya: '释迦', Tsultrim: '楚臣', Atisha: '阿底峡', Buton: '布敦', Chime: '次美', Chogyal: '曲杰', Chokden: '却丹', Dampa: '当巴', Deki: '德吉', Drogon: '卓贡', Dronma: '卓玛', Gendun: '根敦', Khedrup: '克珠', Kunchok: '根确', Lhacham: '拉姜', Lhakpa: '拉巴', Lhakyi: '拉吉', Lodro: '洛追', Lume: '鲁梅', Mune: '牟尼', Tsenpo: '赞普', Wangpo: '旺波', Selnang: '塞囊', Tsuktsen: '祖赞', Tride: '赤德', Gar: '噶尔', Sakya: '萨迦', Pandita: '班智达', Phagpa: '八思巴', Samding: '桑顶', Thinley: '赤列', Phurba: '普巴', Wangchuk: '旺秋', Sangpo: '桑布', Yangzom: '央宗', Namkha: '南喀', Bum: '本', Droza: '卓萨', Kortsen: '阔赞', Kunlo: '衮洛', Lhalama: '拉喇嘛', Mungchang: '蒙姜', Ngangtsul: '娘楚', O: '沃', Paldron: '贝卓', Pel: '贝', Peldren: '贝珍', Sal: '萨', Sherab: '喜饶', Situ: '司徒', Tai: '大', Tritsun: '赤尊', Tsegpa: '泽巴', Tseringma: '次仁玛', Tsongkhapa: '宗喀巴',
  'Tride Tsuktsen': '赤德祖赞', 'Mune Tsenpo': '牟尼赞普', 'Gendun Drub': '根敦珠巴', 'Khedrup Je': '克珠杰', 'Sakya Pandita': '萨迦班智达', 'Dorje Phagmo': '多吉帕姆', 'Samding Dorje Phagmo': '桑顶多吉帕姆', 'Lhalama Yeshe O': '拉喇嘛益西沃', 'Tai Situ Changchub Gyaltsen': '大司徒绛曲坚赞',
})

// Curated whole-name renderings for culture packs that previously fell back
// to syllable-by-syllable transliteration.
Object.assign(supplementalLocalizedTokens, {
  Ptah: '卜塔', Osiris: '奥西里斯', Alain: '阿兰', Claire: '克莱尔', 'Amélie': '阿梅莉', Hanna: '汉娜', Klara: '克拉拉',
  Alaungpaya: '雍笈牙', Anawrahta: '阿奴律陀', Bayinnaung: '莽应龙', Supayalat: '苏帕雅莱', Minye: '敏耶', Minkhaung: '明康', Thado: '多陀', Zeya: '泽亚', Khin: '钦', Thazin: '达辛', Aye: '埃', Hla: '拉', Htun: '吞', Ko: '哥', Lin: '林', Nwe: '努韦', Saw: '苏', Shin: '信', Hlaing: '莱', Naing: '奈', Nay: '奈', Pwint: '彬', Sandar: '桑达', Soe: '梭', Thida: '蒂达', Thura: '杜拉', Wint: '温', Mar: '玛', Mon: '蒙',
  Bayu: '巴尤', Anisa: '阿妮莎', Arif: '阿里夫', Cahyo: '查约', Dian: '迪安', Dimas: '迪马斯', Erna: '埃尔娜', Galih: '加利', Hadi: '哈迪', Imam: '伊玛目', Kartini: '卡蒂妮', Lukman: '卢克曼', Melati: '梅拉蒂', Ratna: '拉特娜', Rendra: '伦德拉', Suryo: '苏尔约', Teguh: '德古', Utami: '乌塔米', Wati: '瓦蒂', Wibowo: '维博沃', Yuli: '尤莉',
  Astri: '阿斯特里', Bintang: '宾唐', Desi: '德西', Gita: '吉塔', Jaya: '查亚', Kirana: '基拉娜', Krisna: '克里斯纳', Laksmi: '拉克斯米', Mahendra: '马亨德拉', Mei: '梅', Nadya: '纳迪娅', Pande: '潘德', Putra: '普特拉', Raka: '拉卡', Sanjaya: '桑贾亚', Sinta: '辛塔', Tari: '塔里', Widya: '维迪娅', Wisnu: '维斯努', Yoga: '约加', Yudistira: '尤迪斯蒂拉',
  Agathokleia: '阿伽托克勒娅', Antigonos: '安提柯', Aristarchos: '阿里斯塔克斯', Basileios: '巴西尔', Chariton: '卡里同', Chrysis: '克律西斯', Damaris: '达玛丽斯', Eratosthenes: '埃拉托斯特尼', Euclid: '欧几里得', Eudokia: '欧多基娅', Euphemia: '欧斐米娅', Herakleides: '赫拉克利德', Kallista: '卡莉斯塔', Kleon: '克莱翁', Kleopatra: '克利奥帕特拉', Menandros: '米南德', Myrtale: '密尔塔勒', Niko: '妮科', Philista: '菲莉斯塔', Philon: '斐隆', Polybius: '波利比乌斯', Rhodope: '罗多彼', Theano: '提阿诺', Theokritos: '忒奥克里托斯', Timotheos: '提摩太', Xanthe: '克珊忒', Zenon: '芝诺',
  Aelia: '埃莉娅', Aelius: '埃利乌斯', Aulus: '奥卢斯', Aurelia: '奥蕾莉娅', Caesonia: '凯索尼娅', Calpurnia: '卡尔普尔尼娅', Celsus: '凯尔苏斯', Decimus: '德基穆斯', Drusilla: '德鲁西拉', Flavia: '弗拉维娅', Gaius: '盖乌斯', Galeria: '加莱里娅', Germanicus: '日耳曼尼库斯', Gordianus: '戈尔迪亚努斯', Iunia: '尤尼娅', Lucilla: '卢基拉', Lucius: '卢基乌斯', Marcella: '马尔切拉', Marcellus: '马尔凯卢斯', Marcus: '马库斯', Nerva: '涅尔瓦', Octavia: '屋大维娅', Plotina: '普洛蒂娜', Prisca: '普里斯卡', Publius: '普布利乌斯', Quintilianus: '昆体良', Quintus: '昆图斯', Rufina: '鲁菲娜', Tacitus: '塔西佗', Titus: '提图斯', Varus: '瓦鲁斯', Vitalia: '维塔莉娅', Vitus: '维图斯',
})

Object.assign(supplementalLocalizedTokens, {
  Acoma: '阿科马', Amalfi: '阿马尔菲', Arbela: '阿尔贝拉', Asterion: '阿斯忒里昂', Aurelio: '奥雷利奥', Belur: '贝卢尔', Bulawayo: '布拉瓦约', Djedet: '杰代特', Edfu: '埃德富', Elmina: '埃尔米纳', Goslar: '戈斯拉尔', Gunib: '古尼布', Herat: '赫拉特', Hilo: '希洛', Kotor: '科托尔', Leuktra: '留克特拉', Mashhad: '马什哈德', Matadi: '马塔迪', Meru: '梅鲁', Mostar: '莫斯塔尔', Nimrud: '尼姆鲁德', Nisa: '尼萨', Nri: '恩里', Nsukka: '恩苏卡', Sami: '萨米', Soroca: '索罗卡', Talas: '塔拉斯', Tartu: '塔尔图', Tlatelolco: '特拉特洛尔科', Toro: '托罗', Urbino: '乌尔比诺', Verona: '维罗纳', Yomut: '约穆特', pashmina: '帕什米纳',
  Bellacqua: '美泉城', Bellefontaine: '美泉镇', Bergvik: '山湾村', Castelbianco: '白堡城', Eichenfeld: '橡原镇', Eikby: '橡木村', Hrafnvik: '渡鸦湾', Kallipolis: '美城', Monteclaro: '明山城', Monteverde: '青山城', Nikopolis: '胜利城', Nordheim: '北境家园', Rocafuerte: '坚岩城', Roccaluna: '月岩城', Skallafjord: '岩岸峡湾', Theophaneia: '神显城', Ulfsdal: '狼谷', Valdoro: '金谷城', Valverde: '青谷城', Waldkirchen: '林教堂镇',
  'Acoma Pueblo': '阿科马普韦布洛', 'Puerto Blanco': '白港', 'Santa Lucía': '圣卢西亚', 'Sami Parliament': '萨米议会', 'pashmina shawl': '帕什米纳披肩', 'Per-Amun': '阿蒙之家', 'Per-Ra': '拉神之家', 'Waset-Nefer': '美丽底比斯', 'Futa Toro': '富塔托罗', 'Yomut carpet': '约穆特地毯',
  'Björnsstaðir': '比约恩庄', 'Eyrarfjörður': '沙洲峡湾', 'Hrafnsvík': '渡鸦湾', 'Norðurholt': '北丘', Steinsnes: '石岬', Castrum: '堡城', Eboracum: '埃博拉孔', Forum: '广场城', Lugdunum: '卢格杜努姆', Marcelli: '马尔凯利', Novum: '新城', Portus: '港城',
  Bridget: '布里奇特', Roger: '罗杰', Susanna: '苏珊娜', Avice: '阿维斯', Rebecca: '丽贝卡', Ralph: '拉尔夫', Edith: '伊迪丝', Hawise: '海维丝', Maud: '莫德', Stephen: '斯蒂芬', Alexander: '亚历山大', Cecily: '塞西莉', Judith: '朱迪丝', Gilbert: '吉尔伯特',
})

// Curated Chinese renderings for the newer culture packs. These are whole
// token corrections, so they take precedence over phonetic fallback and keep
// the original spelling available in nativeName.
Object.assign(supplementalLocalizedTokens, {
  Yermak: '叶尔马克', Stepan: '斯捷潘', Matvei: '马特维', Savva: '萨瓦', Grigory: '格里戈里', Afanasy: '阿法纳西', Nikita: '尼基塔', Agafya: '阿加菲娅', Avdotya: '阿芙朵嘉', Feodosia: '费奥多西娅', Marfa: '玛尔法', Praskovya: '普拉斯科维娅', Ulyana: '乌里扬娜', Vasilisa: '瓦西丽萨', Aleksei: '阿列克谢', Boris: '鲍里斯', Konstantin: '康斯坦丁', Lev: '列夫', Maksim: '马克西姆', Pyotr: '彼得', Vasily: '瓦西里', Alexandra: '亚历山德拉', Elizaveta: '叶利扎维塔', Ksenia: '克谢尼娅', Lidiya: '莉季娅', Maria: '玛丽娅', Nadezhda: '娜杰日达', Sofiya: '索菲娅', Anatoly: '阿纳托利', Gennady: '根纳季', Leonid: '列昂尼德', Oleg: '奥列格', Valery: '瓦列里', Vladimir: '弗拉基米尔', Yevgeny: '叶夫根尼', Yaroslav: '雅罗斯拉夫', Galina: '加林娜', Ludmila: '柳德米拉', Nina: '尼娜', Raisa: '赖莎', Tamara: '塔玛拉', Zinaida: '季娜伊达', Zoya: '卓娅', Artyom: '阿尔乔姆', Denis: '杰尼斯', Kirill: '基里尔', Roman: '罗曼', Vadim: '瓦季姆', Yegor: '叶戈尔', Alina: '阿丽娜', Kira: '基拉', Milana: '米拉娜', Polina: '波琳娜', Varvara: '瓦尔瓦拉', Yana: '雅娜', Belyaev: '别利亚耶夫', Dobrynin: '多布雷宁', Karpov: '卡尔波夫', Krasnov: '克拉斯诺夫', Loginov: '洛吉诺夫', Pankratov: '潘克拉托夫', Rybakov: '雷巴科夫', Tikhonov: '季洪诺夫', Antonov: '安东诺夫', Bogdanov: '博格丹诺夫', Kolesnikov: '科列斯尼科夫', Tarasov: '塔拉索夫', Baranov: '巴拉诺夫', Danilov: '达尼洛夫', Markov: '马尔科夫', Nikitin: '尼基京', Rudenko: '鲁坚科', Savin: '萨温',
  Thori: '托里', Nyantsen: '年赤', Songtsen: '松赞', Gampo: '干布', Mangsong: '芒松', Mangtsen: '芒赞', Tridu: '赤都', Detsen: '德赞', 'Trisong Detsen': '赤松德赞', Ralpacan: '赤祖德赞', Langdarma: '朗达玛', Tongtsen: '禄东赞', Nyang: '娘', Tingngezin: '钦泽因', Namri: '南日', Pelgyi: '贝吉', Yuthok: '宇妥', Yonten: '云丹', Gonpo: '贡布', Padmasambhava: '莲花生', Wencheng: '文成', Jincheng: '金城', Tsogyal: '措嘉', Machig: '玛吉', Labdron: '拉准', Dromton: '仲敦巴', Khadro: '空行母', Tashi: '扎西', Dorje: '多杰', Norbu: '诺布', Lobsang: '洛桑', Ngawang: '阿旺', Jigme: '晋美', Kelsang: '格桑', Kalsang: '格桑', Kelzang: '格桑', Tenzin: '丹增', Sonam: '索南', Pema: '白玛', Dawa: '达瓦', Thupten: '图登', Thubten: '图登', Jamphel: '绛白', Gyatso: '嘉措', Tsangyang: '仓央', Dolma: '卓玛', Yangchen: '央金', Dechen: '德钦', Tsering: '次仁', Kunsang: '贡桑', Lhamo: '拉姆', Metok: '梅朵', Drolma: '卓玛', Peldron: '贝卓', Sangay: '桑杰', Sangye: '桑结', Choden: '却珍', Khandro: '康卓',
  Kyansittha: '江喜陀', Sawlu: '苏卢', Sithu: '锡都', Narathu: '那腊图', Naratheinkha: '那腊廷卡', Narapatisithu: '那罗波底悉都', Htilominlo: '梯罗明罗', Uzana: '乌扎纳', 'Min Shin Saw': '明辛绍', Thihathu: '梯诃都', Athinkhaya: '阿辛格雅', Yazathingyan: '亚扎廷坚', 'Pwa Saw': '普瓦绍', 'Saw Mon Hla': '绍蒙拉', 'Shwe Einthi': '瑞因蒂', 'Hlaing Hteik Khaung': '莱泰康', 'Shin Htwe': '辛杜', 'Mwei Daw': '梅道', Yadanabon: '雅达纳邦', 'Maha Dewi': '摩诃黛维', 'Saw Gyi': '绍基', 'Khin Hla': '钦拉', 'Mya Hnin': '妙宁', Bodawpaya: '波道帕耶', Bagyidaw: '巴吉道', Tharrawaddy: '萨拉瓦底', 'Pagan Min': '蒲甘敏', Mindon: '敏东', Thibaw: '锡袍', 'Maha Bandula': '摩诃班杜拉', 'Maha Thiha Thura': '摩诃提哈都拉', 'Ne Myo Sithu': '内妙悉都', 'Min Ye Kyawswa': '敏耶觉苏瓦', 'Thado Minbya': '多陀敏标', Singu: '辛古', 'Me Nu': '梅努', Supayagyi: '苏帕雅基', Sinbyumashin: '辛比乌马辛', Hsinbyumashin: '辛比乌马辛', Aungban: '昂班', 'Shin Sawbu': '辛绍布', Yadanarbon: '雅达纳邦', 'Khin Phyu': '钦秋', 'Mya Lay': '妙莱', 'Khin Ma Gyi': '钦玛基',
  'Hayam Wuruk': '哈亚姆·乌鲁克', 'Gajah Mada': '加查·马达', 'Raden Wijaya': '拉登·维查亚', Jayanegara: '查亚内加拉', Kertarajasa: '克塔拉查萨', 'Bhre Kertabhumi': '布赫尔·克塔布胡米', Adityawarman: '阿迪亚瓦尔曼', Ranggalawe: '朗加拉韦', 'Mpu Tantular': '姆普·丹图拉尔', 'Mpu Prapanca': '姆普·普拉班查', 'Arya Damar': '阿里亚·达玛', 'Kebo Anabrang': '克博·阿纳布朗', Tribhuwana: '特里布瓦娜', 'Gayatri Rajapatni': '伽耶特里·拉贾帕特尼', 'Dyah Gitarja': '迪雅·吉塔尔贾', Suprabhawa: '苏普拉巴瓦', 'Kencana Wungu': '肯查娜·文古', 'Dyah Pitaloka': '迪雅·皮塔洛卡', 'Rara Jonggrang': '拉拉·琼格朗', 'Ken Dedes': '肯·德德斯', Pramodawardhani: '普拉莫达瓦达尼', Suhita: '苏希塔', Isyana: '伊莎娜', 'Sultan Agung': '阿贡苏丹', 'Sunan Kalijaga': '苏南·卡利查加', 'Panembahan Senopati': '帕内姆巴汉·塞诺帕蒂', 'Sultan Trenggana': '特伦加纳苏丹', 'Sultan Ageng': '阿贡苏丹', Diponegoro: '迪波尼哥罗', Pakubuwono: '帕库布沃诺', Amangkurat: '阿芒库拉特', 'Sunan Giri': '苏南·吉里', 'Sunan Bonang': '苏南·博南', 'Sunan Gunung Jati': '苏南·古农·贾蒂', 'Ratu Kalinyamat': '卡利尼亚玛特女王', 'Ratu Kidul': '南海女王', 'Nyi Ageng Serang': '妮·阿贡·塞朗', 'Raden Ayu Kartini': '拉登·阿尤·卡蒂妮', 'Dewi Sartika': '黛维·萨蒂卡', 'Ratu Pembayun': '蓬巴尤女王', 'Nyai Ahmad Dahlan': '妮·艾哈迈德·达赫兰', 'Siti Walidah': '西蒂·瓦莉达', Aditya: '阿迪蒂亚', Bima: '比马', Darma: '达玛', Joko: '佐科', Raden: '拉登', Surya: '苏利亚', Wira: '维拉', Yuda: '尤达', Ayu: '阿尤', Citra: '奇特拉', Dewi: '黛维', Indah: '英达', Kartika: '卡蒂卡', Lestari: '莱斯塔丽', Ratih: '拉蒂', Sari: '萨丽', Bambang: '班邦', Dedi: '德迪', Eko: '埃科', Fajar: '法贾尔', Hendra: '亨德拉', Wahyu: '瓦胡', Yanto: '扬托', Agus: '阿古斯', Budi: '布迪', Wulan: '乌兰',
  Wayan: '瓦扬', Made: '马德', Nyoman: '尼约曼', Ketut: '克图特', Gede: '格代', Putu: '普图', 'Gusti Ngurah': '古斯蒂·恩古拉', 'Ida Bagus': '伊达·巴古斯', 'Anak Agung': '阿纳克·阿贡', Cokorda: '佐科达', Kadek: '卡代克', Komang: '科芒', Luh: '卢', 'Ni Wayan': '妮·瓦扬', 'Ni Made': '妮·马德', 'Ni Nyoman': '妮·尼约曼', 'Ni Ketut': '妮·克图特', Desak: '德萨克', 'Ida Ayu': '伊达·阿尤', 'Anak Agung Istri': '阿纳克·阿贡·伊斯特里',
  Mueang: '孟', Chang: '昌', Thong: '通', Khao: '考', Mae: '湄', Nam: '南', Khiao: '侨', Wat: '寺', Bua: '莲', Chan: '月', Krachang: '克拉昌', Daab: '达卜',
  Severozvezdny: '北辰', Morozorechye: '霜河', Berezovsk: '白桦城', 'Kedrovyi Pereval': '雪松隘口', Voronograd: '乌鸦城', 'Ledyanaya Zastava': '冰原哨站', 'Listvennitsa Guard': '铁杉边防军', Dolgozimye: '长冬', 'Dolgozimye Valley': '长冬谷', 'Morozorech Principality': '霜河公国', 'Berezovyi Posad': '白桦驿城', 'Aurora Ostrog': '极光关', 'Kedrovy Gorodok': '雪松边城', 'Severozvezdny Port': '北辰港', 'Morozorech Duma': '霜河议会', 'Berezovyi Cossacks': '白桦哥萨克团', 'Aurora Observatory': '极光观测院', 'Kedrovy Guild': '雪松商会', 'Severozvezdny Guard': '北辰边防署', 'Dolgozimye Monastery': '长冬修院',
})

Object.assign(supplementalLocalizedTokens, {
  Durand: '迪朗', Schwarz: '施瓦茨', Mateo: '马特奥', Alonso: '阿隆索', Navarro: '纳瓦罗', Dahl: '达尔', 'Björnsson': '比约恩松', Xenophon: '色诺芬', Domitia: '多米蒂娅', Prima: '普里玛', Meena: '米娜', Naidu: '奈杜', Srisuk: '西素', Bautista: '包蒂斯塔', Cruz: '克鲁斯', Sofía: '索菲娅', Balam: '巴拉姆', Timur: '帖木儿', Romanovich: '罗曼诺维奇', Nikitin: '尼基京', 'Al-Rashid': '阿尔·拉希德', Bahram: '巴赫拉姆', Mehrabi: '梅赫拉比', Bekir: '贝基尔', Nazarov: '纳扎罗夫', Riona: '里奥娜', Doyle: '多伊尔', Zoryana: '佐里亚娜', Zorya: '佐里娅', 'Running Bear': '奔熊', Tane: '塔内', Matai: '马泰', Sengge: '森格', Nara: '纳拉', Kham: '坎', Bounmy: '本米', Tanvir: '坦维尔', Rahman: '拉赫曼', Fateh: '法泰赫', Chaudhry: '乔杜里', Ayşe: '艾谢', Efendi: '埃芬迪', Mahad: '马哈德', Abdi: '阿卜迪', Chukwu: '丘库', Jaciara: '雅西亚拉', Tupinamba: '图皮南巴', Joseph: '约瑟夫', Hemi: '赫米', Kingi: '金吉', Willem: '威廉', 'De Vries': '德弗里斯', Vytautas: '维陶塔斯', Vaher: '瓦赫尔', Jelena: '耶莱娜', Stojanov: '斯托亚诺夫', Nino: '妮诺', Abashidze: '阿巴希泽', Viyan: '维扬', Husseini: '侯赛尼', Anitha: '阿妮塔', Iyer: '艾耶尔', Tewodros: '特沃德罗斯', Desta: '德斯塔', Cauã: '考昂', Boleslaw: '博莱斯瓦夫', Wojcik: '沃伊奇克', Kovacs: '科瓦奇', Ferenc: '费伦茨', Gagik: '加吉克', Grigoryan: '格里戈良', Salome: '萨洛梅', Kapanadze: '卡帕纳泽', Vishal: '维沙尔', Mehta: '梅塔', Anjali: '安贾莉', Gowda: '高达', Tiana: '蒂亚娜', Raharison: '拉哈里松', Bai: '拜', Ngalu: '恩加卢', Avraham: '亚伯拉罕', Ashkenazi: '阿什肯纳齐', Gabriel: '加布里埃尔', Ninos: '尼诺斯', Zlata: '兹拉塔', Boswell: '博斯韦尔', 'Vár': '瓦尔', Hætta: '海塔', Lucie: '露西', Côté: '科泰', Jirrawun: '吉拉文', Nungurrayi: '努古拉伊', Aino: '艾诺', Virtanen: '维尔塔宁', Sorin: '索林', Ionescu: '约内斯库', Aksel: '阿克塞尔', Idir: '伊迪尔', Laila: '莱拉', Rahimi: '拉希米', Nimal: '尼马尔', Jayasinghe: '贾亚辛格', Nutaq: '努塔克', Sikku: '西库', Antu: '安图', Maripan: '马里潘', Maro: '马罗', Tui: '图伊', Mamat: '马马特', Kadir: '卡迪尔', Serik: '谢里克', Baimukhanov: '拜穆哈诺夫', Nurlan: '努尔兰', Aitmatov: '艾特玛托夫', Akmal: '阿克马尔', Tashpulatov: '塔什普拉托夫', Myrat: '穆拉特', Orazov: '奥拉佐夫', Parviz: '帕尔维兹', Safarov: '萨法罗夫', Nantan: '南坦', Begay: '贝盖', Onondaga: '奥农达加', Lomahongva: '洛马洪瓦', Tlingit: '特林吉特', Kabah: '卡巴', Cipactli: '西帕克特利', Cuauhtemoc: '夸乌特莫克', Rumi: '鲁米', Choque: '乔克', Chaska: '查斯卡', Theodora: '狄奥多拉', Dimitriou: '迪米特里乌', Mariana: '玛丽安娜', Sutan: '苏丹', Tanjung: '丹戎', Asante: '阿散蒂', Amara: '阿玛拉', Ude: '乌德', Bashir: '巴希尔', Yahaya: '亚哈亚', Binta: '宾塔', Diallo: '迪亚洛', Ndeye: '恩黛耶', Diop: '迪奥普', Mabiala: '马比阿拉', Nsakala: '恩萨卡拉', Kamran: '卡姆兰', Rahimov: '拉希莫夫', Khadizhat: '哈迪扎特', Gadzhiev: '加吉耶夫', Keanu: '基努', Kahale: '卡哈勒', Sione: '西奥内', Tupou: '图普', 'Tupac Yupanqui': '图帕克·尤潘基', 'Manco Capac': '曼科·卡帕克', Pachacuti: '帕查库蒂', 'Huayna Capac': '瓦伊纳·卡帕克', 'Sinchi Roca': '辛奇·罗卡', 'Mayta Capac': '迈塔·卡帕克', 'Mama Ocllo': '玛玛·奥克略', 'Coya Asarpay': '科娅·阿萨尔派', 'Cura Ocllo': '库拉·奥克略', 'Chimpu Ocllo': '钦普·奥克略', 'Garcilaso de la Vega': '加西拉索·德·拉·维加', 'Jose Gabriel Condorcanqui': '何塞·加布里埃尔·孔多尔坎基', 'Tupac Amaru I': '图帕克·阿马鲁一世', 'Tupac Katari': '图帕克·卡塔里',
})

// High-frequency forms where a letter-by-letter fallback is misleading.
// Keep these as whole tokens so the display remains close to established
// Chinese reference translations.
Object.assign(supplementalLocalizedTokens, {
  Andersson: '安德松', Andersen: '安徒生', Johan: '约翰', Johansen: '约翰森', Haakon: '哈康', Hakonsson: '哈康松', Hansen: '汉森', Larsen: '拉森', Nilsen: '尼尔森',
  Calliope: '卡利俄佩', Thanakorn: '塔纳功', Nattapong: '纳塔蓬', Pongsak: '蓬萨', Worawut: '沃拉武', Chaiwat: '猜瓦', Pakorn: '巴功', Khadija: '哈迪贾', Aisha: '阿伊莎', Maryam: '玛丽亚姆', Shirazi: '设拉子', Tabrizi: '大不里士', Sadykov: '萨德科夫', Tursunov: '图尔松诺夫', Deirdre: '迪尔德丽', Niamh: '妮芙', Eimear: '埃默尔',
  'Aung San Suu Kyi': '昂山素季', 'Kitchi Running Bear': '基奇·奔熊', 'Black Elk': '黑麋', 'Tall Chief': '高酋', 'White Cloud': '白云',
})

// Additional established renderings used by the expanded regional catalogs.
Object.assign(supplementalLocalizedTokens, {
  Magnús: '马格努斯', Olafur: '奥拉弗', 'Ólafur': '奥拉弗', Ólafsson: '奥拉夫松', Einarsson: '埃纳尔松', Kristjan: '克里斯蒂安', Kristján: '克里斯蒂安',
  Athenodoros: '阿特诺多罗斯', Leonidas: '列奥尼达', Domitianus: '多米提安努斯', Tullius: '图利乌斯', Cicero: '西塞罗', Minor: '米诺尔', Mahmoud: '马哈茂德', Tarek: '塔里克', Nassr: '纳赛尔', Huda: '胡达', Dhanush: '达努什', Thanawat: '塔纳瓦特',
  Darya: '达里娅', Khosravi: '霍斯拉维', Farahani: '法拉哈尼', Aydin: '艾登', Boran: '博兰', 'Al-Qasim': '阿尔·卡西姆',
  Sviatoslav: '斯维亚托斯拉夫', Melnyk: '梅利尼克', Miroslav: '米罗斯拉夫', Horvat: '霍尔瓦特', OMalley: '奥马利', OBrien: '奥布莱恩', ODonnell: '奥唐奈',
  Aisin: '爱新', Gioro: '觉罗', Niohuru: '钮祜禄', 'Aisin Gioro': '爱新觉罗', 'Aisin Niohuru': '爱新觉罗·钮祜禄', 'Khin Kyi': '钦姬', 'Min Aung Hlaing': '敏昂莱', Kirillovich: '基里尔维奇', Kirilov: '基里洛夫',
  Jayavarman: '阇耶跋摩', Suryavarman: '苏利耶跋摩', Aravind: '阿拉文德', Chettiar: '切蒂亚尔', Michal: '米哈尔', Agnieszka: '阿格涅什卡', Nowak: '诺瓦克', Mkrtchyan: '姆克尔特奇扬', Hakobyan: '哈科比扬',
  Sreedevi: '诗丽黛维', Prakash: '普拉卡什', Ishara: '伊莎拉', Thapa: '塔帕', Qamaniq: '卡马尼克', Kauki: '考基', Ailen: '艾伦', Quilapan: '基拉潘', Nahuel: '纳韦尔', Nahuelpan: '纳韦尔潘',
  Baurzhan: '鲍尔江', Zhaksylykov: '扎克瑟雷科夫', Ainura: '艾努拉', Rakhimov: '拉希莫夫', Yuldashev: '尤尔达舍夫', Ayna: '艾娜', Orazov: '奥拉佐夫', Gurbanov: '古尔巴诺夫',
  Rukhshona: '鲁赫肖娜', Davlatov: '达夫拉托夫', Farrukh: '法鲁赫', Karimov: '卡里莫夫', Goyathlay: '戈亚特莱', Nizhoni: '妮卓妮', Tsosie: '措西', Kahentawaks: '卡亨塔瓦克斯', Jigonsaseh: '吉贡萨塞',
  Vassilis: '瓦西里斯', Nikolaidis: '尼古拉伊迪斯', Pereira: '佩雷拉', Owusu: '奥乌苏', Agyeman: '阿吉耶曼', Jallow: '贾洛', Sy: '西', Thiam: '蒂昂', Sarr: '萨尔', Mbuyi: '姆布伊', Lukusa: '卢库萨', Valiyev: '瓦利耶夫', Aliyev: '阿利耶夫', Zelimkhan: '泽利姆汗', Fonua: '福努阿', Lasoani: '拉索阿尼', 'Al-Najjar': '阿尔·纳贾尔', 'Al-Hakim': '阿尔·哈基姆', Ahyoka: '阿约卡', Tadodaho: '塔多达霍', Kokopelli: '科科佩利', Itzamna: '伊察姆纳', Canul: '卡努尔', Qori: '科里', Ticona: '蒂科纳', Kostas: '科斯塔斯', Dewa: '德瓦', Zainal: '扎伊纳尔', Melayu: '马来', Afia: '阿菲娅', Boateng: '博阿滕', Ifeanyi: '伊费阿尼', Ndiaye: '恩迪亚耶', Kimbangu: '金邦古', Mbemba: '姆本巴', Huseynov: '侯赛因诺夫', Umarov: '乌马罗夫', Ikaika: '伊凯卡', Mchedlidze: '姆切德利泽', Tsiklauri: '齐克劳里',
  'Van den Berg': '范登贝赫', Hendrik: '亨德里克', Maarten: '马尔滕', Koning: '科宁', Jankauskas: '扬考斯卡斯', Kaspars: '卡斯帕尔斯', Dimitrije: '迪米特里耶', Vukovic: '武科维奇', Magomedov: '马戈梅多夫', Giorgi: '吉奥尔吉', Eteri: '埃特里',
})

// Classical and regional names that need language-aware historical readings.
Object.assign(supplementalLocalizedTokens, {
  Achilleus: '阿基里斯', Alexandros: '亚历山大', Demetrios: '德米特里奥斯', Dionysios: '狄奥尼修斯', Nikomachos: '尼科马科斯', Perikles: '伯里克利', Sokrates: '苏格拉底', Theodoros: '西奥多罗斯', Andromache: '安德洛玛刻', Ariadne: '阿里阿德涅', Aspasia: '阿斯帕西娅', Daphne: '达芙妮', Helene: '海伦', Penelope: '佩内洛佩', Thais: '泰伊丝',
  Björnsdóttir: '比约恩斯多蒂尔', Bjornsdottir: '比约恩斯多蒂尔', Kristjánsson: '克里斯蒂安松', Kristjansson: '克里斯蒂安松', Sigríður: '西格丽杜尔', Guðrún: '古德伦', Jónína: '约妮娜', Elín: '埃林',
  Ardashir: '阿尔达希尔', Darius: '大流士', Farhad: '法尔哈德', Kaveh: '卡维', Mehrdad: '梅赫达德', Rostam: '鲁斯塔姆', Shahram: '沙赫拉姆', Anahita: '阿娜希塔', Azar: '阿扎尔', Golnaz: '戈尔娜兹', Mahin: '马欣', Roxana: '罗克珊娜', Shirin: '希琳',
  Nattaya: '纳塔雅', Sasithorn: '萨西通', Siriporn: '西里蓬', Wimonrat: '威蒙拉', Chananan: '查娜南', Rachada: '拉查达', Thipphawan: '蒂帕婉', Thanakorn: '塔纳功',
  Aidan: '艾丹', Ciaran: '基兰', Declan: '德克兰', Eamon: '伊蒙', Finn: '芬恩', Niall: '尼尔', Ronan: '罗南', Aoife: '伊法', Brigid: '布里吉德', Ciara: '基娅拉', Eimear: '埃默尔', Maeve: '梅芙',
  Kelechi: '凯莱奇', Ogunleye: '奥贡莱耶', Abimbola: '阿宾博拉', Fashola: '法绍拉', Getachew: '盖塔丘', Abebe: '阿贝贝', Julius: '尤利乌斯', Mushi: '穆希', Dlamini: '德拉米尼', Mthembu: '姆特姆布',
  Aisin: '爱新', Ula: '乌拉', Jayavarman: '阇耶跋摩', Suryavarman: '苏利耶跋摩', Siv: '西维', Thanawat: '塔纳瓦特',
  Irapuã: '伊拉普阿', Irapua: '伊拉普阿', Isla: '伊斯拉', Anacaona: '阿纳卡奥娜', Gonzalez: '冈萨雷斯', Mere: '梅雷', Tāne: '塔内', Tane: '塔内', Te: '特', Rangi: '朗伊',
  Nuku: '努库', Fonua: '福努阿', Tavita: '塔维塔', Tupou: '图普', Alofa: '阿洛法',
})

// European language packs: common personal names, surnames and patronymic
// endings use established Chinese forms instead of phonetic letter fallback.
Object.assign(supplementalLocalizedTokens, {
  Fletcher: '弗莱彻', Geoffrey: '杰弗里', Carter: '卡特', Howard: '霍华德', Sidney: '西德尼', Francis: '弗朗西斯', Marlowe: '马洛', Spencer: '斯宾塞', Matilda: '玛蒂尔达', Dorothy: '多萝西', Abigail: '阿比盖尔', Cecil: '塞西尔', Cavendish: '卡文迪许',
  Renaud: '雷诺', Hugues: '于格', Thibaut: '蒂博', Blanche: '布朗什', Godefroy: '戈德弗鲁瓦', Isabelle: '伊莎贝尔', Guillaume: '纪尧姆', Adele: '阿黛尔', Melisende: '梅利桑德', Alienor: '阿丽埃诺尔', Aveline: '阿维琳', Suzanne: '苏珊娜', Denis: '德尼', Madeleine: '玛德琳', Marguerite: '玛格丽特', Blaise: '布莱斯', Nicolas: '尼古拉', Rene: '勒内', Laurent: '洛朗', Moreau: '莫罗', Vincent: '樊尚', Fournier: '富尔尼耶',
  Adelheid: '阿德尔海德', Elsbeth: '埃尔斯贝特', Brunhild: '布伦希尔德', Dietrich: '迪特里希', Hildegard: '希尔德加德', Kunigunde: '库尼贡德', Berthold: '贝特霍尔德', Richenza: '里琴察', Walburga: '瓦尔布加', Dorothea: '多罗特娅', Katharina: '卡塔琳娜', Zimmermann: '齐默尔曼', Christoph: '克里斯托夫', Luise: '路易泽', Neumann: '诺伊曼', 'Schäfer': '谢弗', Schaefer: '谢弗', 'Schröder': '施罗德', Schroder: '施罗德',
  Federico: '费德里科', Guido: '圭多', Laudomia: '劳多米娅', Corrado: '科拉多', Benedetto: '贝内代托', Allegra: '阿莱格拉', Fiorella: '菲奥雷拉', Niccolò: '尼科洛', Niccolo: '尼科洛', Michele: '米凯莱', Lucrezia: '卢克莱齐娅', Lavinia: '拉维尼娅', Eleonora: '埃莱奥诺拉', Ottaviano: '奥塔维亚诺', Artemisia: '阿尔泰米西亚',
  Constanza: '康斯坦莎', Berenguela: '贝伦格拉', Leonor: '莱奥诺尔', Guillem: '吉列姆', Sancha: '桑查', Carmen: '卡门', Dolores: '多洛雷斯', Luisa: '路易莎', Ramon: '拉蒙', García: '加西亚',
  Vidar: '维达尔', Ylva: '伊尔瓦', Svanhild: '斯万希尔德', Ragnhild: '拉格希尔德', Gunnhild: '古恩希尔德', Eystein: '埃斯泰因', Ingeborg: '英格博格', Sigurd: '西古尔德',
  Ulfsdóttir: '乌尔夫斯多蒂尔', Ulfsdottir: '乌尔夫斯多蒂尔', Bjornsson: '比约恩松', Halfdansson: '哈尔夫丹松', Haraldsson: '哈拉尔松', Leifsson: '莱夫松', 'Knutsdóttir': '克努茨多蒂尔', Knutsdottir: '克努茨多蒂尔', Haraldsdóttir: '哈拉尔斯多蒂尔', Haraldsdottir: '哈拉尔斯多蒂尔', Olafsdóttir: '奥拉夫斯多蒂尔', Olafsdottir: '奥拉夫斯多蒂尔', Eysteinsdóttir: '埃斯泰因斯多蒂尔', Eysteinsdottir: '埃斯泰因斯多蒂尔', Eiriksdóttir: '埃伊里克斯多蒂尔', Eiriksdottir: '埃伊里克斯多蒂尔', Sigurdsdóttir: '西古尔德斯多蒂尔', Sigurdsdottir: '西古尔德斯多蒂尔',
  Thorvaldsdóttir: '托尔瓦尔兹多蒂尔', Thorvaldsdottir: '托尔瓦尔兹多蒂尔', Bjarnason: '比亚纳松', Grettisson: '格雷蒂松', Egill: '埃吉尔', Egilsdóttir: '埃吉尔斯多蒂尔', Egilsdottir: '埃吉尔斯多蒂尔', Snorradóttir: '斯诺里斯多蒂尔', Snorradottir: '斯诺里斯多蒂尔', Arason: '阿拉松', Leifursson: '莱伊夫松', Hrafnsdóttir: '赫拉夫恩斯多蒂尔', Hrafnsdottir: '赫拉夫恩斯多蒂尔', Aud: '奥德', Auður: '奥杜尔', Kjartansdóttir: '卡贾尔坦斯多蒂尔', Kjartansdottir: '卡贾尔坦斯多蒂尔', Baldursson: '巴尔德松', Kristjansdóttir: '克里斯蒂安斯多蒂尔', Kristjansdottir: '克里斯蒂安斯多蒂尔',
  MacLeod: '麦克劳德', Campbell: '坎贝尔', Murphy: '墨菲', Kelly: '凯利', MacDonald: '麦克唐纳',
  Kovalenko: '科瓦连科', Shevchenko: '舍甫琴科', Bondarenko: '邦达连科', Veselov: '韦谢洛夫', Dragunov: '德拉古诺夫', Bohdan: '博赫丹', Danylo: '达尼洛', Ostap: '奥斯塔普', Vadym: '瓦季姆', Kateryna: '卡捷琳娜', Oksana: '奥克萨娜', Solomiya: '索洛米娅',
  Femke: '费姆克', Liesbeth: '莉丝贝特', Koen: '库恩', Noor: '努尔', Marieke: '玛丽克', Janssen: '扬森', Visser: '菲瑟', Bakker: '巴克尔', 'De Boer': '德布尔',
  Ozols: '奥佐尔斯', Kalnins: '卡尔宁斯', Kalniņš: '卡尔宁什', Petraitis: '佩特莱蒂斯', Daina: '达伊娜', Maarja: '玛尔娅', Inese: '伊内塞', Laima: '莱马', Jānis: '亚尼斯', Janis: '亚尼斯', Andris: '安德里斯', Toomas: '托马斯', Māris: '马里斯', Maris: '马里斯', Tadas: '塔达斯', Bērziņš: '贝尔津什', Berzins: '贝尔津什', Kask: '卡斯克', Aija: '艾娅',
  Petrovic: '佩特罗维奇', Jovanovic: '约万诺维奇', Nikolic: '尼科利奇', Markovic: '马尔科维奇', Kovacevic: '科瓦切维奇', Dimitrov: '迪米特洛夫', Aleksandar: '亚历山大', Goran: '戈兰', Ivan: '伊万', Milan: '米兰', Nikola: '尼古拉', Stefan: '斯特凡', Bojana: '博亚娜', Milena: '米莱娜', Sofija: '索菲娅', Vesna: '维斯娜',
  Mäkinen: '马基宁', Makinen: '马基宁', Nieminen: '尼米宁', Hämäläinen: '海梅莱宁', Hamalainen: '海梅莱宁', Korhonen: '科尔霍宁', Mäkelä: '麦凯拉', Makela: '麦凯拉', Aapo: '阿波', Eero: '埃罗', Juhani: '尤哈尼', Kalevi: '卡莱维', Mikko: '米科', Tapio: '塔皮奥', Veera: '维拉', Kaisa: '凯萨', Marja: '玛尔娅', Sanni: '桑妮', Tuuli: '图利',
  Dumitru: '杜米特鲁', Bardhi: '巴尔迪', Krasniqi: '克拉斯尼奇', Popescu: '波佩斯库', Mirela: '米雷拉', Arben: '阿尔本', Teuta: '特乌塔', Luminita: '卢米妮察', Ioana: '约阿娜', Mihai: '米哈伊', Adelina: '阿德琳娜', Dritan: '德里坦', Ilir: '伊利尔',
  Wladyslaw: '瓦迪斯瓦夫', Wisniewski: '维希涅夫斯基', Jadwiga: '雅德维加', Szymanski: '希曼斯基', Zofia: '佐菲娅', Stanislaw: '斯坦尼斯瓦夫', Piotr: '皮奥特尔', Katarzyna: '卡塔日娜', Irena: '伊雷娜', Malgorzata: '玛尔戈扎塔', Mieszko: '梅什科', Elzbieta: '埃尔兹别塔', Dabrowski: '东布罗夫斯基', Kaminski: '卡明斯基',
  Erzsebet: '伊丽莎白', Laszlo: '拉斯洛', Katalin: '卡塔琳', Zoltan: '佐尔坦', Horvath: '霍尔瓦特', Rozalia: '罗扎莉娅', Szabo: '绍博', Istvan: '伊什特万', Gabor: '加博尔', Judit: '朱迪特', Miklos: '米克洛什', Varga: '瓦尔加', Nagy: '瑙吉', Toth: '托特', Kiss: '基什', Kovacs: '科瓦奇',
  Rodrigues: '罗德里格斯', 'João': '若昂', Joao: '若昂', Afonso: '阿方索', Oliveira: '奥利维拉', Tiago: '蒂亚戈', Rita: '丽塔', Andreas: '安德烈亚斯', Dimitris: '迪米特里斯', Giorgos: '乔治', Eleni: '埃莱妮', Vasiliki: '瓦西莉基', Papadopoulos: '帕帕多普洛斯', Georgiou: '乔治乌',
  Robinson: '罗宾逊', Aurora: '奥罗拉', Louise: '路易丝', Nathan: '纳坦', Rose: '罗斯', Manon: '玛侬', Lund: '伦德', Einarsdóttir: '埃纳尔斯多蒂尔', Einarsdottir: '埃纳尔斯多蒂尔', Aradóttir: '阿拉多蒂尔', Aradottir: '阿拉多蒂尔', Kjartansson: '卡贾尔坦松', Ivanna: '伊万娜', Zielinski: '泽林斯基', Molnar: '莫尔纳',
})

// Norway pack: historical forms follow Norwegian Old Norse usage, while
// modern names and family names use established Norwegian Chinese renderings.
Object.assign(supplementalLocalizedTokens, {
  Harald: '哈拉尔德', Hakon: '哈康', Olav: '奥拉夫', Eirik: '埃里克', Sigurd: '西居尔', Halfdan: '哈尔夫丹', Guttorm: '古托姆', Bjorn: '比约恩', Ragnvald: '拉格瓦尔德', Torstein: '托尔斯泰因', Gudrod: '古德勒德', Egil: '埃吉尔', Havard: '霍瓦尔', Ulf: '乌尔夫', Einar: '埃纳尔', Arne: '阿尔内', Ketil: '凯蒂尔', Rolf: '罗尔夫', Trygve: '特里格韦', Erling: '埃林',
  Astrid: '阿斯特丽德', Ragnhild: '拉格希尔德', Gunnhild: '贡希尔', Asa: '奥萨', Gyda: '居达', Sigrid: '西格丽', Ingeborg: '英格堡', Gudrun: '古德伦', Tora: '托拉', Bergljot: '贝格柳特', Thora: '托拉', Svanhild: '斯万希尔', Helga: '赫尔加', Vigdis: '维格迪丝', Aud: '奥德', Brynhild: '布伦希尔', Geirhild: '盖尔希尔', Runa: '鲁娜', Aslaug: '奥斯劳格', Ragnfrid: '拉格弗丽德',
  Magnus: '马格努斯', Eystein: '埃于斯泰因', Inge: '英格', Sverre: '斯韦勒', Knut: '克努特', Skule: '斯库勒', Bard: '博尔', Jon: '约恩', Pal: '波尔', Audun: '奥敦', Hallvard: '哈尔沃尔', Torfinn: '托尔芬', Erlend: '埃伦', Margrete: '玛格丽特', Kristin: '克里斯廷', Eufemia: '尤费米娅', Agnes: '阿格尼丝', Katarina: '卡塔琳娜', Sunniva: '松妮娃', Cecilia: '塞西莉娅', Solveig: '苏尔薇',
  Jakob: '雅各布', Noah: '诺亚', Emil: '埃米尔', Lucas: '卢卡斯', Oliver: '奥利弗', Isak: '伊萨克', William: '威廉', Filip: '菲利普', Aksel: '阿克塞尔', Henrik: '亨里克', Sondre: '松德雷', Marius: '马里乌斯', Kristian: '克里斯蒂安', Oyvind: '厄于温', Nora: '诺拉', Emma: '艾玛', Ella: '埃拉', Maja: '玛雅', Olivia: '奥利维娅', Ingrid: '英格丽', Sofie: '索菲', Frida: '弗丽达', Hedda: '赫达', Thea: '特娅', Linnea: '林内娅', Tuva: '图娃', Kari: '卡丽', Marit: '玛丽特', Silje: '西莉耶', Hanne: '汉娜', Liv: '丽芙',
  Hansen: '汉森', Johansen: '约翰森', Olsen: '奥尔森', Larsen: '拉森', Andersen: '安德森', Pedersen: '彼得森', Nilsen: '尼尔森', Kristiansen: '克里斯蒂安森', Jensen: '延森', Karlsen: '卡尔森', Johnsen: '约翰森', Pettersen: '佩特森', Eriksen: '埃里克森', Berg: '贝格', Haugen: '豪根', Hagen: '哈根', Johannessen: '约翰内森', Andreassen: '安德烈亚森', Jacobsen: '雅各布森', Dahl: '达尔', Jorgensen: '约根森', Halvorsen: '哈尔沃森', Henriksen: '亨里克森', Sorensen: '瑟伦森', Jakobsen: '雅各布森', Moen: '穆恩', Gundersen: '贡德森', Iversen: '伊弗森', Strand: '斯特兰德',
})

// Lithuanian names keep their native diacritics and use reviewed Chinese
// forms. Historical single names and gendered family-name endings are mapped
// as complete tokens rather than passing through the generic syllable layer.
Object.assign(supplementalLocalizedTokens, {
  Mindaugas: '明道加斯', Vaišvilkas: '瓦伊什维尔卡斯', Traidenis: '特赖德尼斯', Vytenis: '维特尼斯', Gediminas: '格迪米纳斯', Algirdas: '阿尔吉尔达斯', Kęstutis: '科斯图蒂斯', Jogaila: '约盖拉', Vytautas: '维陶塔斯', Švitrigaila: '什维特里盖拉', Žygimantas: '日吉曼塔斯', Karijotas: '卡里约塔斯', Narimantas: '纳里曼塔斯', Liubartas: '柳巴尔塔斯', Butautas: '布陶塔斯', Vaidotas: '瓦伊多塔斯', Skirgaila: '斯基尔盖拉', Andrius: '安德留斯', Lengvenis: '伦格韦尼斯', Tautvilas: '陶特维拉斯', Daumantas: '道曼塔斯', Treniota: '特雷尼奥塔', Vykintas: '维金塔斯', Margiris: '马尔吉里斯', Manvydas: '曼维达斯',
  Morta: '莫尔塔', Birutė: '比鲁特', Aldona: '阿尔多娜', Danutė: '达努特', Rimgailė: '林盖莱', Gaudemunda: '高德蒙达', Aigustė: '艾古斯特', Anastazija: '阿纳斯塔齐娅', Eufemija: '欧费米娅', Marija: '玛丽娅', Ona: '奥娜', Julijona: '尤利约娜', Jadvyga: '雅德维加', Dorota: '多罗塔', Kotryna: '科特里娜', Margarita: '玛格丽塔', Agota: '阿戈塔', Barbora: '巴尔博拉', Cecilija: '塞西莉娅', Beatričė: '贝阿特里切', Aleksandra: '亚历山德拉',
  Mikalojus: '米卡洛尤斯', Jonas: '约纳斯', Kristupas: '克里斯图帕斯', Stanislovas: '斯坦尼斯洛瓦斯', Leonas: '莱奥纳斯', Kazimieras: '卡齐米耶拉斯', Albertas: '阿尔贝塔斯', Jurgis: '尤尔吉斯', Steponas: '斯特波纳斯', Mykolas: '米科拉斯', Motiejus: '莫铁尤斯', Povilas: '波维拉斯', Aleksandras: '亚历山德拉斯', Juozapas: '尤奥扎帕斯', Teresė: '特雷塞', Konstancija: '康斯坦齐娅', Uršulė: '乌尔舒莱',
  Mantas: '曼塔斯', Dominykas: '多米尼卡斯', Jokūbas: '约库巴斯', Nojus: '诺尤斯', Benas: '贝纳斯', Rokas: '罗卡斯', Dovydas: '多维达斯', Paulius: '保留斯', Tomas: '托马斯', Martynas: '马尔蒂纳斯', Arnas: '阿尔纳斯', Justas: '尤斯塔斯', Simas: '西马斯', Gabija: '加比娅', Ieva: '耶娃', Austėja: '奥斯泰娅', Ugnė: '乌格内', Emilija: '埃米莉娅', Liepa: '列帕', Kamilė: '卡米莱', Ema: '埃玛', Luknė: '卢克内', Rugilė: '鲁吉莱', Goda: '戈达', Viltė: '维尔特', Monika: '莫妮卡', Viktorija: '维克托里娅',
  Radvila: '拉德维拉', Goštautas: '戈什陶塔斯', Kęsgaila: '肯斯盖拉', Astikas: '阿斯蒂卡斯', Pacas: '帕察斯', Tiškevičius: '蒂什凯维丘斯', Valavičius: '瓦拉维丘斯', Giedraitis: '吉德赖蒂斯', Alšėniškis: '阿尔谢尼什基斯', Radvilaitė: '拉德维莱特', Goštautaitė: '戈什陶泰特', Kęsgailaitė: '肯斯盖莱特', Astikaitė: '阿斯蒂凯特', Pacaitė: '帕采特', Tiškevičiūtė: '蒂什凯维丘特', Valavičiūtė: '瓦拉维丘特', Giedraitytė: '吉德赖蒂特', Alšėniškytė: '阿尔谢尼什基特', Manvydaitė: '曼维代特',
  Kazlauskas: '卡兹劳斯卡斯', Jankauskas: '扬考斯卡斯', Petrauskas: '彼得劳斯卡斯', Stankevičius: '斯坦克维丘斯', Vasiliauskas: '瓦西廖斯卡斯', Žukauskas: '茹考斯卡斯', Butkus: '布特库斯', Paulauskas: '保劳斯卡斯', Urbonas: '乌尔博纳斯', Kavaliauskas: '卡瓦廖斯卡斯', Rimkus: '林库斯', Ivanauskas: '伊瓦瑙斯卡斯', Balčiūnas: '巴尔丘纳斯', Navickas: '纳维茨卡斯', Savickas: '萨维茨卡斯', Baranauskas: '巴拉瑙斯卡斯', Mikalauskas: '米卡劳斯卡斯', Žilinskas: '日林斯卡斯', Ramanauskas: '拉马瑙斯卡斯', Lukoševičius: '卢科舍维丘斯',
  Kazlauskaitė: '卡兹劳斯凯特', Jankauskaitė: '扬考斯凯特', Petrauskaitė: '彼得劳斯凯特', Stankevičiūtė: '斯坦克维丘特', Vasiliauskaitė: '瓦西廖斯凯特', Žukauskaitė: '茹考斯凯特', Butkutė: '布特库特', Paulauskaitė: '保劳斯凯特', Urbonaitė: '乌尔博奈特', Kavaliauskaitė: '卡瓦廖斯凯特', Rimkutė: '林库特', Ivanauskaitė: '伊瓦瑙斯凯特', Balčiūnaitė: '巴尔丘奈特', Navickaitė: '纳维茨凯特', Savickaitė: '萨维茨凯特', Baranauskaitė: '巴拉瑙斯凯特', Mikalauskaitė: '米卡劳斯凯特', Žilinskaitė: '日林斯凯特', Ramanauskaitė: '拉马瑙斯凯特', Lukoševičiūtė: '卢科舍维丘特',
})

// Reviewed Serbian forms. Historical patronymics stay distinct from modern
// family surnames even when the surface form later became hereditary.
Object.assign(supplementalLocalizedTokens, {
  Stefan: '斯特凡', Vukan: '武坎', Uroš: '乌罗什', Dragutin: '德拉古廷', Milutin: '米卢廷', Dušan: '杜尚', Lazar: '拉扎尔', Vuk: '武克', Branko: '布兰科', Đurađ: '久拉吉', Radoslav: '拉多斯拉夫', Vladislav: '弗拉迪斯拉夫', Predislav: '普雷迪斯拉夫', Prvoslav: '普尔沃斯拉夫', Dragoslav: '德拉戈斯拉夫', Miroslav: '米罗斯拉夫', Dobroslav: '多布罗斯拉夫', Gradislav: '格拉迪斯拉夫', Gojko: '戈伊科', Altoman: '阿尔托曼', Nikola: '尼古拉', Jovan: '约万', Konstantin: '康斯坦丁', Sava: '萨瓦',
  Ana: '安娜', Jelena: '耶莱娜', Milica: '米利察', Simonida: '西莫尼达', Teodora: '特奥多拉', Olivera: '奥利韦拉', Mara: '玛拉', Jefimija: '耶菲米娅', Evdokija: '叶夫多基娅', Anastasija: '阿纳斯塔西娅', Katarina: '卡塔琳娜', Rada: '拉达', Vidosava: '维多萨瓦', Jelisaveta: '耶利萨韦塔', Danica: '达妮察', Angelina: '安格林娜', Jerina: '耶琳娜', Draginja: '德拉吉尼娅', Neda: '内达',
  Karađorđe: '卡拉乔尔杰', Miloš: '米洛什', Petar: '佩塔尔', Aleksa: '阿莱克萨', Jakov: '雅科夫', Matija: '马蒂亚', Ilija: '伊利亚', Stanoje: '斯塔诺耶', Veljko: '韦利科', Sima: '西马', Dositej: '多西泰伊', Stevan: '斯特万', Đorđe: '乔尔杰', Radovan: '拉多万', Milenko: '米连科', Luka: '卢卡', Marko: '马尔科',
  Ljubica: '柳比察', Persida: '佩尔西达', Anka: '安卡', Stana: '斯塔娜', Savka: '萨夫卡', Anđelija: '安杰莉娅', Đurđija: '久尔吉娅', Cveta: '茨韦塔', Jovana: '约瓦娜', Marija: '玛丽娅', Sofija: '索菲娅', Poleksija: '波莱克西娅',
  Nemanja: '内马尼亚', Aleksandar: '亚历山大', Filip: '菲利普', Mihajlo: '米哈伊洛', Anđela: '安杰拉', Tamara: '塔玛拉', Nevena: '内韦娜', Ivana: '伊万娜', Mina: '米娜', Isidora: '伊西多拉', Tijana: '蒂亚娜',
  Jovanović: '约万诺维奇', Petrović: '彼得罗维奇', Nikolić: '尼科利奇', Marković: '马尔科维奇', Đorđević: '乔尔杰维奇', Stojanović: '斯托扬诺维奇', Ilić: '伊利奇', Stanković: '斯坦科维奇', Pavlović: '帕夫洛维奇', Milošević: '米洛舍维奇', Savić: '萨维奇', Popović: '波波维奇', Živković: '日夫科维奇', Lukić: '卢基奇', Ristić: '里斯蒂奇', Radić: '拉迪奇', Kovačević: '科瓦切维奇', Tomić: '托米奇', Đurić: '久里奇', Stevanović: '斯特万诺维奇', Milić: '米利奇', Simić: '西米奇', Kostić: '科斯蒂奇', Mladenović: '姆拉德诺维奇', Milosavljević: '米洛萨夫列维奇', Radosavljević: '拉多萨夫列维奇', Obradović: '奥布拉多维奇', Vasić: '瓦西奇', Maksimović: '马克西莫维奇', Gajić: '加伊奇',
  Stefanović: '斯特凡诺维奇', Vukanović: '武坎诺维奇', Urošević: '乌罗舍维奇', Dragutinović: '德拉古廷诺维奇', Milutinović: '米卢廷诺维奇', Dušanović: '杜尚诺维奇', Lazarević: '拉扎列维奇', Vuković: '武科维奇', Branković: '布兰科维奇', Đurđević: '久尔杰维奇', Vladisavljević: '弗拉迪萨夫列维奇', Predisavljević: '普雷迪萨夫列维奇', Prvosavljević: '普尔沃萨夫列维奇', Dragosavljević: '德拉戈萨夫列维奇', Mirosavljević: '米罗萨夫列维奇', Dobrosavljević: '多布罗萨夫列维奇', Gradisavljević: '格拉迪萨夫列维奇', Gojković: '戈伊科维奇', Altomanović: '阿尔托曼诺维奇', Konstantinović: '康斯坦丁诺维奇', Karađorđević: '卡拉乔尔杰维奇', Aleksić: '阿莱克西奇', Jakovljević: '雅科夫列维奇', Matijević: '马蒂耶维奇', Stanojević: '斯塔诺耶维奇', Veljković: '韦利科维奇', Dositejević: '多西泰耶维奇', Radovanović: '拉多万诺维奇', Milenković: '米连科维奇',
  '《米罗斯拉夫福音书》': '《米罗斯拉夫福音书》', '《杜尚法典》': '《杜尚法典》', '《圣萨瓦法典》': '《圣萨瓦法典》', '《希兰达尔修院规章》': '《希兰达尔修院规章》', '《斯图代尼察修院规章》': '《斯图代尼察修院规章》',
})

// Reviewed Ossetian/Alan forms. These entries deliberately retain the
// Ossetian and Alan corpus instead of borrowing Georgian, Armenian, Azeri,
// Chechen or Dagestani names from neighbouring packs.
Object.assign(supplementalLocalizedTokens, {
  Akhsar: '阿赫萨尔', Akhsartag: '阿赫萨尔塔格', Uruzmag: '乌鲁兹马格', Soslan: '索斯兰', Batraz: '巴特拉兹', Atsamaz: '阿察马兹', Khamyts: '哈米茨', Syrdon: '瑟尔东', Warhag: '瓦尔哈格', Tutar: '图塔尔', Aldar: '阿尔达尔', Durgulel: '杜尔古列尔', Sarosius: '萨罗修斯', Rosmik: '罗斯米克', Alan: '阿兰', Aspar: '阿斯帕尔', Candac: '坎达克', Goar: '戈阿尔', Respendial: '雷斯彭迪亚尔', Sangiban: '桑吉班',
  Satana: '萨塔娜', Dzerassa: '泽拉萨', Agunda: '阿贡达', Azau: '阿扎乌', Bedukha: '贝杜哈', Elda: '埃尔达', Zarina: '扎丽娜', Alana: '阿拉娜', Burdukhan: '布尔杜汗', Maria: '玛丽亚', Satenik: '萨捷尼克', Taghmasib: '塔格马西布', Zalina: '扎丽娜', Fatima: '法蒂玛', Madina: '玛迪娜',
  Kosta: '科斯塔', Akhmet: '艾哈迈特', Aslanbek: '阿斯兰别克', Batradz: '巴特拉兹', Dabe: '达贝', Elbazduko: '埃尔巴兹杜科', Gappo: '加波', Inal: '伊纳尔', Kantemir: '坎捷米尔', Makhambet: '马汉别特', Mysost: '梅索斯特', Soslanbek: '索斯兰别克', Taimuraz: '泰穆拉兹', Tsaray: '察赖', Zaurbek: '扎乌尔别克',
  Anna: '安娜', Aza: '阿扎', Asiat: '阿西娅特', Dzhanetta: '扎涅塔', Liza: '丽莎', Nina: '尼娜', Raisa: '赖莎', Zarema: '扎列玛', Tamara: '塔玛拉', Bella: '贝拉', Lola: '洛拉', Svetlana: '斯韦特兰娜', Kazbek: '卡兹别克', Aslan: '阿斯兰', Zaur: '扎乌尔', Artur: '阿尔图尔', Ruslan: '鲁斯兰', Murad: '穆拉德', Chermen: '切尔缅', Khetag: '赫塔格', Elbrus: '厄尔布鲁士', Arsen: '阿尔森', Diana: '季阿娜', Kristina: '克里斯蒂娜', Marina: '玛丽娜', Elina: '埃莉娜',
  Khetagurov: '赫塔古罗夫', Gagloyev: '加格洛耶夫', Tibilov: '季比洛夫', Sanakoyev: '萨纳科耶夫', Dzhioyev: '吉奥耶夫', Pliev: '普利耶夫', Kabisov: '卡比索夫', Tsarakhov: '察拉霍夫', Dzagurov: '扎古罗夫', Kesaev: '凯萨耶夫', Gazdanov: '加兹达诺夫', Dzasokhov: '扎索霍夫', Mamsurov: '马姆苏罗夫', Tedeyev: '捷杰耶夫', Totoonov: '托托诺夫', Kokoyev: '科科耶夫', Margiyev: '马尔吉耶夫', Valiyev: '瓦利耶夫', Bitarov: '比塔罗夫', Kaloyev: '卡洛耶夫',
  Khetagurova: '赫塔古罗娃', Gagloyeva: '加格洛耶娃', Tibilova: '季比洛娃', Sanakoyeva: '萨纳科耶娃', Dzhioyeva: '吉奥耶娃', Plieva: '普利耶娃', Kabisova: '卡比索娃', Tsarakhova: '察拉霍娃', Dzagurova: '扎古罗娃', Kesaeva: '凯萨耶娃', Gazdanova: '加兹达诺娃', Dzasokhova: '扎索霍娃', Mamsurova: '马姆苏罗娃', Tedeyeva: '捷杰耶娃', Totoonova: '托托诺娃', Kokoyeva: '科科耶娃', Margiyeva: '马尔吉耶娃', Valiyeva: '瓦利耶娃', Bitarova: '比塔罗娃', Kaloyeva: '卡洛耶娃',
})

Object.assign(supplementalLocalizedTokens, {
  Khuddan: '胡丹', Murat: '穆拉特', Sultan: '苏尔坦', Khadzhimurat: '哈吉穆拉特', Dzambolat: '宗博拉特', Soslanbek: '索斯兰别克', Aslanbek: '阿斯兰别克', Kantemir: '坎捷米尔', Nart: '纳尔特', Albeg: '阿尔别格', Totraz: '托特拉兹', Aldarbek: '阿尔达尔别克', Dargav: '达尔加夫', Saukhan: '绍汗', Batradz: '巴特拉兹', Zemfira: '泽姆菲拉', Liana: '莉安娜',
})

// The three calibrated regional packs use reviewed Chinese forms throughout.
// Whole Gaelic surnames and Dutch historical bynames stay intact here, while
// Ukrainian names follow Ukrainian rather than Russian romanization.
Object.assign(supplementalLocalizedTokens, {
  mac: '麦克', ingen: '因根', Áed: '艾德', Colmán: '科尔曼', Domnall: '多姆纳尔', Fergal: '弗格尔', Flann: '弗兰', 'Máel Sechnaill': '马尔·塞赫奈尔', Muirchertach: '默尔赫塔赫', Conall: '科纳尔', Diarmait: '迪尔马特', Cellach: '凯拉赫', Cormac: '科马克', Donnchad: '唐卡德', Loingsech: '洛因谢赫', Congal: '孔加尔', Blathmac: '布拉赫马克', Sechnassach: '塞赫纳萨赫', Cathal: '卡哈尔', Fedlimid: '费德利米德', Tigernach: '蒂尔纳赫', 'Máel Dúin': '马尔·杜因', Suibne: '斯威夫内', Ailill: '阿利尔', 'Cenn Fáelad': '肯·费拉德', Lorcán: '洛尔坎',
  Gormlaith: '戈姆莱思', Mór: '莫尔', Derbforgaill: '德尔布福尔盖尔', Sadb: '萨芙', Bébinn: '贝宾', Cacht: '卡赫特', Dubchoblaig: '杜布霍芙莱格', Aife: '伊法', Eithne: '恩雅', Fínne: '芬妮', Muirenn: '穆伦', Órlaith: '奥拉', Gráinne: '格罗妮娅', Liadain: '利亚丹', Creidne: '克雷德内', Dúnlaith: '杜恩莱思', 'Máel Muire': '马尔·穆雷', Uallach: '乌拉赫', Cairech: '凯雷赫', Íte: '伊特', Samthann: '萨芙恩', Moninne: '莫宁内', Cera: '凯拉', Gobnait: '戈布奈特',
  Toirdelbach: '托尔德尔巴赫', Ruaidrí: '鲁艾德里', Aodh: '埃', Brian: '布赖恩', Conchobhar: '康霍瓦尔', Diarmaid: '迪尔米德', Donnchadh: '唐卡', Eoghan: '欧文', Fearghal: '弗格尔', Tadhg: '泰格', Art: '阿特', Maelseachlainn: '马尔塞赫莱恩', Ragnall: '拉格纳尔', Tomás: '托马斯', Seán: '肖恩', Murchadh: '默尔哈', Flaithbertach: '弗莱贝尔塔赫', 'Giolla Íosa': '吉拉·伊萨', Lochlann: '洛赫兰', Aonghus: '安格斯', Gormflaith: '戈姆芙莱思', Sadhbh: '赛芙', Nuala: '努拉', Finola: '菲诺拉', Mairghréad: '玛格丽德', Caitríona: '卡特里奥娜', Úna: '乌娜', Siobhán: '希沃恩', Áine: '安雅', Orla: '奥拉', Máire: '莫伊拉', Raghnailt: '拉格奈尔特', Eilís: '埃莉什', Fionnghuala: '菲诺拉', Dearbhfhorghaill: '德尔芙福尔盖尔', Sláine: '斯拉妮', Caitlín: '凯特琳', Ailbhe: '阿尔娃',
  Cian: '基安', Cillian: '基利安', Conor: '康纳', Darragh: '达拉', Fionn: '芬恩', Liam: '利亚姆', Oisín: '奥辛', Ciarán: '基兰', Dónal: '多纳尔', Pádraig: '帕德里格', Colm: '科尔姆', Diarmuid: '迪尔米德', Eoin: '欧文', Fiachra: '菲亚赫拉', Lorcan: '洛尔坎', Ruairi: '鲁里', Caoimhe: '基娃', Clodagh: '克洛达', Róisín: '罗辛', Saoirse: '瑟莎', Bríd: '布里德', Fiona: '菲奥娜', Mairéad: '玛丽德', Sinéad: '希内德', Aisling: '阿什琳', Bláthnaid: '布拉娜德', Emer: '埃默', Laoise: '莉莎', Muireann: '穆伦',
  'Ó Néill': '奥尼尔', 'Ó Briain': '奥布赖恩', 'Ó Domhnaill': '奥唐奈', 'Ó Conchobhair': '奥康纳', 'Mac Cárthaigh': '麦卡锡', 'Mac Murchadha': '麦克默罗', 'Ó Súilleabháin': '奥沙利文', 'Ó Máille': '奥马利', 'Ó Ruairc': '奥鲁尔克', 'Mac Diarmada': '麦克德莫特', 'Ó Ceallaigh': '奥凯利', 'Ó Dubhda': '奥杜达', 'Ó Catháin': '奥凯恩', 'Ó Donnchadha': '奥多诺霍', 'Mac Suibhne': '麦克斯威尼', 'Mac Giolla Phádraig': '麦吉拉帕特里克', 'Ó hEidhin': '奥海因', 'Ó Madadháin': '奥马登', 'Mac Aodhagáin': '麦基根', 'Ó Maol Seachlainn': '奥梅洛克林', 'Mac Lochlainn': '麦克洛克林', 'Ó Flaithbheartaigh': '奥弗莱厄蒂',
  "O'Brien": '奥布莱恩', "O'Connor": '奥康纳', "O'Sullivan": '奥沙利文', "O'Neill": '奥尼尔', "O'Donnell": '奥唐奈', "O'Malley": '奥马利', McCarthy: '麦卡锡', Gallagher: '加拉格尔', Byrne: '伯恩', Kennedy: '肯尼迪', Lynch: '林奇', Quinn: '奎因', Brennan: '布伦南', Ryan: '瑞安', Murray: '默里', Flynn: '弗林', Nolan: '诺兰', Donnelly: '唐纳利', Healy: '希利', Keane: '基恩', Connolly: '康诺利', Duffy: '达菲', Reilly: '赖利', Burke: '伯克', Hayes: '海斯',
  Walsh: '沃尔什', Moore: '摩尔',
  Volodymyr: '沃洛德米尔', Sviatopolk: '斯维亚托波尔克', Vsevolod: '弗谢沃洛德', Ihor: '伊霍尔', Oleh: '奥列赫', Rostyslav: '罗斯季斯拉夫', Mstyslav: '姆斯季斯拉夫', Iziaslav: '伊贾斯拉夫', Vasylko: '瓦西尔科', Yurii: '尤里', Andrii: '安德里', Mykhailo: '米哈伊洛', Fedir: '费迪尔', Hlib: '赫利布', Borys: '鲍里斯', Davyd: '达维德', Volodar: '沃洛达尔', Oleksa: '奥列克萨', Bohuslav: '博胡斯拉夫', Yaropolk: '亚罗波尔克', Viacheslav: '维亚切斯拉夫', Volodymyrko: '沃洛德米尔科', Rostislav: '罗斯季斯拉夫', Vsevolodko: '弗谢沃洛德科', Boryslav: '博里斯拉夫', Yurko: '尤尔科', Luka: '卢卡', Klym: '克利姆', Mstyslavko: '姆斯季斯拉夫科',
  Olha: '奥莉哈', Anastasiia: '阿纳斯塔西娅', Yevpraksiia: '叶夫普拉克西娅', Predslava: '普雷德斯拉娃', Dobroniha: '多布罗涅加', Verkhuslava: '韦尔胡斯拉娃', Iryna: '伊琳娜', Eufrosynia: '叶夫弗罗西妮娅', Yelyzaveta: '叶丽扎维塔', Mariia: '玛丽娅', Vyslava: '维斯拉娃', Mstyslava: '姆斯季斯拉娃', Yaroslava: '雅罗斯拉娃', Sviatoslava: '斯维亚托斯拉娃', Bohuslava: '博胡斯拉娃', Dobroslava: '多布罗斯拉娃', Liubava: '柳巴娃', Miloslava: '米洛斯拉娃', Yevfrosyniia: '叶夫弗罗西妮娅', Dobrodiia: '多布罗季娅', Vyshemira: '维舍米拉', Evdokiia: '欧多基娅', Feodosiia: '费奥多西娅', Iuliia: '尤莉娅', Marina: '玛丽娜', Malenka: '玛连卡',
  Petro: '彼得罗', Hryhorii: '赫里霍里', Pavlo: '帕夫洛', Semen: '谢苗', Kyrylo: '基里洛', Vasyl: '瓦西里', Marko: '马尔科', Levko: '列夫科', Nazar: '纳扎尔', Yakiv: '雅基夫', Oleksii: '奥列克西', Yevhen: '叶夫亨', Demian: '德米扬', Lukian: '卢基扬', Martyn: '马尔滕', Olena: '奥列娜', Hanna: '汉娜', Solomiia: '索洛米娅', Nataliia: '娜塔莉娅', Paraska: '帕拉斯卡', Motria: '莫特里娅', Khrystyna: '赫里斯蒂娜', Liubov: '柳博芙', Nadiia: '娜季娅', Sofiia: '索菲娅', Tetiana: '特季娅娜', Yevheniia: '叶夫亨妮娅', Halyna: '哈琳娜', Larysa: '拉里萨', Melaniia: '梅拉妮娅', Roksolana: '罗克索拉娜', Yaryna: '雅琳娜',
  Denys: '杰尼斯', Dmytro: '德米特罗', Maksym: '马克西姆', Oleksandr: '奥列克桑德尔', Viktor: '维克托尔', Artem: '阿尔特姆', Illia: '伊利亚', Matvii: '马特维', Tymofii: '季莫菲', Daryna: '达琳娜', Viktoriia: '维克托里娅', Yuliia: '尤莉娅', Veronika: '韦罗妮卡', Svitlana: '斯维特拉娜',
  Tkachenko: '特卡琴科', Kravchenko: '克拉夫琴科', Kovalchuk: '科瓦尔丘克', Boyko: '博伊科', Savchenko: '萨夫琴科', Marchenko: '马尔琴科', Polishchuk: '波利舒克', Pavlenko: '帕夫连科', Honcharenko: '洪恰连科', Lysenko: '李森科', Oliinyk: '奥利伊尼克', Klymenko: '克利缅科', Kozak: '科扎克', Kushnir: '库什尼尔', Hrytsenko: '赫里岑科', Fedorenko: '费多连科', Petrenko: '彼得连科', Levchenko: '列夫琴科', Moroz: '莫罗兹', Mazur: '马祖尔', Dovzhenko: '多夫任科', Ivashchenko: '伊瓦先科', Zakharchenko: '扎哈尔琴科', Sydorenko: '西多连科', Yaremchuk: '亚列姆丘克',
  Floris: '弗洛里斯', Gijsbrecht: '海斯布雷赫特', Arnoud: '阿尔诺', Diederik: '迪德里克', Lambert: '兰贝特', Reinoud: '赖诺德', Gerard: '赫拉德', Jacob: '雅各布', Claes: '克拉斯', Gerrit: '赫里特', Robrecht: '罗布雷赫特', Boudewijn: '鲍德韦因', Everard: '埃弗拉德', Wouter: '沃特', Aelbrecht: '阿尔布雷赫特', Godfried: '霍德弗里德', Lodewijk: '洛德韦克', Rutger: '吕特赫尔', Zeger: '泽赫尔', Aleid: '阿莱德', Beatrijs: '贝娅特赖斯', Geertruid: '海特勒伊德', Margaretha: '玛赫丽塔', Mechteld: '梅赫特尔德', Hadewijch: '哈德韦赫', Lijsbeth: '莱斯贝特', Machteld: '玛赫特尔德', Cunegonda: '库内洪达', Ermengard: '埃尔门哈德', Heilwig: '海尔维赫', Ida: '伊达', Jutta: '尤塔', Oda: '奥达', Richildis: '里希尔迪斯', Yolande: '约兰德', Berta: '贝尔塔', Ermgard: '埃姆哈德', Kateline: '卡特琳', Lutgardis: '吕特哈迪斯', Mabelia: '马贝莉娅',
  Maurits: '毛里茨', Frederik: '弗雷德里克', Rembrandt: '伦勃朗', Michiel: '米希尔', Christiaan: '克里斯蒂安', Antonie: '安东尼', Cornelis: '科内利斯', Hendrick: '亨德里克', Nicolaes: '尼古拉斯', Adriaen: '阿德里安', Joost: '约斯特', Dirck: '迪尔克', Bartholomeus: '巴托洛梅乌斯', Constantijn: '康斯坦丁', Frans: '弗兰斯', Isaac: '伊萨克', Roelant: '鲁兰特', Catharina: '卡塔里娜', Geertruyd: '海特勒伊德', Aletta: '阿莱塔', Cornelia: '科内莉娅', Elisabeth: '伊丽莎白', Johanna: '约翰娜', Agatha: '阿哈塔', Helena: '海伦娜', Hendrina: '亨德里娜', Jacoba: '雅各芭', Wilhelmina: '威廉明娜', Aeltje: '阿尔切', Grietje: '赫里切', Neeltje: '内尔切', Trijntje: '特赖切', Willemijn: '威勒梅因',
  Daan: '丹', Sem: '塞姆', Luuk: '吕克', Mees: '梅斯', Jesse: '耶瑟', Thijs: '泰斯', Noud: '诺特', Gijs: '海斯', Stijn: '斯泰因', Joris: '约里斯', Wout: '沃特', Mats: '马茨', Teun: '特恩', Jasper: '亚斯珀', Sander: '桑德尔', Ruben: '吕本', Tess: '特丝', Lotte: '洛特', Nora: '诺拉', Fleur: '弗勒尔', Roos: '罗斯', Maud: '莫德', Evi: '埃菲', Lieke: '莉克', Merel: '梅雷尔', Saskia: '萨斯基娅', Anouk: '阿努克', Ilse: '伊尔瑟',
  'van Brugge': '范布鲁赫', 'van Gent': '范亨特', 'van Utrecht': '范乌得勒支', 'van Leiden': '范莱顿', 'van Delft': '范代尔夫特', 'van Haarlem': '范哈勒姆', 'van Dordrecht': '范多德雷赫特', 'van Gouda': '范豪达', 'van Kampen': '范坎彭', 'van Deventer': '范代芬特尔', 'van Breda': '范布雷达', 'van Maastricht': '范马斯特里赫特', 'van Ieper': '范伊普尔', 'van Mechelen': '范梅赫伦', 'van Leuven': '范鲁汶', 'van Zwolle': '范兹沃勒', 'van Middelburg': '范米德尔堡', 'van Groningen': '范格罗宁根', 'van Nijmegen': '范奈梅亨', 'van Zutphen': '范聚特芬', 'van Damme': '范达默', 'van Alkmaar': '范阿尔克马尔',
  Janszoon: '扬松', Jansdochter: '扬斯多赫特', Willemszoon: '威廉松', Willemsdochter: '威廉斯多赫特', Pieterszoon: '彼得松', Pietersdochter: '彼得斯多赫特', Dirkszoon: '迪尔克松', Dirksdochter: '迪尔克斯多赫特', Hendrikszoon: '亨德里克松', Hendriksdochter: '亨德里克斯多赫特', Claeszoon: '克拉斯松', Claesdochter: '克拉斯多赫特', Jacobszoon: '雅各布松', Jacobsdochter: '雅各布斯多赫特', Gerritszoon: '赫里特松', Gerritsdochter: '赫里特斯多赫特', Lambertszoon: '兰贝特松', Lambertsdochter: '兰贝特斯多赫特', Wouterszoon: '沃特松', Woutersdochter: '沃特斯多赫特', de: '德', Smit: '斯米特', Wever: '韦弗', Bakker: '巴克尔', Visser: '菲瑟', Brouwer: '布劳沃', Timmerman: '蒂默曼', Kuiper: '克伊珀', Mulder: '穆尔德尔', Schipper: '斯希珀', Volder: '福尔德尔',
  'de Witt': '德维特', 'van Oldenbarnevelt': '范奥尔登巴讷费尔特', 'de Groot': '德赫罗特', Huygens: '惠更斯', 'van Rijn': '范赖恩', 'de Ruyter': '德勒伊特', Tromp: '特龙普', 'van Leeuwenhoek': '范列文虎克', 'van der Meer': '范德梅尔', 'van Aerssen': '范阿尔森', Bicker: '比克尔', Trip: '特里普', 'De Geer': '德海尔', Coymans: '科伊曼斯', 'van Campen': '范坎彭', 'van Goyen': '范霍延', 'de Keyser': '德凯泽尔', 'van der Helst': '范德赫尔斯特', 'van der Heyden': '范德海登', 'van Honthorst': '范洪特霍斯特', 'van Mierevelt': '范米勒费尔特', 'van Ostade': '范奥斯塔德', 'van de Velde': '范德费尔德', 'de With': '德维特',
  'De Jong': '德容', Jansen: '扬森', 'Van Dijk': '范代克', Meijer: '迈耶尔', 'De Groot': '德赫罗特', Bos: '博斯', Vos: '福斯', Peters: '彼得斯', Hendriks: '亨德里克斯', Dekker: '德克尔', Dijkstra: '戴克斯特拉', 'De Bruin': '德布勒因', 'Van Leeuwen': '范莱文', 'Van der Heijden': '范德海登', 'De Graaf': '德赫拉夫', 'Van Loon': '范隆', Schouten: '斯豪滕', Prins: '普林斯', 'Van Beek': '范贝克', Kramer: '克拉默',
  Petronella: '佩特罗内拉', Max: '马克斯', Mila: '米拉',
})

// Reviewed Chinese forms for the English, French, German and Italian
// calibration batch. Keep these as whole personal-name tokens so display does
// not fall back to letter-by-letter syllable rendering.
Object.assign(supplementalLocalizedTokens, {
  Adam: '亚当', Alan: '艾伦', Baldwin: '鲍德温', Godfrey: '戈德弗里', Laurence: '劳伦斯', Amice: '阿米斯', Constance: '康斯坦丝', Emmeline: '埃梅琳', Juliana: '朱莉安娜', Sybil: '西比尔', Christopher: '克里斯托弗', Deborah: '黛博拉', Esther: '埃丝特', Jonathan: '乔纳森', Katherine: '凯瑟琳', Matthew: '马修', Nathaniel: '纳撒尼尔', Prudence: '普鲁登斯', Daisy: '黛西', Jessica: '杰西卡', Joshua: '约书亚', Phoebe: '菲比', Ruby: '鲁比', Parker: '帕克', Bennett: '贝内特', Foster: '福斯特', Gardner: '加德纳', Marshall: '马歇尔', Porter: '波特', Webb: '韦伯',
  Clément: '克莱芒', Mathis: '马蒂斯', Quentin: '康坦', Romain: '罗曼', Anaïs: '阿娜伊斯', Élodie: '埃洛迪', Maëlle: '玛埃勒', Océane: '奥塞阿娜', Solène: '索莱娜',
  Amelie: '阿梅莉', Ben: '本', Julian: '尤利安', Leonard: '莱昂纳德', Till: '蒂尔', Theresa: '特蕾莎',
  Andrea: '安德烈亚', Nicola: '尼古拉', Stefano: '斯特凡诺', Alessia: '阿莱西亚', Ilaria: '伊拉里娅', Serena: '塞蕾娜',
})

// Reviewed Spanish forms for the former Iberian aggregate pack. Portuguese
// names remain in the independent Portuguese pack and are not reused here.
Object.assign(supplementalLocalizedTokens, {
  Beltrán: '贝尔特兰', Fadrique: '法德里克', Lope: '洛佩', Ruy: '鲁伊', Tello: '特略', Mencía: '门西亚', Toda: '托达', Blanca: '布兰卡', Baltasar: '巴尔塔萨尔', Gaspar: '加斯帕尔', Jerónimo: '赫罗尼莫', Juana: '胡安娜', Francisca: '弗朗西斯卡', Ángela: '安赫拉', Marcos: '马科斯',
  Manrique: '曼里克', Enríquez: '恩里克斯', 'Ponce de León': '庞塞·德·莱昂', 'Fernández de Córdoba': '费尔南德斯·德·科尔多瓦', 'Álvarez de Toledo': '阿尔瓦雷斯·德·托莱多', Fajardo: '法哈多', Osorio: '奥索里奥', Quiñones: '基尼奥内斯', Ayala: '阿亚拉', Zúñiga: '苏尼加', Cabrera: '卡夫雷拉', Sandoval: '桑多瓦尔', Cárdenas: '卡德纳斯',
  Ortega: '奥尔特加', Ramos: '拉莫斯', Vázquez: '巴斯克斯', Ramírez: '拉米雷斯', Gil: '希尔', Serrano: '塞拉诺', Molina: '莫利纳', Suárez: '苏亚雷斯', Blanco: '布兰科', Iglesias: '伊格莱西亚斯', Medina: '梅迪纳', Cortés: '科尔特斯',
})

// Second European audit pass: lower-frequency catalog forms.
Object.assign(supplementalLocalizedTokens, {
  Hoxha: '霍查', Tamm: '塔姆', Beatriz: '贝娅特丽丝', Dijk: '代克', Elira: '埃利拉', Iris: '艾丽斯', Jan: '扬', Katerina: '卡特琳娜', Kowalski: '科瓦尔斯基', Nikos: '尼科斯', Van: '范', Bernard: '贝尔纳', Bram: '布拉姆', Moretti: '莫雷蒂', Taras: '塔拉斯', Bohdana: '博赫达娜', Diogo: '迪奥戈', Leroy: '勒鲁瓦', Magnus: '马格努斯', Michel: '米歇尔', Walsingham: '沃尔辛厄姆',
  Agnes: '阿格妮丝', Ana: '安娜', Barbara: '芭芭拉', Bela: '贝拉', Eszter: '埃斯泰尔', Felix: '菲利克斯', Paul: '保罗', Pieter: '彼得', Rosalia: '罗莎莉娅', Roux: '鲁', Secunda: '塞孔达', Ambre: '安布尔', Aslaksdóttir: '阿斯拉克斯多蒂尔', Aslaksdottir: '阿斯拉克斯多蒂尔', Cooper: '库珀', Eva: '伊娃', Francesca: '弗朗切斯卡', Gudrun: '古德伦', Hermann: '赫尔曼', Katrin: '卡特琳', Maior: '马约尔', Ruta: '鲁塔', Simon: '西蒙', Vira: '薇拉', Vlad: '弗拉德',
  Aurelius: '奥勒留', Caesar: '凯撒', Dirk: '迪尔克', Fiammetta: '菲亚梅塔', Gaspard: '加斯帕尔', Haakonsson: '哈康松', Hugh: '休', Ilona: '伊洛娜', Isabel: '伊莎贝尔', Maximus: '马克西穆斯', Octavius: '奥克塔维乌斯', Rizzo: '里佐', Snorri: '斯诺里', Berg: '贝里', Bran: '布兰', Egillsson: '埃吉尔松', Egle: '埃格莱', Flavius: '弗拉维乌斯', Francisco: '弗朗西斯科', Gertrud: '格特鲁德', Knutsson: '克努特松', Laura: '劳拉', Lefebvre: '勒费弗尔', Nicole: '妮可', Petit: '珀蒂', Petronila: '佩特罗尼拉', Piccarda: '皮卡尔达', Rufus: '鲁弗斯', Sanne: '桑内', Severus: '塞维鲁', Ulfsson: '乌尔夫松',
  Agnese: '阿涅塞', Andras: '安德拉什', Armand: '阿尔芒', August: '奥古斯特', Claudius: '克劳狄乌斯', Cornelius: '科尔内利乌斯', Costanza: '科斯坦察', David: '大卫', Davide: '达维德', Dubois: '迪布瓦', Eiriksson: '埃里克松', Elisabet: '伊丽莎白', Elvira: '埃尔维拉', Emilia: '埃米莉娅', Eriksdóttir: '埃里克斯多蒂尔', Eriksdottir: '埃里克斯多蒂尔', Eriksson: '埃里克松', Eysteinsson: '埃斯泰因松', Fabius: '法比乌斯', Ginevra: '吉内芙拉', Guglielmo: '古列尔莫', Haakonsdóttir: '哈康斯多蒂尔', Haakonsdottir: '哈康斯多蒂尔', Herbert: '赫伯特', Hrefna: '赫雷夫娜', Julia: '朱莉娅', Kazimierz: '卡齐米日', Leifursdóttir: '莱伊富尔斯多蒂尔', Leifursdottir: '莱伊富尔斯多蒂尔', Leon: '莱昂', Lina: '莉娜', Liv: '利芙', Lucas: '卢卡斯', Magnussdóttir: '马格努斯多蒂尔', Magnussdottir: '马格努斯多蒂尔', Magnussson: '马格努斯松', Nicholas: '尼古拉斯', Njállsdóttir: '尼亚尔斯多蒂尔', Njallsdottir: '尼亚尔斯多蒂尔', Njállsson: '尼亚尔松', Njallsson: '尼亚尔松',
})

// Final European character pass from the deterministic fallback audit.
Object.assign(supplementalLocalizedTokens, {
  Jorge: '豪尔赫', Stella: '斯特拉', Bergþóra: '贝尔格索拉', Eirikursdóttir: '埃里库尔斯多蒂尔', Eirikursdottir: '埃里库尔斯多蒂尔', Felipe: '费利佩', Frances: '弗朗西丝', Jorunn: '约伦', Lombardi: '隆巴尔迪', Olavsdóttir: '奥拉夫斯多蒂尔', Olavsdottir: '奥拉夫斯多蒂尔', Ormsson: '奥尔姆松', Pauline: '保琳', Violante: '维奥兰特', Vittoria: '维多利亚', Antonius: '安东尼乌斯', Claude: '克洛德', De: '德', Egilsson: '埃吉尔松', Elias: '埃利亚斯', Eliott: '埃利奥特', Elisa: '埃莉萨', Gemma: '杰玛', Genevieve: '热纳维耶芙', Giorgio: '乔治奥', Hakonsdóttir: '哈康斯多蒂尔', Hakonsdottir: '哈康斯多蒂尔', Halfdansdóttir: '哈尔夫丹斯多蒂尔', Halfdansdottir: '哈尔夫丹斯多蒂尔', Hallgerður: '哈尔格尔杜尔', Hrolfsdóttir: '赫罗尔夫斯多蒂尔', Hrolfsdottir: '赫罗尔夫斯多蒂尔', Jónsdóttir: '约恩斯多蒂尔', Jonsdottir: '约恩斯多蒂尔', Kolbeinsdóttir: '科尔贝因斯多蒂尔', Kolbeinsdottir: '科尔贝因斯多蒂尔', Kristina: '克里斯蒂娜', Leifur: '莱伊富尔', Magnúsardóttir: '马格努萨尔多蒂尔', Magnusardottir: '马格努萨尔多蒂尔', Manuel: '曼努埃尔', Marcel: '马塞尔', Marlene: '玛琳', 'Nuño': '努尼奥', Nuno: '努尼奥', Ragnarsson: '拉格纳松', Sara: '莎拉', Sigrun: '西格伦', Sigurdsson: '西古尔德松', Styrbjornsson: '斯蒂尔比约恩松', Theodor: '西奥多', Walter: '沃尔特',
  Aemilius: '埃米利乌斯', Agrippa: '阿格里帕', Agrippina: '阿格里皮娜', Aldonza: '阿尔东萨', Anton: '安东', Appius: '阿庇乌斯', Arnarsson: '阿纳尔松', Aslaksson: '阿斯拉克松', Baldur: '巴尔杜尔', Bjarnadóttir: '比亚纳多蒂尔', Bjarnadottir: '比亚纳多蒂尔', Caeso: '凯索', Cassius: '卡西乌斯', Cesare: '切萨雷', Cosimo: '科西莫', Drusus: '德鲁苏斯', Egillsdóttir: '埃吉尔斯多蒂尔', Egillsdottir: '埃吉尔斯多蒂尔', Eirikursson: '埃里库尔松', Fausta: '福斯塔', Faustina: '福斯蒂娜', Freja: '弗蕾娅', Giuliano: '朱利亚诺', Gnaeus: '格奈乌斯', Grettisdóttir: '格雷蒂斯多蒂尔', Grettisdottir: '格雷蒂斯多蒂尔', Hadrianus: '哈德良', Hortensia: '霍滕西娅', Hostus: '霍斯图斯', Hrafnsson: '赫拉夫恩松', Hrolfsson: '赫罗尔夫松', Ida: '伊达', Imelda: '伊梅尔达', Ingibjorg: '英吉比约格', Ivarsdóttir: '伊瓦尔斯多蒂尔', Ivarsdottir: '伊瓦尔斯多蒂尔', Joan: '琼', Johanna: '约翰娜', Jules: '朱尔', Kari: '卡丽', Kolbeinsson: '科尔贝因松', Leifsdóttir: '莱夫斯多蒂尔', Leifsdottir: '莱夫斯多蒂尔', Lena: '莉娜', Livia: '莉维娅', Lucretia: '卢克丽霞', Ludovico: '卢多维科', Magnúsarson: '马格努萨尔松', Magnusarson: '马格努萨尔松', Mamercus: '马梅尔库斯', Manius: '马尼乌斯', Marcia: '玛尔基娅', Margherita: '玛格丽塔', Margrete: '玛格丽特', Mattia: '马蒂亚', Mayor: '马约尔', Messalina: '梅萨利娜', Minucia: '米努基娅', Nele: '内勒', Nero: '尼禄', 'Njáll': '尼亚尔', Njall: '尼亚尔', Numerius: '努梅里乌斯', Olav: '奥拉夫', Olavsson: '奥拉夫松', Ormsdóttir: '奥尔姆斯多蒂尔', Ormsdottir: '奥尔姆斯多蒂尔', Oskar: '奥斯卡', Otho: '奥托', Paulina: '保利娜', Pedro: '佩德罗', Plinius: '普林尼乌斯', Porcia: '波尔基娅', Publilia: '普布利利娅', Ragnarsdóttir: '拉格纳斯多蒂尔', Ragnarsdottir: '拉格纳斯多蒂尔', Ramiro: '拉米罗', Sabina: '萨比娜', Samuel: '塞缪尔', Sancho: '桑乔', Sempronia: '森普罗妮娅', Servius: '塞尔维乌斯', Sextus: '塞克斯图斯', Soren: '索伦', Spurius: '斯普里乌斯', Steinarsdóttir: '斯泰纳尔斯多蒂尔', Steinarsdottir: '斯泰纳尔斯多蒂尔', Steinarsson: '斯泰纳松', Styrbjornsdóttir: '斯蒂尔比约恩斯多蒂尔', Styrbjornsdottir: '斯蒂尔比约恩斯多蒂尔', Svensdóttir: '斯文斯多蒂尔', Svensdottir: '斯文斯多蒂尔', Svensson: '斯文松', Tacita: '塔西塔', Tertia: '特尔提娅', Therese: '泰蕾兹', Thurid: '图丽德', Tiberius: '提比略', Torleifsdóttir: '托尔莱夫斯多蒂尔', Torleifsdottir: '托尔莱夫斯多蒂尔', Torstensdóttir: '托尔斯滕斯多蒂尔', Torstensdottir: '托尔斯滕斯多蒂尔', Traianus: '图拉真', Tullia: '图利娅', Ulpia: '乌尔皮娅', Urraca: '乌拉卡', Valerius: '瓦莱里乌斯', Verginia: '维吉尼娅', Veronica: '维罗妮卡', Vespasianus: '韦斯巴芗', Veturia: '维图里娅', Vibius: '维比乌斯', Vicente: '维森特', Victoire: '维克图瓦尔', Vidarsdóttir: '维达尔斯多蒂尔', Vidarsdottir: '维达尔斯多蒂尔', Vincenzo: '文森佐', Vipsania: '维普萨尼娅', Vitellius: '维特利乌斯',
  Ivarsson: '伊瓦尔松', Jaime: '海梅', Thorvaldsson: '托尔瓦尔松', Arnar: '阿纳尔', Catalina: '卡塔利娜', Filippo: '菲利波', Henriette: '亨丽埃特', Jonas: '约纳斯', Olafsson: '奥拉夫松', Piero: '皮耶罗', Alba: '阿尔巴', Alvar: '阿尔瓦尔', Gunnarsdóttir: '贡纳尔斯多蒂尔', Gunnarsdottir: '贡纳尔斯多蒂尔', Halla: '哈拉', Jade: '杰德', Jimena: '希梅娜', Pelayo: '佩拉约', Raffaello: '拉斐洛', Ruggero: '鲁杰罗', Teresa: '特蕾莎', Torleifsson: '托尔莱夫松', Vidarsson: '维达尔松', Eirik: '埃里克', Eirikur: '埃里库尔', Bardsson: '巴德松', Bardsdóttir: '巴德斯多蒂尔', Bardsdottir: '巴德斯多蒂尔', Mercedes: '梅塞德斯', Simonetta: '西莫内塔', Arnarsdóttir: '阿纳尔斯多蒂尔', Arnarsdottir: '阿纳尔斯多蒂尔', Baldursdóttir: '巴尔杜尔斯多蒂尔', Baldursdottir: '巴尔杜尔斯多蒂尔', Lukas: '卢卡斯', Snorrason: '斯诺拉松', Torstensson: '托尔斯滕松', Moritz: '莫里茨', Unn: '温恩',
})

// Shared European glossary for places, institutions and material culture.
// These are translated by meaning; personal names remain phonetic/curated.
Object.assign(supplementalLocalizedTokens, {
  royal: '王室', League: '联盟', league: '联盟', seal: '印章', Order: '骑士团', order: '秩序', Hanseatic: '汉萨', signet: '印戒', iron: '铁制', Clan: '氏族', clan: '氏族', Senate: '元老院', shield: '盾牌', rapier: '花剑', rune: '卢恩', mask: '面具', Thing: '议会', brooch: '胸针', ledger: '账册', Smiths: '铁匠', sword: '剑', the: '的', Casa: '商馆', heraldic: '纹章', Knights: '骑士', seax: '海战短剑', tablet: '石板', wax: '蜡制', lute: '鲁特琴', Spartan: '斯巴达', Teutonic: '条顿', Assembly: '议会', Royal: '王室', Society: '学会', Bourbon: '波旁', Forest: '森林', Imperial: '帝国', round: '圆形', key: '钥匙', stone: '石', codex: '法典', family: '家族', masquerade: '假面', shoes: '鞋', wool: '羊毛', arms: '纹章', coat: '外衣', embroidered: '刺绣', stiletto: '短剑', Habsburg: '哈布斯堡', Landsknecht: '兰茨克内希特', Orthodox: '东正教', Brotherhood: '兄弟会', charter: '特许状', 'fleur-de-lis': '鸢尾花', Praetorian: '禁卫军', Avignon: '阿维尼翁', Reims: '兰斯', Medici: '美第奇', Musketeers: '火枪手', Sea: '海', Abbey: '修道院', cloak: '斗篷', mark: '马克', Temple: '神殿', chart: '海图', longship: '长船', North: '北方', Papal: '教皇', rosary: '玫瑰经', School: '学院', University: '大学', Merchants: '商人', ducat: '达克特', Diet: '议会', Gens: '氏族', Gondoliers: '贡多拉船夫', knarr: '克纳尔船', kylix: '基利克斯杯', olive: '橄榄', Valois: '瓦卢瓦', amphora: '双耳瓶', astrolabe: '星盘', coin: '钱币', glass: '玻璃', lance: '长枪', letter: '书信', Murano: '穆拉诺', Oddi: '奥迪', Agoge: '斯巴达教育', Balkan: '巴尔干', Brittany: '布列塔尼', Danube: '多瑙河', Lancaster: '兰开斯特', longsword: '长剑', theatre: '剧院', Academy: '学院', azulejo: '阿兹勒瓷砖', Carpathian: '喀尔巴阡', Champagne: '香槟', Ecclesia: '公民大会', Jagiellonian: '雅盖隆', "King's": '国王的', laurel: '月桂', Noble: '贵族', parchment: '羊皮纸', Priesthood: '祭司团', Sejm: '瑟姆议会', Sforza: '斯福尔扎', Swabian: '施瓦本', tapestry: '挂毯', Thor: '托尔', Travelling: '流动', vest: '背心', Weavers: '织工', Yngling: '英格林', Aachen: '亚琛', alembic: '蒸馏器', Althing: '阿尔庭', amber: '琥珀', ampulla: '圣油瓶', aquila: '鹰旗', Arcadian: '阿卡迪亚', Birka: '比尔卡', Borgarfjordur: '博加峡湾', bouzouki: '布祖基琴', Cossack: '哥萨克', da: '达', Diarchy: '双王制', Eleusinian: '厄琉息斯', francisque: '法兰克战斧', Host: '军团', India: '印度', "Jarl's": '雅尔的', Lübeck: '吕贝克', mittens: '连指手套', Mysteries: '秘仪', Norwegian: '挪威的', 'Saint-Denis': '圣但尼', See: '主教区', Thingvellir: '辛格维利尔', Veche: '维彻议会', Bible: '圣经', Bologna: '博洛尼亚', Church: '教会', claymore: '双手剑', cloth: '布料', fishskin: '鱼皮', hoplon: '重盾', Hussar: '骠骑兵', Iona: '艾奥纳', kantele: '坎特莱琴', krater: '克拉泰尔杯', opanci: '奥潘齐鞋', Portuguese: '葡萄牙的', Regiment: '团', Rome: '罗马', rushnyk: '鲁什尼克', Ulfberht: '乌尔夫贝赫特', Voivode: '总督', yatagan: '亚塔甘刀', arm: '臂环', Arte: '行会', Delian: '提洛', della: '德拉', Epidaurus: '埃皮达鲁斯', Eyrarbakki: '埃伊拉尔巴基', Genova: '热那亚', Hermandad: '兄弟会', icon: '圣像', Italian: '意大利的', Jesus: '耶稣', knife: '刀', Navigators: '航海者', Olympia: '奥林匹亚', Oracle: '神谕', paper: '纸', praetexta: '饰边长袍', Skálholt: '斯考尔霍特', Templar: '圣殿骑士', Trastamara: '特拉斯塔马拉', Turku: '图尔库', Village: '村落', windmill: '风车', wycinanki: '剪纸', amulet: '护符', Appia: '阿庇亚', Aragon: '阿拉贡', Atreus: '阿特柔斯', Band: '队伍', Borgarfjörður: '博加峡湾', Boule: '议事会', Castile: '卡斯蒂利亚', Gragas: '格拉加斯', Hajduk: '海杜克', harness: '马具', Harper: '竖琴师', Hólar: '霍拉尔', horse: '马', Kalevala: '卡勒瓦拉', Krakow: '克拉科夫', Mjolnir: '雷神之锤', Novgorod: '诺夫哥罗德', Rhodes: '罗得岛', Riga: '里加', sacred: '神圣', saga: '萨迦', Samos: '萨摩斯', Saxony: '萨克森', torch: '火炬', Torino: '都灵', vellum: '犊皮纸', Via: '大道', wooden: '木制', zither: '齐特琴', Aarhus: '奥胡斯', Aegean: '爱琴', Akranes: '阿克拉内斯', Antioch: '安条克', Bavaria: '巴伐利亚', Calatrava: '卡拉特拉瓦', College: '学院', Compostela: '孔波斯特拉', corona: '冠冕', Danish: '丹麦的', dory: '多利鱼叉', Dubrovnik: '杜布罗夫尼克', Ferrara: '费拉拉', Gdansk: '格但斯克', Herculaneum: '赫库兰尼姆', Jupiter: '朱庇特', Karelia: '卡累利阿', Kautokeino: '考托凯诺', Knossos: '克诺索斯', Lviv: '利沃夫', Madeira: '马德拉', Mycenae: '迈锡尼', Myvatn: '米湖', Ostia: '奥斯提亚', ostrakon: '陶片', Pisa: '比萨', Pompeii: '庞贝', Reykjavik: '雷克雅未克', Salamanca: '萨拉曼卡', Sicily: '西西里', Skye: '斯凯', Stockholm: '斯德哥尔摩', Arno: '阿诺河', Borg: '博尔格', Borgarnes: '博尔加内斯', Celtic: '凯尔特', Curonian: '库尔什', Delft: '代尔夫特', Faroe: '法罗', Fjord: '峡湾', Fur: '毛皮', General: '三级会议', Ibera: '伊比利亚', Palatine: '帕拉蒂尼', pendant: '吊坠', Pest: '佩斯', Piast: '皮雅斯特', Ravenna: '拉文纳', Roskilde: '罗斯基勒', saber: '马刀', Saimaa: '塞马湖', Shipping: '航运', Spit: '沙嘴', States: '三级会议', szabla: '萨布拉佩剑', Transylvania: '特兰西瓦尼亚', Vik: '维克', Britannia: '不列颠尼亚', Bucharest: '布加勒斯特', Cordoba: '科尔多瓦', matyo: '马焦刺绣', Nidaros: '尼达罗斯', Senatus: '元老院', Sturlungar: '斯图伦加尔', Tanners: '制革工', Tiber: '台伯河', Vistula: '维斯瓦河', Bardic: '吟游诗人的', comb: '梳子', Delta: '三角洲', Montreal: '蒙特利尔', Rhine: '莱茵河', Seigneurial: '领主的', Thessaly: '色萨利', Tirana: '地拉那', whalebone: '鲸骨', Group: '团体', Herding: '牧放', Kyiv: '基辅', Louisiana: '路易斯安那', Miners: '矿工', Musician: '乐师', Reindeer: '驯鹿', Salt: '盐业', Thessaloniki: '塞萨洛尼基', voyageur: '旅行者', canoe: '独木舟', Circle: '圈会', gusle: '古斯莱琴', Helsinki: '赫尔辛基', Inari: '伊纳里', Joik: '约伊克', Lawrence: '劳伦斯', Parish: '教区', reindeer: '驯鹿', Sápmi: '萨普米', Siida: '西伊达', sled: '雪橇', St: '圣', tuque: '图克帽',
})

Object.assign(supplementalLocalizedTokens, {
  ring: '戒指', Santiago: '圣地亚哥', sash: '腰带', de: '德', Nobiliaria: '贵族团', wreath: '花环', Holar: '霍拉尔', Skalholt: '斯考尔霍特', real: '里亚尔', Shield: '盾牌', Great: '伟大的', Hospitaller: '医院骑士团', Tagus: '塔霍河', Templars: '圣殿骑士', tile: '瓷砖', Venice: '威尼斯', Bristol: '布里斯托尔', bronze: '青铜', cuirass: '胸甲', Livonian: '利沃尼亚', merchant: '商人', Shepherd: '牧羊人', Camp: '营地', chessman: '棋子', Fugger: '富格尔', gladius: '罗马短剑', pilum: '罗马投枪', walrus: '海象', aspis: '阿斯庇斯盾', Chapter: '分团', fiddle: '小提琴', Lana: '羊毛', Reformed: '改革宗', aureus: '奥里斯', Estridsen: '埃斯特里德森', Kaupang: '考庞', Landnamabok: '兰德纳姆博克', Legio: '军团', Miletus: '米利都', signum: '军旗', Tours: '图尔', X: '十', Azulejo: '阿苏莱霍', Boatbuilders: '造船工', City: '市', Collegium: '学院', cross: '十字架', guild: '行会', Hedeby: '海德比', Isafjordur: '伊萨菲厄泽', Logretta: '洛格雷塔', Mercatorum: '商人', Odin: '奥丁', portolan: '航海图', toga: '托加', Workshop: '工坊', birchbark: '桦树皮', Cornelia: '科尔内莉娅', Peloponnesian: '伯罗奔尼撒', Plymouth: '普利茅斯', runestone: '卢恩石', Sherwood: '舍伍德', Viking: '维京', barge: '驳船', bone: '骨制', canal: '运河', Carthage: '迦太基', dice: '骰子', Dresden: '德累斯顿', embroidery: '刺绣', flask: '瓶', Garonne: '加龙河', Islands: '群岛', Lincoln: '林肯', puukko: '普克刀', Regensburg: '雷根斯堡', Road: '道路', spear: '长矛', Trade: '贸易', Varangian: '瓦兰吉', Versailles: '凡尔赛', wine: '葡萄酒', drinking: '饮用', Elder: '长老', Hellespont: '赫勒斯滂', Icelandic: '冰岛的', jambiya: '詹比亚', linen: '亚麻', Mantua: '曼图亚', Plebs: '平民', sabre: '马刀', Scriptorium: '抄经院', scutum: '罗马方盾', Tribunate: '保民官团', vadmal: '瓦德马尔', Athenian: '雅典的', Coimbra: '科英布拉', Contratacion: '商业院', Cooperative: '合作社', cup: '杯', Festival: '节庆', flute: '长笛', Iberian: '伊比利亚的', Kumpania: '坎帕尼亚', Monastery: '修道院', Mountain: '山地', shepherd: '牧羊', Song: '歌谣', Visby: '维斯比', 'animal-head': '兽首', cauldron: '大锅', crown: '王冠', Poitiers: '普瓦捷', prow: '船首', torc: '项圈', triumphalis: '凯旋的', Venetian: '威尼斯的', Vilnius: '维尔纽斯', Board: '委员会', Burgos: '布尔戈斯', Cadiz: '加的斯', Capua: '卡普阿', caravel: '卡拉维尔船', 'csikós': '奇科什', Kattegat: '卡特加特', Macedon: '马其顿', Magyar: '马扎尔', Mantova: '曼托瓦', model: '模型', Shannon: '香农', Water: '水务', whip: '鞭', Argos: '阿尔戈斯', Belgrade: '贝尔格莱德', buckle: '扣饰', Carpathians: '喀尔巴阡山脉', Egilsstadir: '埃伊尔斯塔济', fado: '法多', guitar: '吉他', Hamburg: '汉堡', Lombardy: '伦巴第', Lubeck: '吕贝克', spatha: '斯帕塔', Tallinn: '塔林', Warsaw: '华沙', Bruges: '布鲁日', Connemara: '康尼马拉', Dnipro: '第聂伯罗', Druzhina: '德鲁日纳', harp: '竖琴', Hofn: '霍芬', Parliament: '议会', Sámi: '萨米', Syracuse: '锡拉库萨', Utrecht: '乌得勒支', Basin: '盆地', Buda: '布达', Ebro: '埃布罗', Kalmar: '卡尔马', Lisbon: '里斯本', Vestal: '维斯塔', Virgins: '贞女', Amsterdam: '阿姆斯特丹', Balearic: '巴利阿里', Debrecen: '德布勒森', bois: '林木', brass: '黄铜', Coastal: '沿海', Company: '公司', Coureur: '猎人', des: '的', drum: '鼓', Fishing: '渔业', kettle: '水壶', Quebec: '魁北克', 'gákti': '加克蒂',
})

Object.assign(supplementalLocalizedTokens, { Gallia: '高卢', horn: '号角', Finnmark: '芬马克', kuksa: '库克萨' })

// Shared semantic glossary for the non-person catalogs. Most reference pools
// intentionally keep their native terms in the source field, but their
// display label should read naturally in Chinese instead of falling through
// to a phonetic rendering of an English descriptor.
Object.assign(supplementalLocalizedTokens, {
  manuscript: '手稿', woven: '编织', Trading: '贸易', Sultanate: '苏丹国', lamp: '灯', Island: '岛', Office: '署',
  feather: '羽毛', Longhouse: '长屋', Bay: '湾', Coast: '海岸', bowl: '碗', blanket: '毯', Community: '社群', Post: '驿站',
  Empire: '帝国', shell: '贝壳', copper: '铜制', Caravanserai: '商旅驿站', Market: '市场', Dynasty: '王朝', Bazaar: '集市',
  Merchant: '商人', Silk: '丝绸', bag: '袋', robe: '长袍', Kingdom: '王国', turquoise: '绿松石', Keepers: '守护者', bell: '铃',
  palm: '棕榈', compass: '罗盘', headdress: '头饰', Caucasus: '高加索', Guarani: '瓜拉尼', Cape: '海角', Eagle: '鹰',
  calabash: '葫芦', Frontier: '边疆', Hunters: '猎人', belt: '腰带', Pacific: '太平洋', watch: '怀表', Highlands: '高地',
  Oyo: '奥约', Confederacy: '邦联', scroll: '卷轴', tray: '托盘', book: '书册', House: '家族',
  Court: '宫廷', Palace: '王宫', Temple: '神殿', River: '河', Lake: '湖', Mountains: '山脉', Desert: '沙漠', Valley: '谷地',
  Road: '道路', Guild: '行会', Council: '议会', Guard: '卫队', School: '学院', Circle: '团', Company: '公司',
  Foundation: '基金会', Society: '社团', Network: '网络', Village: '村落', Camp: '营地', Group: '团体',
  City: '城', Port: '港', Sea: '海', Forest: '森林', Plain: '平原', Ridge: '山脊',
  Great: '大', Upper: '上', Lower: '下', Eastern: '东部', Western: '西部', Northern: '北部', Southern: '南部',
  Red: '红', Blue: '蓝', Black: '黑', White: '白', Green: '绿', Golden: '金色', Silver: '银色', Stone: '石',
  Wooden: '木制', wooden: '木制', Bronze: '青铜', bronze: '青铜', Iron: '铁制', iron: '铁制', Gold: '金制', gold: '金制',
  Royal: '王室', Imperial: '帝国', Sacred: '神圣', sacred: '神圣', Ancient: '古老的', Anciently: '古代的',
  Traditional: '传统的', traditional: '传统的', Coastal: '沿海的', coastal: '沿海的', Mountain: '山地', mountain: '山地',
  Warriors: '武士', Warrior: '武士', Priests: '祭司', Priest: '祭司', Scribes: '书记官', Elder: '长老', Elders: '长老',
  Weavers: '织工', Weaver: '织工', Smiths: '铁匠', Smith: '铁匠', Hunter: '猎人', Traders: '商人',
  Navigators: '航海者', Navigation: '航海', Voyaging: '航行', Voyagers: '航海者', Fishing: '渔业', Fishermen: '渔民',
  Pastoral: '牧业', Herding: '牧放', Horse: '马', Horses: '马匹', Breeders: '牧马人', Caravan: '商队', Caravans: '商队',
  Trade: '贸易', Merchants: '商人', Markets: '市场',
  Cloth: '布料', cloth: '布料', Textile: '织物', textile: '织物', Wool: '羊毛', wool: '羊毛', Linen: '亚麻', linen: '亚麻',
  Leather: '皮革', leather: '皮革', wood: '木材', Fiber: '纤维', fiber: '纤维', Bead: '珠饰', Beads: '珠饰',
  Necklace: '项链', necklace: '项链', Pendant: '吊坠', pendant: '吊坠', Crown: '王冠', crown: '王冠', Mask: '面具', mask: '面具',
  Drum: '鼓', drum: '鼓', Flute: '笛', flute: '笛', Sword: '剑', sword: '剑', Spear: '矛', spear: '矛', Bow: '弓', bow: '弓',
  Knife: '刀', knife: '刀', Shield: '盾', shield: '盾', Saddle: '马鞍', saddle: '马鞍', Tent: '帐篷', tent: '帐篷',
  Canoe: '独木舟', canoe: '独木舟', Boat: '船', boat: '船', Banner: '旗帜', banner: '旗帜', Seal: '印章', seal: '印章',
  Scroll: '卷轴', Book: '书册', Tablet: '石板', tablet: '石板', Lamp: '灯',
  Jar: '罐', jar: '罐', Cup: '杯', cup: '杯', Vessel: '器皿', vessel: '器皿', Pot: '陶罐', pot: '陶罐', Ring: '戒指', ring: '戒指',
  Bell: '铃', Whip: '鞭', whip: '鞭', Staff: '权杖', staff: '权杖', Bundle: '包裹', bundle: '包裹',
  Parka: '派克大衣', cloak: '斗篷', Cloak: '斗篷', Robe: '长袍', Shoes: '鞋', shoes: '鞋', Hat: '帽', hat: '帽',
  Wreath: '花环', wreath: '花环', Ornament: '饰物', ornament: '饰物',
})

// High-frequency Asian names found by the regional coverage audit.
Object.assign(supplementalLocalizedTokens, {
  Memet: '买买提', Mirzaev: '米尔扎耶夫', Hala: '哈拉', Akhmadov: '艾哈迈多夫', Mukherjee: '慕克吉', Phan: '潘', Koto: '科托', Bekov: '别科夫', Usmonov: '乌斯马诺夫', Gurung: '古隆', Mambetov: '马姆别托夫', Saparov: '萨帕罗夫', Qasimi: '卡西米', Sanjay: '桑贾伊', Soran: '索兰', Kulkarni: '库尔卡尔尼', Perera: '佩雷拉', Mchedlishvili: '姆切德利什维利', Rashid: '拉希德', Berdimuhamedov: '别尔德穆罕默多夫', Fuca: '富察', Yazov: '亚佐夫', 'Ağa': '阿迦', 'Çelebi': '切莱比', Rahmonov: '拉赫蒙诺夫', Safavi: '萨法维', Yusupov: '尤苏波夫', Barzani: '巴尔扎尼', Butt: '巴特', Shah: '沙阿', Yulduz: '尤尔杜兹', Ablimit: '阿布里米特', Desai: '德赛', Namboothiri: '南布迪里', Tulegenov: '图列盖诺夫', Sarsembayev: '萨尔森巴耶夫', Shrestha: '什雷斯塔', Sikumbang: '西库姆邦', Wali: '瓦利', Hegde: '赫格德', Khem: '赫姆', Roy: '罗伊', Chaniago: '查尼亚戈', Gulnar: '古尔娜尔', 'Köprülü': '柯普吕吕', Gulchehra: '古尔切赫拉', Isakov: '伊萨科夫', Kadyrov: '卡德罗夫', Kavtaradze: '卡夫塔拉泽', Madhuri: '玛杜丽',
  Sargsyan: '萨尔基相', Hossain: '侯赛因', Piliang: '皮利昂', Tursun: '图尔孙', Sok: '索克', Sokollu: '索科鲁', Abdulla: '阿卜杜拉', Pasha: '帕夏', Qaderi: '卡迪里', Daryaei: '达里亚伊', Mammadov: '马马多夫', Yusup: '优素甫', Azadi: '阿扎迪', Chatterjee: '查特吉', Gul: '古尔', Abdiev: '阿卜迪耶夫', Hewleri: '赫夫莱里', Patil: '帕蒂尔', Sevda: '塞夫达', Imran: '伊姆兰', Nargiz: '纳尔吉兹', Parekh: '帕雷克', Kemal: '凯末尔', Akhmetov: '阿赫梅托夫', Puti: '普蒂', Zagrosi: '扎格罗斯', Ahmadi: '艾哈迈迪', Farzana: '法尔扎娜', Dauren: '道连', Deshmukh: '德什穆克', Farzona: '法尔佐娜', Kaur: '考尔', Dara: '达拉', Joshi: '乔希', Kanykei: '坎凯', Nisha: '妮莎', Sen: '森', Shahnoza: '沙赫诺扎', Aigerim: '艾格里姆', 'Al-Karim': '阿尔·卡里姆', Annayev: '安纳耶夫', Guwalgiya: '瓜尔吉娅', Mahri: '马赫里', Mahsa: '马赫萨', Nguyen: '阮', Venkatesh: '文卡特什', Aminat: '阿米娜特', Bobur: '巴布尔',
  Petrosyan: '彼得罗相', Nurgaliyev: '努尔加利耶夫', Usmanov: '乌斯马诺夫', Gill: '吉尔', Rani: '拉妮', 'Al-Hassan': '阿尔·哈桑', 'Al-Mansur': '阿尔·曼苏尔', Malik: '马利克', Patimat: '帕蒂玛特', Ali: '阿里', Yazdani: '亚兹达尼', 'Al-Farisi': '阿尔·法里西', Bose: '博斯', Pallavi: '帕拉维', Awan: '阿万', Bahrom: '巴赫罗姆', Dana: '达娜', Dilnoza: '迪尔诺扎', Nargis: '纳尔吉丝', Ruqiye: '鲁齐耶', Sujata: '苏贾塔', Zarema: '扎列玛', Kamol: '卡莫尔', Elchin: '埃尔钦', Gurban: '古尔班', Abdullah: '阿卜杜拉', Jamshid: '贾姆希德', Safiye: '萨菲耶', Suhrob: '苏赫罗布', Taalai: '塔阿莱', Thi: '蒂', Tun: '敦', Aygul: '艾古丽', Gulnisa: '古丽妮莎', Jasur: '贾苏尔', Madina: '玛迪娜', Malika: '马利卡', Mutiara: '穆蒂亚拉', Ogul: '奥古尔', Serdar: '塞尔达尔', Begimai: '贝吉迈', Bekbolot: '贝克博洛特', Fauzan: '福赞', Jamal: '贾迈勒', Malini: '玛丽妮', Manas: '玛纳斯', Nawid: '纳维德', Nursultan: '努尔苏丹', Revathi: '雷瓦蒂', Zuhre: '祖赫拉',
  Khamzat: '哈姆扎特', Shetty: '谢蒂', Yalkun: '亚尔昆', Yildiz: '伊尔迪兹', Gulzat: '古尔扎特', Zubair: '祖拜尔', Atamyrat: '阿塔穆拉特', Gulzira: '古尔齐拉', Rashad: '拉沙德', Rizki: '里兹基', Dilan: '迪兰', Erlan: '叶尔兰', Kamal: '卡迈勒', Nasrin: '纳斯林', Sabit: '萨比特', Suraj: '苏拉杰', Andam: '安丹', Bundo: '布恩多', Kavita: '卡维塔', Nargiza: '纳尔吉扎', Abdukerim: '阿卜杜克里姆', Azamat: '阿扎马特', Bikash: '比卡什', Das: '达斯', Hang: '杭', Hetal: '赫塔尔', Kossomak: '科索马', Mahire: '马希尔', Munire: '穆妮拉', Narek: '纳列克', Oraz: '奥拉兹', Zelal: '泽拉尔', Aibek: '艾别克', Aset: '阿塞特', Ayesha: '阿伊莎', Chandra: '钱德拉', Cholpon: '乔尔蓬', Dattatreya: '达塔特雷亚', Kubanych: '库巴内奇', Meerim: '梅里姆', Sharmila: '莎米拉', Arindam: '阿林达姆', Arslan: '阿尔斯兰', Ayla: '艾拉', Beridze: '贝里泽', Krishna: '克里希纳', Madhav: '马达夫', Mahina: '玛希娜', Murat: '穆拉特', Rustam: '鲁斯塔姆',
  Tural: '图拉尔', Aygun: '艾贡', Indradevi: '因陀罗黛维', Rina: '莉娜', Sultan: '苏丹', Sowmya: '索米娅', Berfin: '贝尔芬', Mihrimah: '米赫里玛', Mirzo: '米尔佐', Sona: '索娜', Wanggiyan: '完颜', Ammu: '阿姆', Hürrem: '许蕾姆', Rajo: '拉佐', Ramesh: '拉梅什', Khalid: '哈立德', 'Kösem': '科塞姆', Berdy: '别尔迪', Iqra: '伊克拉', Jaswinder: '贾斯温德尔', Mehak: '梅哈克', Sitora: '西托拉', Zarina: '扎丽娜', Aha: '阿哈', Aslan: '阿斯兰', Aynur: '艾努尔', Hamid: '哈米德', Madhavan: '马达文', Vannak: '万纳克', Abhijit: '阿比吉特', Eli: '伊莱', Noy: '诺伊', Snehal: '斯内哈尔', Alp: '阿尔普', Dilara: '迪拉拉', Fa: '法', Haval: '哈瓦尔', Lala: '拉拉', Murad: '穆拉德', Ngum: '恩古姆', Parwana: '帕尔瓦娜', Shamil: '沙米尔', Zara: '扎拉', Bayan: '巴彦', Dao: '道', Dorgon: '多尔衮', Dzhabrail: '贾布拉伊尔', Hada: '哈达', Karwan: '卡尔万', Leyla: '莱拉',
  Azad: '阿扎德', Bora: '博拉', Nusrat: '努斯拉特', Raghav: '拉加夫', Selim: '塞利姆', Amina: '阿米娜', Baran: '巴兰', Galdan: '葛尔丹', Parvathi: '帕尔瓦蒂', Sokha: '索卡', Anand: '阿南德', Bhakti: '巴克蒂', Fatma: '法特玛', Hevi: '海维', Hoang: '黄', Malina: '玛丽娜', Aizhan: '艾扎娜', Bujantai: '布占泰', Emir: '埃米尔', Rojin: '罗津', Sinan: '希南', Zebo: '泽博', Iskandar: '伊斯坎达尔', Rekha: '雷卡', Sherzod: '谢尔佐德', 'Süleyman': '苏莱曼', Zana: '扎娜', Anahit: '阿娜希特', Nikan: '尼坎', Avin: '阿文', Fahim: '法希姆', Gurleen: '古尔琳', Hira: '希拉', Kiran: '基兰', Mahesh: '马赫什', Sophea: '索菲娅', Srinivas: '斯里尼瓦斯', Fatima: '法蒂玛', Rojhat: '罗扎特', Vishwanath: '维什瓦纳特', Dilawar: '迪拉瓦尔', Jebat: '杰巴特', Kannan: '卡南', Madinat: '马迪娜特', Yavuz: '亚武兹', Zayd: '扎伊德', Aram: '阿拉姆', Arjan: '阿尔詹', 'Fiyanggū': '费扬古', Fiyanggu: '费扬古', Levan: '列万',
})

// High-frequency names from the remaining African, Indigenous American and
// Pacific culture packs. These are standard Chinese renderings where one is
// established; otherwise they use a compact, culture-appropriate transliteration.
Object.assign(supplementalLocalizedTokens, {
  Yazzie: '亚齐', Yasin: '亚辛', Nwosu: '恩沃苏', Aden: '阿丹', Garba: '加尔巴', Okoye: '奥科耶', Katoa: '卡托阿', Kofi: '科菲',
  Waqa: '瓦卡', Danjuma: '丹朱马', Taziri: '塔齐里', Sani: '萨尼', Tewa: '特瓦', Tala: '塔拉', Abubakar: '阿布巴卡尔',
  Eze: '埃泽', dos: '多斯', Fetu: '费图', Moana: '莫阿娜', Koa: '科阿', Kalla: '卡拉', Yacoub: '雅各布', Mensah: '门萨',
  Ag: '阿格', Alhassane: '阿勒哈桑', Vaea: '瓦埃阿', Kahele: '卡赫勒', Razanakoto: '拉扎纳科托', Turi: '图里',
  Whānau: '瓦瑙', Kalala: '卡拉拉', Pino: '皮诺', Marika: '马里卡', Stanescu: '斯坦内斯库', Adamu: '阿达穆', Fall: '法尔',
  Labba: '拉巴', Lakatos: '拉科陶什', Yawanawa: '亚瓦纳瓦', Gagnon: '加尼翁', Nakamarra: '纳卡马拉', Tjakamarra: '贾卡马拉',
  Cauich: '考伊奇', Obinna: '奥宾纳', Raveloson: '拉韦洛松', Yara: '亚拉', Bello: '贝洛', Wong: '黄', Apu: '阿普', Niuma: '尼乌马',
})

Object.assign(supplementalLocalizedTokens, {
  Kealoha: '凯阿洛哈', Zainab: '扎伊纳布', Eshoo: '埃舒', Levi: '利维', Demeter: '德梅特尔', Rakoto: '拉科托', Carvalho: '卡瓦略',
  Calfunao: '卡尔富瑙', Jone: '约内', Mamadou: '马马杜', Wane: '瓦内', Xiu: '修', Zubairu: '祖拜鲁', Kwesi: '奎西',
  Whitecloud: '白云', Zondo: '佐恩多', Fadima: '法迪玛', Gaup: '高普', Kabila: '卡比拉', Kwame: '奎梅', Mara: '玛拉', Tait: '泰特',
  Ama: '阿玛', Ncube: '恩库贝', Nukappiak: '努卡皮亚克', Rosenberg: '罗森贝格', Beaulieu: '博略', Cetz: '塞茨', Leilani: '莱拉妮',
  Mabo: '马博', Rukayya: '鲁凯娅', Sow: '索', Tetteh: '特泰', Bah: '巴', Fatou: '法图', Moyo: '莫约', Obi: '奥比',
  Haruna: '哈鲁纳', Motecuhzoma: '蒙特祖马', Pua: '普阿', Seck: '塞克', Aminata: '阿米娜塔', Ibrahima: '易卜拉希马', Sarak: '萨拉克',
  'Tupã': '图潘', Vigil: '维吉尔', Wunala: '乌纳拉', Jampijinpa: '贾姆皮金帕', Ngata: '恩加塔', Sgaana: '斯加纳',
  Adwoa: '阿德沃娅', Puruntatameri: '普伦塔塔梅里', Apaza: '阿帕萨', Redbird: '红鸟', Yindi: '因迪', Kachina: '卡奇娜',
  Randria: '兰德里亚', Andriamihaja: '安德里阿米哈贾', Sky: '天空', Yaa: '雅阿', Japaridze: '贾帕里泽', Sibanda: '西班达',
  Tafoya: '塔福亚', Desjardins: '德雅尔丹', Latu: '拉图', Usman: '奥斯曼', Ratu: '拉图', Yupanqui: '尤潘基', Daku: '达库', Hauwa: '豪娃',
  Karapetyan: '卡拉佩蒂扬', Mafile: '马菲莱', Ait: '艾特', Chikovani: '奇科瓦尼', Jaci: '雅西', Nisga: '尼斯加', Umar: '欧麦尔',
  Aglukkaq: '阿格卢卡克', Aroha: '阿罗哈', Ccalla: '卡利亚', Taan: '塔安', Mizrahi: '米兹拉希', Chiamaka: '奇阿马卡', Qasha: '卡沙',
  Gelashvili: '格拉什维利', Goldberg: '戈德堡', Kamehameha: '卡美哈梅哈', Mescalero: '梅斯卡莱罗', Potira: '波蒂拉', Ashkii: '阿什基',
  Huaman: '瓦曼', Kaleo: '卡莱奥', Oulhaj: '乌勒哈吉', Tallchief: '塔尔奇夫', Tama: '塔玛', Boubacar: '布巴卡尔', Hovhannisyan: '霍夫汉尼斯扬',
  Pech: '佩奇', Rayen: '拉延', Tehani: '特阿尼',
  Manukyan: '马努基扬', Nez: '内兹', Fale: '法莱', Huenchumilla: '温丘米利亚', 'Bet-Mahdi': '贝特·马赫迪', Makoa: '马科阿',
  Tainá: '泰娜', Uche: '乌切', Waya: '瓦亚', 'Ben-David': '本·戴维', Naranjo: '纳兰霍', Kiri: '基里', Yaw: '约',
  Aiyana: '艾雅娜', Antilef: '安蒂莱夫', Atotoztli: '阿托托斯特利', Maisuradze: '马伊苏拉泽', Siku: '西库', Tekonwatonti: '特孔瓦东蒂',
  Fia: '菲娅', Iara: '伊阿拉', Kitti: '基蒂', Nika: '尼卡', Shapiro: '沙皮罗', Tigran: '季格兰', Tremblay: '特朗布莱', Wenu: '韦努',
  Aissatou: '艾萨图', Bouchard: '布沙尔', Halia: '哈莉娅', Mordechai: '莫迪凯', Risten: '里斯滕', Kwak: '夸克', Nneka: '恩内卡',
  Tinhinan: '廷希南', Alisi: '阿利西', Anata: '阿纳塔', Iztli: '伊茨特利', Leka: '莱卡', Sule: '苏莱', Tamar: '塔玛尔', Cohen: '科恩',
  Hopi: '霍皮', "Jach'a": '贾查', Marisol: '玛丽索尔', Mwene: '姆韦内', Nilesh: '尼莱什', Shilan: '希兰', Afa: '阿法', Bopha: '波帕',
  Petulengro: '佩图伦格罗', Yellowtail: '黄尾', Aka: '阿卡', Lemba: '伦巴', Mpemba: '姆彭巴', Noelani: '诺埃拉妮', Sisa: '西萨',
  Dadiani: '达迪亚尼', Shobha: '肖芭', Namatjira: '纳马吉拉', Pakal: '帕卡尔', Chayton: '查伊顿', Moussa: '穆萨', Saknikte: '萨克尼特',
  Likan: '利坎', Osei: '奥塞', Altsoba: '阿尔措巴', Anik: '阿尼克', Chukwuemeka: '楚库埃梅卡', Kitchi: '基奇',
  Malinalxochitl: '马利纳尔索奇特尔', Mehdi: '迈赫迪', Sandro: '桑德罗', Beti: '贝蒂', Hina: '希娜', Kewa: '凯瓦', Kirra: '基拉',
  Kwaku: '克瓦库', Mariama: '玛丽亚玛', Nala: '娜拉', Raven: '渡鸦', Tasiq: '塔西克', Celeste: '塞莱斯特', Illapa: '伊利亚帕',
  Kahionhes: '卡希翁赫斯', Ousmane: '乌斯曼', Penda: '佩恩达', Suleiman: '苏莱曼', Suma: '苏玛', Tibor: '蒂博尔', Tlaloc: '特拉洛克',
  Yari: '亚里', Ziri: '齐里', Bidziil: '比齐尔', Doli: '多利', Elle: '埃勒', Hinemoa: '希内莫阿', Kiala: '基亚拉', Koda: '科达', Mele: '梅莱',
  Nivi: '妮维', Sarah: '莎拉', Adaeze: '阿达埃泽', Émilie: '埃米莉', Pueblo: '普韦布洛', Kaya: '卡娅', Akosua: '阿科苏娅', Hiawatha: '海华沙',
  Ivalu: '伊瓦卢', Manu: '马努', Sakari: '萨卡里', Arana: '阿拉娜', Nils: '尼尔斯', Tanirt: '塔尼尔特', Watahonti: '瓦塔洪蒂', Aukan: '奥坎',
  Babacar: '巴巴卡尔', Mala: '玛拉', Nokose: '诺科塞', Sila: '西拉', Sina: '西娜', Voahirana: '沃阿希拉娜', Yukon: '育空', Ayelen: '阿耶伦',
  Lupita: '卢皮塔', Ocelotl: '奥塞洛特尔', Qhapaq: '卡帕克', Tali: '塔利', Teyoninhokarawen: '泰约宁霍卡拉文', Yaxche: '亚什切', Yemma: '耶玛', Yurala: '尤拉拉',
  Amadou: '阿马杜', Baro: '巴罗', Cuauhtli: '夸乌特利', Levon: '列万', Malia: '玛丽娅', Nsimba: '恩辛巴', Sandeep: '桑迪普', Tika: '蒂卡',
  Waru: '瓦鲁', Yarran: '亚兰', Yuba: '尤巴', Aputi: '阿普蒂', Coumba: '库姆巴', Ephraim: '以法莲', Gurpreet: '古普里特', Kuyen: '库延', Makwa: '马克瓦', Nokomis: '诺科米斯',
  Marlu: '马鲁', Cedar: '雪松', Seydou: '塞杜', Tafukt: '塔富克特', Tahina: '塔希娜', Ailu: '艾卢', Fara: '法拉', Winona: '温诺娜',
  Yao: '亚奥', Deganawida: '德加纳维达', Gungju: '龚珠', Marli: '玛莉', Moumita: '莫米塔', Nanuq: '纳努克', Sewa: '塞瓦', Tuktu: '图克图',
  Abena: '阿贝娜', Jandira: '詹迪拉', Makai: '马凯', Massinissa: '马西尼萨', Tallulah: '塔卢拉', Tsegi: '特塞吉', Tumar: '图玛尔', Vai: '瓦伊',
  Arawak: '阿拉瓦克', Deepa: '迪帕', Isaac: '以撒', Kelepi: '凯莱皮', Lukeni: '卢凯尼', Nalu: '纳鲁', Ohsweken: '奥斯韦肯', Revaz: '列瓦兹',
  Takoda: '塔科达', Anuhea: '阿努希娅', Bastian: '巴斯蒂安', Chibuzo: '奇布佐', Dieynaba: '迪耶娜巴', Jurema: '朱雷马', Kiona: '基奥娜',
  Lautaro: '劳塔罗', Makda: '玛克达', Marama: '玛拉玛', Nahrain: '纳赫兰', Shamiram: '沙米拉姆', Taza: '塔扎', Viliame: '维利亚梅',
  Adina: '阿迪娜', Hasmik: '哈斯米克', Kailani: '凯拉妮', Rachel: '瑞秋',
  Mana: '玛娜', Wara: '瓦拉', Inga: '英加', Kumanjayi: '库曼贾伊', Pape: '帕普', Ixtab: '伊什塔布', Paniq: '帕尼克', Yosef: '约瑟夫',
  Benoit: '伯努瓦', Mame: '玛梅', Nirina: '尼里娜', Aira: '艾拉', Hagop: '哈戈普', Miriam: '米里亚姆', Ranjit: '兰吉特', Tayri: '泰伊里',
  Whetu: '韦图', Chuki: '丘基', Kadi: '卡迪', Ketevan: '凯特万', Miahuatl: '米阿瓦特尔', Aila: '艾拉', Ayonwatha: '阿约恩瓦塔',
  Dani: '达尼', Hamza: '哈姆扎', Hodan: '霍丹', Mallku: '马尔库', Ubiratã: '乌比拉塔', Vazgen: '瓦兹根', Yaretzi: '亚雷齐', Adi: '阿迪',
  Ajaw: '阿豪', Aru: '阿鲁', Kauri: '考里', Lani: '拉妮', Litia: '利蒂娅', Millaray: '米利亚拉伊', Sargon: '萨尔贡', Vakhtang: '瓦赫坦',
  Yuma: '尤马', Zuberi: '祖贝里', Ando: '安多', Hasina: '哈西娜', Hery: '赫里', Khadra: '哈德拉', Mialy: '米亚莉', Mira: '米拉',
  Nzinga: '恩津加', Rémi: '雷米', Soraya: '索拉娅', Talia: '塔利娅', Ator: '阿托尔', Cheikh: '谢赫', Claudette: '克洛岱特', Diana: '戴安娜',
  Elene: '埃莱妮', Ifrah: '伊夫拉', Ima: '伊玛', Janko: '扬科', Lalaina: '拉莱娜', Leah: '利娅', Lemet: '莱梅特', Matiu: '马蒂乌',
  Shota: '肖塔', Sunniva: '逊妮瓦', Vardan: '瓦尔丹', Yael: '雅艾尔', Yangguli: '杨古里', Zurab: '祖拉布', Alinta: '阿林塔', Andres: '安德烈斯',
  Biba: '比巴', Iva: '伊娃', Meryem: '梅里耶姆', Miro: '米罗', Noro: '诺罗', Piatã: '皮阿塔', Soa: '索阿', Tammuz: '塔木兹',
  Tendai: '腾代', Ugochukwu: '乌戈丘库', Vika: '维卡', Yax: '亚什', Zo: '佐', Datu: '达图', Davis: '戴维斯', Davit: '达维特',
  Fadumo: '法杜莫', Jacob: '雅各布', 'Jean-Baptiste': '让-巴蒂斯特', Ngaio: '恩盖奥', Ashot: '阿肖特', Banza: '班扎', Irakli: '伊拉克利',
  Lova: '洛瓦', Luma: '卢玛', Narine: '纳丽娜', Ngoc: '玉', Sourav: '索拉夫', Trung: '仲',
  Biera: '比耶拉', Nana: '娜娜', Besarion: '贝萨里翁', Kaique: '凯克', Kauê: '考埃', Nurbanu: '努尔巴努', Setthathirath: '塞塔提拉',
  Maryan: '玛丽安', Rafael: '拉斐尔', Raja: '拉贾', Zoran: '佐兰', Debashis: '德巴希斯', Sahra: '萨赫拉', Solofo: '索洛福', Sinti: '辛蒂',
  Yaqob: '雅各布', Arani: '阿拉妮', Mamy: '玛米', Ruth: '路得', Unni: '乌妮', Zoe: '佐伊', Araí: '阿拉伊', Tolstykh: '托尔斯泰',
  Tsitsi: '齐齐', Naram: '纳拉姆', Rada: '拉达', Rivka: '丽芙卡', Alauddin: '阿拉乌丁', Kanya: '卡娅', Lusine: '卢西内', Mostafa: '穆斯塔法',
  Napo: '纳波', Tatevik: '塔特维克', Wiremu: '威雷穆', Arun: '阿伦', Eliyahu: '以利亚胡', Makarov: '马卡罗夫', Melnikov: '梅尔尼科夫',
  Naiara: '奈娅拉', Nassar: '纳萨尔', Simran: '西姆兰', Tania: '塔妮娅', Vidya: '维迪娅', Zora: '佐拉', Baruch: '巴鲁赫', Mehmed: '穆罕默德',
  Osman: '奥斯曼', 'Şah': '沙阿', Sayed: '赛义德', Yermakovna: '叶尔马科夫娜', Alekseiovna: '阿列克谢耶芙娜', Borisovich: '鲍里索维奇',
  Chibwe: '奇布韦', Dinh: '丁', Kundavai: '昆达维', Maksimovna: '马克西莫芙娜', Matveiovich: '马特维耶维奇', Menelik: '梅内利克',
  Moshe: '摩西', Mutahir: '穆塔希尔', Pavlov: '巴甫洛夫', Perak: '霹雳', Rudo: '鲁多', Vadimovich: '瓦季莫维奇', Lebedev: '列别捷夫',
  Long: '龙', Tran: '陈', Novikov: '诺维科夫', Sayri: '赛里', Smirnov: '斯米尔诺夫', Vadimovna: '瓦季莫芙娜',
  Rusudan: '鲁苏丹', Yvette: '伊薇特', Arpine: '阿尔皮涅', Máret: '玛蕾特', Yashwanth: '亚什万特', Dengel: '登格尔', Esi: '埃西', Lebna: '莱布纳',
  Natia: '娜蒂娅', Andry: '安德里', Dayang: '达央', Rogov: '罗戈夫', Gusti: '古斯蒂', Iyasu: '伊亚苏', Jose: '何塞', Lij: '利吉',
  Matveiovna: '马特维耶芙娜', Mwana: '姆瓦娜', Rajendra: '拉金德拉', Tuah: '图阿', Yarov: '亚罗夫', Rosa: '罗莎', Ustinov: '乌斯季诺夫',
  Fawzi: '福齐', Khanh: '庆', Kupona: '库波娜', Luna: '露娜', Luz: '卢斯', Mpande: '姆潘德', Pyotrovna: '彼得罗芙娜', Quan: '泉',
  Shaka: '沙卡', Yegorovna: '叶戈尔芙娜', Asfaw: '阿斯法', Aung: '昂', Dingane: '丁甘', Grigoryovich: '格里戈里耶维奇', Levovich: '列沃维奇',
  Ly: '李', Makonnen: '马科南', Mbarouk: '姆巴鲁克', Menen: '梅嫩', Moctezuma: '蒙特祖马', Rajah: '拉贾', Ras: '拉斯', Sher: '舍尔',
  Sibongile: '西邦吉莱', Siranush: '西拉努什', Thai: '泰', Timurovich: '季穆罗维奇', Vikramaditya: '维克拉玛蒂亚', Yegorovich: '叶戈罗维奇',
  Atahualpa: '阿塔瓦尔帕', Bindusara: '宾度沙罗', Camila: '卡米拉', Emiliano: '埃米利亚诺', Emilio: '埃米利奥', Grigoryovna: '格里戈里耶芙娜',
  Haliya: '哈利娅', Maqoma: '马科马', Olegovich: '奥列格维奇', Pyotrovich: '彼得罗维奇', Satakarni: '萨塔卡尔尼', Semenov: '谢苗诺夫',
  Vladimirovich: '弗拉基米罗维奇', Yermakovich: '叶尔马科维奇', Yevgenyovich: '叶夫根尼耶维奇', Afanasyovich: '阿法纳西耶维奇', Akka: '阿克卡',
  Chandragupta: '旃陀罗笈多', Cueva: '库埃瓦', del: '德尔', Dong: '东', Egorov: '叶戈罗夫', Gennadyovich: '根纳季耶维奇', Gregoria: '格雷戈里娅',
  Huyen: '玄', Ik: '伊克', Kalangitan: '卡朗吉坦', Konstantinovich: '康斯坦丁诺维奇', la: '拉', Levovna: '列芙娜', Mansur: '曼苏尔',
  Marcelo: '马塞洛', Mihretu: '米赫雷图', nal: '纳尔', Olegovna: '奥列格芙娜', Pham: '范', Pilar: '皮拉尔', Rahuana: '拉瓦娜',
  Stepanovich: '斯捷潘诺维奇', Valeryovich: '瓦列里耶维奇', Vo: '武', Yohl: '约尔', Afanasyovna: '阿法纳西耶芙娜', Akbar: '阿克巴',
  Alekseiovich: '阿列克谢耶维奇', Anatolyovna: '阿纳托利耶芙娜', Andal: '安达尔', Ashoka: '阿育王',
  Maksimovich: '马克西莫维奇', Ix: '伊什', Denisovna: '杰尼斯耶芙娜', Duc: '德', 'Dũng': '勇', 'Tấn': '晋', Nikitaovich: '尼基塔耶维奇',
  Oranyan: '奥拉尼扬', Bao: '宝', Chel: '切尔', Gennadyovna: '根纳季耶芙娜', Kozlov: '科兹洛夫', Lourdes: '卢尔德', Valeryovna: '瓦列里耶芙娜',
  Graciano: '格拉西亚诺', Jaena: '哈埃纳', Leonidovich: '列昂尼多维奇', Lopez: '洛佩斯', Mallikarjuna: '马利卡尔朱纳', Sulayman: '苏莱曼',
  Tecun: '特昆', Thang: '胜', Ton: '尊', Uman: '乌曼', Vasilyovich: '瓦西里耶维奇', Yaroslavovna: '雅罗斯拉芙娜', Apolinario: '阿波利纳里奥',
  Draupadi: '德罗帕迪', Gulbadan: '古尔巴丹', Han: '韩', Isabela: '伊莎贝拉', Jahanara: '贾汗娜拉', Kanyarat: '坎雅拉',
  Konstantinovna: '康斯坦丁诺芙娜', Mabini: '马比尼', Magbanua: '马格巴努阿', Mkhande: '姆坎德', Nandi: '南迪', Quang: '光',
  Sulabha: '苏拉巴', Vladimirovna: '弗拉基米罗芙娜', Ahuitzotl: '阿维佐特尔', Akinwande: '阿金万德', Amihan: '阿米汉', Bibi: '比比',
  Boi: '博伊', Borisovna: '鲍里索芙娜', Chau: '周', Dalem: '达勒姆', Devaraya: '德瓦拉亚', Ei: '伊', Gunung: '古农', I: '伊', Istri: '伊斯特里',
  Jodha: '焦达', Kamala: '卡玛拉', Kan: '坎', Kanishka: '迦腻色迦', Khai: '凯', Krishnadevaraya: '克里希那提婆罗耶', Kyaw: '觉',
  Le: '黎', Ledang: '莱当', Loi: '利', Maitreyi: '弥勒提', Mazariegos: '马萨列戈斯', Min: '敏', Mnyazi: '姆尼亚齐', Moe: '莫', Ni: '妮',
  Osun: '奥孙', Poonguzhali: '蓬古扎利', Puteri: '普特里', Razia: '拉齐娅', Roca: '罗卡', Sango: '桑戈', Sein: '塞因', Sri: '斯里',
  Stepanovna: '斯捷潘诺芙娜', Su: '苏', Thiri: '希里', Urduja: '乌尔杜哈', Aguinaldo: '阿吉纳尔多', Artyomovich: '阿尔乔姆维奇',
  Bonifacio: '博尼法西奥', Cecilia: '塞西莉亚', Cetshwayo: '塞奇瓦约', Charumati: '查鲁玛蒂', Cortes: '科尔特斯', Denisovich: '杰尼斯维奇',
  Dieu: '迪耶乌', 'Doña': '多尼娅', Erendira: '埃伦迪拉', Fatuma: '法图玛', Gargi: '加尔吉', Ghosha: '乔莎', Hernan: '埃尔南', Hoa: '华', Hoc: '霍克',
  Yohannes: '约翰内斯', Nikitaovna: '尼基塔耶芙娜', Artyomovna: '阿尔乔姆芙娜', Fatimah: '法蒂玛', Frida: '弗里达', Ivanovna: '伊万诺芙娜',
  Kampana: '坎帕娜', Mkisi: '姆基西', Olufunke: '奥卢芬凯', Hamida: '哈米达', Mkabayi: '姆卡巴伊', Tirumalamba: '蒂鲁玛兰巴',
  Achyuta: '阿丘塔', Anatolyovich: '阿纳托利耶维奇', Au: '欧', Chieu: '昭', Co: '柯', Contarhuacho: '孔塔尔瓦乔', Cusi: '库西', Mkwawa: '姆夸瓦',
  Sita: '悉多', Tham: '探', Titu: '蒂图', Abeni: '阿贝妮', Alvarado: '阿尔瓦拉多', Condemayta: '孔德迈塔', Coya: '科娅', Daniela: '丹妮拉',
  Humabon: '胡马邦', Ifagbamila: '伊法格巴米拉', Kalantiaw: '卡兰蒂奥', Madhava: '摩诃婆', Malintzin: '马林钦', Nobanda: '诺班达', Rama: '罗摩',
  Rudramadevi: '鲁德拉德维', Said: '赛义德', Sikatuna: '西卡图纳', Tito: '蒂托', Tlacaelel: '特拉卡埃莱尔', Tomasa: '托马萨', Trai: '斋',
  Vasilyovna: '瓦西里芙娜', Vishpala: '维什帕拉', Agoncillo: '阿贡西略', Ajaka: '阿贾卡', Alaafin: '阿拉芬', Anahuarque: '阿纳瓦尔克', Bartolina: '巴托莉娜',
  Bastidas: '巴斯蒂达斯', Bonda: '邦达', Chennabhairadevi: '钦纳巴伊拉德维', Fikelephi: '菲凯莱菲', Karikala: '卡里卡拉', Lakan: '拉坎', Lopamudra: '罗帕穆德拉',
  Mal: '马尔', Marcela: '马塞拉', Micaela: '米凯拉', Nhi: '妮', Nurfaizah: '努尔法伊扎', Orosa: '奥罗萨', Phuong: '芳', Quoc: '国', Sangam: '桑甘',
  Sau: '绍', Titi: '蒂蒂', Todar: '托达尔', Vijayamba: '维贾扬巴', Yaroslavovich: '雅罗斯拉维奇', Zubeyda: '祖拜达', Arjuna: '阿周那', Avvaiyar: '阿瓦伊亚尔',
  Bantugan: '班图甘', Betul: '贝图尔', Buhlebemvelo: '布赫莱贝姆维洛', Dagang: '达冈', Durgavati: '杜尔迦瓦蒂', Gabriela: '加布里埃拉', Giap: '甲', Hintsa: '欣察',
  Ho: '胡', Huong: '香', Karna: '迦尔纳', Kiet: '杰特', Kirillovna: '基里尔芙娜', 'Lapu-Lapu': '拉普拉普', Loan: '鸾', Mirabai: '米拉拜', Moremi: '莫雷米',
  Narasimha: '那罗辛哈', Ogun: '奥贡', Padmini: '帕德米妮', Phichit: '披集', Pulakeshin: '普拉凯希', Rajaraja: '罗阇罗阇', Ramaraya: '拉玛拉亚', Romanovna: '罗曼诺芙娜',
  Silang: '西朗', Tarabai: '塔拉拜',
  Ivanovich: '伊万诺维奇', Chu: '朱', Leom: '莱奥姆', Renata: '雷娜塔', Trinh: '郑', Vijayan: '维贾扬', Xocoyotzin: '肖科约特津', Yevgenyovna: '叶夫根尼耶芙娜',
  Basava: '巴萨瓦', Neduncheliyan: '内敦切利延', Harihara: '哈里哈拉', Madhavi: '玛达维', Marina: '玛丽娜', Vishnugupta: '毗湿奴笈多', Zewditu: '泽乌迪图',
  Aquino: '阿基诺', Harsha: '哈尔沙', Huanca: '瓦恩卡', Lakambini: '拉坎比妮', Melchora: '梅尔乔拉', Parado: '帕拉多', Prabhavati: '帕拉巴蒂',
  Samudragupta: '三摩陀罗笈多', Sandile: '桑迪莱', Sembiyan: '森比扬', Tocto: '托克托', Xavier: '泽维尔', Zumarraga: '苏马拉加', Altash: '阿尔塔什',
  Bartolome: '巴托洛梅', Casas: '卡萨斯', Ha: '哈', Hung: '洪', Kebebeush: '凯贝贝乌什', Lakanati: '拉卡纳蒂', las: '拉斯', Meenakshi: '米娜克希',
  Mwanamaka: '姆瓦纳玛卡', My: '美', Nezahualcoyotl: '内萨瓦尔科约特尔', Prithviraj: '普利特维拉吉', Pura: '普拉', Sahle: '萨赫莱', Timurovna: '季穆罗芙娜',
  Tuan: '图安', Vasumathi: '瓦苏玛蒂', Villanueva: '比利亚努埃瓦', Work: '沃尔克', Yajnavalkya: '耶若跋尔基耶', Amrapali: '阿姆拉帕利', Jahan: '贾汉',
  Jahangir: '贾汉吉尔', Karyapa: '卡里亚帕', Kieu: '翘', Man: '曼', Mang: '芒', Mirambo: '米兰博', Oduduwa: '奥杜杜瓦', Shakuntala: '莎恭达罗',
  Thuy: '翠', Tien: '田', To: '都', Woizero: '沃伊泽罗', Xiuhtzatzin: '秀赫察津', Xuan: '宣', Y: '伊', Yen: '燕', Adil: '阿迪尔', Agung: '阿贡',
  Ahhotep: '阿赫霍特普', Ahmose: '阿赫摩斯', Ajeng: '阿珍', Anjani: '安贾妮', Ankhesenamun: '安克赫塞娜蒙', Apollonios: '阿波罗尼奥斯', Arsinoe: '阿尔西诺伊',
  Arya: '阿里亚', Bagus: '巴古斯', Bahlol: '巴赫洛尔', Berenice: '贝勒尼切', Berenike: '贝勒尼刻', Boromakot: '波隆玛戈', Buppha: '布帕',
  Catarina: '卡塔丽娜', Chennamma: '钦纳玛', Chulalak: '丘拉拉', Chulalongkorn: '朱拉隆功', Dai: '戴', Daw: '道', Diah: '迪亚', Dionysos: '狄俄尼索斯',
  Djoser: '左塞尔', Ekatat: '埃卡塔', Epiphanes: '埃皮法涅斯', Erauso: '埃劳索', Euergetes: '欧厄尔革忒斯', Fitri: '菲特里', Gar: '加尔', Gayatri: '加亚特里', Hamengkubuwono: '哈孟库布沃诺',
  Parantaka: '波兰塔卡', Chanakya: '考底利耶', Humayun: '胡马雍', Mantantise: '曼坦蒂塞', Sehin: '塞欣', Woyzero: '沃伊泽罗', Duy: '维',
  Lalita: '拉莉塔', Machemba: '马切姆巴', Oya: '欧亚', Tecson: '特克松', Trinidad: '特立尼达', Adetokunbo: '阿德托昆博', Cik: '西克',
  Gangadevi: '恒河黛维', Kembang: '肯邦', Savvaovich: '萨瓦维奇', Wan: '旺', Ba: '巴', Lakandula: '拉坎杜拉', Madayaw: '马达亚乌', Yemoja: '耶莫娅',
  Henuttawy: '赫努塔维', Hijau: '希瑙', Hnin: '欣', Htet: '特', Htut: '杜特', Iset: '伊西丝', Iwa: '伊瓦', Kaeo: '凯奥', Kebo: '克博',
  Kenceng: '肯琴', Khafre: '卡夫拉', Khri: '克里', Ki: '基', Kidul: '基杜尔', Laodice: '拉奥狄刻', Lhalung: '拉隆', Macedonia: '马其顿', Mas: '马斯',
  May: '梅', Menkaure: '门卡乌拉', Meritamen: '梅里塔蒙', Merneith: '梅尔内伊特', Meryre: '梅里尔', Mongkut: '蒙固', Mutnodjmet: '穆特诺德杰梅特',
  Mya: '妙', Myo: '缪', Nandar: '南达', Nangai: '南盖', Nanmadaw: '南玛道', Naresuan: '纳黎宣', Ne: '尼', Nefertari: '奈费尔塔丽', Neos: '尼奥斯',
  Ningsih: '宁西', Nok: '诺克', Nu: '努', Nyi: '妮', Olympias: '奥林匹娅', Philadelphus: '菲拉德尔福斯', Philometor: '菲洛墨托', Philopator: '菲洛帕托',
  Prasatthong: '巴萨通', Princess: '公主', Ptolemy: '托勒密', Putri: '普特里', Ramathibodi: '拉玛铁菩提', Rang: '朗', Roro: '罗罗', Rudrama: '鲁德拉玛',
  San: '山', Selene: '塞勒涅', Senusret: '塞索斯特里斯', Seti: '塞提', Shwe: '瑞', Slamet: '斯拉梅特', Sobekemsaf: '索贝克姆萨夫', Sobekneferu: '索贝克涅弗鲁',
  Soter: '索忒尔', Sudachan: '苏达詹', Suphankanlaya: '素攀迦拉雅', Suriyothai: '素里育泰', Suta: '苏塔', Taksin: '达信', Tawosret: '陶塞特', Taytu: '泰图',
  Than: '丹', Thandar: '丹达', Thant: '丹', Thao: '草', Thein: '登', Thep: '特普', Tiye: '提伊', Tjokorda: '佐科达', Trailok: '三界', Trulku: '图尔库',
  Tryphaena: '特里斐娜', U: '乌', Userkaf: '乌瑟卡夫', Vardhamana: '跋陀摩那', Wai: '怀', Waturenggong: '瓦图棱贡', Wepwawet: '韦普瓦韦特', Win: '温',
  Yamin: '亚敏', Ye: '耶', Yellamma: '耶拉玛', Yeshe: '耶希', Yogimallavva: '约吉马拉瓦', Zaw: '佐', Zin: '津', Kittur: '基图尔',
  Leonidovna: '列昂尼多芙娜', Mwanaisha: '姆瓦奈莎', Nhu: '如', Quynh: '琼', Trac: '徵', Vilcapaza: '维尔卡帕萨', Chand: '旃德',
  Savvaovna: '萨瓦芙娜', Tecuelhuetzin: '特库埃尔韦津', Tip: '蒂普', Tippu: '提普', Zubaidah: '祖拜达', Yashodhara: '耶输陀罗', Zazil: '扎齐尔', Surajmal: '苏拉杰马尔',
})

Object.assign(supplementalLocalizedTokens, {
  Carpet: '地毯', flail: '连枷', Tiwanaku: '蒂瓦纳科', crook: '曲柄杖', Mysore: '迈索尔', beadwork: '珠饰', fur: '毛皮', Jirga: '支尔格会议',
  Benares: '贝拿勒斯', Khanate: '汗国', railway: '铁路', Sufi: '苏菲', Bely: '白', Medved: '熊', Ceremonial: '仪式的', Benin: '贝宁',
  ceramic: '陶制', Inca: '印加', Fort: '堡', obsidian: '黑曜石', Kabul: '喀布尔', pen: '笔', quill: '羽毛笔', scarf: '围巾', box: '盒',
  Kanchipuram: '甘吉布勒姆', scarab: '圣甲虫', Texcoco: '特斯科科', coolamon: '库拉蒙', Iroquois: '易洛魁', shawl: '披肩', Chao: '昭',
  Ganges: '恒河', jezail: '杰扎伊尔枪', Pamir: '帕米尔', Phraya: '帕雅', Range: '山脉', Custodians: '守护者', Severnyi: '北方',
  Songline: '歌线', Veter: '风', rubab: '拉巴布琴', Siamese: '暹罗', Kimberley: '金伯利', Lahore: '拉合尔', Maroon: '马龙', Panjakent: '彭吉肯特',
  papyrus: '纸莎草', Son: '山', talking: '会说话的',
  Dushanbe: '杜尚别', Kandahar: '坎大哈', water: '水', Ibadan: '伊巴丹', Listvennitsa: '落叶松', dhow: '独桅帆船', Emirate: '酋长国', head: '头',
  terracotta: '赤陶', Malabar: '马拉巴尔', Aksum: '阿克苏姆', bamboo: '竹', Party: '茶党', dilly: '迪利', message: '消息', Mugham: '木卡姆',
  Murray: '默里', frontier: '边疆', Kedrovy: '雪松', mat: '席', Hindu: '印度', indigenous: '原住民', Kush: '库施', Abydos: '阿拜多斯', case: '盒',
  Yoruba: '约鲁巴', doll: '玩偶', bead: '珠', Nataraja: '娜塔拉贾', Troupe: '剧团', didgeridoo: '迪吉里杜管', fan: '扇', Ranger: '护林员', Arnhem: '阿纳姆',
  Land: '土地', Philadelphia: '费城', Uluru: '乌鲁鲁', Ayutthaya: '阿瑜陀耶', Orisha: '奥里沙', Savannah: '萨凡纳', machete: '弯刀', Zeravshan: '泽拉夫尚',
  colonial: '殖民时期的', musket: '火枪', Ocean: '海洋', shilling: '先令', trade: '贸易', Women: '女性', Charleston: '查尔斯顿', Derbent: '杰尔宾特',
  Edirne: '埃迪尔内', Kings: '诸王', Niger: '尼日尔', door: '门', Ivory: '象牙', Rockies: '落基山脉', songket: '宋吉特', ikat: '伊卡特', pan: '钢鼓',
  Punjab: '旁遮普', quipu: '基普', shotel: '肖特尔', steel: '钢', Virginia: '弗吉尼亚', Caribbean: '加勒比', Colonial: '殖民的', conch: '海螺', gong: '锣',
  Militia: '民兵', Chiang: '清', Kingston: '金斯敦', Potters: '陶工', Hudson: '哈德逊', tar: '塔尔琴', Atlantic: '大西洋', Dervish: '苦行僧', Diwan: '迪万',
  flintlock: '燧发枪', Lodge: '会所', Chesapeake: '切萨皮克',
  Persian: '波斯', Poetry: '诗歌', Augustine: '奥古斯丁', Mason: '石匠', 'Port-au-Prince': '太子港', Din: '法庭', Sukhothai: '素可泰',
  Antilles: '安的列斯', Lesser: '较小的', Waqf: '瓦克夫', 'al-Hikma': '智慧', Baghdad: '巴格达', Bayt: '贝特', Coffee: '咖啡', England: '英格兰',
  Nazca: '纳斯卡', New: '新', Shiraz: '设拉子', Amazon: '亚马孙', 'Dasht-e': '达什特', Kavir: '卡维尔', qero: '基罗', Amun: '阿蒙', Ganja: '甘贾',
  lacquer: '漆', stool: '凳', tamada: '塔玛达', Estate: '庄园', Sugar: '糖', Wine: '葡萄酒', Victoria: '维多利亚', Calpulli: '卡尔普利', Shirvan: '希尔万',
  Divan: '迪万', Havana: '哈瓦那', Yerevan: '埃里温', An: '安', disc: '圆盘', Hoi: '会安', kaftan: '卡夫坦', qvevri: '克韦夫里', sun: '太阳',
  Tabriz: '大不里士', Tana: '塔纳', Ani: '阿尼', Galilee: '加利利', Harar: '哈勒尔', Istanbul: '伊斯坦布尔', lantern: '灯笼', mashrabiya: '马什拉比亚',
  Baku: '巴库', Drakensberg: '德拉肯斯堡', kanga: '康加布', shofar: '羊角号', blade: '刀刃', Cattle: '牛群', Fish: '鱼', kindjal: '坎贾尔',
  Kutaisi: '库塔伊西', daf: '达夫鼓', Damascus: '大马士革', duduk: '杜杜克', Hakkari: '哈卡里', sling: '投石索', cuneiform: '楔形文字', Janissary: '苏丹亲兵',
  katar: '卡塔尔刀', kilim: '基里姆', Kurdish: '库尔德', Quipu: '基普', Rajput: '拉杰普特', Sevan: '塞凡', Caspian: '里海', Chola: '朱罗',
  Faiyum: '法尤姆', Isfahan: '伊斯法罕', Khalsa: '卡尔萨', mbira: '姆比拉', reed: '芦苇', stylus: '笔', tumi: '图米', Brunei: '文莱', Bursa: '布尔萨',
  veena: '维纳', Wisdom: '智慧', Aul: '奥尔', lamassu: '拉玛苏', alpaca: '羊驼', Ararat: '阿拉拉特', Mtskheta: '姆茨赫塔', Nakharar: '纳哈拉尔',
  Nayaka: '纳亚卡', Persepolis: '波斯波利斯', Sanhedrin: '公会', Yeshiva: '叶史瓦', Anatolia: '安纳托利亚', Kochi: '科钦', Maratha: '马拉塔', Medina: '麦地那', sceptre: '权杖',
  Kongo: '刚果', church: '教堂', Arabian: '阿拉伯', Nineveh: '尼尼微', beads: '珠子', coral: '珊瑚', Kehillah: '会堂', mezuzah: '梅祖扎', Babylon: '巴比伦',
  iznik: '伊兹尼克', rosewater: '玫瑰水', Apostolic: '使徒的', Diyarbakir: '迪亚巴克尔', Bagrationi: '巴格拉季奥尼', 'palm-leaf': '棕榈叶', Zagros: '扎格罗斯',
  Jerusalem: '耶路撒冷', pomegranate: '石榴', quetzal: '格查尔', tanbur: '坦布尔琴', Zhuz: '玉兹', shamshir: '沙姆希尔', Zulu: '祖鲁', kilij: '基利奇',
  KwaZulu: '夸祖鲁', Machu: '马丘', papakha: '巴帕克帽', Picchu: '皮丘', Chasqui: '查斯基', panduri: '潘杜里', Runners: '奔跑者', tallit: '塔利特',
  tughra: '图格拉', cap: '帽', doppa: '多帕', Mesopotamia: '美索不达米亚', Timurid: '帖木儿', Bukhara: '布哈拉', khon: '孔', lotus: '莲花', Mexico: '墨西哥',
  Mosul: '摩苏尔', bolo: '博洛刀', Dagestan: '达吉斯坦', Mecca: '麦加', Tbilisi: '第比利斯', Tiberias: '提比里亚', valiha: '瓦利哈', Alii: '阿里伊',
  Bight: '海湾', Erbil: '埃尔比勒', Newar: '尼瓦尔', outrigger: '舷外', adire: '阿迪勒', Amu: '阿姆河', Anubis: '阿努比斯', Atelier: '工作坊', Bengal: '孟加拉',
  Casters: '铸工', Chancellery: '大臣署', ittar: '香水', Kashag: '噶厦', Manaschi: '玛纳斯奇', Marae: '玛拉埃', Mining: '采矿', Samoa: '萨摩亚', Set: '赛特',
  Shell: '贝壳', Teip: '泰普', Tongan: '汤加', Torah: '托拉', vial: '小瓶', Abeokuta: '阿贝奥库塔', alofa: '阿洛法', Builders: '建造者', Ganden: '甘丹',
  Ikeja: '伊凯贾', Kandyan: '康提', Kathakali: '卡塔卡利', kelaghayi: '克拉盖伊', kete: '凯特', pandanus: '露兜树', Pyramid: '金字塔', Vanuatu: '瓦努阿图',
  Waitangi: '怀唐伊', Yap: '雅浦', Carving: '雕刻', Chuuk: '楚克', Dolina: '山谷', Gamelan: '甘美兰', Honolulu: '檀香山', Kashgar: '喀什', kava: '卡瓦',
  Lagoon: '泻湖', mere: '梅雷', Moresby: '莫尔兹比', Nui: '努伊', pounamu: '绿玉', Rapa: '拉帕', Rotorua: '罗托鲁瓦',
  lapis: '青金石', pectoral: '胸饰', khachkar: '哈奇卡尔', Svan: '斯万', Tikal: '蒂卡尔', kora: '科拉琴', taraz: '塔拉兹', shyrdak: '希尔达克', urumi: '乌鲁米',
  Tundra: '苔原', yurt: '毡房', burqa: '布尔卡', calendar: '日历', Eye: '眼', Horus: '荷鲁斯', canopic: '卡诺卜', Ijebu: '伊杰布', Ostrog: '奥斯特罗格', Tundrovy: '苔原的',
  Ashokan: '阿育王的', burner: '燃烧器', copal: '柯巴脂', dutar: '都塔尔', Edict: '敕令', Household: '内廷', Sheba: '示巴', Strait: '海峡', tapa: '塔帕布', Alliance: '联盟',
  Aztec: '阿兹特克', Bahia: '巴伊亚', caravan: '商队', olai: '奥莱', Qaggiq: '卡吉克', Scholastic: '经学', Suva: '苏瓦', Triple: '三重', Turkmen: '土库曼', winter: '冬季',
  Drummers: '鼓手', Hawaii: '夏威夷', Maurya: '孔雀王朝', prayer: '祈祷', Shan: '山', Tahiti: '塔希提', thangka: '唐卡', Tian: '天', ukulele: '尤克里里',
  Vijayanagara: '毗奢耶那伽罗', Waka: '瓦卡', Wayfinding: '导航', wheel: '轮', Zheleznaya: '铁', and: '和', Ashgabat: '阿什哈巴德', Chiefly: '酋长的', Coral: '珊瑚',
  divination: '占卜', Fishpond: '鱼塘', Gujarati: '古吉拉特', Halau: '哈劳', Hula: '呼啦', khata: '哈达', krabi: '克拉比', qajaq: '海上皮舟', shells: '贝壳',
  Tashkent: '塔什干', Turpan: '吐鲁番', Aotearoa: '奥特亚罗瓦', assegai: '阿塞盖', chuspa: '丘斯帕', i: '伊', Iwi: '伊维', Savai: '萨瓦伊', taiaha: '太阿哈',
  calligraphy: '书法', Isis: '伊西斯', Kava: '卡瓦', Ledyanaya: '冰', Life: '生命', Maui: '毛伊', peacock: '孔雀', Serovolk: '灰狼', sitar: '西塔琴',
  Station: '站', tundra: '苔原', war: '战争', eagle: '鹰', Egba: '埃格巴', hood: '兜帽', Kauai: '考艾岛', Khotan: '和田', Malla: '马拉', Memphis: '孟菲斯',
  Pandya: '潘迪亚', Saryarka: '萨雷阿尔卡', Sera: '色拉', Serovolchya: '灰狼', tooth: '牙', tulwar: '图尔瓦尔刀',
  was: '瓦斯', Nubian: '努比亚', Rubber: '橡胶', Peshwa: '佩什瓦', dombra: '冬不拉', Galleon: '盖伦帆船', weight: '砝码', Compound: '院落', Shrine: '圣殿',
  atlas: '阿特拉斯绸', axe: '斧', Carved: '雕刻的', Dead: '死者', Door: '门', ebony: '乌木', jewelry: '珠宝', Kervansaray: '商队驿站', northstar: '北极星',
  Urubamba: '乌鲁班巴', aguayo: '阿瓜约', Cossacks: '哥萨克', Ensemble: '乐团', jamdani: '贾姆达尼', Muqam: '木卡姆', Ozero: '湖', Severnogo: '北方的', Siyaniya: '西亚尼亚',
  tack: '马具', Turkistan: '突厥斯坦', whale: '鲸', idol: '偶像', Jaipur: '斋浦尔', oil: '油', Philae: '菲莱', Canyon: '峡谷', Chelly: '切利', Ilorin: '伊洛林',
  quena: '奎纳笛', Solomonic: '所罗门王朝', talwar: '塔尔瓦尔刀', Troglodytica: '特罗格洛迪蒂卡', Bor: '松林', 'Ile-Ife': '伊费', khukuri: '廓尔喀弯刀', kris: '克里斯刀',
  Pala: '波罗王朝', rug: '地毯', Samarkand: '撒马尔罕', Tumanny: '雾蒙蒙', Ulundi: '乌伦迪', Aksakal: '白胡子长老', Angkor: '吴哥', Annam: '安南',
  Banners: '旗帜', Barangay: '巴朗盖', chariot: '战车', Chera: '哲拉', Eight: '八', kasavu: '卡萨武', Nawab: '纳瓦布', Pharaoh: '法老', temple: '神殿',
  Almaty: '阿拉木图', Apia: '阿皮亚', bhala: '长矛', Chennai: '金奈', Plains: '平原', tribute: '贡品', Trust: '信托', Union: '联盟', Xingu: '兴谷',
  Ballgame: '球赛', basket: '篮', Borneo: '婆罗洲', currency: '货币', Elephant: '大象', Fergana: '费尔干纳', keru: '克鲁杯', Naryn: '纳伦', sapphire: '蓝宝石',
  Taklamakan: '塔克拉玛干', Teotihuacan: '特奥蒂瓦坎', Baffin: '巴芬', camel: '骆驼', jebena: '杰贝纳', kalpak: '卡尔帕克', mace: '权杖', Pharaonic: '法老的',
  plaque: '牌匾', Tewahedo: '特瓦希多', Wampum: '贝壳串珠', Yamuna: '亚穆纳', Arequipa: '阿雷基帕', Artisans: '工匠', batik: '蜡染', Carvers: '雕刻师',
  Dhaka: '达卡', diya: '迪亚灯', Mauryan: '孔雀王朝的', Memphite: '孟菲斯的',
  komuz: '科穆兹', heka: '赫卡', fibula: '胸针', takouba: '塔库巴', Town: '城镇', Ahaggar: '阿哈加尔', Khanqah: '汗卡', tagelmust: '塔吉穆斯特', veil: '面纱',
  bells: '铃铛', Manikongo: '马尼孔果', Mogadishu: '摩加迪沙', Deccan: '德干', Jesuit: '耶稣会', kaross: '卡罗斯', Mission: '传教站', Plateau: '高原', Pune: '浦那',
  phulkari: '普尔卡里', cedar: '雪松', cowhide: '牛皮', painted: '彩绘', pottery: '陶器', wampum: '贝壳串珠', Aravalli: '阿拉瓦利', Coromandel: '科罗曼德尔', Lands: '土地',
  non: '斗笠', Finger: '手指', Ghats: '高止山脉', Nadu: '纳杜', Quranic: '古兰经的', satchel: '挎包', Tamil: '泰米尔', Arctic: '北极', balisong: '蝴蝶刀', do: '纸',
  La: '拉', Lat: '叻', Manaus: '马瑙斯', Mount: '山', Paria: '帕里亚', Paz: '帕斯', Xang: '澜沧', aloalo: '阿洛阿洛', chessboard: '棋盘', corn: '玉米', Davao: '达沃',
  Hunting: '狩猎', husk: '穗壳', parka: '派克大衣', Pemba: '彭巴', Potlatch: '赠礼会', Surat: '苏拉特', Antananarivo: '塔那那利佛', astronomical: '天文的', Atlas: '阿特拉斯',
  Bangkok: '曼谷', Chakri: '扎克里', Comorin: '科摩林', District: '地区',
  blowgun: '吹箭筒', bark: '树皮', Katsina: '卡齐纳', Thar: '塔尔', figure: '雕像', Mesas: '台地', nkisi: '恩基西', sabar: '萨巴尔鼓', sheba: '示巴',
  Titicaca: '的的喀喀湖', Onitsha: '奥尼查', Leatherworkers: '皮革工', Kandy: '康提', macuahuitl: '马夸维特尔', Chittagong: '吉大港', Multan: '木尔坦', Tehuantepec: '特万特佩克',
  buddhist: '佛教的', Tanga: '坦噶', Chiricahua: '奇里卡瓦', guom: '剑', Kalaallit: '格陵兰', Nunaat: '努纳特', Salish: '萨利希', Straits: '海峡', Vancouver: '温哥华',
  Annamite: '安南山脉', Chichen: '奇琴', Copan: '科潘', Itza: '伊察', medicine: '药草', misbaha: '米斯巴哈', sea: '海', Guiana: '圭亚那', Igbo: '伊博', Lanna: '兰纳',
  lontar: '棕榈叶', cheroot: '雪茄', Mysuru: '迈苏鲁', terno: '特尔诺', Yogyakarta: '日惹', Ilocano: '伊洛卡诺', Lacquer: '漆器', Maritime: '海事', trariwe: '特拉里韦',
  Vigan: '维甘', Zaria: '扎里亚', badik: '巴迪克', Foundry: '铸造厂', kente: '肯特布', kultrun: '库尔特伦鼓', Mandarin: '官署', Sahel: '萨赫勒', Senegal: '塞内加尔',
  Xhosa: '科萨', Zimbabwe: '津巴布韦', Augustinian: '奥古斯丁会', Fokonolona: '福科诺洛纳', Foothills: '山麓', Moluccas: '马鲁古群岛', phkak: '帕卡剑', Sofala: '索法拉',
  Builder: '建造者', Calendar: '历法', Goldsmith: '金匠', Grozny: '格罗兹尼', mosaic: '镶嵌画', Nunavut: '努纳武特', Riau: '廖内', sampot: '桑波特', ulu: '乌鲁刀',
  'gold-leaf': '金箔', Gulf: '海湾', Hampi: '亨比', Isandlwana: '伊桑德尔瓦纳', Panay: '班乃', trishula: '三叉戟', Cholula: '乔卢拉', galleon: '盖伦帆船', Gurukula: '古鲁库拉',
  Gwaii: '瓜伊', Hai: '海', Haida: '海达', Lof: '洛夫', Phong: '丰', cassava: '木薯', Da: '达', grater: '刨丝器', Karakum: '卡拉库姆', Kumasi: '库马西',
  Mapuche: '马普切', mirror: '镜子', rattan: '藤条', Amritsar: '阿姆利则', daab: '弯刀', Giam: '嘉林', Highland: '高地', Khorat: '呵叻', lacquerware: '漆器', Merina: '梅里纳',
  ogene: '奥盖内钟', Tu: '图', Aba: '阿巴', Javanese: '爪哇的', Kano: '卡诺', Kon: '昆', Minangkabau: '米南加保', Padang: '巴东', parabaik: '帕拉拜克', Pochteca: '波奇特卡',
  puppet: '木偶', tengkuluk: '腾库鲁克', Tum: '图姆', wayang: '哇扬', Mandalay: '曼德勒', Agrahara: '阿格拉哈拉', apsara: '阿普萨拉', Archipelago: '群岛', 'Bio-Bio': '比奥比奥',
  Luang: '琅勃拉邦', Prabang: '琅勃拉邦', rendang: '仁当', Sulu: '苏禄', Volta: '沃尔特', Amenokal: '阿梅诺卡尔', indigo: '靛蓝', 'Saint-Louis': '圣路易', Surakarta: '梭罗',
  Tagalog: '他加禄', thanaka: '檀纳卡', Tuareg: '图阿雷格', Tupi: '图皮', Ubud: '乌布', uli: '乌里', canang: '卡南', Gadaa: '盖达', Hyderabad: '海得拉巴',
  Irrawaddy: '伊洛瓦底', Mthatha: '姆塔塔', Natal: '纳塔尔', Oromo: '奥罗莫', Channel: '海峡', Maguindanao: '马京达瑙', Mozambique: '莫桑比克', Rai: '莱',
  sailcloth: '帆布', Sokoto: '索科托', Stool: '凳', Subak: '苏巴克', Zafimaniry: '扎菲马尼里', Igboland: '伊博兰', Iloilo: '伊洛伊洛', Jilin: '吉林', Kraton: '克拉顿',
  Masquerade: '假面', Nguni: '恩古尼', Taos: '陶斯', Thonburi: '吞武里', Africa: '非洲', dirac: '迪拉克布', East: '东部', Highveld: '高原草原', Horn: '角', Indies: '群岛',
  Lamu: '拉穆', Pagan: '蒲甘', Palawan: '巴拉望', Spanish: '西班牙的', Bandung: '万隆', Changbai: '长白', Himalayas: '喜马拉雅', Mbanza: '姆班扎', Yucatan: '尤卡坦',
  'blue-and-white': '青花', Dakar: '达喀尔', knobkerrie: '木棒', porcelain: '瓷器', Araucania: '阿劳卡尼亚', Damo: '达摩', Lhasa: '拉萨', Nkisi: '恩基西', Banjar: '班贾尔',
  cattle: '牛群', Kraal: '畜栏', Surau: '苏劳', bracelet: '手镯', Nagari: '纳加里', Sahara: '撒哈拉', Timbuktu: '廷巴克图', Archdiocese: '总教区', Bali: '巴厘岛', Bukittinggi: '武吉丁宜',
  gamelan: '甘美兰', Inle: '茵莱', Qurani: '古兰经的', Zeila: '泽拉', Majapahit: '满者伯夷', milk: '牛奶', Toamasina: '图阿马西纳', mantle: '披肩', raffia: '酒椰纤维', Senegambia: '塞内冈比亚',
  talempong: '塔伦朋', Vientiane: '万象', Bagan: '蒲甘', Borobudur: '婆罗浮屠', incense: '香', Indian: '印度的', zebu: '瘤牛', Tsangpo: '藏布', Yarlung: '雅砻', Kuta: '库塔',
  Mukden: '盛京', Futa: '富塔', Jallon: '贾隆', Namtso: '纳木错', Kailash: '冈仁波齐', Shigatse: '日喀则', Ala: '阿拉', Hetu: '赫图', Luanda: '罗安达',
  Age: '年级', Grade: '年级', Libanos: '利巴诺斯', netela: '内特拉', Massawa: '马萨瓦', Osh: '奥什', earspools: '耳饰', ankh: '安卡十字', harmonica: '口琴',
  Jaguar: '美洲豹', lacrosse: '长曲棍球', serovolk: '灰狼', cord: '绳', Ili: '伊犁', Pasig: '帕西格', tucum: '图库姆', chicha: '奇恰', Mohawk: '莫霍克',
  sail: '帆', suzani: '苏扎尼', Ahmedabad: '艾哈迈达巴德', Condolence: '哀悼', Ethiopian: '埃塞俄比亚', Nan: '南', Ndebele: '恩德贝莱', carving: '雕刻',
  chenda: '钦达', kirpan: '卡尔潘', Merv: '梅尔夫', monsoon: '季风', Ningguta: '宁古塔', soapstone: '皂石', totem: '图腾', Corners: '角落', Four: '四',
  Quetzalcoatl: '羽蛇神', Atacama: '阿塔卡马', barong: '巴龙', Godavari: '戈达瓦里', 'ifá': '伊法', Kiva: '基瓦', Rajasthan: '拉贾斯坦', Andean: '安第斯',
  bandhani: '班达尼', Khiva: '希瓦', Theban: '底比斯', Uxmal: '乌斯马尔', aurora: '极光', Awadh: '阿瓦德', Beadwork: '珠饰', Chulpa: '丘尔帕', dhol: '德霍尔',
  Hargeisa: '哈尔格萨', kuthu: '库图', Machi: '马奇', Mesa: '台地', shona: '绍纳', vilakku: '维拉库', Bend: '河湾', document: '文书', Kerala: '喀拉拉',
  keris: '克里斯', 'nón': '斗笠', Bikéyah: '比凯亚', Chiefdom: '酋邦', Diné: '迪内', Gaur: '高尔', Kathmandu: '加德满都', Mbya: '姆比亚', Northwest: '西北',
  paddle: '桨', Shona: '绍纳', Spice: '香料', spice: '香料', Tabasco: '塔巴斯科', trapelakucha: '特拉佩拉库查', Allahabad: '阿拉哈巴德', boatman: '船夫',
  chest: '箱', coca: '古柯', Griot: '格里奥', lamba: '兰巴', maraca: '沙锤', Zuni: '祖尼', Army: '军队', buffalo: '水牛', cornmeal: '玉米粉', Country: '国土',
  Grande: '格兰德', 'Issyk-Kul': '伊塞克湖', kachina: '卡奇娜', processional: '游行用', Rio: '里约', Sarnath: '鹿野苑', Tay: '西', 'akhal-take': '阿哈尔捷金',
  bridle: '辔头', button: '纽扣', Congo: '刚果', Frankincense: '乳香',
})

Object.assign(supplementalLocalizedTokens, {
  silk: '丝绸', Ashur: '亚述', Tribal: '部族', ceremonial: '仪式的', Debre: '德布雷', ivory: '象牙', skin: '皮革', carved: '雕刻的',
  ewer: '壶', stick: '棍', Lakes: '湖群', Sangha: '僧团', Georgian: '格鲁吉亚', Swahili: '斯瓦希里', Adat: '习俗', Armenian: '亚美尼亚',
  Gathering: '集会', leaf: '叶', Railway: '铁路', rifle: '步枪', Sun: '太阳', cacao: '可可', Oasis: '绿洲', Corps: '军团', dagger: '匕首',
  Nile: '尼罗河', Madrasa: '经学院', Ayllu: '氏族共同体', Beth: '贝特', poetry: '诗歌', panel: '画板', Congress: '国会', Continental: '大陆',
  carpet: '地毯', miniature: '细密画', pouch: '小袋', Tea: '茶', Altiplano: '高原', sari: '纱丽', Grand: '大', jade: '玉', Mughal: '莫卧儿',
  Ra: '拉', Ife: '伊费', Kilwa: '基尔瓦', Samanid: '萨曼王朝', South: '南方', club: '棍棒', lei: '花环', chapkan: '查普坎长袍',
})

const latinFallback: Record<string, string> = { a: '阿', b: '布', c: '克', d: '德', e: '埃', f: '弗', g: '格', h: '赫', i: '伊', j: '杰', k: '卡', l: '尔', m: '姆', n: '恩', o: '欧', p: '普', q: '奎', r: '尔', s: '斯', t: '特', u: '乌', v: '维', w: '沃', x: '克斯', y: '伊', z: '泽' }
const latinSyllableFallback: Record<string, string> = {
  sch: '施', tsch: '奇', kh: '赫', th: '特', ph: '夫', ch: '奇', sh: '什', zh: '日', ts: '茨', tz: '茨', ng: '恩', ny: '尼', qu: '克', gu: '古', gh: '格',
  mueang: '孟', yupanqui: '尤潘基', tupac: '图帕克', ky: '基',
  an: '安', en: '恩', in: '因', on: '翁', un: '温', ar: '阿尔', er: '埃尔', ir: '伊尔', or: '欧尔', ur: '乌尔',
  ba: '巴', be: '贝', bi: '比', bo: '博', bu: '布', ca: '卡', ce: '塞', ci: '西', co: '科', cu: '库', da: '达', de: '德', di: '迪', do: '多', du: '杜',
  fa: '法', fe: '费', fi: '菲', fo: '福', fu: '富', ga: '加', ge: '格', gi: '吉', go: '戈', ha: '哈', he: '赫', hi: '希', ho: '霍', hu: '胡',
  ja: '贾', je: '杰', ji: '吉', jo: '乔', ju: '朱', ka: '卡', ke: '克', ki: '基', ko: '科', ku: '库', la: '拉', le: '勒', li: '利', lo: '洛', lu: '卢',
  ma: '马', me: '梅', mi: '米', mo: '莫', mu: '穆', na: '纳', ne: '妮', ni: '尼', no: '诺', nu: '努', pa: '帕', pe: '佩', pi: '皮', po: '波', pu: '普',
  ra: '拉', re: '雷', ri: '里', ro: '罗', ru: '鲁', sa: '萨', se: '塞', si: '西', so: '索', su: '苏', ta: '塔', te: '特', ti: '蒂', to: '托', tu: '图',
  va: '瓦', ve: '维', vi: '维', vo: '沃', vu: '武', wa: '瓦', we: '韦', wi: '维', wo: '沃', ya: '雅', ye: '叶', yi: '伊', yo: '约', yu: '尤', za: '扎', ze: '泽', zi: '齐', zo: '佐', zu: '祖',
}
const latinSyllableKeys = Object.keys(latinSyllableFallback).sort((left, right) => right.length - left.length)
function fallbackTransliterate(token: string) {
  const normalized = token.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  let cursor = 0
  let result = ''
  while (cursor < normalized.length) {
    const key = latinSyllableKeys.find((candidate) => normalized.startsWith(candidate, cursor))
    if (key) {
      result += latinSyllableFallback[key]
      cursor += key.length
      continue
    }
    result += latinFallback[normalized[cursor]] ?? ''
    cursor += 1
  }
  return result.replace(/(.)\1+/g, '$1') || '异域名'
}
type TokenLocalization = { display: string; source: 'native' | 'curated' | 'controlled' }
const localizedPatronymicStems: Record<string, string> = {
  Eriks: '埃里克', Leifs: '莱夫', Bjorns: '比约恩', Haralds: '哈拉尔', Svens: '斯文', Knuts: '克努特', Ragnars: '拉格纳', Olafs: '奥拉夫', Gunnars: '贡纳尔', Ivars: '伊瓦尔',
  Halfdanar: '哈尔夫丹', Egils: '埃吉尔', Hakonar: '哈康', Styrbjorns: '斯蒂尔比约恩', Torstens: '托尔斯滕', Ulfs: '乌尔夫', Vidars: '维达尔', Orms: '奥尔姆', Arnes: '阿尔内', Ketils: '凯蒂尔', Rolfs: '罗尔夫', Skardes: '斯卡德', Trygves: '特里格维',
  Magnus: '马格努斯', Haakons: '哈康', Sigurds: '西居尔', Eiriks: '埃里克', Olavs: '奥拉夫', Eysteins: '埃于斯泰因', Hrolfs: '赫罗尔夫', Torleifs: '托尔莱夫', Aslaks: '阿斯拉克', Bards: '博尔', Steinars: '斯泰纳尔', Birgers: '比耶尔', Erlends: '埃伦', Gorms: '戈姆', Kjells: '谢尔', Valdemars: '瓦尔德马',
  Hakons: '哈康', Guttorms: '古托姆', Ragnvalds: '拉格瓦尔德', Torsteins: '托尔斯泰因', Gudrods: '古德勒德', Havards: '霍瓦尔', Erlings: '埃林', Inges: '英格', Sverres: '斯韦勒', Skules: '斯库勒', Jons: '约恩', Pals: '波尔', Auduns: '奥敦', Hallvards: '哈尔沃尔', Torfinns: '托尔芬',
  Jóns: '约恩', Magnúsar: '马格努斯', Einars: '埃纳尔', 'Ólafs': '奥拉夫', 'Björns': '比约恩', Arnars: '阿纳尔', 'Kristjáns': '克里斯蒂安', Snorra: '斯诺里', Ara: '阿里', Kjartans: '卡尔坦', Grettis: '格雷蒂尔', Hrafns: '赫拉芬', Kolbeins: '科尔贝因', 'Þorvalds': '索尔瓦尔德', Bjarna: '比亚尔尼',
  'Njáls': '尼亚尔', 'Skarphéðins': '斯卡菲丁', 'Gísla': '吉斯利', 'Þorgeirs': '索尔盖尔', 'Hallfreðar': '哈尔弗雷德', Baldurs: '巴尔德', 'Hákonar': '哈康', 'Eiríks': '埃里克', 'Guðmundar': '居德蒙德', 'Sigurðar': '西居尔德', 'Þórðar': '索尔德', Andra: '安德里', 'Kára': '卡里',
}
function resolveLocalizedToken(token: string): TokenLocalization {
  if (!token || /[\u3400-\u9fff]/.test(token)) return { display: token, source: 'native' }
  if (supplementalLocalizedTokens[token] || localizedTokens[token]) return { display: supplementalLocalizedTokens[token] ?? localizedTokens[token], source: 'curated' }
  const normalized = token.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (supplementalLocalizedTokens[normalized] || localizedTokens[normalized]) return { display: supplementalLocalizedTokens[normalized] ?? localizedTokens[normalized], source: 'curated' }
  const patronymic = token.match(/^(.+?)(dóttir|son)$/u)
  if (patronymic && localizedPatronymicStems[patronymic[1]]) return { display: `${localizedPatronymicStems[patronymic[1]]}${patronymic[2] === 'son' ? '松' : '多蒂尔'}`, source: 'curated' }
  return { display: fallbackTransliterate(token), source: 'controlled' }
}
function localizeToken(token: string) {
  return resolveLocalizedToken(token).display
}

// Match compound surnames and multi-word names before splitting on spaces.
// The longest phrase wins, allowing entries such as "Aung San Suu Kyi" and
// "Running Bear" to remain intact.
// Vietnamese historical names are kept in their proper Vietnamese spelling
// and use established Chinese renderings where a historical form exists.
Object.assign(supplementalLocalizedTokens, {
  'Đinh Tiên Hoàng': '丁部领', 'Lý Thái Tổ': '李太祖', 'Trần Hưng Đạo': '陈兴道', 'Lê Lợi': '黎利', 'Nguyễn Trãi': '阮廌',
  'Quang Trung': '光中', 'Gia Long': '嘉隆', 'Minh Mạng': '明命', 'Âu Cơ': '欧姬', 'Trưng Trắc': '征侧', 'Trưng Nhị': '征贰',
  'Lý Chiêu Hoàng': '李昭皇', 'Ngọc Hân': '玉欣', 'Ỷ Lan': '倚兰', 'Huyền Trân': '玄珍', 'Thúy Kiều': '翠翘',
  'Phan Bội Châu': '潘佩珠', 'Phan Chu Trinh': '潘周桢', 'Hoàng Hoa Thám': '黄花探', 'Nguyễn Thái Học': '阮太学', 'Võ Nguyên Giáp': '武元甲',
  'Bảo Đại': '保大', 'Tôn Đức Thắng': '孙德胜', 'Phạm Văn Đồng': '范文同', 'Hoàng Thị Loan': '黄氏鸾', 'Nguyễn Thị Minh Khai': '阮氏明开',
  'Võ Thị Sáu': '武氏六', 'Nguyễn Thị Định': '阮氏定', 'Bà Huyện Thanh Quan': '县婆清观', 'Hồ Xuân Hương': '胡春香', 'Nam Phương': '南芳', 'Phan Thị Ràng': '潘氏朗',
  'Đức Anh': '德英', 'Hoàng Long': '黄龙', 'Quốc Bảo': '国宝', 'Tuấn Kiệt': '俊杰', 'Thanh Long': '青龙', 'Gia Huy': '嘉辉', 'Duy Khánh': '维庆', 'Minh Quân': '明君',
  'Bảo Ngọc': '宝玉', 'Diệu Linh': '妙灵', 'Hà My': '河美', 'Khánh Linh': '庆玲', 'Ngọc Anh': '玉英', 'Quỳnh Như': '琼如', 'Thảo Nguyên': '草原', 'Yến Nhi': '燕儿',
  'Hà Nội': '河内', 'Sài Gòn': '西贡', 'Mê Kông': '湄公河', 'Sông Hồng': '红河', 'Triều Nguyễn': '阮朝', 'Nha quan lại': '官署', 'Hội đồng làng': '村社议事会',
  'nón lá': '斗笠', gươm: '剑', 'sáo trúc': '竹笛',
  'Yarlung Tsangpo': '雅鲁藏布江',
  Accra: '阿克拉', 'Kwakwaka’wakw': '夸扣特尔', Macina: '马西纳', Maradi: '马拉迪', Aburi: '阿布里', Adama: '阿达马', Adamawa: '阿达马瓦', Amazigh: '阿马齐格', Ankara: '安卡拉', Arts: '艺术', Avar: '阿瓦尔', Balkh: '巴尔赫', Bekal: '贝卡尔', bentwood: '弯曲木', Bida: '比达', 'black-on-white': '黑底白纹', Boma: '博马', Bonito: '博尼托', Bosaso: '博萨索', Cayuga: '卡尤加', Center: '中心', Chaco: '查科', Chiefs: '酋长', Chilkat: '奇尔卡特', coast: '海岸', Coba: '科巴', Cultural: '文化', dance: '舞蹈', Eger: '埃格尔', Fe: '菲', fetish: '护符像', garba: '加尔巴', Garowe: '加罗韦', Gobir: '戈比尔', Governors: '总督', Harare: '哈拉雷', Hatra: '哈特拉', Ifat: '伊法特', Indigenous: '原住民', inlay: '嵌饰', Itamaraca: '伊塔马拉卡', Jemez: '杰梅斯', Jol: '乔尔', Kapaa: '卡帕阿', Karakol: '卡拉科尔', katsina: '卡奇纳', Kulob: '库洛布', language: '语言', Mahabad: '马哈巴德', Malinalco: '马利纳尔科', mallku: '马尔库', Manakara: '马纳卡拉', 'Manuʻa': '马努阿', Mutare: '穆塔雷', northwest: '西北', nose: '鼻', 'Nuu-chah-nulth': '努查努尔特', Para: '帕拉', Pilbara: '皮尔巴拉', Prince: '普林斯', Puno: '普诺', Purus: '普鲁斯', Queen: '女王', Rano: '拉诺', rattle: '沙锤', raven: '渡鸦', Rotuma: '罗图马', Rupert: '鲁珀特', Santa: '圣', school: '学校', Skeena: '斯基纳', Sound: '海峡', Tacna: '塔克纳', Takoradi: '塔科拉迪', Taranaki: '塔拉纳基', Territory: '领地', Tsimshian: '钦西安', Tuvalu: '图瓦卢', Vakhsh: '瓦赫什', Verde: '维德', Akure: '阿库雷', Bagamoyo: '巴加莫约', bata: '巴塔', Ekiti: '埃基蒂', Kisiwani: '基西瓦尼', Lobola: '罗博拉',
})

// Obscure epigraphic and late-antique names have no stable Chinese exonyms.
// Curate each whole form here so the UI never falls back to letter-by-letter output.
Object.assign(supplementalLocalizedTokens, {
  ADDILONA: '阿迪洛纳', ALATTOS: '阿拉托斯', BIVAIDONAS: '比瓦伊多纳斯', CATTINI: '卡蒂尼', CATTUVIR: '卡图维尔', CORBBI: '科尔比', CUNAGUSOS: '库纳古索斯', CUNOVATOS: '库诺瓦托斯', DOVETI: '多维蒂', DOVINIAS: '多维尼亚斯', DUCOVAROS: '杜科瓦罗斯', IVACATTOS: '伊瓦卡托斯', LABRID: '拉布里德', LUGA: '卢加', LUGUDECAS: '卢古德卡斯', LUGUQRIT: '卢古克里特', MEDALO: '梅达洛', 'NETA-CARI': '内塔卡里', QENILOCI: '奎尼洛基', RITTAVVECCAS: '里塔韦卡斯', RONANN: '罗南', SEDANI: '塞达尼', SUVALLOS: '苏瓦洛斯', VORTIGURN: '沃尔蒂古恩', VOTI: '沃蒂',
  'Gaius Julius Civilis': '盖乌斯·尤利乌斯·奇维利斯', 'Claudius Labeo': '克劳狄乌斯·拉贝奥', 'Julius Briganticus': '尤利乌斯·布里甘提库斯', 'Julius Paulus': '尤利乌斯·保卢斯', Brinno: '布林诺', Chariovalda: '卡里奥瓦尔达', Mallius: '马利乌斯', Verritus: '维里图斯', Malorix: '马洛里克斯', Cruptorix: '克鲁普托里克斯',
  Daurentius: '达乌伦提乌斯', Musokios: '穆索基奥斯', Ardagast: '阿尔达加斯特', Peiragastus: '佩拉加斯特', Mezamer: '梅扎梅尔', Idariz: '伊达里兹', Kelagast: '克拉加斯特', Akamir: '阿卡米尔', Sclagamar: '斯克拉加马尔', Chatzon: '哈宗', Perboundos: '佩尔邦多斯', Dabragezas: '达布拉格萨斯',
})

// Whole-name Chinese renderings for the audited ancient South Asian packs.
// They take precedence over syllable fallback and retain the source spelling
// in nativeName for checking against inscriptions and historical literature.
Object.assign(supplementalLocalizedTokens, {
  Yajnavalkya: '耶若婆佉', Janaka: '遮那迦', Ajatashatru: '阿阇世', Bimbisara: '频婆娑罗', Prasenajit: '波斯匿', Udayana: '优填王', Panini: '波你尼', Gautama: '乔达摩', Mahavira: '筏驮摩那', Siddhartha: '悉达多',
  Gargi: '伽尔吉', Maitreyi: '弥勒多依', Lopamudra: '露波母陀罗', Ghosha: '瞿沙', Amrapali: '庵摩罗波利', Yashodhara: '耶输陀罗', 'Kisa Gotami': '翅舍乔答弥', Vishpala: '毗湿波罗',
  Chandragupta: '旃陀罗笈多', Bindusara: '宾头沙罗', Pushyamitra: '补砂密多罗', Kanishka: '迦腻色迦', Samudragupta: '沙摩陀罗笈多', 'Chandragupta II': '旃陀罗笈多二世', Harsha: '戒日王', Chanakya: '考底利耶', Vishnugupta: '毗湿奴笈多',
  Prabhavati: '钵罗婆伐底', Kumaradevi: '鸠摩罗提毗', Dhruvadevi: '陀罗婆提毗', Charumati: '遮卢摩底', Sanghamitta: '僧伽蜜多', Sulabha: '苏罗婆',
  Karikala: '迦利迦罗', Neduncheliyan: '内敦切利延', Senguttuvan: '森古图万', Satakarni: '娑多迦尼', Gautamiputra: '乔达弥子', 'Yajna Sri': '耶若室利', Ilango: '伊兰戈', Sattanar: '萨塔纳尔', 'Nedum Cheralathan': '内敦切拉拉丹', Cenkuttuvan: '森古图万',
  Avvaiyar: '奥韦亚尔', Madhavi: '摩陀毗', Kannagi: '甘纳吉', Manimekalai: '摩尼梅卡莱', Nangai: '南盖', Poonguzhali: '蓬古扎利', Vasumathi: '婆苏摩底', Kumudavalli: '俱牟陀伐利',
  Pulakeshin: '补罗稽舍二世', Mayurasharma: '摩瑜罗设摩', Vishnuvardhana: '毗湿奴伐弹那', Dantidurga: '檀底突伽', Amoghavarsha: '不空王', Rajaraja: '罗阇罗阇', Rajendra: '罗阇因陀罗', Narasimhavarman: '那罗僧诃跋摩', Mahendravarman: '摩醯因陀罗跋摩', Kochengannan: '科琴甘南',
  Andal: '安达尔', Kundavai: '贡达毗', Sembiyan: '森比扬', Rudramadevi: '楼陀罗摩提毗', Tribhuvana: '三界摩提毗', Lokamahadevi: '世间大后', Ammangai: '阿曼盖', Rangapataka: '兰伽波多迦',
  Shashanka: '设赏迦', Gopala: '瞿波罗', Dharmapala: '达摩波罗', Devapala: '提婆波罗', Bhaskara: '婆塞羯罗', Bhatta: '跋吒', Vainyagupta: '毗尼耶笈多', Gopachandra: '瞿波旃陀罗', Samacharadeva: '娑摩遮罗提婆', Jayanaga: '阇耶那伽',
  Kalyani: '迦利耶尼', Durgavati: '突伽伐底', Maya: '摩耶', Sarasvati: '辩才天', Bhadra: '跋陀罗', Devi: '提毗',
  Simuka: '尸牟迦', Vasisthiputra: '婆私瑟吒子', Nahapana: '那诃波那', Rudradaman: '楼陀罗达摩', Bhumaka: '部摩迦', Isvaradatta: '自在施', Chashtana: '车湿多那',
  Naganika: '那伽尼迦', 'Gautami Balashri': '乔达弥婆罗室利', Vasishthi: '婆私瑟耻', Dhamma: '达摩', Rohini: '卢醯尼',
})

// Whole-name Chinese renderings for the isolated early Southeast Asian packs.
// The source form remains visible in nativeName; these curated labels prevent
// epigraphic and Old Malay/Javanese names from falling into syllable fallback.
Object.assign(supplementalLocalizedTokens, {
  Bhadravarman: '跋陀罗跋摩', Gangaraja: '恒伽罗阇', Prakashadharma: '波罗迦舍达摩', Rudravarman: '留陀跋摩',
  Satyakausikasvamin: '萨底憍尸迦斯婆弥', Isanavarman: '伊奢那跋摩', Sambhuvarman: '商菩跋摩', Kandarpadharma: '建达婆达摩',
  Vikrantavarman: '毗建陀跋摩', 'Jaya Indravarman': '阇耶·因陀罗跋摩', Jagaddharma: '世间达摩',
  Kaundinya: '憍陈如', 'Fan Pan': '范蔓', 'Fan Chang': '范长', 'Fan Zhan': '范旃', 'Fan Shiman': '范师蔓', 'Fan Xun': '范寻',
  Jayavarman: '阇耶跋摩', Liuye: '柳叶', Soma: '苏摩', Kulaprabhavati: '俱罗钵罗婆伐底', Bhavavarman: '跋婆跋摩',
  Pushkaraksha: '补涩迦罗刹', Nrpatindravarman: '奴利波因陀罗跋摩', Jayadevi: '阇耶提毗',
  Suryavikrama: '苏利耶毗迦摩', Harivikrama: '诃利毗迦摩', Sihavikrama: '僧诃毗迦摩',
  'Dapunta Hyang Sri Jayanasa': '达蓬塔·香·室利·阇耶那舍', Dharmasetu: '达摩塞都', Balaputradeva: '婆罗普陀罗提婆',
  Sangramadhananjaya: '僧伽罗摩·达南阇耶', 'Sri Cudamaniwarmadewa': '室利·朱荼摩尼跋摩提婆', 'Mara Vijayottungavarman': '摩罗·毗阇耶乌通伽跋摩',
  Sanjaya: '散阇耶', 'Dapunta Selendra': '达蓬塔·舍连陀罗', Panangkaran: '波南迦兰', Wisnu: '毗湿奴', Indra: '因陀罗', Shima: '悉莫女王',
  'Rakai Panangkaran': '拉凯·波南迦兰', Dharanindra: '达罗尼因陀罗', Samaragrawira: '三摩罗格罗毗罗', 'Rakai Pikatan': '拉凯·皮卡坦',
  'Rakai Kayuwangi': '拉凯·卡尤旺吉', Balitung: '巴利通', Daksha: '达克沙', Tulodhong: '图洛东', Wawa: '瓦瓦',
  'Mpu Sindok': '恩普·辛多克', Dharmawangsa: '达摩旺沙', Airlangga: '艾尔朗加', Pramodhawardhani: '钵罗谟陀跋弹尼',
  'Sri Kahulunnan': '室利·卡胡卢南', 'Gunapriya Dharmapatni': '伽那钵利耶·达摩波特尼', 'Isyana Tunggawijaya': '伊悉耶那·通迦毗阇耶',
  'Sri Kesari Warmadewa': '室利·凯萨里·跋摩提婆', Ugrasena: '乌格罗塞那', Tabanendra: '塔巴嫩德拉',
  'Jayasingha Warmadewa': '阇耶僧诃·跋摩提婆', Janasadhu: '阇那娑度', 'Udayana Warmadewa': '优陀耶那·跋摩提婆',
  Marakata: '摩罗迦多', 'Anak Wungsu': '阿纳克·翁苏', 'Sang Ratu Luhur': '桑·拉图·卢胡尔',
  'Lapu-Lapu': '拉普拉普', Humabon: '胡马邦', Sikatuna: '西卡图纳', Lakandula: '拉坎杜拉', 'Rajah Sulayman': '苏莱曼王',
  'Rajah Matanda': '马坦达王', 'Rajah Tupas': '图帕斯王', 'Datu Zula': '祖拉达图', Kolambu: '科兰布', Siagu: '西亚古',
  Pagbuaya: '帕格布阿亚', 'Dayang Kalangitan': '卡兰吉丹王后',
})

Object.assign(supplementalLocalizedTokens, ancientLocalizedNames)

const localizedPhraseEntries = Object.entries({ ...localizedTokens, ...supplementalLocalizedTokens })
  .filter(([key]) => /\s/.test(key))
  .map(([key, value]) => ({ tokens: key.trim().split(/\s+/), value }))
  .sort((left, right) => right.tokens.length - left.tokens.length)

function localizeFullName(nativeName: string, culture?: OfflineCulture) {
  const exact = localizedTokens[nativeName] ?? supplementalLocalizedTokens[nativeName]
  if (exact) return exact
  if (/^[\u3400-\u9fff\s·－—-]+$/.test(nativeName)) return nativeName.replace(/\s+/g, '')
  const tokens = nativeName.split(/\s+/).filter(Boolean)
  const localized: string[] = []
  for (let index = 0; index < tokens.length;) {
    const phrase = localizedPhraseEntries.find((entry) => entry.tokens.every((token, offset) => token === tokens[index + offset]))
    if (phrase) {
      localized.push(phrase.value)
      index += phrase.tokens.length
    } else {
      localized.push(localizeToken(tokens[index]))
      index += 1
    }
  }
  // The native Vietnamese field keeps surname, middle-name and primary-name
  // spaces. Chinese display labels concatenate their mapped characters; the
  // middle dot is a foreign-name convention and must not be introduced here.
  const result = localized.join(culture === 'vietnamese' ? '' : '·')
  return culture === 'vietnamese' ? result.replace(/·/g, ' ') : result
}

function localizeCatalogName(nativeName: string, culture?: OfflineCulture) {
  return localizeFullName(nativeName, culture).replace(/[·\s]+/g, '')
}

// Exposed for diagnostics and future importers that need the same display
// translation as the offline name generator.
export function localizeOfflineName(nativeName: string, culture?: OfflineCulture) { return localizeFullName(nativeName, culture) }
export function localizeOfflineCatalogName(nativeName: string, culture?: OfflineCulture) { return localizeCatalogName(nativeName, culture) }

// Diagnostic hook for the data audit. Curated entries are preferred, while
// controlled syllable rendering guarantees a Chinese display for rare tokens.
// The historical function name is kept for compatibility; it now returns the
// tokens rendered by the controlled syllable layer, not an unresolved value.
export function getOfflineNameFallbackTokens(nativeName: string) {
  if (localizedTokens[nativeName] || supplementalLocalizedTokens[nativeName] || /^[\u3400-\u9fff\s·－—-]+$/.test(nativeName)) return []
  const tokens = nativeName.split(/\s+/).filter(Boolean)
  const fallbackTokens: string[] = []
  for (let index = 0; index < tokens.length;) {
    const phrase = localizedPhraseEntries.find((entry) => entry.tokens.every((token, offset) => token === tokens[index + offset]))
    if (phrase) index += phrase.tokens.length
    else {
      if (resolveLocalizedToken(tokens[index]).source === 'controlled') fallbackTokens.push(tokens[index])
      index += 1
    }
  }
  return fallbackTokens
}

export function getOfflineNameTranslationSources(nativeName: string) {
  if (localizedTokens[nativeName] || supplementalLocalizedTokens[nativeName] || /^[\u3400-\u9fff\s·－—-]+$/.test(nativeName)) {
    return { curatedTokenCount: 0, controlledTokenCount: 0, unresolvedTokenCount: 0 }
  }
  const tokens = nativeName.split(/\s+/).filter(Boolean)
  let curatedTokenCount = 0
  let controlledTokenCount = 0
  let unresolvedTokenCount = 0
  for (let index = 0; index < tokens.length;) {
    const phrase = localizedPhraseEntries.find((entry) => entry.tokens.every((token, offset) => token === tokens[index + offset]))
    if (phrase) {
      curatedTokenCount += phrase.tokens.length
      index += phrase.tokens.length
      continue
    }
    const source = resolveLocalizedToken(tokens[index])
    if (source.source === 'curated') curatedTokenCount += 1
    else if (source.source === 'controlled' && source.display) controlledTokenCount += 1
    else unresolvedTokenCount += 1
    index += 1
  }
  return { curatedTokenCount, controlledTokenCount, unresolvedTokenCount }
}

// Period-specific, complete given names. These replace the old free-form
// character combinations: period selection changes the actual source pool.
const periodGivenNames: Partial<Record<OfflineCulture, Record<string, PersonDatum[]>>> = {
  chinese: {
    'paleolithic-reference': [],
    'neolithic-reference': [],
    'xia-erlitou': [],
    'shang-western-zhou': sexed(['武丁', '祖甲', '帝乙', '帝辛', '昌', '发', '旦', '奭', '诵', '宜臼', '姬满', '宫湦'], ['妇好', '妇妌', '太姒', '邑姜', '褒姒', '孟姬', '叔姜', '卫姬']),
    'eastern-zhou': sexed(['重耳', '夷吾', '小白', '勾践', '夫差', '无恤', '魏罃', '田因齐', '商鞅', '屈原', '苏秦', '张仪', '白起', '李斯'], ['西施', '赵姬', '宣太后', '郑袖', '虞姬', '孟姜', '庄姜', '季姬']),
    'qin-han': sexed(['政', '斯', '何', '羽', '籍', '邦', '彻', '据', '秀', '备', '操', '丕', '懿', '亮', '衡', '迁'], ['娥', '昭君', '少君', '文君', '子夫', '丽华', '班昭', '蔡琰', '貂蝉', '甄宓']),
    'pre-qin-han': sexed(['政', '丹', '恭', '扶苏', '子房', '子长', '延年', '孟德', '伯符', '仲谋', '公瑾', '元直'], ['娥', '姬', '虞', '昭君', '少君', '文君', '子夫', '丽华']),
    'wei-jin-tang': sexed(['玄', '之', '道玄', '彦博', '弘礼', '叔达', '承乾', '怀慎', '士廉', '元振', '敬之', '子昂'], ['徽音', '令月', '婉儿', '玉环', '采苹', '若兰', '芳仪', '静徽']),
    'song-yuan': sexed(['仲淹', '介甫', '子瞻', '子由', '尧夫', '景臣', '德明', '公弼', '子昂', '维桢', '伯温', '若水'], ['清照', '妙真', '月英', '淑真', '瑞兰', '玉娘', '素娥', '婉容']),
    'ming-qing': sexed(['廷玉', '文渊', '世杰', '国栋', '继祖', '宗翰', '士奇', '梦麟', '允恭', '守仁', '慎行', '伯安'], ['玉兰', '淑贞', '桂英', '惠娘', '婉贞', '素云', '瑞芳', '月娥']),
    republic: sexed(['志远', '德明', '文华', '建中', '振邦', '伯钧', '允和', '敬安', '克明', '绍文', '明轩', '启元'], ['秀英', '淑芬', '静宜', '婉清', '慧贞', '佩兰', '雅琴', '玉华', '素心', '曼君']),
    modern: sexed(['浩然', '宇航', '俊杰', '嘉诚', '一鸣', '子健', '明远', '泽宇', '嘉树', '景川', '承安', '亦辰', '昊然', '天佑', '博文', '睿哲', '梓轩', '思远', '嘉佑', '知行', '予安', '景程', '维安', '书言'], ['欣怡', '雨桐', '佳宁', '思妍', '若琳', '诗涵', '静宜', '晓彤', '嘉宁', '清妍', '舒然', '念慈', '语嫣', '安然', '瑾瑜', '书瑶', '可心', '沐晴', '知夏', '清欢', '心妍', '怡宁', '语晨', '嘉禾']),
  },
  japanese: {
    'asuka-nara': sexed(['广足', '丰成', '永手', '百川', '宅嗣', '清麻吕', '继绳', '雄友'], ['广虫', '刀自古', '安宿', '古奈可', '多比能', '袁祁', '石川女', '宅媛']),
    heian: sexed(['公任', '行成', '齐信', '俊贤', '隆家', '伊周', '成通', '雅信'], ['明子', '伦子', '媓子', '妍子', '嬉子', '丽子', '宽子', '任子']),
    'kamakura-muromachi': sexed(['义兼', '泰盛', '时赖', '贞时', '师直', '赖之', '满兼', '持氏'], ['千代野', '觉海', '清子', '宣子', '业子', '徽安', '了子', '祥子']),
    'sengoku-azuchi': sexed(['信纲', '义信', '景纲', '元春', '隆元', '忠家', '宗景', '长政'], ['松', '菊', '鹤', '千代', '玉', '阿春', '阿福', '阿菊']),
    edo: sexed(['吉次', '忠兵卫', '清右卫门', '庄助', '源次郎', '新之助', '文治', '诚一郎'], ['阿菊', '阿春', '阿夏', '阿琴', '阿雪', '阿绢', '阿园', '阿梅']),
    'meiji-showa': sexed(['博文', '重信', '一郎', '清', '正雄', '英世', '健次郎', '达夫'], ['晶子', '绿', '花子', '文', '节子', '八重', '君子', '和子']),
    modern: sexed(['大和', '拓海', '直人', '健一', '悠真', '春树', '莲', '翔太', '阳介', '优斗', '和也', '诚', '悠斗', '俊介', '奏', '海斗'], ['美咲', '葵', '樱', '阳子', '千代', '凛', '和子', '千寻', '结衣', '爱', '花', '七海', '美月', '优奈', '琴音', '真央']),
  },
  korean: {
    'three-kingdoms': sexed(['无恤', '延优', '伯固', '男武', '丘夫', '巨连', '平成', '建武'], ['德曼', '胜曼', '宝姬', '文姬', '阿老', '宝饭', '玉帽', '明珠']),
    'unified-silla': sexed(['信忠', '元训', '贞明', '允文', '孝成', '景信', '俊邕', '忠恭'], ['明德', '贞和', '顺元', '昭明', '宝姬', '文贞', '惠明', '真静']),
    goryeo: sexed(['齐贤', '仁老', '奎报', '之衍', '允绥', '安裕', '思敬', '梦周'], ['宝', '顺敬', '德宁', '明德', '文和', '仁德', '安惠', '敬和']),
    'early-joseon': sexed(['世衡', '孝孙', '文炯', '仲舟', '叔舟', '希孟', '士元', '彦弼'], ['玉贞', '顺德', '淑仪', '敬惠', '贞敬', '惠顺', '明淑', '仁惠']),
    'late-joseon': sexed(['昌协', '正喜', '弘集', '玉均', '济弼', '时烈', '元行', '命源'], ['明温', '德温', '福温', '贞淑', '顺元', '惠庆', '玉莲', '明德']),
    'korean-empire': sexed(['秉俊', '容翊', '重明', '熙斗', '圭植', '允植', '完熙', '镇浩'], ['贞洞', '玉贞', '明顺', '淑明', '仁善', '顺爱', '惠贞', '英姬']),
    colonial: sexed(['东柱', '相和', '光洙', '昌浩', '元禄', '凤吉', '英镇', '泰俊'], ['英信', '花淑', '贞熙', '顺得', '玉礼', '仁淑', '明子', '惠贞']),
    'south-modern': sexed(['民俊', '志勋', '贤宇', '俊赫', '道允', '成民', '善宇', '智勋', '泰贤', '延宇', '建宇', '承佑', '俊成', '宇镇', '时宇', '河俊'], ['瑞妍', '恩智', '秀妍', '智秀', '娜恩', '敏智', '秀彬', '智雅', '恩彩', '夏允', '允儿', '彩媛', '敏书', '素妍', '书雅', '多恩']),
    'north-modern': sexed(['哲洙', '英浩', '光哲', '成哲', '明哲', '永男', '正浩', '昌洙', '东哲', '光男', '成浩', '英哲', '春吉', '荣洙', '正男', '明洙'], ['玉姬', '英淑', '贞淑', '春姬', '京姬', '顺姬', '明淑', '英玉', '香姬', '贤淑', '锦顺', '福姬', '银姬', '美淑', '贞姬', '春玉']),
  },
  english: {
    medieval: sexed(['William', 'Henry', 'Thomas', 'John', 'Edmund', 'Geoffrey', 'Hugh', 'Walter', 'Richard', 'Robert', 'Stephen', 'Simon', 'Roger', 'Ralph', 'Gilbert'], ['Alice', 'Eleanor', 'Margaret', 'Matilda', 'Joan', 'Isabel', 'Agnes', 'Beatrice', 'Hawise', 'Maud', 'Cecily', 'Edith', 'Avice']),
    'early-modern': sexed(['Edward', 'James', 'Charles', 'George', 'Francis', 'Nicholas', 'Samuel', 'Benjamin', 'Thomas', 'Henry', 'Walter', 'Edmund', 'Philip'], ['Anne', 'Catherine', 'Jane', 'Mary', 'Elizabeth', 'Frances', 'Dorothy', 'Abigail', 'Margaret', 'Bridget', 'Judith', 'Rebecca', 'Susanna']),
    modern: sexed(['Oliver', 'George', 'Noah', 'Arthur', 'Harry', 'Jack', 'Leo', 'Oscar', 'Theodore', 'Freddie', 'Archie', 'Charlie', 'Alfie', 'Thomas', 'Finley', 'Benjamin', 'Alexander', 'Daniel', 'Joseph', 'Samuel', 'Ethan'], ['Amelia', 'Olivia', 'Isla', 'Ava', 'Mia', 'Lily', 'Sophia', 'Grace', 'Ella', 'Ivy', 'Freya', 'Evie', 'Poppy', 'Isabella', 'Florence', 'Willow', 'Emily', 'Charlotte', 'Matilda', 'Sophie', 'Lucy']),
  },
  french: {
    medieval: sexed(['Guillaume', 'Geoffroi', 'Louis', 'Charles', 'Philippe', 'Étienne', 'Hugues'], ['Jeanne', 'Marguerite', 'Isabelle', 'Aliénor', 'Agnès', 'Mathilde']),
    'ancien-regime': sexed(['Jean', 'Pierre', 'Louis', 'Henri', 'Antoine', 'François'], ['Marie', 'Jeanne', 'Élise', 'Madeleine', 'Colette', 'Marguerite']),
    modern: sexed(['Gabriel', 'Léo', 'Louis', 'Jules', 'Hugo', 'Arthur'], ['Louise', 'Jade', 'Ambre', 'Emma', 'Alice', 'Rose']),
  },
  german: {
    medieval: sexed(['Heinrich', 'Friedrich', 'Konrad', 'Otto', 'Dietrich', 'Hermann'], ['Adelheid', 'Mathilde', 'Gertrud', 'Hildegard', 'Kunigunde']),
    'early-modern': sexed(['Johann', 'Hans', 'Friedrich', 'Wilhelm', 'Georg', 'Ludwig'], ['Anna', 'Clara', 'Elisabeth', 'Margarete', 'Johanna']),
    modern: sexed(['Noah', 'Matteo', 'Leon', 'Finn', 'Paul', 'Felix'], ['Emilia', 'Emma', 'Mia', 'Hannah', 'Lina', 'Sofia']),
  },
  italian: {
    medieval: sexed(['Giovanni', 'Pietro', 'Dante', 'Francesco', 'Marco'], ['Beatrice', 'Francesca', 'Gemma', 'Piccarda', 'Costanza']),
    renaissance: sexed(['Lorenzo', 'Giuliano', 'Niccolò', 'Leonardo', 'Alessandro', 'Raffaello'], ['Lucrezia', 'Isabella', 'Caterina', 'Ginevra', 'Simonetta']),
    modern: sexed(['Leonardo', 'Francesco', 'Alessandro', 'Lorenzo', 'Mattia'], ['Sofia', 'Aurora', 'Giulia', 'Ginevra', 'Vittoria']),
  },
  iberian: {
    medieval: sexed(['Alfonso', 'Fernando', 'Rodrigo', 'Sancho', 'Gonzalo', 'Diego'], ['Urraca', 'Leonor', 'Berenguela', 'Isabel', 'Elvira']),
    'early-modern': sexed(['Carlos', 'Felipe', 'Miguel', 'Fernando', 'Juan', 'Luis'], ['María', 'Isabel', 'Carmen', 'Teresa', 'Inés']),
    modern: sexed(['Hugo', 'Mateo', 'Martín', 'Lucas', 'Leo', 'Daniel'], ['Lucía', 'Sofía', 'Martina', 'María', 'Julia', 'Paula']),
  },
  norse: {
    viking: sexed(['Harald', 'Hakon', 'Olav', 'Eirik', 'Sigurd', 'Halfdan', 'Guttorm', 'Bjorn', 'Ragnvald', 'Torstein'], ['Astrid', 'Ragnhild', 'Gunnhild', 'Asa', 'Gyda', 'Sigrid', 'Ingeborg', 'Gudrun', 'Tora', 'Bergljot']),
    medieval: sexed(['Hakon', 'Magnus', 'Olav', 'Sigurd', 'Eirik', 'Harald', 'Eystein', 'Inge', 'Sverre', 'Knut'], ['Ingeborg', 'Margrete', 'Kristin', 'Ragnhild', 'Astrid', 'Gunnhild', 'Eufemia', 'Agnes', 'Katarina', 'Sunniva']),
    modern: sexed(['Jakob', 'Noah', 'Emil', 'Lucas', 'Oliver', 'Isak', 'William', 'Filip', 'Aksel', 'Henrik'], ['Nora', 'Emma', 'Ella', 'Maja', 'Olivia', 'Ingrid', 'Sofie', 'Frida', 'Astrid', 'Hedda']),
  },
  icelandic: {
    medieval: sexed(['Snorri', 'Gunnar', 'Njáll', 'Egill', 'Leifur'], ['Hallgerður', 'Guðrún', 'Bergþóra', 'Sigríður']),
    modern: sexed(['Jón', 'Gunnar', 'Magnús', 'Einar', 'Ólafur', 'Björn', 'Arnar'], ['Sigríður', 'Guðrún', 'Jónína', 'Elín', 'Halla', 'Anna']),
  },
  egyptian: {
    ancient: sexed(['Ramesses', 'Thutmose', 'Amenhotep', 'Akhenaten', 'Meryre', 'Ahmose'], ['Hatshepsut', 'Nefertiti', 'Meritamen', 'Tiye', 'Nefertari']),
    ptolemaic: sexed(['Ptolemaios', 'Alexandros', 'Apollonios', 'Dionysios'], ['Cleopatra', 'Berenike', 'Arsinoe', 'Irene']),
    modern: sexed(['Mohamed', 'Ahmed', 'Mahmoud', 'Omar', 'Youssef', 'Karim'], ['Mariam', 'Nour', 'Salma', 'Aya', 'Farida', 'Layla']),
  },
  'india-north': {
    'vedic-mahajanapada': sexed(['Yajnavalkya', 'Janaka', 'Ajatashatru', 'Bimbisara', 'Prasenajit', 'Udayana', 'Panini', 'Gautama', 'Mahavira', 'Siddhartha'], ['Gargi', 'Maitreyi', 'Lopamudra', 'Ghosha', 'Amrapali', 'Yashodhara', 'Kisa Gotami', 'Vishpala']),
    'maurya-gupta': sexed(['Chandragupta', 'Bindusara', 'Ashoka', 'Pushyamitra', 'Kanishka', 'Samudragupta', 'Chandragupta II', 'Harsha', 'Chanakya', 'Vishnugupta'], ['Prabhavati', 'Kumaradevi', 'Dhruvadevi', 'Amrapali', 'Charumati', 'Sanghamitta', 'Ghosha', 'Sulabha']),
    ancient: sexed(['Arjuna', 'Rama', 'Karna', 'Ashoka', 'Chandragupta'], ['Sita', 'Draupadi', 'Gargi', 'Maitreyi']),
    medieval: sexed(['Prithviraj', 'Vikramaditya', 'Kabir', 'Akbar', 'Rajendra'], ['Mirabai', 'Razia', 'Jodha', 'Lalita']),
    modern: sexed(['Arjun', 'Dev', 'Ravi', 'Vikram', 'Amit', 'Rahul', 'Aditya'], ['Priya', 'Ananya', 'Kavya', 'Meera', 'Asha']),
  },
  'india-south': {
    'sangam-satavahana': sexed(['Karikala', 'Neduncheliyan', 'Senguttuvan', 'Satakarni', 'Gautamiputra', 'Yajna Sri', 'Ilango', 'Sattanar', 'Nedum Cheralathan', 'Cenkuttuvan'], ['Avvaiyar', 'Madhavi', 'Kannagi', 'Manimekalai', 'Nangai', 'Poonguzhali', 'Vasumathi', 'Kumudavalli']),
    'early-kingdoms': sexed(['Pulakeshin', 'Mayurasharma', 'Vishnuvardhana', 'Dantidurga', 'Amoghavarsha', 'Rajaraja', 'Rajendra', 'Narasimhavarman', 'Mahendravarman', 'Kochengannan'], ['Andal', 'Kundavai', 'Sembiyan', 'Rudramadevi', 'Tribhuvana', 'Lokamahadevi', 'Ammangai', 'Rangapataka']),
    ancient: sexed(['Rajendra', 'Rajaraja', 'Arun', 'Kumar', 'Sangam'], ['Andal', 'Kundavai', 'Meenakshi', 'Lakshmi']),
    medieval: sexed(['Krishnadevaraya', 'Basava', 'Madhava', 'Vijayan', 'Narasimha'], ['Akka', 'Rudrama', 'Kavita', 'Kamala']),
    modern: sexed(['Arun', 'Kumar', 'Vijay', 'Suresh', 'Mohan', 'Ravi'], ['Lakshmi', 'Anjali', 'Kavita', 'Priya', 'Meena', 'Divya']),
  },
  vietnamese: {
    dynastic: sexed(['Minh Anh', 'Quốc Huy', 'Đức Minh', 'Gia Bảo'], ['Ngọc Lan', 'Mai Anh', 'Thùy Linh', 'Phương Thảo']),
    colonial: sexed(['Tấn Dũng', 'Thanh Bình', 'Đức Minh'], ['Mai Anh', 'Ngọc Lan', 'Thùy Linh']),
    modern: sexed(['Minh Anh', 'Tấn Dũng', 'Quốc Huy', 'Thanh Bình', 'Đức Minh'], ['Ngọc Lan', 'Mai Anh', 'Thùy Linh', 'Phương Thảo']),
  },
  thai: {
    traditional: sexed(['Somchai', 'Anan', 'Prasert', 'Niran'], ['Suda', 'Mali', 'Sirin']),
    modern: sexed(['Kittipong', 'Anan', 'Niran', 'Thanawat'], ['Pimchanok', 'Suda', 'Mali', 'Nok']),
  },
  malay: {
    traditional: sexed(['Ahmad', 'Ismail', 'Hafiz', 'Farid'], ['Aisyah', 'Siti', 'Nur', 'Zahra']),
    modern: sexed(['Rizal', 'Farid', 'Ahmad', 'Hafiz'], ['Maya', 'Aisyah', 'Siti', 'Nur']),
  },
  filipino: {
    precolonial: [],
    colonial: sexed(['Juan', 'Jose', 'Andres', 'Emilio'], ['Maria', 'Rosa', 'Luz', 'Isabel']),
    modern: sexed(['Juan', 'Jose', 'Miguel', 'Andres'], ['Maria', 'Rosa', 'Luz', 'Ana']),
  },
  yoruba: {
    traditional: sexed(['Babajide', 'Akin', 'Kehinde', 'Tunde'], ['Adesewa', 'Yetunde', 'Folake', 'Amara']),
    modern: sexed(['Chinedu', 'Kelechi', 'Tunde', 'Akin'], ['Ngozi', 'Zainab', 'Amara', 'Folake']),
  },
  amharic: {
    imperial: sexed(['Dawit', 'Mekonnen', 'Tadesse', 'Haile'], ['Meron', 'Almaz', 'Hana', 'Saron']),
    modern: sexed(['Yonas', 'Dawit', 'Mekonnen', 'Tadesse'], ['Tigist', 'Meron', 'Hana', 'Saron']),
  },
  swahili: {
    precolonial: sexed(['Jabari', 'Baraka', 'Musa', 'Khalil'], ['Asha', 'Neema', 'Zuri', 'Nia']),
    modern: sexed(['Juma', 'Hassan', 'Amani', 'Baraka'], ['Imani', 'Asha', 'Neema', 'Zuri']),
  },
  'zulu-xhosa': {
    precolonial: sexed(['Shaka', 'Dingane', 'Mpande', 'Sizwe'], ['Nandi', 'Mkabayi', 'Thandi', 'Nomsa']),
    modern: sexed(['Thabo', 'Sipho', 'Lwazi', 'Bongani'], ['Ayanda', 'Lerato', 'Thandi', 'Zanele']),
  },
  'north-american': {
    colonial: sexed(['James', 'William', 'John', 'Thomas'], ['Anne', 'Mary', 'Elizabeth', 'Sarah']),
    modern: sexed(['Michael', 'Daniel', 'Ethan', 'James'], ['Emily', 'Olivia', 'Hannah', 'Mia']),
  },
  mesoamerican: {
    precolonial: sexed(['Tenoch', 'Acatl', 'Cuauhtémoc', 'Itzcoatl'], ['Metztli', 'Xunaxi', 'Ixchel', 'Citlali']),
    colonial: sexed(['Juan', 'Diego', 'Pedro', 'Xochitl'], ['María', 'Isabel', 'Itzel', 'Ana']),
    modern: sexed(['Diego', 'Mateo', 'Iktan', 'Yaxkin'], ['Sofía', 'Itzel', 'Citlali', 'Ixchel']),
  },
  andean: {
    precolonial: sexed(['Inti', 'Tupac', 'Amaru', 'Kuntur'], ['Pacha', 'Killa', 'Sumaq', 'Nayra']),
    colonial: sexed(['José', 'Diego', 'Tupac', 'Amaru'], ['María', 'Rosa', 'Killa', 'Nayra']),
    modern: sexed(['Mateo', 'Inti', 'Amaru', 'Diego'], ['Lucía', 'Killa', 'Sumaq', 'Nayra']),
  },
  mongolian: {
    'pre-empire': sexed(['Qabul', 'Ambaghai', 'Qutula', 'Yesugei', 'Tooril', 'Jamuqa', 'Qasar', 'Belgutei'], ['Alan Goa', 'Hoelun', 'Borte', 'Sochigel', 'Temulun', 'Qutui', 'Al Altan', 'Yisui']),
    empire: sexed(['Batu', 'Temur', 'Mongke', 'Qadan', 'Arghun', 'Qaidu', 'Jebe', 'Subedei'], ['Sorghaghtani', 'Doquz', 'Qutulun', 'Chabi', 'Oghul Qaimish', 'Bulughan', 'Borte', 'Yisugen']),
    'northern-yuan': sexed(['Dayan', 'Toghon', 'Esen', 'Manduul', 'Bodi Alagh', 'Tumen Zasagt', 'Buyan Sechen', 'Ligdan'], ['Mandukhai', 'Samur', 'Yunggen', 'Altan', 'Sarnai', 'Qutughai', 'Tsetseg', 'Naran']),
    'oirat-khanates': sexed(['Esen', 'Galdan', 'Tsewang', 'Dawaachi', 'Amursana', 'Baatur', 'Sengge', 'Khara Khula'], ['Anu', 'Yum Agas', 'Sesen', 'Ulaan', 'Saran', 'Tsetseg', 'Oyuun', 'Khulan']),
    qing: sexed(['Tseren', 'Sonom', 'Dondov', 'Nasang', 'Gonchig', 'Jambal', 'Rinchin', 'Bumtsend'], ['Handmaa', 'Dulmaa', 'Norjmaa', 'Tserendulam', 'Suren', 'Oyuunchimeg', 'Narmandakh', 'Tsend']),
    socialist: sexed(['Sukh', 'Baatar', 'Choibalsan', 'Tsedenbal', 'Jamsran', 'Luvsan', 'Gombo', 'Dashdorj'], ['Suren', 'Dulmaa', 'Tungalag', 'Oyun', 'Narantsetseg', 'Bolormaa', 'Enkhtuya', 'Sarantsetseg']),
    modern: sexed(['Batsaikhan', 'Munkh', 'Enkh', 'Tseren', 'Altan', 'Chuluun', 'Temuulen', 'Ankhbayar', 'Bilguun', 'Ganbold', 'Munkhbayar', 'Erdenebat'], ['Saran', 'Erdene', 'Naran', 'Altantsetseg', 'Oyuna', 'Tungalag', 'Bolormaa', 'Anu', 'Khulan', 'Suvd', 'Enkhjin', 'Nomin']),
  },
  tibetan: {
    fragmentation: sexed(['Pel Kortsen', 'Tashi Tsegpa', 'Lume Tsultrim Sherab', 'Yeshe Gyaltsen', 'Rinchen Zangpo', 'Lhalama Yeshe O', 'Atisha', 'Dromton'], ['Yeshe Drolma', 'Pema Sal', 'Lhacham', 'Tseringma', 'Yangchen', 'Dechen', 'Kunsang', 'Lhamo']),
    'sakya-yuan': sexed(['Sakya Pandita', 'Phagpa', 'Drogon Chogyal', 'Rinchen Gyaltsen', 'Jamyang Rinchen', 'Dampa Kunlo', 'Buton Rinchen Drub', 'Kunga Lodro'], ['Machig Labdron', 'Sönam Peldren', 'Kunga Bum', 'Pema Drolma', 'Tsering Lhamo', 'Yangchen Drolma', 'Dechen Wangmo', 'Khandro']),
    phagmodrupa: sexed(['Tai Situ Changchub Gyaltsen', 'Jamyang Shakya Gyaltsen', 'Drakpa Gyaltsen', 'Ngawang Drakpa', 'Tsongkhapa', 'Gendun Drub', 'Khedrup Je', 'Shakya Chokden'], ['Chokyi Dronma', 'Samding Dorje Phagmo', 'Pema Chokyi', 'Tsering Drolma', 'Lhamo Yangchen', 'Kunsang Wangmo', 'Dechen Paldron', 'Sonam Lhamo']),
    'ganden-phodrang': sexed(['Lobsang Gyatso', 'Sangye Gyatso', 'Tsangyang Gyatso', 'Kelzang Gyatso', 'Jamphel Gyatso', 'Thubten Gyatso', 'Tashi Namgyal', 'Jigme Wangpo'], ['Yeshe Tsogyal', 'Dorje Phagmo', 'Tsering Lhamo', 'Pema Dolma', 'Dechen Wangmo', 'Yangchen Drolma', 'Kunsang Choden', 'Lhamo Tsering']),
  },
  manchu: {
    'jin-jurchen': sexed(['Aguda', 'Wuqimai', 'Hela', 'Loushi', 'Zongbi', 'Zonghan', 'Wannu', 'Hushahu'], ['Wulu', 'Dingge', 'Shige', 'Alihu', 'Mile', 'Guige', 'Cuige', 'Yicha']),
    'late-jurchen': sexed(['Bujantai', 'Monggo Temur', 'Wang Gao', 'Giocangga', 'Taksi', 'Nikan Wailan', 'Šurhaci', 'Gintaisi'], ['Donggo', 'Monggo', 'Saran', 'Jerjer', 'Harjol', 'Mukushen', 'Mangguji', 'Bumbutai']),
    'later-jin': sexed(['Nurhaci', 'Hong Taiji', 'Daisan', 'Amin', 'Manggultai', 'Abatai', 'Jirgalang', 'Dorgon'], ['Abahai', 'Jerjer', 'Harjol', 'Bumbutai', 'Mangguji', 'Mukushen', 'Donggo', 'Saran']),
    'early-qing': sexed(['Dorgon', 'Ajige', 'Dodo', 'Fulin', 'Xuanye', 'Yinzhen', 'Hongli', 'Fuheng'], ['Bumbutai', 'Donggo', 'Monggo', 'Jerjer', 'Harjol', 'Sumalagu', 'Mukushen', 'Saran']),
    'late-qing': sexed(['Yongqi', 'Mianning', 'Yizhu', 'Zaichun', 'Zaitian', 'Yikuang', 'Shanqi', 'Puyi'], ['Cixi', 'Cian', 'Longyu', 'Zhenfei', 'Jingfen', 'Wanrong', 'Wenxiu', 'Hengxiang']),
    modern: sexed(['建国', '国强', '志远', '文博', '明远', '德华', '永安', '承志', '海东', '俊峰', '瑞林', '向阳'], ['秀兰', '淑芬', '静宜', '慧敏', '丽华', '春梅', '雅琴', '晓云', '雪梅', '文静', '若兰', '佳宁']),
  },
  'russian-siberian': {
    tsardom: sexed(['Ivan', 'Yermak', 'Stepan', 'Matvei', 'Savva', 'Grigory', 'Afanasy', 'Nikita'], ['Agafya', 'Avdotya', 'Darya', 'Feodosia', 'Marfa', 'Praskovya', 'Ulyana', 'Vasilisa']),
    imperial: sexed(['Aleksei', 'Boris', 'Konstantin', 'Lev', 'Matvei', 'Maksim', 'Pyotr', 'Vasily'], ['Alexandra', 'Elizaveta', 'Ksenia', 'Lidiya', 'Maria', 'Nadezhda', 'Sofiya', 'Valentina']),
    soviet: sexed(['Anatoly', 'Gennady', 'Leonid', 'Oleg', 'Valery', 'Vladimir', 'Yevgeny', 'Yaroslav'], ['Galina', 'Ludmila', 'Nina', 'Raisa', 'Tamara', 'Valentina', 'Zinaida', 'Zoya']),
    modern: sexed(['Artyom', 'Denis', 'Kirill', 'Maksim', 'Roman', 'Timur', 'Vadim', 'Yegor'], ['Alina', 'Anna', 'Kira', 'Milana', 'Polina', 'Sofiya', 'Varvara', 'Yana']),
  },
}

periodGivenNames.bengali = {
  'vanga-gauda': sexed(['Shashanka', 'Gopala', 'Dharmapala', 'Devapala', 'Bhaskara', 'Bhatta', 'Vainyagupta', 'Gopachandra', 'Samacharadeva', 'Jayanaga'], ['Prabhavati', 'Kalyani', 'Durgavati', 'Charumati', 'Maya', 'Sarasvati', 'Bhadra', 'Devi']),
}
periodGivenNames['marathi-gujarati'] = {
  'satavahana-western-deccan': sexed(['Simuka', 'Satakarni', 'Gautamiputra', 'Vasisthiputra', 'Yajna Sri', 'Nahapana', 'Rudradaman', 'Bhumaka', 'Isvaradatta', 'Chashtana'], ['Naganika', 'Gautami Balashri', 'Vasishthi', 'Prabhavati', 'Dhamma', 'Madhavi', 'Charumati', 'Rohini']),
}
periodGivenNames['sa-huynh-champa'] = {
  'sa-huynh': [],
  'early-champa': sexed(['Bhadravarman', 'Gangaraja', 'Prakashadharma', 'Rudravarman', 'Satyakausikasvamin', 'Isanavarman', 'Sambhuvarman', 'Kandarpadharma', 'Vikrantavarman', 'Jaya Indravarman', 'Jagaddharma'], []),
}
periodGivenNames['funan-chenla'] = {
  funan: sexed(['Kaundinya', 'Fan Pan', 'Fan Chang', 'Fan Zhan', 'Fan Shiman', 'Fan Xun', 'Jayavarman', 'Rudravarman'], ['Liuye', 'Soma', 'Kulaprabhavati']),
  chenla: sexed(['Bhavavarman', 'Mahendravarman', 'Isanavarman', 'Jayavarman', 'Pushkaraksha', 'Nrpatindravarman'], ['Jayadevi']),
}
periodGivenNames['pyu-city-states'] = {
  pyu: sexed(['Suryavikrama', 'Harivikrama', 'Sihavikrama'], []),
}
periodGivenNames['dvaravati-mon'] = {
  dvaravati: [],
}
periodGivenNames['old-malay-srivijaya'] = {
  kedah: [],
  srivijaya: sexed(['Dapunta Hyang Sri Jayanasa', 'Dharmasetu', 'Balaputradeva', 'Sangramadhananjaya', 'Sri Cudamaniwarmadewa', 'Mara Vijayottungavarman'], []),
}
periodGivenNames['old-javanese-medang'] = {
  kalingga: sexed(['Sanjaya', 'Dapunta Selendra', 'Panangkaran', 'Wisnu', 'Indra'], ['Shima']),
  medang: sexed(['Rakai Panangkaran', 'Dharanindra', 'Samaragrawira', 'Rakai Pikatan', 'Rakai Kayuwangi', 'Balitung', 'Daksha', 'Tulodhong', 'Wawa', 'Mpu Sindok', 'Dharmawangsa', 'Airlangga'], ['Pramodhawardhani', 'Sri Kahulunnan', 'Gunapriya Dharmapatni', 'Isyana Tunggawijaya']),
}
periodGivenNames['old-bali'] = {
  pejeng: [],
  warmadewa: sexed(['Sri Kesari Warmadewa', 'Ugrasena', 'Tabanendra', 'Jayasingha Warmadewa', 'Janasadhu', 'Udayana Warmadewa', 'Marakata', 'Anak Wungsu'], ['Gunapriya Dharmapatni', 'Sang Ratu Luhur']),
}
Object.assign(periodGivenNames, ancientPeriodGivenNames)

// Extra complete personal names for cultures whose earlier period packs were
// too small to provide variety. These are historical or commonly attested
// names, not generated character fragments.
const expandedPeriodGivenNames: Partial<Record<OfflineCulture, Record<string, PersonDatum[]>>> = {
  english: {
    medieval: sexed(['Adam', 'Alan', 'Baldwin', 'Godfrey', 'Laurence'], ['Amice', 'Constance', 'Emmeline', 'Juliana', 'Sybil']),
    'early-modern': sexed(['Christopher', 'Daniel', 'Jonathan', 'Matthew', 'Nathaniel'], ['Deborah', 'Esther', 'Katherine', 'Prudence', 'Sarah']),
    modern: sexed(['George', 'Henry', 'Jacob', 'Joshua', 'Matthew'], ['Daisy', 'Hannah', 'Jessica', 'Phoebe', 'Ruby']),
  },
  'ancient-greek': {
    archaic: sexed(
      ['Homeros', 'Hesiodos', 'Archilochos', 'Tyrtaios', 'Alkman', 'Solon', 'Pittakos', 'Bias', 'Kleoboulos', 'Periandros', 'Thales', 'Anaximandros', 'Anaximenes', 'Peisistratos', 'Theognis', 'Xenophanes', 'Phokylides', 'Mimnermos', 'Stesichoros', 'Ibykos', 'Pythagoras', 'Pherekydes', 'Epimenides', 'Megakles', 'Miltiades'],
      ['Sappho', 'Kleobouline', 'Gorgo', 'Agariste', 'Phrasikleia', 'Timarete', 'Arignote', 'Theano', 'Kleis', 'Rhodopis', 'Ladike', 'Megakleia', 'Nikarete', 'Lampito', 'Gorgophone', 'Ampharete', 'Mnesarete', 'Aristomache', 'Philinna', 'Archidamia', 'Myrtis', 'Kleoboule', 'Eumetis', 'Anaxandra', 'Aristodike'],
    ),
    classical: sexed(
      ['Perikles', 'Sokrates', 'Platon', 'Xenophon', 'Alkibiades', 'Nikias', 'Kleon', 'Brasidas', 'Epameinondas', 'Pelopidas', 'Demosthenes', 'Aischines', 'Aristophanes', 'Sophokles', 'Euripides', 'Thukydides', 'Lysias', 'Isokrates', 'Praxiteles', 'Hippokrates', 'Antisthenes', 'Diogenes', 'Aristippos', 'Speusippos', 'Xenokrates'],
      ['Aspasia', 'Xanthippe', 'Myrrhine', 'Lysimache', 'Timarete', 'Aristarete', 'Phryne', 'Lais', 'Theodote', 'Nikerate', 'Mania', 'Olympias', 'Eurydike', 'Ada', 'Artemisia', 'Gorgo', 'Archidamia', 'Agariste', 'Melitta', 'Klearete', 'Hipparchia', 'Arete', 'Lastheneia', 'Axiothea', 'Nikoboule'],
    ),
    hellenistic: sexed(
      ['Antigonos', 'Apollonios', 'Aristarchos', 'Basileios', 'Chariton', 'Eratosthenes', 'Euclid', 'Herakleides', 'Kleon', 'Menandros', 'Philon', 'Polybius', 'Theokritos', 'Timotheos', 'Zenon', 'Ptolemaios', 'Seleukos', 'Lysimachos', 'Demetrios', 'Eumenes', 'Kallimachos', 'Theophrastos', 'Chrysippos', 'Aratos', 'Archimedes'],
      ['Agathokleia', 'Berenike', 'Chrysis', 'Damaris', 'Eudokia', 'Euphemia', 'Kallista', 'Kleopatra', 'Myrtale', 'Niko', 'Olympias', 'Philista', 'Rhodope', 'Theano', 'Xanthe', 'Arsinoe', 'Stratonike', 'Apama', 'Laodike', 'Nikaia', 'Anyte', 'Nossis', 'Moero', 'Leontion', 'Hipparchia'],
    ),
  },
  'ancient-rome': {
    republic: sexed(['Marcus', 'Gaius', 'Lucius', 'Publius', 'Quintus', 'Titus', 'Aulus', 'Decimus', 'Sextus', 'Tiberius', 'Servius', 'Gnaeus', 'Appius', 'Manius', 'Numerius', 'Spurius'], ['Aemilia', 'Antonia', 'Claudia', 'Cornelia', 'Fabia', 'Fulvia', 'Hortensia', 'Julia', 'Licinia', 'Lucretia', 'Marcia', 'Minucia', 'Porcia', 'Publilia', 'Sempronia', 'Servilia', 'Tullia', 'Valeria', 'Verginia', 'Veturia']),
    empire: sexed(['Marcus', 'Gaius', 'Lucius', 'Publius', 'Quintus', 'Titus', 'Aulus', 'Decimus', 'Sextus', 'Tiberius', 'Servius', 'Gnaeus', 'Appius', 'Manius', 'Numerius', 'Spurius'], ['Aelia', 'Aemilia', 'Agrippina', 'Antonia', 'Aurelia', 'Caesonia', 'Calpurnia', 'Claudia', 'Domitia', 'Drusilla', 'Faustina', 'Flavia', 'Galeria', 'Iulia', 'Lucilla', 'Marcella', 'Messalina', 'Plotina', 'Sabina', 'Ulpia']),
  },
  celtic: {
    ogham: ['ADDILONA', 'ALATTOS', 'BIVAIDONAS', 'CATTINI', 'CATTUVIR', 'CORBBI', 'CUNAGUSOS', 'CUNOVATOS', 'DOVETI', 'DOVINIAS', 'DUCOVAROS', 'IVACATTOS', 'LABRID', 'LUGA', 'LUGUDECAS', 'LUGUQRIT', 'MEDALO', 'NETA-CARI', 'QENILOCI', 'RITTAVVECCAS', 'RONANN', 'SEDANI', 'SUVALLOS', 'VORTIGURN', 'VOTI'].map((name) => person(name, 'any', undefined, '爱尔兰欧甘铭文数据库收录的实证姓名形式；常保留铭文中的屈折词尾')),
    'early-medieval': sexed(['Áed', 'Colmán', 'Domnall', 'Fergal', 'Flann', 'Máel Sechnaill', 'Muirchertach', 'Niall', 'Conall', 'Diarmait', 'Cellach', 'Cormac', 'Donnchad', 'Loingsech', 'Congal', 'Blathmac', 'Sechnassach', 'Cathal', 'Fedlimid', 'Tigernach', 'Máel Dúin', 'Suibne', 'Ailill', 'Cenn Fáelad', 'Lorcán'], ['Gormlaith', 'Mór', 'Derbforgaill', 'Sadb', 'Bébinn', 'Cacht', 'Dubchoblaig', 'Aife', 'Eithne', 'Fínne', 'Muirenn', 'Órlaith', 'Gráinne', 'Liadain', 'Creidne', 'Dúnlaith', 'Flann', 'Máel Muire', 'Uallach', 'Cairech', 'Íte', 'Samthann', 'Moninne', 'Cera', 'Gobnait']),
    medieval: sexed(['Toirdelbach', 'Ruaidrí', 'Muirchertach', 'Domnall', 'Aodh', 'Brian', 'Conchobhar', 'Diarmaid', 'Donnchadh', 'Eoghan', 'Fearghal', 'Tadhg', 'Cormac', 'Niall', 'Art', 'Cathal', 'Maelseachlainn', 'Ragnall', 'Tomás', 'Seán', 'Murchadh', 'Flaithbertach', 'Giolla Íosa', 'Lochlann', 'Aonghus'], ['Gormflaith', 'Derbforgaill', 'Mór', 'Sadhbh', 'Aoife', 'Eithne', 'Gráinne', 'Nuala', 'Finola', 'Mairghréad', 'Caitríona', 'Úna', 'Siobhán', 'Áine', 'Orla', 'Deirdre', 'Brigid', 'Máire', 'Raghnailt', 'Eilís', 'Fionnghuala', 'Dearbhfhorghaill', 'Sláine', 'Caitlín', 'Ailbhe']),
    modern: sexed(['Aidan', 'Cian', 'Cillian', 'Conor', 'Darragh', 'Declan', 'Eamon', 'Fionn', 'Liam', 'Niall', 'Oisín', 'Ronan', 'Seán', 'Tadhg', 'Ciarán', 'Dónal', 'Pádraig', 'Cathal', 'Colm', 'Diarmuid', 'Cormac', 'Eoin', 'Fiachra', 'Lorcan', 'Ruairi'], ['Aoife', 'Caoimhe', 'Ciara', 'Clodagh', 'Deirdre', 'Eimear', 'Gráinne', 'Maeve', 'Niamh', 'Orla', 'Róisín', 'Saoirse', 'Siobhán', 'Áine', 'Bríd', 'Caitríona', 'Fiona', 'Mairéad', 'Sinéad', 'Úna', 'Aisling', 'Bláthnaid', 'Emer', 'Laoise', 'Muireann']),
  },
  'slavic-east': {
    medieval: sexed(['Volodymyr', 'Yaroslav', 'Sviatopolk', 'Vsevolod', 'Ihor', 'Oleh', 'Rostyslav', 'Mstyslav', 'Iziaslav', 'Sviatoslav', 'Roman', 'Danylo', 'Lev', 'Vasylko', 'Yurii', 'Andrii', 'Mykhailo', 'Fedir', 'Hlib', 'Borys', 'Davyd', 'Volodar', 'Oleksa', 'Bohuslav', 'Yaropolk', 'Viacheslav', 'Volodymyrko', 'Rostislav', 'Vsevolodko', 'Boryslav', 'Yurko', 'Luka', 'Klym', 'Mstyslavko'], ['Olha', 'Anna', 'Anastasiia', 'Yevpraksiia', 'Maria', 'Predslava', 'Dobroniha', 'Verkhuslava', 'Iryna', 'Eufrosynia', 'Yelyzaveta', 'Mariia', 'Vyslava', 'Mstyslava', 'Yaroslava', 'Sviatoslava', 'Bohuslava', 'Dobroslava', 'Liubava', 'Miloslava', 'Yevfrosyniia', 'Dobrodiia', 'Vyshemira', 'Khrystyna', 'Hanna', 'Evdokiia', 'Feodosiia', 'Iuliia', 'Marina', 'Malenka']),
    imperial: sexed(['Bohdan', 'Ivan', 'Petro', 'Mykhailo', 'Hryhorii', 'Pavlo', 'Taras', 'Oleksa', 'Semen', 'Andrii', 'Danylo', 'Kyrylo', 'Vasyl', 'Yurii', 'Ostap', 'Marko', 'Levko', 'Nazar', 'Stepan', 'Yakiv', 'Oleksii', 'Yevhen', 'Demian', 'Lukian', 'Martyn'], ['Kateryna', 'Oksana', 'Olena', 'Hanna', 'Mariia', 'Solomiia', 'Nataliia', 'Iryna', 'Yelyzaveta', 'Ulyana', 'Varvara', 'Paraska', 'Motria', 'Khrystyna', 'Liubov', 'Vira', 'Nadiia', 'Sofiia', 'Tetiana', 'Yevheniia', 'Halyna', 'Larysa', 'Melaniia', 'Roksolana', 'Yaryna']),
    modern: sexed(['Andrii', 'Bohdan', 'Danylo', 'Denys', 'Dmytro', 'Ivan', 'Kyrylo', 'Maksym', 'Marko', 'Mykhailo', 'Nazar', 'Oleksandr', 'Oleh', 'Pavlo', 'Roman', 'Taras', 'Vadym', 'Vasyl', 'Viktor', 'Yurii', 'Artem', 'Illia', 'Matvii', 'Tymofii', 'Yaroslav'], ['Alina', 'Anastasiia', 'Daryna', 'Iryna', 'Kateryna', 'Khrystyna', 'Mariya', 'Nadiia', 'Nataliia', 'Oksana', 'Olena', 'Sofiia', 'Solomiia', 'Tetiana', 'Viktoriia', 'Yana', 'Yelyzaveta', 'Yuliia', 'Zlata', 'Zoryana', 'Anna', 'Veronika', 'Polina', 'Svitlana', 'Yaroslava']),
  },
  'dutch-lowlands': {
    medieval: sexed(['Willem', 'Floris', 'Dirk', 'Jan', 'Hendrik', 'Gijsbrecht', 'Arnoud', 'Diederik', 'Lambert', 'Reinoud', 'Gerard', 'Jacob', 'Claes', 'Pieter', 'Gerrit', 'Hugo', 'Robrecht', 'Boudewijn', 'Everard', 'Wouter', 'Aelbrecht', 'Godfried', 'Lodewijk', 'Rutger', 'Zeger'], ['Aleid', 'Beatrijs', 'Geertruid', 'Margaretha', 'Mechteld', 'Adelheid', 'Hadewijch', 'Lijsbeth', 'Machteld', 'Sophie', 'Agnes', 'Cunegonda', 'Ermengard', 'Heilwig', 'Ida', 'Jutta', 'Oda', 'Petronella', 'Richildis', 'Yolande', 'Berta', 'Ermgard', 'Kateline', 'Lutgardis', 'Mabelia']),
    'early-modern': sexed(['Willem', 'Johan', 'Maurits', 'Frederik', 'Hugo', 'Pieter', 'Rembrandt', 'Michiel', 'Maarten', 'Christiaan', 'Antonie', 'Jan', 'Cornelis', 'Hendrick', 'Jacob', 'Nicolaes', 'Adriaen', 'Joost', 'Gerrit', 'Dirck', 'Bartholomeus', 'Constantijn', 'Frans', 'Isaac', 'Roelant'], ['Anna', 'Maria', 'Catharina', 'Geertruyd', 'Aletta', 'Cornelia', 'Elisabeth', 'Margaretha', 'Johanna', 'Susanna', 'Petronella', 'Sara', 'Judith', 'Agatha', 'Helena', 'Sophia', 'Hendrina', 'Jacoba', 'Machteld', 'Wilhelmina', 'Aeltje', 'Grietje', 'Neeltje', 'Trijntje', 'Willemijn']),
    modern: sexed(['Daan', 'Sem', 'Lucas', 'Finn', 'Levi', 'Luuk', 'Bram', 'Mees', 'Jesse', 'Thijs', 'Thomas', 'Milan', 'Max', 'Sven', 'Lars', 'Noud', 'Gijs', 'Stijn', 'Joris', 'Wout', 'Mats', 'Teun', 'Jasper', 'Sander', 'Ruben'], ['Emma', 'Julia', 'Mila', 'Sophie', 'Tess', 'Sara', 'Anna', 'Eva', 'Lotte', 'Nora', 'Liv', 'Fleur', 'Noor', 'Sanne', 'Femke', 'Roos', 'Maud', 'Iris', 'Yara', 'Evi', 'Lieke', 'Merel', 'Saskia', 'Anouk', 'Ilse']),
  },
  'roman-low-countries': {
    roman: ['Gaius Julius Civilis', 'Claudius Labeo', 'Julius Briganticus', 'Julius Paulus', 'Brinno', 'Chariovalda', 'Mallius', 'Verritus', 'Malorix', 'Cruptorix'].map((name) => person(name, 'any', undefined, '罗马时期莱茵河下游文献所见姓名；保留本地单名或罗马化全名')),
  },
  'early-slavic': {
    'migration-era': ['Daurentius', 'Musokios', 'Ardagast', 'Peiragastus', 'Mezamer', 'Idariz', 'Kelagast', 'Akamir', 'Sclagamar', 'Chatzon', 'Perboundos', 'Dabragezas'].map((name) => person(name, 'any', undefined, '6—8世纪希腊语或拉丁语史料记录的姓名形式；不回译成未经证实的原始斯拉夫语形式')),
  },
  tibetan: {
    empire: sexed(['Songtsen Gampo', 'Mangsong Mangtsen', 'Tridu Songtsen', 'Tride Tsuktsen', 'Trisong Detsen', 'Mune Tsenpo', 'Ralpacan', 'Langdarma', 'Gar Tongtsen', 'Nyang Tingngezin', 'Yuthok Yonten Gonpo', 'Ba Selnang', 'Tashi Dorje', 'Sonam Gyaltsen', 'Rinchen Wangpo'], ['Yeshe Tsogyal', 'Mungchang', 'Droza Tritsun', 'Ngangtsul Changchub', 'Lhamo', 'Metok', 'Pema', 'Yangchen', 'Dechen', 'Tsering', 'Kunsang', 'Drolma', 'Pema Yangchen', 'Tsering Lhamo', 'Dechen Wangmo']),
    fragmentation: sexed(['Pel Kortsen', 'Tashi Tsegpa', 'Lume Tsultrim Sherab', 'Yeshe Gyaltsen', 'Rinchen Zangpo', 'Lhalama Yeshe O', 'Atisha', 'Dromton', 'Tashi Dorje', 'Sonam Rinchen', 'Kunga Sherab', 'Tsultrim Gyaltsen', 'Jamyang Lodro', 'Ngawang Dorje', 'Kunchok Wangpo'], ['Yeshe Drolma', 'Pema Sal', 'Lhacham', 'Tseringma', 'Yangchen', 'Dechen', 'Kunsang', 'Lhamo', 'Pema Drolma', 'Tsering Lhamo', 'Yangchen Drolma', 'Dechen Wangmo', 'Kunsang Choden', 'Lhamo Tsering', 'Chokyi Dronma']),
    'sakya-yuan': sexed(['Sakya Pandita', 'Phagpa', 'Drogon Chogyal', 'Rinchen Gyaltsen', 'Jamyang Rinchen', 'Dampa Kunlo', 'Buton Rinchen Drub', 'Kunga Lodro', 'Sonam Gyaltsen', 'Tashi Dorje', 'Tsultrim Sherab', 'Ngawang Lodro', 'Jamyang Gyaltsen', 'Kunchok Rinchen', 'Chokyi Wangpo'], ['Machig Labdron', 'Sönam Peldren', 'Kunga Bum', 'Pema Drolma', 'Tsering Lhamo', 'Yangchen Drolma', 'Dechen Wangmo', 'Khandro', 'Pema Yangchen', 'Kunsang Choden', 'Lhamo Tsering', 'Chokyi Dronma', 'Tashi Lhamo', 'Dechen Drolma', 'Sonam Wangmo']),
    phagmodrupa: sexed(['Tai Situ Changchub Gyaltsen', 'Jamyang Shakya Gyaltsen', 'Drakpa Gyaltsen', 'Ngawang Drakpa', 'Tsongkhapa', 'Gendun Drub', 'Khedrup Je', 'Shakya Chokden', 'Sonam Gyaltsen', 'Tashi Namgyal', 'Jamyang Lodro', 'Tsultrim Dorje', 'Kunga Rinchen', 'Chokyi Wangpo', 'Kunchok Sherab'], ['Chokyi Dronma', 'Samding Dorje Phagmo', 'Pema Chokyi', 'Tsering Drolma', 'Lhamo Yangchen', 'Kunsang Wangmo', 'Dechen Paldron', 'Sonam Lhamo', 'Pema Yangchen', 'Tashi Lhamo', 'Dechen Wangmo', 'Kunsang Choden', 'Yangchen Drolma', 'Lhamo Tsering', 'Pema Drolma']),
    'ganden-phodrang': sexed(['Lobsang Gyatso', 'Sangye Gyatso', 'Tsangyang Gyatso', 'Kelzang Gyatso', 'Jamphel Gyatso', 'Thubten Gyatso', 'Tashi Namgyal', 'Jigme Wangpo', 'Ngawang Lobsang', 'Sonam Dorje', 'Karma Tenzin', 'Tsultrim Gyaltsen', 'Jamyang Sherab', 'Kunchok Rinchen', 'Tashi Wangchuk'], ['Yeshe Tsogyal', 'Dorje Phagmo', 'Tsering Lhamo', 'Pema Dolma', 'Dechen Wangmo', 'Yangchen Drolma', 'Kunsang Choden', 'Lhamo Tsering', 'Pema Yangchen', 'Sonam Dolma', 'Tashi Lhamo', 'Chokyi Dronma', 'Dechen Drolma', 'Karma Lhamo', 'Pema Kunsang']),
    modern: sexed(['Tenzin', 'Sonam', 'Pema', 'Jigme', 'Kelsang', 'Dawa', 'Lobsang', 'Ngawang', 'Tashi', 'Dorje', 'Norbu', 'Thupten', 'Jamphel', 'Thinley', 'Namgyal', 'Karma', 'Phurba', 'Tashi Wangchuk', 'Lhakpa', 'Tsering Dorje', 'Sangpo', 'Kunchok', 'Rinchen', 'Tsultrim', 'Yonten', 'Karma Tenzin', 'Norbu Tashi', 'Jigme Lobsang'], ['Dolma', 'Yangchen', 'Dechen', 'Tsering', 'Kunsang', 'Lhamo', 'Metok', 'Drolma', 'Peldron', 'Sangay', 'Choden', 'Khandro', 'Pema Dolma', 'Tsering Lhamo', 'Yangzom', 'Deki', 'Lhakyi', 'Karma Lhamo', 'Sonam Dolma', 'Chime', 'Tashi Lhamo', 'Kelsang', 'Namkha', 'Pema Yangchen', 'Dechen Wangmo', 'Dolma Yangchen', 'Lhamo Tsering', 'Pema Kunsang']),
  },
  burmese: {
    pagan: sexed(['Kyansittha', 'Sawlu', 'Sithu', 'Narathu', 'Naratheinkha', 'Narapatisithu', 'Htilominlo', 'Uzana', 'Min Shin Saw', 'Thihathu', 'Athinkhaya', 'Yazathingyan'], ['Pwa Saw', 'Saw Mon Hla', 'Shwe Einthi', 'Hlaing Hteik Khaung', 'Shin Htwe', 'Mwei Daw', 'Yadanabon', 'Thiri', 'Maha Dewi', 'Saw Gyi', 'Khin Hla', 'Mya Hnin']),
    konbaung: sexed(['Bodawpaya', 'Bagyidaw', 'Tharrawaddy', 'Pagan Min', 'Mindon', 'Thibaw', 'Maha Bandula', 'Maha Thiha Thura', 'Ne Myo Sithu', 'Min Ye Kyawswa', 'Thado Minbya', 'Singu'], ['Me Nu', 'Supayagyi', 'Sinbyumashin', 'Hsinbyumashin', 'Aungban', 'Shin Sawbu', 'Nanmadaw Me Nu', 'Yadanarbon', 'Khin Phyu', 'Mya Lay', 'Khin Ma Gyi', 'Pwa Saw']),
    modern: sexed(['Aung San', 'U Nu', 'Ne Win', 'Than Shwe', 'Thein Sein', 'Min Aung Hlaing', 'Kyaw Min', 'Htet Aung', 'Myo Thant', 'Zaw Min', 'Aung Kyaw', 'Ye Htut', 'Aung Naing', 'Kyaw Zin', 'Min Zaw', 'Hla Tun', 'Win Htut', 'Ko Ko', 'Myo Min', 'Zaw Lin', 'Thura Aung', 'Nay Lin', 'Soe Min', 'Htun Htun', 'Ye Min'], ['Khin Kyi', 'Aung San Suu Kyi', 'Daw Mya Sein', 'May Zin', 'Ei Ei', 'Thandar', 'Hnin Wai', 'Su Su', 'Moe Moe', 'Nandar', 'Yamin', 'Thiri', 'Khin Mar', 'Mya Thida', 'Aye Aye', 'Nwe Nwe', 'Su Hlaing', 'May Thazin', 'Ei Mon', 'Hnin Pwint', 'Wai Wai', 'Nandar Hla', 'Moe Sandar', 'Thiri Zaw', 'Khin Wint']),
  },
  'javanese-sundanese': {
    majapahit: sexed(['Hayam Wuruk', 'Gajah Mada', 'Raden Wijaya', 'Jayanegara', 'Kertarajasa', 'Bhre Kertabhumi', 'Adityawarman', 'Ranggalawe', 'Mpu Tantular', 'Mpu Prapanca', 'Arya Damar', 'Kebo Anabrang'], ['Tribhuwana', 'Gayatri Rajapatni', 'Dyah Gitarja', 'Suprabhawa', 'Kencana Wungu', 'Dyah Pitaloka', 'Rara Jonggrang', 'Ken Dedes', 'Pramodawardhani', 'Suhita', 'Isyana', 'Ratu Kalinyamat']),
    sultanate: sexed(['Sultan Agung', 'Sunan Kalijaga', 'Sultan Hamengkubuwono', 'Panembahan Senopati', 'Sultan Trenggana', 'Sultan Ageng', 'Diponegoro', 'Pakubuwono', 'Amangkurat', 'Sunan Giri', 'Sunan Bonang', 'Sunan Gunung Jati'], ['Ratu Kalinyamat', 'Ratu Kidul', 'Nyi Ageng Serang', 'Raden Ayu Kartini', 'Dewi Sartika', 'Ratu Pembayun', 'Ratu Mas', 'Nyai Ahmad Dahlan', 'Raden Ajeng', 'Nyi Roro Kidul', 'Ratu Adil', 'Siti Walidah']),
    modern: sexed(['Bambang', 'Dedi', 'Eko', 'Fajar', 'Hendra', 'Joko', 'Rizal', 'Slamet', 'Wahyu', 'Yanto', 'Agus', 'Budi', 'Bayu', 'Cahyo', 'Dimas', 'Galih', 'Hadi', 'Imam', 'Lukman', 'Rendra', 'Suryo', 'Teguh', 'Wibowo', 'Yusuf', 'Arif'], ['Ayu', 'Citra', 'Dewi', 'Fitri', 'Indah', 'Lestari', 'Maya', 'Ningsih', 'Putri', 'Rani', 'Sari', 'Wulan', 'Anisa', 'Dian', 'Erna', 'Kartini', 'Melati', 'Nia', 'Ratna', 'Sri', 'Tika', 'Utami', 'Wati', 'Yuli', 'Zahra']),
  },
  balinese: {
    majapahit: sexed(['Gajah Mada', 'Hayam Wuruk', 'Dalem Ketut', 'Dalem Waturenggong', 'Arya Kenceng', 'Arya Damar', 'Kebo Iwa', 'Ki Gusti', 'I Gusti', 'Anak Agung', 'Ida Bagus', 'Cokorda'], ['Tribhuwana', 'Gayatri', 'Diah', 'Ratu Ayu', 'Ni Gusti', 'Anak Agung Istri', 'Ida Istri', 'Cokorda Istri', 'Desak', 'Ni Luh', 'Ni Made', 'Ni Nyoman']),
    kingdom: sexed(['Wayan', 'Made', 'Nyoman', 'Ketut', 'Gede', 'Putu', 'Gusti Ngurah', 'Ida Bagus', 'Anak Agung', 'Cokorda', 'I Gusti', 'Tjokorda'], ['Ayu', 'Kadek', 'Komang', 'Luh', 'Putu', 'Ni Wayan', 'Ni Made', 'Ni Nyoman', 'Ni Ketut', 'Desak', 'Ida Ayu', 'Anak Agung Istri']),
    modern: sexed(['Wayan', 'Made', 'Nyoman', 'Ketut', 'Gede', 'Putu', 'Agung', 'Bagus', 'Dewa', 'Komang', 'Suta', 'Surya', 'Adi', 'Bayu', 'Darma', 'Gusti', 'Jaya', 'Krisna', 'Mahendra', 'Pande', 'Raka', 'Sanjaya', 'Yoga', 'Wisnu', 'Yudistira', 'I Made Surya', 'I Gusti Ngurah', 'I Wayan Putra'], ['Ayu', 'Kadek', 'Komang', 'Luh', 'Putu', 'Citra', 'Dewi', 'Indah', 'Sari', 'Ratih', 'Anjani', 'Maya', 'Astri', 'Bintang', 'Desi', 'Gita', 'Intan', 'Kirana', 'Laksmi', 'Mei', 'Nadya', 'Rina', 'Sinta', 'Tari', 'Widya', 'Ni Made Ayu', 'Ni Wayan Sari', 'Ida Ayu']),
  },
  icelandic: {
    medieval: sexed(['Ari', 'Kjartan', 'Grettir', 'Hrafn', 'Kolbeinn', 'Þorvaldur', 'Snorri', 'Bjarni', 'Skarphéðinn', 'Gísli', 'Þorgeir', 'Hallfreður', 'Ketill'], ['Auður', 'Guðrún', 'Þuríður', 'Unnur', 'Ingibjörg', 'Sigrún', 'Hrefna', 'Jórunn', 'Ásdís', 'Hallbera', 'Ragnheiður', 'Steinunn', 'Þórdís']),
    modern: sexed(['Baldur', 'Hákon', 'Kristján', 'Ari', 'Bjarni', 'Eiríkur', 'Hrafn', 'Kjartan', 'Guðmundur', 'Sigurður', 'Þórður', 'Andri', 'Kári'], ['Árndís', 'Bryndís', 'Elísabet', 'Hekla', 'Ragnheiður', 'Svala', 'Unnur', 'Vala', 'Embla', 'Katla', 'Lilja', 'Sóley', 'Þórdís']),
  },
  norse: {
    viking: sexed(['Gudrod', 'Egil', 'Havard', 'Ulf', 'Einar', 'Arne', 'Ketil', 'Rolf', 'Trygve', 'Erling'], ['Thora', 'Svanhild', 'Helga', 'Vigdis', 'Aud', 'Brynhild', 'Geirhild', 'Runa', 'Aslaug', 'Ragnfrid']),
    medieval: sexed(['Guttorm', 'Erling', 'Skule', 'Bard', 'Jon', 'Pal', 'Audun', 'Hallvard', 'Torfinn', 'Erlend'], ['Solveig', 'Sigrid', 'Gudrun', 'Tora', 'Ragnfrid', 'Bergljot', 'Cecilia', 'Katarina', 'Asa', 'Sunniva']),
    modern: sexed(['Magnus', 'Hakon', 'Lars', 'Anders', 'Johan', 'Sondre', 'Marius', 'Eirik', 'Kristian', 'Oyvind'], ['Thea', 'Linnea', 'Tuva', 'Sigrid', 'Kari', 'Marit', 'Solveig', 'Silje', 'Hanne', 'Liv']),
  },
  french: {
    medieval: sexed(['Renaud', 'Thibaut', 'Godefroy', 'Amaury', 'Raoul', 'Eudes', 'Bertrand', 'Gautier'], ['Adele', 'Blanche', 'Alienor', 'Aveline', 'Melisende', 'Heloise', 'Ermengarde', 'Sibylle']),
    'ancien-regime': sexed(['Armand', 'Blaise', 'Claude', 'Denis', 'Gaspard', 'Marcel', 'Nicolas', 'Rene'], ['Louise', 'Charlotte', 'Genevieve', 'Henriette', 'Pauline', 'Victoire', 'Therese', 'Suzanne']),
    modern: sexed(['Baptiste', 'Nathan', 'Theo', 'Raphael', 'Maxime', 'Louis', 'Eliott', 'Arthur', 'Antoine', 'Clément', 'Mathis', 'Quentin', 'Romain'], ['Chloe', 'Manon', 'Leonie', 'Juliette', 'Camille', 'Margot', 'Ines', 'Clara', 'Anaïs', 'Élodie', 'Maëlle', 'Océane', 'Solène']),
  },
  german: {
    medieval: sexed(['Albrecht', 'Berthold', 'Eberhard', 'Gottfried', 'Hartmann', 'Rudolf', 'Siegfried', 'Ulrich'], ['Bertrada', 'Brunhild', 'Elsbeth', 'Irmingard', 'Kunigunde', 'Richenza', 'Walburga', 'Adelheid']),
    'early-modern': sexed(['August', 'Christoph', 'Johann', 'Matthias', 'Nikolaus', 'Sebastian', 'Theodor', 'Wolfgang'], ['Barbara', 'Dorothea', 'Eva', 'Friederike', 'Katharina', 'Luise', 'Magdalena', 'Theresia']),
    modern: sexed(['Emil', 'Jonas', 'Lukas', 'Moritz', 'Anton', 'Oskar', 'Felix', 'Elias', 'Ben', 'David', 'Julian', 'Leonard', 'Till'], ['Lena', 'Leonie', 'Marlene', 'Nele', 'Paula', 'Laura', 'Greta', 'Ida', 'Amelie', 'Johanna', 'Klara', 'Luisa', 'Theresa']),
  },
  italian: {
    medieval: sexed(['Ruggero', 'Guglielmo', 'Tommaso', 'Benedetto', 'Corrado', 'Federico', 'Filippo', 'Guido'], ['Agnese', 'Allegra', 'Bianca', 'Chiara', 'Fiorella', 'Imelda', 'Laudomia', 'Violante']),
    renaissance: sexed(['Cesare', 'Cosimo', 'Ludovico', 'Giorgio', 'Piero', 'Michele', 'Ottaviano', 'Vincenzo'], ['Artemisia', 'Eleonora', 'Fiammetta', 'Laura', 'Lavinia', 'Margherita', 'Vittoria', 'Veronica']),
    modern: sexed(['Lorenzo', 'Tommaso', 'Edoardo', 'Gabriele', 'Riccardo', 'Davide', 'Giacomo', 'Simone', 'Andrea', 'Federico', 'Nicola', 'Matteo', 'Stefano'], ['Alice', 'Aurora', 'Elisa', 'Martina', 'Nicole', 'Sara', 'Stella', 'Valentina', 'Alessia', 'Elena', 'Francesca', 'Ilaria', 'Serena']),
  },
  iberian: {
    medieval: sexed(['Alvar', 'Enrique', 'Garcia', 'Guillem', 'Jaime', 'Nuño', 'Pelayo', 'Ramiro', 'Sancho', 'Gonzalo', 'Rodrigo', 'Fernando', 'Alfonso', 'Beltrán', 'Fadrique', 'Lope', 'Ruy', 'Tello'], ['Aldonza', 'Beatriz', 'Constanza', 'Ines', 'Jimena', 'Mayor', 'Petronila', 'Sancha', 'Teresa', 'Maria', 'Violante', 'Urraca', 'Berenguela', 'Elvira', 'Mencía', 'Toda', 'Blanca', 'Catalina']),
    'early-modern': sexed(['Diego', 'Francisco', 'Jorge', 'Manuel', 'Pedro', 'Ramon', 'Sebastian', 'Vicente', 'Alonso', 'Cristóbal', 'Hernando', 'Carlos', 'Felipe', 'Gaspar', 'Baltasar', 'Jerónimo', 'Lorenzo', 'Álvaro'], ['Ana', 'Catalina', 'Clara', 'Dolores', 'Luisa', 'Mercedes', 'Rosalia', 'Teresa', 'Beatriz', 'Leonor', 'Isabel', 'María', 'Juana', 'Mencía', 'Francisca', 'Magdalena', 'Ángela', 'Antonia']),
    modern: sexed(['Alejandro', 'Alvaro', 'Bruno', 'Gonzalo', 'Iker', 'Pablo', 'Sergio', 'Adrian', 'Tomás', 'Hugo', 'Mateo', 'Martín', 'Lucas', 'Daniel', 'Álvaro', 'Javier', 'Marcos', 'Nicolás'], ['Alba', 'Aitana', 'Claudia', 'Elena', 'Irene', 'Nerea', 'Valeria', 'Violeta', 'Leonor', 'Mariana', 'Beatriz', 'Matilde', 'Lucía', 'Sofía', 'Martina', 'Julia', 'Paula', 'Carmen']),
  },
  egyptian: {
    ancient: sexed(['Djoser', 'Khafre', 'Menkaure', 'Seti', 'Sobekemsaf', 'Senusret', 'Userkaf', 'Wepwawet', 'Imhotep', 'Horemheb', 'Tutankhamun', 'Mentuhotep', 'Khufu'], ['Ahhotep', 'Ankhesenamun', 'Henuttawy', 'Merneith', 'Mutnodjmet', 'Sobekneferu', 'Tawosret', 'Iset', 'Neithhotep', 'Meritaten', 'Sitamun', 'Ahmose Nefertari', 'Kiya']),
    ptolemaic: sexed(['Ptolemy', 'Philadelphus', 'Soter', 'Euergetes', 'Philopator', 'Epiphanes', 'Philometor', 'Neos Dionysos', 'Demetrios', 'Kallimachos', 'Manethon', 'Eratosthenes', 'Zenon'], ['Berenice', 'Arsinoe', 'Tryphaena', 'Cleopatra', 'Selene', 'Olympias', 'Laodice', 'Macedonia', 'Apollonia', 'Eirene', 'Theoxena', 'Nikaia', 'Kleino']),
    modern: sexed(['Abdelrahman', 'Hisham', 'Tarek', 'Fathi', 'Samir', 'Nabil', 'Walid', 'Hazem', 'Mustafa', 'Gamal', 'Amr', 'Tamer', 'Sherif'], ['Dina', 'Heba', 'Rania', 'Rawan', 'Yasmin', 'Dalia', 'Huda', 'Nadia', 'Mona', 'Amina', 'Nermine', 'Reem', 'Menna']),
  },
  'india-north': {
    ancient: sexed(['Bindusara', 'Harsha', 'Kanishka', 'Samudragupta', 'Vardhamana', 'Vishnugupta', 'Yajnavalkya', 'Chanakya'], ['Amrapali', 'Ghosha', 'Lopamudra', 'Prabhavati', 'Shakuntala', 'Sulabha', 'Vishpala', 'Yashodhara']),
    medieval: sexed(['Alauddin', 'Bahlol', 'Humayun', 'Jahangir', 'Man Singh', 'Sher Shah', 'Surajmal', 'Todar Mal'], ['Chand Bibi', 'Durgavati', 'Gulbadan', 'Hamida', 'Jahanara', 'Noor Jahan', 'Rani Padmini', 'Tarabai']),
    modern: sexed(['Aarav', 'Dhruv', 'Ishaan', 'Kabir', 'Manav', 'Nikhil', 'Rohan', 'Varun'], ['Aditi', 'Diya', 'Isha', 'Ishita', 'Nandini', 'Riya', 'Sneha', 'Tara']),
  },
  'india-south': {
    ancient: sexed(['Aditya', 'Chandragupta', 'Karikala', 'Neduncheliyan', 'Parantaka', 'Pulakeshin', 'Satakarni', 'Vikramaditya'], ['Avvaiyar', 'Charumati', 'Kundavai', 'Madhavi', 'Nangai', 'Poonguzhali', 'Sembiyan', 'Vasumathi']),
    medieval: sexed(['Achyuta', 'Devaraya', 'Harihara', 'Kampana', 'Krishnadevaraya', 'Mallikarjuna', 'Ramaraya', 'Salim'], ['Chennabhairadevi', 'Gangadevi', 'Kittur Chennamma', 'Rudramadevi', 'Tirumalamba', 'Vijayamba', 'Yellamma', 'Yogimallavva']),
    modern: sexed(['Advaith', 'Dhanush', 'Harish', 'Karthik', 'Manoj', 'Naveen', 'Pranav', 'Surya'], ['Aishwarya', 'Bhavana', 'Harini', 'Keerthi', 'Nithya', 'Pooja', 'Shreya', 'Vaishnavi']),
  },
  vietnamese: {
    dynastic: sexed(['Đinh Tiên Hoàng', 'Lý Thái Tổ', 'Trần Hưng Đạo', 'Lê Lợi', 'Nguyễn Trãi', 'Quang Trung', 'Gia Long', 'Minh Mạng'], ['Âu Cơ', 'Trưng Trắc', 'Trưng Nhị', 'Lý Chiêu Hoàng', 'Ngọc Hân', 'Ỷ Lan', 'Huyền Trân', 'Thúy Kiều']),
    colonial: sexed(['Phan Bội Châu', 'Phan Chu Trinh', 'Hoàng Hoa Thám', 'Nguyễn Thái Học', 'Võ Nguyên Giáp', 'Bảo Đại', 'Tôn Đức Thắng', 'Phạm Văn Đồng'], ['Hoàng Thị Loan', 'Nguyễn Thị Minh Khai', 'Võ Thị Sáu', 'Nguyễn Thị Định', 'Bà Huyện Thanh Quan', 'Hồ Xuân Hương', 'Nam Phương', 'Phan Thị Ràng']),
    modern: sexed(['Đức Anh', 'Hoàng Long', 'Quốc Bảo', 'Tuấn Kiệt', 'Thanh Long', 'Gia Huy', 'Duy Khánh', 'Minh Quân'], ['Bảo Ngọc', 'Diệu Linh', 'Hà My', 'Khánh Linh', 'Ngọc Anh', 'Quỳnh Như', 'Thảo Nguyên', 'Yến Nhi']),
  },
  thai: {
    traditional: sexed(['Naresuan', 'Ramathibodi', 'Trailok', 'Boromakot', 'Taksin', 'Mongkut', 'Chulalongkorn', 'Ekatat'], ['Suriyothai', 'Sri Sudachan', 'Suphankanlaya', 'Kaeo', 'Sri Chulalak', 'Prasatthong', 'Thep', 'Buppha']),
    modern: sexed(['Nattapong', 'Thanakorn', 'Pongsak', 'Worawut', 'Chaiwat', 'Pakorn', 'Phichit', 'Saran'], ['Kanyarat', 'Nattaya', 'Sasithorn', 'Siriporn', 'Wimonrat', 'Chananan', 'Rachada', 'Thipphawan']),
  },
  malay: {
    traditional: sexed(['Hang Tuah', 'Hang Jebat', 'Sultan Mansur', 'Sultan Alauddin', 'Tun Perak', 'Tun Mutahir', 'Raja Ali', 'Iskandar Shah'], ['Tun Fatimah', 'Puteri Gunung Ledang', 'Raja Hijau', 'Siti Zubaidah', 'Dayang Nurfaizah', 'Cik Siti Wan Kembang', 'Ratu Kalinyamat', 'Bonda'],),
    modern: sexed(['Azlan', 'Faisal', 'Hakim', 'Irfan', 'Syafiq', 'Zulkifli', 'Haziq', 'Fikri'], ['Alya', 'Farah', 'Husna', 'Intan', 'Nabila', 'Qistina', 'Sofea', 'Wani']),
  },
  filipino: {
    precolonial: sexed(['Lapu-Lapu', 'Humabon', 'Sikatuna', 'Lakandula', 'Rajah Sulayman', 'Rajah Matanda', 'Rajah Tupas', 'Datu Zula', 'Kolambu', 'Siagu', 'Pagbuaya'], ['Dayang Kalangitan']),
    colonial: sexed(['Marcelo del Pilar', 'Jose Rizal', 'Emilio Aguinaldo', 'Andres Bonifacio', 'Apolinario Mabini', 'Antonio Luna', 'Graciano Lopez Jaena', 'Juan Luna'], ['Gabriela Silang', 'Teresa Magbanua', 'Gregoria de Jesus', 'Melchora Aquino', 'Trinidad Tecson', 'Marcela Agoncillo', 'Pura Villanueva', 'Maria Orosa']),
    modern: sexed(['Paolo', 'Carlo', 'Miguel', 'Enrique', 'Ramon', 'Mateo', 'Nico', 'Gabriel'], ['Ariana', 'Bianca', 'Camille', 'Danica', 'Isabela', 'Lourdes', 'Mikaela', 'Sofia']),
  },
  yoruba: {
    traditional: sexed(['Oduduwa', 'Oranyan', 'Sango', 'Ajaka', 'Alaafin', 'Ogun', 'Ifagbamila', 'Akinwande'], ['Moremi', 'Yemoja', 'Oya', 'Osun', 'Abeni', 'Adetokunbo', 'Aminat', 'Olufunke']),
    modern: sexed(['Adekunle', 'Babatope', 'Femi', 'Ibrahim', 'Kayode', 'Olumide', 'Segun', 'Yemi'], ['Abimbola', 'Bukola', 'Folashade', 'Ifeoma', 'Kudirat', 'Modupe', 'Oluwakemi', 'Temitope']),
  },
  amharic: {
    imperial: sexed(['Menelik', 'Tewodros', 'Yohannes', 'Mihretu', 'Ras Makonnen', 'Lij Iyasu', 'Zara Yaqob', 'Lebna Dengel'], ['Taytu Betul', 'Zewditu', 'Menen Asfaw', 'Sahle Work', 'Woyzero Sehin', 'Kebebeush', 'Altash', 'Woizero'],),
    modern: sexed(['Abebe', 'Bekele', 'Getachew', 'Girma', 'Kebede', 'Solomon', 'Tesfaye', 'Worku'], ['Betty', 'Emebet', 'Liya', 'Mulu', 'Rahel', 'Selam', 'Tigist', 'Yodit']),
  },
  swahili: {
    precolonial: sexed(['Mwana Kupona', 'Mbarouk', 'Mkwawa', 'Mnyazi', 'Said bin Sultan', 'Tippu Tip', 'Machemba', 'Mirambo'], ['Bibi Titi', 'Mwana Mkisi', 'Fatuma', 'Mwanaisha', 'Mwanamaka', 'Amina', 'Zubeyda', 'Siti']),
    modern: sexed(['Abdalla', 'Bakari', 'Hamad', 'Julius', 'Kassim', 'Mbarak', 'Salim', 'Yusuf'], ['Amina', 'Halima', 'Jamila', 'Mariam', 'Nuru', 'Rehema', 'Saida', 'Zainabu']),
  },
  'zulu-xhosa': {
    precolonial: sexed(['Shaka', 'Dingane', 'Mpande', 'Cetshwayo', 'Mkhande', 'Hintsa', 'Maqoma', 'Sandile'], ['Nandi', 'Mkabayi', 'Nomsa', 'Nobanda', 'Sibongile', 'Fikelephi', 'Mantantise', 'Buhlebemvelo']),
    modern: sexed(['Andile', 'Bheki', 'Lungile', 'Mandla', 'Mthokozisi', 'Siyabonga', 'Vusi', 'Xolani'], ['Busisiwe', 'Lindiwe', 'Nokuthula', 'Nolwazi', 'Sibongile', 'Thulisile', 'Zandile', 'Zodwa']),
  },
  mesoamerican: {
    precolonial: sexed(['Ahuitzotl', 'Moctezuma', 'Nezahualcoyotl', 'Tlacaelel', 'Pakal', 'Kukulkan', 'Itzamna', 'Kan Balam'], ['Atotoztli', 'Erendira', 'Ix Kan Leom', 'Ix Chel', 'Malinalxochitl', 'Xocoyotzin', 'Yohl Ik nal', 'Zazil']),
    colonial: sexed(['Hernan Cortes', 'Pedro de Alvarado', 'Cuauhtemoc', 'Tecun Uman', 'Atahualpa', 'Diego de Mazariegos', 'Juan de Zumarraga', 'Bartolome de las Casas'], ['Malintzin', 'Anacaona', 'Tecuelhuetzin', 'Beatriz de la Cueva', 'Doña Marina', 'Xiuhtzatzin', 'Isabel Moctezuma', 'Catarina de Erauso']),
    modern: sexed(['Alejandro', 'Carlos', 'Emiliano', 'Javier', 'Mateo', 'Nicolas', 'Santiago', 'Xavier'], ['Camila', 'Daniela', 'Frida', 'Itzel', 'Marisol', 'Renata', 'Valentina', 'Ximena']),
  },
  andean: {
    precolonial: sexed(['Manco Capac', 'Pachacuti', 'Huayna Capac', 'Atahualpa', 'Tupac Yupanqui', 'Sinchi Roca', 'Mayta Capac', 'Roca'], ['Mama Ocllo', 'Coya Asarpay', 'Contarhuacho', 'Cura Ocllo', 'Anahuarque', 'Tocto', 'Rahuana', 'Chimpu Ocllo']),
    colonial: sexed(['Tupac Amaru I', 'Jose Gabriel Condorcanqui', 'Pedro Vilcapaza', 'Juan Santos Atahualpa', 'Titu Cusi', 'Sayri Tupac', 'Garcilaso de la Vega', 'Tupac Katari'], ['Micaela Bastidas', 'Tomasa Tito Condemayta', 'Cecilia Tupac Amaru', 'Maria Parado', 'Bartolina Sisa', 'Gregoria Apaza', 'Beatriz Clara Coya', 'Catalina Huanca']),
    modern: sexed(['Alejandro', 'Diego', 'Joaquin', 'Luis', 'Mateo', 'Nicolas', 'Rodrigo', 'Sebastian'], ['Camila', 'Elena', 'Isabella', 'Luciana', 'Maria', 'Sofia', 'Valeria', 'Ximena']),
  },
  baltic: {
    medieval: sexed(
      ['Mindaugas', 'Vaišvilkas', 'Traidenis', 'Vytenis', 'Gediminas', 'Algirdas', 'Kęstutis', 'Jogaila', 'Vytautas', 'Švitrigaila', 'Žygimantas', 'Karijotas', 'Narimantas', 'Liubartas', 'Butautas', 'Vaidotas', 'Skirgaila', 'Andrius', 'Lengvenis', 'Tautvilas', 'Daumantas', 'Treniota', 'Vykintas', 'Margiris', 'Manvydas'],
      ['Morta', 'Birutė', 'Aldona', 'Danutė', 'Rimgailė', 'Gaudemunda', 'Aigustė', 'Anastazija', 'Eufemija', 'Marija', 'Ona', 'Julijona', 'Sofija', 'Elena', 'Elžbieta', 'Jadvyga', 'Dorota', 'Kotryna', 'Margarita', 'Agota', 'Barbora', 'Kristina', 'Cecilija', 'Beatričė', 'Aleksandra'],
    ),
    'early-modern': sexed(
      ['Mikalojus', 'Jonas', 'Kristupas', 'Stanislovas', 'Leonas', 'Kazimieras', 'Albertas', 'Jurgis', 'Steponas', 'Mykolas', 'Motiejus', 'Povilas', 'Andrius', 'Aleksandras', 'Juozapas'],
      ['Barbora', 'Ona', 'Kotryna', 'Elžbieta', 'Kristina', 'Sofija', 'Dorota', 'Marija', 'Jadvyga', 'Teresė', 'Cecilija', 'Agota', 'Margarita', 'Konstancija', 'Uršulė'],
    ),
    modern: sexed(
      ['Mantas', 'Lukas', 'Dominykas', 'Jokūbas', 'Nojus', 'Benas', 'Rokas', 'Dovydas', 'Tadas', 'Paulius', 'Tomas', 'Martynas', 'Arnas', 'Justas', 'Simas'],
      ['Gabija', 'Ieva', 'Austėja', 'Ugnė', 'Emilija', 'Liepa', 'Kamilė', 'Ema', 'Luknė', 'Rugilė', 'Goda', 'Viltė', 'Greta', 'Monika', 'Viktorija'],
    ),
  },
  balkan: {
    medieval: sexed(
      ['Stefan', 'Vukan', 'Uroš', 'Dragutin', 'Milutin', 'Dušan', 'Lazar', 'Vuk', 'Branko', 'Đurađ', 'Radoslav', 'Vladislav', 'Predislav', 'Prvoslav', 'Dragoslav', 'Miroslav', 'Dobroslav', 'Gradislav', 'Gojko', 'Altoman', 'Nikola', 'Jovan', 'Konstantin', 'Sava'],
      ['Ana', 'Jelena', 'Milica', 'Simonida', 'Teodora', 'Olivera', 'Mara', 'Jefimija', 'Evdokija', 'Anastasija', 'Katarina', 'Rada', 'Vidosava', 'Jelisaveta', 'Danica', 'Angelina', 'Jerina', 'Draginja', 'Neda'],
    ),
    ottoman: sexed(
      ['Karađorđe', 'Miloš', 'Petar', 'Aleksa', 'Jakov', 'Matija', 'Ilija', 'Stanoje', 'Veljko', 'Sima', 'Dositej', 'Vuk', 'Jovan', 'Nikola', 'Stevan', 'Đorđe', 'Radovan', 'Milenko', 'Luka', 'Marko'],
      ['Ljubica', 'Persida', 'Anka', 'Katarina', 'Jelena', 'Milica', 'Stana', 'Savka', 'Anđelija', 'Đurđija', 'Cveta', 'Jovana', 'Marija', 'Sofija', 'Poleksija'],
    ),
    modern: sexed(
      ['Luka', 'Stefan', 'Lazar', 'Nikola', 'Miloš', 'Marko', 'Nemanja', 'Aleksandar', 'Filip', 'Vuk', 'Uroš', 'Dušan', 'Đorđe', 'Jovan', 'Mihajlo'],
      ['Milica', 'Jelena', 'Ana', 'Marija', 'Teodora', 'Sofija', 'Katarina', 'Anđela', 'Jovana', 'Tamara', 'Nevena', 'Ivana', 'Mina', 'Isidora', 'Tijana'],
    ),
  },
  caucasus: {
    alanian: sexed(
      ['Akhsar', 'Akhsartag', 'Uruzmag', 'Soslan', 'Batraz', 'Atsamaz', 'Khamyts', 'Syrdon', 'Warhag', 'Tutar', 'Aldar', 'Durgulel', 'Sarosius', 'Rosmik', 'Alan', 'Aspar', 'Candac', 'Goar', 'Respendial', 'Sangiban', 'Khuddan', 'Murat', 'Sultan', 'Khadzhimurat', 'Dzambolat', 'Soslanbek', 'Aslanbek', 'Kantemir', 'Nart', 'Albeg', 'Totraz', 'Aldarbek', 'Dargav', 'Saukhan', 'Batradz'],
      ['Satana', 'Dzerassa', 'Agunda', 'Azau', 'Bedukha', 'Elda', 'Zarina', 'Alana', 'Burdukhan', 'Aza', 'Asiat', 'Zalina', 'Fatima', 'Madina', 'Zarema', 'Anna', 'Tamara', 'Lola', 'Bella', 'Nina', 'Raisa', 'Dzhanetta', 'Elina', 'Diana', 'Zemfira', 'Liana'],
    ),
    imperial: sexed(
      ['Kosta', 'Akhmet', 'Aslanbek', 'Batradz', 'Dabe', 'Elbazduko', 'Gappo', 'Inal', 'Kantemir', 'Makhambet', 'Mysost', 'Soslanbek', 'Taimuraz', 'Tsaray', 'Zaurbek'],
      ['Anna', 'Asiat', 'Zarina', 'Fatima', 'Dzhanetta', 'Liza', 'Madina', 'Nina', 'Raisa', 'Zalina', 'Zarema', 'Tamara', 'Bella', 'Lola', 'Svetlana'],
    ),
    modern: sexed(
      ['Alan', 'Taimuraz', 'Kazbek', 'Soslan', 'Aslan', 'Zaur', 'Batraz', 'Atsamaz', 'Artur', 'Ruslan', 'Murad', 'Chermen', 'Khetag', 'Elbrus', 'Arsen'],
      ['Zarina', 'Agunda', 'Zalina', 'Madina', 'Fatima', 'Zarema', 'Alana', 'Diana', 'Kristina', 'Marina', 'Tamara', 'Bella', 'Asiat', 'Dzhanetta', 'Elina'],
    ),
  },
}

// The early archaeological packs are displayed as the first periods of the
// continuous Japanese-archipelago and Korean-peninsula culture selectors.
Object.assign(periodGivenNames.japanese ??= {}, ancientPeriodGivenNames['prehistoric-japan'])
Object.assign(periodGivenNames.korean ??= {}, ancientPeriodGivenNames['early-korea'])

const periodFamilyNames: Partial<Record<OfflineCulture, Record<string, PersonDatum[]>>> = {
  chinese: {
    'qin-han': ['嬴', '李', '蒙', '王', '刘', '吕', '项', '萧', '曹', '司马', '诸葛', '班', '蔡', '张', '马', '孙'].map((name) => person(name)),
    'pre-qin-han': ['姬', '嬴', '姜', '芈', '妫', '姚', '姒', '子', '田', '赵', '魏', '韩', '刘', '王', '李'].map((name) => person(name)),
    'wei-jin-tang': ['王', '谢', '崔', '卢', '李', '郑', '裴', '韦', '杨', '柳', '杜', '陆', '陈', '萧', '元'].map((name) => person(name)),
    'song-yuan': ['赵', '王', '李', '张', '刘', '陈', '杨', '黄', '周', '吴', '徐', '朱', '林', '胡', '郭'].map((name) => person(name)),
    'ming-qing': ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗'].map((name) => person(name)),
    republic: ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'].map((name) => person(name)),
    modern: ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '高', '罗'].map((name) => person(name)),
  },
  japanese: {
    'asuka-nara': ['苏我', '物部', '中臣', '大伴', '藤原', '纪', '橘', '阿倍'].map((name) => person(name)),
    heian: ['藤原', '源', '平', '橘', '纪', '大江', '菅原', '清原'].map((name) => person(name)),
    'kamakura-muromachi': ['源', '北条', '足利', '新田', '楠木', '大内', '细川', '畠山', '上杉', '日野'].map((name) => person(name)),
    'sengoku-azuchi': ['织田', '丰臣', '武田', '上杉', '伊达', '毛利', '岛津', '真田', '明智', '长宗我部'].map((name) => person(name)),
    edo: ['德川', '松平', '前田', '伊达', '岛津', '毛利', '井伊', '酒井', '大冈', '近松'].map((name) => person(name)),
    'meiji-showa': ['佐藤', '铃木', '高桥', '田中', '伊藤', '渡边', '山本', '中村', '小林', '加藤', '斋藤', '井上'].map((name) => person(name)),
    modern: ['佐藤', '铃木', '高桥', '田中', '伊藤', '渡边', '山本', '中村', '小林', '加藤', '吉田', '山田'].map((name) => person(name)),
  },
  korean: {
    'three-kingdoms': ['高', '解', '乙支', '渊', '扶余', '沙宅', '黑齿', '金', '朴', '昔'].map((name) => person(name)),
    'unified-silla': ['金', '朴', '昔', '崔', '薛', '李', '张', '郑'].map((name) => person(name)),
    goryeo: ['王', '金', '李', '崔', '郑', '姜', '尹', '安', '洪', '申'].map((name) => person(name)),
    'early-joseon': ['李', '金', '朴', '崔', '郑', '赵', '尹', '张', '申', '徐'].map((name) => person(name)),
    'late-joseon': ['李', '金', '朴', '崔', '郑', '赵', '尹', '张', '洪', '安', '宋', '权'].map((name) => person(name)),
    'korean-empire': ['金', '李', '朴', '崔', '郑', '姜', '赵', '尹', '张', '闵', '徐', '安'].map((name) => person(name)),
    colonial: ['金', '李', '朴', '崔', '郑', '姜', '赵', '尹', '张', '林', '韩', '安'].map((name) => person(name)),
    'south-modern': ['金', '李', '朴', '崔', '郑', '姜', '赵', '尹', '张', '林', '韩', '吴'].map((name) => person(name)),
    'north-modern': ['金', '李', '朴', '崔', '郑', '姜', '赵', '尹', '韩', '林', '申', '洪'].map((name) => person(name)),
  },
  mongolian: {
    'pre-empire': ['Kiyad', 'Borjigin', 'Tayichiud', 'Kerait', 'Naiman', 'Merkit', 'Jalair', 'Onggirat'].map((name) => person(name)),
    empire: ['Borjigin', 'Kiyad', 'Jalair', 'Onggirat', 'Uriankhai', 'Oirat', 'Naiman', 'Khongirad'].map((name) => person(name)),
    'northern-yuan': ['Borjigin', 'Chakhar', 'Khalkha', 'Tumet', 'Ordos', 'Uriankhai', 'Oirat', 'Khorchin'].map((name) => person(name)),
    'oirat-khanates': ['Choros', 'Dorbet', 'Torghut', 'Khoshut', 'Khoid', 'Bayad', 'Zakhchin', 'Myangad'].map((name) => person(name)),
    qing: ['Khalkha', 'Chakhar', 'Khorchin', 'Ordos', 'Tumet', 'Barga', 'Dorbet', 'Torghut'].map((name) => person(name)),
    socialist: ['Borjigin', 'Besud', 'Jalair', 'Khongirad', 'Olkhonud', 'Sartuul', 'Uriankhai', 'Barga'].map((name) => person(name)),
    modern: ['Borjigin', 'Besud', 'Jalair', 'Khongirad', 'Olkhonud', 'Sartuul', 'Uriankhai', 'Barga', 'Bayad', 'Khalkha'].map((name) => person(name)),
  },
  manchu: {
    'jin-jurchen': ['Wanyan', 'Pusan', 'Tushan', 'Wulinda', 'Tangkuo', 'Pucha', 'Wugulun', 'Jiagu'].map((name) => person(name)),
    'late-jurchen': ['Aisin Gioro', 'Yehe Nara', 'Ula Nara', 'Hada Nara', 'Hoifa Nara', 'Guwalgiya', 'Niohuru', 'Donggo'].map((name) => person(name)),
    'later-jin': ['Aisin Gioro', 'Yehe Nara', 'Ula Nara', 'Hada Nara', 'Guwalgiya', 'Niohuru', 'Donggo', 'Fuca'].map((name) => person(name)),
    'early-qing': ['Aisin Gioro', 'Nara', 'Guwalgiya', 'Niohuru', 'Fuca', 'Donggo', 'Tatara', 'Uya'].map((name) => person(name)),
    'late-qing': ['Aisin Gioro', 'Nara', 'Guwalgiya', 'Niohuru', 'Fuca', 'Tatara', 'Uya', 'Yehenara'].map((name) => person(name)),
    modern: ['赵', '金', '关', '那', '富', '佟', '马', '索', '罗', '鄂'].map((name) => person(name)),
  },
  iberian: {
    medieval: ['Trastámara', 'Lara', 'Castro', 'Haro', 'Mendoza', 'Guzmán', 'Meneses', 'Aragón', 'Manrique', 'Enríquez', 'Ponce de León', 'Fernández de Córdoba', 'Álvarez de Toledo', 'Fajardo', 'Osorio', 'Quiñones', 'Velasco', 'Ayala', 'Zúñiga', 'Cabrera'].map((name) => person(name)),
    'early-modern': ['Mendoza', 'Alba', 'Guzmán', 'Velasco', 'Borja', 'Castro', 'Meneses', 'Manrique', 'Enríquez', 'Ponce de León', 'Fernández de Córdoba', 'Álvarez de Toledo', 'Fajardo', 'Osorio', 'Quiñones', 'Ayala', 'Zúñiga', 'Cabrera', 'Sandoval', 'Cárdenas'].map((name) => person(name)),
    modern: ['García', 'Fernández', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Díaz', 'Hernández', 'Ruiz', 'Jiménez', 'Moreno', 'Navarro', 'Alonso', 'Romero', 'Torres', 'Ortega', 'Ramos', 'Vázquez', 'Ramírez', 'Gil', 'Serrano', 'Molina', 'Suárez', 'Blanco', 'Iglesias', 'Medina', 'Cortés'].map((name) => person(name)),
  },
  'ancient-rome': {
    republic: ['Aemilius', 'Claudius', 'Cornelius', 'Fabius', 'Julius', 'Licinius', 'Manlius', 'Sempronius', 'Valerius', 'Tullius', 'Antonius', 'Porcius'].map((name) => person(name)),
    empire: ['Aelius', 'Aurelius', 'Claudius', 'Flavius', 'Julius', 'Ulpius', 'Valerius', 'Antonius', 'Septimius', 'Domitius', 'Cassius', 'Cornelius'].map((name) => person(name)),
  },
  celtic: {
    medieval: ['Ó Néill', 'Ó Briain', 'Ó Domhnaill', 'Ó Conchobhair', 'Mac Cárthaigh', 'Mac Murchadha', 'Ó Súilleabháin', 'Ó Máille', 'Ó Ruairc', 'Mac Diarmada', 'Ó Ceallaigh', 'Ó Dubhda', 'Ó Catháin', 'Ó Donnchadha', 'Mac Suibhne', 'Mac Giolla Phádraig', 'Ó hEidhin', 'Ó Madadháin', 'Mac Aodhagáin', 'Ó Maol Seachlainn', 'Mac Lochlainn', 'Ó Flaithbheartaigh'].map((name) => person(name)),
    modern: ["O'Brien", "O'Connor", "O'Sullivan", "O'Neill", "O'Donnell", "O'Malley", 'Murphy', 'Kelly', 'Doyle', 'Byrne', 'Ryan', 'Walsh', 'McCarthy', 'Gallagher', 'Kennedy', 'Lynch', 'Murray', 'Quinn', 'Moore', 'Brennan', 'Flynn', 'Nolan', 'Donnelly', 'Healy', 'Keane', 'Connolly', 'Duffy', 'Reilly', 'Burke', 'Hayes'].map((name) => person(name)),
  },
  'slavic-east': {
    imperial: ['Kovalenko', 'Shevchenko', 'Bondarenko', 'Tkachenko', 'Kravchenko', 'Melnyk', 'Kovalchuk', 'Boyko', 'Savchenko', 'Marchenko', 'Polishchuk', 'Pavlenko', 'Honcharenko', 'Lysenko', 'Oliinyk', 'Rudenko', 'Klymenko', 'Kozak', 'Kushnir', 'Hrytsenko', 'Fedorenko', 'Petrenko', 'Levchenko', 'Moroz', 'Mazur', 'Dovzhenko', 'Ivashchenko', 'Zakharchenko', 'Sydorenko', 'Yaremchuk'].map((name) => person(name)),
    modern: ['Kovalenko', 'Shevchenko', 'Bondarenko', 'Tkachenko', 'Kravchenko', 'Melnyk', 'Kovalchuk', 'Boyko', 'Savchenko', 'Marchenko', 'Polishchuk', 'Pavlenko', 'Honcharenko', 'Lysenko', 'Oliinyk', 'Rudenko', 'Klymenko', 'Kozak', 'Kushnir', 'Hrytsenko', 'Fedorenko', 'Petrenko', 'Levchenko', 'Moroz', 'Mazur', 'Dovzhenko', 'Ivashchenko', 'Zakharchenko', 'Sydorenko', 'Yaremchuk'].map((name) => person(name)),
  },
  'dutch-lowlands': {
    medieval: ['van Brugge', 'van Gent', 'van Utrecht', 'van Leiden', 'van Delft', 'van Haarlem', 'van Dordrecht', 'van Gouda', 'van Kampen', 'van Deventer', 'van Breda', 'van Maastricht', 'van Ieper', 'van Mechelen', 'van Leuven', 'van Zwolle', 'van Middelburg', 'van Groningen', 'van Nijmegen', 'van Zutphen', 'van Damme', 'van Alkmaar'].map((name) => person(name)),
    'early-modern': ['de Witt', 'van Oldenbarnevelt', 'de Groot', 'Huygens', 'van Rijn', 'de Ruyter', 'Tromp', 'van Leeuwenhoek', 'van der Meer', 'van Aerssen', 'Bicker', 'Trip', 'De Geer', 'Coymans', 'van Campen', 'van Goyen', 'de Keyser', 'van der Helst', 'van der Heyden', 'van Honthorst', 'van Mierevelt', 'van Ostade', 'van de Velde', 'de With'].map((name) => person(name)),
    modern: ['De Jong', 'Jansen', 'De Vries', 'Van den Berg', 'Van Dijk', 'Bakker', 'Janssen', 'Visser', 'Smit', 'Meijer', 'De Boer', 'Mulder', 'De Groot', 'Bos', 'Vos', 'Peters', 'Hendriks', 'Dekker', 'Brouwer', 'Dijkstra', 'De Bruin', 'Van Leeuwen', 'Van der Heijden', 'De Graaf', 'Van Loon', 'Kuiper', 'Schouten', 'Prins', 'Van Beek', 'Kramer'].map((name) => person(name)),
  },
  baltic: {
    'early-modern': ['Radvila', 'Goštautas', 'Kęsgaila', 'Astikas', 'Pacas', 'Tiškevičius', 'Valavičius', 'Giedraitis', 'Alšėniškis', 'Manvydas'].map((name) => person(name)),
    modern: ['Kazlauskas', 'Jankauskas', 'Petrauskas', 'Stankevičius', 'Vasiliauskas', 'Žukauskas', 'Butkus', 'Paulauskas', 'Urbonas', 'Kavaliauskas', 'Rimkus', 'Ivanauskas', 'Balčiūnas', 'Navickas', 'Savickas', 'Baranauskas', 'Mikalauskas', 'Žilinskas', 'Ramanauskas', 'Lukoševičius'].map((name) => person(name)),
  },
  balkan: {
    modern: ['Jovanović', 'Petrović', 'Nikolić', 'Marković', 'Đorđević', 'Stojanović', 'Ilić', 'Stanković', 'Pavlović', 'Milošević', 'Savić', 'Popović', 'Živković', 'Lukić', 'Ristić', 'Radić', 'Kovačević', 'Tomić', 'Đurić', 'Stevanović', 'Milić', 'Simić', 'Kostić', 'Mladenović', 'Milosavljević', 'Radosavljević', 'Obradović', 'Vasić', 'Maksimović', 'Gajić'].map((name) => person(name)),
  },
  caucasus: {
    imperial: ['Khetagurov', 'Gagloyev', 'Tibilov', 'Sanakoyev', 'Dzhioyev', 'Pliev', 'Kabisov', 'Tsarakhov', 'Dzagurov', 'Kesaev', 'Gazdanov', 'Dzasokhov', 'Mamsurov', 'Tedeyev', 'Totoonov'].map((name) => person(name)),
    modern: ['Khetagurov', 'Gagloyev', 'Tibilov', 'Sanakoyev', 'Dzhioyev', 'Pliev', 'Kabisov', 'Tsarakhov', 'Dzagurov', 'Kesaev', 'Gazdanov', 'Dzasokhov', 'Mamsurov', 'Tedeyev', 'Totoonov', 'Kokoyev', 'Margiyev', 'Valiyev', 'Bitarov', 'Kaloyev'].map((name) => person(name)),
  },
  english: {
    medieval: ['Baker', 'Carter', 'Cooper', 'Fletcher', 'Miller', 'Smith', 'Taylor', 'Turner', 'Wood', 'Wright'].map((name) => person(name)),
    'early-modern': ['Howard', 'Cavendish', 'Cecil', 'Spencer', 'Walsingham', 'Sidney', 'Herbert', 'Marlowe'].map((name) => person(name)),
    modern: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Parker', 'Robinson', 'Wright', 'Bennett', 'Cooper', 'Foster', 'Gardner', 'Marshall', 'Mason', 'Porter', 'Spencer', 'Turner', 'Webb'].map((name) => person(name)),
  },
  norse: { modern: ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen', 'Jensen', 'Karlsen', 'Johnsen', 'Pettersen', 'Eriksen', 'Berg', 'Haugen', 'Hagen', 'Johannessen', 'Andreassen', 'Jacobsen', 'Dahl', 'Jorgensen', 'Halvorsen', 'Henriksen', 'Lund', 'Sorensen', 'Jakobsen', 'Moen', 'Gundersen', 'Iversen', 'Strand'].map((name) => person(name)) },
  egyptian: { modern: ['Hassan', 'Ibrahim', 'Mahmoud', 'Sayed', 'Mostafa', 'Fawzi', 'Nassar', 'Khalil', 'El-Sayed', 'Abdelaziz', 'El-Masry', 'Soliman', 'Farouk', 'Amin', 'Ghoneim', 'Ezzat', 'Mansour', 'Zaki', 'Sabry', 'Hegazy'].map((name) => person(name)) },
  'russian-siberian': {
    tsardom: ['Kozlov', 'Makarov', 'Melnikov', 'Rogov', 'Semenov', 'Tolstykh', 'Ustinov', 'Yarov'].map((name) => person(name)),
    imperial: ['Belyaev', 'Dobrynin', 'Karpov', 'Krasnov', 'Loginov', 'Pankratov', 'Rybakov', 'Tikhonov'].map((name) => person(name)),
    soviet: ['Antonov', 'Bogdanov', 'Kolesnikov', 'Lebedev', 'Novikov', 'Pavlov', 'Smirnov', 'Tarasov'].map((name) => person(name)),
    modern: ['Baranov', 'Danilov', 'Egorov', 'Kirilov', 'Markov', 'Nikitin', 'Rudenko', 'Savin'].map((name) => person(name)),
  },
}

const locationPools: Partial<Record<OfflineCulture, Partial<Record<OfflineNameKind, string[]>>>> = {
  chinese: { location: ['长安', '洛阳', '汴京', '临安', '建康', '襄阳', '江陵', '姑苏', '会稽', '成都', '大同', '开封', '泉州', '扬州', '雁门关', '潼关', '函谷关', '太行山', '昆仑山', '洞庭湖', '鄱阳湖', '黄河', '长江'], organization: ['少林寺', '武当派', '峨眉派', '丐帮', '锦衣卫', '神机营', '太医院', '钦天监'], item: ['青锋剑', '龙泉剑', '鸣鸿刀', '玉佩', '折扇', '狼毫笔', '传国玉玺', '长生灯'] },
  japanese: { location: ['京都', '江户', '大阪', '镰仓', '奈良', '尾张', '甲府', '北海道', '琵琶湖', '富士山'], organization: ['源氏', '平氏', '织田家', '武田家', '德川家', '本能寺'], item: ['太刀', '胁差', '和歌卷', '家纹印', '御守'] },
  korean: { location: ['汉城', '开城', '平壤', '全州', '庆州', '汉江', '白头山'], organization: ['金氏宗族', '成均馆', '议政府', '内禁卫'], item: ['环刀', '玉笛', '族谱', '官印'] },
  english: { location: ['London', 'York', 'Oxford', 'Canterbury', 'Winchester', 'Cambridge', 'Dover', 'Yorkshire', 'Thames', 'Sherwood Forest'], organization: ['House of York', 'House of Lancaster', 'The Crown', "King's Guard", 'Guild of Merchants'], item: ['longsword', 'signet ring', 'heraldic seal', 'family Bible'] },
  french: { location: ['Paris', 'Orléans', 'Rouen', 'Lyon', 'Bordeaux', 'Marseille', 'Loire', 'Normandy'], organization: ['House of Valois', 'House of Bourbon', 'Royal Guard', 'Guild of Paris'], item: ['rapier', 'seal ring', 'lute', 'royal letter'] },
  german: { location: ['Berlin', 'Köln', 'Nürnberg', 'Wien', 'Bremen', 'Rhein', 'Schwarzwald'], organization: ['House of Habsburg', 'Teutonic Order', 'City Council', 'Guild of Smiths'], item: ['Landsknecht sword', 'signet', 'ledger', 'iron key'] },
  italian: { location: ['Roma', 'Firenze', 'Venezia', 'Milano', 'Napoli', 'Siena', 'Toscana'], organization: ['House of Medici', 'Roman Senate', 'Venetian Guild', 'Papal Guard'], item: ['stiletto', 'signet ring', 'codex', 'masquerade mask'] },
  iberian: { location: ['Toledo', 'Madrid', 'Sevilla', 'Zaragoza', 'Granada', 'Valencia', 'Ebro'], organization: ['House of Trastámara', 'Order of Santiago', 'Council of Castile', 'Casa de Mendoza'], item: ['rapier', 'rosary', 'royal seal', 'astrolabe'] },
  norse: { location: ['Oslo', 'Bergen', 'Trondheim', 'Kaupang', 'Avaldsnes', 'Sognefjord'], organization: ['Gulating', 'Frostating', 'Norwegian Leidang', 'Royal Hird'], item: ['Oseberg ship', 'Gokstad ship', 'Gjermundbu helmet', 'soapstone pot'] },
  icelandic: { location: ['Reykjavík', 'Akureyri', 'Thingvellir', 'Westfjords', 'Hekla'], organization: ['Althing', 'Eyrarbakki Guild', 'House of Jónsson'], item: ['rune tablet', 'wool cloak', 'seal ring'] },
  'ancient-greek': { location: ['Athens', 'Sparta', 'Thebes', 'Corinth', 'Delphi', 'Crete', 'Aegean Sea'], organization: ['Athenian Assembly', 'Spartan Agoge', 'House of Atreus', 'Oracle of Delphi'], item: ['hoplon', 'krater', 'laurel crown', 'wax tablet'] },
  'ancient-rome': { location: ['Roma', 'Pompeii', 'Capua', 'Carthage', 'Tiber', 'Palatine Hill'], organization: ['Senate of Rome', 'Legio X', 'House of Julius', 'Praetorian Guard'], item: ['gladius', 'laurel wreath', 'wax tablet', 'signum'] },
  egyptian: { location: ['Thebes', 'Memphis', 'Alexandria', 'Giza', 'Nile Delta', 'Valley of the Kings'], organization: ['House of Ra', 'Temple of Amun', 'Royal Scribes', 'Guard of the Pharaoh'], item: ['ankh', 'papyrus scroll', 'scarab amulet', 'crook and flail'] },
  'india-north': { location: ['Varanasi', 'Delhi', 'Agra', 'Ganga', 'Aravalli'], organization: ['Rajput House', 'Mughal Court', 'Guild of Benares'], item: ['tulwar', 'veena', 'palm-leaf manuscript'] },
  'india-south': { location: ['Madurai', 'Thanjavur', 'Kaveri', 'Malabar', 'Mysore'], organization: ['Chola Court', 'Temple Guild', 'Nair House'], item: ['urumi', 'veena', 'bronze idol'] },
  vietnamese: { location: ['Hà Nội', 'Huế', 'Sài Gòn', 'Mê Kông', 'Sông Hồng'], organization: ['Triều Nguyễn', 'Nha quan lại', 'Hội đồng làng'], item: ['nón lá', 'gươm', 'sáo trúc'] },
  thai: { location: ['Ayutthaya', 'Bangkok', 'Chiang Mai', 'Chao Phraya'], organization: ['Royal Palace', 'Siamese Court', 'Temple Order'], item: ['krabi', 'khon mask', 'lotus lamp'] },
  malay: { location: ['Malacca', 'Aceh', 'Java', 'Sumatra', 'Borneo'], organization: ['Sultanate Court', 'Village Adat', 'Merchant House'], item: ['kris', 'songket', 'ceremonial seal'] },
  filipino: { location: ['Manila', 'Cebu', 'Luzon', 'Mindanao', 'Pasig River'], organization: ['Barangay Council', 'Galleon Company', 'House of Santos'], item: ['bolo', 'sailcloth', 'rosary'] },
  yoruba: { location: ['Ile-Ife', 'Oyo', 'Lagos', 'Niger River'], organization: ['Oyo Palace', 'Orisha Temple', 'Trading Compound'], item: ['talking drum', 'bead crown', 'bronze head'] },
  amharic: { location: ['Gondar', 'Lalibela', 'Addis Ababa', 'Blue Nile'], organization: ['Imperial Court', 'Monastery of Debre', 'Ras House'], item: ['sheba cross', 'shotel', 'parchment'] },
  swahili: { location: ['Zanzibar', 'Mombasa', 'Kilwa', 'Lake Victoria'], organization: ['Sultanate Court', 'Caravan Guild', 'Swahili House'], item: ['kanga', 'dhow sail', 'carved door'] },
  'zulu-xhosa': { location: ['KwaZulu', 'Cape Town', 'Great Fish River', 'Drakensberg'], organization: ['Royal Kraal', 'Clan Council', 'Warrior Regiment'], item: ['assegai', 'shield', 'beadwork'] },
  'north-american': { location: ['Boston', 'New York', 'New Orleans', 'Mississippi', 'Appalachia'], organization: ['Continental Congress', 'Frontier Trading Post', 'House of Wilson'], item: ['musket', 'railway watch', 'family Bible'] },
  mesoamerican: { location: ['Tenochtitlan', 'Palenque', 'Yucatán', 'Lake Texcoco'], organization: ['Eagle House', 'Temple of the Sun', 'Calpulli Council'], item: ['obsidian blade', 'jade mask', 'feather shield'] },
  andean: { location: ['Cusco', 'Quito', 'Lake Titicaca', 'Andes'], organization: ['Inca Ayllu', 'Sun Temple', 'Quipu Keepers'], item: ['quipu', 'sling', 'sun disc'] },
  mongolian: { location: ['Karakorum', 'Orkhon Valley', 'Khovd', 'Uvs Lake', 'Altai Mountains', 'Gobi Desert', 'Onon River', 'Kherlen River'], organization: ['Khan Court', 'Kurultai', 'Keshig Guard', 'Steppe Caravan Guild', 'Orkhon Scribes', 'Horse Breeders Council'], item: ['composite bow', 'gerege', 'morin khuur', 'felt deel', 'silver saddle', 'horsehair banner'] },
}

const additionalReferencePools: Partial<Record<OfflineCulture, Partial<Record<OfflineNameKind, string[]>>>> = {
  tibetan: { location: ['Lhasa', 'Shigatse', 'Namtso', 'Yarlung Tsangpo', 'Kailash'], organization: ['Ganden Monastery', 'Sera Monastery', 'Kashag', 'Caravan Guild'], item: ['thangka', 'prayer wheel', 'khata scarf', 'saddle bag'] },
  arabic: { location: ['Mecca', 'Medina', 'Damascus', 'Baghdad', 'Arabian Desert'], organization: ['Bayt al-Hikma', 'Diwan', 'Caravan Guild', 'Waqf Foundation'], item: ['astrolabe', 'mashrabiya lantern', 'seal ring', 'water skin'] },
  persian: { location: ['Persepolis', 'Isfahan', 'Shiraz', 'Tabriz', 'Dasht-e Kavir'], organization: ['Shah Court', 'Bazaar Guild', 'Caravanserai', 'House of Wisdom'], item: ['shamshir', 'miniature manuscript', 'rosewater flask', 'tile panel'] },
  'turkic-central-asian': { location: ['Samarkand', 'Bukhara', 'Kashgar', 'Tashkent', 'Tian Shan'], organization: ['Khanate Court', 'Kervansaray Guild', 'Steppe Council', 'Silk Road Caravan'], item: ['composite bow', 'kilij', 'felt tent', 'horse blanket'] },
  celtic: { location: ['Tara', 'Kells', 'Connemara', 'Glendalough', 'Shannon'], organization: ['Tuath Council', 'Bardic School', 'Irish Monastic Network', 'Harper Guild'], item: ['Irish harp', 'torc', 'ogham stone', 'penannular brooch'] },
  'slavic-east': { location: ['Kyiv', 'Lviv', 'Chernihiv', 'Dnipro', 'Carpathians'], organization: ['Ruthenian Veche', 'Kievan Druzhina', 'Zaporozhian Sich', 'Kyiv Pechersk Lavra'], item: ['saber', 'icon', 'rushnyk cloth', 'wax seal'] },
  'hausa-fulani': { location: ['Kano', 'Katsina', 'Sokoto', 'Niger Bend', 'Sahel'], organization: ['Emir Court', 'Qurani School', 'Caravan Guild', 'Leatherworkers Guild'], item: ['talking drum', 'leather satchel', 'calabash', 'indigo robe'] },
  'indigenous-north-american': { location: ['Great Lakes', 'Pueblo Mesa', 'Pacific Northwest', 'Plains', 'Four Corners'], organization: ['Tribal Council', 'Clan House', 'Longhouse Council', 'Trading Network'], item: ['beadwork pouch', 'canoe paddle', 'ceremonial drum', 'woven blanket'] },
  polynesian: { location: ['Hawaii', 'Samoa', 'Tahiti', 'Rapa Nui', 'Pacific Ocean'], organization: ['Matai Council', 'Voyaging House', 'Wayfinding School', 'Island Clan'], item: ['outrigger canoe', 'shell lei', 'tapa cloth', 'wooden drum'] },
  manchu: { location: ['Mukden', 'Hetu Ala', 'Jilin', 'Changbai Mountains'], organization: ['Eight Banners', 'Imperial Household', 'Ningguta Office', 'Banner Guild'], item: ['bow case', 'banner seal', 'fur cloak', 'jade belt plaque'] },
  burmese: { location: ['Bagan', 'Mandalay', 'Inle Lake', 'Irrawaddy'], organization: ['Pagan Court', 'Sangha Council', 'Royal Elephant Corps', 'Lacquer Guild'], item: ['thanaka box', 'bronze gong', 'parabaik book', 'cheroot case'] },
  'khmer-lao': { location: ['Angkor', 'Luang Prabang', 'Vientiane', 'Mekong'], organization: ['Angkor Court', 'Lan Xang Court', 'Temple Sangha', 'Silk Guild'], item: ['apsara mask', 'phkak sword', 'buddhist palm leaf book', 'silk sampot'] },
  bengali: { location: ['Dhaka', 'Gaur', 'Chittagong', 'Ganges Delta'], organization: ['Pala Monastery', 'Nawab Court', 'Bengal Weavers Guild', 'Sufi Khanqah'], item: ['jamdani cloth', 'terracotta tablet', 'boatman lamp', 'palm leaf manuscript'] },
  'punjabi-urdu': { location: ['Lahore', 'Amritsar', 'Multan', 'Punjab Plain'], organization: ['Mughal Court', 'Khalsa', 'Sufi Shrine', 'Caravan Guild'], item: ['kirpan', 'phulkari cloth', 'ittar vial', 'calligraphy panel'] },
  'ottoman-turkish': { location: ['Istanbul', 'Bursa', 'Edirne', 'Anatolia'], organization: ['Divan Council', 'Janissary Corps', 'Dervish Lodge', 'Grand Bazaar Guild'], item: ['yatagan', 'tughra seal', 'kaftan', 'iznik tile'] },
  somali: { location: ['Mogadishu', 'Zeila', 'Hargeisa', 'Horn of Africa'], organization: ['Sultanate Court', 'Clan Council', 'Quranic School', 'Frankincense Guild'], item: ['dirac cloth', 'camel saddle', 'incense box', 'poetry staff'] },
  'igbo-akan': { location: ['Kumasi', 'Aba', 'Benin Gulf', 'Volta River'], organization: ['Asante Court', 'Igbo Council', 'Goldsmith Guild', 'Market Women Council'], item: ['kente cloth', 'gold weight', 'uli pot', 'talking drum'] },
  'brazilian-tupi': { location: ['Amazon River', 'Bahia', 'Guarani Lands', 'Atlantic Forest'], organization: ['Tupi Village Council', 'Guarani Mbya', 'Jesuit Mission', 'River Canoe Guild'], item: ['tucum fiber cord', 'ceremonial maraca', 'feather headdress', 'carved bow'] },
  caribbean: { location: ['Havana', 'Port-au-Prince', 'Kingston', 'Lesser Antilles'], organization: ['Island Council', 'Maroon Community', 'Sugar Estate Guild', 'Caribbean Trading House'], item: ['calabash bowl', 'steel pan', 'machete', 'conch shell horn'] },
  maori: { location: ['Aotearoa', 'Rotorua', 'Waitangi', 'South Island'], organization: ['Iwi Council', 'Marae House', 'Waka Society', 'Carving Guild'], item: ['taiaha', 'mere club', 'pounamu pendant', 'woven kete'] },
  'dutch-lowlands': { location: ['Amsterdam', 'Bruges', 'Utrecht', 'Rhine Delta'], organization: ['Hanseatic League', 'States General', 'Guild of Weavers', 'Water Board'], item: ['windmill model', 'canal barge', 'Delft tile', 'merchant ledger'] },
  baltic: { location: ['Vilnius', 'Kaunas', 'Trakai', 'Kernave', 'Nemunas River'], organization: ['Lithuanian Council of Lords', 'Vilnius Cathedral Chapter', 'Lithuanian Chancellery', 'Vilnius University'], item: ['Lithuanian denar', 'kankles', 'woven juosta sash', 'amber brooch'] },
  balkan: { location: ['Belgrade', 'Novi Sad', 'Nis', 'Kragujevac'], organization: ['Serbian National Assembly', 'Matica Srpska', 'Serbian Academy of Sciences and Arts', 'Patriarchate of Pec'], item: ['Serbian gusle', 'Serbian opanak shoes', 'sajkaca cap', 'Pirot kilim'] },
  caucasus: { location: ['Vladikavkaz', 'Alagir', 'Digora', 'Tsey Gorge'], organization: ['North Ossetian State University', 'Museum of Ossetian Literature', 'Ossetian Epic Studies Society', 'North Ossetian State Academic Theatre'], item: ['kisyn fandyr', 'dala fandyr', 'Ossetian ritual table', 'Nart saga anthology'] },
  kurdish: { location: ['Erbil', 'Diyarbakir', 'Hakkari', 'Zagros Mountains'], organization: ['Emirate Court', 'Tribal Council', 'Dervish Lodge', 'Mountain Caravan'], item: ['Kurdish dagger', 'woven kilim', 'daf drum', 'silver belt'] },
  'tamil-telugu': { location: ['Chennai', 'Madurai', 'Hyderabad', 'Coromandel Coast'], organization: ['Chola Court', 'Temple Guild', 'Nayaka Court', 'Sangam Academy'], item: ['veena', 'bronze Nataraja', 'silk sari', 'palm leaf manuscript'] },
  'javanese-sundanese': { location: ['Yogyakarta', 'Surakarta', 'Bandung', 'Borobudur'], organization: ['Majapahit Court', 'Sultanate Kraton', 'Gamelan Guild', 'Village Adat Council'], item: ['kris', 'batik cloth', 'gamelan gong', 'wayang puppet'] },
  'oromo-shona': { location: ['Harar', 'Great Zimbabwe', 'Lake Tana', 'Highveld'], organization: ['Oromo Gadaa Council', 'Shona Chiefdom', 'Stone Builder Guild', 'Coffee Caravan'], item: ['mbira', 'shona stool', 'woven basket', 'cattle bell'] },
  amazonian: { location: ['Manaus', 'Upper Amazon', 'Xingu River', 'Guiana Shield'], organization: ['River Clan Council', 'Forest Trade Network', 'Longhouse Community', 'Rubber Camp'], item: ['blowgun', 'feather crown', 'cassava grater', 'ceremonial maraca'] },
  'hebrew-jewish': { location: ['Jerusalem', 'Tiberias', 'Babylon', 'Galilee'], organization: ['Sanhedrin', 'Beth Din', 'Yeshiva', 'Kehillah Council'], item: ['shofar', 'mezuzah', 'Torah scroll', 'tallit'] },
  assyrian: { location: ['Nineveh', 'Ashur', 'Mosul', 'Upper Mesopotamia'], organization: ['Royal Scribes', 'Temple of Ashur', 'Beth Nahrain Council', 'Caravan House'], item: ['cuneiform tablet', 'lamassu seal', 'reed stylus', 'wool shawl'] },
  romani: { location: ['Danube Road', 'Carpathian Basin', 'Balkan Road', 'Iberian Camp'], organization: ['Kumpania', 'Elder Council', 'Musician Guild', 'Travelling Smiths'], item: ['fiddle', 'brass kettle', 'embroidered sash', 'horse harness'] },
  sami: { location: ['Sápmi', 'Kautokeino', 'Inari', 'Finnmark'], organization: ['Siida Council', 'Reindeer Herding Group', 'Joik Circle', 'Coastal Fishing Camp'], item: ['gákti', 'reindeer sled', 'kuksa cup', 'drum'] },
  'canadian-french': { location: ['Quebec City', 'Montreal', 'Louisiana Road', 'St Lawrence River'], organization: ['Seigneurial Court', 'Coureur des bois Company', 'Parish Council', 'Fur Trade Guild'], item: ['birchbark canoe', 'fleur-de-lis seal', 'wool tuque', 'voyageur sash'] },
  'australian-aboriginal': { location: ['Arnhem Land', 'Kimberley', 'Murray River', 'Uluru'], organization: ['Elder Circle', 'Songline Custodians', 'Clan Gathering', 'Ranger Group'], item: ['didgeridoo', 'coolamon', 'message stick', 'woven dilly bag'] },
  finnish: { location: ['Helsinki', 'Turku', 'Karelia', 'Lake Saimaa'], organization: ['Kalevala Society', 'Forest Cooperative', 'Sámi Trade Camp', 'Boatbuilders Guild'], item: ['kantele', 'puukko knife', 'birchbark cup', 'wool mittens'] },
  'albanian-romanian': { location: ['Tirana', 'Bucharest', 'Transylvania', 'Danube'], organization: ['Voivode Court', 'Mountain Clan Council', 'Orthodox Monastery', 'Carpathian Shepherd Guild'], item: ['gusle', 'shepherd flute', 'embroidered vest', 'silver buckle'] },
  'amazigh-tuareg': { location: ['Atlas Mountains', 'Timbuktu Road', 'Ahaggar', 'Sahara'], organization: ['Ait Council', 'Tuareg Amenokal', 'Salt Caravan', 'Oasis Guild'], item: ['tagelmust veil', 'takouba sword', 'silver fibula', 'leather water skin'] },
  'pashtun-tajik': { location: ['Kabul', 'Pamir', 'Kandahar', 'Hindu Kush'], organization: ['Jirga Council', 'Emir Court', 'Caravanserai Guild', 'Mountain Fort'], item: ['jezail rifle', 'chapkan robe', 'rubab', 'turquoise seal'] },
  'nepali-sinhala': { location: ['Kathmandu', 'Kandy', 'Himalayas', 'Tea Highlands'], organization: ['Malla Court', 'Kandyan Court', 'Temple Sangha', 'Newar Guild'], item: ['khukuri', 'mask', 'brass oil lamp', 'palm leaf book'] },
  inuit: { location: ['Baffin Island', 'Kalaallit Nunaat', 'Arctic Bay', 'Nunavut'], organization: ['Hunting Camp', 'Elder Circle', 'Qaggiq Gathering', 'Coastal Trading Group'], item: ['qajaq', 'ulu knife', 'soapstone lamp', 'seal skin parka'] },
  mapuche: { location: ['Araucania', 'Lake District', 'Bio-Bio River', 'Andes Foothills'], organization: ['Lof Council', 'Machi Circle', 'Mapuche Parliament', 'Weavers Guild'], item: ['kultrun drum', 'trariwe sash', 'silver trapelakucha', 'wooden lance'] },
  'micronesian-fijian': { location: ['Suva', 'Yap', 'Chuuk Lagoon', 'Coral Sea'], organization: ['Chiefly Council', 'Navigation School', 'Kava Circle', 'Canoe House'], item: ['kava bowl', 'tapa cloth', 'outrigger canoe', 'whale tooth pendant'] },
  uyghur: { location: ['Kashgar', 'Turpan', 'Khotan', 'Taklamakan'], organization: ['Khanate Court', 'Bazaar Guild', 'Caravanserai', 'Muqam Ensemble'], item: ['dutar', 'doppa cap', 'atlas silk', 'caravan ledger'] },
  kazakh: { location: ['Almaty', 'Turkistan', 'Saryarka', 'Ili River'], organization: ['Zhuz Council', 'Khan Court', 'Eagle Hunters Guild', 'Steppe Caravan'], item: ['dombra', 'eagle hood', 'felt yurt', 'silver saddle'] },
  kyrgyz: { location: ['Osh', 'Issyk-Kul', 'Tian Shan', 'Naryn'], organization: ['Manaschi Circle', 'Aksakal Council', 'Khan Camp', 'Horse Breeders Guild'], item: ['komuz', 'kalpak hat', 'felt shyrdak', 'horse tack'] },
  uzbek: { location: ['Samarkand', 'Bukhara', 'Khiva', 'Fergana Valley'], organization: ['Timurid Court', 'Madrasa', 'Silk Weavers Guild', 'Caravanserai'], item: ['suzani textile', 'tanbur', 'ceramic bowl', 'astronomical astrolabe'] },
  turkmen: { location: ['Merv', 'Ashgabat', 'Karakum', 'Amu Darya'], organization: ['Tribal Council', 'Carpet Weavers Guild', 'Khan Camp', 'Oasis Market'], item: ['Turkmen carpet', 'akhal-take bridle', 'silver jewelry', 'felt tent'] },
  tajik: { location: ['Dushanbe', 'Panjakent', 'Pamir', 'Zeravshan Valley'], organization: ['Samanid Court', 'Persian Poetry Circle', 'Mountain Caravan', 'Madrasa'], item: ['rubab', 'ikat cloth', 'copper ewer', 'poetry manuscript'] },
  'navajo-apache': { location: ['Diné Bikéyah', 'Four Corners', 'Chiricahua', 'Canyon de Chelly'], organization: ['Chapter House', 'Clan Council', 'Ceremonial Circle', 'Trading Post'], item: ['woven rug', 'turquoise pendant', 'bow', 'medicine bundle'] },
  haudenosaunee: { location: ['Onondaga', 'Mohawk Valley', 'Finger Lakes', 'Longhouse Country'], organization: ['Grand Council', 'Longhouse Clan', 'Wampum Keepers', 'Condolence Council'], item: ['wampum belt', 'lacrosse stick', 'bark canoe', 'corn husk doll'] },
  pueblo: { location: ['Taos', 'Hopi Mesas', 'Zuni', 'Rio Grande', 'Acoma Pueblo', 'Pueblo Bonito', 'Chaco Canyon', 'Mesa Verde', 'Santa Fe Indian Market', 'Jemez Pueblo'], organization: ['Kiva Society', 'Clan Council', 'Potters Guild', 'Ceremonial House', 'Hopi Tribal Council', 'Zuni Tribal Council', 'Acoma Pueblo Council', 'Pueblo Indian Cultural Center', 'Pueblo Governors Council', 'Pueblo language school'], item: ['kachina doll', 'painted pottery', 'cornmeal pouch', 'turquoise mosaic', 'Hopi katsina mask', 'Acoma black-on-white pot', 'Zuni fetish carving', 'Pueblo woven sash', 'turquoise inlay pendant', 'corn husk prayer bundle'] },
  'northwest-coast': { location: ['Haida Gwaii', 'Vancouver Island', 'Tlingit Coast', 'Salish Sea', 'Nuu-chah-nulth Coast', 'Prince Rupert', 'Skeena River', 'Queen Charlotte Sound', 'Kwakwaka’wakw Territory', 'Tsimshian Coast'], organization: ['House Group', 'Potlatch Council', 'Canoe House', 'Carvers Guild', 'Haida Council of Chiefs', 'Tlingit Clan House', 'Kwakwaka’wakw Band Council', 'Coast Salish Longhouse', 'Northwest Coast Indigenous Arts Society', 'Cedar Weavers Guild'], item: ['totem carving', 'cedar canoe', 'copper shield', 'button blanket', 'Haida bentwood box', 'Tlingit Chilkat robe', 'cedar bark basket', 'raven rattle', 'northwest coast dance mask', 'shell nose ring'] },
  maya: { location: ['Tikal', 'Palenque', 'Copan', 'Yucatan'], organization: ['Ajaw Court', 'Calendar Priests', 'Scribes House', 'Ballgame Guild'], item: ['jade mask', 'codex', 'obsidian blade', 'cacao vessel'] },
  nahuatl: { location: ['Tenochtitlan', 'Texcoco', 'Cholula', 'Lake Texcoco'], organization: ['Calpulli Council', 'Eagle Warriors', 'Temple Priests', 'Pochteca Guild'], item: ['macuahuitl', 'feather shield', 'obsidian mirror', 'cacao tribute'] },
  quechua: { location: ['Cusco', 'Sacred Valley', 'Machu Picchu', 'Lake Titicaca'], organization: ['Ayllu Council', 'Quipu Keepers', 'Chasqui Runners', 'Sun Temple'], item: ['quipu', 'tumi', 'qero cup', 'alpaca mantle'] },
  aymara: { location: ['La Paz', 'Altiplano', 'Tiwanaku', 'Lake Titicaca'], organization: ['Ayllu Council', 'Mallku Assembly', 'Highland Weavers', 'Chulpa Keepers'], item: ['aguayo cloth', 'sling', 'chuspa pouch', 'ceramic keru'] },
  'modern-greek': { location: ['Athens', 'Thessaloniki', 'Crete', 'Aegean Sea'], organization: ['Parliament', 'Orthodox Church', 'Shipping Guild', 'Village Council'], item: ['bouzouki', 'olive wreath', 'icon', 'amphora'] },
  portuguese: { location: ['Lisbon', 'Porto', 'Madeira', 'Tagus'], organization: ['Casa da India', 'Royal Court', 'Navigators Guild', 'Azulejo Workshop'], item: ['caravel chart', 'azulejo tile', 'fado guitar', 'wine flask'] },
  balinese: { location: ['Ubud', 'Kuta', 'Mount Agung', 'Bali Sea'], organization: ['Banjar Council', 'Temple Subak', 'Gamelan Troupe', 'Royal Court'], item: ['barong mask', 'kris', 'canang sari', 'songket cloth'] },
  minangkabau: { location: ['Padang', 'Bukittinggi', 'Minangkabau Highlands', 'Indian Ocean'], organization: ['Nagari Council', 'Adat House', 'Surau School', 'Merchant Guild'], item: ['rendang pot', 'songket', 'tengkuluk headdress', 'talempong gong'] },
  akan: { location: ['Kumasi', 'Cape Coast', 'Volta River', 'Gold Coast'], organization: ['Asante Court', 'Stool Council', 'Goldsmith Guild', 'Market Council'], item: ['gold weight', 'kente cloth', 'talking drum', 'stool'] },
  igbo: { location: ['Onitsha', 'Aba', 'Niger River', 'Igboland'], organization: ['Village Assembly', 'Age Grade Council', 'Masquerade Society', 'Market Guild'], item: ['uli pot', 'ogene bell', 'masquerade mask', 'woven basket'] },
  hausa: { location: ['Kano', 'Katsina', 'Zaria', 'Sahel'], organization: ['Emir Court', 'Quranic School', 'Leather Guild', 'Caravan Guild'], item: ['calabash', 'indigo robe', 'talking drum', 'leather satchel'] },
  fulani: { location: ['Futa Jallon', 'Senegal River', 'Sahel', 'Niger Bend'], organization: ['Pastoral Camp', 'Emirate Court', 'Cattle Council', 'Quranic School'], item: ['cattle bell', 'milk calabash', 'leather bag', 'woven mat'] },
  wolof: { location: ['Dakar', 'Saint-Louis', 'Senegambia', 'Atlantic Coast'], organization: ['Kingdom Court', 'Griot Circle', 'Fishing Guild', 'Market Council'], item: ['sabar drum', 'woven cloth', 'calabash bowl', 'silver bracelet'] },
  kongo: { location: ['Mbanza Kongo', 'Congo River', 'Luanda', 'Kongo Highlands'], organization: ['Manikongo Court', 'Clan Council', 'Nkisi Keepers', 'Ivory Guild'], item: ['nkisi figure', 'raffia cloth', 'iron bell', 'carved staff'] },
  azerbaijani: { location: ['Baku', 'Ganja', 'Shirvan', 'Caspian Sea'], organization: ['Khanate Court', 'Mugham Circle', 'Carpet Guild', 'Caravanserai'], item: ['tar lute', 'kelaghayi scarf', 'carpet', 'copper tray'] },
  'chechen-dagestan': { location: ['Grozny', 'Derbent', 'Caucasus Ridge', 'Dagestan'], organization: ['Teip Council', 'Aul Assembly', 'Mountain Guard', 'Carpet Guild'], item: ['kindjal', 'papakha hat', 'wool cloak', 'silver dagger'] },
  hawaiian: { location: ['Honolulu', 'Maui', 'Kauai', 'Pacific Ocean'], organization: ['Alii Court', 'Hula Halau', 'Voyaging Society', 'Fishpond Council'], item: ['ukulele', 'lei', 'outrigger canoe', 'feather cloak'] },
  'samoan-tongan': { location: ['Apia', 'Nuku alofa', 'Savai i', 'South Pacific'], organization: ['Matai Council', 'Tongan Court', 'Kava Circle', 'Canoe House'], item: ['kava bowl', 'tapa cloth', 'war club', 'shell necklace'] },
  polish: { location: ['Krakow', 'Gdansk', 'Warsaw', 'Vistula'], organization: ['Piast Court', 'Noble Sejm', 'Salt Miners Guild', 'Jagiellonian Academy'], item: ['szabla', 'amber cross', 'wycinanki paper', 'wooden zither'] },
  hungarian: { location: ['Buda', 'Pest', 'Debrecen', 'Carpathian Basin'], organization: ['Magyar Diet', 'Hussar Regiment', 'Guild of Tanners', 'Reformed College'], item: ['sabre', 'matyo embroidery', 'csikós whip', 'wine flask'] },
  armenian: { location: ['Ani', 'Yerevan', 'Lake Sevan', 'Ararat'], organization: ['Armenian Apostolic Church', 'Nakharar House', 'Silk Road Caravan', 'Stone Mason Guild'], item: ['duduk', 'khachkar', 'taraz robe', 'silver pomegranate'] },
  georgian: { location: ['Tbilisi', 'Kutaisi', 'Mtskheta', 'Caucasus Range'], organization: ['Bagrationi Court', 'Georgian Orthodox Church', 'Svan Council', 'Wine Guild'], item: ['kindjal', 'panduri', 'qvevri jar', 'tamada horn'] },
  'marathi-gujarati': { location: ['Pune', 'Ahmedabad', 'Surat', 'Western Ghats'], organization: ['Maratha Court', 'Peshwa Office', 'Gujarati Merchant Guild', 'Temple Trust'], item: ['bhala spear', 'bandhani cloth', 'dhol drum', 'palm manuscript'] },
  'kannada-malayalam': { location: ['Mysuru', 'Kochi', 'Hampi', 'Malabar Coast'], organization: ['Mysore Court', 'Temple Guild', 'Nair House', 'Kathakali Troupe'], item: ['urumi', 'chenda drum', 'kasavu cloth', 'bronze lamp'] },
  malagasy: { location: ['Antananarivo', 'Toamasina', 'Highlands', 'Mozambique Channel'], organization: ['Merina Court', 'Fokonolona Council', 'Zafimaniry Guild', 'Coastal Trade House'], item: ['valiha', 'lamba cloth', 'wooden aloalo', 'zebu bell'] },
  'melanesian-australian': { location: ['Port Moresby', 'Vanuatu', 'Torres Strait', 'Arnhem Land'], organization: ['Island Clan Council', 'Longhouse Community', 'Songline Custodians', 'Shell Traders'], item: ['outrigger canoe', 'didgeridoo', 'shell necklace', 'woven pandanus mat'] },
}

const periodLocationNames: Partial<Record<OfflineCulture, Record<string, string[]>>> = {
  chinese: {
    'pre-qin-han': ['咸阳', '临淄', '郢都', '邯郸', '大梁', '会稽', '云梦泽', '函谷关', '河西郡', '上党郡'],
    'wei-jin-tang': ['长安', '洛阳', '建康', '晋阳', '凉州', '益州', '扬州', '雁门关', '玉门关', '终南山'],
    'song-yuan': ['汴京', '临安', '大都', '泉州', '襄阳', '江陵', '姑苏', '太原府', '洞庭湖', '钱塘江'],
    'ming-qing': ['北京', '南京', '苏州府', '杭州府', '广州府', '扬州府', '山海关', '嘉峪关', '漕河', '洞庭湖'],
    republic: ['北平', '南京', '上海', '天津', '武汉', '广州', '青岛', '重庆', '黄浦江', '长江'],
    modern: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '青岛', '苏州'],
  },
  japanese: {
    'asuka-nara': ['飞鸟京', '藤原京', '平城京', '难波宫', '大津宫', '大宰府', '多贺城', '吉野'],
    heian: ['平安京', '山城国', '宇治', '比叡山', '熊野', '奥州平泉', '大宰府', '鸟羽'],
    'kamakura-muromachi': ['镰仓', '京都', '室町', '六波罗', '博多', '堺', '吉野', '足利庄'],
    'sengoku-azuchi': ['安土', '岐阜', '小谷城', '春日山城', '清洲城', '大坂城', '伏见', '堺'],
    edo: ['江户', '大坂', '京都', '长崎', '金泽', '仙台', '日光', '箱根关', '东海道', '箱馆'],
    'meiji-showa': ['东京', '大阪', '京都', '横滨', '神户', '札幌', '广岛', '名古屋', '门司', '小樽'],
    modern: ['东京', '大阪', '京都', '横滨', '札幌', '福冈', '名古屋', '神户', '广岛', '那霸'],
  },
  korean: {
    'three-kingdoms': ['国内城', '丸都城', '平壤城', '慰礼城', '熊津', '泗沘', '金城', '月城'],
    'unified-silla': ['金城', '月城', '中原京', '北原京', '西原京', '南原京', '金官京'],
    goryeo: ['开京', '西京', '东京', '南京', '江都', '碧澜渡', '全州', '济州'],
    'early-joseon': ['汉阳', '开城', '全州', '庆州', '平壤', '咸兴', '景福宫', '昌德宫'],
    'late-joseon': ['汉阳', '水原华城', '江华岛', '全州', '平壤', '开城', '安东', '济州'],
    'korean-empire': ['汉城', '仁川', '釜山', '平壤', '元山', '木浦', '济州', '全州'],
    colonial: ['京城', '釜山', '仁川', '平壤', '元山', '群山', '木浦', '新义州', '咸兴'],
    'south-modern': ['首尔', '釜山', '仁川', '大邱', '光州', '大田', '蔚山', '水原', '全州', '济州'],
    'north-modern': ['平壤', '开城', '咸兴', '清津', '南浦', '元山', '新义州', '罗先', '白头山', '妙香山'],
  },
  english: { medieval: ['York', 'Winchester', 'Canterbury', 'Dover', 'Lincoln', 'Thames'], 'early-modern': ['London', 'Bristol', 'Plymouth', 'Oxford', 'Cambridge'], modern: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'] },
  french: { medieval: ['Paris', 'Rouen', 'Orléans', 'Reims', 'Avignon'], 'ancien-regime': ['Paris', 'Versailles', 'Lyon', 'Bordeaux', 'Marseille'], modern: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'] },
  german: { medieval: ['Köln', 'Nürnberg', 'Aachen', 'Lübeck', 'Regensburg'], 'early-modern': ['Wien', 'Berlin', 'Dresden', 'Hamburg', 'Rhein'], modern: ['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt'] },
  italian: { medieval: ['Roma', 'Venezia', 'Firenze', 'Siena', 'Genova'], renaissance: ['Firenze', 'Venezia', 'Milano', 'Roma', 'Mantova'], modern: ['Roma', 'Milano', 'Napoli', 'Torino', 'Bologna'] },
  iberian: { medieval: ['Toledo', 'León', 'Burgos', 'Zamora', 'Salamanca'], 'early-modern': ['Madrid', 'Sevilla', 'Toledo', 'Granada', 'Valencia'], modern: ['Madrid', 'Barcelona', 'Valencia', 'Bilbao', 'Sevilla'] },
  norse: { viking: ['Kaupang', 'Avaldsnes', 'Borre', 'Gokstad', 'Nidaros'], medieval: ['Bergen', 'Oslo', 'Nidaros', 'Tonsberg', 'Stavanger'], modern: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Tromso'] },
  icelandic: { medieval: ['Thingvellir', 'Skálholt', 'Hólar', 'Borgarfjörður'], modern: ['Reykjavík', 'Akureyri', 'Keflavík', 'Westfjords'] },
  egyptian: { ancient: ['Thebes', 'Memphis', 'Giza', 'Abydos', 'Nile Delta'], ptolemaic: ['Alexandria', 'Memphis', 'Thebes', 'Faiyum'], modern: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'] },
}

type JapaneseCatalogKind = Exclude<OfflineNameKind, 'character'>
type JapanesePeriodReferenceCatalog = Record<JapaneseCatalogKind, string[]>

// Japanese non-person reference data is deliberately isolated by period.
// Earlier versions appended a generic Japanese pool after the selected period,
// which allowed Edo, modern, and ancient terms to appear together.
const japanesePersistentNaturalPlaces = ['富士山', '琵琶湖', '濑户内海']
const japanesePeriodReferenceCatalogs: Record<string, JapanesePeriodReferenceCatalog> = {
  'asuka-nara': {
    location: ['飞鸟京', '藤原京', '平城京', '难波宫', '大津宫', '大宰府', '多贺城', '吉野', ...japanesePersistentNaturalPlaces],
    organization: ['大和朝廷', '太政官', '神祇官', '东大寺', '法隆寺', '兴福寺', '遣唐使', '大宰府政厅'],
    item: ['木简', '和同开珎', '铜镜', '直刀', '百万塔陀罗尼', '正仓院琵琶', '牙笏', '染织幡'],
  },
  heian: {
    location: ['平安京', '山城国', '宇治', '比叡山', '熊野', '奥州平泉', '大宰府', '鸟羽', ...japanesePersistentNaturalPlaces],
    organization: ['太政官', '检非违使厅', '阴阳寮', '藏人所', '院厅', '延历寺', '园城寺', '摄关家'],
    item: ['十二单', '束带', '桧扇', '蒔绘手箱', '和歌卷', '牙笏', '唐镜', '牛车'],
  },
  'kamakura-muromachi': {
    location: ['镰仓', '京都', '室町', '六波罗', '博多', '堺', '吉野', '足利庄', ...japanesePersistentNaturalPlaces],
    organization: ['镰仓幕府', '室町幕府', '六波罗探题', '镰仓府', '五山十刹', '评定众', '引付众', '侍所'],
    item: ['太刀', '胴丸', '大铠', '禅宗墨迹', '猿乐面', '连歌卷', '折乌帽子', '腰刀'],
  },
  'sengoku-azuchi': {
    location: ['安土', '岐阜', '小谷城', '春日山城', '清洲城', '大坂城', '伏见', '堺', '小田原城', '姬路城', ...japanesePersistentNaturalPlaces],
    organization: ['织田家', '丰臣家', '武田家', '上杉家', '毛利家', '岛津家', '堺会合众', '石山本愿寺', '五奉行', '伊贺众'],
    item: ['火绳枪', '当世具足', '阵羽织', '军配', '打刀', '南蛮胴', '马印', '朱印状'],
  },
  edo: {
    location: ['江户', '大坂', '京都', '长崎', '金泽', '仙台', '日光', '箱根关', '东海道', '箱馆', ...japanesePersistentNaturalPlaces],
    organization: ['德川幕府', '老中', '町奉行所', '江户金座', '长崎奉行所', '株仲间', '京都所司代', '寺社奉行'],
    item: ['印笼', '根付', '浮世绘', '小判', '十手', '烟管', '往来手形', '矢立'],
  },
  'meiji-showa': {
    location: ['东京', '大阪', '京都', '横滨', '神户', '札幌', '广岛', '名古屋', '门司', '小樽', ...japanesePersistentNaturalPlaces],
    organization: ['明治政府', '内务省', '帝国议会', '日本银行', '帝国大学', '铁道院', '大审院', '邮便局'],
    item: ['圆银', '学生帽', '怀表', '打字机', '铁路时刻表', '邮便切手', '煤油灯', '留声机'],
  },
  modern: {
    location: ['东京', '大阪', '京都', '横滨', '札幌', '福冈', '名古屋', '神户', '广岛', '那霸', ...japanesePersistentNaturalPlaces],
    organization: ['东京都厅', '国会', '国立国会图书馆', '文化厅', '町内会', '商工会议所', '市役所', '自治会'],
    item: ['新干线车票', '智能交通卡', '文库本', '智能手机', '数码相机', '自动铅笔', '便利店饭团', '折叠伞'],
  },
}

type JapanesePeriodFictionalProfile = {
  modifiers: string[]
  location: Record<OfflineLocationType, string[]>
  organization: string[]
  item: string[]
}

const japanesePeriodFictionalProfiles: Record<string, JapanesePeriodFictionalProfile> = {
  'asuka-nara': {
    modifiers: ['飞鸟', '若草', '朱雀', '白凤', '青丹', '吉野', '山背', '淡海', '葛城', '高市', '石上', '朝仓'],
    location: {
      settlement: ['京', '宫', '里', '乡', '屯仓', '驿家', '国府', '寺内', '河市', '陶邑'],
      region: ['国', '郡', '评', '乡', '原', '野', '河内', '山麓', '泽', '海部'],
      fortress: ['宫垣', '山城', '木栅', '城栅', '关', '戍', '防垒', '烽台', '隘口', '守备所'],
      natural: ['山', '川', '泽', '野', '峰', '谷', '滨', '浦', '岛', '湖'],
    },
    organization: ['朝廷', '造寺司', '国司府', '僧纲所', '遣使团', '锻冶部', '织部', '史生寮', '神祇社', '采女司', '卫士府', '马寮'],
    item: ['木简', '铜镜', '直刀', '瓦当', '经卷', '牙笏', '玉带饰', '琵琶', '墨书', '印章', '药壶', '染织幡'],
  },
  heian: {
    modifiers: ['平安', '紫宸', '朱雀', '葵', '藤影', '月读', '宇治', '嵯峨', '白河', '鸟羽', '若菜', '霞野'],
    location: {
      settlement: ['京坊', '里坊', '庄园', '院町', '寺内', '宿', '渡口', '市庭', '山庄', '别业'],
      region: ['国', '郡', '庄', '御厨', '牧', '原', '野', '山麓', '河内', '海部'],
      fortress: ['馆', '砦', '木户', '关', '垒', '山城', '守馆', '烽台', '隘口', '防所'],
      natural: ['山', '川', '泽', '野', '峰', '谷', '滨', '浦', '岛', '湖'],
    },
    organization: ['院厅', '检非违使厅', '阴阳寮', '藏人所', '摄关家', '歌会', '经师院', '庄园政所', '僧兵院', '神乐所', '绘所', '马寮'],
    item: ['桧扇', '和歌卷', '蒔绘匣', '唐镜', '束带', '女房装束', '笏', '薰香盒', '牛车帘', '琵琶', '经筒', '料纸册'],
  },
  'kamakura-muromachi': {
    modifiers: ['镰仓', '若宫', '鹤冈', '六波罗', '室町', '花御所', '东山', '北山', '白旗', '青莲', '松风', '月轮'],
    location: {
      settlement: ['宿', '津', '寺内町', '门前町', '庄', '乡', '市庭', '港', '驿', '山村'],
      region: ['国', '郡', '庄', '守护领', '御料所', '山地', '河内', '海部', '原', '谷地'],
      fortress: ['馆', '山城', '砦', '木户', '关', '垒', '阵屋', '守护所', '隘口', '烽台'],
      natural: ['山', '川', '谷', '原', '浦', '岛', '湖', '峰', '滩', '岬'],
    },
    organization: ['幕府', '侍所', '政所', '问注所', '评定众', '守护家', '地头众', '五山寺院', '禅院', '连歌会', '座商', '海运众'],
    item: ['太刀', '大铠', '胴丸', '腰刀', '军扇', '禅宗墨迹', '连歌卷', '猿乐面', '折乌帽子', '马具', '经筒', '朱印'],
  },
  'sengoku-azuchi': {
    modifiers: ['安土', '岐阜', '清洲', '春日山', '月山', '白鹭', '赤松', '黑田', '雾隐', '青叶', '松风', '鹤丸'],
    location: {
      settlement: ['城下町', '寺内町', '港町', '宿场', '村', '乡', '津', '市庭', '山村', '铁炮町'],
      region: ['国', '郡', '领', '知行地', '山地', '河谷', '平野', '海部', '岛领', '边境'],
      fortress: ['城', '山城', '平山城', '砦', '阵城', '曲轮', '关', '烽火台', '木户', '隘口'],
      natural: ['山', '川', '谷', '原', '浦', '岛', '湖', '峰', '滩', '岬'],
    },
    organization: ['诸家', '家臣团', '马回众', '铁炮众', '水军', '忍众', '国人一揆', '会合众', '寺社势力', '商人座', '奉行众', '使番众'],
    item: ['火绳枪', '当世具足', '阵羽织', '军配', '打刀', '南蛮胴', '马印', '朱印状', '兵粮袋', '采配', '阵太鼓', '胁差'],
  },
  edo: {
    modifiers: ['江户', '神田', '日本桥', '浅草', '深川', '白鹭', '青叶', '松风', '月见', '镜川', '若竹', '朝日'],
    location: {
      settlement: ['城下町', '宿场町', '门前町', '港町', '村', '新田', '町', '横丁', '河岸', '温泉场'],
      region: ['藩领', '天领', '郡', '代官辖', '山地', '河谷', '平野', '海岸', '岛部', '新田地'],
      fortress: ['城', '阵屋', '关所', '台场', '番所', '木户', '炮台', '藏屋敷', '守备所', '烽火台'],
      natural: ['山', '川', '谷', '原', '浦', '岛', '湖', '峰', '滩', '岬'],
    },
    organization: ['藩', '奉行所', '代官所', '株仲间', '町火消', '飞脚问屋', '寺院', '兰学塾', '札差仲间', '船宿', '同心组', '商会'],
    item: ['印笼', '根付', '小判', '十手', '烟管', '往来手形', '浮世绘', '矢立', '提灯', '算盘', '旅笠', '胁差'],
  },
  'meiji-showa': {
    modifiers: ['明治', '银座', '丸之内', '霞关', '上野', '樱木', '白桦', '朝日', '东云', '青岚', '若松', '瑞穗'],
    location: {
      settlement: ['市', '町', '村', '驿前', '港区', '工场街', '商店街', '官舍街', '温泉町', '铁道町'],
      region: ['府', '县', '郡', '支厅辖', '工业区', '开拓地', '矿区', '沿岸', '平野', '山地'],
      fortress: ['要塞', '炮台', '兵营', '卫戍地', '海防阵地', '弹药库', '关卡', '监视所', '防垒', '军港'],
      natural: ['山', '川', '谷', '原', '浦', '岛', '湖', '峰', '海岸', '岬'],
    },
    organization: ['省', '府厅', '县厅', '铁道院', '银行', '帝国大学', '新闻社', '商工会', '邮便局', '纺织会社', '青年团', '文学会'],
    item: ['怀表', '圆银', '学生帽', '打字机', '铁路时刻表', '邮便切手', '煤油灯', '留声机', '照相机', '皮革书包', '钢笔', '新闻号外'],
  },
  modern: {
    modifiers: ['青叶', '樱川', '若松', '朝日', '白石', '绿丘', '海滨', '东云', '光丘', '瑞穗', '枫台', '星见'],
    location: {
      settlement: ['市', '町', '村', '新区', '团地', '商店街', '站前', '港区', '学园町', '温泉町'],
      region: ['都', '道', '府', '县', '郡', '市辖区', '沿岸区', '工业区', '山地区', '岛屿区'],
      fortress: ['防灾中心', '海防基地', '观测站', '警备所', '避难设施', '训练场', '管制塔', '巡逻站', '仓储基地', '地下掩体'],
      natural: ['山', '川', '谷', '原', '浦', '岛', '湖', '峰', '海岸', '岬'],
    },
    organization: ['市役所', '町内会', '自治会', '株式会社', '商工会议所', '文化协会', '出版社', '大学研究会', '交通局', '观光协会', '志愿者会', '艺术财团'],
    item: ['交通卡', '文库本', '智能手机', '数码相机', '自动铅笔', '折叠伞', '车站便当', '纪念徽章', '通勤月票', '录音笔', '帆布包', '保温杯'],
  },
}

function getJapanesePeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = japanesePeriodFictionalProfiles[period] ?? japanesePeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types
    .filter((type) => !type.includes(modifier) && !modifier.includes(type))
    .map((type) => `${modifier}${type}|${modifier}${type}`))
}

type KoreanPeriodReferenceCatalog = Record<JapaneseCatalogKind, string[]>

const koreanPeriodReferenceCatalogs: Record<string, KoreanPeriodReferenceCatalog> = {
  'three-kingdoms': {
    location: ['国内城', '丸都城', '平壤城', '慰礼城', '熊津', '泗沘', '金城', '月城', '关弥城', '汉江', '锦江'],
    organization: ['高句丽王廷', '高句丽五部会议', '百济佐平会议', '百济十六官部', '新罗和白会议', '新罗花郎徒', '新罗兵部', '新罗执事部'],
    item: ['环头大刀', '金铜冠', '新罗金冠', '百济金铜大香炉', '骑马人物形土器', '木简', '莲花纹瓦当', '铁甲', '复合弓', '骨品文书'],
  },
  'unified-silla': {
    location: ['金城', '月城', '中原京', '北原京', '西原京', '南原京', '金官京', '汉山州', '熊川州', '武珍州', '佛国寺', '石窟庵'],
    organization: ['执事部', '兵部', '仓部', '礼部', '位和府', '司正府', '国学', '花郎徒', '九山禅门'],
    item: ['圣德大王神钟', '无垢净光大陀罗尼经', '统一新罗瓦当', '骨壶', '印花纹土器', '佛国寺舍利具', '铜印', '金铜佛像', '香炉', '木简'],
  },
  goryeo: {
    location: ['开京', '西京', '东京', '南京', '江都', '碧澜渡', '晋州', '全州', '济州', '鸭绿江'],
    organization: ['都兵马使', '中书门下省', '尚书省', '三司', '御史台', '国子监', '三别抄', '僧录司', '开京商团', '八关会'],
    item: ['高丽青瓷', '八万大藏经', '直指', '铜活字', '银嵌铜镜', '高丽铜钱', '螺钿经箱', '佛画', '官印', '马牌'],
  },
  'early-joseon': {
    location: ['汉阳', '景福宫', '昌德宫', '开城', '全州', '庆州', '平壤', '咸兴', '汉江', '鸭绿江'],
    organization: ['议政府', '六曹', '司宪府', '司谏院', '弘文馆', '成均馆', '集贤殿', '内禁卫', '承政院', '义禁府'],
    item: ['训民正音解例本', '测雨器', '自击漏', '浑天仪', '朝鲜通宝', '经国大典', '教旨', '马牌', '白瓷', '官服胸背'],
  },
  'late-joseon': {
    location: ['汉阳', '水原华城', '江华岛', '全州', '平壤', '开城', '安东', '济州', '东莱', '统营'],
    organization: ['奎章阁', '壮勇营', '训练都监', '义禁府', '备边司', '成均馆', '通信使', '东莱府', '宣惠厅', '捕盗厅'],
    item: ['黑笠', '朝鲜白瓷', '大东舆地图', '燕行录', '烟竹', '实学书', '号牌', '马牌', '御宝', '别钱'],
  },
  'korean-empire': {
    location: ['汉城', '仁川', '釜山', '平壤', '元山', '木浦', '济州', '全州', '汉江', '德寿宫'],
    organization: ['大韩帝国皇室', '议政府', '宫内府', '军部', '学部', '汉城电气会社', '独立协会', '大韩医院', '元帅府', '度支部'],
    item: ['大韩帝国护照', '光武年号文书', '白铜货', '太极旗', '西式军服', '汉城电车票', '大韩帝国邮票', '独立新闻', '电话机', '怀表'],
  },
  colonial: {
    location: ['京城', '釜山', '仁川', '平壤', '元山', '群山', '木浦', '新义州', '咸兴', '清津'],
    organization: ['朝鲜总督府', '京城帝国大学', '东亚日报', '朝鲜语学会', '新干会', '京城府厅', '朝鲜银行', '普成专门学校', '梨花学堂', '铁路局'],
    item: ['朝鲜银行券', '户籍誊本', '留声机', '胶鞋', '学生服', '报纸', '京义线车票', '电车票', '钢笔', '配给票'],
  },
  'south-modern': {
    location: ['首尔', '釜山', '仁川', '大邱', '光州', '大田', '蔚山', '水原', '全州', '济州', '汉江', '雪岳山'],
    organization: ['首尔特别市厅', '国会图书馆', '韩国学中央研究院', '居民自治会', '商工会议所', '地铁公社', '文化财团', '出版社', '大学研究所', '广播公司'],
    item: ['交通卡', '智能手机', '地铁票', '学生证', '数码相机', '网络漫画单行本', '保温杯', '折叠伞', '公务员证', '高速铁路车票'],
  },
  'north-modern': {
    location: ['平壤', '开城', '咸兴', '清津', '南浦', '元山', '新义州', '罗先', '白头山', '妙香山', '大同江', '鸭绿江'],
    organization: ['平壤市人民委员会', '科学院', '合作农场', '联合企业所', '文化会馆', '铁道局', '艺术团', '出版社', '综合大学', '人民医院'],
    item: ['列车票', '劳动证', '学生证', '搪瓷饭盒', '收音机', '自行车证', '笔记本', '纪念徽章', '布面书包', '保温瓶'],
  },
}

const koreanNaturalLocationTypes = ['山', '江', '川', '谷', '岭', '峰', '湖', '岛', '浦', '滩']
type KoreanPeriodFictionalProfile = {
  modifiers: string[]
  location: Record<OfflineLocationType, string[]>
  organization: string[]
  item: string[]
}

const koreanPeriodFictionalProfiles: Record<string, KoreanPeriodFictionalProfile> = {
  'three-kingdoms': {
    modifiers: ['卒本', '桂娄', '国内', '丸都', '扶余', '熊津', '泗沘', '月城', '金城', '鸡林', '白山', '汉水'],
    location: {
      settlement: ['城', '都', '邑落', '村', '部落', '王京', '市', '津', '关邑', '山邑'],
      region: ['部', '国', '州', '郡', '原', '谷地', '江域', '山地', '海部', '边地'],
      fortress: ['山城', '城栅', '木栅', '关城', '堡垒', '烽火台', '隘口', '军营', '守备城', '石垒'],
      natural: koreanNaturalLocationTypes,
    },
    organization: ['王廷', '五部会议', '佐平会议', '官部', '和白会议', '花郎徒', '兵部', '工匠部', '商旅团', '祭仪所', '史官所', '守城军'],
    item: ['环头大刀', '金铜冠', '铁甲', '木简', '瓦当', '土器', '铜镜', '复合弓', '箭囊', '马具', '香炉', '印章'],
  },
  'unified-silla': {
    modifiers: ['鸡林', '月城', '金城', '中原', '北原', '西原', '南原', '金官', '佛国', '青丘', '花郎', '白岳'],
    location: {
      settlement: ['京', '小京', '州治', '郡治', '县邑', '村', '寺内', '市', '津', '驿'],
      region: ['州', '郡', '县', '乡', '原', '山地', '江域', '海部', '岛部', '边地'],
      fortress: ['山城', '城栅', '关城', '木栅', '烽火台', '军镇', '守备城', '隘口', '堡垒', '石垒'],
      natural: koreanNaturalLocationTypes,
    },
    organization: ['执事部', '兵部', '仓部', '礼部', '国学', '花郎徒', '禅门', '寺院', '商旅团', '工匠所', '史馆', '守备军'],
    item: ['梵钟', '陀罗尼经', '瓦当', '骨壶', '印花纹土器', '舍利具', '铜印', '金铜佛像', '香炉', '木简', '丝织幡', '马具'],
  },
  goryeo: {
    modifiers: ['松岳', '开京', '碧澜', '西京', '江都', '瑞昌', '白岳', '月华', '瑞京', '莲峰', '清川', '云鹤'],
    location: {
      settlement: ['京', '府', '州', '郡', '县', '村', '津', '驿', '寺内', '港'],
      region: ['道', '界', '州', '郡', '庄', '乡', '山地', '江域', '海部', '岛部'],
      fortress: ['山城', '城郭', '关', '镇', '寨', '烽火台', '军营', '守备所', '隘口', '堡垒'],
      natural: koreanNaturalLocationTypes,
    },
    organization: ['都兵马使', '门下省', '尚书省', '三司', '御史台', '国子监', '别抄军', '僧录司', '商团', '译馆', '工匠所', '海运仓'],
    item: ['青瓷瓶', '大藏经板', '铜活字', '铜镜', '铜钱', '螺钿经箱', '佛画', '官印', '马牌', '香炉', '纸本经卷', '银带钩'],
  },
  'early-joseon': {
    modifiers: ['汉阳', '景福', '昌德', '北岳', '南山', '清溪', '松都', '白岳', '青云', '瑞麟', '玉泉', '云岘'],
    location: {
      settlement: ['府', '牧', '郡', '县', '邑', '村', '驿', '津', '市', '院'],
      region: ['道', '府', '州', '郡', '县', '山地', '江域', '海部', '岛部', '边镇'],
      fortress: ['邑城', '山城', '镇城', '关', '堡', '烽燧', '军营', '水营', '兵营', '隘口'],
      natural: koreanNaturalLocationTypes,
    },
    organization: ['议政府', '六曹', '司宪府', '司谏院', '弘文馆', '成均馆', '集贤殿', '内禁卫', '承政院', '义禁府', '译官院', '惠民署'],
    item: ['训民正音卷', '测雨器', '自击漏', '浑天仪', '铜钱', '法典', '教旨', '马牌', '白瓷', '官服胸背', '官印', '木版书'],
  },
  'late-joseon': {
    modifiers: ['汉阳', '水原', '华城', '江华', '北村', '南村', '清溪', '松岳', '白岳', '青松', '云岘', '月城'],
    location: {
      settlement: ['府', '牧', '郡', '县', '邑', '村', '驿', '浦', '市廛', '院村'],
      region: ['道', '府', '州', '郡', '县', '山地', '江域', '海部', '岛部', '屯田'],
      fortress: ['邑城', '山城', '镇城', '关', '堡', '烽燧', '军营', '水营', '兵营', '炮台'],
      natural: koreanNaturalLocationTypes,
    },
    organization: ['奎章阁', '壮勇营', '训练都监', '义禁府', '备边司', '成均馆', '通信使团', '宣惠厅', '捕盗厅', '书院', '商团', '医局'],
    item: ['黑笠', '白瓷瓶', '舆地图', '燕行录', '烟竹', '实学书', '号牌', '马牌', '御宝', '别钱', '折扇', '官印'],
  },
  'korean-empire': {
    modifiers: ['汉城', '光武', '德寿', '贞洞', '仁川', '龙山', '西大门', '南大门', '太极', '白岳', '独立门', '汉江'],
    location: {
      settlement: ['府', '港', '市街', '电车町', '官舍街', '商店街', '驿前', '学校村', '工场区', '医院街'],
      region: ['府', '郡', '县', '开港场', '矿区', '铁路区', '沿岸', '山地', '江域', '岛部'],
      fortress: ['军营', '炮台', '卫戍地', '关卡', '兵站', '海防阵地', '守备所', '军械库', '烽火台', '训练场'],
      natural: koreanNaturalLocationTypes,
    },
    organization: ['宫内府', '军部', '学部', '度支部', '电气会社', '独立协会', '医院', '元帅府', '邮务司', '银行', '学校', '新闻社'],
    item: ['护照', '光武文书', '白铜货', '太极旗', '西式军服', '电车票', '邮票', '新闻', '电话机', '怀表', '钢笔', '皮书包'],
  },
  colonial: {
    modifiers: ['京城', '钟路', '龙山', '西大门', '南大门', '汉江', '平壤', '新义州', '元山', '木浦', '群山', '清津'],
    location: {
      settlement: ['府', '邑', '面', '里', '驿前', '工场街', '官舍街', '市场', '港区', '矿山町'],
      region: ['道', '府', '郡', '面', '矿区', '铁路区', '沿岸', '山地', '江域', '岛部'],
      fortress: ['兵营', '炮台', '警备所', '关卡', '军械库', '监视所', '海防阵地', '训练场', '防垒', '军港'],
      natural: koreanNaturalLocationTypes,
    },
    organization: ['府厅', '学校', '银行', '报社', '语学会', '青年会', '商会', '铁路局', '医院', '印刷所', '剧场', '工场'],
    item: ['银行券', '户籍誊本', '留声机', '胶鞋', '学生服', '报纸', '铁路车票', '电车票', '钢笔', '配给票', '搪瓷杯', '手提箱'],
  },
  'south-modern': {
    modifiers: ['汉江', '南山', '北村', '青丘', '松坡', '麻浦', '海云', '光化', '瑞草', '松岛', '白云', '济州'],
    location: {
      settlement: ['市', '郡', '区', '邑', '面', '洞', '新城', '站前', '商店街', '港区'],
      region: ['特别市', '广域市', '道', '郡', '区', '产业园区', '沿岸区', '山地区', '岛屿区', '新开发区'],
      fortress: ['防灾中心', '海防基地', '警备所', '观测站', '训练场', '管制塔', '巡逻站', '仓储基地', '地下掩体', '避难设施'],
      natural: koreanNaturalLocationTypes,
    },
    organization: ['市厅', '区厅', '株式会社', '出版社', '大学研究所', '文化财团', '商工会议所', '地铁公社', '居民自治会', '影视制作社', '网络媒体社', '创业中心'],
    item: ['交通卡', '智能手机', '地铁票', '学生证', '数码相机', '漫画单行本', '保温杯', '折叠伞', '公务员证', '高速铁路车票', '帆布包', '无线耳机'],
  },
  'north-modern': {
    modifiers: ['大同江', '牡丹峰', '万景台', '白头', '妙香', '松岳', '清川', '东海', '金刚山', '鸭绿江', '银河', '朝阳'],
    location: {
      settlement: ['市', '郡', '区域', '邑', '里', '劳动者区', '新街', '站前', '港区', '农场村'],
      region: ['直辖市', '特别市', '道', '郡', '区域', '工业地区', '沿岸区', '山地区', '岛屿区', '农业区'],
      fortress: ['防灾指挥所', '海防基地', '警备所', '观测站', '训练场', '管制塔', '巡逻站', '仓储基地', '地下掩体', '避难设施'],
      natural: koreanNaturalLocationTypes,
    },
    organization: ['人民委员会', '联合企业所', '合作农场', '文化会馆', '青年同盟支部', '铁道局', '研究所', '出版社', '艺术团', '人民医院', '学校', '商店'],
    item: ['列车票', '劳动证', '学生证', '搪瓷饭盒', '收音机', '自行车证', '笔记本', '纪念徽章', '布面书包', '保温瓶', '工作手册', '钢笔'],
  },
}

function getKoreanPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = koreanPeriodFictionalProfiles[period] ?? koreanPeriodFictionalProfiles['south-modern']
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types
    .filter((type) => !type.includes(modifier) && !modifier.includes(type))
    .map((type) => `${modifier}${type}|${modifier}${type}`))
}

type StrictPeriodReferenceCatalog = Record<JapaneseCatalogKind, string[]>
type StrictPeriodFictionalProfile = {
  modifiers: string[]
  location: Record<OfflineLocationType, string[]>
  organization: string[]
  item: string[]
}

const earlyAsiaPeriodReferenceCatalogs: Partial<Record<OfflineCulture, Record<string, StrictPeriodReferenceCatalog>>> = {
  chinese: {
    'paleolithic-reference': {
      location: ['元谋人遗址', '西侯度遗址', '泥河湾盆地遗址群', '周口店遗址', '蓝田公王岭遗址', '丁村遗址', '许家窑遗址', '水洞沟遗址', '观音洞遗址', '龙骨坡遗址'],
      organization: ['周口店洞穴居址活动群', '泥河湾盆地石器制造活动区', '西侯度河岸采集活动区', '元谋盆地早期人类活动区', '蓝田黄土台地活动区', '丁村河谷石器活动区', '许家窑遗址石器加工区', '水洞沟石叶技术活动区', '观音洞洞穴活动区', '山顶洞埋葬与居址活动区'],
      item: ['元谋人石制品', '西侯度石器', '匼河石器', '蓝田人石器', '周口店第一地点石器', '周口店用火遗迹', '许家窑石器', '水洞沟石叶技术制品', '山顶洞骨针', '山顶洞穿孔兽牙饰'],
    },
    'neolithic-reference': {
      location: ['仰韶文化遗址群', '半坡遗址', '庙底沟遗址', '大汶口遗址', '良渚古城遗址', '陶寺遗址', '石家河遗址', '红山文化遗址群', '河姆渡遗址', '龙山文化城址群'],
      organization: ['半坡环壕聚落共同体', '姜寨聚落共同体', '良渚古城营建群体', '良渚水利工程营建群体', '陶寺宫城营建群体', '石家河城址共同体', '红山祭祀遗址营建群体', '河姆渡稻作聚落共同体', '大汶口墓地共同体', '龙山城址手工业群体'],
      item: ['仰韶彩陶钵', '半坡人面鱼纹彩陶盆', '良渚玉琮', '良渚玉璧', '红山玉龙', '河姆渡骨耜', '大汶口白陶鬶', '龙山黑陶蛋壳杯', '陶寺彩绘陶簋', '石家河玉人像'],
    },
    'xia-erlitou': {
      location: ['二里头遗址', '二里头宫殿区', '二里头铸铜作坊区', '新砦遗址', '王城岗遗址', '陶寺遗址', '东下冯遗址', '望京楼遗址', '大师姑城址', '南关遗址'],
      organization: ['二里头宫城营建群体', '二里头铸铜作坊', '二里头绿松石器作坊', '二里头宫廷礼仪活动区', '二里头道路与排水营建群体', '二里头墓葬营建群体', '新砦城壕营建群体', '王城岗城址营建群体', '陶寺礼制中心营建群体', '中原早期国家聚落网络'],
      item: ['二里头绿松石龙形器', '二里头铜爵', '二里头镶嵌绿松石铜牌饰', '二里头铜铃', '二里头玉璋', '二里头玉钺', '二里头陶盉', '二里头陶爵', '二里头骨器', '二里头铸铜陶范'],
    },
    'shang-western-zhou': {
      location: ['郑州商城', '偃师商城', '殷墟', '洹北商城', '周原', '丰京', '镐京', '成周洛邑', '燕都琉璃河', '晋都天马—曲村'],
      organization: ['商王室', '商代贞人集团', '商代多子族', '商代妇族武装', '西周王室', '西周宗周六师', '西周成周八师', '西周卿士集团', '西周诸侯国君臣', '西周宗法封建体系'],
      item: ['甲骨卜辞', '后母戊鼎', '妇好鸮尊', '亚长牛尊', '四羊方尊', '大盂鼎', '毛公鼎', '何尊', '虢季子白盘', '西周玉组佩'],
    },
    'eastern-zhou': {
      location: ['雒邑', '临淄', '郢', '新郑', '曲阜', '晋阳', '邯郸', '大梁', '咸阳', '会稽'],
      organization: ['周王室', '齐国稷下学宫', '鲁国三桓', '晋国六卿', '楚国令尹府', '秦国相邦府', '赵国胡服骑射军', '魏国武卒', '墨家团体', '纵横家游士集团'],
      item: ['曾侯乙编钟', '越王勾践剑', '错金银铜壶', '虎符', '竹简策书', '蚁鼻钱', '刀币', '布币', '秦半两钱', '漆木耳杯'],
    },
    'qin-han': {
      location: ['咸阳', '长安', '洛阳', '南阳', '成都', '临淄', '广陵', '敦煌郡', '河西四郡', '交趾郡'],
      organization: ['秦朝廷尉府', '秦御史大夫府', '汉尚书台', '汉太常寺', '汉太学', '汉北军', '汉南军', '西域都护府', '盐铁官营机构', '地方郡县官署'],
      item: ['秦诏版', '秦半两钱', '汉五铢钱', '虎符', '简牍', '帛书', '错金博山炉', '汉式铜镜', '漆耳杯', '玉衣片'],
    },
  },
  'india-north': {
    'vedic-mahajanapada': {
      location: ['俱卢之野|Kurukshetra', '迦尸|Kashi', '憍萨罗|Kosala', '摩揭陀|Magadha', '跋蹉|Vatsa', '阿槃提|Avanti', '健陀罗|Gandhara', '呾叉始罗|Taxila', '毗舍离|Vaishali', '王舍城|Rajagriha'],
      organization: ['俱卢王国|Kuru Kingdom', '般遮罗王国|Panchala Kingdom', '摩揭陀王国|Magadha Kingdom', '憍萨罗王国|Kosala Kingdom', '跋耆联盟|Vajji Confederacy', '释迦族共和体|Shakya gana-sangha', '末罗共和体|Malla gana-sangha', '婆罗门祭司群体|Brahmana ritual specialists', '沙门团体|Shramana communities', '早期佛教僧团|Early Buddhist Sangha'],
      item: ['灰陶文化陶器|Painted Grey Ware', '北方黑光陶|Northern Black Polished Ware', '冲压印记银币|punch-marked coin', '铁制犁铧|iron ploughshare', '铁制斧|iron axe', '铜制水罐|copper lota', '祭火勺|Vedic offering ladle', '棕榈叶书写材料|palm-leaf writing material', '木制战车构件|chariot fitting', '石制印章|stone seal'],
    },
    'maurya-gupta': {
      location: ['华氏城|Pataliputra', '呾叉始罗|Taxila', '优禅尼|Ujjain', '鹿野苑|Sarnath', '菩提伽耶|Bodh Gaya', '桑奇|Sanchi', '那烂陀|Nalanda', '摩偷罗|Mathura', '阿逾陀|Ayodhya', '波罗奈|Varanasi'],
      organization: ['孔雀王朝廷|Mauryan Court', '孔雀帝国官僚体系|Mauryan administration', '阿育王法大官|Dhamma Mahamatras', '孔雀王朝常备军|Mauryan standing army', '笈多王朝廷|Gupta Court', '那烂陀僧团|Nalanda monastic community', '桑奇佛塔僧团|Sanchi monastic community', '城市工商业行会|shreni guild', '婆罗门学舍|Brahmanical gurukula', '地方封土受领集团|samanta retainers'],
      item: ['阿育王石柱诏书|Ashokan pillar edict', '狮子柱头|Lion Capital of Ashoka', '孔雀王朝冲压币|Mauryan punch-marked coin', '桑奇佛塔栏楯|Sanchi stupa railing', '犍陀罗佛像|Gandharan Buddha image', '摩偷罗红砂岩佛像|Mathura Buddha image', '笈多金币|Gupta gold dinar', '铁柱|Gupta iron pillar', '贝叶写本|palm-leaf manuscript', '赤陶印章|terracotta seal'],
    },
  },
  'india-south': {
    'sangam-satavahana': {
      location: ['马杜赖|Madurai', '乌赖尤尔|Uraiyur', '卡维里帕蒂南|Kaveripattinam', '穆吉里斯|Muziris', '卡鲁尔|Karur', '阿里卡梅杜|Arikamedu', '普哈|Puhar', '波丹努尔|Kodumanal', '普拉蒂什塔纳|Pratishthana', '阿马拉瓦蒂|Amaravati'],
      organization: ['早期朱罗王权|Early Chola polity', '早期潘迪亚王权|Early Pandya polity', '早期切拉王权|Early Chera polity', '萨塔瓦哈纳王廷|Satavahana Court', '泰米尔诗人集会|Tamil bardic assembly', '沿海商人集团|maritime merchant group', '耆那教沙门团体|Jain ascetic community', '佛教僧团|Buddhist Sangha', '珠饰工匠群体|bead-making artisans', '罗马贸易港商人群体|Indo-Roman port merchants'],
      item: ['泰米尔婆罗米铭文|Tamil-Brahmi inscription', '黑红陶|Black-and-Red Ware', '阿马拉瓦蒂浮雕板|Amaravati relief slab', '萨塔瓦哈纳铅币|Satavahana lead coin', '罗马金币藏|Roman coin hoard', '红玉髓珠|carnelian bead', '铁制矛头|iron spearhead', '棉织物|cotton textile', '陶制运酒双耳罐|transport amphora', '棕榈叶书写材料|palm-leaf writing material'],
    },
    'early-kingdoms': {
      location: ['建志补罗|Kanchipuram', '巴达米|Badami', '艾霍莱|Aihole', '帕塔达卡尔|Pattadakal', '马哈巴利普拉姆|Mamallapuram', '曼雅凯塔|Manyakheta', '坦贾武尔|Thanjavur', '马杜赖|Madurai', '贝鲁尔|Belur', '恒比|Hampi'],
      organization: ['跋罗婆王廷|Pallava Court', '遮娄其王廷|Chalukya Court', '罗湿陀罗拘陀王廷|Rashtrakuta Court', '早期朱罗王廷|Early Chola Court', '寺庙婆罗门聚落|agrahara settlement', '南印度商人行会|South Indian merchant guild', '村社大会|sabha assembly', '非婆罗门村社大会|ur assembly', '寺庙营建工匠团|temple builders group', '湿婆派修行团体|Shaiva monastic community'],
      item: ['帕拉瓦石窟浮雕|Pallava rock-cut relief', '巴达米石窟铭文|Badami cave inscription', '艾霍莱碑铭|Aihole inscription', '帕塔达卡尔神庙构件|Pattadakal temple element', '南印度铜板诏书|copper-plate charter', '棕榈叶写本|palm-leaf manuscript', '青铜湿婆像|bronze Shiva image', '铁制犁具|iron plough implement', '金制帕戈达币|gold pagoda coin', '花岗岩神像|granite cult image'],
    },
  },
  bengali: {
    'vanga-gauda': {
      location: ['文伽|Vanga', '高达|Gauda', '三摩呾吒|Samatata', '奔那伐弹那|Pundravardhana', '多摩梨帝|Tamralipti', '摩诃萨檀|Mahasthangarh', '瓦里—巴泰什瓦尔|Wari-Bateshwar', '月王国地区|Chandra region', '羯罗拏苏伐剌那|Karnasuvarna', '恒河三角洲|Ganges Delta'],
      organization: ['文伽地方王权|Vanga polity', '高达王廷|Gauda Court', '三摩呾吒王廷|Samatata Court', '奔那伐弹那行政区|Pundravardhana bhukti', '多摩梨帝港商人群体|Tamralipti merchants', '佛教僧团|Buddhist Sangha', '婆罗门土地受领集团|Brahmana donees', '赤陶工匠群体|terracotta artisans', '河港商人行会|river-port guild', '早期波罗王廷|Early Pala Court'],
      item: ['文伽银币|Vanga silver coin', '三摩呾吒金币|Samatata gold coin', '奔那伐弹那赤陶板|Pundravardhana terracotta plaque', '铜板土地诏书|copper-plate land grant', '石制佛像|stone Buddha image', '棕榈叶写本|palm-leaf manuscript', '陶制封泥|terracotta sealing', '铁制农具|iron agricultural tool', '棉织物|cotton textile', '河船木构件|riverboat timber fitting'],
    },
  },
  'marathi-gujarati': {
    'satavahana-western-deccan': {
      location: ['普拉蒂什塔纳|Pratishthana', '纳西克石窟|Nasik Caves', '朱纳尔|Junnar', '卡尔拉石窟|Karla Caves', '坎赫里石窟|Kanheri Caves', '婆卢羯车|Bharuch', '索帕拉|Sopara', '乌禅尼|Ujjain', '吉尔纳尔|Girnar', '纳内加特|Naneghat'],
      organization: ['萨塔瓦哈纳王廷|Satavahana Court', '西部刹帝利王廷|Western Kshatrapa Court', '商人行会|shreni merchant guild', '卡尔拉佛教僧团|Karla Buddhist community', '纳西克佛教僧团|Nasik Buddhist community', '港口关税群体|port customs officials', '象牙工匠群体|ivory workers', '织工行会|weavers guild', '钱币铸造工坊|mint workshop', '岩窟营建施主集团|cave-donor community'],
      item: ['萨塔瓦哈纳铅币|Satavahana lead coin', '西部刹帝利银币|Western Kshatrapa silver coin', '纳内加特铭文|Naneghat inscription', '纳西克石窟铭文|Nasik cave inscription', '卡尔拉石窟柱|Karla cave pillar', '红玉髓珠|carnelian bead', '象牙雕件|ivory carving', '棉织物|cotton textile', '陶制双耳罐|transport amphora', '铜制水罐|copper vessel'],
    },
  },
  'dong-son-au-lac': {
    archaeological: {
      location: ['东山遗址|Dong Son', '古螺城|Co Loa', '越溪船棺墓|Viet Khe', '沱江流域|Da River Basin', '马江流域|Ma River Basin', '红河三角洲|Red River Delta', '老街铜鼓出土地|Lao Cai drum sites', '浪泊|Lang Bac', '梅陂遗址|Mai Pha', '雄王庙考古区|Hung Temple archaeological area'],
      organization: ['东山聚落共同体|Dong Son settlement community', '古螺城营建群体|Co Loa construction community', '红河稻作共同体|Red River rice-farming community', '铜鼓铸造工匠群体|bronze-drum casting artisans', '青铜武器工匠群体|bronze-weapon artisans', '河运舟师群体|river-transport boatmen', '船棺墓葬共同体|boat-coffin burial community', '瓯雒地方王权|Au Lac polity', '山地铜矿采冶群体|upland copper workers', '红河交换网络|Red River exchange network'],
      item: ['东山铜鼓|Dong Son bronze drum', '越溪船棺|Viet Khe boat coffin', '青铜短剑|bronze dagger', '青铜矛头|bronze spearhead', '青铜弩机|bronze crossbow trigger', '铜制坐人灯|kneeling-figure bronze lamp', '羽人纹铜器|feathered-figure bronze vessel', '青铜斧|bronze socketed axe', '陶制纺轮|pottery spindle whorl', '玻璃与玛瑙珠|glass and agate beads'],
    },
  },
  'sa-huynh-champa': {
    'sa-huynh': {
      location: ['沙黄遗址|Sa Huynh', '龙盛遗址|Long Thanh', '广南沿海墓地群|Quang Nam coastal cemeteries', '会安河口|Hoi An estuary', '占婆岛|Cham Islands', '茶曲河流域|Tra Khuc Basin', '秋盆河流域|Thu Bon Basin', '芽庄湾|Nha Trang Bay', '潘郎平原|Phan Rang Plain', '崑嵩高原通道|Kon Tum upland route'],
      organization: ['沙黄瓮棺墓葬共同体|Sa Huynh jar-burial community', '沿海航海群体|coastal seafaring community', '珠饰工匠群体|bead-making artisans', '铁器锻造群体|iron-working artisans', '盐业交换群体|salt-trading community', '秋盆河交换网络|Thu Bon exchange network', '岛屿采集共同体|island collecting community', '山海交换群体|upland-coastal exchange community', '陶器制作群体|pottery-making community', '南海贸易节点群体|South China Sea trade-node community'],
      item: ['沙黄瓮棺|Sa Huynh burial jar', '双兽头耳坠|lingling-o double-headed pendant', '三突耳坠|three-pointed earring', '铁制长剑|iron sword', '铁制矛头|iron spearhead', '红玉髓珠|carnelian bead', '玻璃珠|glass bead', '陶制纺轮|pottery spindle whorl', '青铜铃|bronze bell', '黑红陶罐|black-and-red pottery jar'],
    },
    'early-champa': {
      location: ['狮子城|Simhapura', '因陀罗补罗|Indrapura', '美山圣地|My Son Sanctuary', '茶荞城|Tra Kieu', '芽庄古塔区|Nha Trang temple area', '潘郎|Panduranga', '宾童龙|Panduranga plain', '古笪罗|Kauthara', '秋盆河谷|Thu Bon Valley', '占婆岛港|Cham Islands port'],
      organization: ['林邑王廷|Linyi Court', '早期占婆王廷|Early Champa Court', '美山湿婆神庙群|My Son Shaiva sanctuary', '婆罗门祭司团|Brahmanical priesthood', '占婆海上商人群体|Cham maritime merchants', '碑铭书记群体|inscriptional scribes', '砖塔营建工匠团|brick-temple builders', '象军|elephant corps', '港市关税群体|port customs group', '地方贵族侍从集团|regional elite retainers'],
      item: ['武圣谷碑|Vo Canh inscription', '美山碑铭|My Son inscription', '湿婆林伽|Shiva linga', '占婆砖雕|Cham brick carving', '砂岩神像|sandstone cult image', '金制顶饰|gold diadem', '海船锚石|stone anchor', '棕榈叶写本|palm-leaf manuscript', '仪式水罐|ritual ewer', '占婆陶罐|Cham pottery jar'],
    },
  },
  'funan-chenla': {
    funan: {
      location: ['俄厄港|Oc Eo', '安江波雷|Angkor Borei', '巴特山|Ba The', '湄公河三角洲|Mekong Delta', '扶南港市遗址群|Funan port sites', '波农多哥|Phnom Da', '茶乔|Tra Kieu trade route', '洞里萨南缘|Southern Tonle Sap', '巴萨河|Bassac River', '豆蔻山通道|Cardamom route'],
      organization: ['扶南王廷|Funan Court', '俄厄港商人群体|Oc Eo merchants', '婆罗门祭司团|Brahmanical priesthood', '佛教僧团|Buddhist Sangha', '运河营建群体|canal-building community', '金匠群体|goldsmith artisans', '珠饰工匠群体|bead-making artisans', '港市关税群体|port customs group', '地方首领侍从集团|local chiefly retainers', '南海贸易网络|South China Sea trade network'],
      item: ['扶南金叶铭片|inscribed gold leaf', '俄厄玻璃珠|Oc Eo glass bead', '罗马金币仿制品|Roman coin imitation', '印度式印章|Indic seal', '金制戒指|gold ring', '石制林伽|stone linga', '木构运河桩|canal timber pile', '陶制带流壶|spouted earthenware vessel', '锡制护符|tin amulet', '砂岩佛像|sandstone Buddha image'],
    },
    chenla: {
      location: ['伊奢那补罗|Isanapura', '婆伐补罗|Bhavapura', '湿婆城|Shresthapura', '森波雷古|Sambor Prei Kuk', '上丁|Stung Treng', '占巴塞|Champasak', '瓦普寺区|Vat Phou region', '洞里萨湖|Tonle Sap', '湄公河中游|Middle Mekong', '荔枝山|Phnom Kulen'],
      organization: ['真腊王廷|Chenla Court', '伊奢那补罗王室|Isanapura royal house', '湿婆神庙祭司团|Shaiva temple priesthood', '土地捐赠受领团体|land-grant beneficiaries', '碑铭书记群体|inscriptional scribes', '象军|elephant corps', '水利营建群体|hydraulic builders', '地方首领侍从集团|regional chiefly retainers', '寺庙奴仆群体|temple service community', '湄公河商旅群体|Mekong traders'],
      item: ['森波雷古砖塔构件|Sambor Prei Kuk brick element', '梵文碑铭|Sanskrit inscription', '古高棉文碑铭|Old Khmer inscription', '湿婆林伽|Shiva linga', '杜尔迦石像|Durga stone image', '毗湿奴石像|Vishnu stone image', '铜制仪式铃|bronze ritual bell', '石制门楣|sandstone lintel', '棕榈叶写本|palm-leaf manuscript', '铜制水罐|bronze ewer'],
    },
  },
  'pyu-city-states': {
    pyu: {
      location: ['室利差呾罗|Sri Ksetra', '毗湿奴城|Beikthano', '诃林城|Halin', '密谟|Maingmaw', '宾迦|Binnaka', '伊洛瓦底江中游|Middle Irrawaddy', '卑谬|Prome', '皎克西平原|Kyaukse Plain', '萨蒙河谷|Samon Valley', '木各具河谷|Mu River Valley'],
      organization: ['室利差呾罗王廷|Sri Ksetra Court', '骠人城邦王权|Pyu city-state polity', '佛教僧团|Buddhist Sangha', '城墙营建群体|city-wall builders', '灌溉水利群体|irrigation community', '骠文书记群体|Pyu scribes', '银币铸造群体|silver-mint workers', '火葬瓮制作群体|funerary-urn artisans', '河运商人群体|river merchants', '城门守卫群体|city-gate guards'],
      item: ['骠文火葬瓮|Pyu inscribed funerary urn', '骠文金叶经|Pyu gold-leaf text', '银制旭日币|silver rising-sun coin', '佛塔砖铭|stupa brick inscription', '赤陶奉献板|terracotta votive tablet', '玻璃珠|glass bead', '青铜佛像|bronze Buddha image', '石制法轮|stone dharmachakra', '铁制农具|iron agricultural tool', '陶制骨灰瓮|ceramic funerary urn'],
    },
  },
  'dvaravati-mon': {
    dvaravati: {
      location: ['佛统|Nakhon Pathom', '乌通|U Thong', '古城府|Mueang Fa Daet', '古布阿|Khu Bua', '华富里|Lopburi', '西贴|Si Thep', '那空沙旺古城|Nakhon Sawan ancient town', '湄南河下游|Lower Chao Phraya', '湄公河谷西缘|Western Mekong fringe', '南奔|Hariphunchai'],
      organization: ['堕罗钵底城邦王权|Dvaravati city-state polity', '孟人佛教僧团|Mon Buddhist Sangha', '法轮奉献群体|dharmachakra donor community', '城壕营建群体|moat-building community', '赤陶工匠群体|terracotta artisans', '银币铸造群体|silver-mint workers', '碑铭书记群体|inscriptional scribes', '河运商人群体|river merchants', '地方首领侍从集团|local chiefly retainers', '寺院营建工匠团|monastery builders'],
      item: ['堕罗钵底石法轮|Dvaravati stone dharmachakra', '卧鹿石雕|crouching-deer sculpture', '巴利文银币|Pali-inscribed silver coin', '孟文碑铭|Old Mon inscription', '赤陶奉献板|terracotta votive tablet', '灰泥佛像|stucco Buddha image', '石制界石|stone sema', '青铜佛像|bronze Buddha image', '陶制印模|terracotta mould', '玻璃珠|glass bead'],
    },
  },
  'old-malay-srivijaya': {
    kedah: {
      location: ['布秧谷|Bujang Valley', '双溪峇都|Sungai Batu', '吉打峰|Mount Jerai', '瓜拉姆达河口|Kuala Muda Estuary', '樟仑|Chuping', '古吉打港区|Ancient Kedah port zone', '马六甲海峡北口|Northern Malacca Strait', '霹雳河口|Perak Estuary', '吉兰丹河谷|Kelantan Valley', '狼牙脩相关港区|Langkasuka port region'],
      organization: ['古吉打港市共同体|Ancient Kedah port community', '双溪峇都冶铁群体|Sungai Batu iron workers', '布秧谷寺庙营建群体|Bujang Valley temple builders', '海峡航海商人群体|strait seafaring merchants', '森林产品交换群体|forest-product traders', '铁锭生产群体|iron-ingot producers', '港口引航群体|harbour pilots', '婆罗门祭祀群体|Brahmanical ritual community', '佛教僧团|Buddhist Sangha', '河口仓储群体|estuary warehouse community'],
      item: ['双溪峇都铁锭|Sungai Batu iron ingot', '布秧谷砖寺构件|Bujang Valley brick shrine element', '红玉髓珠|carnelian bead', '玻璃珠|glass bead', '石制林伽|stone linga', '佛教奉献板|Buddhist votive tablet', '陶制储藏罐|ceramic storage jar', '海船木构件|seagoing ship timber', '印度式印章|Indic seal', '铜制仪式器|bronze ritual vessel'],
    },
    srivijaya: {
      location: ['巨港|Palembang', '穆阿罗占碑|Muaro Jambi', '科塔卡普尔|Kota Kapur', '格杜干武吉|Kedukan Bukit', '塔朗图沃|Talang Tuwo', '加朗布拉希|Karang Brahi', '马六甲海峡|Malacca Strait', '邦加岛|Bangka Island', '占碑河|Batang Hari', '猜耶|Chaiya'],
      organization: ['室利佛逝王廷|Srivijaya Court', '三佛齐港市网络|Srivijaya port network', '佛教僧团|Buddhist Sangha', '古马来文书记群体|Old Malay scribes', '海军舟师群体|naval boatmen', '港口关税群体|port customs group', '香料商人群体|spice merchants', '寺院学问共同体|monastic scholarly community', '河口仓储群体|estuary warehouse community', '王室盟誓仪式群体|royal oath community'],
      item: ['格杜干武吉碑|Kedukan Bukit inscription', '塔朗图沃碑|Talang Tuwo inscription', '科塔卡普尔碑|Kota Kapur inscription', '古马来文石碑|Old Malay stone inscription', '金制佛像|gold Buddha image', '青铜观音像|bronze Avalokiteshvara', '中国陶瓷贸易品|Chinese trade ceramic', '海船缝合木板|sewn-plank ship timber', '红玉髓珠|carnelian bead', '树脂与香料货包|resin and spice cargo'],
    },
  },
  'old-javanese-medang': {
    kalingga: {
      location: ['中爪哇北岸|North Coast of Central Java', '哲帕拉海岸|Jepara Coast', '塔鲁马河流域|Tarumanagara river basin', '巴都加亚|Batujaya', '芝阿鲁顿|Ciaruteun', '迪昂高原|Dieng Plateau', '格杜平原|Kedu Plain', '普拉桑岸河谷|Progo Valley', '伯加西河口|Bekasi Estuary', '巽他海峡|Sunda Strait'],
      organization: ['诃陵地方王权|Kalingga polity', '塔鲁马王廷|Tarumanagara Court', '婆罗门祭司团|Brahmanical priesthood', '佛教僧团|Buddhist Sangha', '梵文碑铭书记群体|Sanskrit inscriptional scribes', '稻作灌溉共同体|irrigated-rice community', '沿海商人群体|coastal merchants', '石刻工匠群体|stone-carving artisans', '寺庙营建群体|temple-building community', '地方首领侍从集团|local chiefly retainers'],
      item: ['芝阿鲁顿碑|Ciaruteun inscription', '图古碑|Tugu inscription', '梵文石碑|Sanskrit stone inscription', '毗湿奴足印石|Vishnu footprint stone', '早期石制林伽|early stone linga', '赤陶奉献板|terracotta votive tablet', '玻璃珠|glass bead', '铁制农具|iron agricultural tool', '陶制储藏罐|ceramic storage jar', '金箔供物|gold-foil offering'],
    },
    medang: {
      location: ['普兰巴南平原|Prambanan Plain', '婆罗浮屠|Borobudur', '塞乌寺|Sewu', '门杜寺|Mendut', '帕翁寺|Pawon', '迪昂高原|Dieng Plateau', '格杜平原|Kedu Plain', '拉图博科|Ratu Boko', '东爪哇布兰塔斯河谷|Brantas Valley', '卡胡里潘|Kahuripan'],
      organization: ['古马打兰王廷|Medang Court', '夏连特拉王室|Sailendra royal house', '湿婆派寺院群|Shaiva temple community', '大乘佛教僧团|Mahayana Buddhist Sangha', '古爪哇文书记群体|Old Javanese scribes', '寺庙营建工匠团|temple builders', '灌溉村社共同体|irrigation village community', '西马免税地共同体|sima land community', '王室侍从集团|royal retainers', '海陆商人群体|maritime and inland merchants'],
      item: ['仓伽尔碑|Canggal inscription', '卡拉桑碑|Kalasan inscription', '曼提亚希碑|Mantyasih inscription', '古爪哇铜板诏书|Old Javanese copperplate charter', '婆罗浮屠浮雕板|Borobudur relief panel', '普兰巴南石雕|Prambanan stone carving', '金制神像|gold cult image', '青铜仪式铃|bronze ritual bell', '棕榈叶写本|lontar manuscript', '石制灌溉标记|stone irrigation marker'],
    },
  },
  'old-bali': {
    pejeng: {
      location: ['佩坚|Pejeng', '贝都鲁|Bedulu', '塔姆帕克西林|Tampaksiring', '巴厘中部高地|Central Bali Highlands', '巴图尔火山口|Batur Caldera', '阿贡山麓|Mount Agung Foothills', '佩塔努河谷|Petanu Valley', '帕克里桑河谷|Pakerisan Valley', '吉安雅平原|Gianyar Plain', '萨努尔海岸|Sanur Coast'],
      organization: ['佩坚聚落共同体|Pejeng settlement community', '青铜鼓铸造群体|bronze-drum casting artisans', '稻作灌溉共同体|irrigated-rice community', '石棺墓葬共同体|sarcophagus burial community', '山海交换群体|upland-coastal exchange community', '珠饰工匠群体|bead-making artisans', '陶器制作群体|pottery-making community', '石雕工匠群体|stone-carving artisans', '海岸航海群体|coastal seafaring community', '祖先祭祀共同体|ancestor-ritual community'],
      item: ['佩坚之月铜鼓|Moon of Pejeng drum', '青铜鼓碎片|bronze-drum fragment', '石棺|stone sarcophagus', '青铜斧|bronze socketed axe', '铁制工具|iron tool', '玻璃珠|glass bead', '红玉髓珠|carnelian bead', '陶制随葬罐|ceramic grave jar', '石制祖灵像|stone ancestor figure', '金制耳饰|gold ear ornament'],
    },
    warmadewa: {
      location: ['辛哈曼陀瓦王宫区|Singhamandawa court area', '塔姆帕克西林|Tampaksiring', '古农卡维|Gunung Kawi', '贝沙基寺区|Besakih temple region', '巴图尔湖|Lake Batur', '萨努尔|Sanur', '布兰琼|Blanjong', '佩塔努河谷|Petanu Valley', '帕克里桑河谷|Pakerisan Valley', '古巴厘北岸港区|Old Bali north-coast ports'],
      organization: ['瓦尔马德瓦王廷|Warmadewa Court', '古巴厘王室|Old Balinese royal house', '布兰琼碑铭书记群体|Blanjong inscriptional scribes', '湿婆派祭司团|Shaiva priesthood', '佛教僧团|Buddhist Sangha', '苏巴克灌溉共同体|early subak irrigation community', '寺庙营建工匠团|temple builders', '铜板诏书书记群体|copperplate scribes', '港市商人群体|port merchants', '地方村社共同体|village assembly'],
      item: ['布兰琼柱铭|Blanjong pillar inscription', '古巴厘铜板诏书|Old Balinese copperplate charter', '石制林伽|stone linga', '青铜仪式铃|bronze ritual bell', '金制供物|gold offering', '棕榈叶写本|lontar manuscript', '石窟神龛|rock-cut shrine', '灌溉分水构件|irrigation divider', '陶制供器|ceramic offering vessel', '砂岩神像|sandstone cult image'],
    },
  },
  ...ancientPeriodReferenceCatalogs,
}

Object.assign(earlyAsiaPeriodReferenceCatalogs.japanese ??= {}, ancientPeriodReferenceCatalogs['prehistoric-japan'])
Object.assign(earlyAsiaPeriodReferenceCatalogs.korean ??= {}, ancientPeriodReferenceCatalogs['early-korea'])

function earlySeasiaFictionalProfile(
  modifiers: string[], settlement: string[], region: string[], fortress: string[], natural: string[], organization: string[], item: string[],
): StrictPeriodFictionalProfile {
  return { modifiers, location: { settlement, region, fortress, natural }, organization, item }
}

const earlyAsiaFictionalProfiles: Partial<Record<OfflineCulture, Record<string, StrictPeriodFictionalProfile>>> = {
  chinese: {
    'paleolithic-reference': { modifiers: ['石核', '火塘', '河阶', '砾石', '洞穴', '石叶', '骨针', '旷原', '燧石', '台地'], location: { settlement: ['遗址', '石器活动区', '洞穴居址', '河岸营地'], region: ['河谷活动区', '盆地遗址群', '黄土台地区', '古河道区'], fortress: ['岩棚营地', '高地观察点', '洞口活动区', '石器储料区'], natural: ['河谷', '洞穴', '台地', '砾石滩'] }, organization: ['采集活动群体', '石器加工群体', '狩猎活动群体', '用火活动群体'], item: ['石片', '砍砸器', '刮削器', '石核'] },
    'neolithic-reference': { modifiers: ['河湾', '高台', '稻泽', '玉岭', '陶谷', '石城', '红山', '黑陶', '环壕', '湖畔'], location: { settlement: ['聚落', '城址', '台地', '村落'], region: ['文化区', '河谷区', '湖泽区', '山麓区'], fortress: ['环壕城址', '夯土城址', '高台城址', '围沟聚落'], natural: ['河谷', '湖泽', '山麓', '台地'] }, organization: ['聚落共同体', '玉作工匠群体', '陶作工匠群体', '稻作共同体'], item: ['彩陶钵', '玉琮', '骨耜', '黑陶杯'] },
    'xia-erlitou': { modifiers: ['二里头', '洛水', '伊水', '绿松石', '铜爵', '宫城', '夯土', '夏台', '铸坊', '王畿'], location: { settlement: ['宫城', '城址', '工坊区', '聚落'], region: ['王畿区', '河谷区', '城邑区', '铸铜区'], fortress: ['夯土城垣', '城门遗址', '高台城址', '环壕城址'], natural: ['河谷', '台地', '原野', '水泽'] }, organization: ['宫城营建群体', '铸铜作坊', '绿松石器作坊', '礼仪活动群体'], item: ['铜爵', '玉璋', '铜铃', '绿松石牌饰'] },
    'shang-western-zhou': { modifiers: ['玄鸟', '商丘', '洹水', '宗周', '成周', '青铜', '龟甲', '凤纹', '虎纹', '王畿'], location: { settlement: ['邑', '宗邑', '王邑', '方国邑'], region: ['王畿', '方国', '封国', '牧野'], fortress: ['城邑', '宗城', '边邑', '戍堡'], natural: ['河', '原', '泽', '山'] }, organization: ['王室', '宗族', '贞人集团', '诸侯国'], item: ['鼎', '尊', '卣', '甲骨'] },
    'eastern-zhou': { modifiers: ['青云', '白鹿', '河雍', '兰台', '长风', '玄圃', '赤泉', '松丘', '鸣玉', '丹陵'], location: { settlement: ['邑', '都', '城', '里'], region: ['国', '郡', '封地', '原'], fortress: ['关', '塞', '壁', '城'], natural: ['河', '泽', '山', '原'] }, organization: ['学宫', '客卿府', '武卒营', '工师府'], item: ['剑', '编钟', '竹简', '铜壶'] },
    'qin-han': { modifiers: ['长安', '云中', '河西', '南越', '北地', '上林', '甘泉', '金城', '玄菟', '扶风'], location: { settlement: ['县', '邑', '里', '亭'], region: ['郡', '国', '都护区', '道'], fortress: ['关', '塞', '障', '候官'], natural: ['河', '泽', '山', '原'] }, organization: ['郡府', '都尉营', '太学馆', '盐铁官署'], item: ['简牍', '铜镜', '漆耳杯', '五铢钱'] },
  },
  'india-north': {
    'vedic-mahajanapada': { modifiers: ['恒河', '鹿野', '婆罗树', '白牛', '赤土', '莲池', '孔雀', '雪山', '菩提', '战车'], location: { settlement: ['聚落', '王城', '市镇', '渡口'], region: ['王国', '共和体', '河谷地', '森林地'], fortress: ['城垣', '边寨', '山口堡', '河关'], natural: ['河', '林', '平原', '山麓'] }, organization: ['王廷', '共和议会', '祭司团体', '沙门团体'], item: ['祭火勺', '铁犁', '银币', '灰陶钵'] },
    'maurya-gupta': { modifiers: ['法轮', '狮柱', '孔雀', '恒河', '莲华', '赤砂', '象军', '菩提', '金轮', '石柱'], location: { settlement: ['王城', '港城', '学城', '市镇'], region: ['行省', '封地', '河谷区', '山麓区'], fortress: ['城塞', '边堡', '关城', '军营'], natural: ['河', '林', '平原', '山'] }, organization: ['王廷', '官署', '僧团', '行会'], item: ['石柱诏书', '金币', '佛像', '贝叶经'] },
  },
  'india-south': {
    'sangam-satavahana': { modifiers: ['卡维里', '黑红陶', '珍珠', '檀香', '孔雀', '海风', '棕榈', '赤土', '象牙', '莲港'], location: { settlement: ['王城', '港镇', '村落', '集市'], region: ['王国', '海岸地', '高原地', '河谷地'], fortress: ['城寨', '山堡', '海关', '边营'], natural: ['河', '海湾', '丘陵', '林地'] }, organization: ['王廷', '诗人集会', '商人集团', '僧团'], item: ['铅币', '红玉髓珠', '棉布', '铭文石'] },
    'early-kingdoms': { modifiers: ['石窟', '海岸', '花岗岩', '莲塔', '象军', '棕榈', '铜灯', '山城', '稻河', '檀林'], location: { settlement: ['王城', '寺镇', '港城', '村落'], region: ['王国', '封地', '海岸区', '高原区'], fortress: ['石堡', '山关', '城垣', '边营'], natural: ['河', '海岸', '山', '林'] }, organization: ['王廷', '村社大会', '商人行会', '寺庙工匠团'], item: ['铜板诏书', '石雕', '贝叶经', '铜灯'] },
  },
  bengali: { 'vanga-gauda': { modifiers: ['三角洲', '高达', '文伽', '稻河', '红陶', '莲池', '海港', '雨林', '铜板', '白象'], location: { settlement: ['港城', '河城', '村落', '市镇'], region: ['王国', '行政区', '三角洲地', '河谷地'], fortress: ['城垣', '河堡', '边寨', '港关'], natural: ['河', '三角洲', '林', '海湾'] }, organization: ['王廷', '僧团', '商人行会', '工匠群体'], item: ['银币', '赤陶板', '铜板诏书', '棉布'] } },
  'marathi-gujarati': { 'satavahana-western-deccan': { modifiers: ['西海', '高原', '石窟', '商路', '红玉髓', '棉港', '象牙', '银币', '山关', '河谷'], location: { settlement: ['港城', '山城', '市镇', '村落'], region: ['王国', '总督区', '高原地', '海岸地'], fortress: ['山堡', '关城', '边寨', '港关'], natural: ['高原', '河', '海湾', '山'] }, organization: ['王廷', '僧团', '商人行会', '工匠群体'], item: ['铅币', '银币', '红玉髓珠', '石窟铭文'] } },
  'dong-son-au-lac': {
    archaeological: earlySeasiaFictionalProfile(
      ['羽舟', '稻泽', '红河', '雉纹', '螺城', '青铜', '山铜', '浪泊', '马江', '云鼓'],
      ['环壕聚落', '河岸聚落', '稻作村落', '铸铜聚落', '舟运聚落', '高台聚落', '山口聚落', '湖滨聚落', '墓地聚落', '工匠聚落'],
      ['河谷文化区', '三角洲腹地', '铜矿交换区', '稻作地带', '山海通道', '舟运网络', '铜鼓分布区', '船棺墓葬区', '丘陵边缘地', '湖沼生产区'],
      ['夯土城址', '环壕城址', '河口寨址', '山口寨址', '高台寨址', '木栅聚落', '内城台地', '外城壕区', '守望高地', '舟师泊地'],
      ['河湾', '三角洲', '湖泽', '山麓', '丘陵', '河滩', '铜矿山', '稻田原', '石灰岩谷', '海潮口'],
      ['稻作共同体', '铜鼓铸造群体', '舟师群体', '船棺墓葬共同体', '铜矿采冶群体', '陶作工匠群体', '珠饰交换群体', '城址营建群体', '地方首领侍从群体', '山海交换网络'],
      ['铜鼓', '青铜短剑', '青铜矛头', '青铜弩机', '船棺', '坐人铜灯', '羽人纹铜器', '有肩石斧', '陶制纺轮', '玛瑙珠串'],
    ),
  },
  'sa-huynh-champa': {
    'sa-huynh': earlySeasiaFictionalProfile(
      ['海瓮', '双兽', '三突', '秋盆', '茶曲', '沙岭', '铁潮', '珠港', '岛风', '红陶'],
      ['瓮棺聚落', '滨海村落', '河口聚落', '制珠聚落', '冶铁聚落', '盐业聚落', '岛屿聚落', '高地驿聚落', '陶作聚落', '航海聚落'],
      ['沿海墓葬区', '山海交换区', '河谷交通区', '岛链航行区', '盐业生产区', '铁器传播区', '珠饰贸易区', '高原通道区', '河口港湾区', '海岸平原区'],
      ['土垣聚落', '河口寨址', '海岬守望地', '山口寨址', '木栅聚落', '岛港寨址', '高台寨址', '盐场守望地', '渡口寨址', '仓储围区'],
      ['沙丘', '海湾', '河口', '岛屿', '潟湖', '盐沼', '山口', '河谷', '海岬', '珊瑚滩'],
      ['瓮棺墓葬共同体', '航海群体', '珠饰工匠群体', '冶铁工匠群体', '盐业交换群体', '陶作工匠群体', '岛屿采集群体', '山海交换群体', '河口舟师群体', '墓地祭仪群体'],
      ['瓮棺', '双兽头耳坠', '三突耳坠', '铁制长剑', '铁制矛头', '红玉髓珠', '玻璃珠串', '陶制纺轮', '青铜铃', '黑红陶罐'],
    ),
    'early-champa': earlySeasiaFictionalProfile(
      ['占城', '美山', '秋盆', '狮子', '林邑', '海塔', '象旗', '湿婆', '红砖', '沉香'],
      ['王城', '砖塔城', '河港城', '海港镇', '神庙聚落', '象军驻地', '商旅市镇', '稻作村落', '工匠聚落', '山口驿镇'],
      ['王畿', '河谷领地', '海岸领地', '港市辖区', '神庙领地', '山地通道区', '稻作平原', '象军征发区', '海贸控制区', '碑铭捐献地'],
      ['砖城', '河口堡', '山口堡', '海岸守望塔', '王城门堡', '象军营寨', '港口关城', '神庙护墙', '边地木栅', '舟师泊寨'],
      ['河谷', '海湾', '山口', '海岬', '岛屿', '稻原', '砂岩丘', '河口', '林山', '海岸平原'],
      ['王廷', '婆罗门祭司团', '湿婆神庙群', '海上商人群体', '碑铭书记群体', '砖塔营建工匠团', '象军', '港市关税群体', '地方贵族侍从团', '灌溉共同体'],
      ['砂岩林伽', '砖塔构件', '梵文碑铭', '占语碑铭', '金制顶饰', '仪式水罐', '海船锚石', '棕榈叶写本', '象具铜饰', '陶制储藏罐'],
    ),
  },
  'funan-chenla': {
    funan: earlySeasiaFictionalProfile(
      ['俄厄', '巴特', '湄口', '金叶', '运河', '海贸', '扶南', '香港', '林伽', '珠市'],
      ['港城', '运河聚落', '河口市镇', '王城', '工匠聚落', '稻作村落', '寺庙聚落', '仓储港镇', '渡口聚落', '山麓市镇'],
      ['三角洲腹地', '港市辖区', '运河灌溉区', '王畿', '海贸控制区', '河口盐业区', '山地通道区', '稻作平原', '森林产物区', '寺庙捐献地'],
      ['土城', '河口堡', '运河关寨', '港口关城', '王城门堡', '山口寨', '舟师泊寨', '仓储围区', '木栅聚落', '守望高台'],
      ['三角洲', '河口', '运河', '湖沼', '海湾', '山麓', '红树林', '稻原', '沙洲', '丘陵'],
      ['王廷', '港市商人群体', '婆罗门祭司团', '佛教僧团', '运河营建群体', '金匠群体', '珠饰工匠群体', '港市关税群体', '地方首领侍从团', '南海贸易网络'],
      ['铭文金叶', '玻璃珠串', '仿罗马金币', '印度式印章', '金制戒指', '石制林伽', '运河木桩', '陶制带流壶', '锡制护符', '砂岩佛像'],
    ),
    chenla: earlySeasiaFictionalProfile(
      ['伊奢那', '森波雷', '瓦普', '湄中', '真腊', '象阵', '石门', '湿婆', '铜铃', '洞里萨'],
      ['王城', '砖塔城', '河港镇', '神庙聚落', '稻作村落', '象军驻地', '工匠聚落', '渡口市镇', '山麓聚落', '水利聚落'],
      ['王畿', '河谷领地', '神庙领地', '稻作平原', '山地通道区', '湖岸生产区', '象军征发区', '碑铭捐献地', '水利灌溉区', '边地辖区'],
      ['砖城', '河防堡', '山口堡', '王城门堡', '神庙护墙', '象军营寨', '渡口关寨', '边地木栅', '守望高地', '舟师泊寨'],
      ['河谷', '湖岸', '山麓', '平原', '河岛', '瀑布', '森林', '丘陵', '河口', '湿地'],
      ['王廷', '王室', '湿婆神庙祭司团', '土地受领群体', '碑铭书记群体', '象军', '水利营建群体', '地方首领侍从团', '寺庙役使群体', '湄公河商旅群体'],
      ['砖塔构件', '梵文碑铭', '古高棉文碑铭', '石制林伽', '杜尔迦石像', '毗湿奴石像', '铜制仪式铃', '砂岩门楣', '棕榈叶写本', '铜制水罐'],
    ),
  },
  'pyu-city-states': {
    pyu: earlySeasiaFictionalProfile(
      ['室利城', '骠文', '法轮', '旭日', '伊江', '火瓮', '金叶', '红砖', '稻渠', '白塔'],
      ['圆城', '河港城', '灌溉聚落', '佛塔聚落', '工匠聚落', '稻作村落', '城门市镇', '墓葬聚落', '商旅市镇', '山麓聚落'],
      ['城邦辖区', '灌溉农业区', '河运控制区', '佛教捐献地', '银币流通区', '火葬墓地带', '稻作平原', '山地通道区', '城墙营建区', '河谷交换区'],
      ['圆形城垣', '砖砌城门', '河防堡', '灌渠关寨', '山口寨', '城门守望塔', '佛塔护墙', '边地木栅', '渡口堡', '粮仓围区'],
      ['河谷', '平原', '灌渠', '湖沼', '山麓', '河湾', '稻原', '丘陵', '沙洲', '森林'],
      ['城邦王廷', '佛教僧团', '城墙营建群体', '灌溉共同体', '骠文书记群体', '银币铸造群体', '火葬瓮工匠群体', '河运商人群体', '城门守卫群体', '佛塔营建群体'],
      ['铭文火葬瓮', '金叶经文', '旭日纹银币', '佛塔砖铭', '赤陶奉献板', '玻璃珠串', '青铜佛像', '石制法轮', '铁制农具', '陶制骨灰瓮'],
    ),
  },
  'dvaravati-mon': {
    dvaravati: earlySeasiaFictionalProfile(
      ['法轮', '卧鹿', '湄南', '佛统', '乌通', '古布阿', '银螺', '孟文', '灰泥', '城壕'],
      ['椭圆城', '环壕城', '河港镇', '佛寺聚落', '稻作村落', '工匠聚落', '商旅市镇', '渡口聚落', '山麓聚落', '湖岸聚落'],
      ['城邦辖区', '稻作平原', '河运控制区', '佛教捐献地', '银币流通区', '碑铭分布区', '陶作生产区', '山地通道区', '湖沼生产区', '海湾交换区'],
      ['环壕城垣', '土筑城门', '河防寨', '渡口关寨', '山口堡', '寺院护墙', '边地木栅', '粮仓围区', '港口守望地', '高台寨址'],
      ['河谷', '平原', '湖沼', '河湾', '山麓', '稻原', '海湾', '丘陵', '沙洲', '森林'],
      ['城邦王权', '孟人佛教僧团', '法轮奉献群体', '城壕营建群体', '赤陶工匠群体', '银币铸造群体', '碑铭书记群体', '河运商人群体', '地方首领侍从团', '寺院营建工匠团'],
      ['石制法轮', '卧鹿石雕', '巴利文银币', '古孟文碑铭', '赤陶奉献板', '灰泥佛像', '石制界石', '青铜佛像', '陶制印模', '玻璃珠串'],
    ),
  },
  'old-malay-srivijaya': {
    kedah: earlySeasiaFictionalProfile(
      ['布秧', '双溪', '吉打峰', '铁炉', '北峡', '红玉', '河仓', '海舶', '石祠', '季风'],
      ['河口港市', '冶铁聚落', '寺庙聚落', '仓储港镇', '航海聚落', '森林产物市镇', '稻作村落', '工匠聚落', '山麓聚落', '渡口聚落'],
      ['港市腹地', '冶铁生产区', '海峡航行区', '森林产物区', '河口仓储区', '寺庙捐献地', '稻作平原', '山地通道区', '珠饰贸易区', '海岸交换区'],
      ['港口关寨', '河口守望地', '山口寨', '仓储围区', '木栅聚落', '寺庙护墙', '渡口堡', '冶铁工坊围区', '海岬守望塔', '粮仓围区'],
      ['河口', '海峡', '山麓', '海湾', '红树林', '稻原', '丘陵', '沙洲', '森林', '溪谷'],
      ['港市共同体', '冶铁工匠群体', '寺庙营建群体', '海峡航海商人群体', '森林产物交换群体', '铁锭生产群体', '港口引航群体', '婆罗门祭祀群体', '佛教僧团', '河口仓储群体'],
      ['铁锭', '砖寺构件', '红玉髓珠', '玻璃珠串', '石制林伽', '佛教奉献板', '陶制储藏罐', '海船木构件', '印度式印章', '铜制仪式器'],
    ),
    srivijaya: earlySeasiaFictionalProfile(
      ['巨港', '占碑', '格杜干', '塔朗', '邦加', '海峡', '金佛', '古马来', '香货', '河舰'],
      ['河港王城', '港市', '寺院聚落', '仓储港镇', '河口市镇', '航海聚落', '工匠聚落', '稻作村落', '商旅市镇', '岛屿港镇'],
      ['王畿', '港市网络区', '海峡控制区', '寺院捐献地', '香料集散区', '河口仓储区', '岛链航行区', '森林产物区', '稻作腹地', '盟誓辖区'],
      ['河口堡', '港口关城', '舟师泊寨', '王城门堡', '仓储围区', '岛港守望塔', '渡口关寨', '寺院护墙', '边地木栅', '山口寨'],
      ['河口', '海峡', '岛屿', '河谷', '红树林', '海湾', '沙洲', '稻原', '丘陵', '森林'],
      ['王廷', '港市网络', '佛教僧团', '古马来文书记群体', '海军舟师群体', '港口关税群体', '香料商人群体', '寺院学问共同体', '河口仓储群体', '王室盟誓群体'],
      ['古马来文石碑', '盟誓碑', '金制佛像', '青铜观音像', '中国贸易陶瓷', '缝合木板船构件', '红玉髓珠', '树脂货包', '香料货包', '棕榈叶写本'],
    ),
  },
  'old-javanese-medang': {
    kalingga: earlySeasiaFictionalProfile(
      ['北岸', '诃陵', '迪昂', '格杜', '稻河', '石祠', '海风', '湿婆', '古爪哇', '山寺'],
      ['海岸港镇', '山麓聚落', '寺庙聚落', '稻作村落', '河谷市镇', '工匠聚落', '渡口聚落', '商旅市镇', '高原聚落', '王城'],
      ['海岸辖区', '山地寺庙区', '稻作平原', '河谷交通区', '港市腹地', '碑铭捐献地', '森林产物区', '火山山麓区', '海峡航行区', '王畿'],
      ['山口寨', '河口堡', '港口关寨', '木栅聚落', '寺庙护墙', '王城门堡', '渡口寨', '守望高地', '粮仓围区', '海岬守望塔'],
      ['火山', '高原', '河谷', '海岸', '稻原', '森林', '山麓', '河口', '海湾', '湖泊'],
      ['地方王廷', '湿婆祭司团', '佛教僧团', '碑铭书记群体', '稻作共同体', '港市商人群体', '石祠营建工匠团', '灌溉共同体', '地方首领侍从团', '山海交换群体'],
      ['梵文碑铭', '古马来文碑铭', '石制林伽', '赤陶奉献板', '金制供物', '铁制农具', '陶制储藏罐', '海船木构件', '石祠构件', '玻璃珠串'],
    ),
    medang: earlySeasiaFictionalProfile(
      ['马打兰', '普兰巴南', '婆罗浮屠', '格杜', '默拉皮', '拉凯', '古爪哇', '石塔', '稻渠', '王印'],
      ['王城', '寺庙城', '稻作村落', '灌溉聚落', '河谷市镇', '工匠聚落', '商旅市镇', '山麓聚落', '渡口聚落', '港镇'],
      ['王畿', '神庙领地', '稻作平原', '火山山麓区', '灌溉农业区', '碑铭捐献地', '港市辖区', '河谷交通区', '边地辖区', '森林产物区'],
      ['石砌城门', '山口堡', '河防寨', '王城门堡', '神庙护墙', '渡口关寨', '边地木栅', '粮仓围区', '守望高地', '舟师泊寨'],
      ['火山', '河谷', '高原', '稻原', '湖泊', '森林', '山麓', '河口', '海岸', '丘陵'],
      ['王廷', '湿婆神庙祭司团', '佛教僧团', '古爪哇文书记群体', '寺庙营建工匠团', '灌溉共同体', '土地受领群体', '商人群体', '王室侍从团', '村社共同体'],
      ['石制神庙构件', '古爪哇文碑铭', '铜板诏书', '石制林伽', '青铜佛像', '金制供物', '棕榈叶写本', '灌溉分水构件', '陶制储藏罐', '王室印章'],
    ),
  },
  'old-bali': {
    pejeng: earlySeasiaFictionalProfile(
      ['佩坚', '月轮', '铜鼓', '石棺', '山泉', '青铜', '稻泽', '海岬', '火山', '岩村'],
      ['山麓聚落', '稻作村落', '石棺墓地聚落', '铸铜聚落', '河谷聚落', '海岸聚落', '高台聚落', '工匠聚落', '湖滨聚落', '洞穴聚落'],
      ['铜鼓分布区', '石棺墓葬区', '稻作地带', '山海交换区', '火山山麓区', '河谷交通区', '海岸交换区', '青铜生产区', '湖滨生产区', '洞穴祭仪区'],
      ['高台寨址', '山口寨', '河谷木栅', '海岬守望地', '石墙聚落', '粮仓围区', '渡口寨', '湖滨寨址', '洞口守望地', '稻田护寨'],
      ['火山', '湖泊', '河谷', '山泉', '稻原', '海岸', '海岬', '洞穴', '丘陵', '山麓'],
      ['稻作共同体', '铜鼓铸造群体', '石棺墓葬共同体', '青铜工匠群体', '山海交换群体', '陶作工匠群体', '石工群体', '河谷舟师群体', '祭仪群体', '湖滨采集群体'],
      ['佩坚式铜鼓', '石棺', '青铜斧', '青铜饰件', '陶制纺轮', '石制锛', '玻璃珠串', '陶制储藏罐', '骨制工具', '石制祭器'],
    ),
    warmadewa: earlySeasiaFictionalProfile(
      ['布兰琼', '瓦尔马', '帕克里桑', '佩塔努', '巴图尔', '古农卡维', '铜板', '湿婆', '稻渠', '海港'],
      ['王城', '寺庙聚落', '稻作村落', '灌溉聚落', '河谷市镇', '海岸港镇', '工匠聚落', '山麓聚落', '商旅市镇', '渡口聚落'],
      ['王畿', '神庙领地', '灌溉农业区', '稻作平原', '河谷交通区', '海岸辖区', '碑铭捐献地', '火山山麓区', '港市腹地', '村社辖区'],
      ['王城门堡', '山口寨', '河防寨', '港口关寨', '寺庙护墙', '渡口堡', '边地木栅', '粮仓围区', '守望高地', '舟师泊寨'],
      ['火山', '湖泊', '河谷', '山泉', '稻原', '海岸', '海湾', '森林', '丘陵', '山麓'],
      ['王廷', '王室', '铜板书记群体', '湿婆祭司团', '佛教僧团', '灌溉共同体', '寺庙营建工匠团', '港市商人群体', '地方村社共同体', '王室侍从团'],
      ['柱铭', '铜板诏书', '石制林伽', '青铜仪式铃', '金制供物', '棕榈叶写本', '石窟神龛', '灌溉分水构件', '陶制供器', '砂岩神像'],
    ),
  },
  ...ancientPeriodFictionalProfiles,
}

Object.assign(earlyAsiaFictionalProfiles.japanese ??= {}, ancientPeriodFictionalProfiles['prehistoric-japan'])
Object.assign(earlyAsiaFictionalProfiles.korean ??= {}, ancientPeriodFictionalProfiles['early-korea'])

function getEarlyAsiaFictionalEntries(culture: OfflineCulture, period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = earlyAsiaFictionalProfiles[culture]?.[period]
  if (!profile) return []
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier)).map((type) => `${modifier}${type}`))
}

const englishPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  medieval: {
    location: ['约克', '温彻斯特', '坎特伯雷', '林肯', '达勒姆', '索尔兹伯里', '诺里奇', '埃克塞特', '切斯特', '沃里克', '伦敦', '牛津', '剑桥', '布里斯托尔', '多佛', '格洛斯特', '伊利', '罗切斯特', '赫里福德', '什鲁斯伯里'],
    organization: ['英格兰大议会', '王室财政署', '大法官署', '普通诉讼法院', '英格兰圣殿骑士团', '英格兰医院骑士团', '约克商人行会', '伦敦布商公会', '坎特伯雷教省会议', '王室衣橱署', '王座法院', '伦敦市政议会', '五港同盟', '羊毛商人公会', '伦敦金匠公会', '伦敦石匠公会', '牛津大学', '剑桥大学', '威斯敏斯特修道院参事会', '王室文书署'],
    item: ['英格兰长弓', '武装剑', '巨盔', '锁子甲衫', '蜡板', '印玺模', '时祷书', '计数木筹', '朝圣徽章', '锡制朝圣水壶', '国王大印', '锥头箭簇', '软甲帽', '朝圣者肩袋', '羊皮特许状', '牛角墨水瓶', '羊毛包铅封', '念珠串', '锡制徽章', '羽毛笔'],
  },
  'early-modern': {
    location: ['伦敦', '布里斯托尔', '普利茅斯', '牛津', '剑桥', '诺里奇', '朴次茅斯', '巴斯', '格林尼治', '坎特伯雷', '埃克塞特', '利物浦', '赫尔', '纽卡斯尔', '约克', '切尔滕纳姆', '伍尔维奇', '查塔姆', '德特福德', '多佛'],
    organization: ['英格兰枢密院', '皇家海军', '东印度公司', '王家学会', '书商文具商公会', '三一宫', '四大律师学院', '英格兰银行', '经度委员会', '伦敦古物学会', '英格兰议会', '皇家交易所', '莫斯科公司', '弗吉尼亚公司', '皇家造币厂', '海军部', '格林尼治皇家天文台', '邮政总局', '贸易与种植园委员会', '伦敦外科医师公会'],
    item: ['细剑', '簧轮手枪', '怀表', '四开本印刷书', '星盘', '航海图', '陶制烟斗', '蕾丝轮状皱领', '家族印戒', '茶叶匣', '燧发滑膛枪', '袖珍日晷', '角书', '新闻传单', '羽毛笔盒', '航海象限仪', '咖啡壶', '锡镴餐盘', '船用日志', '药剂师陶罐'],
  },
  modern: {
    location: ['曼彻斯特', '伯明翰', '利物浦', '利兹', '谢菲尔德', '纽卡斯尔', '布里斯托尔', '布莱顿', '诺丁汉', '剑桥', '伦敦', '牛津', '南安普敦', '莱斯特', '考文垂', '雷丁', '巴斯', '约克', '埃克塞特', '诺里奇'],
    organization: ['英国广播公司', '英格兰国民医疗服务体系', '大英图书馆', '英格兰艺术委员会', '英格兰历史遗产委员会', '英格兰足球总会', '大英博物馆', '伦敦大学', '伦敦交通局', '英格兰环境署', '英国国家美术馆', '泰特美术馆', '英国电影协会', '英国国家信托', '英国自然历史博物馆', '牛津大学', '剑桥大学', '英格兰体育委员会', '皇家歌剧院', '英格兰国家芭蕾舞团'],
    item: ['牡蛎交通卡', '平装书', '钢笔', '风衣', '电热水壶', '折叠伞', '自行车铃', '智能手机', '可重复使用杯', '铁路车票', '图书馆借阅证', '非接触式银行卡', '铁路优惠卡', '雨靴', '帆布购物袋', '无线耳机', '硬壳笔记本', '自行车头盔', '博物馆年卡', '通勤背包'],
  },
}

const englishNaturalTypes = ['河', '溪', '湖', '谷', '丘', '沼泽', '林地', '海湾', '海岬', '荒原']
const englishPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  medieval: {
    modifiers: ['白鹿', '灰钟', '鸦岬', '榛谷', '橡林', '赤丘', '冬溪', '雾港', '石桥', '北垣', '银麦', '王栎'],
    location: { settlement: ['郡镇', '教区村', '庄园镇', '集市镇', '修院村', '港镇', '桥镇', '林地村', '矿镇', '边境村'], region: ['郡', '教区', '庄园领', '猎场', '羊毛产区', '林地领', '河谷领', '荒原地', '海湾领', '边境领'], fortress: ['城堡', '石堡', '木栅堡', '门楼堡', '边境要塞', '丘堡', '桥头堡', '海岸堡', '庄园堡', '守望塔'], natural: englishNaturalTypes },
    organization: ['郡议会', '教区会', '庄园法庭', '羊毛商会', '长弓手团', '修院书院', '石匠行会', '城堡守备队', '王室邮驿', '港口船会'],
    item: ['长弓', '武装剑', '郡徽印戒', '羊皮地契', '锡制酒杯', '羊毛斗篷', '猎号', '时祷书', '计数木筹', '朝圣徽章'],
  },
  'early-modern': {
    modifiers: ['王冠', '白帆', '黑橡', '赤狮', '银钟', '海风', '新桥', '金鹿', '晨星', '蓝港', '灰塔', '玫瑰'],
    location: { settlement: ['港城', '自治镇', '大学城', '造船镇', '集市镇', '印刷城', '温泉镇', '河运城', '军港', '驿镇'], region: ['郡', '航海区', '纺织区', '煤田区', '海峡区', '河谷区', '王室领', '林地区', '港务区', '边防区'], fortress: ['炮台堡', '海防堡', '军港要塞', '星形堡', '城门堡', '岸防炮台', '守望塔', '兵营堡', '火药库堡', '河口堡'], natural: englishNaturalTypes },
    organization: ['枢密院', '航海公司', '书商公会', '王家学社', '律师学院', '港务署', '造船行会', '钟表匠会', '海图师院', '邮政署'],
    item: ['细剑', '簧轮手枪', '怀表', '四开本', '星盘', '航海图', '陶制烟斗', '皱领', '印戒', '茶叶匣'],
  },
  modern: {
    modifiers: ['白桥', '北星', '河岸', '绿丘', '新港', '王栎', '晨光', '蓝线', '石墙', '海岬', '红砖', '银轨'],
    location: { settlement: ['市', '城区', '大学城', '海滨镇', '铁路镇', '工业城', '卫星城', '市场镇', '港区', '社区'], region: ['都市区', '郡', '行政区', '产业区', '大学区', '滨海区', '保护区', '交通区', '河谷区', '文化区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: englishNaturalTypes },
    organization: ['公共图书馆', '大学学院', '社区议会', '文化基金会', '铁路公司', '广播中心', '环境保护会', '足球俱乐部', '博物馆', '医疗信托机构'],
    item: ['交通卡', '平装书', '钢笔', '风衣', '电热水壶', '折叠伞', '自行车铃', '智能手机', '随行杯', '铁路车票'],
  },
}

function getEnglishPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = englishPeriodFictionalProfiles[period] ?? englishPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const frenchPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  medieval: {
    location: ['巴黎', '鲁昂', '兰斯', '沙特尔', '亚眠', '图卢兹', '阿维尼翁', '卡尔卡松', '圣米歇尔山', '第戎', '布尔日', '图尔', '普瓦捷', '昂热', '奥尔良', '特鲁瓦', '拉昂', '桑利斯', '普罗万', '卡昂'],
    organization: ['巴黎高等法院', '法国三级会议', '巴黎大学', '法兰西圣殿骑士团', '法兰西医院骑士团', '克吕尼修道院', '西多会', '巴黎商人行会', '沙特莱法庭', '坎布雷主教会议', '法国王室大议会', '奥尔良大学', '圣但尼修道院', '丰特夫罗修道院', '沙特尔座堂参事会', '图卢兹市政议事会', '鲁昂呢绒商行会', '普罗万商人兄弟会', '巴黎金匠行会', '勃艮第公爵宫廷'],
    item: ['武装剑', '弩', '巨盔', '锁子甲衫', '图尔里弗尔银币', '印玺模', '时祷书', '圣物匣', '朝圣徽章', '织锦挂毯', '图尔德尼尔银币', '利摩日珐琅圣龛', '朝圣者水壶', '彩饰诗篇集', '弩矢袋', '羊毛外袍', '陶制酒壶', '蜡封契约', '象牙书写板', '纹章盾牌'],
  },
  'ancien-regime': {
    location: ['凡尔赛', '巴黎', '里昂', '波尔多', '马赛', '南特', '里尔', '斯特拉斯堡', '拉罗谢尔', '罗什福尔', '勒阿弗尔', '敦刻尔克', '土伦', '布雷斯特', '南锡', '雷恩', '格勒诺布尔', '蒙彼利埃', '克莱蒙费朗', '贝桑松'],
    organization: ['法国御前会议', '巴黎高等法院', '法兰西学术院', '戈布兰织毯工场', '法国东印度公司', '包税总局', '王家火枪手卫队', '皇家绘画与雕塑学院', '海军国务秘书处', '王家植物园', '法国皇家科学院', '王家建筑署', '皇家铭文与美文学术院', '巴黎警察总局', '法国海军部', '王家邮政', '塞夫勒瓷器工场', '巴黎外科医学院', '法国皇家地理师署', '巴黎商人总会'],
    item: ['宫廷细剑', '燧发滑膛枪', '三角帽', '鼻烟盒', '宫廷折扇', '香水瓶', '怀表', '塞夫勒瓷杯', '品酒银碟', '法兰西公报', '火漆封印', '宫廷礼服', '银制巧克力壶', '彩绘鼻烟壶', '王室年鉴', '黄铜望远镜', '马车旅行箱', '蕾丝袖口', '珐琅怀表盒', '铜版巴黎地图'],
  },
  modern: {
    location: ['巴黎', '马赛', '里昂', '图卢兹', '尼斯', '南特', '蒙彼利埃', '斯特拉斯堡', '里尔', '波尔多', '雷恩', '鲁昂', '格勒诺布尔', '第戎', '昂热', '兰斯', '勒阿弗尔', '土伦', '克莱蒙费朗', '圣艾蒂安'],
    organization: ['法国国民议会', '法国国家图书馆', '卢浮宫博物馆', '法国国家科学研究中心', '法国国家铁路公司', '法国电视台', '法兰西学术院', '巴斯德研究所', '蓬皮杜艺术中心', '法兰西喜剧院', '奥赛博物馆', '法国国家电影中心', '法国气象局', '法国国家档案馆', '巴黎歌剧院', '法国红十字会', '法国环境与能源管理署', '法国国家太空研究中心', '法国广播电台', '法国国家自然历史博物馆'],
    item: ['巴黎交通卡', '平装书', '钢笔', '贝雷帽', '香水瓶', '智能手机', '高速铁路车票', '珐琅咖啡杯', '折叠自行车', '数码相机', '图书馆借阅证', '非接触式银行卡', '博物馆通票', '可重复使用水瓶', '帆布购物袋', '无线耳机', '城市共享单车卡', '铁路优惠卡', '防雨外套', '笔记本电脑'],
  },
}

const frenchNaturalTypes = ['河', '溪', '湖', '谷', '丘', '林地', '海湾', '海岬', '泉', '葡萄坡']
const frenchPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  medieval: {
    modifiers: ['百合', '银泉', '红塔', '白石', '晨钟', '绿谷', '月桂', '葡萄', '圣河', '鹰堡', '蓝瓦', '橡林'],
    location: { settlement: ['伯爵城', '教区村', '修院镇', '葡萄园镇', '河畔城', '石堡镇', '集市镇', '林地村', '桥镇', '盐场镇'], region: ['伯爵领', '教区', '葡萄产区', '河谷领', '林地领', '边区', '盐场区', '海岸领', '山口领', '庄园地'], fortress: ['侯爵堡', '石堡', '山口堡', '桥头堡', '边境要塞', '河防堡', '城门堡', '海岸堡', '守望塔', '庄园堡'], natural: frenchNaturalTypes },
    organization: ['伯爵议会', '教区会', '修道院书院', '百合旗骑士团', '葡萄酒商会', '织毯工坊', '石匠行会', '河港税务会', '城堡卫队', '驿使署'],
    item: ['武装剑', '弩', '百合纹印章', '葡萄酒壶', '织锦挂毯', '圣物匣', '时祷书', '朝圣徽章', '锡制酒杯', '羊皮敕令'],
  },
  'ancien-regime': {
    modifiers: ['凡尔赛', '香槟', '蓝港', '金藤', '白蔷薇', '红塔', '晨钟', '绿谷', '银泉', '月桂', '宫灯', '百合'],
    location: { settlement: ['王室城', '工场镇', '港城', '葡萄酒镇', '温泉镇', '军港', '驿城', '学院城', '河运镇', '要塞镇'], region: ['王室领', '行省', '葡萄产区', '纺织区', '海军区', '河谷区', '盐税区', '庄园区', '边防区', '工场区'], fortress: ['星形要塞', '炮台堡', '军港要塞', '城门堡', '河口堡', '边境堡', '火药库堡', '守望塔', '岸防炮台', '兵营堡'], natural: frenchNaturalTypes },
    organization: ['御前会议', '王家工场', '学术院', '宫廷卫队', '东印度商社', '包税局', '海军署', '织毯工坊', '驿政署', '皇家画院'],
    item: ['宫廷细剑', '燧发枪', '三角帽', '鼻烟盒', '宫廷折扇', '香水瓶', '怀表', '彩釉瓷杯', '品酒银碟', '印刷公报'],
  },
  modern: {
    modifiers: ['塞纳', '蔚蓝', '白桥', '红砖', '新港', '月桂', '晨光', '蓝线', '银轨', '绿城', '海风', '百合'],
    location: { settlement: ['市', '城区', '大学城', '海滨镇', '铁路镇', '文化城', '卫星城', '市场镇', '港区', '社区'], region: ['都市区', '省区', '行政区', '产业区', '大学区', '滨海区', '保护区', '交通区', '河谷区', '葡萄产区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: frenchNaturalTypes },
    organization: ['公共图书馆', '大学学院', '市政议会', '文化基金会', '铁路公司', '电视中心', '研究所', '足球俱乐部', '博物馆', '医疗中心'],
    item: ['交通卡', '平装书', '钢笔', '贝雷帽', '香水瓶', '智能手机', '高速铁路车票', '咖啡杯', '折叠自行车', '数码相机'],
  },
}

function getFrenchPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = frenchPeriodFictionalProfiles[period] ?? frenchPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const germanPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  medieval: {
    location: ['科隆', '纽伦堡', '亚琛', '吕贝克', '雷根斯堡', '美因茨', '奥格斯堡', '戈斯拉尔', '施派尔', '沃尔姆斯', '特里尔', '马格德堡', '爱尔福特', '罗斯托克', '乌尔姆', '班贝格', '康斯坦茨', '梅泽堡', '奎德林堡', '希尔德斯海姆'],
    organization: ['神圣罗马帝国议会', '条顿骑士团', '汉萨同盟', '吕贝克市议会', '科隆主教座堂参事会', '纽伦堡手工业行会', '美因茨大主教宫廷', '亚琛王宫礼拜堂', '戈斯拉尔矿工行会', '雷根斯堡商人行会', '马格德堡大主教宫廷', '特里尔选侯宫廷', '康斯坦茨主教会议', '乌尔姆织工行会', '奥格斯堡金匠行会', '吕贝克商人同业会', '纽伦堡市议会', '班贝格座堂参事会', '罗斯托克船主会', '帝国宫廷法院'],
    item: ['长剑', '弩', '铁壶盔', '锁子甲衫', '行会印章', '蜡板', '手抄法典', '炻器酒壶', '薄片银币', '朝圣徽章', '布拉克特薄片银币', '纽伦堡铜筹', '羊皮特许状', '矿工皮灯袋', '木制啤酒杯', '朝圣者水壶', '行会旗', '铁制城门钥匙', '羽毛笔盒', '羊毛披风'],
  },
  'early-modern': {
    location: ['维也纳', '柏林', '德累斯顿', '汉堡', '法兰克福', '海德堡', '莱比锡', '奥格斯堡', '纽伦堡', '慕尼黑', '波茨坦', '耶拿', '哥廷根', '哈雷', '魏玛', '曼海姆', '卡尔斯鲁厄', '不伦瑞克', '汉诺威', '科尼斯堡'],
    organization: ['帝国最高法院', '普鲁士军队', '萨克森宫廷', '海德堡大学', '纽伦堡名歌手会', '富格尔银行家族', '矿工兄弟会', '勃兰登堡枢密院', '帝国邮政', '柏林科学院', '普鲁士科学院', '哥廷根大学', '哈雷大学', '萨克森枢密院', '普鲁士战争与领地部', '莱比锡书商会', '迈森瓷器工场', '汉堡海军部', '法兰克福市议会', '耶拿学术社'],
    item: ['簧轮手枪', '细剑', '活字铅字', '路德版圣经', '怀表', '炻器啤酒杯', '矿工安全灯', '迈森瓷杯', '齐特琴', '测绘罗盘', '燧发步枪', '铜版地图', '袖珍日晷', '印刷赞美诗集', '药剂师陶罐', '矿山测量链', '邮驿号角', '行会证书', '木制烟斗', '机械座钟'],
  },
  modern: {
    location: ['柏林', '慕尼黑', '汉堡', '科隆', '法兰克福', '莱比锡', '德累斯顿', '斯图加特', '杜塞尔多夫', '不来梅', '汉诺威', '纽伦堡', '波恩', '明斯特', '卡尔斯鲁厄', '曼海姆', '奥格斯堡', '弗赖堡', '海德堡', '吕贝克'],
    organization: ['德国联邦议院', '德国联邦参议院', '德国铁路公司', '马克斯·普朗克学会', '歌德学院', '德国足球协会', '德国之声', '包豪斯档案馆', '德意志博物馆', '德国联邦环境署', '弗劳恩霍夫协会', '德国国家图书馆', '德国考古研究院', '德国红十字会', '柏林爱乐乐团', '德国气象局', '德国电影资料馆', '德国学术交流中心', '德国自然保护联盟', '普鲁士文化遗产基金会'],
    item: ['德国交通月票', '城际快车车票', '钢笔', '相机', '机械腕表', '保温壶', '智能手机', '自行车锁', '通勤背包', '可重复使用水瓶', '图书馆借阅证', '非接触式银行卡', '铁路优惠卡', '无线耳机', '帆布购物袋', '自行车头盔', '城市交通卡', '博物馆年卡', '笔记本电脑', '折叠伞'],
  },
}

const germanNaturalTypes = ['河', '溪', '湖', '谷', '岭', '森林', '海湾', '矿山', '丘陵', '葡萄坡']
const germanPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  medieval: {
    modifiers: ['鹰岩', '黑林', '银湖', '铁门', '白橡', '莱茵', '红堡', '松针', '狼岭', '钟楼', '金麦', '北境'],
    location: { settlement: ['自由市', '林堡镇', '矿山城', '河畔堡', '侯国城', '修院镇', '湖区镇', '钟楼村', '集市堡', '盐路镇'], region: ['侯国', '主教领', '自由市领', '矿区', '林地区', '河谷领', '盐路区', '葡萄产区', '边境领', '湖区'], fortress: ['山堡', '河畔堡', '边境关', '城门堡', '铁门堡', '桥头堡', '修院堡', '守望塔', '矿山堡', '丘堡'], natural: germanNaturalTypes },
    organization: ['自由市议会', '矿工行会', '铁匠兄弟会', '修院书院', '侯爵卫队', '河运船会', '名歌手会', '啤酒酿造会', '驿站署', '城墙守备队'],
    item: ['长剑', '弩', '行会账册', '炻器酒壶', '铁钥匙', '矿灯', '纹章盾', '木刻版', '手抄本', '行会印章'],
  },
  'early-modern': {
    modifiers: ['帝国', '莱茵', '黑鹰', '银矿', '红堡', '白橡', '钟楼', '北海', '金麦', '松林', '王冠', '工坊'],
    location: { settlement: ['邦国首府', '自由市', '矿业镇', '印刷城', '大学城', '军镇', '河港城', '纺织镇', '盐矿城', '驿城'], region: ['选侯国', '公国', '自由市领', '矿区', '印刷区', '河谷区', '林业区', '盐业区', '边防区', '葡萄产区'], fortress: ['星形要塞', '炮台堡', '城门堡', '河防堡', '军营堡', '火药库堡', '山口堡', '边境要塞', '守望塔', '岸防炮台'], natural: germanNaturalTypes },
    organization: ['邦国枢密院', '矿工兄弟会', '印刷商会', '大学学社', '宫廷卫队', '邮政署', '钟表匠会', '啤酒酿造会', '河运船会', '测绘院'],
    item: ['簧轮手枪', '细剑', '活字铅字', '印刷圣经', '怀表', '啤酒杯', '矿工安全灯', '瓷杯', '齐特琴', '测绘罗盘'],
  },
  modern: {
    modifiers: ['柏林', '莱茵', '新港', '绿城', '银轨', '红砖', '北海', '黑林', '晨光', '蓝线', '白桥', '鹰塔'],
    location: { settlement: ['市', '城区', '大学城', '工业城', '铁路镇', '港区', '卫星城', '社区', '科技城', '市场镇'], region: ['都市区', '州区', '行政区', '产业区', '大学区', '滨海区', '保护区', '交通区', '河谷区', '森林区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: germanNaturalTypes },
    organization: ['市议会', '大学学院', '研究所', '铁路公司', '文化基金会', '广播中心', '足球俱乐部', '博物馆', '环境保护会', '工业设计院'],
    item: ['交通月票', '高铁车票', '钢笔', '相机', '机械腕表', '保温壶', '智能手机', '自行车锁', '通勤背包', '随行水瓶'],
  },
}

function getGermanPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = germanPeriodFictionalProfiles[period] ?? germanPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const italianPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  medieval: {
    location: ['罗马', '威尼斯', '佛罗伦萨', '锡耶纳', '热那亚', '比萨', '博洛尼亚', '巴勒莫', '拉文纳', '阿马尔菲', '卢卡', '帕多瓦', '维罗纳', '佩鲁贾', '阿雷佐', '摩德纳', '帕尔马', '萨莱诺', '奥尔维耶托', '阿斯蒂'],
    organization: ['威尼斯大议会', '佛罗伦萨羊毛行会', '教廷宫廷', '圣乔治银行', '博洛尼亚大学', '锡耶纳九人议会', '热那亚公社', '多明我会', '方济各会', '威尼斯军械库', '佛罗伦萨卡利马拉行会', '佛罗伦萨钱币兑换商行会', '威尼斯四十人议会', '热那亚大议会', '卢卡丝绸行会', '帕多瓦大学', '佩鲁贾公证人行会', '米兰公爵宫廷', '西西里王国议会', '阿马尔菲海商会'],
    item: ['武装剑', '弩', '商人账册', '佛罗伦萨金币', '威尼斯杜卡特', '彩陶盘', '手抄法典', '游行十字架', '城市印章', '穆拉诺玻璃珠', '热那亚银币', '羊皮公证书', '丝绸钱袋', '商用算盘', '陶制油灯', '行会旗', '木制墨水瓶', '铜制量秤', '港口货票', '彩绘圣像板'],
  },
  renaissance: {
    location: ['佛罗伦萨', '威尼斯', '米兰', '罗马', '曼托瓦', '费拉拉', '乌尔比诺', '那不勒斯', '博洛尼亚', '热那亚', '帕多瓦', '维琴察', '卢卡', '佩鲁贾', '比萨', '锡耶纳', '帕尔马', '摩德纳', '贝加莫', '布雷西亚'],
    organization: ['美第奇银行', '威尼斯军械库', '十字圣乔治银行', '佛罗伦萨执政团', '教廷卫队', '圣路加公会', '罗马学院', '米兰公爵宫廷', '埃斯特宫廷', '威尼斯元老院', '秕糠学会', '佛罗伦萨柏拉图学院', '威尼斯十人委员会', '曼托瓦贡扎加宫廷', '乌尔比诺蒙特费尔特罗宫廷', '罗马圣路加学院', '佛罗伦萨丝绸行会', '威尼斯印刷商行会', '博洛尼亚画师公会', '帕多瓦大学医学部'],
    item: ['细剑', '簧轮手枪', '文艺复兴纪念章', '马约利卡彩陶盘', '穆拉诺玻璃器', '鲁特琴', '解剖手稿', '印刷开本书', '天鹅绒披风', '家族印戒', '透视绘图板', '铜版画', '人文主义手稿', '丝绸贝雷帽', '镶嵌木匣', '黄铜圆规', '药剂师陶罐', '宫廷面具', '城市纪念币', '航海罗盘'],
  },
  modern: {
    location: ['罗马', '米兰', '那不勒斯', '都灵', '博洛尼亚', '佛罗伦萨', '热那亚', '巴勒莫', '巴里', '威尼斯', '卡塔尼亚', '维罗纳', '帕多瓦', '的里雅斯特', '布雷西亚', '帕尔马', '佩鲁贾', '拉文纳', '卡利亚里', '莱切'],
    organization: ['意大利议会', '意大利铁路公司', '意大利广播电视公司', '意大利国家研究委员会', '林琴科学院', '意大利宪兵', '意大利红十字会', '斯卡拉歌剧院', '奇内奇塔电影城|Cinecittà', '意大利足球协会', '乌菲齐美术馆', '意大利国家档案总局', '意大利空间局', '威尼斯双年展基金会', '意大利气象局', '意大利国家电影资料馆', '意大利环境基金会', '罗马国家博物馆', '意大利海洋研究所', '意大利设计协会'],
    item: ['城市交通卡', '铁路车票', '钢笔', '摩卡壶', '皮革公文包', '摩托车头盔', '智能手机', '相机', '平装书', '折叠伞', '博物馆通票', '非接触式银行卡', '无线耳机', '帆布购物袋', '自行车锁', '铁路优惠卡', '可重复使用水瓶', '笔记本电脑', '城市共享单车卡', '防雨外套'],
  },
}

const italianNaturalTypes = ['河', '溪', '湖', '谷', '丘', '葡萄坡', '橄榄园', '海湾', '海岬', '石桥']
const italianPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  medieval: {
    modifiers: ['金谷', '白塔', '月湾', '赤狮', '青石', '雾港', '橄榄', '葡萄藤', '圣泉', '日冠', '大理石', '海风'],
    location: { settlement: ['城邦', '海港城', '山城', '塔城', '葡萄园镇', '湖畔城', '石桥镇', '教区城', '侯国堡', '广场镇'], region: ['城邦领', '公国', '教廷领', '葡萄产区', '橄榄园区', '河谷区', '山地区', '海岸区', '盐场区', '商路区'], fortress: ['山城堡', '海港堡', '塔堡', '城门堡', '侯国要塞', '石桥堡', '教廷堡', '海角炮台', '商路堡', '守望塔'], natural: italianNaturalTypes },
    organization: ['城邦议会', '羊毛行会', '银行家会', '玻璃工坊', '教廷卫队', '商人公会', '石匠行会', '剧院会', '船会', '画师学社'],
    item: ['武装剑', '弩', '城邦金币', '玻璃高脚杯', '家族印章', '手抄法典', '鲁特琴', '港口海图', '游行十字架', '商人账册'],
  },
  renaissance: {
    modifiers: ['美第奇', '白塔', '月湾', '赤狮', '青石', '雾港', '橄榄', '葡萄藤', '圣泉', '日冠', '大理石', '海风'],
    location: { settlement: ['公爵城', '城邦镇', '画院城', '海港城', '工坊镇', '大学城', '宫廷镇', '印刷城', '湖畔城', '山城'], region: ['公国', '城邦领', '画院区', '港务区', '工坊区', '大学区', '宫廷领', '印刷区', '葡萄产区', '橄榄园区'], fortress: ['公爵堡', '城邦炮台', '海港要塞', '城门堡', '宫廷卫堡', '山口堡', '河港堡', '兵营堡', '火药库堡', '海角堡'], natural: italianNaturalTypes },
    organization: ['银行家会', '玻璃工坊', '画师学院', '雇佣兵团', '贡多拉船会', '教廷卫队', '建筑师团', '剧院会', '印刷商会', '解剖学社'],
    item: ['细剑', '簧轮手枪', '城邦金币', '玻璃高脚杯', '家族印章', '手抄法典', '鲁特琴', '港口海图', '炼金瓶', '天鹅绒披风'],
  },
  modern: {
    modifiers: ['罗马', '米兰', '新港', '绿城', '银轨', '红砖', '海风', '金穗', '晨光', '蓝线', '白桥', '橄榄'],
    location: { settlement: ['市', '城区', '大学城', '工业城', '铁路镇', '港区', '卫星城', '社区', '文化城', '市场镇'], region: ['都市区', '大区', '行政区', '产业区', '大学区', '滨海区', '保护区', '交通区', '河谷区', '葡萄产区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: italianNaturalTypes },
    organization: ['市议会', '大学学院', '铁路公司', '广播中心', '研究所', '文化基金会', '足球俱乐部', '博物馆', '歌剧院', '设计学院'],
    item: ['交通卡', '铁路车票', '钢笔', '摩卡壶', '皮革公文包', '摩托车头盔', '智能手机', '相机', '平装书', '折叠伞'],
  },
}

function getItalianPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = italianPeriodFictionalProfiles[period] ?? italianPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const iberianPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  medieval: {
    location: ['托莱多', '莱昂', '布尔戈斯', '萨莫拉', '奥维耶多', '圣地亚哥-德孔波斯特拉', '科尔多瓦', '塞维利亚', '萨拉戈萨', '昆卡', '巴塞罗那', '潘普洛纳', '塞哥维亚', '塔拉戈纳', '韦斯卡', '哈卡', '卡塞雷斯', '梅里达', '萨拉曼卡', '阿维拉'],
    organization: ['莱昂王国议会', '圣地亚哥骑士团', '卡拉特拉瓦骑士团', '巴伦西亚海事领事馆', '萨拉曼卡大学', '巴利亚多利德大学', '梅斯塔牧主会', '阿拉贡王国议会', '托莱多翻译院', '市镇议事会', '阿尔坎塔拉骑士团', '蒙特萨骑士团', '绶带骑士团', '卡斯蒂利亚议会', '布尔戈斯市议会', '加泰罗尼亚议会', '巴塞罗那海事领事馆', '布尔戈斯商人兄弟会', '托莱多座堂参事会', '圣地亚哥朝圣者救济院'],
    item: ['马刀', '皮盾', '弩', '马拉维迪银币', '朝圣贝壳徽', '彩釉瓷砖', '羊皮敕令', '星盘', '皮革酒囊', '马蹄铁', '托莱多钢剑', '阿杜尔加皮盾', '弩矢袋', '朝圣杖', '羊毛斗篷', '马具胸带', '彩绘祈祷书', '蜡封印戒', '铜制水壶', '伊比利亚竖琴'],
  },
  'early-modern': {
    location: ['马德里', '塞维利亚', '布尔戈斯', '格拉纳达', '瓦伦西亚', '巴塞罗那', '巴利亚多利德', '加的斯', '托莱多', '潘普洛纳', '萨拉曼卡', '萨拉戈萨', '卡塔赫纳', '拉科鲁尼亚', '桑卢卡尔-德巴拉梅达', '埃斯科里亚尔', '圣塞瓦斯蒂安', '毕尔巴鄂', '巴达霍斯', '阿利坎特'],
    organization: ['卡斯蒂利亚议会', '塞维利亚贸易之家', '阿拉贡议会', '印度事务院', '骑士团委员会', '西班牙宗教裁判所', '萨拉曼卡大学', '阿尔卡拉大学', '海商领事馆', '梅斯塔牧主会', '巴利亚多利德皇家衡平法院', '阿拉贡委员会', '王室地理师署', '塞维利亚海商领事馆', '巴伦西亚皇家审问院', '西班牙皇家语言学院', '圣费尔南多皇家美术学院', '王室造船厂', '王家邮政总局', '殖民地档案署'],
    item: ['细剑', '火绳枪', '星盘', '羊皮航海图', '曼蒂利亚头纱', '彩釉瓷砖', '陶制水罐', '念珠', '王室印章', '航海象限仪', '卡拉克帆船罗盘', '波托兰航海图', '火绳枪弹药带', '细剑鞘', '西班牙雷亚尔银币', '西班牙埃斯库多金币', '水手星盘', '船用沙漏', '活字印刷本', '王室航海日志'],
  },
  modern: {
    location: ['马德里', '巴塞罗那', '科尔多瓦', '格拉纳达', '塞维利亚', '瓦伦西亚', '毕尔巴鄂', '马拉加', '萨拉戈萨', '托莱多', '阿利坎特', '穆尔西亚', '维戈', '拉科鲁尼亚', '赫雷斯-德拉弗龙特拉', '潘普洛纳', '巴利亚多利德', '帕尔马', '圣塞瓦斯蒂安', '阿尔梅里亚'],
    organization: ['西班牙议会', '西班牙国家档案馆', '西班牙国家铁路', '西班牙国家广播电视台', '塞万提斯学院', '索菲亚王后国家艺术中心', '普拉多博物馆', '西班牙国家图书馆', '西班牙国家研究委员会', '西班牙电影资料馆', '西班牙皇家语言学院', '西班牙科学院', '西班牙国家考古博物馆', '西班牙国家统计局', '西班牙红十字会', '西班牙海洋研究所', '巴塞罗那大学', '马德里康普顿斯大学', '西班牙国家气象局', '西班牙文化遗产研究所'],
    item: ['城市交通卡', '高速铁路车票', '彩釉瓷砖', '浓缩咖啡杯', '钢笔', '折扇', '智能手机', '数码相机', '平装书', '皮革公文包', '欧元硬币', '电子身份证', '电子护照', '地铁月票', '足球俱乐部会员卡', '陶瓷纪念盘', '橄榄油瓶', '葡萄酒开瓶器', '笔记本电脑', '无线耳机'],
  },
}

const iberianNaturalTypes = ['河', '溪', '湖', '谷', '丘', '橄榄坡', '葡萄坡', '海湾', '海岬', '盐沼']
const iberianPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  medieval: {
    modifiers: ['圣地亚哥', '卡斯蒂利亚', '阿拉贡', '葡萄', '橄榄', '白墙', '红瓦', '金塔', '海风', '月港', '银河', '王冠'],
    location: { settlement: ['王国城', '港城', '山城', '朝圣镇', '修院镇', '海岸城', '谷地镇', '橄榄庄', '河港', '高原堡'], region: ['王国领', '伯爵领', '葡萄产区', '橄榄区', '海岸区', '谷地区', '高原区', '边区', '盐场区', '朝圣路区'], fortress: ['城堡', '边堡', '山口堡', '海岸堡', '要塞', '塔堡', '修院堡', '河防堡', '门楼堡', '高原堡'], natural: iberianNaturalTypes },
    organization: ['骑士团', '王室议会', '羊毛商会', '橄榄种植会', '教区议会', '边境守备队', '铸币局', '港口税署', '朝圣者救济院', '马术兄弟会'],
    item: ['马刀', '皮盾', '王室印章', '银币', '海图', '念珠', '橄榄油壶', '朝圣徽章', '羊毛披风', '船用沙漏'],
  },
  'early-modern': {
    modifiers: ['马德里', '塞维利亚', '托莱多', '格拉纳达', '瓦伦西亚', '萨拉戈萨', '白帆', '金塔', '红墙', '海风', '圣路', '王冠'],
    location: { settlement: ['王都', '港城', '大学城', '造船镇', '朝圣城', '殖民港', '集市镇', '盐港', '河运城', '军镇'], region: ['王国区', '航海区', '葡萄产区', '橄榄区', '殖民区', '海峡区', '河谷区', '盐税区', '边防区', '朝圣区'], fortress: ['炮台堡', '海防堡', '星形要塞', '城门堡', '军港要塞', '殖民堡', '火药库堡', '山口堡', '河口堡', '守望塔'], natural: iberianNaturalTypes },
    organization: ['王室航海院', '羊毛商会', '橄榄种植会', '教区议会', '边境守备队', '铸币局', '港口税署', '朝圣者救济院', '马术兄弟会', '地图师院'],
    item: ['细剑', '火绳枪', '星盘', '海图', '王室印章', '银币', '皮革水袋', '橄榄油壶', '朝圣徽章', '船用沙漏'],
  },
  modern: {
    modifiers: ['马德里', '塞维利亚', '巴塞罗那', '瓦伦西亚', '白帆', '蓝海', '红砖', '金塔', '海风', '新港', '银轨', '圣路'],
    location: { settlement: ['市', '城区', '大学城', '海滨镇', '铁路镇', '港区', '卫星城', '社区', '市场镇', '文化城'], region: ['都市区', '自治区', '行政区', '产业区', '大学区', '滨海区', '保护区', '交通区', '河谷区', '葡萄产区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: iberianNaturalTypes },
    organization: ['市议会', '大学学院', '铁路公司', '广播中心', '文化基金会', '足球俱乐部', '博物馆', '研究委员会', '港务公司', '公共图书馆'],
    item: ['交通卡', '高速铁路车票', '彩釉瓷砖', '咖啡杯', '钢笔', '折扇', '智能手机', '数码相机', '平装书', '皮革公文包'],
  },
}

function getIberianPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = iberianPeriodFictionalProfiles[period] ?? iberianPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const norsePeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  viking: {
    location: ['考庞', '阿瓦尔斯内斯', '博勒', '戈克斯塔', '奥塞贝格', '尼达罗斯', '拉德', '梅勒', '罗弗敦博格', '斯蒂克莱斯塔', '哈夫斯峡湾', '奥斯陆峡湾', '松恩峡湾', '哈当厄峡湾', '特隆赫姆峡湾', '西福尔', '罗加兰', '霍洛加兰', '阿格德尔', '耶伦'],
    organization: ['古拉庭', '弗罗斯塔庭', '埃兹沃尔庭', '博尔加庭', '挪威莱当舰队', '挪威国王侍卫团', '拉德伯爵家族', '金发王朝', '阿瓦尔斯内斯王室庄园', '考庞商人群体', '博勒地方廷会', '梅勒祭祀中心', '霍洛加兰酋长集团', '罗加兰地方廷会', '西福尔地方廷会', '峡湾农场主廷会', '挪威法律宣讲人群体', '海岸烽火守望体系', '长船船主群体', '挪威船匠群体'],
    item: ['奥塞贝格船', '戈克斯塔船', '克瓦尔松船', '耶尔蒙德布头盔', '长船', '克纳尔商船', '单刃长剑', '花纹焊接剑', '胡须斧', '圆盾', '长矛', '弓', '银臂环', '雷神之锤坠饰', '符文石', '皂石炊锅', '奥塞贝格木车', '椭圆形胸针', '织机坠', '折叠天平'],
  },
  medieval: {
    location: ['奥斯陆', '卑尔根', '尼达罗斯', '滕斯贝格', '斯塔万格', '哈马尔', '希恩', '萨尔普斯堡', '博尔贡', '尼达罗斯大教堂', '卑尔根胡斯城堡', '阿克斯胡斯城堡', '哈康王宫', '蒙克利夫修道院', '于特施泰因修道院', '塞尔耶修道院', '尼达霍尔姆修道院', '霍韦德岛修道院', '居伦古拉庭会址', '廷豪根弗罗斯塔庭会址'],
    organization: ['挪威王国枢密院', '尼达罗斯总主教区', '卑尔根主教区', '奥斯陆主教区', '斯塔万格主教区', '哈马尔主教区', '卑尔根汉萨商馆', '尼达罗斯主教座堂参事会', '古拉庭', '弗罗斯塔庭', '埃兹沃尔庭', '博尔加庭', '挪威王室文书局', '蒙克利夫修道院', '于特施泰因修道院', '塞尔耶修道院', '尼达霍尔姆修道院', '霍韦德岛修道院', '卑尔根鞋匠行会', '卑尔根鳕鱼商人群体'],
    item: ['挪威国家法典', '古拉庭法典', '弗罗斯塔庭法典', '卑尔根木简', '挪威苞片银币', '鳕鱼干货捆', '汉萨贸易账册', '羊皮特许状', '王室蜡封', '主教权杖', '祭坛正面饰板', '木板教堂门雕', '朝圣徽章', '诗篇手抄本', '羊毛呢布', '皂石容器', '十字弩', '骑士剑', '铁制马刺', '港口通行证'],
  },
  modern: {
    location: ['奥斯陆', '卑尔根', '特隆赫姆', '斯塔万格', '特罗姆瑟', '克里斯蒂安桑', '德拉门', '腓特烈斯塔', '奥勒松', '博德', '利勒哈默尔', '斯瓦尔巴群岛', '罗弗敦群岛', '松恩峡湾', '哈当厄峡湾', '盖朗厄尔峡湾', '尤通黑门山地', '米约萨湖', '北角', '芬马克高原'],
    organization: ['挪威议会', '挪威政府', '挪威最高法院', '奥斯陆大学', '卑尔根大学', '挪威科技大学', '挪威北极大学', '挪威国家图书馆', '挪威广播公司', '挪威国家博物馆', '挪威民俗博物馆', '弗拉姆博物馆', '挪威极地研究所', '挪威文化遗产局', '挪威气象研究所', '挪威红十字会', '挪威徒步协会', '挪威诺贝尔委员会', '挪威艺术委员会', '挪威海岸管理局'],
    item: ['挪威国家身份证', '挪威电子护照', '银行身份认证器', '奥斯陆公共交通票', '全国公共交通联程票', '布纳德民族服装', '马里乌斯纹样毛衣', '挪威奶酪刨', '哈当厄尔小提琴', '越野滑雪板', '峡湾徒步地图', '雪崩搜救信标', '海岸救生衣', '防水冲锋衣', '羊毛针织帽', '山间木屋钥匙', '电子钓鱼许可证', '铁路月票', '保温杯', '户外头灯'],
  },
}

const norseNaturalTypes = ['峡湾', '海湾', '海峡', '冰湖', '雪岭', '松林', '苔原', '礁岸', '河谷', '海岬']
const norsePeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  viking: {
    modifiers: ['乌鸦', '霜狼', '铁松', '鲸骨', '雷岩', '长船', '银臂', '北星', '海雾', '冬湾', '赤帆', '橡木'],
    location: { settlement: ['长屋村', '峡湾村', '海湾镇', '鲸湾港', '船坞镇', '渔猎村', '冬营地', '农场聚落', '海岬寨', '潮汐港'], region: ['氏族领', '猎场', '牧场地', '峡湾区', '海岛领', '林地区', '苔原地', '海岸区', '航路区', '冬牧区'], fortress: ['环形堡', '木栅寨', '海岬堡', '山口寨', '烽火台', '盾墙营', '河口堡', '船坞堡', '岛屿寨', '海岸哨'], natural: norseNaturalTypes },
    organization: ['廷议会', '长船会', '盾墙战团', '符文刻师会', '铁匠兄弟会', '峡湾商会', '神殿祭司团', '海岸守望队', '鲸猎团', '法律歌者会', '船匠坊', '氏族议事厅'],
    item: ['长船', '圆盾', '战斧', '短剑', '银臂环', '符文石', '饮酒角', '骨梳', '羊毛斗篷', '航海石', '木雕船首', '铁锅'],
  },
  medieval: {
    modifiers: ['王冠', '白桦', '钟楼', '银湾', '圣坛', '北海', '红堡', '松林', '金麦', '灰石', '雪岭', '海鹰'],
    location: { settlement: ['王城', '主教城', '行会镇', '海港城', '修院镇', '渔港镇', '林地村', '矿山镇', '桥头镇', '城堡镇'], region: ['王国领', '伯爵领', '教区', '峡湾区', '海岛领', '林地区', '矿区', '海岸区', '商路区', '农庄区'], fortress: ['石堡', '海防堡', '山口堡', '城门堡', '塔楼堡', '修院堡', '河口堡', '边境堡', '军港堡', '守望塔'], natural: norseNaturalTypes },
    organization: ['王国枢密院', '城镇议会', '汉萨商馆', '主教座堂会', '修道院书院', '船主公会', '银匠行会', '羊毛织工会', '鳕鱼商会', '王室邮驿', '城堡卫队', '港口税署'],
    item: ['骑士剑', '十字弩', '锁子甲', '纹章盾', '蜡封印章', '羊皮特许状', '银币', '行会账册', '羊毛斗篷', '船用罗盘', '港口通行证', '铜烛台'],
  },
  modern: {
    modifiers: ['极光', '峡湾', '白桦', '北星', '海风', '松林', '蓝港', '银轨', '雪原', '湖光', '绿岛', '晨湾'],
    location: { settlement: ['市', '城区', '大学城', '海滨镇', '铁路镇', '港区', '卫星城', '社区', '渔港镇', '生态城'], region: ['都市区', '行政区', '产业区', '大学区', '滨海区', '保护区', '交通区', '湖区', '峡湾区', '森林区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: norseNaturalTypes },
    organization: ['市议会', '大学学院', '铁路公司', '广播中心', '文化基金会', '博物馆', '生态研究所', '港务公司', '公共图书馆', '海岸救援队', '自行车协会', '设计中心'],
    item: ['交通卡', '铁路月票', '电子护照', '智能手机', '笔记本电脑', '数码相机', '无线耳机', '防水冲锋衣', '滑雪板', '保温杯', '便携电源', '户外头灯'],
  },
}

function getNorsePeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = norsePeriodFictionalProfiles[period] ?? norsePeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const icelandicPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  medieval: {
    location: ['辛格韦德利', '雷克雅未克', '斯卡尔霍特', '霍拉尔', '博尔加峡湾', '布雷扎峡湾', '埃亚峡湾', '斯卡加峡湾', '米湖', '赫克拉火山', '斯奈山半岛', '西峡湾', '韦斯特曼纳群岛', '雷克霍特', '豪卡达尔', '奥迪', '莫斯费德尔', '辛盖拉尔', '赫尔加费德尔', '维泽岛'],
    organization: ['冰岛全岛议会', '冰岛法律委员会', '四区法庭', '五院法庭', '法律宣讲人职位', '地方首领辖区', '斯卡尔霍特主教区', '霍拉尔主教区', '辛盖拉尔修道院', '锡克瓦拜尔修道院', '维泽岛修道院', '赫尔加费德尔修道院', '蒙卡特韦劳修道院', '莫兹鲁韦利尔修道院', '基尔丘拜尔女修道院', '雷尼斯塔泽尔女修道院', '斯陶尔隆家族', '奥达韦里家族', '豪克德利尔家族', '阿斯比宁家族'],
    item: ['灰鹅法典', '约恩法典', '冰岛人之书', '殖民书', '王家宝典', '弗拉泰岛书', '莫兹鲁韦利尔书', '冰岛萨迦羊皮卷', '羊皮契约', '羊毛呢布', '鳕鱼干货捆', '半环形银胸针', '骨梳', '鲸骨棋子', '鱼钩', '油脂灯', '草皮切割铲', '木制阿斯库尔碗', '纺轮', '织机坠'],
  },
  modern: {
    location: ['雷克雅未克', '科帕沃于尔', '哈夫纳夫约杜尔', '阿克雷里', '雷克雅内斯拜尔', '加尔扎拜尔', '莫斯费德尔拜尔', '阿克拉内斯', '塞尔福斯', '韦斯特曼纳群岛', '伊萨菲厄泽', '胡萨维克', '埃伊尔斯塔济', '博尔加内斯', '赫本', '辛格韦德利', '瓦特纳冰川', '杰古沙龙冰河湖', '米湖', '斯奈山半岛'],
    organization: ['冰岛议会', '冰岛大学', '雷克雅未克大学', '冰岛国家博物馆', '冰岛国家图书馆', '冰岛气象局', '冰岛道路与海岸管理局', '冰岛海岸警卫队', '冰岛搜救协会', '冰岛国家广播公司', '雷克雅未克市议会', '阿克雷里市议会', '冰岛语言研究所', '冰岛海洋研究所', '冰岛地质调查局', '冰岛旅游局', '冰岛作家协会', '冰岛交响乐团', '冰岛红十字会', '冰岛自然历史研究所'],
    item: ['冰岛电子身份认证', '雷克雅未克公交卡', '电子护照', '冰岛羊毛圆肩毛衣', '冰爪', '登山杖', '地热水费账单', '汽车防滑链', '火山监测仪', '户外头灯', '救援定位器', '道路状况地图', '公共泳池年卡', '电子钓鱼许可证', '天气预警应用', '电动汽车充电卡', '图书馆借阅证', '防水冲锋衣', '羊毛毯', '保温杯'],
  },
}

const icelandicNaturalTypes = ['冰川', '火山', '峡湾', '冰湖', '熔岩原', '黑沙滩', '温泉', '瀑布', '苔原', '海岬']
const icelandicPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  medieval: {
    modifiers: ['法律石', '乌鸦', '冰河', '熔岩', '白浪', '冬港', '火山', '羊毛', '鲸湾', '霜原', '黑沙', '北星'],
    location: { settlement: ['农场', '峡湾村', '海湾镇', '渔站', '长屋村', '温泉地', '牧场村', '黑沙村', '山口农庄', '海岬寨'], region: ['首领领地', '廷会区', '农牧区', '峡湾区', '海岛领', '熔岩区', '苔原地', '海岸区', '渔场区', '冬牧区'], fortress: ['农场堡', '木栅寨', '海岬堡', '山口寨', '烽火台', '石垒', '河口堡', '港口堡', '岛屿寨', '海岸哨'], natural: icelandicNaturalTypes },
    organization: ['地方廷会', '法律宣讲人院', '萨迦抄写院', '农场主会', '峡湾船会', '羊毛织工会', '鳕鱼商会', '主教座堂会', '冬季互助会', '海岸守望队', '修道院书院', '储粮会'],
    item: ['萨迦羊皮卷', '岛民法典', '银胸针', '羊毛斗篷', '鲸骨棋子', '鱼皮鞋', '饮酒角', '铁短刀', '火山石磨', '羊毛布匹', '船用绳', '木杯'],
  },
  modern: {
    modifiers: ['极光', '冰川', '熔岩', '黑沙', '温泉', '火山', '海雾', '霜原', '风岬', '鲸湾', '雪峰', '苔原'],
    location: { settlement: ['市', '城区', '大学城', '海滨镇', '渔港镇', '温泉镇', '卫星城', '社区', '农场镇', '旅游镇'], region: ['都市区', '行政区', '地热区', '大学区', '滨海区', '保护区', '交通区', '冰川区', '火山区', '峡湾区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: icelandicNaturalTypes },
    organization: ['市议会', '大学学院', '道路管理局', '广播中心', '语言研究所', '国家博物馆', '海洋研究所', '旅游协会', '公共图书馆', '搜救队', '地质调查局', '自然保护会'],
    item: ['公交卡', '电子护照', '智能手机', '笔记本电脑', '数码相机', '无线耳机', '防水冲锋衣', '羊毛毛衣', '冰爪', '登山杖', '救援定位器', '道路地图'],
  },
}

function getIcelandicPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = icelandicPeriodFictionalProfiles[period] ?? icelandicPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const ancientGreekPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  archaic: {
    location: ['雅典', '斯巴达', '科林斯', '阿尔戈斯', '底比斯', '米利都', '以弗所', '萨摩斯岛', '希俄斯岛', '纳克索斯岛', '提洛岛', '奥林匹亚', '德尔斐', '叙拉古', '克罗顿', '塔拉斯', '昔兰尼', '墨伽拉', '埃雷特里亚', '埃伊纳岛'],
    organization: ['雅典战神山议事会', '斯巴达长老会', '斯巴达公民大会', '斯巴达监察官团', '德尔斐神谕所', '德尔斐近邻同盟', '奥林匹亚竞技会', '阿波罗祭司团', '赫拉神庙祭司团', '雅典执政官团', '科林斯寡头议事会', '米利都公民议事会', '殖民城奠基者会议', '重装步兵公餐团', '贵族氏族会议', '陶工行会', '青铜匠行会', '吟游诗人圈', '航海商人会', '城邦使节团'],
    item: ['阿斯庇斯圆盾', '科林斯式头盔', '青铜胸甲', '青铜胫甲', '多律长矛', '希腊短剑', '双耳陶罐', '克拉特调酒器', '基利克斯酒杯', '香油瓶', '青铜三足鼎', '衣饰别针', '里拉琴', '基萨拉琴', '蜡板', '几何纹陶罐', '黑绘陶瓶', '橄榄冠', '早期银币', '青铜祭盘'],
  },
  classical: {
    location: ['雅典', '斯巴达', '科林斯', '底比斯', '德尔斐', '奥林匹亚', '比雷埃夫斯', '提洛岛', '米利都', '以弗所', '普拉提亚', '曼提尼亚', '留克特拉', '埃皮达鲁斯', '阿姆菲波利斯', '奥林索斯', '墨伽拉', '阿尔戈斯', '萨拉米斯岛', '阿提卡'],
    organization: ['雅典公民大会', '雅典五百人议事会', '雅典陪审法庭', '雅典十将军团', '雅典战神山议事会', '提洛同盟', '伯罗奔尼撒同盟', '维奥蒂亚同盟', '德尔斐近邻同盟', '斯巴达长老会', '斯巴达监察官团', '斯巴达公民大会', '雅典三列桨舰船主团', '柏拉图学园', '亚里士多德吕克昂学园', '厄琉息斯秘仪祭司团', '埃皮达鲁斯医神殿', '城邦体操学校', '悲剧诗人竞赛会', '陶片放逐计票团'],
    item: ['三列桨战船', '阿斯庇斯圆盾', '科林斯式头盔', '多律长矛', '希腊短剑', '亚麻胸甲', '青铜胸甲', '陪审员铜票', '陶片放逐票', '剧场面具', '红绘克拉特酒器', '基利克斯酒杯', '陶制油灯', '石刻法令碑', '蜡板', '雅典猫头鹰银币', '青铜镜', '香油瓶', '运动员刮汗器', '月桂冠'],
  },
  hellenistic: {
    location: ['亚历山大里亚', '安条克', '佩加蒙', '佩拉', '塞琉西亚', '罗德岛', '以弗所', '米利都', '巴克特拉', '阿伊哈努姆', '孟菲斯', '昔兰尼', '提洛岛', '科林斯', '雅典', '科斯岛', '哈利卡纳苏斯', '萨莫色雷斯岛', '叙拉古', '马格尼西亚'],
    organization: ['托勒密王廷', '塞琉古王廷', '安提柯王廷', '亚历山大里亚缪斯神庙', '亚历山大里亚图书馆', '佩加蒙图书馆', '亚该亚同盟', '埃托利亚同盟', '罗德岛议事会', '萨拉皮斯神庙', '王家铸币局', '城邦体操学校', '青年训练团', '雇佣兵团', '王室粮政署', '纸草文书院', '天文学者团', '宫廷医师院', '海港税务署', '王室使节团'],
    item: ['马其顿萨里沙长矛', '小型圆盾', '弗里吉亚式头盔', '扭力投石机', '四德拉克马银币', '纸草书卷', '王室法令碑', '镀金王冠', '青铜胸甲', '骑兵马鞍毯', '马赛克镶嵌板', '彩绘木乃伊肖像', '玻璃香油瓶', '日晷', '浑天仪', '医学器械盒', '印章戒指', '剧场面具', '陶制油灯', '航海测向盘'],
  },
}

const ancientGreekNaturalTypes = ['海湾', '海峡', '山峰', '河谷', '泉', '岬角', '平原', '岛屿', '湖', '橄榄坡']
const ancientGreekPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  archaic: {
    modifiers: ['白石', '青铜', '橄榄', '海风', '金羊', '月桂', '赤陶', '银泉', '狮门', '太阳', '蓝湾', '星岬'],
    location: { settlement: ['城邦', '卫城镇', '港城', '殖民城', '神庙镇', '山城', '海岛城', '陶工镇', '橄榄庄', '泉城'], region: ['城邦领', '氏族地', '殖民区', '海岸区', '平原区', '岛屿区', '山地区', '橄榄产区', '航路区', '圣域'], fortress: ['卫城', '石墙堡', '山口堡', '海岬堡', '城门堡', '神庙堡', '港口堡', '岛屿寨', '守望塔', '边境垒'], natural: ancientGreekNaturalTypes },
    organization: ['贵族议事会', '公民大会', '执政官团', '长老会', '神谕所', '竞技会', '祭司团', '陶工行会', '青铜匠会', '航海商会', '重装步兵团', '诗人圈'],
    item: ['圆盾', '科林斯头盔', '青铜胸甲', '长矛', '短剑', '双耳陶罐', '调酒器', '酒杯', '三足鼎', '里拉琴', '蜡板', '橄榄冠'],
  },
  classical: {
    modifiers: ['雅典娜', '海神', '月桂', '白石', '蓝海', '金冠', '赤陶', '银鸮', '剧场', '橄榄', '圣泉', '胜利'],
    location: { settlement: ['民主城邦', '军营城', '港城', '同盟城', '神庙镇', '学园城', '海岛城', '剧场镇', '橄榄庄', '泉城'], region: ['城邦领', '同盟区', '海军区', '海岸区', '平原区', '岛屿区', '山地区', '橄榄产区', '航路区', '圣域'], fortress: ['卫城', '长墙堡', '山口堡', '海岬堡', '城门堡', '神庙堡', '港口堡', '岛屿寨', '守望塔', '边境垒'], natural: ancientGreekNaturalTypes },
    organization: ['公民大会', '五百人议事会', '陪审法庭', '将军团', '城邦同盟', '哲学学园', '体操学校', '秘仪祭司团', '三列桨船主团', '悲剧诗人会', '陶工行会', '重装步兵团'],
    item: ['三列桨战船', '圆盾', '头盔', '长矛', '短剑', '陪审铜票', '陶片票', '剧场面具', '红绘陶罐', '银币', '蜡板', '月桂冠'],
  },
  hellenistic: {
    modifiers: ['亚历山大', '太阳神', '月桂', '白塔', '蓝港', '金冠', '马赛克', '银星', '缪斯', '玫瑰', '圣泉', '胜利'],
    location: { settlement: ['王都', '港城', '殖民城', '学术城', '神庙镇', '军营城', '海岛城', '商埠', '葡萄庄', '泉城'], region: ['王国领', '总督区', '军区', '海岸区', '平原区', '岛屿区', '山地区', '贸易区', '航路区', '圣域'], fortress: ['王家卫城', '石墙堡', '山口堡', '海防堡', '城门堡', '神庙堡', '军港堡', '岛屿寨', '守望塔', '边境垒'], natural: ancientGreekNaturalTypes },
    organization: ['王廷', '图书馆', '学者院', '城邦同盟', '铸币局', '体操学校', '青年训练团', '雇佣兵团', '粮政署', '纸草文书院', '宫廷医师院', '港口税署'],
    item: ['萨里沙长矛', '小圆盾', '弗里吉亚头盔', '投石机', '四德拉克马银币', '纸草卷', '法令碑', '镀金王冠', '马赛克板', '玻璃香油瓶', '日晷', '印戒'],
  },
}

function getAncientGreekPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = ancientGreekPeriodFictionalProfiles[period] ?? ancientGreekPeriodFictionalProfiles.classical
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const ancientRomePeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  republic: {
    location: ['罗马', '古罗马广场', '卡庇托利欧山', '帕拉蒂尼山', '阿文蒂诺山', '战神广场', '奥斯提亚', '阿庇亚大道', '卡普阿', '库迈', '维伊', '塔兰托', '西西里', '撒丁岛', '科西嘉岛', '迦太基', '山南高卢', '马赛利亚', '布伦迪西乌姆', '叙拉古'],
    organization: ['罗马元老院', '百人团大会', '部族大会', '平民会议', '执政官团', '裁判官团', '监察官团', '平民保民官团', '财务官团', '市政官团', '大祭司团', '占卜官团', '费提亚祭司团', '十人立法委员会', '罗马军团', '骑士阶层会议', '包税商团', '工匠社团', '粮食供应官署', '殖民城委员会'],
    item: ['西班牙式短剑', '斯库图姆盾', '标枪', '蒙特福蒂诺头盔', '锁子甲', '束棒', '军团旗', '蜡板', '铁笔', '镶边托加', '第纳里乌斯银币', '铸铜块', '印章戒指', '投票木牌', '双耳陶罐', '陶制油灯', '刮汗器', '军靴', '纸草卷', '青铜镜'],
  },
  empire: {
    location: ['罗马', '奥斯提亚', '庞贝', '赫库兰尼姆', '拉文纳', '阿奎莱亚', '伦敦尼姆', '卢格杜努姆', '特里尔', '科洛尼亚', '安条克', '以弗所', '亚历山大里亚', '迦太基', '勒普蒂斯马格纳', '耶路撒冷', '多瑙河防线', '哈德良长城', '阿庇亚大道', '图拉真广场'],
    organization: ['皇帝宫廷', '罗马元老院', '禁卫军', '城市警备队', '维吉勒消防队', '帝国秘书处', '帝国邮驿', '帝国财政署', '行省总督府', '军团司令部', '第一意大利军团', '第二奥古斯塔军团', '第十海峡军团', '罗马粮食供应署', '罗马供水署', '城市建筑署', '皇帝崇拜祭司团', '工匠社团', '船主公会', '税务承包商会'],
    item: ['罗马短剑', '匕首', '环片甲', '锁子甲', '斯库图姆盾', '标枪', '军团鹰旗', '军团标旗', '退伍军人铜牒', '塞斯特斯铜币', '奥里乌斯金币', '蜡板', '纸草卷', '陶制油灯', '印章戒指', '玻璃香水瓶', '青铜医疗器械', '军靴', '道路里程碑', '马赛克地板砖'],
  },
}

const ancientRomeNaturalTypes = ['河湾', '山丘', '湖', '谷地', '泉', '海湾', '森林', '平原', '海岬', '沼泽']
const ancientRomePeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  republic: {
    modifiers: ['朱庇特', '母狼', '鹰旗', '月桂', '红山', '白石', '银泉', '橄榄', '战神', '北门', '金麦', '台伯'],
    location: { settlement: ['殖民城', '市镇', '军营城', '港城', '论坛镇', '农庄镇', '山城', '河港', '驿站城', '神庙镇'], region: ['共和国领', '行省', '公地', '农庄区', '海岸区', '谷地区', '山地区', '殖民区', '道路区', '圣域'], fortress: ['军营堡', '石墙城', '山口堡', '海防堡', '城门堡', '河防堡', '道路堡', '边境垒', '守望塔', '港口堡'], natural: ancientRomeNaturalTypes },
    organization: ['元老院', '公民大会', '平民会议', '执政官团', '裁判官团', '监察官团', '保民官团', '军团', '祭司团', '包税商团', '工匠社团', '殖民委员会'],
    item: ['短剑', '长盾', '标枪', '头盔', '锁子甲', '束棒', '军团旗', '蜡板', '银币', '印戒', '投票木牌', '军靴'],
  },
  empire: {
    modifiers: ['奥古斯都', '鹰旗', '月桂', '紫袍', '红堡', '白石', '银泉', '太阳', '凯旋', '北门', '金麦', '台伯'],
    location: { settlement: ['行省城', '军团城', '港城', '论坛镇', '退伍军人城', '驿站城', '山城', '河港', '商埠', '神庙镇'], region: ['帝国行省', '总督区', '军区', '农庄区', '海岸区', '谷地区', '山地区', '殖民区', '道路区', '圣域'], fortress: ['军团堡', '石墙城', '山口堡', '海防堡', '城门堡', '河防堡', '道路堡', '边境垒', '守望塔', '军港堡'], natural: ancientRomeNaturalTypes },
    organization: ['皇帝宫廷', '元老院', '禁卫军', '城市警备队', '消防队', '帝国秘书处', '邮驿署', '行省总督府', '军团', '祭司团', '船主公会', '工匠社团'],
    item: ['短剑', '匕首', '环片甲', '长盾', '标枪', '鹰旗', '铜牒', '金币', '蜡板', '印戒', '玻璃香瓶', '马赛克砖'],
  },
}

function getAncientRomePeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = ancientRomePeriodFictionalProfiles[period] ?? ancientRomePeriodFictionalProfiles.empire
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const egyptianPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  ancient: {
    location: ['底比斯', '孟菲斯', '吉萨', '萨卡拉', '阿拜多斯', '阿玛尔纳', '卡尔纳克', '卢克索', '象岛', '阿斯旺', '埃德富', '丹德拉', '希拉孔波利斯', '代尔麦地那', '帝王谷', '法尤姆', '尼罗河三角洲', '赫利奥波利斯', '布巴斯提斯', '塔尼斯'],
    organization: ['法老王廷', '维西尔官署', '阿蒙神庙', '卜塔神庙', '拉神祭司团', '生命之屋', '王家书记官团', '代尔麦地那工匠村', '王家谷仓署', '王室宝库', '梅杰卫队', '纯洁祭司团', '尼罗河测量署', '王家采石队', '金矿远征队', '木乃伊作坊', '神庙乐师团', '宫廷医师院', '王家船队', '地方诺姆总督府'],
    item: ['生命符', '纸草卷', '圣甲虫护符', '沙布提俑', '卡诺匹斯罐', '叉铃', '梅纳特项链', '牧杖与连枷', '杰德柱护符', '荷鲁斯之眼护符', '调色板', '芦苇笔', '陶片文书', '亚麻裹尸布', '彩釉珠项链', '镰形剑', '复合弓', '战车', '腕尺', '圣甲虫印章'],
  },
  ptolemaic: {
    location: ['亚历山大里亚', '孟菲斯', '底比斯', '法尤姆', '瑙克拉提斯', '卡诺普斯', '佩卢西乌姆', '菲莱岛', '埃德富', '丹德拉', '赫尔摩波利斯', '奥克西林库斯', '阿尔西诺伊', '帕诺波利斯', '利科波利斯', '科普托斯', '埃勒潘蒂尼', '罗塞塔', '尼罗河三角洲', '马雷奥蒂斯湖'],
    organization: ['托勒密王廷', '亚历山大里亚缪斯神庙', '亚历山大里亚图书馆', '萨拉皮斯神庙', '王家财政署', '总管官署', '地方将军府', '神庙祭司会议', '王家铸币局', '纸草档案署', '粮食征收署', '尼罗河航运署', '亚历山大里亚市议会', '王家法庭', '希腊裔军团', '埃及裔军团', '宫廷医师院', '天文学者团', '海关税务署', '王室使节团'],
    item: ['托勒密四德拉克马银币', '纸草法令', '罗塞塔石碑', '彩釉护符', '镀金木乃伊面具', '玻璃香油瓶', '萨拉皮斯神像', '伊西斯叉铃', '王家印章', '希腊式调酒器', '埃及式卡诺匹斯罐', '青铜油灯', '芦苇笔盒', '天文星表', '水钟', '日晷', '医学器械盒', '测深铅锤', '亚麻长袍', '镀金花冠'],
  },
  modern: {
    location: ['开罗', '亚历山大港', '吉萨', '卢克索', '阿斯旺', '塞得港', '苏伊士', '伊斯梅利亚', '曼苏拉', '坦塔', '扎加齐格', '明亚', '艾斯尤特', '索哈杰', '基纳', '赫尔格达', '沙姆沙伊赫', '达米埃塔', '法尤姆', '新河谷'],
    organization: ['埃及议会', '开罗大学', '亚历山大大学', '爱资哈尔大学', '埃及国家图书馆', '埃及博物馆', '大埃及博物馆', '埃及国家铁路', '苏伊士运河管理局', '埃及气象局', '埃及红新月会', '埃及国家档案馆', '埃及考古最高委员会', '开罗歌剧院', '埃及广播电视联合会', '埃及中央银行', '埃及国家研究中心', '尼罗河水资源研究所', '亚历山大图书馆', '埃及旅游促进局'],
    item: ['电子身份证', '城市交通卡', '智能手机', '笔记本电脑', '数码相机', '无线耳机', '电子护照', '铁路车票', '地铁月票', '银行卡', '图书馆借阅证', '博物馆门票', '考古许可卡', '太阳镜', '便携水壶', '移动电源', '遮阳帽', '纸质地图', '旅行背包', '录音笔'],
  },
}

const egyptianNaturalTypes = ['河湾', '绿洲', '沙丘', '干谷', '湖', '盐沼', '河洲', '峭壁', '三角洲', '泉']
const egyptianPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  ancient: {
    modifiers: ['太阳盘', '金隼', '蓝莲', '黑土', '红沙', '圣甲虫', '月河', '白石', '芦苇', '棕榈', '王冠', '星门'],
    location: { settlement: ['王城', '神庙城', '河港城', '工匠村', '谷仓镇', '绿洲镇', '采石镇', '墓园城', '河洲村', '商旅站'], region: ['诺姆', '王室领', '神庙领', '河谷区', '三角洲区', '绿洲区', '沙漠区', '采石区', '农田区', '圣域'], fortress: ['边塞堡', '河防堡', '沙漠堡', '城门堡', '神庙堡', '军营', '山口堡', '绿洲堡', '守望塔', '港口堡'], natural: egyptianNaturalTypes },
    organization: ['法老王廷', '维西尔署', '神庙祭司团', '生命之屋', '书记官团', '工匠村', '谷仓署', '王室宝库', '梅杰卫队', '采石队', '木乃伊作坊', '宫廷医师院'],
    item: ['生命符', '纸草卷', '圣甲虫护符', '沙布提俑', '卡诺匹斯罐', '叉铃', '梅纳特项链', '权杖', '杰德柱护符', '芦苇笔', '镰形剑', '战车'],
  },
  ptolemaic: {
    modifiers: ['法罗斯', '萨拉皮斯', '金隼', '蓝莲', '海港', '纸草', '月河', '白塔', '马赛克', '棕榈', '王冠', '星门'],
    location: { settlement: ['王都', '神庙城', '海港城', '纸草镇', '谷仓镇', '绿洲镇', '学术城', '墓园城', '河洲村', '商埠'], region: ['王室领', '总管区', '神庙领', '河谷区', '三角洲区', '绿洲区', '沙漠区', '贸易区', '农田区', '圣域'], fortress: ['王家堡', '河防堡', '海防堡', '城门堡', '神庙堡', '军营', '山口堡', '绿洲堡', '守望塔', '港口堡'], natural: egyptianNaturalTypes },
    organization: ['托勒密王廷', '缪斯神庙', '图书馆', '萨拉皮斯祭司团', '王家财政署', '铸币局', '纸草档案署', '粮食征收署', '航运署', '市议会', '宫廷医师院', '海关税务署'],
    item: ['四德拉克马银币', '纸草法令', '彩釉护符', '木乃伊肖像', '玻璃香油瓶', '萨拉皮斯神像', '叉铃', '王家印章', '调酒器', '青铜油灯', '水钟', '镀金花冠'],
  },
  modern: {
    modifiers: ['尼罗河', '开罗', '亚历山大', '绿洲', '红海', '金字塔', '棕榈', '白城', '新港', '太阳', '蓝湾', '沙海'],
    location: { settlement: ['市', '城区', '大学城', '港区', '铁路镇', '绿洲镇', '卫星城', '社区', '市场镇', '旅游城'], region: ['都市区', '行政区', '产业区', '大学区', '滨海区', '保护区', '交通区', '河谷区', '绿洲区', '三角洲区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: egyptianNaturalTypes },
    organization: ['市议会', '大学学院', '国家铁路', '广播中心', '考古委员会', '博物馆', '水资源研究所', '港务公司', '公共图书馆', '红新月会', '气象局', '旅游促进局'],
    item: ['交通卡', '铁路车票', '电子护照', '智能手机', '笔记本电脑', '数码相机', '无线耳机', '银行卡', '考古许可卡', '便携水壶', '移动电源', '遮阳帽'],
  },
}

function getEgyptianPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = egyptianPeriodFictionalProfiles[period] ?? egyptianPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const celticPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  ogham: {
    location: ['阿德莫尔欧甘石群|Ardmore ogham stones', '巴林塔加特欧甘石群|Ballintaggart ogham stones', '敦洛石窟欧甘石|Cave of Dunloe ogham stones', '德拉姆洛汉欧甘石群|Drumlohan ogham stones', '基尔马尔基达尔遗址|Kilmalkedar ogham site', '诺克博伊欧甘石群|Knockboy ogham stones', '拉塔斯欧甘石|Ratass ogham stone', '拉斯克罗根欧甘石|Rathcroghan ogham stone', '里斯莫尔欧甘石|Lismore ogham stone', '阿德弗特欧甘石|Ardfert ogham stone', '库米诺尔欧甘石|Coumeenole ogham stone', '斯凯特里岛欧甘石|Scattery Island ogham stone', '埃姆拉东欧甘石|Emlagh East ogham stone', '基纳德东欧甘石|Kinard East ogham stone', '莫纳塔加特欧甘石|Monataggart ogham stone'],
    organization: ['图阿哈地方共同体', '芬尼亲族共同体', '王族随从团', '部族大会', '亲族长老团', '法律记忆者群体', '诗人阶层', '战士随从队', '金属工匠家户', '石刻工匠群体', '早期教会共同体', '环形堡垒聚落共同体'],
    item: ['欧甘铭文石', '带十字欧甘石', '石制旋转磨盘', '铁制矛头', '铁制短刀', '环首别针', '半环形胸针', '玻璃珠串', '骨梳', '陶制炊罐', '纺轮', '青铜碗', '盾牌包边', '木桶铁箍', '皮革带扣'],
  },
  'early-medieval': {
    location: ['塔拉山', '纳文堡', '克鲁坎', '卡舍尔岩', '克朗麦克诺伊斯', '格兰达洛', '阿马', '基尔代尔', '德里', '克洛纳德', '班戈', '伊尼什默里岛', '斯凯利格迈克尔岛', '内湖', '香农河', '博因河', '利菲河', '康诺特', '芒斯特', '伊尼斯凯尔特拉', '德文尼什岛', '莫纳斯特博伊斯', '杜罗', '比尔', '科里布湖', '厄恩湖', '斯利夫布卢姆山', '多尼戈尔', '卡舍尔王岩', '洛赫德格'],
    organization: ['北方乌尼尔王族', '南方乌尼尔王族', '欧甘纳赫塔王族', '塔拉王廷', '布雷洪法学家团', '菲利诗人团', '图阿哈部族议会', '阿马修道院', '克朗麦克诺伊斯修道院', '格兰达洛修道院', '基尔代尔修道院', '克洛纳德学修院', '班戈修道院', '王家侍从团', '编年史抄写院', '金属工匠会', '传教士团', '部族使者团', '克朗纳德学派', '杜罗修道院', '比尔修道院', '德文尼什修道院', '利斯莫尔修道院', '罗斯克里修道院', '费恩斯修道院', '图阿姆主教团', '莫纳斯特博伊斯修院', '阿达圣职团', '盖尔王家诗人团', '爱尔兰法学家团'],
    item: ['塔拉胸针', '阿达圣餐杯', '凯尔经', '牧杖', '圣物匣', '小竖琴', '长剑', '短矛', '木皮盾', '欧甘石碑', '手摇铃', '旋转石磨', '羊毛披风', '青铜别针', '皮革书套', '牛角酒杯', '骨梳', '蜡板', '铁制坩埚', '彩饰手抄本', '德里南十字架', '阿达圣餐杯复制件', '德林纳弗兰圣餐杯', '阿尔达圣杯', '圣帕特里克铜钟', '圣科伦巴凯萨奇书', '杜罗书', '阿马书', '莫伊洛夫腰带圣龛', '斯托圣礼书'],
  },
  medieval: {
    location: ['都柏林', '沃特福德', '科克', '利默里克', '戈尔韦', '基尔肯尼', '韦克斯福德', '德罗赫达', '阿斯隆', '斯莱戈', '特拉利', '恩尼斯', '卡舍尔', '阿马', '克朗麦克诺伊斯', '康尼马拉', '伯伦', '香农河', '博因河谷', '基拉尼湖', '克朗梅尔', '金塞尔', '尤格尔', '特里姆', '卡里克弗格斯', '邓甘农', '卡赫', '罗斯康芒', '洛赫德格', '多尼戈尔镇'],
    organization: ['奥布莱恩氏族', '奥尼尔氏族', '奥唐奈氏族', '奥康纳氏族', '麦卡锡氏族', '伯克氏族', '盖尔领主会议', '布雷洪法庭', '吟游诗人学校', '医师家族学社', '修道院抄写院', '都柏林商人行会', '沃特福德船主会', '戈尔韦部族议会', '科克织工行会', '利默里克港务会', '教区主教会议', '城堡守备队', '马匹交易会', '巡回诗人团', '奥弗莱厄蒂氏族', '奥卡罗尔氏族', '奥马奥尼氏族', '麦克马洪氏族', '奥基夫氏族', '奥赫利氏族', '基尔代尔大主教座堂会', '都柏林圣三一修院', '沃特福德船匠行会', '盖尔法学家大会'],
    item: ['盖尔长剑', '战斧', '圆盾', '锁子甲', '铁头盔', '猎矛', '爱尔兰竖琴', '羊皮法典', '氏族印章', '银胸针', '羊毛斗篷', '圣物匣', '手抄祈祷书', '港口通行证', '商人账册', '蜡封契约', '马鞍', '陶制酒壶', '木制酒杯', '铜制烛台', '凯尔特环形胸针', '盖尔棋盘', '牛角号', '修道院墨水瓶', '抄写员羽笔', '皮革钱袋', '木制纺轮', '铁制锅', '船用舵桨', '石制圣井盖'],
  },
  modern: {
    location: ['都柏林', '科克', '利默里克', '戈尔韦', '沃特福德', '德罗赫达', '邓多克', '斯莱戈', '基尔肯尼', '韦克斯福德', '阿斯隆', '特拉利', '恩尼斯', '基拉尼', '纳文', '卡洛', '图拉莫尔', '莱特肯尼', '香农', '克朗梅尔', '梅努斯', '基拉尼国家公园', '班特里', '韦斯特波特', '斯莱戈湾', '都柏林湾', '阿兰群岛', '劳斯郡', '米斯郡', '蒂珀雷里'],
    organization: ['爱尔兰议会', '爱尔兰总统府', '都柏林大学圣三一学院', '都柏林大学学院', '爱尔兰国立大学戈尔韦分校', '科克大学学院', '爱尔兰国家博物馆', '爱尔兰国家图书馆', '爱尔兰国家档案馆', '爱尔兰铁路', '都柏林交通局', '爱尔兰语委员会', '爱尔兰广播电视台', '盖尔运动协会', '爱尔兰红十字会', '爱尔兰海岸警卫队', '爱尔兰气象局', '爱尔兰艺术委员会', '爱尔兰遗产委员会', '都柏林市议会', '爱尔兰国家大学梅努斯分校', '爱尔兰国家美术馆', '爱尔兰电影协会', '爱尔兰国家歌剧院', '爱尔兰国家公园与野生动物管理局', '爱尔兰海事研究所', '爱尔兰国家剧院', '爱尔兰作家中心', '爱尔兰设计与工艺委员会', '爱尔兰公共图书馆协会'],
    item: ['公共交通卡', '电子护照', '驾照', '智能手机', '笔记本电脑', '数码相机', '无线耳机', '盖尔式曲棍球杆', '爱尔兰式足球', '宝思兰鼓', '锡哨', '现代竖琴', '图书馆借阅证', '铁路车票', '博物馆年卡', '防水外套', '保温杯', '旅行背包', '移动电源', '城市自行车卡', '爱尔兰语教材', '橄榄球球衣', '海岸徒步地图', '手工羊毛毛衣', '传统音乐录音', '社区花园卡', '都柏林公交卡', '国家公园通行证', '救生衣', '可重复使用水瓶'],
  },
}

const celticNaturalTypes = ['湖', '河谷', '海湾', '海岬', '山岭', '泥炭地', '草原', '岛屿', '林地', '石灰岩地']
const celticPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  ogham: {
    modifiers: ['鹿角', '野猪', '橡林', '石缘', '海雾', '黑刺李', '银鲑', '红枝', '冬湖', '岩湾', '灰丘', '白榛'],
    location: { settlement: ['环形堡聚落', '湖岸农庄', '石砌寨', '海岬聚落', '河谷农庄', '林地聚落', '岛上聚落', '山麓农庄', '围栏村落', '地下仓窖聚落'], region: ['图阿哈领地', '亲族地', '牧地', '河谷地', '岛屿地', '林地区', '海岸区', '泥炭区', '山麓地', '岩丘地'], fortress: ['环形堡', '海岬堡', '木栅寨', '石砌寨', '丘顶堡', '河口堡', '岛寨', '守望垒', '围栏堡', '岩丘堡'], natural: celticNaturalTypes },
    organization: ['地方共同体', '亲族共同体', '王族随从团', '部族大会', '亲族长老团', '法律记忆者群体', '诗人群体', '战士随从队', '金属工匠家户', '石刻工匠群体', '早期教会共同体', '农牧家户联盟'],
    item: ['欧甘铭文石', '旋转磨盘', '铁矛头', '铁短刀', '环首别针', '半环形胸针', '玻璃珠串', '骨梳', '陶炊罐', '纺轮', '青铜碗', '皮革带扣'],
  },
  'early-medieval': {
    modifiers: ['白鹿', '红枝', '塔拉', '圣井', '橡林', '银鲑', '乌鸦', '绿丘', '石环', '海雾', '金琴', '冬湖'],
    location: { settlement: ['王城', '修道院村', '部族寨', '河谷村', '海湾镇', '圣井村', '农场聚落', '岛屿村', '林地寨', '山麓村'], region: ['王国领', '部族地', '修道院领', '牧地', '河谷区', '岛屿区', '林地区', '海岸区', '泥炭区', '圣域'], fortress: ['山丘堡', '木栅寨', '海岬堡', '石环寨', '河口堡', '修院堡', '岛屿寨', '林地堡', '守望塔', '边境垒'], natural: celticNaturalTypes },
    organization: ['王廷', '部族议会', '布雷洪法庭', '诗人团', '修道院', '抄写院', '传教士团', '金属工匠会', '王家侍从团', '使者团', '农场主会', '船主会'],
    item: ['胸针', '圣餐杯', '手抄本', '牧杖', '圣物匣', '竖琴', '长剑', '短矛', '木皮盾', '欧甘石', '手摇铃', '羊毛披风'],
  },
  medieval: {
    modifiers: ['奥克', '红枝', '圣井', '橡林', '银鲑', '乌鸦', '绿丘', '石堡', '海雾', '金琴', '冬湖', '白塔'],
    location: { settlement: ['氏族城', '修道院镇', '港城', '河谷村', '海湾镇', '集市镇', '农庄', '岛屿村', '林地镇', '城堡镇'], region: ['领主领', '氏族地', '修道院领', '牧地', '河谷区', '岛屿区', '林地区', '海岸区', '商路区', '教区'], fortress: ['石堡', '木栅寨', '海岬堡', '山丘堡', '河口堡', '修院堡', '岛屿寨', '城门堡', '守望塔', '边境垒'], natural: celticNaturalTypes },
    organization: ['氏族议会', '布雷洪法庭', '诗人学校', '医师学社', '修道院', '抄写院', '商人行会', '船主会', '织工行会', '港务会', '城堡卫队', '马匹交易会'],
    item: ['长剑', '战斧', '圆盾', '锁子甲', '头盔', '竖琴', '羊皮法典', '氏族印章', '银胸针', '羊毛斗篷', '蜡封契约', '马鞍'],
  },
  modern: {
    modifiers: ['都柏林', '绿岛', '香农', '大西洋', '白鹿', '红枝', '圣井', '海风', '金琴', '石桥', '冬湖', '橡林'],
    location: { settlement: ['市', '城区', '大学城', '海滨镇', '铁路镇', '港区', '卫星城', '社区', '市场镇', '文化城'], region: ['都市区', '行政区', '产业区', '大学区', '滨海区', '保护区', '交通区', '河谷区', '湖区', '乡村区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: celticNaturalTypes },
    organization: ['市议会', '大学学院', '铁路公司', '广播中心', '语言委员会', '博物馆', '遗产委员会', '海岸警卫队', '公共图书馆', '运动协会', '艺术委员会', '红十字会'],
    item: ['交通卡', '电子护照', '智能手机', '笔记本电脑', '数码相机', '无线耳机', '曲棍球杆', '宝思兰鼓', '锡哨', '图书证', '防水外套', '移动电源'],
  },
}

function getCelticPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = celticPeriodFictionalProfiles[period] ?? celticPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const slavicEastPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  medieval: {
    location: ['基辅', '切尔尼戈夫', '佩列亚斯拉夫', '加利奇', '沃洛德米尔', '卢茨克', '图罗夫', '诺夫霍罗德-锡韦尔斯基', '普季夫利', '基辅比洛霍罗德', '维什霍罗德', '奥夫鲁奇', '卡尼夫', '霍尔姆', '巴科塔洞窟修道院', '第聂伯河', '德斯纳河', '南布格河', '罗斯河', '喀尔巴阡山麓', '兹韦尼霍罗德', '捷列博夫利亚', '佩列索普尼察', '多罗霍布日', '伊斯科罗斯滕', '柳别奇', '维蒂切夫', '扎鲁布', '布斯克', '普利斯涅斯克'],
    organization: ['基辅大公王廷', '切尔尼戈夫公王廷', '佩列亚斯拉夫公王廷', '加利奇公王廷', '基辅维彻大会', '王公亲兵队', '千人长军团', '城市民兵团', '基辅洞窟修道院', '圣索菲亚主教座堂会', '鲁塞尼亚书记院', '王公税吏团', '商旅兄弟会', '第聂伯船主会', '铁匠工坊', '皮革匠行会', '蜡烛商会', '盐商队', '边境守望队', '教会法庭', '沃洛德米尔公王廷', '卢茨克公王廷', '图罗夫主教座堂会', '加利奇贵族会议', '佩列索普尼察修道院', '霍尔姆主教团', '普季夫利守备队', '德斯纳船主会', '盐路商旅会', '鲁塞尼亚圣像画师坊'],
    item: ['基辅格里夫纳银锭', '双刃长剑', '战斧', '长矛', '圆盾', '锁子甲', '锥形头盔', '圣像', '羊皮文书', '蜡封印章', '王公铅印', '蜡板', '纺轮', '玻璃手镯', '陶制双耳罐', '骨梳', '马镫', '皮靴', '木制酒杯', '河船桨', '基辅珐琅科尔特耳饰', '板岩纺轮', '十字形吊坠', '桦皮篮', '青铜恩科尔皮翁', '釉陶砖', '铁制镰刀', '皮革箭囊', '骨制针盒', '河船锚'],
  },
  imperial: {
    location: ['基辅', '利沃夫', '切尔尼戈夫', '波尔塔瓦', '佩列亚斯拉夫', '奇吉林', '巴图林', '哈尔科夫', '敖德萨', '卡缅涅茨-波多利斯基', '乌曼', '涅任', '卢茨克', '捷尔诺波尔', '伊万诺-弗兰科夫斯克', '扎波罗热', '第聂伯河', '南布格河', '黑海北岸', '喀尔巴阡山', '科诺托普', '格卢霍夫', '米尔霍罗德', '克列缅丘格', '白采尔科维', '别尔季切夫', '穆卡切沃', '布恰奇', '霍京', '克里米亚草原'],
    organization: ['扎波罗热塞契', '哥萨克盖特曼国', '总军事书记处', '哥萨克总议会', '团级书记处', '百人队行政署', '基辅莫希拉学院', '利沃夫圣母安息兄弟会', '切尔尼戈夫学院', '佩列亚斯拉夫团', '波尔塔瓦团', '涅任团', '黑海哥萨克军团', '科布扎盲艺人团', '东仪天主教会', '启蒙协会', '舍甫琴科科学学会', '利沃夫出版会', '敖德萨港务会', '乌克兰戏剧团', '基辅兄弟会', '卢茨克十字架高举兄弟会', '哈尔科夫学院', '格卢霍夫歌唱学校', '奇吉林盖特曼府', '米尔霍罗德团', '普里卢基团', '切尔卡瑟团', '乌克兰考古委员会', '鲁塞尼亚三人会'],
    item: ['盖特曼权杖', '邦丘克旌旗', '哥萨克军刀', '燧发手枪', '火绳枪', '科布扎琴', '班杜拉琴', '哥萨克登记册', '团旗', '军印', '刺绣衬衫', '复活节彩蛋', '圣像', '皮烟草袋', '火药角', '马鞍', '羊皮文书', '印刷祈祷书', '港口货票', '怀表', '盖特曼印玺', '团级军旗', '百人队名册', '木制火药筒', '刺绣腰带', '科布扎琴弦盒', '彩绘陶碗', '盐商货票', '手抄歌谣集', '蜡封军令'],
  },
  modern: {
    location: ['基辅', '哈尔科夫', '敖德萨', '第聂伯罗', '利沃夫', '扎波罗热', '克里维里赫', '尼古拉耶夫', '文尼察', '赫尔松', '波尔塔瓦', '切尔尼戈夫', '切尔卡瑟', '日托米尔', '苏梅', '罗夫诺', '卢茨克', '捷尔诺波尔', '乌日霍罗德', '伊万诺-弗兰科夫斯克', '克列缅丘格', '克罗皮夫尼茨基', '切尔诺夫策', '马里乌波尔', '卡缅斯科耶', '白采尔科维', '科诺托普', '穆卡切沃', '乌克兰喀尔巴阡山', '多瑙河三角洲乌克兰段'],
    organization: ['乌克兰最高拉达', '乌克兰国家银行', '基辅国立大学', '利沃夫国立大学', '哈尔科夫国立大学', '乌克兰国家图书馆', '乌克兰国家档案馆', '乌克兰铁路', '乌克兰国家广播公司', '乌克兰国家博物馆', '乌克兰科学院', '国家紧急情况局', '乌克兰红十字会', '乌克兰气象中心', '第聂伯河水资源局', '基辅市议会', '利沃夫市议会', '乌克兰作家协会', '乌克兰电影档案馆', '喀尔巴阡生态研究所', '乌克兰国家艺术博物馆', '乌克兰国家历史博物馆', '敖德萨国立大学', '切尔诺夫策国立大学', '乌克兰国家歌剧院', '乌克兰图书协会', '乌克兰班杜拉演奏家联盟', '乌克兰自然保护协会', '乌克兰国家电影资料馆', '乌克兰水文气象研究所'],
    item: ['电子身份证', '电子护照', '城市交通卡', '铁路车票', '智能手机', '笔记本电脑', '数码相机', '无线耳机', '银行卡', '图书馆借阅证', '刺绣衬衫', '班杜拉琴', '博物馆门票', '防寒外套', '旅行背包', '移动电源', '道路地图', '录音笔', '保温杯', '自行车卡', '乌克兰语键盘贴', '刺绣毛巾', '传统彩绘蛋套装', '班杜拉琴谱', '城市共享单车卡', '喀尔巴阡徒步地图', '防空警报应用终端', '电子铁路通票', '民俗博物馆年卡', '可重复使用购物袋'],
  },
}

const slavicEastNaturalTypes = ['河湾', '草原', '森林', '山岭', '湖', '沼泽', '河谷', '丘陵', '河洲', '峡口']
const slavicEastPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  medieval: {
    modifiers: ['金门', '白桦', '第聂伯', '圣像', '红盾', '银钟', '黑土', '鹰丘', '松林', '月河', '冬堡', '麦穗'],
    location: { settlement: ['公国城', '河港城', '修道院镇', '商旅镇', '农庄村', '军营城', '林地村', '渡口镇', '山麓城', '集市镇'], region: ['公国领', '王公领', '修道院领', '草原区', '河谷区', '森林区', '边地区', '农田区', '商路区', '教区'], fortress: ['木墙城', '河防堡', '山口堡', '边境堡', '城门堡', '修院堡', '军营堡', '守望塔', '石垒', '渡口堡'], natural: slavicEastNaturalTypes },
    organization: ['王公王廷', '维彻大会', '亲兵队', '城市民兵', '修道院', '书记院', '税吏团', '船主会', '铁匠工坊', '盐商队', '边境守望队', '教会法庭'],
    item: ['格里夫纳银锭', '长剑', '战斧', '长矛', '圆盾', '锁子甲', '锥形头盔', '圣像', '羊皮文书', '王公铅印', '蜡板', '玻璃手镯'],
  },
  imperial: {
    modifiers: ['盖特曼', '第聂伯', '黑海', '金穗', '蓝旗', '红莓', '白桦', '鹰原', '哥萨克', '月河', '冬堡', '绿丘'],
    location: { settlement: ['团城', '塞契镇', '河港城', '学院城', '农庄村', '军镇', '林地村', '渡口镇', '山麓城', '集市镇'], region: ['盖特曼领', '团辖区', '百人队区', '草原区', '河谷区', '森林区', '边地区', '农田区', '商路区', '教区'], fortress: ['塞契堡', '河防堡', '山口堡', '边境堡', '城门堡', '军营堡', '炮台', '守望塔', '石垒', '渡口堡'], natural: slavicEastNaturalTypes },
    organization: ['盖特曼府', '哥萨克总议会', '团级书记处', '百人队署', '学院', '兄弟会', '科布扎艺人团', '出版会', '港务会', '戏剧团', '马匹商会', '边境守望队'],
    item: ['权杖', '邦丘克旌旗', '军刀', '燧发手枪', '火绳枪', '科布扎琴', '班杜拉琴', '哥萨克登记册', '团旗', '军印', '刺绣衬衫', '火药角'],
  },
  modern: {
    modifiers: ['基辅', '第聂伯', '黑海', '金穗', '蓝旗', '红莓', '白桦', '绿丘', '新城', '银轨', '喀尔巴阡', '向日葵'],
    location: { settlement: ['市', '城区', '大学城', '港区', '铁路镇', '工业城', '卫星城', '社区', '市场镇', '文化城'], region: ['都市区', '行政区', '产业区', '大学区', '滨海区', '保护区', '交通区', '河谷区', '森林区', '草原区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: slavicEastNaturalTypes },
    organization: ['市议会', '大学学院', '国家铁路', '广播中心', '科学院', '博物馆', '档案馆', '生态研究所', '公共图书馆', '红十字会', '作家协会', '水资源局'],
    item: ['交通卡', '铁路车票', '电子护照', '智能手机', '笔记本电脑', '数码相机', '无线耳机', '银行卡', '刺绣衬衫', '班杜拉琴', '移动电源', '道路地图'],
  },
}

function getSlavicEastPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = slavicEastPeriodFictionalProfiles[period] ?? slavicEastPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const dutchLowlandsPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  medieval: {
    location: ['布鲁日', '根特', '伊普尔', '安特卫普', '乌得勒支', '多德雷赫特', '哈勒姆', '莱顿', '代尔夫特', '豪达', '兹沃勒', '代芬特尔', '坎彭', '马斯特里赫特', '斯海尔托亨博斯', '吕伐登', '格罗宁根', '马斯河', '斯海尔德河', '须德海', '梅赫伦', '鲁汶', '米德尔堡', '奈梅亨', '聚特芬', '阿尔克马尔', '达默', '登布里尔', '阿默斯福特', '泽兰群岛'],
    organization: ['佛兰德伯爵宫廷', '荷兰伯爵宫廷', '乌得勒支主教领', '布鲁日布商行会', '根特织工行会', '伊普尔呢绒行会', '安特卫普商人会', '多德雷赫特市议会', '汉萨同盟低地商站', '水务委员会', '堤坝管理会', '圣路加画家行会', '啤酒酿造行会', '船匠行会', '鱼商行会', '肉商行会', '城市民兵团', '城门守备队', '修道院抄写院', '港口税务会', '鲁汶市议会', '梅赫伦大议会', '泽兰省议会', '乌得勒支座堂会', '达默港务会', '代芬特尔书商行会', '坎彭船主会', '哈勒姆酿酒师行会', '豪达蜡烛匠行会', '莱顿呢绒检验会'],
    item: ['佛兰德呢绒', '行会印章', '商人账册', '汉萨齿轮船', '羊皮特许状', '蜡封契约', '木制啤酒杯', '铜制烛台', '城市钥匙', '行会旗', '十字弩', '长矛', '锁子甲', '羊毛斗篷', '织布梭', '染料罐', '银币', '港口通行证', '船用绳索', '堤坝测量杆', '呢绒检验铅封', '木制纺车', '运河驳船桨', '堤坝木桩', '城市钟锤', '皮革钱袋', '陶制酒壶', '盐鲱鱼桶', '羊毛剪刀', '羊皮账簿'],
  },
  'early-modern': {
    location: ['阿姆斯特丹', '鹿特丹', '海牙', '莱顿', '代尔夫特', '哈勒姆', '乌得勒支', '多德雷赫特', '米德尔堡', '霍伦', '恩克赫伊曾', '阿尔克马尔', '格罗宁根', '吕伐登', '兹沃勒', '代芬特尔', '布雷达', '须德海', '莱茵河口', '瓦登海', '弗利辛恩', '赞丹', '豪达', '斯希丹', '登布里尔', '阿默斯福特', '海尔德兰', '泽兰', '泰瑟尔岛', '马肯岛'],
    organization: ['尼德兰联省议会', '荷兰省议会', '荷兰东印度公司', '荷兰西印度公司', '阿姆斯特丹海军部', '鹿特丹海军部', '泽兰海军部', '阿姆斯特丹交易所', '阿姆斯特丹银行', '莱顿大学', '圣路加画家行会', '堤坝水务委员会', '城市射手公会', '船主商会', '鲱鱼渔业公会', '地图师行会', '印刷商行会', '郁金香商人会', '港口税务署', '城市孤儿院董事会', '北荷兰海军部', '弗里斯兰海军部', '德尔夫兰水务局', '莱茵兰水务局', '阿姆斯特丹外科医师公会', '代尔夫特陶工行会', '哈勒姆圣路加行会', '鹿特丹商人会', '米德尔堡钱币铸造局', '荷兰制图师协会'],
    item: ['福禄特商船', '火绳枪', '燧发枪', '细剑', '海军军刀', '代尔夫特蓝陶', '郁金香图录', '世界航海图', '黄铜罗盘', '船用沙漏', '银盾币', '商人账册', '股票凭证', '蜡封契约', '油画颜料盒', '铜制显微镜', '望远镜', '印刷地图册', '鲱鱼桶', '蕾丝领饰', '航海日志', '东印度公司代币', '铅制货物封印', '运河驳船模型', '铜版地图', '木制冰鞋', '烟斗', '药剂师陶罐', '商船旗', '堤坝测量链'],
  },
  modern: {
    location: ['阿姆斯特丹', '鹿特丹', '海牙', '乌得勒支', '埃因霍温', '蒂尔堡', '格罗宁根', '阿尔梅勒', '布雷达', '奈梅亨', '恩斯赫德', '哈勒姆', '阿纳姆', '赞斯塔德', '阿默斯福特', '阿珀尔多伦', '斯海尔托亨博斯', '马斯特里赫特', '莱顿', '多德雷赫特', '吕伐登', '兹沃勒', '代尔夫特', '豪达', '阿尔克马尔', '米德尔堡', '弗利辛恩', '霍伦', '泰瑟尔岛', '瓦登海'],
    organization: ['荷兰议会', '荷兰国家档案馆', '荷兰国家图书馆', '阿姆斯特丹大学', '莱顿大学', '乌得勒支大学', '代尔夫特理工大学', '荷兰国家铁路', '阿姆斯特丹市交通公司', '鹿特丹港务局', '荷兰国家博物馆', '梵高博物馆', '荷兰气象研究所', '荷兰水管理局', '荷兰红十字会', '荷兰公共广播机构', '荷兰电影博物馆', '荷兰自然保护协会', '阿姆斯特丹市议会', '鹿特丹市议会', '荷兰皇家艺术与科学院', '荷兰国家海事博物馆', '荷兰铁路基础设施管理公司', '北荷兰省议会', '南荷兰省议会', '弗里斯兰省议会', '荷兰自行车联盟', '荷兰公共图书馆协会', '荷兰建筑学会', '荷兰水务委员会协会'],
    item: ['公共交通芯片卡', '电子身份证', '电子护照', '铁路月票', '自行车锁', '智能手机', '笔记本电脑', '数码相机', '无线耳机', '银行卡', '博物馆卡', '图书馆借阅证', '防雨外套', '自行车灯', '城市地图', '旅行背包', '保温杯', '移动电源', '交通应用终端', '防水驮包', '自行车雨披', '电子铁路通票', '运河游船票', '堤坝徒步地图', '可折叠自行车篮', '反光背心', '防水地图袋', '共享单车卡', '博物馆语音导览器', '风暴潮预警接收器'],
  },
}

const dutchLowlandsNaturalTypes = ['河口', '运河', '湖', '沙丘', '圩田', '泥炭地', '海湾', '河洲', '堤岸', '滩涂']
const dutchLowlandsPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  medieval: {
    modifiers: ['白帆', '黑堤', '金梭', '红砖', '银河', '风车', '蓝港', '灰塔', '橡木', '钟楼', '绿圩', '海狮'],
    location: { settlement: ['布商城', '港城', '行会镇', '堤坝村', '修院镇', '运河城', '渔港镇', '集市镇', '砖城', '桥头镇'], region: ['伯爵领', '主教领', '行会区', '圩田区', '河口区', '海岸区', '泥炭区', '商路区', '运河区', '教区'], fortress: ['石墙城', '海防堡', '堤坝堡', '城门堡', '河口堡', '修院堡', '港口堡', '守望塔', '边境垒', '桥头堡'], natural: dutchLowlandsNaturalTypes },
    organization: ['伯爵宫廷', '市议会', '布商行会', '织工行会', '商人会', '水务委员会', '堤坝管理会', '画家行会', '酿酒行会', '船匠行会', '城市民兵', '港口税务会'],
    item: ['呢绒', '行会印章', '商人账册', '齿轮船', '羊皮特许状', '蜡封契约', '啤酒杯', '城市钥匙', '行会旗', '十字弩', '织布梭', '堤坝测量杆'],
  },
  'early-modern': {
    modifiers: ['橙旗', '白帆', '黑堤', '金郁金香', '红砖', '银河', '风车', '蓝港', '镜湖', '海狮', '绿圩', '星图'],
    location: { settlement: ['商港城', '海军城', '大学城', '堤坝村', '造船镇', '运河城', '渔港镇', '交易所城', '砖城', '桥头镇'], region: ['联省领', '省辖区', '贸易区', '圩田区', '河口区', '海岸区', '泥炭区', '航路区', '运河区', '殖民贸易区'], fortress: ['星形堡', '海防堡', '堤坝堡', '城门堡', '河口堡', '炮台堡', '军港堡', '守望塔', '边境垒', '桥头堡'], natural: dutchLowlandsNaturalTypes },
    organization: ['联省议会', '省议会', '东印度商会', '西印度商会', '海军部', '交易所', '银行', '大学', '水务委员会', '射手公会', '地图师行会', '印刷商行会'],
    item: ['福禄特商船', '火绳枪', '燧发枪', '细剑', '蓝陶', '郁金香图录', '航海图', '黄铜罗盘', '船用沙漏', '股票凭证', '显微镜', '望远镜'],
  },
  modern: {
    modifiers: ['阿姆斯特丹', '鹿特丹', '橙旗', '白帆', '黑堤', '红砖', '风车', '蓝港', '绿圩', '银轨', '新城', '海风'],
    location: { settlement: ['市', '城区', '大学城', '港区', '铁路镇', '圩田镇', '卫星城', '社区', '市场镇', '文化城'], region: ['都市区', '行政区', '产业区', '大学区', '滨海区', '保护区', '交通区', '河口区', '圩田区', '运河区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: dutchLowlandsNaturalTypes },
    organization: ['市议会', '大学学院', '国家铁路', '广播机构', '水管理局', '博物馆', '港务局', '自然保护协会', '公共图书馆', '红十字会', '电影档案馆', '交通公司'],
    item: ['交通芯片卡', '电子护照', '铁路月票', '自行车锁', '智能手机', '笔记本电脑', '数码相机', '无线耳机', '博物馆卡', '防雨外套', '自行车灯', '防水驮包'],
  },
}

function getDutchLowlandsPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = dutchLowlandsPeriodFictionalProfiles[period] ?? dutchLowlandsPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const romanLowCountriesReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  roman: {
    location: ['乌尔皮亚·诺维奥马古斯（今奈梅亨）|Ulpia Noviomagus (Nijmegen)', '哈德良集市镇（今福尔堡）|Forum Hadriani (Voorburg)', '特赖克图姆堡（今乌得勒支）|Traiectum (Utrecht)', '费克提奥堡（今费赫滕）|Fectio (Vechten)', '马蒂洛堡（今莱顿-罗姆堡）|Matilo (Leiden-Roomburg)', '阿格里皮娜军营（今法尔肯堡）|Praetorium Agrippinae (Valkenburg)', '尼格鲁姆普卢姆堡（今兹瓦默丹）|Nigrum Pullum (Zwammerdam)', '劳里乌姆堡（今伍尔登）|Laurium (Woerden)', '阿尔巴尼亚纳堡（今莱茵河畔阿尔芬）|Albaniana (Alphen aan den Rijn)', '科尔布洛运河|Fossa Corbulonis', '莱茵河下游边墙|Lower German Limes', '巴达维岛|Insula Batavorum', '费尔森罗马军港遗址|Velsen Roman naval base', '德梅恩罗马堡遗址|De Meern Roman fort', '卡尔维乌姆堡（今赫尔文）|Carvium (Herwen)'],
    organization: ['巴达维人自治共同体', '卡纳内法特人自治共同体', '弗里西亚沃尼斯人自治共同体', '下日耳曼尼亚行省总督府', '第十双子军团', '第一巴达维辅助步兵队', '第九巴达维辅助步兵队', '第一巴达维辅助骑兵队', '日耳曼舰队', '下日耳曼尼亚边防军', '乌尔皮亚·诺维奥马古斯市政共同体', '哈德良集市镇市政共同体'],
    item: ['奈梅亨骑兵面具盔', '德尔讷镀银罗马骑兵盔', '巴达维辅助军军事证书', '尼哈勒尼亚祭坛', '罗马陶印餐具', '青铜弩形胸针', '铁制短剑', '铁制投枪头', '蜡板文书', '皮革军鞋', '青铜塞斯特斯币', '双耳运输陶罐', '兹瓦默丹河船', '伍尔登平底运输船'],
  },
}

const romanLowCountriesNaturalTypes = ['河汊', '潮滩', '泥炭沼泽', '河洲', '沙丘', '河口', '滨海盐沼', '泛滥平原', '林地', '湖沼']
const romanLowCountriesFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  roman: {
    modifiers: ['白马', '赤盾', '橡林', '莱茵', '海鹰', '灰沙丘', '黑沼', '铜盔', '河叉', '盐风', '狼旗', '琥珀'],
    location: { settlement: ['军营镇', '河港聚落', '驿站村', '陶工聚落', '商旅聚落', '农庄聚落', '渡口聚落', '河洲村', '盐沼聚落', '道路站'], region: ['自治共同体辖地', '行省区', '军镇领地', '河口区', '海岸区', '泥炭区', '河谷区', '农庄区', '道路区', '边墙区'], fortress: ['辅助军堡', '军团营', '河防堡', '木土堡', '瞭望塔', '港口堡', '道路堡', '桥头堡', '边墙堡', '舰队泊地'], natural: romanLowCountriesNaturalTypes },
    organization: ['自治共同体', '行省总督署', '辅助步兵队', '辅助骑兵队', '军团分遣队', '边防军团', '河运船队', '退伍军人社团', '商旅团体', '祭祀共同体', '市政共同体', '军营工匠队'],
    item: ['骑兵面具盔', '军事证书', '祭坛石', '陶印餐具', '青铜胸针', '铁短剑', '投枪头', '蜡板文书', '皮革军鞋', '青铜币', '运输陶罐', '平底河船'],
  },
}

function getRomanLowCountriesFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = romanLowCountriesFictionalProfiles[period] ?? romanLowCountriesFictionalProfiles.roman
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const earlySlavicReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  'migration-era': {
    location: ['布拉格型遗址分布区|Prague-type archaeological horizon', '科尔恰克型遗址分布区|Korchak-type archaeological horizon', '佩尼科夫卡文化分布区|Penkivka culture area', '科洛钦文化分布区|Kolochin culture area', '津内山堡遗址|Zymne hillfort', '帕斯特尔斯克聚落遗址|Pastyrske settlement', '马丁诺夫卡宝藏出土地|Martynivka hoard site', '第聂伯河中游|Middle Dnieper region', '普里皮亚季河流域|Pripyat basin', '多瑙河下游|Lower Danube region', '喀尔巴阡山北麓|Northern Carpathian foothills', '摩拉瓦河流域|Morava basin', '萨瓦河流域|Sava basin', '南布格河流域|Southern Bug basin', '德涅斯特河流域|Dniester basin'],
    organization: ['安特人部落联盟', '斯克拉文人诸部', '萨莫政权', '部落首领大会', '亲族共同体', '村社共同体', '首领战士随从队', '迁徙战团', '河运舟队', '铁匠家户群体', '陶工家户群体', '祭祀共同体'],
    item: ['布拉格式手制陶罐', '科尔恰克式手制陶罐', '佩尼科夫卡式陶器', '科洛钦式陶器', '弓形铜质纤维饰针', '马丁诺夫卡式银质饰片', '铁制套筒斧', '铁制镰刀', '铁制矛头', '盾牌凸饰', '骨梳', '陶纺轮', '石制旋转磨盘', '火葬骨灰瓮', '玻璃珠串'],
  },
}

const earlySlavicNaturalTypes = ['河湾', '森林', '沼泽', '草甸', '河洲', '湖沼', '丘陵', '河谷', '林间空地', '山麓']
const earlySlavicFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  'migration-era': {
    modifiers: ['白桦', '橡林', '赤日', '黑土', '银泉', '灰狼', '河湾', '鹰丘', '松烟', '冬湖', '金蜂', '野马'],
    location: { settlement: ['半地穴聚落', '河岸村社', '林间聚落', '丘顶寨', '湖滨村社', '农耕聚落', '渡口聚落', '草甸村社', '山麓聚落', '木栅聚落'], region: ['部落辖地', '亲族地', '河谷地', '森林区', '沼泽区', '草甸区', '农耕区', '山麓地', '迁徙营地', '河运区'], fortress: ['木栅寨', '丘顶寨', '河防寨', '环壕寨', '山口寨', '渡口寨', '林地寨', '守望台', '土垒', '避难山堡'], natural: earlySlavicNaturalTypes },
    organization: ['部落联盟', '诸首领大会', '亲族共同体', '村社共同体', '首领战士随从队', '迁徙战团', '河运舟队', '铁匠家户群体', '陶工家户群体', '祭祀共同体', '农耕家户联盟', '边地守望队'],
    item: ['手制陶罐', '弓形纤维饰针', '银质饰片', '铁套筒斧', '铁镰刀', '铁矛头', '盾牌凸饰', '骨梳', '陶纺轮', '旋转磨盘', '骨灰瓮', '玻璃珠串'],
  },
}

function getEarlySlavicFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = earlySlavicFictionalProfiles[period] ?? earlySlavicFictionalProfiles['migration-era']
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const lithuanianPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  medieval: {
    location: ['维尔纽斯', '特拉凯', '克尔纳韦', '考纳斯', '梅迪宁凯', '旧特拉凯', '韦利乌奥纳', '梅尔基内', '乌克梅尔盖', '阿利图斯', '帕兰加', '希奥利艾', '特尔希艾', '萨莫吉希亚', '奥克施泰蒂亚', '涅曼河', '内里斯河', '杜比萨河', '维尔纽斯上城堡', '特拉凯岛城堡'],
    organization: ['立陶宛大公宫廷', '立陶宛贵族会议', '立陶宛大公国军队', '立陶宛大公国文书局', '维尔纽斯主教区', '萨莫吉希亚主教区', '维尔纽斯主教座堂参事会', '萨莫吉希亚长老区', '维尔纽斯省', '特拉凯省', '特拉凯公爵宫廷', '克尔纳韦公爵中心', '拉德维拉家族', '戈什陶塔斯家族', '凯斯盖拉家族', '阿斯蒂卡斯家族', '格德赖蒂斯家族', '维尔纽斯方济各会修道院', '维尔纽斯伯尔纳铎会修道院', '考纳斯商人团体'],
    item: ['格迪米纳斯书信', '立陶宛大公印玺', '立陶宛第纳尔银币', '羊皮特许状', '蜡封文书', '骑士长剑', '战斧', '长矛', '十字弩', '锁子甲', '锥形头盔', '塔盾', '银质半环胸针', '琥珀护符', '织纹腰带', '木制饮酒杯', '陶制罐', '皮革马鞍', '城堡铁钥匙', '哥特式砖瓦'],
  },
  'early-modern': {
    location: ['维尔纽斯', '考纳斯', '特拉凯', '凯代尼艾', '比尔扎伊', '拉塞尼艾', '克拉日艾', '希奥利艾', '特尔希艾', '帕兰加', '蒂图韦奈', '帕扎伊斯利斯', '维尔纽斯大学', '立陶宛大公宫', '比尔扎伊城堡', '拉乌东德瓦里斯', '涅曼河', '内里斯河', '萨莫吉希亚', '奥克施泰蒂亚'],
    organization: ['立陶宛大公国议会', '立陶宛最高法庭', '立陶宛贵族会议', '立陶宛大公国文书局', '立陶宛大公国财政署', '立陶宛大公国大盖特曼府', '立陶宛大公国野战盖特曼府', '立陶宛大公国档案册署', '维尔纽斯大学', '维尔纽斯耶稣会学院', '维尔纽斯主教座堂参事会', '萨莫吉希亚主教区', '维尔纽斯铸币局', '维尔纽斯商人行会', '考纳斯市议会', '凯代尼艾归正宗会议', '比尔扎伊拉德维拉宫廷', '帕扎伊斯利斯修道院', '克拉日艾耶稣会学院', '维尔纽斯印刷工坊'],
    item: ['立陶宛第一法典', '立陶宛第二法典', '立陶宛第三法典', '立陶宛大公国档案册', '立陶宛格罗申银币', '大公国印玺', '贵族马刀', '燧发手枪', '火绳枪', '纹章盾', '羊皮敕令', '蜡封契约', '维尔纽斯印本', '马日维达斯教理书', '坎克莱斯琴', '立陶宛织纹腰带', '琥珀念珠', '银质圣像框', '彩釉陶罐', '商人账册'],
  },
  modern: {
    location: ['维尔纽斯', '考纳斯', '克莱佩达', '希奥利艾', '帕内韦日斯', '阿利图斯', '马里扬泊列', '马热伊基艾', '约纳瓦', '乌泰纳', '凯代尼艾', '特尔希艾', '陶拉盖', '帕兰加', '涅林加', '库尔斯沙嘴', '特拉凯', '德鲁斯基宁凯', '涅曼河', '奥克施泰蒂亚国家公园'],
    organization: ['立陶宛议会', '立陶宛政府', '立陶宛总统府', '立陶宛最高法院', '立陶宛宪法法院', '维尔纽斯大学', '维陶塔斯马格努斯大学', '考纳斯理工大学', '立陶宛科学院', '立陶宛国家图书馆', '立陶宛国家博物馆', '立陶宛美术馆', '立陶宛国家广播电视台', '立陶宛铁路公司', '立陶宛邮政', '立陶宛银行', '立陶宛红十字会', '立陶宛国家语言委员会', '立陶宛电影中心', '立陶宛国家爱乐乐团'],
    item: ['立陶宛身份证', '立陶宛电子护照', '维尔纽斯交通卡', '立陶宛欧元纪念币', '立陶宛织纹腰带', '琥珀银饰', '坎克莱斯琴', '草编索达斯吊饰', '彩绘复活节蛋', '亚麻桌布', '木雕十字架', '民族服装胸针', '铁路电子票', '图书馆借阅证', '博物馆年票', '篮球队围巾', '防雨外套', '自行车灯', '保温杯', '移动电源'],
  },
}

const lithuanianNaturalTypes = ['河湾', '湖', '森林', '沙丘', '湿地', '丘陵', '河谷', '草甸', '海岸', '橡树林']
const lithuanianPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  medieval: {
    modifiers: ['铁狼', '涅曼', '内里斯', '雷神', '橡树', '琥珀', '白堡', '青湖', '金冠', '猎隼', '月丘', '松林'],
    location: { settlement: ['大公城', '木堡镇', '农庄村', '河港镇', '集市镇', '教区村', '湖堡镇', '林地村', '渡口镇', '山丘城'], region: ['大公领', '长老区', '省辖地', '河谷区', '森林区', '湖区', '边地区', '农田区', '商路区', '教区'], fortress: ['木堡', '砖堡', '河防堡', '山丘堡', '城门堡', '边境堡', '岛屿堡', '守望塔', '石垒', '渡口堡'], natural: lithuanianNaturalTypes },
    organization: ['大公宫廷', '贵族会议', '大公军队', '文书局', '主教区', '座堂参事会', '长老署', '商人团体', '修道院', '城堡守备队', '使节团', '铸币所'],
    item: ['大公印玺', '银币', '羊皮特许状', '长剑', '战斧', '长矛', '十字弩', '琥珀护符', '织纹腰带', '木杯', '马鞍', '城堡钥匙'],
  },
  'early-modern': {
    modifiers: ['维尔纽斯', '涅曼', '拉德维拉', '白鹰', '红盾', '金冠', '琥珀', '橡树', '蓝旗', '银钟', '书院', '月河'],
    location: { settlement: ['议会城', '大学城', '铸币镇', '庄园镇', '河港城', '印刷镇', '教区城', '湖堡镇', '集市镇', '修院镇'], region: ['大公国领', '省辖区', '长老区', '河谷区', '森林区', '湖区', '边地区', '农田区', '商路区', '教区'], fortress: ['棱堡', '砖堡', '河防堡', '山丘堡', '城门堡', '边境堡', '岛屿堡', '炮台', '石垒', '渡口堡'], natural: lithuanianNaturalTypes },
    organization: ['大公国议会', '最高法庭', '贵族会议', '文书局', '财政署', '盖特曼府', '大学学院', '铸币局', '商人行会', '印刷工坊', '修道院', '市议会'],
    item: ['立陶宛法典', '档案册', '格罗申银币', '大公印玺', '马刀', '燧发手枪', '印本', '坎克莱斯琴', '织纹腰带', '琥珀念珠', '陶罐', '商人账册'],
  },
  modern: {
    modifiers: ['维尔纽斯', '考纳斯', '涅曼', '内里斯', '琥珀', '橡树', '铁狼', '白塔', '青湖', '绿林', '银轨', '太阳'],
    location: { settlement: ['市', '城区', '大学城', '港区', '铁路镇', '湖滨镇', '卫星城', '社区', '市场镇', '文化城'], region: ['都市区', '行政区', '产业区', '大学区', '滨海区', '保护区', '交通区', '河谷区', '森林区', '湖区'], fortress: ['警备中心', '海岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: lithuanianNaturalTypes },
    organization: ['市议会', '大学学院', '国家铁路', '广播电视台', '科学院', '国家博物馆', '图书馆', '语言委员会', '电影中心', '红十字会', '生态研究所', '文化中心'],
    item: ['交通卡', '电子护照', '欧元纪念币', '织纹腰带', '琥珀银饰', '坎克莱斯琴', '草编吊饰', '彩绘蛋', '亚麻桌布', '铁路票', '保温杯', '移动电源'],
  },
}

function getLithuanianPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = lithuanianPeriodFictionalProfiles[period] ?? lithuanianPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const serbianPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  medieval: {
    location: ['斯塔里拉斯', '拉斯', '索波查尼', '斯图代尼察', '日查', '米莱舍瓦', '佩奇', '维索基德查尼', '格拉查尼察', '普里兹伦', '新布尔多', '克鲁舍瓦茨', '斯梅代雷沃', '贝尔格莱德', '鲁德尼克', '马格利奇堡', '戈卢巴茨堡', '伊巴尔河', '大摩拉瓦河', '科帕奥尼克山'],
    organization: ['尼曼雅王朝宫廷', '拉斯大茹潘宫廷', '塞尔维亚王国宫廷', '塞尔维亚帝国宫廷', '塞尔维亚专制公国宫廷', '塞尔维亚正教会', '日查总主教区', '佩奇牧首区', '希兰达尔修道院', '斯图代尼察修道院', '日查修道院', '米莱舍瓦修道院', '维索基德查尼修道院', '格拉查尼察修道院', '索波查尼修道院', '马纳西亚修道院', '雷萨瓦书写学派', '新布尔多矿工团体', '新布尔多商人会', '塞尔维亚王室文书局'],
    item: ['《米罗斯拉夫福音书》', '《杜尚法典》', '《圣萨瓦法典》', '《希兰达尔修院规章》', '《斯图代尼察修院规章》', '塞尔维亚第纳尔银币', '王室金玺诏书', '统治者蜡印', '修道院特许状', '羊皮文书', '塞尔维亚式双头鹰印章', '中世纪塞尔维亚长剑', '骑兵长矛', '锁子甲', '圆盾', '银质圣像框', '湿壁画颜料盒', '抄经羽毛笔', '矿山银锭', '修道院铜烛台'],
  },
  ottoman: {
    location: ['贝尔格莱德', '斯梅代雷沃', '尼什', '乌日策', '克拉古耶瓦茨', '瓦列沃', '沙巴茨', '波扎雷瓦茨', '查查克', '卡拉诺瓦茨', '雅戈迪纳', '克鲁舍瓦茨', '新帕扎尔', '谢尼察', '拉什卡', '大摩拉瓦河', '德里纳河', '舒马迪亚', '阿瓦拉山', '鲁德尼克山'],
    organization: ['斯梅代雷沃桑贾克', '贝尔格莱德帕夏辖区', '佩奇牧首区', '贝尔格莱德都主教区', '拉查修道院', '米莱舍瓦修道院', '斯图代尼察修道院', '希兰达尔修道院', '奥拉沙茨会议', '塞尔维亚革命政府委员会', '第一次塞尔维亚起义军', '第二次塞尔维亚起义军', '起义军大校', '卡拉乔尔杰统帅部', '米洛什亲王文书处', '克涅日纳地方会议', '贝尔格莱德手工业行会', '塞尔维亚教会学校', '古斯莱歌者团体', '舒马迪亚村社议会'],
    item: ['第一次塞尔维亚起义旗', '第二次塞尔维亚起义旗', '塞尔维亚起义军印章', '燧发长枪', '燧发手枪', '火药角', '骑兵军刀', '古斯莱琴', '奥帕纳克皮鞋', '羊毛沙伊卡查帽', '刺绣羊毛袜', '皮革水囊', '木制圣像', '蜂蜡圣烛', '皮罗特织毯', '木制酒壶', '手抄教会书', '村社账册', '铜制墨水盒', '起义军皮弹药盒'],
  },
  modern: {
    location: ['贝尔格莱德', '诺维萨德', '尼什', '克拉古耶瓦茨', '苏博蒂察', '潘切沃', '查查克', '克拉列沃', '斯梅代雷沃', '乌日策', '瓦列沃', '克鲁舍瓦茨', '兹雷尼亚宁', '松博尔', '沙巴茨', '塔拉山', '兹拉蒂博尔', '科帕奥尼克山', '大摩拉瓦河', '杰尔达普峡谷'],
    organization: ['塞尔维亚国民议会', '塞尔维亚政府', '塞尔维亚宪法法院', '塞尔维亚科学院', '塞尔维亚国家图书馆', '塞尔维亚国家博物馆', '贝尔格莱德大学', '诺维萨德大学', '塞尔维亚广播电视台', '塞尔维亚铁路公司', '塞尔维亚之母文化协会', '塞尔维亚红十字会', '贝尔格莱德国家剧院', '塞尔维亚电影中心', '塞尔维亚语研究所', '贝尔格莱德市议会', '诺维萨德市议会', '塞尔维亚国家档案馆', '塞尔维亚国家银行', '塞尔维亚国家旅游组织'],
    item: ['塞尔维亚身份证', '塞尔维亚生物识别护照', '贝尔格莱德交通卡', '塞尔维亚第纳尔纸币', '塞尔维亚铁路电子票', '奥帕纳克皮鞋', '古斯莱琴', '沙伊卡查帽', '皮罗特织毯', '兹拉库萨陶罐', '传统木制酒壶', '利齐德尔彩饼', '塞尔维亚刺绣巾', '双头鹰纪念章', '图书馆借阅证', '博物馆年票', '篮球队围巾', '防雨外套', '保温杯', '移动电源'],
  },
}

const serbianNaturalTypes = ['河湾', '河谷', '山岭', '峡谷', '森林', '泉地', '草甸', '橡树林', '湖', '山麓']
const serbianPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  medieval: {
    modifiers: ['白鹰', '拉斯', '莫拉瓦', '伊巴尔', '红盾', '金冠', '橡树', '山隼', '白塔', '修院', '银矿', '圣泉'],
    location: { settlement: ['王城', '大茹潘城', '修院镇', '矿镇', '河港镇', '山堡镇', '集市镇', '教区村', '渡口镇', '石桥村'], region: ['大茹潘领', '茹帕区', '王室领', '修院领', '河谷区', '森林区', '矿区', '边地区', '商路区', '教区'], fortress: ['山堡', '河防堡', '石城', '城门堡', '边境堡', '峡谷堡', '守望塔', '木垒', '矿山堡', '渡口堡'], natural: serbianNaturalTypes },
    organization: ['大茹潘宫廷', '王室议事会', '帝国宫廷', '专制公宫廷', '教会会议', '总主教区', '修道院抄写院', '矿工团体', '商人会', '王室文书局', '城堡守备队', '铸币所'],
    item: ['王室法典', '第纳尔银币', '金玺诏书', '统治者蜡印', '修院规章', '羊皮文书', '长剑', '骑兵长矛', '锁子甲', '圣像框', '抄经羽毛笔', '银锭'],
  },
  ottoman: {
    modifiers: ['舒马迪亚', '莫拉瓦', '德里纳', '白鹰', '黑松', '红旗', '橡木', '山隼', '银泉', '炮台', '蜂蜡', '山谷'],
    location: { settlement: ['集镇', '山村', '河港镇', '商驿镇', '教区村', '修院镇', '驿路镇', '手工业镇', '渡口镇', '葡萄园村'], region: ['克涅日纳辖区', '桑贾克辖区', '村社区', '河谷区', '森林区', '山地区', '边地区', '农田区', '商路区', '教区'], fortress: ['炮台堡', '河防堡', '山口堡', '城门堡', '边境堡', '峡谷堡', '守望塔', '石垒', '军营堡', '渡口堡'], natural: serbianNaturalTypes },
    organization: ['地方克涅兹会议', '村社议会', '革命政府委员会', '起义军统帅部', '教会学校', '修道院抄写院', '手工业行会', '古斯莱歌者团', '商旅会', '边境守望队', '文书处', '教区会议'],
    item: ['起义旗', '起义军印章', '燧发长枪', '燧发手枪', '火药角', '骑兵军刀', '古斯莱琴', '奥帕纳克皮鞋', '沙伊卡查帽', '刺绣羊毛袜', '木制酒壶', '蜂蜡圣烛'],
  },
  modern: {
    modifiers: ['贝尔格莱德', '莫拉瓦', '多瑙', '白鹰', '红瓦', '橡树', '蓝轨', '新城', '山隼', '金麦', '银桥', '德里纳'],
    location: { settlement: ['市', '城区', '大学城', '铁路镇', '工业城', '河港区', '卫星城', '社区', '市场镇', '文化城'], region: ['都市区', '行政区', '产业区', '大学区', '河岸区', '保护区', '交通区', '河谷区', '森林区', '山地区'], fortress: ['警备中心', '河岸救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: serbianNaturalTypes },
    organization: ['市议会', '大学学院', '国家铁路', '广播电视台', '科学院', '国家博物馆', '图书馆', '语言研究所', '电影中心', '红十字会', '文化协会', '国家档案馆'],
    item: ['交通卡', '生物识别护照', '第纳尔纸币', '铁路电子票', '奥帕纳克皮鞋', '古斯莱琴', '沙伊卡查帽', '皮罗特织毯', '陶罐', '刺绣巾', '保温杯', '移动电源'],
  },
}

function getSerbianPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = serbianPeriodFictionalProfiles[period] ?? serbianPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const ossetianPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  alanian: {
    location: ['马加斯', '下阿尔希兹遗址', '泽连丘克教堂群', '北泽连丘克教堂', '中泽连丘克教堂', '南泽连丘克教堂', '申塔教堂', '绍纳教堂', '阿尔希兹', '达尔加夫斯', '卡尔马顿峡谷', '库尔塔和塔加塔楼群', '米达格拉宾瀑布', '菲亚格顿河谷', '策伊峡谷', '乌鲁赫河谷', '阿尔东河谷', '捷列克河上游', '卡兹别克山', '大高加索北麓'],
    organization: ['阿兰王廷', '阿兰贵族会议', '阿兰骑兵亲卫队', '阿兰主教区', '马加斯城防军', '泽连丘克教会共同体', '申塔教会共同体', '绍纳教会共同体', '阿兰商旅团', '山谷氏族议事会', '纳尔特史诗歌者团', '山口守望队', '马群管理会', '金属工匠团', '石塔营造团', '墓葬祭仪团', '山谷盟誓会', '河谷牧民会', '弓骑手队', '王廷文书团'],
    item: ['泽连丘克铭文石碑', '阿兰直刃长剑', '阿兰复合弓', '三叶箭镞', '铁制马镫', '骑兵马具', '锁子甲', '圆形盾', '青铜带扣', '银质腰带饰片', '玻璃珠项链', '陶制双耳壶', '石雕十字架', '墓葬饮酒杯', '铁制短刀', '骨制梳', '皮革箭囊', '青铜镜', '羊毛披风', '王廷印章'],
  },
  imperial: {
    location: ['弗拉季高加索', '阿拉吉尔', '阿尔东', '别斯兰', '莫兹多克', '迪戈拉', '达尔加夫斯', '卡兹别克山', '策伊峡谷', '菲亚格顿河谷', '库尔塔村', '塔加村', '纳尔村', '吉泽利村', '卡尔马顿峡谷', '阿尔洪峡谷', '乌鲁赫河谷', '捷列克河', '苏阿达格', '萨多纳矿区'],
    organization: ['奥塞梯教区', '阿尔东神学院', '弗拉季高加索奥塞梯学校', '奥塞梯历史语言研究会', '奥塞梯村社议会', '山谷氏族议事会', '奥塞梯民歌团', '纳尔特史诗讲述者团', '山口驿站署', '捷列克河谷商会', '阿拉吉尔矿工会', '山地牧民互助会', '传统医者会', '铁匠工坊', '毛毡工坊', '奥塞梯印刷社', '弗拉季高加索教师会', '奥塞梯剧团', '高加索山地学校', '河谷水利会'],
    item: ['科斯塔·赫塔古罗夫诗集', '奥塞梯语启蒙读本', '基辛凡德尔提琴', '达拉凡德尔竖琴', '乌阿丁兹笛', '高加索山地斗篷', '奥塞梯毡帽', '三足祭礼桌', '祭礼啤酒杯', '奥塞梯馅饼木托盘', '银质腰带扣', '山地短剑', '马鞍毯', '刺绣羊毛袜', '木制酒杯', '皮革火药盒', '铜制水壶', '羊毛毡毯', '史诗手抄本', '村社印章'],
  },
  modern: {
    location: ['弗拉季高加索', '别斯兰', '莫兹多克', '阿拉吉尔', '阿尔东', '迪戈拉', '奥克佳布里斯科耶', '恰科拉', '埃尔霍托沃', '吉泽利', '卡兹别克山', '策伊峡谷', '达尔加夫斯', '卡尔马顿峡谷', '米达格拉宾瀑布', '菲亚格顿河谷', '阿尔洪峡谷', '乌鲁赫河谷', '捷列克河', '阿兰国家公园'],
    organization: ['北奥塞梯-阿兰议会', '北奥塞梯-阿兰政府', '北奥塞梯国立大学', '北奥塞梯医学学院', '北奥塞梯国家博物馆', '北奥塞梯国家图书馆', '北奥塞梯歌剧与芭蕾舞剧院', '弗拉季高加索阿兰尼亚足球俱乐部', '奥塞梯语言文学研究所', '北奥塞梯国家广播电视台', '奥塞梯历史学会', '北奥塞梯艺术家协会', '北奥塞梯作家协会', '纳尔特史诗研究中心', '北奥塞梯自然保护局', '弗拉季高加索市议会', '北奥塞梯红十字会', '北奥塞梯国家档案馆', '奥塞梯民俗舞团', '阿兰国家公园管理局'],
    item: ['奥塞梯语字母表', '奥塞梯语文学选集', '基辛凡德尔提琴', '达拉凡德尔竖琴', '奥塞梯三足祭礼桌', '奥塞梯馅饼托盘', '奥塞梯刺绣披肩', '奥塞梯羊毛毡帽', '阿兰纹样胸针', '北奥塞梯交通卡', '电子护照', '博物馆年票', '登山地图', '山谷救援定位器', '图书馆借阅证', '剧院电子票', '传统舞靴', '羊毛毡毯', '保温杯', '移动电源'],
  },
}

const ossetianNaturalTypes = ['山谷', '峡谷', '山岭', '河湾', '瀑布', '高原', '草甸', '冰川', '山口', '河源']
const ossetianPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  alanian: {
    modifiers: ['纳尔特', '阿兰', '金角', '白山', '黑塔', '铁马', '太阳', '雪峰', '猎隼', '青谷', '银泉', '赤岩'],
    location: { settlement: ['王城', '塔楼村', '骑兵镇', '山谷城', '教堂镇', '商旅驿', '牧马村', '河谷镇', '石堡村', '山口镇'], region: ['王室领', '氏族领', '主教区', '牧马区', '河谷区', '山地区', '商路区', '边地区', '草场区', '祭仪区'], fortress: ['石塔堡', '山口堡', '河防堡', '城门堡', '边境堡', '峡谷堡', '守望塔', '木垒', '骑兵堡', '石墙堡'], natural: ossetianNaturalTypes },
    organization: ['阿兰王廷', '贵族会议', '骑兵亲卫队', '主教区', '城防军', '教会共同体', '史诗歌者团', '山口守望队', '马群管理会', '金属工匠团', '石塔营造团', '山谷盟誓会'],
    item: ['铭文石碑', '直刃长剑', '复合弓', '三叶箭镞', '铁马镫', '骑兵马具', '锁子甲', '圆盾', '银腰带饰片', '陶制双耳壶', '石雕十字架', '皮革箭囊'],
  },
  imperial: {
    modifiers: ['弗拉季高加索', '阿尔东', '捷列克', '纳尔', '铁塔', '雪峰', '黑马', '银泉', '青谷', '金角', '白毡', '赤岩'],
    location: { settlement: ['山村', '教区镇', '矿镇', '驿站镇', '河谷镇', '牧民村', '学校村', '手工业镇', '渡口镇', '集市镇'], region: ['氏族区', '教区', '矿区', '河谷区', '山地区', '牧区', '边地区', '农田区', '商路区', '村社区'], fortress: ['石塔堡', '山口堡', '河防堡', '边防哨', '峡谷堡', '守望塔', '石垒', '军营堡', '驿站堡', '渡口堡'], natural: ossetianNaturalTypes },
    organization: ['教区会', '村社议会', '氏族议事会', '史诗讲述者团', '民歌团', '山口驿站署', '矿工会', '牧民互助会', '铁匠工坊', '毛毡工坊', '印刷社', '教师会'],
    item: ['奥塞梯语读本', '基辛凡德尔提琴', '达拉凡德尔竖琴', '乌阿丁兹笛', '山地斗篷', '羊毛毡帽', '三足祭礼桌', '祭礼啤酒杯', '银质腰带扣', '马鞍毯', '史诗手抄本', '村社印章'],
  },
  modern: {
    modifiers: ['弗拉季高加索', '阿兰', '捷列克', '卡兹别克', '纳尔特', '雪峰', '黑塔', '银泉', '青谷', '金角', '白毡', '赤岩'],
    location: { settlement: ['市', '城区', '大学城', '矿镇', '铁路镇', '山谷镇', '卫星城', '社区', '市场镇', '文化城'], region: ['都市区', '行政区', '产业区', '大学区', '山地区', '保护区', '交通区', '河谷区', '森林区', '高原区'], fortress: ['警备中心', '山地救援站', '应急指挥所', '消防站', '交通控制中心', '防洪中心', '训练基地', '通信中心', '仓储基地', '避难中心'], natural: ossetianNaturalTypes },
    organization: ['市议会', '大学学院', '国家博物馆', '广播电视台', '语言研究所', '国家图书馆', '歌剧院', '国家档案馆', '史诗研究中心', '红十字会', '自然保护局', '民俗舞团'],
    item: ['奥塞梯语字母表', '文学选集', '基辛凡德尔提琴', '三足祭礼桌', '馅饼托盘', '刺绣披肩', '羊毛毡帽', '阿兰纹样胸针', '交通卡', '登山地图', '保温杯', '移动电源'],
  },
}

function getOssetianPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = ossetianPeriodFictionalProfiles[period] ?? ossetianPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const mongolianPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  'pre-empire': {
    location: ['斡难河', '克鲁伦河', '不儿罕山', '迭里温孛答黑', '肯特山', '杭爱山', '阿尔泰山', '戈壁草原', '贝加尔湖', '土拉河', '色楞格河', '鄂尔浑河谷', '呼伦湖', '哈拉哈河', '额尔古纳河'],
    organization: ['合不勒汗联盟', '克烈部汗庭', '乃蛮部汗庭', '蔑儿乞联盟', '泰赤乌部', '忽里勒台', '那可儿亲卫', '萨满祭仪团', '孛儿只斤氏族', '乞颜部', '塔塔儿部', '札剌亦儿部', '弘吉剌部', '斡亦剌惕部', '汪古部'],
    item: ['复合弓', '毡帐', '骑射箭囊', '铁马镫', '游牧铜锅', '马奶酒皮囊', '马尾旗', '羊拐骨', '桦皮弓囊', '骨制箭镞', '铁嚼子', '牛角弓弭', '皮水囊', '木鞍', '火镰'],
  },
  empire: {
    location: ['哈剌和林', '斡耳朵', '斡难河', '克鲁伦河', '不儿罕山', '鄂尔浑河谷', '阿尔泰山', '戈壁驿道', '上都', '大都', '别失八里', '阿力麻里', '撒马尔罕', '钦察草原', '土拉河'],
    organization: ['大汗斡耳朵', '忽里勒台', '怯薛军', '达鲁花赤衙署', '札鲁忽赤法庭', '蒙古驿站网络', '畏兀儿文书院', '怯薛四班', '万户府', '千户营', '站赤总管府', '探马赤军', '火儿赤宿卫', '必阇赤文书班', '牧马监'],
    item: ['圣旨金牌', '虎符牌', '蒙古文诏书', '复合弓', '马尾军旗', '银饰马鞍', '骑射箭囊', '驿站令牌', '札撒法卷', '令旨札付', '蒲梢弓', '铁札甲', '火镰', '驿马文券', '皮制舆图'],
  },
  'northern-yuan': {
    location: ['克鲁伦河', '杭爱山', '喀尔喀草原', '察哈尔草原', '土默川', '鄂尔多斯', '戈壁', '归化城', '斡难河', '呼伦贝尔', '阴山', '大青山', '漠北草原', '开平故城', '宣府边外'],
    organization: ['北元汗庭', '察哈尔万户', '喀尔喀诸部会盟', '土默特部', '鄂尔多斯部', '兀良哈三卫', '驿传使团', '草原寺院', '达延汗庭', '土默特汗庭', '察哈尔汗庭', '喀尔喀三部', '漠南诸部会盟', '黄教寺院集团', '边市商队'],
    item: ['汗印', '蒙古文敕书', '马尾纛', '复合弓', '板甲', '银马鞍', '皮箭囊', '祭祀铜盏', '火绳枪', '藏文经卷', '转经筒', '蒙古弯刀', '锁子甲', '驼铃', '茶砖'],
  },
  'oirat-khanates': {
    location: ['准噶尔盆地', '伊犁河谷', '塔尔巴哈台', '科布多', '乌布苏湖', '额敏河', '额尔齐斯河', '博尔塔拉', '乌伦古湖', '博格达山', '阿拉套山', '斋桑湖', '玛纳斯河', '开都河', '乌梁海'],
    organization: ['四卫拉特联盟', '准噶尔汗庭', '和硕特汗庭', '土尔扈特部', '杜尔伯特部', '宰桑会议', '藏传佛教寺院', '伊犁商队会', '绰罗斯部', '辉特部', '扎哈沁部', '和硕特护法汗庭', '托忒文译经院', '准噶尔炮兵营', '驼队商站'],
    item: ['卫拉特法典', '托忒文经卷', '复合弓', '火绳枪', '马尾旗', '皮甲', '银鞍', '驼队货印', '火药筒', '托忒文印板', '茶砖', '驼铃', '护经匣', '行军铁锅', '皮火药囊'],
  },
  qing: {
    location: ['库伦', '乌里雅苏台', '科布多', '多伦诺尔', '归化城', '喀尔喀四部', '鄂尔多斯', '呼伦贝尔', '热河', '察哈尔', '科尔沁', '土默特', '伊克昭盟', '卓索图盟', '昭乌达盟'],
    organization: ['札萨克旗衙门', '盟长会议', '库伦办事大臣衙门', '乌里雅苏台将军衙门', '理藩院蒙古馆', '驿站网络', '寺院旗', '伊克昭盟会盟', '卓索图盟会盟', '哲里木盟会盟', '昭乌达盟会盟', '乌兰察布盟会盟', '西套蒙古旗署', '蒙古王公会盟', '卡伦守备队'],
    item: ['札萨克印', '蒙古文档册', '盟旗地图', '顶戴暖帽', '银鼻烟壶', '马鞍', '弓韬', '驿站腰牌', '札萨克札付', '满蒙合璧文书', '蒙古文木刻本', '便携佛龛', '转经筒', '茶砖', '驼铃'],
  },
  socialist: {
    location: ['乌兰巴托', '达尔汗', '额尔登特', '乔巴山', '赛音山达', '科布多', '乌布苏', '库苏古尔湖', '宗莫德', '阿尔拜赫雷', '乔伊尔', '扎门乌德', '木伦', '乌列盖', '曼达勒戈壁'],
    organization: ['牧业合作社', '国营农牧场', '蒙古科学院', '乌兰巴托铁路局', '地方人民呼拉尔', '国立大学', '文化宫', '地质勘探队', '人民革命党', '国家计划委员会', '蒙苏合营铁路', '国营百货公司', '作家协会', '广播委员会', '农牧业部'],
    item: ['合作社账册', '铁路工作证', '搪瓷茶缸', '收音机', '羊毛毡靴', '牧区地图', '学生证', '摩托车工具包', '人民共和国护照', '商品配给票', '骑兵军靴', '军用水壶', '红领巾', '机械零件箱', '地质罗盘'],
  },
  modern: {
    location: ['乌兰巴托', '达尔汗', '额尔登特', '乔巴山', '赛音山达', '科布多', '乌布苏湖', '库苏古尔湖', '戈壁', '鄂尔浑河', '宗莫德', '木伦', '乌列盖', '扎门乌德', '阿尔拜赫雷'],
    organization: ['国家大呼拉尔图书馆', '蒙古科学院', '国立大学', '地方公民代表会', '牧民合作社', '文化遗产中心', '旅游协会', '矿业公司', '国家博物馆', '国家档案馆', '乌兰巴托市议会', '国家紧急情况局', '国家公共广播电视台', '国家图书馆', '国家歌剧舞剧院'],
    item: ['电子身份证', '公交卡', '智能手机', '现代蒙古袍', '数码相机', '牧区导航仪', '折叠太阳能板', '越野车工具箱', '电子护照', '手机支付终端', '卫星电话', '航拍无人机', '便携蓄电池', '防寒冲锋衣', '牲畜定位项圈'],
  },
}

const mongolianNaturalTypes = ['河', '湖', '山', '岭', '谷', '草原', '沙丘', '泉', '湿地', '峡口']
const mongolianPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  'pre-empire': {
    modifiers: ['苍狼', '白鹿', '斡难', '克鲁伦', '肯特', '杭爱', '金鹰', '黑纛', '长风', '青石', '赤狐', '银桦'],
    location: { settlement: ['营地', '冬营', '夏营', '部落营', '马场', '水井营', '河曲营', '山麓营', '商旅营', '祭山营'], region: ['部地', '牧地', '猎场', '草场', '河谷', '山地', '边地', '盐泽', '森林带', '迁徙道'], fortress: ['木栅营', '山口寨', '守望台', '烽火台', '隘口营', '河防营', '石垒', '马栏堡', '巡骑站', '边哨'], natural: mongolianNaturalTypes },
    organization: ['部落联盟', '汗庭', '长老会', '忽里勒台', '那可儿团', '骑射队', '猎户团', '马群会', '萨满祭团', '商旅团', '锻冶营', '驯马营'],
    item: ['复合弓', '皮箭囊', '马奶酒囊', '毡帐', '铁马镫', '马尾旗', '铜锅', '羊拐骨', '皮甲', '火镰', '马鞍', '骨哨'],
  },
  empire: {
    modifiers: ['苍狼', '金帐', '哈剌和林', '鄂尔浑', '斡难', '克鲁伦', '银牌', '黑纛', '长生天', '飞鹰', '赤马', '白毡'],
    location: { settlement: ['斡耳朵', '驿城', '军营', '工匠营', '商旅站', '马场', '粮站', '河港营', '冬营', '夏营'], region: ['万户地', '千户地', '牧地', '封地', '河谷', '山地', '驿路区', '边地', '猎场', '草场'], fortress: ['军寨', '木栅城', '山口堡', '烽火台', '边哨', '守备营', '石垒', '驿防站', '河防营', '隘口营'], natural: mongolianNaturalTypes },
    organization: ['大汗斡耳朵', '忽里勒台', '怯薛军', '万户府', '千户营', '达鲁花赤署', '札鲁忽赤庭', '驿传司', '文书院', '工匠局', '商旅会', '牧马监'],
    item: ['金牌', '虎符牌', '蒙古文诏书', '复合弓', '马尾军旗', '银马鞍', '皮箭囊', '驿站令牌', '板甲', '皮酒囊', '行军铜锅', '军用地图'],
  },
  'northern-yuan': {
    modifiers: ['察哈尔', '喀尔喀', '土默特', '鄂尔多斯', '克鲁伦', '杭爱', '青帐', '白纛', '金马', '月湖', '赤岭', '长风'],
    location: { settlement: ['汗营', '部落营', '寺院镇', '马市', '冬营', '夏营', '河曲营', '商旅站', '驿站', '牧场'], region: ['万户地', '部地', '牧地', '河谷', '山地', '草场', '猎场', '边地', '盐泽', '迁徙道'], fortress: ['山口寨', '木栅营', '烽火台', '边哨', '守备营', '石垒', '河防营', '隘口营', '军寨', '巡骑站'], natural: mongolianNaturalTypes },
    organization: ['汗庭', '万户府', '部族会盟', '骑射营', '驿传司', '寺院', '商旅会', '牧马监', '文书院', '铁匠营', '猎户团', '守边军'],
    item: ['汗印', '蒙古文敕书', '马尾纛', '复合弓', '板甲', '银马鞍', '皮箭囊', '祭祀铜盏', '驿牌', '毡帐', '火镰', '马奶酒囊'],
  },
  'oirat-khanates': {
    modifiers: ['准噶尔', '伊犁', '塔尔巴哈台', '科布多', '乌布苏', '额尔齐斯', '金驼', '白毡', '青湖', '赤山', '黑鹰', '银泉'],
    location: { settlement: ['汗营', '寺院镇', '商旅站', '冬营', '夏营', '马市', '驼队营', '河曲营', '牧场', '边贸镇'], region: ['部地', '牧地', '河谷', '山地', '草场', '盐泽', '边地', '猎场', '迁徙道', '湖区'], fortress: ['山口寨', '木栅营', '炮台', '烽火台', '边哨', '守备营', '石垒', '河防营', '军寨', '隘口营'], natural: mongolianNaturalTypes },
    organization: ['汗庭', '宰桑会', '部族联盟', '骑射营', '驼队商会', '寺院', '文书院', '牧马监', '铁匠营', '边贸会', '守边军', '猎户团'],
    item: ['托忒文经卷', '法典册', '复合弓', '火绳枪', '马尾旗', '皮甲', '银鞍', '货印', '皮箭囊', '驼铃', '毡帐', '铜锅'],
  },
  qing: {
    modifiers: ['库伦', '乌里雅苏台', '科布多', '多伦', '喀尔喀', '察哈尔', '鄂尔多斯', '呼伦', '青旗', '白毡', '金马', '月湖'],
    location: { settlement: ['旗城', '盟府', '寺院镇', '驿站', '马市', '商旅站', '冬营', '夏营', '牧场', '边贸镇'], region: ['盟地', '旗地', '牧地', '河谷', '山地', '草场', '猎场', '边地', '盐泽', '湖区'], fortress: ['卡伦', '边哨', '守备营', '炮台', '烽火台', '山口寨', '石垒', '河防营', '军寨', '巡骑站'], natural: mongolianNaturalTypes },
    organization: ['札萨克旗署', '盟长会', '办事大臣衙门', '驿传司', '寺院旗', '商旅会', '牧马监', '文书房', '卡伦守备队', '边贸局', '工匠营', '猎户团'],
    item: ['札萨克印', '蒙古文档册', '盟旗地图', '暖帽', '鼻烟壶', '马鞍', '弓韬', '腰牌', '皮箭囊', '毡靴', '铜茶壶', '驿站令牌'],
  },
  socialist: {
    modifiers: ['乌兰巴托', '达尔汗', '额尔登特', '乔巴山', '赛音山达', '科布多', '红旗', '和平', '曙光', '友谊', '戈壁', '鄂尔浑'],
    location: { settlement: ['市', '县城', '苏木', '国营牧场', '铁路镇', '矿区镇', '工人村', '农牧站', '学校村', '边防镇'], region: ['省', '县', '苏木辖区', '牧业区', '矿区', '铁路区', '草原区', '戈壁区', '湖区', '边境区'], fortress: ['边防站', '观察哨', '训练场', '军营', '仓储基地', '管制站', '巡逻站', '防灾所', '通信站', '补给站'], natural: mongolianNaturalTypes },
    organization: ['牧业合作社', '国营农牧场', '科学院', '铁路局', '地方呼拉尔', '国立大学', '文化宫', '勘探队', '医院', '学校', '出版局', '运输队'],
    item: ['合作社账册', '工作证', '搪瓷茶缸', '收音机', '毡靴', '牧区地图', '学生证', '工具包', '铁路票', '钢笔', '帆布包', '保温瓶'],
  },
  modern: {
    modifiers: ['乌兰巴托', '达尔汗', '额尔登特', '乔巴山', '赛音山达', '科布多', '蓝天', '戈壁', '鄂尔浑', '库苏古尔', '金鹰', '白毡'],
    location: { settlement: ['市', '县城', '苏木', '新区', '矿业镇', '旅游镇', '牧民社区', '站前区', '边贸镇', '湖滨镇'], region: ['省', '县', '苏木辖区', '牧业区', '矿区', '产业园区', '草原区', '戈壁区', '湖区', '边境区'], fortress: ['边防站', '观察哨', '训练场', '仓储基地', '管制站', '巡逻站', '防灾中心', '通信站', '补给站', '避难设施'], natural: mongolianNaturalTypes },
    organization: ['公民代表会', '科学院', '国立大学', '牧民合作社', '文化中心', '旅游协会', '矿业公司', '出版社', '生态保护会', '运输公司', '博物馆', '研究所'],
    item: ['电子身份证', '公交卡', '智能手机', '现代蒙古袍', '数码相机', '导航仪', '太阳能板', '越野车工具箱', '保温杯', '无线电台', '帆布包', '移动电源'],
  },
}

function getMongolianPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = mongolianPeriodFictionalProfiles[period] ?? mongolianPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const tibetanPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  empire: {
    location: ['逻些', '雅砻河谷', '琼结', '桑耶', '昌珠', '红山宫', '拉萨河', '青海湖', '山南', '工布', '苏毗', '象雄故地', '大非川', '石堡城', '河西驿道'],
    organization: ['赞普王廷', '大相府', '桂氏家族', '吐蕃军镇', '桑耶寺', '译经院', '会盟使团', '驿传网络', '噶尔氏家族', '恩兰氏家族', '没庐氏家族', '大论官署', '东岱军府', '茹军府', '赞普近卫'],
    item: ['唐蕃会盟碑', '吐蕃告身', '吐蕃文书', '纸本经卷', '札甲', '复合弓', '铜印', '马具', '盟誓文书', '木简', '吐蕃文契', '皮甲', '铁剑', '马鞍', '驿传牌符'],
  },
  fragmentation: {
    location: ['古格', '普兰', '拉达克', '卫藏', '阿里', '托林', '扎布让', '热振', '桑耶', '皮央洞窟', '东嘎石窟', '玛旁雍错', '冈仁波齐', '拉达克列城', '塔波'],
    organization: ['古格王廷', '普兰王廷', '托林寺', '塔波寺', '噶当派', '后弘期译经团', '地方宗族会议', '山谷商队', '宁玛教团', '噶举教团', '阿里王系', '拉达克王廷', '译师学团', '寺院庄园', '马帮行会'],
    item: ['贝叶式经书', '壁画颜料盒', '铜佛像', '木刻经板', '羊皮文书', '盐砖', '马帮货印', '酥油灯', '泥塑佛像', '铜镀金造像', '卷轴画', '译经手稿', '祭祀法器', '铜镜', '羊毛披毡'],
  },
  'sakya-yuan': {
    location: ['萨迦', '拉萨', '日喀则', '江孜', '雅砻', '阿里', '乌思藏', '朵甘', '帕里', '聂拉木', '泽当', '塔波', '玛旁雍错', '拉孜', '桑耶'],
    organization: ['萨迦政权', '本钦府', '十三万户府', '宣政院藏地驿站', '萨迦寺', '夏鲁寺', '译经院', '站赤网络', '宣政院', '乌思藏宣慰司', '朵甘思宣慰司', '帝师府', '萨迦拉章', '地方万户府', '驿站驿卒会'],
    item: ['八思巴文诏书', '萨迦法旨', '万户印', '贝叶式经书', '鎏金佛像', '唐卡', '驿站牌符', '供养器', '帝师法旨', '乌思藏驿牌', '驿马勘合', '万户文书', '供养人题记', '金刚铃', '曼荼罗画'],
  },
  phagmodrupa: {
    location: ['乃东', '泽当', '拉萨', '江孜', '日喀则', '仁蚌', '雅砻河谷', '山南', '丹萨替', '乃邬', '贡嘎', '白居寺', '扎什伦布寺', '昌珠', '桑耶'],
    organization: ['帕木竹巴政权', '乃东宗政府', '甘丹寺', '哲蚌寺', '色拉寺', '仁蚌巴政权', '译经院', '仁蚌宗政府', '江孜宗政府', '丹萨替寺', '白居寺', '扎什伦布寺', '第巴会议', '寺院庄园', '地方宗谿衙署'],
    item: ['宗府印', '法旨卷', '经夹', '木刻经板', '唐卡', '法号文牒', '供灯', '马帮账册', '宗府档册', '庄园账簿', '鎏金铜佛', '壁画颜料', '经幡', '法鼓', '供水碗'],
  },
  'ganden-phodrang': {
    location: ['拉萨', '布达拉宫', '罗布林卡', '日喀则', '江孜', '昌都', '那曲', '纳木错', '雅鲁藏布江', '山南', '哲蚌寺', '甘丹寺', '色拉寺', '扎什伦布寺', '雍布拉康'],
    organization: ['甘丹颇章政权', '噶厦', '哲蚌寺', '色拉寺', '甘丹寺', '扎什伦布寺', '门孜康', '地方宗政府', '驻藏大臣衙门', '地方噶本署', '译仓', '雪巴商团', '拉萨商会', '马帮行会', '藏军代本营'],
    item: ['噶厦文书', '地方宗印', '唐卡', '转经筒', '贝叶式经书', '酥油灯', '哈达', '马帮驮鞍', '噶厦官契', '宗谿差票', '木刻大藏经', '铜鎏金佛', '法鼓', '经幡', '护身嘎乌'],
  },
  modern: {
    location: ['拉萨', '日喀则', '昌都', '林芝', '那曲', '阿里', '江孜', '泽当', '纳木错', '雅鲁藏布江', '贡嘎', '波密', '墨脱', '定日', '亚东'],
    organization: ['藏医医院', '藏学研究所', '大学藏文系', '文化遗产保护中心', '唐卡画院', '地方博物馆', '生态保护站', '牧民合作社', '自治区图书馆', '西藏大学', '登山救援队', '高原生态研究站', '藏文出版社', '牦牛育种中心', '公路养护段'],
    item: ['现代藏文书籍', '电子身份证', '智能手机', '数码相机', '太阳能灯', '保温壶', '现代藏袍', '公交卡', '高原氧气瓶', '卫星电话', '便携太阳能板', '数字藏文词典', '登山证', '航拍无人机', '公路里程图'],
  },
}

const tibetanNaturalTypes = ['山', '河', '湖', '谷', '岭', '峰', '冰川', '草甸', '盐泽', '峡谷']
const tibetanPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  empire: {
    modifiers: ['雅砻', '逻些', '琼结', '桑耶', '红山', '雪狮', '天湖', '白岩', '青谷', '金帐', '日光', '月岭'],
    location: { settlement: ['王城', '宫城', '军镇', '驿站', '山谷村', '河畔城', '寺院聚落', '马场', '商旅站', '边镇'], region: ['茹', '东岱', '军区', '牧地', '河谷', '山地', '湖区', '边地', '盐场', '农区'], fortress: ['宗堡', '石寨', '山口堡', '烽火台', '军营', '守备所', '隘口', '河防寨', '边哨', '石垒'], natural: tibetanNaturalTypes },
    organization: ['赞普王廷', '大相府', '军镇署', '译经院', '驿传司', '寺院', '会盟使团', '牧马监', '文书院', '工匠营', '商旅团', '守边军'],
    item: ['告身', '吐蕃文书', '纸本经卷', '札甲', '复合弓', '铜印', '马具', '会盟碑拓', '皮箭囊', '供灯', '毛毡帐', '驿牌'],
  },
  fragmentation: {
    modifiers: ['古格', '普兰', '托林', '扎布让', '阿里', '雪山', '白塔', '金谷', '青湖', '红岩', '月泉', '风马'],
    location: { settlement: ['王城', '寺院村', '山谷镇', '马帮站', '河畔村', '堡城', '绿洲村', '驿站', '牧场', '商旅镇'], region: ['王国领', '宗族地', '牧地', '河谷', '山地', '湖区', '边地', '盐场', '农区', '商路区'], fortress: ['宗堡', '石寨', '山口堡', '烽火台', '守备所', '隘口', '边哨', '河防寨', '石垒', '军营'], natural: tibetanNaturalTypes },
    organization: ['王廷', '宗族会议', '寺院', '译经团', '噶当学社', '马帮', '商旅会', '木刻坊', '画师院', '药师会', '守边军', '驿站司'],
    item: ['贝叶式经书', '壁画颜料盒', '铜佛像', '木刻经板', '羊皮文书', '盐砖', '货印', '酥油灯', '经夹', '念珠', '马鞍', '毡靴'],
  },
  'sakya-yuan': {
    modifiers: ['萨迦', '乌思', '朵甘', '白塔', '红殿', '金印', '雪狮', '青湖', '月轮', '莲峰', '风马', '祥云'],
    location: { settlement: ['寺城', '万户府城', '驿站', '山谷镇', '马帮站', '河畔村', '堡城', '商旅镇', '牧场', '农庄'], region: ['万户地', '宗地', '牧地', '河谷', '山地', '湖区', '边地', '盐场', '农区', '驿路区'], fortress: ['宗堡', '石寨', '山口堡', '烽火台', '守备所', '隘口', '边哨', '河防寨', '石垒', '军营'], natural: tibetanNaturalTypes },
    organization: ['本钦府', '万户府', '寺院', '译经院', '驿站司', '马帮', '商旅会', '木刻坊', '画师院', '药师会', '守备军', '文书院'],
    item: ['法旨', '万户印', '贝叶式经书', '鎏金佛像', '唐卡', '牌符', '供养器', '经夹', '木刻经板', '酥油灯', '马鞍', '货印'],
  },
  phagmodrupa: {
    modifiers: ['乃东', '泽当', '雅砻', '甘丹', '仁蚌', '白塔', '青谷', '金轮', '雪狮', '月湖', '红岩', '风马'],
    location: { settlement: ['宗城', '寺院镇', '山谷村', '马帮站', '河畔镇', '堡城', '商旅镇', '牧场', '农庄', '驿站'], region: ['宗地', '庄园地', '牧地', '河谷', '山地', '湖区', '边地', '盐场', '农区', '商路区'], fortress: ['宗堡', '石寨', '山口堡', '烽火台', '守备所', '隘口', '边哨', '河防寨', '石垒', '军营'], natural: tibetanNaturalTypes },
    organization: ['宗政府', '寺院', '译经院', '驿站司', '马帮', '商旅会', '木刻坊', '画师院', '药师会', '守备军', '文书院', '粮仓会'],
    item: ['宗府印', '法旨卷', '经夹', '木刻经板', '唐卡', '法号', '供灯', '马帮账册', '念珠', '铜佛像', '马鞍', '货印'],
  },
  'ganden-phodrang': {
    modifiers: ['甘丹', '拉萨', '布达拉', '雪狮', '白塔', '青稞', '金轮', '月湖', '红山', '风马', '莲峰', '祥云'],
    location: { settlement: ['宗城', '寺院镇', '山谷村', '马帮站', '河畔镇', '商旅镇', '牧场', '农庄', '驿站', '温泉村'], region: ['宗地', '庄园地', '牧地', '河谷', '山地', '湖区', '边地', '盐场', '农区', '商路区'], fortress: ['宗堡', '石寨', '山口堡', '烽火台', '守备所', '隘口', '边哨', '河防寨', '石垒', '军营'], natural: tibetanNaturalTypes },
    organization: ['噶厦分署', '宗政府', '寺院', '藏医馆', '译经院', '马帮', '商旅会', '木刻坊', '画师院', '药师会', '驿站司', '粮仓会'],
    item: ['地方宗印', '文书卷', '唐卡', '转经筒', '贝叶式经书', '酥油灯', '哈达', '马帮驮鞍', '念珠', '经夹', '药囊', '盐砖'],
  },
  modern: {
    modifiers: ['拉萨', '日喀则', '昌都', '林芝', '那曲', '阿里', '雪狮', '青稞', '雅砻', '纳木', '金谷', '白塔'],
    location: { settlement: ['市', '县城', '乡', '村', '牧民社区', '旅游镇', '站前区', '河谷镇', '温泉村', '边贸镇'], region: ['地区', '县', '乡辖区', '牧业区', '农区', '产业园区', '湖区', '山地区', '边境区', '生态保护区'], fortress: ['边防站', '观察哨', '训练场', '仓储基地', '管制站', '巡逻站', '防灾中心', '通信站', '补给站', '避难设施'], natural: tibetanNaturalTypes },
    organization: ['藏医医院', '藏学研究所', '大学藏文系', '文化保护中心', '唐卡画院', '博物馆', '生态保护站', '牧民合作社', '出版社', '旅游协会', '学校', '救援队'],
    item: ['现代藏文书籍', '电子身份证', '智能手机', '数码相机', '太阳能灯', '保温壶', '现代藏袍', '公交卡', '无线电台', '帆布包', '移动电源', '导航仪'],
  },
}

function getTibetanPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = tibetanPeriodFictionalProfiles[period] ?? tibetanPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const manchuPeriodReferenceCatalogs: Record<string, StrictPeriodReferenceCatalog> = {
  'jin-jurchen': {
    location: ['会宁府', '上京路', '黄龙府', '宁江州', '曷苏馆', '长白山', '松花江', '黑龙江', '中都', '南京开封府', '东京辽阳府', '西京大同府', '五国城', '咸平府', '肇州'],
    organization: ['勃极烈会议', '猛安谋克', '女真亲军', '女真字文书院', '上京留守司', '都统司', '尚书省', '御前侍卫', '枢密院', '行台尚书省', '猛安司', '谋克司', '蒲辇军', '合扎猛安', '女真字译经所'],
    item: ['女真文碑刻', '女真文铜印', '复合弓', '桦皮箭囊', '铁札甲', '兽皮袍', '马具', '铜腰牌', '女真进士题名碑', '猛安谋克户籍', '金代铜镜', '铁浮屠铠', '驿马牌', '女真文墨书', '女真弯刀'],
  },
  'late-jurchen': {
    location: ['赫图阿拉', '建州', '哈达', '乌拉', '叶赫', '辉发', '宁古塔', '长白山', '苏子河', '图们江', '牡丹江', '海西', '乌苏里江', '佛阿拉', '松花江'],
    organization: ['建州女真部', '海西女真联盟', '叶赫部', '乌拉部', '哈达部', '辉发部', '部族长老会', '猎骑队', '建州左卫', '建州右卫', '建州卫', '扈伦四部联盟', '野人女真部', '朝贡使团', '互市商队'],
    item: ['桦皮弓韬', '皮箭囊', '貂皮袍', '铁箭镞', '部族印信', '萨满神鼓', '猎刀', '马鞍', '貂皮贡单', '人参贡单', '海东青绊带', '桦皮盒', '采珠网', '鹿哨', '行军铁锅'],
  },
  'later-jin': {
    location: ['赫图阿拉', '兴京', '盛京', '辽阳', '萨尔浒', '抚顺', '铁岭', '吉林乌拉', '佛阿拉', '界藩城', '沈阳', '开原', '叶赫城', '东京城', '山海关外'],
    organization: ['后金汗廷', '八旗制度', '牛录额真衙门', '固山额真衙门', '议政王大臣会议', '文馆', '驿传站', '正黄旗', '镶黄旗', '五大臣议政会', '都堂', '八旗蒙古', '八旗汉军', '巴克什文馆', '牛录组织'],
    item: ['满文诏书', '八旗旗纛', '佐领印', '弓韬', '箭囊', '棉甲', '马鞍', '腰牌', '无圈点满文档', '圈点满文档', '八旗户册', '牛录册', '令箭', '火绳鸟枪', '八旗甲胄'],
  },
  'early-qing': {
    location: ['盛京', '北京', '热河', '宁古塔', '瑷珲', '吉林乌拉', '木兰围场', '长白山', '紫禁城', '避暑山庄', '山海关', '齐齐哈尔', '呼兰', '三姓', '打牲乌拉'],
    organization: ['八旗都统衙门', '内务府', '理藩院', '盛京将军衙门', '宁古塔将军衙门', '吉林将军衙门', '佐领衙门', '上驷院', '镶黄旗满洲都统衙门', '御前侍卫处', '盛京内务府', '打牲乌拉总管衙门', '布特哈总管衙门', '木兰围场总管衙门', '宗人府'],
    item: ['八旗印信', '满文奏折', '满文档册', '射箭扳指', '暖帽', '朝珠', '弓韬', '黄马褂', '满汉合璧诏书', '清文鉴', '八旗户册', '皇室玉牒', '木兰行围图', '桦皮弓套', '佐领腰牌'],
  },
  'late-qing': {
    location: ['盛京', '吉林', '黑龙江城', '宁古塔', '三姓', '呼兰', '哈尔滨', '木兰围场', '齐齐哈尔', '瑷珲', '海拉尔', '满洲里', '旅顺', '奉天', '长春府'],
    organization: ['盛京将军衙门', '吉林将军衙门', '黑龙江将军衙门', '八旗驻防', '内务府', '宗人府', '旗务处', '新军旗营', '东三省总督署', '奉天交涉署', '黑龙江铁路交涉局', '八旗学堂', '满蒙文高等学堂', '禁卫军', '旗务学校'],
    item: ['满文户籍册', '八旗印信', '暖帽', '朝珠', '射箭扳指', '洋式步枪', '怀表', '铁路车票', '出洋护照', '电报稿', '火车时刻表', '新军操典', '子弹皮袋', '旗籍证明', '满汉合璧报刊'],
  },
  modern: {
    location: ['沈阳', '长春', '吉林', '哈尔滨', '宁安', '新宾', '伊通', '长白山', '松花江', '牡丹江', '抚顺', '本溪', '丹东', '齐齐哈尔', '承德'],
    organization: ['满族文化协会', '满语研究所', '地方博物馆', '非遗保护中心', '满族历史研究会', '民族学校', '传统射箭社', '萨满文化研究室', '满族联谊会', '满语传习班', '地方民俗学会', '八旗制度研究中心', '新宾满族博物馆', '满族剪纸传习所', '传统弓箭俱乐部'],
    item: ['现代满文教材', '电子身份证', '智能手机', '数码相机', '现代旗袍', '传统弓复原件', '非遗展览证', '公交卡', '满文输入法键盘贴', '满语教材音频', '数字档案硬盘', '非遗传承证', '民族服饰展签', '田野录音笔', '展览导览器'],
  },
}

const manchuNaturalTypes = ['山', '江', '河', '谷', '岭', '峰', '湖', '林', '湿地', '雪原']
const manchuPeriodFictionalProfiles: Record<string, StrictPeriodFictionalProfile> = {
  'jin-jurchen': {
    modifiers: ['会宁', '上京', '黄龙', '白山', '黑水', '松花', '金源', '鹰路', '银桦', '赤鹿', '长林', '雪原'],
    location: { settlement: ['府城', '州城', '谋克村', '猛安城', '猎户村', '马场', '河畔寨', '山林村', '商旅站', '军镇'], region: ['路', '猛安地', '谋克地', '猎场', '山地', '河谷', '林区', '边地', '湿地区', '牧马地'], fortress: ['寨', '军堡', '木栅城', '山口关', '烽火台', '守备营', '边哨', '石垒', '河防寨', '军镇'], natural: manchuNaturalTypes },
    organization: ['勃极烈会议', '猛安府', '谋克所', '女真亲军', '文书院', '留守司', '都统司', '猎骑队', '工匠所', '商旅团', '驿传司', '守边军'],
    item: ['女真文碑', '铜印', '复合弓', '桦皮箭囊', '铁札甲', '兽皮袍', '马具', '铜腰牌', '猎刀', '萨满鼓', '桦皮盒', '皮靴'],
  },
  'late-jurchen': {
    modifiers: ['赫图阿拉', '建州', '哈达', '乌拉', '叶赫', '辉发', '白山', '黑水', '松花', '金鹰', '银桦', '赤鹿'],
    location: { settlement: ['部城', '寨', '猎户村', '马场', '河畔寨', '山林村', '商旅站', '军镇', '冬营', '山口村'], region: ['部地', '猎场', '山地', '河谷', '林区', '边地', '湿地区', '牧马地', '商路区', '采珠地'], fortress: ['寨', '木栅城', '山口关', '烽火台', '守备营', '边哨', '石垒', '河防寨', '军镇', '巡骑站'], natural: manchuNaturalTypes },
    organization: ['部族汗庭', '长老会', '猎骑队', '萨满祭团', '驿传队', '商旅团', '锻冶营', '采珠队', '守边军', '文书房', '马群会', '山林巡护队'],
    item: ['弓韬', '皮箭囊', '貂皮袍', '铁箭镞', '部族印信', '萨满鼓', '猎刀', '马鞍', '桦皮盒', '皮靴', '火镰', '铜锅'],
  },
  'later-jin': {
    modifiers: ['赫图阿拉', '兴京', '盛京', '辽阳', '萨尔浒', '白山', '黑水', '黄旗', '蓝旗', '红旗', '白旗', '金鹰'],
    location: { settlement: ['旗城', '牛录村', '军镇', '驿站', '猎户村', '马场', '河畔寨', '山林村', '商旅站', '工匠营'], region: ['旗地', '牛录地', '猎场', '山地', '河谷', '林区', '边地', '湿地区', '牧马地', '采珠地'], fortress: ['寨', '军堡', '木栅城', '山口关', '烽火台', '守备营', '边哨', '石垒', '河防寨', '军镇'], natural: manchuNaturalTypes },
    organization: ['汗廷', '八旗都统署', '牛录衙门', '固山衙门', '议政会议', '文馆', '驿传司', '工匠局', '猎骑队', '商旅会', '守边军', '马群监'],
    item: ['满文诏书', '八旗旗纛', '佐领印', '弓韬', '箭囊', '棉甲', '马鞍', '腰牌', '火绳枪', '皮靴', '铜锅', '军用地图'],
  },
  'early-qing': {
    modifiers: ['盛京', '宁古塔', '吉林', '瑷珲', '热河', '木兰', '白山', '黑水', '黄旗', '蓝旗', '红旗', '白旗'],
    location: { settlement: ['旗城', '驻防城', '佐领村', '驿站', '猎户村', '马场', '围场镇', '山林村', '商旅站', '军镇'], region: ['旗地', '围场', '猎场', '山地', '河谷', '林区', '边地', '湿地区', '牧马地', '采珠地'], fortress: ['卡伦', '军堡', '驻防城', '山口关', '烽火台', '守备营', '边哨', '石垒', '河防寨', '炮台'], natural: manchuNaturalTypes },
    organization: ['八旗都统署', '佐领衙门', '内务府分署', '将军衙门', '驿传司', '上驷院马场', '围场署', '采珠队', '守边军', '文书房', '工匠局', '猎骑队'],
    item: ['八旗印信', '满文奏折', '满文档册', '射箭扳指', '暖帽', '朝珠', '弓韬', '黄马褂', '腰牌', '鼻烟壶', '马鞍', '皮靴'],
  },
  'late-qing': {
    modifiers: ['盛京', '吉林', '黑龙江', '宁古塔', '三姓', '呼兰', '木兰', '白山', '松花', '牡丹', '黄旗', '蓝旗'],
    location: { settlement: ['旗城', '驻防城', '佐领村', '铁路镇', '猎户村', '马场', '围场镇', '山林村', '商埠', '军镇'], region: ['旗地', '围场', '猎场', '山地', '河谷', '林区', '边地', '湿地区', '铁路区', '采珠地'], fortress: ['卡伦', '军堡', '驻防城', '山口关', '炮台', '守备营', '边哨', '石垒', '河防寨', '新军营'], natural: manchuNaturalTypes },
    organization: ['将军衙门', '八旗驻防', '佐领衙门', '旗务处', '新军旗营', '铁路局', '商会', '学校', '文书房', '围场署', '守边军', '驿传司'],
    item: ['满文户籍册', '八旗印信', '暖帽', '朝珠', '射箭扳指', '洋式步枪', '怀表', '铁路车票', '学生帽', '钢笔', '皮箱', '腰牌'],
  },
  modern: {
    modifiers: ['沈阳', '长春', '吉林', '哈尔滨', '宁安', '新宾', '伊通', '白山', '松花', '牡丹', '银桦', '雪原'],
    location: { settlement: ['市', '县城', '乡', '村', '民族社区', '旅游镇', '站前区', '河畔镇', '林场镇', '边贸镇'], region: ['地区', '县', '乡辖区', '林业区', '农业区', '产业园区', '湿地区', '山地区', '边境区', '生态保护区'], fortress: ['边防站', '观察哨', '训练场', '仓储基地', '管制站', '巡逻站', '防灾中心', '通信站', '补给站', '避难设施'], natural: manchuNaturalTypes },
    organization: ['满族文化协会', '满语研究所', '博物馆', '非遗保护中心', '历史研究会', '民族学校', '传统射箭社', '萨满文化研究室', '出版社', '旅游协会', '生态保护站', '社区中心'],
    item: ['现代满文教材', '电子身份证', '智能手机', '数码相机', '现代旗袍', '传统弓复原件', '展览证', '公交卡', '无线耳机', '保温杯', '帆布包', '移动电源'],
  },
}

function getManchuPeriodFictionalEntries(period: string, kind: JapaneseCatalogKind, locationType: OfflineLocationType = 'settlement') {
  const profile = manchuPeriodFictionalProfiles[period] ?? manchuPeriodFictionalProfiles.modern
  const types = kind === 'location' ? profile.location[locationType] : profile[kind]
  return profile.modifiers.flatMap((modifier) => types.filter((type) => !type.includes(modifier) && !modifier.includes(type)).map((type) => `${modifier}${type}|${modifier}${type}`))
}

const fictionalLocationNames: Partial<Record<OfflineCulture, Record<OfflineLocationType, string[]>>> = {
  chinese: {
    settlement: ['安平县', '临河县', '永宁县', '清河县', '怀远县', '广陵城', '河间府', '云州', '宁川镇', '青石镇', '柳溪村', '白河村'],
    region: ['河东郡', '临川郡', '北宁府', '安西州', '云中道', '岭南道', '清河郡', '怀州'],
    fortress: ['北宁关', '临河关', '铁门关', '雁回关', '镇海关', '白石堡', '怀远堡', '青峰寨'],
    natural: ['白河', '青溪', '雁回岭', '落霞山', '苍梧山', '镜湖', '云梦泽', '清源谷'],
  },
  japanese: {
    settlement: ['青川町', '松原村', '白石町', '高森村', '川上町', '月岛町'], region: ['北川国', '青森领', '松平领', '白河藩'], fortress: ['青叶城', '白鹭城', '松风砦', '高月城'], natural: ['青川', '白峰山', '镜湖', '松风谷'],
  },
  korean: {
    settlement: ['清川邑', '松岳里', '白石村', '南川邑', '月城'], region: ['清原道', '松岳郡', '白山府', '南川郡'], fortress: ['月城山城', '白石堡', '松岳山城', '南川镇'], natural: ['清川江', '白岳山', '松林谷', '月影湖'],
  },
  english: {
    settlement: ['Ashford', 'Westbridge', 'Oakham', 'Ravenwick', 'Greenhaven', 'Stoneleigh'], region: ['Westmarch', 'North Riding', 'Ashen Shire', 'Grey County'], fortress: ['Blackmere Castle', 'Westwatch Keep', 'Stonegate', 'Dunwall Castle'], natural: ['River Ash', 'Greywood', 'Blackmere', 'North Downs'],
  },
  french: {
    settlement: ['Beaumont', 'Clairmont', 'Valcour', 'Bellefontaine', 'Rochefort', 'Saint-Laurent'], region: ['Val d’Or', 'Comté de Clairmont', 'Marche de l’Est', 'Pays de Valcour'], fortress: ['Château de Valcour', 'Fort-Rouge', 'Citadelle de Clairmont', 'Tour Blanche'], natural: ['Mont d’Argent', 'Rivière Claire', 'Bois-Noir', 'Lac d’Or'],
  },
  german: {
    settlement: ['Falkenberg', 'Lindenburg', 'Rosenheim', 'Steinbach', 'Waldkirchen', 'Eichenfeld'], region: ['Nordmark', 'Falkenland', 'Rheingau', 'Eichental'], fortress: ['Falkenstein', 'Burg Eichenwald', 'Nordwacht', 'Steintor'], natural: ['Dunkelwald', 'Silbersee', 'Falkenberg', 'Eichenbach'],
  },
  italian: {
    settlement: ['Monteverde', 'Valdoro', 'Castelbianco', 'Roccaluna', 'Bellacqua', 'San Aurelio'], region: ['Valle d’Oro', 'Marca di Levante', 'Terra Rossa', 'Ducato di Valdoro'], fortress: ['Castelnero', 'Rocca Bianca', 'Forte Leone', 'Torre d’Oro'], natural: ['Montechiaro', 'Lago Verde', 'Valle Luna', 'Fiume Rosso'],
  },
  iberian: {
    settlement: ['Valverde', 'Monteclaro', 'Villanueva', 'Puerto Blanco', 'Santa Lucía', 'Rocafuerte'], region: ['Sierra Alta', 'Tierra Roja', 'Condado de Valverde', 'Marca del Sur'], fortress: ['Castillo Blanco', 'Alcázar del Sol', 'Fuerte Rojo', 'Torre de Plata'], natural: ['Río Claro', 'Sierra Negra', 'Valle Verde', 'Costa de Plata'],
  },
  norse: {
    settlement: ['Ravnvik', 'Eikeby', 'Nordgard', 'Skallefjord', 'Ulvsdal', 'Bergvik'], region: ['Ravnemark', 'Eikedal', 'Ulvsheim', 'Solfjord'], fortress: ['Nordborg', 'Ravnefestning', 'Skallefjell borg', 'Ulvevakt'], natural: ['Ravnefjord', 'Eikedal', 'Skallefjell', 'Nordvatn'],
  },
  icelandic: {
    settlement: ['Hrafnsvík', 'Eyrarfjörður', 'Björnsstaðir', 'Norðurholt', 'Steinsnes'], region: ['Vesturdalur', 'Norðurland', 'Hrafnsey', 'Eyrarsýsla'], fortress: ['Hrafnsborg', 'Steinsgarður', 'Norðurvakt', 'Eyrarvirki'], natural: ['Hrafnsfjall', 'Eyrará', 'Steinsvatn', 'Norðurjökull'],
  },
  'ancient-greek': {
    settlement: ['Kallipolis', 'Nikopolis', 'Theophaneia', 'Asterion', 'Leuktra'], region: ['Arkadia', 'Asterian Plain', 'Kallian League', 'Leukan Coast'], fortress: ['Akropolis of Kallia', 'Fort Nike', 'Asterion Gate', 'Leukan Wall'], natural: ['Mount Asterion', 'River Kallios', 'Lake Nike', 'Leukan Cape'],
  },
  'ancient-rome': {
    settlement: ['Aurelia', 'Valeria', 'Castrum Novum', 'Forum Marcelli', 'Portus Felix'], region: ['Provincia Valeria', 'Ager Aurelius', 'Marca Septentrionalis', 'Campania Nova'], fortress: ['Castrum Aurelium', 'Porta Valeria', 'Turris Felix', 'Praesidium Novum'], natural: ['Flumen Aurelium', 'Mons Valerius', 'Lacus Felix', 'Silva Claudia'],
  },
  egyptian: {
    settlement: ['Per-Amun', 'Per-Ra', 'Djedet', 'Meru', 'Waset-Nefer'], region: ['Nome of the Falcon', 'Eastern Delta', 'Land of Amun', 'Western Oasis'], fortress: ['Fort of Horus', 'Wall of Ra', 'Gate of Amun', 'Desert Watch'], natural: ['Lake of Ra', 'Western Wadi', 'Red Dune', 'Nile Bend'],
  },
}

// Additional historically attested catalog entries. The left side is the
// Chinese display label and the right side is the local/original form. Keeping
// these as complete entries prevents the generator from inventing syllables or
// combining unrelated words.
const expandedNonPersonPools: Partial<Record<OfflineCulture, Partial<Record<OfflineNameKind, string[]>>>> = {
  // Russian/Siberian entries are historical reference material. They belong
  // here (and not in fictionalStylePools), so reference mode can use them.
  'russian-siberian': {
    location: ['白桦堡|Berezovsk', '霜河镇|Morozorechye', '雪松岭|Kedrovyi Pereval', '北辰港|Severozvezdny Port', '乌鸦矿城|Voronograd', '冰原哨站|Ledyanaya Zastava', '铁杉村|Zheleznaya Listvennitsa', '极光湖|Ozero Severnogo Siyaniya', '灰狼谷|Serovolchya Dolina', '冻土关|Tundrovy Ostrog', '雾松原|Tumanny Bor', '长冬驿|Dolgozimye'],
    organization: ['白熊哥萨克团|Bely Medved Cossacks', '北风商会|Severnyi Veter Guild', '霜河总督府|Morozorechye Chancellery', '雪松修院|Kedrovy Monastery', '乌鸦矿业会|Voronograd Mining House', '极光观测院|Aurora Observatory', '铁杉边防军|Listvennitsa Guard', '冻土邮驿局|Tundra Post Office', '灰狼猎团|Serovolk Hunters', '冰原科学站|Ledyanaya Station', '北辰铁路社|Severozvezdny Railway', '长冬议会|Dolgozimye Council'],
    item: ['白熊战斧|Bely Medved axe', '北风短剑|Severnyi Veter knife', '霜河印玺|Morozorechye seal', '雪松圣像|Kedrovy icon', '乌鸦矿灯|Voronograd lamp', '极光罗盘|aurora compass', '铁杉步枪|Listvennitsa rifle', '冻土皮裘|tundra fur coat', '灰狼口琴|serovolk harmonica', '冰原雪橇铃|sled bells', '北辰怀表|northstar watch', '长冬伏特加壶|winter flask'],
  },
  icelandic: {
    location: ['雷克雅未克|Reykjavik', '辛格韦德利|Thingvellir', '斯卡尔霍特|Skalholt', '霍拉尔|Holar', '博尔加内斯|Borgarnes', '阿克拉内斯|Akranes', '伊萨菲厄泽|Isafjordur', '维克|Vik', '赫本|Hofn', '埃伊尔斯塔济|Egilsstadir', '米湖|Myvatn', '赫克拉|Hekla'],
    organization: ['冰岛全岛议会|Althing', '冰岛法律委员会|Logretta', '斯卡尔霍特主教座|Skalholt See', '霍拉尔主教座|Holar See', '冰岛自由邦|Icelandic Commonwealth', '辛盖拉尔修道院|Thingeyrar Abbey', '赫尔加费德尔修道院|Helgafell Abbey', '维泽岛修道院|Videy Abbey', '斯陶尔隆家族|Sturlungar', '奥达韦里家族|Oddaverjar', '豪克德利尔家族|Haukdaelir', '阿斯比宁家族|Asbirningar'],
    item: ['灰鹅法典|Gragas', '约恩法典|Jonsbok', '殖民书|Landnamabok', '冰岛人之书|Islendingabok', '王家宝典|Codex Regius', '弗拉泰岛书|Flateyjarbok', '莫兹鲁韦利尔书|Modruvallabok', '冰岛羊毛呢布|vadmal', '鳕鱼干货捆|stockfish bundle', '木制阿斯库尔碗|askur bowl', '纺轮|spindle whorl', '织机坠|loom weight'],
  },
  norse: {
    location: ['考庞|Kaupang', '阿瓦尔斯内斯|Avaldsnes', '博勒|Borre', '戈克斯塔|Gokstad', '奥塞贝格|Oseberg', '尼达罗斯|Nidaros', '拉德|Lade', '哈夫斯峡湾|Hafrsfjord', '霍洛加兰|Halogaland', '耶伦|Jaeren'],
    organization: ['古拉庭|Gulating', '弗罗斯塔庭|Frostating', '埃兹沃尔庭|Eidsivating', '博尔加庭|Borgarting', '挪威莱当舰队|Norwegian Leidang', '挪威国王侍卫团|Norwegian Royal Hird', '拉德伯爵家族|Jarls of Lade', '金发王朝|Fairhair dynasty', '阿瓦尔斯内斯王室庄园|Avaldsnes royal manor', '考庞商人群体|Kaupang merchants'],
    item: ['奥塞贝格船|Oseberg ship', '戈克斯塔船|Gokstad ship', '耶尔蒙德布头盔|Gjermundbu helmet', '长船|longship', '克纳尔商船|knarr', '圆盾|round shield', '胡须斧|bearded axe', '皂石炊锅|soapstone pot', '银臂环|silver arm ring', '织机坠|loom weight'],
  },
  'ancient-greek': {
    location: ['迈锡尼|Mycenae', '奥林匹亚|Olympia', '阿尔戈斯|Argos', '米利都|Miletus', '罗德岛|Rhodes', '萨摩斯|Samos', '克诺索斯|Knossos', '埃皮达鲁斯|Epidaurus', '马其顿|Macedon', '赫勒斯滂|Hellespont'],
    organization: ['阿卡迪亚同盟|Arcadian League', '伯罗奔尼撒同盟|Peloponnesian League', '提洛同盟|Delian League', '科林斯同盟|League of Corinth', '雅典公民大会|Ecclesia of Athens', '五百人议事会|Boule', '斯巴达双王制|Spartan Diarchy', '德尔斐神庙|Temple of Delphi', '厄琉息斯秘仪|Eleusinian Mysteries'],
    item: ['阿斯庇斯圆盾|aspis', '克拉特酒器|krater', '基利克斯酒杯|kylix', '陶制双耳瓶|amphora', '青铜胸甲|bronze cuirass', '希腊火炬|sacred torch', '橄榄冠|olive wreath', '陶片放逐票|ostrakon', '蜡板|wax tablet', '斯巴达长矛|dory spear'],
  },
  'ancient-rome': {
    location: ['奥斯提亚|Ostia', '拉文纳|Ravenna', '锡拉库萨|Syracuse', '赫库兰尼姆|Herculaneum', '迦太基|Carthage', '安条克|Antioch', '不列颠尼亚|Britannia', '高卢|Gallia', '多瑙河|Danube', '阿庇亚大道|Via Appia'],
    organization: ['朱莉娅氏族|Gens Julia', '科尔内莉娅氏族|Gens Cornelia', '元老院|Senatus', '平民保民官|Tribunate of the Plebs', '第十军团|Legio X', '禁卫军|Praetorian Guard', '维斯塔贞女|Vestal Virgins', '罗马商人行会|Collegium Mercatorum', '朱庇特神庙|Temple of Jupiter'],
    item: ['罗马短剑|gladius', '斯帕塔长剑|spatha', '罗马标枪|pilum', '方阵盾|scutum', '军团鹰旗|aquila', '蜡板书册|codex', '紫色托加|toga praetexta', '金币奥里斯|aureus', '酒神面具|theatre mask', '凯旋桂冠|corona triumphalis'],
  },
  egyptian: {
    location: ['阿拜多斯|Abydos', '卢克索|Luxor', '阿斯旺|Aswan', '菲莱|Philae', '法尤姆|Faiyum', '东部沙漠|Eastern Desert', '西部绿洲|Western Oasis', '红海港|Berenice Troglodytica', '尼罗河三角洲|Nile Delta', '帝王谷|Valley of the Kings'],
    organization: ['阿蒙神庙|Temple of Amun', '拉神祭司团|Priesthood of Ra', '皇家书记官署|Royal Scribes', '底比斯祭司团|Theban Priesthood', '生命之屋|House of Life', '孟斐斯工匠团|Memphite Artisans', '努比亚边防军|Nubian Frontier Guard', '法老宫廷|Pharaonic Court', '赛特神庙|Temple of Set', '伊西斯祭司团|Priesthood of Isis', '金字塔工匠署|Pyramid Builders Guild'],
    item: ['阿努比斯护符|Anubis amulet', '荷鲁斯之眼|Eye of Horus', '莎草纸卷|papyrus scroll', '卡诺卜罐|canopic jar', '乌加特权杖|was sceptre', '弯曲权杖|heka crook', '连枷|flail', '青金石胸饰|lapis pectoral', '黄金圣甲虫|gold scarab', '死者之书|Book of the Dead'],
  },
  french: {
    location: ['兰斯|Reims', '阿维尼翁|Avignon', '图尔|Tours', '普瓦捷|Poitiers', '香槟|Champagne', '布列塔尼|Brittany', '加龙河|Garonne', '卢瓦尔河谷|Loire Valley'],
    organization: ['瓦卢瓦王朝|House of Valois', '波旁王朝|House of Bourbon', '圣殿骑士团|Knights Templar', '医院骑士团|Knights Hospitaller', '巴黎大学|University of Paris', '皇家火枪队|Musketeers of the Guard', '巴黎商人行会|Paris Guild', '圣但尼修道院|Abbey of Saint-Denis'],
    item: ['法兰西长剑|francisque', '细剑|rapier', '王室印戒|royal signet', '百合花纹章|fleur-de-lis', '圣油瓶|ampulla', '羊皮纸敕令|royal charter', '鲁特琴|lute', '挂毯|royal tapestry'],
  },
  german: {
    location: ['亚琛|Aachen', '吕贝克|Lubeck', '雷根斯堡|Regensburg', '法兰克福|Frankfurt', '萨克森|Saxony', '巴伐利亚|Bavaria', '多瑙河|Danube', '黑森林|Black Forest'],
    organization: ['哈布斯堡王朝|House of Habsburg', '条顿骑士团|Teutonic Order', '汉萨同盟|Hanseatic League', '神圣罗马帝国议会|Imperial Diet', '施瓦本同盟|Swabian League', '铁匠行会|Guild of Smiths', '奥格斯堡银行家族|Fugger House', '宫廷近卫队|Imperial Guard'],
    item: ['兰茨克内希特剑|Landsknecht sword', '骑士长枪|lance', '纹章盾|heraldic shield', '印戒|signet ring', '行会账簿|guild ledger', '铁制钥匙|iron key', '汉萨商标|Hanseatic mark', '羊皮纸特许状|parchment charter'],
  },
  italian: {
    location: ['热那亚|Genova', '博洛尼亚|Bologna', '曼图亚|Mantua', '比萨|Pisa', '费拉拉|Ferrara', '西西里|Sicily', '阿尔诺河|Arno', '伦巴第|Lombardy'],
    organization: ['美第奇家族|House of Medici', '斯福尔扎家族|House of Sforza', '威尼斯大议会|Great Council of Venice', '罗马元老院|Roman Senate', '圣殿骑士意大利分团|Italian Templars', '佛罗伦萨羊毛行会|Arte della Lana', '教廷卫队|Papal Guard', '贡多拉船夫行会|Gondoliers Guild'],
    item: ['短剑|stiletto', '文艺复兴细剑|rapier', '手抄本|codex', '假面舞会面具|masquerade mask', '威尼斯金币|ducat', '家族纹章|family coat of arms', '玻璃花瓶|Murano glass', '炼金术坩埚|alembic'],
  },
  iberian: {
    location: ['萨拉曼卡|Salamanca', '科尔多瓦|Cordoba', '圣地亚哥|Santiago de Compostela', '塞哥维亚|Segovia', '加的斯|Cadiz', '巴利阿里群岛|Balearic Islands', '塔霍河|Tagus in Spain', '阿拉贡|Aragon'],
    organization: ['特拉斯塔马拉王朝|House of Trastamara', '圣地亚哥骑士团|Order of Santiago', '卡拉特拉瓦骑士团|Order of Calatrava', '耶稣会|Society of Jesus', '卡斯蒂利亚王室议会|Council of Castile', '印度事务院|Council of the Indies', '塞维利亚贸易之家|Casa de Contratacion', '贵族兄弟会|Hermandad Nobiliaria'],
    item: ['阿杜尔加皮盾|adarga', '西班牙细剑|rapier', '西班牙航海星盘|Spanish mariner astrolabe', '玫瑰念珠|rosary', '王室印玺|royal seal', '银币雷亚尔|real coin', '羊皮纸航海图|portolan chart', '家族纹章|coat of arms'],
  },
  'india-north': {
    location: ['斋浦尔|Jaipur', '阿瓦德|Awadh', '旁遮普|Punjab', '拉贾斯坦|Rajasthan', '亚穆纳河|Yamuna', '塔尔沙漠|Thar Desert', '鹿野苑|Sarnath', '阿拉哈巴德|Allahabad'],
    organization: ['孔雀王朝|Maurya Empire', '笈多王朝|Gupta Empire', '莫卧儿宫廷|Mughal Court', '拉杰普特家族|Rajput House', '锡克教卡尔萨|Khalsa', '贝拿勒斯织工行会|Benares Guild', '婆罗门学舍|Gurukula', '德里苏丹国|Delhi Sultanate', '阿育王官署|Ashokan Edict Office', '恒河学术院|Ganges Scholastic Circle', '阿格拉宫廷|Agra Court', '拉合尔画院|Lahore Atelier'],
    item: ['塔尔瓦尔弯刀|talwar', '库塔尔匕首|katar', '西塔琴|sitar', '维纳琴|veena', '棕榈叶经卷|palm-leaf manuscript', '莫卧儿微型画|Mughal miniature', '孔雀王朝印章|Mauryan seal', '莲花铜灯|diya lamp', '弓形长弓|composite bow', '象牙棋盘|ivory chessboard', '孔雀羽扇|peacock fan', '蓝宝石戒指|sapphire ring'],
  },
  'india-south': {
    location: ['康契普拉姆|Kanchipuram', '科钦|Kochi', '迈索尔|Mysore', '泰米尔纳德|Tamil Nadu', '喀拉拉|Kerala', '哥达瓦里河|Godavari', '德干高原|Deccan Plateau', '科摩林角|Cape Comorin'],
    organization: ['朱罗王朝|Chola Court', '毗奢耶那伽罗帝国|Vijayanagara Empire', '潘迪亚王朝|Pandya Dynasty', '切拉王朝|Chera Dynasty', '纳亚克宫廷|Nayaka Court', '南印度寺庙行会|Temple Guild', '纳雅尔家族|Nair House', '婆罗门学舍|Agrahara'],
    item: ['乌鲁米软剑|urumi', '卡塔尔匕首|katar', '南印度维纳琴|veena', '青铜纳塔拉阇|Nataraja bronze', '科拉姆灯|kuthu vilakku', '棕榈叶手稿|olai manuscript', '寺庙战车|temple chariot', '丝绸纱丽|Kanchipuram sari'],
  },
  vietnamese: {
    location: ['升龙|Thăng Long', '会安|Hội An', '大叻|Đà Lạt', '红河三角洲|Đồng bằng sông Hồng', '顺化|Huế', '西贡|Sài Gòn', '湄公河三角洲|Đồng bằng sông Cửu Long', '安南山脉|Dãy Trường Sơn', '海防|Hải Phòng', '昆嵩|Kon Tum'],
    organization: ['李朝皇廷|Triều Lý', '陈朝皇廷|Triều Trần', '黎朝皇廷|Triều Lê', '阮朝皇廷|Triều Nguyễn', '文庙国子监|Văn Miếu - Quốc Tử Giám', '村社议事会|Hội đồng làng', '红河商帮|Hội buôn Sông Hồng', '西山军|Quân Tây Sơn', '东山铜鼓工坊|Lò đúc trống Đông Sơn', '会安商人会馆|Hội quán thương nhân Hội An', '湄公河船商会|Hội thuyền buôn Mê Kông'],
    item: ['越南长刀|gươm', '斗笠|nón lá', '竹笛|sáo trúc', '阮朝官印|ấn Triều Nguyễn', '宣纸册页|sách giấy dó', '青花瓷|gốm men lam', '漆器盒|hộp sơn mài', '丝绸腰带|dải lụa', '东山铜鼓|trống đồng Đông Sơn', '水牛角梳|lược sừng trâu', '安南漆盘|khay sơn An Nam'],
  },
  thai: {
    location: ['素可泰|Sukhothai', '清莱|Chiang Rai', '呵叻|Khorat', '湄南河|Chao Phraya', '湄公河|Mekong', '兰纳|Lanna', '大城府|Ayutthaya', '吞武里|Thonburi'],
    organization: ['素可泰王朝|Sukhothai Kingdom', '大城王朝|Ayutthaya Kingdom', '却克里王朝|Chakri Dynasty', '僧伽议会|Sangha Council', '暹罗宫廷|Siamese Court', '寺院学校|Temple School', '湄南河商会|Chao Phraya Guild', '王室象队|Royal Elephant Corps'],
    item: ['克拉比长刀|krabi', '泰式长剑|daab', '孔面具|khon mask', '三叉戟|trishula', '佛塔供灯|lotus lamp', '暹罗漆盒|Siamese lacquerware', '金叶经书|gold-leaf manuscript', '王室长鼓|royal drum'],
  },
  malay: {
    location: ['马六甲|Malacca', '亚齐|Aceh', '婆罗洲|Borneo', '爪哇|Java', '苏门答腊|Sumatra', '廖内群岛|Riau Islands', '文莱|Brunei', '香料群岛|Moluccas'],
    organization: ['马六甲苏丹国|Malacca Sultanate', '亚齐苏丹国|Aceh Sultanate', '文莱苏丹国|Brunei Sultanate', '海上商人行会|Maritime Guild', '村社习惯法会|Adat Council', '爪哇宫廷|Javanese Court', '香料商会|Spice Guild', '海峡航海团|Straits Navigators'],
    item: ['马来克里斯剑|keris', '宋吉锦缎|songket', '马来短剑|badik', '棕榈叶手稿|lontar manuscript', '仪式印章|ceremonial seal', '蜡染布|batik cloth', '海峡航海图|sea chart', '香料箱|spice chest'],
  },
  filipino: {
    location: ['维甘|Vigan', '伊洛伊洛|Iloilo', '达沃|Davao', '帕西格河|Pasig River', '班乃岛|Panay', '巴拉望|Palawan', '苏禄群岛|Sulu Archipelago', '马尼拉湾|Manila Bay'],
    organization: ['巴朗盖议会|Barangay Council', '马京达瑙苏丹国|Sultanate of Maguindanao', '加莱昂商会|Galleon Company', '西班牙东印度公司|Spanish East Indies', '塔加洛族长会|Tagalog Datu Council', '伊洛卡诺商帮|Ilocano Guild', '圣奥古斯丁修会|Augustinian Order', '马尼拉大教区|Archdiocese of Manila'],
    item: ['博洛砍刀|bolo', '克里斯剑|kris', '巴林道剑|balisong', '贝壳首饰|shell necklace', '竹制文书|bamboo document', '加莱昂罗盘|galleon compass', '刺绣披肩|terno shawl', '藤编盾|rattan shield'],
  },
  yoruba: {
    location: ['伊巴丹|Ibadan', '阿贝奥库塔|Abeokuta', '伊洛林|Ilorin', '奥孙河|Osun River', '贝宁湾|Bight of Benin', '伊凯贾|Ikeja', '奥贡州|Ogun', '伊杰布|Ijebu'],
    organization: ['奥约帝国宫廷|Oyo Palace', '伊费王室|Ife Royal House', '奥里萨神庙|Orisha Temple', '埃格巴联盟|Egba Union', '猎人兄弟会|Hunters Guild', '铜匠行会|Bronze Casters Guild', '市场妇女会|Market Women Council', '约鲁巴王国联盟|Yoruba Confederacy', '奥贡祭司会|Ogun Priesthood', '伊巴丹酋长会议|Ibadan Council', '约鲁巴鼓乐行会|Yoruba Drummers Guild'],
    item: ['会说话的鼓|talking drum', '珠冠|bead crown', '青铜头像|bronze head', '伊费陶像|Ife terracotta', '乌木权杖|ebony staff', '科拉琴|kora', '靛蓝布|adire cloth', '祭祀贝壳|divination shells', '黄铜铃|brass bell', '神谕托盘|ifá tray', '珊瑚珠串|coral beads', '皇家扇|royal fan'],
  },
  amharic: {
    location: ['贡德尔|Gondar', '拉利贝拉|Lalibela', '阿克苏姆|Aksum', '哈勒尔|Harar', '塔纳湖|Lake Tana', '蓝尼罗河|Blue Nile', '德布雷达莫|Debre Damo', '马萨瓦|Massawa'],
    organization: ['所罗门王朝|Solomonic Dynasty', '阿克苏姆王国|Kingdom of Aksum', '帝国宫廷|Imperial Court', '特瓦赫多教会|Tewahedo Church', '德布雷利巴诺斯修道院|Debre Libanos', '拉斯贵族家族|Ras House', '贡德尔工匠行会|Gondar Guild', '咖啡商队|Coffee Caravan'],
    item: ['示巴十字架|Sheba cross', '埃塞俄比亚盾|Ethiopian shield', '羊皮经卷|parchment', '十字架权杖|processional cross', '阿姆哈拉短剑|shotel', '咖啡壶|jebena', '织花披巾|netela', '蜡板书|wax tablet'],
  },
  swahili: {
    location: ['蒙巴萨|Mombasa', '基尔瓦|Kilwa', '拉穆|Lamu', '佩姆巴岛|Pemba', '坦噶|Tanga', '维多利亚湖|Lake Victoria', '东非海岸|Swahili Coast', '索法拉|Sofala'],
    organization: ['基尔瓦苏丹国|Kilwa Sultanate', '桑给巴尔苏丹国|Zanzibar Sultanate', '斯瓦希里商帮|Swahili Merchant House', '骆驼商队行会|Caravan Guild', '海岸城邦议会|Coastal Council', '伊斯兰学者院|Madrasa Council', '木雕门匠行会|Carved Door Guild', '东非象牙商会|Ivory Traders'],
    item: ['康加布|kanga', '单桅帆船|dhow', '雕花木门|carved door', '斯瓦希里念珠|misbaha', '象牙印章|ivory seal', '非洲拇指琴|mbira', '铜制水壶|brass ewer', '季风航海图|monsoon chart'],
  },
  'zulu-xhosa': {
    location: ['乌伦迪|Ulundi', '大鱼河|Great Fish River', '德拉肯斯堡|Drakensberg', '夸祖鲁|KwaZulu', '伊桑德尔瓦纳|Isandlwana', '东开普|Eastern Cape', '纳塔尔|Natal', '阿姆塔塔|Mthatha'],
    organization: ['祖鲁王室|Zulu Royal House', '恩德贝莱王国|Ndebele Kingdom', '氏族议会|Clan Council', '战士团|Warrior Regiment', '恩古尼牛群协会|Nguni Cattle Society', '长老议会|Council of Elders', '伊西科萨王室|Xhosa Royal House', '珠饰工坊|Beadwork Guild'],
    item: ['阿塞盖长矛|assegai', '牛皮盾|cowhide shield', '珠饰项链|beadwork', '祖鲁头饰|Zulu headdress', '战士棍棒|knobkerrie', '兽角号|ivory horn', '牛皮斗篷|kaross', '氏族鼓|clan drum'],
  },
  'north-american': {
    location: ['费城|Philadelphia', '查尔斯顿|Charleston', '萨凡纳|Savannah', '圣奥古斯丁|St Augustine', '五大湖|Great Lakes', '落基山脉|Rockies', '切萨皮克湾|Chesapeake Bay', '新英格兰|New England'],
    organization: ['大陆会议|Continental Congress', '弗吉尼亚公司|Virginia Company', '哈德逊湾公司|Hudson Bay Company', '易洛魁联盟|Iroquois Confederacy', '波士顿茶党|Boston Tea Party', '拓荒者商站|Frontier Trading Post', '殖民地民兵|Colonial Militia', '铁路联合会|Railway Brotherhood'],
    item: ['燧发枪|flintlock', '手风琴表|railway watch', '拓荒者罗盘|frontier compass', '羽毛笔|quill pen', '殖民地银币|colonial shilling', '毛毯|trade blanket', '印第安陶罐|indigenous pot', '家族圣经|family Bible'],
  },
  mesoamerican: {
    location: ['奇琴伊察|Chichen Itza', '蒂卡尔|Tikal', '特奥蒂瓦坎|Teotihuacan', '乌斯马尔|Uxmal', '帕伦克|Palenque', '塔巴斯科|Tabasco', '墨西哥谷|Valley of Mexico', '特万特佩克|Tehuantepec'],
    organization: ['阿兹特克三方同盟|Aztec Triple Alliance', '玛雅城邦联盟|Maya League', '鹰战士团|Eagle Warriors', '美洲豹战士团|Jaguar Warriors', '卡尔普利议会|Calpulli Council', '太阳神庙祭司团|Sun Temple Priesthood', '玛雅抄写院|Maya Scribes', '羽蛇神祭司团|Quetzalcoatl Priesthood'],
    item: ['黑曜石刀|obsidian blade', '玉面具|jade mask', '羽蛇神羽饰|quetzal headdress', '羽毛盾|feather shield', '玛雅折叠书|Maya codex', '可可豆货币|cacao currency', '祭祀香炉|copal burner', '日历石|calendar stone'],
  },
  andean: {
    location: ['马丘比丘|Machu Picchu', '蒂亚瓦纳科|Tiwanaku', '阿雷基帕|Arequipa', '玻利维亚高原|Altiplano', '乌鲁班巴河|Urubamba', '纳斯卡|Nazca', '帕里亚|Paria', '阿塔卡马|Atacama'],
    organization: ['印加帝国|Inca Empire', '库斯科王室|Cusco Royal House', '太阳神庙祭司团|Sun Temple Priesthood', '基普记录官|Quipu Keepers', '阿伊柳氏族|Ayllu Community', '查斯基信使团|Chasqui Runners', '印加道路管理署|Qhapaq Nan Office', '安第斯织工行会|Andean Weavers', '蒂亚瓦纳科祭司团|Tiwanaku Priesthood', '纳斯卡陶工行会|Nazca Potters Guild', '高原牧民议会|Altiplano Council'],
    item: ['基普结绳|quipu', '投石索|sling', '太阳金盘|sun disc', '印加羊驼披风|alpaca cloak', '图米仪式刀|tumi', '羽饰头冠|feather crown', '陶制库鲁杯|qero cup', '可可叶束|coca bundle', '石制杵|stone mace', '安第斯长笛|quena flute', '玉米啤酒杯|chicha cup', '黄金耳饰|gold earspools'],
  },
}

// Fictional catalog entries are deliberately separate from the historical
// reference pools. They are complete, culture-shaped names for an original
// setting, rather than disguised real places, institutions, or artifacts.
const fictionalStylePools: Partial<Record<OfflineCulture, Partial<Record<OfflineNameKind, string[]>>>> = {
  chinese: { organization: ['北辰司', '听雨楼', '玄衡院', '青梧商会', '镇河营', '白鹿书院'], item: ['归雁令', '听雪灯', '玄铁短剑', '山河图卷', '青玉鱼符', '镇纸铜兽'] },
  japanese: { organization: ['月见会|Tsukimikai', '白鹭藩|Shirasagihan', '松风组|Matsukazegumi', '青叶奉行所|Aoba Bugyosho', '镜川神社|Kagamikawa Jinja', '雾岛商会|Kirishima Shokai'], item: ['月影太刀|Tsukikage Tachi', '白鹭家纹|Shirasagi Kamon', '松风卷物|Matsukaze Makimono', '青瓷香炉|Seiji Koro', '雾羽羽织|Kirihaori', '镜川御守|Kagamikawa Omamori'] },
  korean: { organization: ['青松书院', '白岳守备营', '月城商团', '清川乡约', '松岳行宫', '云鹤医局'], item: ['青玉佩刀', '白纸教旨', '月纹官印', '松烟墨', '云鹤玉笛', '清川兵符'] },
  english: { organization: ['灰堡议会|Greycastle Council', '乌鸦港商会|Ravenport Guild', '北境守望团|Northwatch Company', '白鹿修会|White Hart Order', '石桥法庭|Stonebridge Court', '雾谷书院|Mistvale College'], item: ['灰钢长剑|greysteel sword', '乌鸦印戒|raven signet', '北境罗盘|northwatch compass', '白鹿徽章|white hart badge', '石桥契约|Stonebridge charter', '雾谷提灯|Mistvale lantern'] },
  french: { organization: ['银谷伯爵领|Comte d Argentval', '红塔卫队|Garde de la Tour Rouge', '晨星修会|Ordre de l Etoile du Matin', '蔚蓝港商会|Compagnie du Port Bleu', '白蔷薇宫廷|Cour de la Rose Blanche', '雾林学院|Academie de Brumebois'], item: ['银谷细剑|rapiere d Argentval', '红蜡印|sceau de cire rouge', '晨星吊坠|pendentif de l Etoile', '蔚蓝港航图|carte du Port Bleu', '白蔷薇扇|eventail de Rose Blanche', '雾林手稿|manuscrit de Brumebois'] },
  german: { organization: ['银湖同盟|Silbersee Bund', '鹰岩骑士团|Falkenfels Orden', '北境商会|Nordmark Handelsbund', '黑松议会|Schwarzkiefer Rat', '白橡学院|Weisseiche Kolleg', '铁门卫队|Eisentor Wache'], item: ['鹰岩长剑|Falkenfels Schwert', '银湖印戒|Silbersee Siegelring', '北境账册|Nordmark Ledger', '黑松灯笼|Schwarzkiefer Laterne', '白橡法典|Weisseiche Kodex', '铁门钥匙|Eisentor Schlussel'] },
  italian: { organization: ['金谷公国|Ducato di Valdoro', '白塔商会|Compagnia della Torre Bianca', '月湾议会|Consiglio di Baialuna', '赤狮卫队|Guardia del Leone Rosso', '青石画院|Accademia Pietraverde', '雾港船会|Gilda di Porto Nebbia'], item: ['金谷细剑|stiletto di Valdoro', '白塔印章|sigillo della Torre Bianca', '月湾面具|maschera di Baialuna', '赤狮披风|mantello del Leone Rosso', '青石画册|codice Pietraverde', '雾港罗盘|bussola di Porto Nebbia'] },
  iberian: { organization: ['银月骑士团|Orden de Luna de Plata', '红岭议会|Consejo de Sierra Roja', '白帆商会|Casa de Vela Blanca', '太阳堡卫队|Guardia del Alcazar del Sol', '绿谷修院|Monasterio del Valle Verde', '海风航海院|Casa del Viento Marino'], item: ['银月细剑|estoque de Luna de Plata', '红岭印玺|sello de Sierra Roja', '白帆星盘|astrolabio de Vela Blanca', '太阳堡钥匙|llave del Alcazar del Sol', '绿谷念珠|rosario del Valle Verde', '海风航图|carta del Viento Marino'] },
  norse: { organization: ['乌鸦湾地方庭会|Ravnvik ting', '霜湾农场主会|Frostfjord bondelag', '铁松船匠坊|Jernfuru batbyggerlag', '北港船团|Nordhavn flate', '狼谷城堡卫队|Ulvedal borgvakt', '雷湾海岸守望队|Tordenvik kystvakt'], item: ['霜铁斧|frostjernoks', '乌鸦臂环|ravnearmring', '铁松盾|jernfuruskjold', '北海航石|nordhavets solstein', '狼牙短剑|ulvetann sverd', '雷湾饮酒角|tordenvik drikkehorn'] },
  icelandic: { organization: ['霜原地方廷会|Frostvollur heradsthing', '乌鸦峡谷农场主会|Hrafngil baendafelag', '北岸萨迦抄写院|Nordurstrond sagnaritara', '白浪鱼商会|Hvitbylgja fiskfelag', '熔岩谷法庭|Hraundalur domstoll', '冬港互助会|Vetrhofn hjalparfelag'], item: ['熔岩石磨|hraunsteinn kvarnar', '白浪胸针|hvitbylgja brooch', '冬港羊毛斗篷|vetrhofn cloak', '乌鸦峡谷卷轴|Hrafngil scroll', '霜原法典|frostvollur logbok', '北岸鲸骨梳|nordurstrond hvalbeinskambur'] },
  'ancient-greek': { organization: ['银橄榄同盟|Argyraia League', '赤陶公民会|Kerameikos Assembly', '月桂卫士团|Daphnai Guard', '青铜海商会|Chalkos Merchants', '风神神谕所|Anemos Oracle', '白帆城邦盟|Leukosail Polis League'], item: ['银橄榄冠|argyraia wreath', '赤陶酒器|kerameikos krater', '月桂短矛|daphnai dory', '青铜护腕|chalkos bracer', '风神蜡板|anemos tablet', '白帆船符|leukosail token'] },
  'ancient-rome': { organization: ['北门军团|Legio Porta Borealis', '银鹰氏族|Gens Aquila Argentea', '赤丘元老院|Senatus Collis Ruber', '白石禁卫队|Cohors Alba Petra', '月港商团|Collegium Portus Lunae', '金泉维斯塔院|Atrium Fons Aureus'], item: ['北门短剑|gladius Porta Borealis', '银鹰军旗|aquila argentea', '赤丘蜡板|tabula Collis Ruber', '白石印戒|anulus Alba Petra', '月港金币|aureus Portus Lunae', '金泉灯盏|lucerna Fons Aureus'] },
  egyptian: { organization: ['蓝莲花祭司团|Blue Lotus Priesthood', '金隼宫廷|Golden Falcon Court', '赤沙边军|Red Sand Guard', '月河书记官署|Moonriver Scribes', '白石工匠团|White Stone Artisans', '日轮神庙|Temple of the Sunwheel'], item: ['蓝莲花护符|blue lotus amulet', '金隼权杖|golden falcon sceptre', '赤沙匕首|red sand dagger', '月河纸草卷|moonriver papyrus', '白石圣甲虫|white stone scarab', '日轮胸饰|sunwheel pectoral'] },
  'india-north': { location: ['月河城|Chandranagar', '赤砂关|Lal Ret Darwaza', '白象原|Shwet Hathi Maidan', '金莲湖|Swarna Kamal Tal', '蓝城集市|Nilnagar Bazaar', '风堡岭|Vayugarh Ridge'], organization: ['月河王庭|Chandrana Court', '赤砂骑团|Lal Ret Knights', '白象商会|Shwet Hathi Guild', '金莲学舍|Swarna Kamal Gurukula', '蓝城织工会|Nilnagar Weavers', '风堡守军|Vayugarh Guard'], item: ['月河弯刀|Chandrana talwar', '赤砂匕首|Lal Ret katar', '白象香盒|Shwet Hathi casket', '金莲铜灯|Swarna Kamal lamp', '蓝城织锦|Nilnagar textile', '风堡印章|Vayugarh seal'] },
  'india-south': { location: ['金棕榈城|Swarna Tala', '白石寺谷|Vella Kal Valley', '青河港|Neela Nadi Port', '红土堡|Semman Fort', '月莲湖|Chandra Kamal Lake', '风塔岭|Kaatru Gopuram Ridge'], organization: ['金棕榈王庭|Swarna Tala Court', '白石寺院|Vella Kal Temple', '青河船会|Neela Nadi Guild', '红土守军|Semman Guard', '月莲学舍|Chandra Kamal School', '风塔工坊|Kaatru Gopuram'], item: ['金棕榈短剑|Swarna Tala urumi', '白石铜像|Vella Kal bronze', '青河帆布|Neela Nadi cloth', '红土灯|Semman lamp', '月莲经卷|Chandra Kamal manuscript', '风塔印章|Kaatru Gopuram seal'] },
  vietnamese: { location: ['青龙城|Thành Thanh Long', '白云渡|Bến Bạch Vân', '月河埠|Bến Nguyệt Hà', '红莲村|Làng Hồng Liên', '松岭关|Ải Tùng Lĩnh', '金龟湖|Hồ Kim Quy'], organization: ['青龙江会|Hội Thanh Long', '白云书院|Học viện Bạch Vân', '月河水军|Thủy quân Nguyệt Hà', '红莲医馆|Y quán Hồng Liên', '松岭商帮|Thương hội Tùng Lĩnh', '金龟守备营|Đồn binh Kim Quy'], item: ['青龙短剑|gươm Thanh Long', '白云纸卷|cuộn giấy Bạch Vân', '月河灯笼|đèn Nguyệt Hà', '红莲药盒|hộp thuốc Hồng Liên', '松岭竹笛|sáo trúc Tùng Lĩnh', '金龟兵符|thẻ lệnh Kim Quy'] },
  thai: { location: ['金象城|Mueang Chang Thong', '月莲寺|Wat Bua Chan', '白虎岭|Khao Suea', '青河埠|Mae Nam Khiao', '红塔市|Talat Ho Daeng', '风铃谷|Valley Krachang'], organization: ['金象宫廷|Ratcha Chang Thong Court', '月莲寺院|Wat Bua Chan', '白虎卫队|Suea Khao Guard', '青河商会|Mae Nam Khiao Guild', '红塔工坊|Ho Daeng Workshop', '风铃僧团|Sangha Krachang'], item: ['金象短剑|krabi Chang Thong', '月莲灯|Bua Chan lamp', '白虎面具|Suea Khao mask', '青河丝绸|Mae Nam Khiao silk', '红塔印章|Ho Daeng seal', '风铃经卷|Krachang manuscript'] },
  malay: { location: ['月湾|Teluk Bulan', '白帆港|Pelabuhan Layar Putih', '金雨村|Kampung Hujan Emas', '青峰|Puncak Hijau', '红雀岛|Pulau Merah', '海雾海峡|Selat Kabus Laut'], organization: ['月湾苏丹庭|Istana Teluk Bulan', '白帆商会|Serikat Layar Putih', '金雨村社|Kampung Hujan Emas', '青峰习惯法会|Adat Puncak Hijau', '红雀船团|Armada Merah', '海雾学舍|Madrasah Kabus Laut'], item: ['月湾克里斯剑|keris Teluk Bulan', '白帆宋吉锦|songket Layar Putih', '金雨印章|cap Hujan Emas', '青峰棕榈书|lontar Puncak Hijau', '红雀香盒|bekas Merah', '海雾罗盘|kompas Kabus Laut'] },
  filipino: { location: ['月潮湾|Buwan Bay', '白珊瑚岛|White Coral Island', '红鸟高地|Red Bird Highlands', '青湾港|Azure Bay', '金稻平原|Golden Rice Plain', '雾岛|Mist Island'], organization: ['月潮巴朗盖|Barangay Buwan', '白珊瑚商会|White Coral Guild', '红鸟战团|Red Bird Warband', '青湾船会|Azure Bay Company', '金稻议会|Golden Rice Council', '雾岛修院|Mist Island House'], item: ['月潮博洛刀|Buwan bolo', '白珊瑚吊坠|white coral pendant', '红鸟盾|red bird shield', '青湾罗盘|Azure Bay compass', '金稻织毯|golden rice cloth', '雾岛灯笼|Mist Island lantern'] },
  yoruba: { location: ['金鼓城|Golden Drum Town', '白贝河|White Shell River', '红土原|Red Earth Plain', '青靛市|Indigo Market', '河神林|River Spirit Grove', '日影岭|Sunshade Ridge'], organization: ['金鼓宫廷|Golden Drum Court', '白贝神谕会|White Shell Oracle', '红土商团|Red Earth Guild', '青靛染坊|Indigo House', '河神祭司团|River Spirit Priests', '日影长老会|Sunshade Elders'], item: ['金鼓杖|golden drum staff', '白贝神谕盘|white shell oracle tray', '红土面具|red earth mask', '青靛布|indigo cloth', '河神铃|river spirit bell', '日影扇|sunshade fan'] },
  amharic: { location: ['金狮山|Golden Lion Hill', '白岩谷|White Rock Valley', '青尼罗渡|Blue Nile Crossing', '红土堡|Red Earth Fort', '月冠台地|Moon Crown Plateau', '高原集市|Highland Market'], organization: ['金狮宫廷|Golden Lion Court', '白岩修院|White Rock Monastery', '青尼罗商队|Blue Nile Caravan', '红土卫队|Red Earth Guard', '月冠教堂|Moon Crown Church', '高原议会|Highland Council'], item: ['金狮十字架|golden lion cross', '白岩经卷|white rock parchment', '青尼罗咖啡壶|Blue Nile jebena', '红土盾|red earth shield', '月冠权杖|moon crown staff', '高原披巾|highland netela'] },
  swahili: { location: ['月门港|Moon Gate Port', '白帆岛|White Sail Island', '红珊瑚湾|Red Coral Bay', '青风城|Blue Wind Town', '金湾|Golden Bay', '雨季海峡|Monsoon Strait'], organization: ['月门苏丹庭|Moon Gate Sultanate', '白帆海商会|White Sail Guild', '红珊瑚家族|Red Coral House', '青风学院|Blue Wind Madrasa', '金湾港务会|Golden Bay Council', '雨季船团|Monsoon Fleet'], item: ['月门匕首|Moon Gate dagger', '白帆帆布|white sailcloth', '红珊瑚念珠|red coral misbaha', '青风木门|blue wind door', '金湾水壶|golden bay ewer', '雨季航图|monsoon chart'] },
  'zulu-xhosa': { location: ['金盾谷|Golden Shield Valley', '白河草原|White River Grassland', '红岭|Red Ridge', '青牛牧场|Blue Cattle Kraal', '月影村|Moonshadow Village', '风谷|Wind Valley'], organization: ['金盾氏族|Golden Shield Clan', '白河长老会|White River Elders', '红岭战团|Red Ridge Regiment', '青牛牧群会|Blue Cattle Society', '月影珠饰坊|Moonshadow Beadwork', '风谷议会|Wind Valley Council'], item: ['金盾长矛|golden shield assegai', '白河牛角|white river horn', '红岭棍棒|red ridge knobkerrie', '青牛披风|blue cattle kaross', '月影珠串|moonshadow beads', '风谷鼓|wind valley drum'] },
  'north-american': { location: ['雾松边境|Mistpine Frontier', '白河镇|White River Town', '赤谷|Red Valley', '北星堡|Northstar Fort', '蓝岭|Blue Ridge', '黑杉商站|Black Spruce Post'], organization: ['雾松边境会|Mistpine Frontier Company', '白河铁路社|White River Railway', '赤谷矿业会|Red Valley Mining Guild', '北星法庭|Northstar Court', '蓝岭报社|Blue Ridge Press', '黑杉商站|Black Spruce Trading Post'], item: ['雾松燧发枪|Mistpine flintlock', '白河怀表|White River watch', '赤谷矿灯|Red Valley lamp', '北星徽章|Northstar badge', '蓝岭地图|Blue Ridge map', '黑杉旅行箱|Black Spruce trunk'] },
  mesoamerican: { location: ['月羽城|Moon Feather City', '白玉阶|White Jade Steps', '红曜石谷|Red Obsidian Valley', '青蛇湖|Blue Serpent Lake', '金雨平原|Golden Rain Plain', '风阶台地|Wind Stair Plateau'], organization: ['月羽议会|Moon Feather Council', '白玉祭司团|White Jade Priests', '红曜石战团|Red Obsidian Warriors', '青蛇抄写院|Blue Serpent Scribes', '金雨商会|Golden Rain Guild', '风阶神庙|Wind Stair Temple'], item: ['月羽盾|moon feather shield', '白玉面具|white jade mask', '红曜石刀|red obsidian blade', '青蛇书卷|blue serpent codex', '金雨香炉|golden rain burner', '风阶石牌|wind stair tablet'] },
  andean: { location: ['白峰|White Peak', '金日台地|Golden Sun Plateau', '红谷|Red Valley', '青湖|Blue Lake', '月岩关|Moon Rock Pass', '风鹰岭|Wind Condor Ridge'], organization: ['白峰阿伊柳|White Peak Ayllu', '金日祭司团|Golden Sun Priests', '红谷信使团|Red Valley Chasqui', '青湖织工会|Blue Lake Weavers', '月岩结绳署|Moon Rock Quipu Office', '风鹰议会|Wind Condor Council'], item: ['白峰投石索|white peak sling', '金日盘|golden sun disc', '红谷信使袋|red valley pouch', '青湖织毯|blue lake textile', '月岩结绳|moon rock quipu', '风鹰羽冠|wind condor crown'] },
  'russian-siberian': { location: ['霜河公国|Morozorech Principality', '白桦驿城|Berezovyi Posad', '极光关|Aurora Ostrog', '雪松边城|Kedrovy Gorodok', '北辰港|Severozvezdny Port', '长冬谷|Dolgozimye Valley'], organization: ['霜河议会|Morozorech Duma', '白桦哥萨克团|Berezovyi Cossacks', '极光观测院|Aurora Observatory', '雪松商会|Kedrovy Guild', '北辰边防署|Severozvezdny Guard', '长冬修院|Dolgozimye Monastery'], item: ['霜河印玺|Morozorech seal', '白桦短剑|Berezovyi knife', '极光罗盘|Aurora compass', '雪松圣像|Kedrovy icon', '北辰猎枪|Severozvezdny rifle', '长冬皮裘|Dolgozimye fur coat'] },
}

// These entries deepen the European packs without borrowing material from a
// neighbouring culture. Reference entries are attested places, institutions
// or object types; complete fictional entries are kept out of the morpheme
// combiner so their names are never cut apart and recombined.
const europeanReferenceExpansion: Partial<Record<OfflineCulture, Partial<Record<OfflineNameKind, string[]>>>> = {
  english: {
    location: ['巴斯|Bath', '达勒姆|Durham', '索尔兹伯里|Salisbury', '科茨沃尔德|Cotswolds', '伊利|Ely', '罗切斯特|Rochester', '格洛斯特|Gloucester', '什鲁斯伯里|Shrewsbury', '诺里奇|Norwich', '埃克塞特|Exeter'],
    organization: ['伦敦商船冒险家公司|Company of Merchant Adventurers of London', '格雷律师学院|Gray\'s Inn', '王家学会|Royal Society', '三一宫|Trinity House', '五港同盟|Cinque Ports', '牛津大学|University of Oxford', '剑桥大学|University of Cambridge', '皇家造币厂|Royal Mint', '英国国家信托|National Trust', '英国电影协会|British Film Institute'],
    item: ['计数木筹|tally stick', '锡镴酒杯|pewter tankard', '英格兰长弓|English longbow', '时祷书|book of hours', '国王大印|Great Seal', '朝圣徽章|pilgrim badge', '角书|hornbook', '燧发滑膛枪|flintlock musket', '牡蛎交通卡|Oyster card', '铁路优惠卡|railcard'],
  },
  french: {
    location: ['卡尔卡松|Carcassonne', '第戎|Dijon', '沙特尔|Chartres', '圣米歇尔山|Mont-Saint-Michel', '布尔日|Bourges', '普瓦捷|Poitiers', '昂热|Angers', '特鲁瓦|Troyes', '普罗万|Provins', '卡昂|Caen'],
    organization: ['巴黎高等法院|Parlement of Paris', '戈布兰织毯工场|Manufacture des Gobelins', '法兰西学术院|Académie française', '法国东印度公司|Compagnie française des Indes orientales', '圣但尼修道院|Abbey of Saint-Denis', '奥尔良大学|University of Orleans', '法国皇家科学院|Académie royale des sciences', '塞夫勒瓷器工场|Manufacture de Sèvres', '法国国家档案馆|Archives nationales', '法国国家电影中心|Centre national du cinéma'],
    item: ['品酒银碟|tastevin', '利摩日珐琅匣|Limoges enamel casket', '彩釉陶盘|faience plate', '圣物匣|reliquary', '图尔德尼尔银币|denier tournois', '宫廷折扇|court fan', '塞夫勒瓷杯|Sèvres porcelain cup', '法兰西公报|Gazette de France', '巴黎交通卡|Navigo pass', '博物馆通票|Paris Museum Pass'],
  },
  german: {
    location: ['奥格斯堡|Augsburg', '美因茨|Mainz', '海德堡|Heidelberg', '戈斯拉尔|Goslar', '特里尔|Trier', '马格德堡|Magdeburg', '爱尔福特|Erfurt', '乌尔姆|Ulm', '班贝格|Bamberg', '奎德林堡|Quedlinburg'],
    organization: ['帝国最高法院|Reichskammergericht', '纽伦堡名歌手会|Meistersingers of Nuremberg', '矿工兄弟会|Knappschaft', '海德堡大学|University of Heidelberg', '普鲁士科学院|Prussian Academy of Sciences', '哥廷根大学|University of Göttingen', '迈森瓷器工场|Meissen porcelain manufactory', '弗劳恩霍夫协会|Fraunhofer Society', '德国国家图书馆|German National Library', '德国考古研究院|German Archaeological Institute'],
    item: ['炻器啤酒杯|Steinzeugkrug', '齐特琴|Zither', '木刻印版|woodcut block', '矿工安全灯|mining safety lamp', '布拉克特薄片银币|bracteate', '路德版圣经|Luther Bible', '迈森瓷杯|Meissen porcelain cup', '邮驿号角|post horn', '德国交通月票|Deutschlandticket', '城际快车车票|ICE ticket'],
  },
  italian: {
    location: ['维罗纳|Verona', '拉文纳|Ravenna', '乌尔比诺|Urbino', '阿马尔菲|Amalfi', '卢卡|Lucca', '帕多瓦|Padua', '佩鲁贾|Perugia', '曼托瓦|Mantua', '费拉拉|Ferrara', '帕尔马|Parma'],
    organization: ['秕糠学会|Accademia della Crusca', '威尼斯军械库|Arsenale di Venezia', '圣乔治银行|Banco di San Giorgio', '法官与公证人行会|Arte dei Giudici e Notai', '佛罗伦萨卡利马拉行会|Arte di Calimala', '威尼斯十人委员会|Council of Ten', '帕多瓦大学|University of Padua', '乌菲齐美术馆|Uffizi Galleries', '意大利国家档案总局|Direzione generale Archivi', '威尼斯双年展基金会|La Biennale di Venezia'],
    item: ['马约利卡彩陶盘|maiolica plate', '穆拉诺玻璃珠|Murano glass bead', '即兴喜剧面具|commedia dell\'arte mask', '文艺复兴纪念章|Renaissance medal', '佛罗伦萨金币|florin', '威尼斯杜卡特|Venetian ducat', '商用算盘|merchant abacus', '镶嵌木匣|intarsia casket', '摩卡壶|moka pot', '城市交通卡|urban transit card'],
  },
  iberian: {
    location: ['布尔戈斯|Burgos', '塞哥维亚|Segovia', '萨拉戈萨|Zaragoza', '蒙特塞拉特|Montserrat', '昆卡|Cuenca', '卡塞雷斯|Caceres', '托莱多|Toledo', '格拉纳达|Granada', '毕尔巴鄂|Bilbao', '潘普洛纳|Pamplona'],
    organization: ['梅斯塔牧主会|Honrado Concejo de la Mesta', '卡斯蒂利亚议会|Cortes of Castile', '萨拉曼卡大学|University of Salamanca', '海商领事馆|Consulado de Mercaderes', '印度事务院|Council of the Indies', '阿尔卡拉大学|University of Alcala', '西班牙皇家语言学院|Royal Spanish Academy', '普拉多博物馆|Museo del Prado', '西班牙国家图书馆|National Library of Spain', '西班牙国家档案馆|Spanish State Archives'],
    item: ['托莱多错金钢器|Toledo damascene steelwork', '陶制水罐|botijo', '曼蒂利亚头纱|mantilla', '羊皮航海图|portolan chart', '阿杜尔加皮盾|adarga', '西班牙埃斯库多金币|Spanish escudo', '彩绘药罐|albarelo', '西班牙折扇|abanico', '水手星盘|mariner astrolabe', '高速铁路车票|AVE ticket'],
  },
  norse: {
    location: ['勒罗斯|Roros', '孔斯贝格|Kongsberg', '莫尔德|Molde', '纳尔维克|Narvik', '海于格松|Haugesund', '泰勒马克|Telemark', '多弗勒山|Dovrefjell', '龙达讷山地|Rondane', '纳柔依峡湾|Naeroyfjord', '费门斯马克国家公园|Femundsmarka'],
    organization: ['挪威科学与文学院|Norwegian Academy of Science and Letters', '斯塔万格大学|University of Stavanger', '挪威海事博物馆|Norwegian Maritime Museum', '维京时代博物馆|Museum of the Viking Age', '挪威国家档案馆|National Archives of Norway', '挪威语言委员会|Language Council of Norway', '挪威测绘局|Norwegian Mapping Authority', '挪威渔业局|Norwegian Directorate of Fisheries', '挪威诺贝尔研究所|Norwegian Nobel Institute', '挪威公路管理局|Norwegian Public Roads Administration'],
    item: ['挪威乐斯梅林彩绘木箱|Norwegian rosemaling chest', '古德布兰河谷木雕板|Gudbrandsdal carved panel', '孔斯贝格银器|Kongsberg silverware', '勒罗斯铜壶|Roros copper kettle', '塞尔布连指手套|Selbu mittens', '挪威传统点纹毛衣|Norwegian lusekofte', '泰勒马克木制滑雪板|Telemark wooden skis', '挪威四先令银币|Norwegian four-skilling coin', '《挪威宪法》复制本|Norwegian Constitution facsimile', '挪威彩绘啤酒碗|Norwegian painted ale bowl'],
  },
  icelandic: {
    location: ['阿斯恰火山口|Askja', '黛提瀑布|Dettifoss', '黄金瀑布|Gullfoss', '盖歇尔间歇泉|Geysir', '兰德曼纳劳卡|Landmannalaugar', '索斯莫克山谷|Thorsmork', '迪姆博尔吉尔熔岩区|Dimmuborgir', '霍恩斯特兰迪尔|Hornstrandir', '瓦特纳冰川|Vatnajokull', '埃亚菲亚德拉冰盖|Eyjafjallajokull'],
    organization: ['阿德尼马格努松冰岛研究所|Arni Magnusson Institute for Icelandic Studies', '冰岛国家档案馆|National Archives of Iceland', '冰岛最高法院|Supreme Court of Iceland', '冰岛中央银行|Central Bank of Iceland', '冰岛文学协会|Icelandic Literary Society', '雷克雅未克城市图书馆|Reykjavik City Library', '冰岛地方政府协会|Icelandic Association of Local Authorities', '冰岛艺术中心|Icelandic Art Center', '冰岛电影中心|Icelandic Film Centre', '冰岛手球协会|Icelandic Handball Association'],
    item: ['王家宝典复制本|Codex Regius facsimile', '弗拉泰岛书复制本|Flateyjarbok facsimile', '莫兹鲁韦利尔书复制本|Modruvallabok facsimile', '冰岛角制匙|Icelandic horn spoon', '木制阿斯库尔碗|askur bowl', '冰岛羊毛圆肩毛衣|lopapeysa', '冰岛羊毛毯|Icelandic wool blanket', '草皮切割铲|turf-cutting spade', '鱼皮鞋|fish-skin shoes', '鳕鱼干货捆|stockfish bundle'],
  },
  'ancient-greek': {
    location: ['多多纳|Dodona', '巴赛|Bassae', '苏尼翁海岬|Cape Sounion', '厄琉息斯|Eleusis', '阿姆菲波利斯|Amphipolis', '萨莫色雷斯岛|Samothrace', '萨索斯岛|Thasos', '埃伊纳岛|Aegina', '希俄斯岛|Chios', '纳克索斯岛|Naxos'],
    organization: ['德尔斐近邻同盟|Delphic Amphictyony', '雅典战神山议事会|Areopagus', '斯巴达长老会|Spartan Gerousia', '斯巴达监察官团|Spartan Ephors', '奥林匹亚裁判团|Hellanodikai', '科斯阿斯克勒庇俄斯神殿|Asclepieion of Kos', '青年军事训练团|Ephebeia', '雅典铸币局|Athenian Mint', '提洛神庙管理团|Delian Temple Administration', '毕达哥拉斯学派|Pythagorean Brotherhood'],
    item: ['阿里巴洛斯香油瓶|aryballos', '莱基托斯油瓶|lekythos', '海德里亚水罐|hydria', '奥伊诺科埃酒壶|oinochoe', '运动员刮汗器|strigil', '佩普洛斯长衣|peplos', '克拉米斯短斗篷|chlamys', '基萨拉琴|kithara', '阿夫洛斯管|aulos', '四德拉克马银币|tetradrachm'],
  },
  'ancient-rome': {
    location: ['图拉真广场|Forum of Trajan', '万神殿|Pantheon', '卡拉卡拉浴场|Baths of Caracalla', '大竞技场|Circus Maximus', '圣道|Via Sacra', '和平祭坛|Ara Pacis', '波尔图斯港|Portus', '温多兰达|Vindolanda', '提姆加德|Thamugadi', '塞哥维亚输水道|Aqueduct of Segovia'],
    organization: ['大祭司团|College of Pontiffs', '维斯塔贞女团|Vestal Virgins', '阿尔瓦祭司兄弟会|Arval Brethren', '工匠社团|Collegium Fabrum', '罗马消防警备队|Vigiles Urbani', '粮食供应署|Cura Annonae', '帝国驿传系统|Cursus Publicus', '禁卫军|Praetorian Guard', '罗马元老院|Roman Senate', '帝国铸币局|Imperial Mint'],
    item: ['搭扣胸针|fibula', '青铜书写笔|bronze stylus', '蜡板|wax tablet', '入场陶筹|tessera', '香膏玻璃瓶|balsamarium', '运动员刮汗器|strigil', '罗马军靴|caligae', '大型陶瓮|dolium', '双耳陶罐|amphora', '锁子甲|lorica hamata'],
  },
  celtic: {
    location: ['格兰达洛|Glendalough', '凯尔斯|Kells', '邓安格斯|Dun Aengus', '克朗麦克诺伊斯|Clonmacnoise', '塔拉山|Hill of Tara', '卡舍尔岩|Rock of Cashel', '阿马|Armagh', '基尔代尔|Kildare', '斯凯利格·迈克尔|Skellig Michael', '内伊湖|Lough Neagh'],
    organization: ['爱尔兰部族议会|Irish tuath council', '布雷洪法庭|Brehon court', '菲利德诗人等级|Filid', '爱尔兰修道院网络|Irish monastic network', '盖尔语联盟|Conradh na Gaeilge', '爱尔兰皇家科学院|Royal Irish Academy', '阿马主教座堂法团|Armagh Cathedral Chapter', '克朗诺伊斯修道院院会|Clonmacnoise monastic community', '爱尔兰手稿委员会|Irish Manuscripts Commission', '爱尔兰国家大学|National University of Ireland'],
    item: ['爱尔兰颈环|torc', '欧甘铭文石|ogham stone', '爱尔兰竖琴|clairseach', '半环形胸针|penannular brooch', '阿达圣杯|Ardagh Chalice', '达罗之书|Book of Durrow', '塔拉胸针|Tara Brooch', '卢格纳沙德号角|Loughnashade Trumpet', '爱尔兰风笛|uilleann pipes', '布赖恩·博鲁竖琴|Brian Boru harp'],
  },
  'slavic-east': {
    location: ['基辅|Kyiv', '利沃夫|Lviv', '切尔尼戈夫|Chernihiv', '第聂伯河|Dnipro', '敖德萨|Odesa', '波尔塔瓦|Poltava', '文尼察|Vinnytsia', '卡缅涅茨-波多利斯基|Kamianets-Podilskyi', '乌日霍罗德|Uzhhorod', '哈尔科夫|Kharkiv'],
    organization: ['鲁塞尼亚维彻大会|Ruthenian Veche', '基辅亲兵团|Kievan Druzhina', '扎波罗热塞契|Zaporozhian Sich', '基辅洞窟修道院|Kyiv Pechersk Lavra', '奥斯特罗赫学院|Ostroh Academy', '基辅莫希拉学院|Kyiv-Mohyla Academy', '乌克兰科学院|National Academy of Sciences of Ukraine', '普罗维塔启蒙协会|Prosvita', '乌克兰西奇步枪兵|Ukrainian Sich Riflemen', '乌克兰国家银行|National Bank of Ukraine'],
    item: ['桦树皮文书|birch bark letter', '鲁什尼克刺绣巾|rushnyk', '班杜拉琴|bandura', '科布扎琴|kobza', '佩列索普尼察福音书|Peresopnytsia Gospel', '维什万卡刺绣衫|vyshyvanka', '复活节彩蛋|pysanka', '胡楚尔战斧|bartka', '乌克兰格里夫纳|Ukrainian hryvnia', '哥萨克权杖|Bulava'],
  },
  'dutch-lowlands': {
    location: ['鹿特丹|Rotterdam', '代尔夫特|Delft', '莱顿|Leiden', '泽兰|Zeeland', '乌得勒支|Utrecht', '哈勒姆|Haarlem', '格罗宁根|Groningen', '马斯特里赫特|Maastricht', '阿纳姆|Arnhem', '小孩堤防|Kinderdijk'],
    organization: ['荷兰东印度公司|Vereenigde Oostindische Compagnie', '阿姆斯特丹海军部|Admiralty of Amsterdam', '莱顿大学|Leiden University', '圣路加行会|Guild of Saint Luke', '荷兰西印度公司|Dutch West India Company', '荷兰三级会议|States General of the Netherlands', '荷兰皇家艺术与科学学院|Royal Netherlands Academy of Arts and Sciences', '荷兰水务委员会|Dutch water board', '荷兰国家博物馆|Rijksmuseum', '荷兰归正教会|Dutch Reformed Church'],
    item: ['代尔夫特蓝陶盘|Delftware plate', '郁金香球茎账册|tulip bulb ledger', '黄铜望远镜|brass spyglass', '运河冰鞋|canal skates', '荷兰木鞋|Dutch clog', '荷兰盾币|Dutch guilder', '鲱鱼木桶|herring barrel', '荷兰东印度公司航海日志|VOC logbook', '荷兰奶酪轮|Dutch cheese wheel', '荷兰交通卡|OV-chipkaart'],
  },
  baltic: {
    location: ['阿尼克什奇艾|Anyksciai', '比尔什托纳斯|Birstonas', '克雷廷加|Kretinga', '罗基什基斯|Rokiskis', '扎拉赛|Zarasai', '普伦盖|Plunge', '拉乌多内|Raudone', '帕内穆内|Panemune', '文特海岬|Cape Vente', '十字架山|Hill of Crosses'],
    organization: ['立陶宛历史研究所|Lithuanian Institute of History', '立陶宛文学与民俗研究所|Institute of Lithuanian Literature and Folklore', '丘尔廖尼斯国家艺术博物馆|M K Ciurlionis National Museum of Art', '立陶宛露天博物馆|Lithuanian Open Air Museum', '立陶宛国家文化中心|Lithuanian National Culture Centre', '立陶宛作家协会|Lithuanian Writers Union', '立陶宛民俗协会|Lithuanian Folklore Society', '立陶宛海事博物馆|Lithuanian Sea Museum', '立陶宛篮球联合会|Lithuanian Basketball Federation', '立陶宛国家歌剧与芭蕾舞剧院|Lithuanian National Opera and Ballet Theatre'],
    item: ['立陶宛坎克莱斯琴|Lithuanian kankles', '立陶宛织纹腰带|Lithuanian juosta sash', '琥珀银胸针|amber silver brooch', '草编索达斯吊饰|sodas straw ornament', '立陶宛彩绘蛋|Lithuanian margutis', '沉思基督木雕|rupintojelis carving', '木制纺线杆|wooden distaff', '立陶宛亚麻巾|Lithuanian linen towel', '木制啤酒杯|wooden beer mug', '立陶宛第纳尔银币|Lithuanian denar'],
  },
  balkan: {
    location: ['奥普莱纳茨|Oplenac', '奥夫恰尔-卡布拉尔峡谷|Ovcar-Kablar Gorge', '弗尔尼亚奇卡矿泉镇|Vrnjacka Banja', '斯雷姆斯基卡尔洛夫奇|Sremski Karlovci', '扎耶查尔|Zajecar', '普罗库普列|Prokuplje', '莱斯科瓦茨|Leskovac', '弗拉涅|Vranje', '德斯波托瓦茨|Despotovac', '乌瓦茨峡谷|Uvac Canyon'],
    organization: ['塞尔维亚历史博物馆|Historical Museum of Serbia', '塞尔维亚民族志博物馆|Ethnographic Museum of Serbia', '贝尔格莱德爱乐乐团|Belgrade Philharmonic Orchestra', '塞尔维亚国家广播交响乐团|RTS Symphony Orchestra', '塞尔维亚文化遗产保护研究所|Institute for the Protection of Cultural Monuments of Serbia', '塞尔维亚作家协会|Serbian Writers Association', '塞尔维亚国家剧院|Serbian National Theatre', '尼什国家博物馆|National Museum of Nis', '塞尔维亚登山协会|Mountaineering Association of Serbia', '塞尔维亚考古研究所|Institute of Archaeology Belgrade'],
    item: ['塞尔维亚双管弗鲁拉笛|Serbian dvojnice flute', '皮罗特基里姆织毯|Pirot kilim', '兹拉库萨陶壶|Zlakusa pottery jug', '沙伊卡查羊毛帽|sajkaca cap', '塞尔维亚古斯莱琴|Serbian gusle', '塞尔维亚奥帕纳克皮鞋|Serbian opanak shoes', '传统木制酒壶|Serbian wooden cutura flask', '利齐德尔彩饰饼模|licider cake mould', '塞尔维亚刺绣巾|Serbian embroidered towel', '塞尔维亚第纳尔纪念币|Serbian dinar commemorative coin'],
  },
  caucasus: {
    location: ['纳尔村|Nar', '库尔塔村|Kurtat', '塔加村|Tag', '苏阿达格|Suadag', '萨多纳|Sadon', '吉泽利|Gizel', '菲亚格顿河谷|Fiagdon Valley', '阿尔洪峡谷|Arkhon Gorge', '乌鲁赫河谷|Urukh Valley', '米达格拉宾瀑布|Midagrabin Waterfalls'],
    organization: ['北奥塞梯人文与社会研究所|North Ossetian Institute for Humanitarian and Social Studies', '北奥塞梯国家学术剧院|North Ossetian State Academic Theatre', '奥塞梯文学博物馆|Museum of Ossetian Literature', '科斯塔·赫塔古罗夫纪念馆|Kosta Khetagurov Memorial Museum', '北奥塞梯国家民俗舞团|North Ossetian State Folk Ensemble', '奥塞梯语言委员会|Ossetian Language Commission', '北奥塞梯登山联合会|Mountaineering Federation of North Ossetia', '弗拉季高加索历史学会|Vladikavkaz Historical Society', '奥塞梯史诗研究会|Ossetian Epic Studies Society', '北奥塞梯文化遗产保护中心|North Ossetian Heritage Centre'],
    item: ['奥塞梯基辛凡德尔提琴|Ossetian kisyn fandyr', '奥塞梯达拉凡德尔竖琴|Ossetian dala fandyr', '奥塞梯乌阿丁兹笛|Ossetian uadynz flute', '奥塞梯三足祭礼桌|Ossetian three-legged ritual table', '奥塞梯馅饼木托盘|Ossetian pie wooden tray', '阿兰纹样银胸针|Alan-pattern silver brooch', '奥塞梯刺绣披肩|Ossetian embroidered shawl', '奥塞梯羊毛毡帽|Ossetian felt hat', '纳尔特史诗选本|Nart saga anthology', '奥塞梯语字母表册|Ossetian alphabet booklet'],
  },
  polish: {
    location: ['克拉科夫|Kraków', '格但斯克|Gdańsk', '托伦|Toruń', '瓦维尔山|Wawel Hill', '华沙|Warsaw', '弗罗茨瓦夫|Wrocław', '波兹南|Poznań', '卢布林|Lublin', '维斯瓦河|Vistula River', '维利奇卡盐矿|Wieliczka Salt Mine'],
    organization: ['波兰瑟姆议会|Sejm of Poland', '雅盖隆大学|Jagiellonian University', '波兰翼骑兵|Polish Winged Hussars', '克拉科夫纺织会馆|Krakow Cloth Hall', '皮雅斯特王廷|Piast court', '诺布尔瑟姆贵族议会|Noble Sejm', '维利奇卡盐矿工会|Wieliczka Salt Miners Guild', '华沙皇家城堡档案馆|Royal Castle Archives', '波兰科学院|Polish Academy of Sciences', '波兰陶工行会|Polish Potters Guild'],
    item: ['波兰马刀|szabla', '茹潘长袍|żupan', '孔图什腰带|kontusz sash', '琥珀嵌饰匣|amber inlaid casket', '翼骑兵羽饰|hussar wings', '波兰剪纸|wycinanki', '木制齐特琴|wooden zither', '盐矿工灯|salt miners lamp', '波兰王室敕令|Polish royal charter', '波兰刺绣桌巾|Polish embroidered cloth'],
  },
  hungarian: {
    location: ['布达|Buda', '佩奇|Pécs', '德布勒森|Debrecen', '巴拉顿湖|Lake Balaton', '布达佩斯|Budapest', '塞格德|Szeged', '埃格尔|Eger', '维谢格拉德|Visegrad', '多瑙河|Danube River', '潘侬豪尔毛修道院|Pannonhalma Archabbey'],
    organization: ['匈牙利等级议会|Diet of Hungary', '马加什黑军|Black Army of Hungary', '王国宫廷伯署|Palatine Court', '德布勒森归正学院|Reformed College of Debrecen', '阿尔帕德王朝王廷|Arpad dynasty court', '匈牙利骠骑兵团|Hungarian Hussars', '马扎尔皮革工会|Magyar Leather Guild', '塞切尼国家图书馆|National Szechenyi Library', '匈牙利科学院|Hungarian Academy of Sciences', '潘侬豪尔毛修道院院会|Pannonhalma monastic chapter'],
    item: ['福科什手斧|fokos', '齐弗拉叙尔斗篷|cifraszűr', '布绍面具|busó mask', '彩绘珐琅杯|painted enamel cup', '匈牙利马刀|Hungarian sabre', '马扎尔刺绣|Magyar embroidery', '牧马鞭|csikós whip', '托卡伊酒壶|Tokaji wine flask', '匈牙利王冠复制件|Holy Crown replica', '匈牙利刺绣背心|Hungarian embroidered vest'],
  },
  romani: {
    location: ['舒托奥里扎里|Šuto Orizari', '索罗卡|Soroca', '安达卢西亚罗姆社区|Romani communities of Andalusia', '瓦拉几亚迁徙路线|Wallachian migration routes', '布达佩斯八区|Budapest District VIII', '贝尔格莱德泽蒙|Zemun', '布拉迪斯拉发罗姆聚居区|Bratislava Romani quarter', '特兰西瓦尼亚罗姆村|Transylvanian Romani village', '塞纳河旅行营地|Seine travelling camp', '巴尔干山路|Balkan mountain road'],
    organization: ['国际罗姆联盟|International Romani Union', '罗姆克里斯习惯法庭|Romani Kris', '罗姆教育基金|Roma Education Fund', '罗姆铜匠社群|Romani coppersmith community', '罗姆妇女网络|Roma Women Network', '欧洲罗姆艺术协会|European Roma Arts Association', '罗姆音乐家联盟|Romani Musicians Union', '旅团长老会|Kumpania elders council', '罗姆语言委员会|Romani Language Commission', '流动铁匠行会|Travelling Smiths Guild'],
    item: ['钦巴龙扬琴|cimbalom', '罗姆小提琴|Romani violin', '瓦尔多篷车|vardo', '铜制大锅|copper cauldron', '刺绣腰带|embroidered sash', '马具|horse harness', '黄铜咖啡壶|brass coffee pot', '罗姆帐篷|Romani tent', '银铃|silver bell', '彩布披肩|colourful shawl'],
  },
  finnish: {
    location: ['坦佩雷|Tampere', '波尔沃|Porvoo', '凯努|Kainuu', '群岛海|Archipelago Sea', '赫尔辛基|Helsinki', '图尔库|Turku', '奥卢|Oulu', '萨翁林纳|Savonlinna', '塞马湖|Lake Saimaa', '卡累利阿|Karelia'],
    organization: ['芬兰文学协会|Finnish Literature Society', '图尔库皇家学院|Royal Academy of Turku', '波尔沃议会|Diet of Porvoo', '芬兰森林合作社|Finnish forest cooperative', '芬兰科学院|Academy of Finland', '卡累利阿主义学社|Karelianist Society', '芬兰木舟匠会|Finnish Boatbuilders Guild', '千湖渔民合作社|Lake fisher cooperative', '芬兰国民歌剧院|Finnish National Opera', '芬兰桑拿协会|Finnish Sauna Society'],
    item: ['吕伊地毯|rya rug', '桦树皮背篓|birchbark backpack', '桦木根杯|kuksa', '传统纺车|rukki', '康特勒琴|kantele', '普科刀|puukko', '木制雪橇|wooden sled', '湖区渔网|lake fishing net', '桑拿木勺|sauna ladle', '驯鹿铃|reindeer bell'],
  },
  'albanian-romanian': {
    location: ['斯库台|Shkodër', '吉诺卡斯特|Gjirokastër', '布拉索夫|Brașov', '锡比乌|Sibiu', '地拉那|Tirana', '布加勒斯特|Bucharest', '科托尔|Kotor', '普里兹伦|Prizren', '多瑙河|Danube River', '特兰西瓦尼亚高原|Transylvanian Plateau'],
    organization: ['莱什联盟|League of Lezha', '罗马尼亚科学院|Romanian Academy', '特兰西瓦尼亚萨克森大学|Universitas Saxonum', '阿尔巴尼亚正教会|Orthodox Church of Albania', '沃伊沃德宫廷|Voivode court', '山地氏族议会|Mountain clan council', '巴尔干牧羊人行会|Balkan Shepherd Guild', '阿尔巴尼亚语言文学学院|Albanian Institute', '罗马尼亚东正教会|Romanian Orthodox Church', '斯库台银匠行会|Shkoder silversmiths guild'],
    item: ['奇夫特里双弦琴|çifteli', '奈伊排箫|nai', '凯莱谢白毡帽|qeleshe', '罗马尼亚传统绣衣|ie', '古斯莱琴|gusle', '羊毛织毯|woolen rug', '山地弯刀|mountain yataghan', '银扣腰带|silver buckle belt', '蜂蜡圣烛|beeswax candle', '木雕门牌|carved wooden door plaque'],
  },
  'modern-greek': {
    location: ['纳夫普利翁|Nafplio', '帕特雷|Patras', '罗得岛|Rhodes', '迈泰奥拉|Meteora', '雅典|Athens', '塞萨洛尼基|Thessaloniki', '克里特岛|Crete', '科孚岛|Corfu', '爱琴海|Aegean Sea', '德尔斐|Delphi'],
    organization: ['友谊社|Filiki Eteria', '希腊议会|Hellenic Parliament', '雅典考古学会|Archaeological Society at Athens', '希腊船东联盟|Union of Greek Shipowners', '希腊东正教会|Church of Greece', '希腊海运商会|Greek Shipping Guild', '岛屿村社议会|Island village council', '希腊国家歌剧院|Greek National Opera', '雅典大学|National and Kapodistrian University', '葡萄酒种植者协会|Greek vintners association'],
    item: ['解忧珠|komboloi', '布祖基琴|bouzouki', '福斯塔内拉裙装|fustanella', '蓝眼护符|mati', '橄榄枝冠|olive wreath', '希腊东正教圣像|Greek icon', '双耳瓶|amphora', '航海罗盘|Greek mariner compass', '渔网浮标|fishing net float', '陶制咖啡杯|Greek coffee cup'],
  },
  portuguese: {
    location: ['科英布拉|Coimbra', '埃武拉|Évora', '辛特拉|Sintra', '亚速尔群岛|Azores', '里斯本|Lisbon', '波尔图|Porto', '马德拉群岛|Madeira', '法鲁|Faro', '塔霍河|Tagus River', '贝伦塔|Belém Tower'],
    organization: ['基督骑士团|Order of Christ', '科英布拉大学|University of Coimbra', '葡萄牙等级议会|Portuguese Cortes', '里斯本仁慈堂|Santa Casa da Misericordia de Lisboa', '王室航海院|Casa da India', '葡萄牙海员行会|Portuguese Navigators Guild', '里斯本港务会|Lisbon Port Authority', '阿祖莱若斯瓷砖工坊|Azulejo Workshop', '葡萄牙航海家兄弟会|Portuguese Mariners Brotherhood', '葡萄牙科学院|Academy of Sciences of Lisbon'],
    item: ['浑天仪|armillary sphere', '葡萄牙吉他|guitarra portuguesa', '彩釉瓷砖壁板|azulejo panel', '黑陶罐|barro negro pot', '卡拉维尔海图|caravel chart', '船用沙漏|ship hourglass', '王室印章|royal seal', '法多吉他|fado guitar', '葡萄酒壶|wine flask', '航海罗盘|nautical compass'],
  },
}

const europeanFictionalCompletePools: Partial<Record<OfflineCulture, Partial<Record<OfflineNameKind, string[]>>>> = {
  english: { location: ['榛谷郡', '白鹿渡镇', '灰钟修院村', '鸦岬港', '橡桥集市镇', '银麦庄园镇', '冬溪教区村', '赤丘城堡镇', '北垣海滨镇', '雾港大学城'], organization: ['榛谷郡议会', '白鹿羊毛商会', '灰钟石匠行会', '鸦岬海峡船会', '橡桥庄园法庭', '银麦书商公会', '冬溪教区会', '赤丘城堡守备队', '北垣海岸救援站', '雾港大学学社'], item: ['榛木长弓', '白鹿郡徽印戒', '灰钟时祷书', '鸦岬船灯', '橡桥羊皮地契', '银麦计数木筹', '冬溪锡制酒杯', '赤丘武装剑', '北垣折叠伞', '雾港铁路票'] },
  french: { location: ['银泉堡', '百合渡', '葡萄丘镇', '蓝瓦修院村', '红塔教区城', '月桂河港', '晨钟大学城', '绿谷葡萄园镇', '白石桥镇', '蔚蓝海滨镇'], organization: ['银泉伯爵议会', '百合旗卫队', '葡萄丘酒商会', '蓝瓦织毯工坊', '红塔教区会', '月桂河港税务会', '晨钟学术院', '绿谷葡萄种植会', '白石市政议会', '蔚蓝铁路公司'], item: ['银泉细剑', '百合纹圣物匣', '葡萄丘酒壶', '蓝瓦珐琅胸针', '红塔羊皮敕令', '月桂品酒银碟', '晨钟印刷公报', '绿谷香水瓶', '白石钢笔', '蔚蓝交通卡'] },
  german: { location: ['黑林自由城', '鹰岩矿镇', '白橡河港', '松钟山村', '银湖修院镇', '铁门盐路城', '狼岭邦国首府', '红堡大学城', '金麦铁路镇', '北海工业城'], organization: ['黑林自由市议会', '鹰岩矿工行会', '白橡钟表匠会', '松钟酿造会', '银湖修院书院', '铁门邮政署', '狼岭邦国枢密院', '红堡大学学社', '金麦铁路公司', '北海工业设计院'], item: ['黑林木刻版', '鹰岩矿灯', '白橡行会账册', '松钟银表', '银湖炻器酒壶', '铁门行会印章', '狼岭测绘罗盘', '红堡瓷杯', '金麦高铁车票', '北海通勤背包'] },
  italian: { location: ['金藤城邦', '白塔泻湖城', '月湾山镇', '青石港', '赤狮公爵城', '橄榄葡萄园镇', '圣泉大学城', '大理石广场镇', '海风铁路镇', '日冠文化城'], organization: ['金藤银行家会', '白塔玻璃工坊', '月湾画师学院', '青石贡多拉船会', '赤狮公爵议会', '橄榄种植会', '圣泉大学学社', '大理石建筑师团', '海风铁路公司', '日冠设计学院'], item: ['金藤城邦金币', '白塔玻璃杯', '月湾假面', '青石港海图', '赤狮家族印章', '橄榄油壶', '圣泉手抄法典', '大理石纪念章', '海风摩卡壶', '日冠交通卡'] },
  iberian: { location: ['赤岩城堡镇', '银月朝圣驿', '白帆海港', '橄榄丘村', '金塔高原城', '红瓦大学镇', '圣路河港', '王冠山口堡', '蓝海铁路镇', '葡萄谷文化城'], organization: ['赤岩骑士团', '银月朝圣救济院', '白帆航海院', '橄榄丘种植会', '金塔王室议会', '红瓦大学学社', '圣路商人会', '王冠边境守备队', '蓝海铁路公司', '葡萄谷博物馆'], item: ['赤岩细剑', '银月朝圣徽章', '白帆星盘', '橄榄丘油壶', '金塔王室印章', '红瓦彩釉瓷砖', '圣路念珠', '王冠银币', '蓝海高速铁路票', '葡萄谷陶酒壶'] },
  norse: { location: ['霜鲸峡湾', '铁松农庄村', '北星船港', '狼岩山堡', '银桦河谷镇', '海鹰渔港', '松冠高原村', '白帆峡湾城', '石桥山麓镇', '晨湾铁路镇'], organization: ['霜鲸地方庭会', '铁松船匠坊', '北星海岸守望队', '狼岩城堡卫队', '银桦木工行会', '海鹰鳕鱼商会', '松冠徒步协会', '白帆港务会', '石桥民俗学社', '晨湾铁路公司'], item: ['霜鲸饮酒角', '铁松圆盾', '北星航海石', '狼岩战斧', '银桦木雕杯', '海鹰鳕鱼账簿', '松冠羊毛斗篷', '白帆皂石锅', '石桥银胸针', '晨湾铁路月票'] },
  icelandic: { location: ['黑沙湾', '熔岩农场', '白浪峡湾', '苔原温泉村', '霜瀑渔站', '火山口牧场', '海雾农庄', '冰河海岬村', '北星地热镇', '鲸湾港'], organization: ['黑沙地方廷会', '熔岩农场主会', '白浪鱼商会', '苔原冬季互助会', '霜瀑搜救队', '火山口地质站', '海雾萨迦学社', '冰河海岸守望队', '北星地热合作社', '鲸湾港务会'], item: ['黑沙法典', '熔岩石磨', '白浪鲸骨棋子', '苔原羊毛斗篷', '霜瀑冰爪', '火山口监测仪', '海雾鳕鱼干捆', '冰河救援定位器', '北星地热账单', '鲸湾鱼皮靴'] },
  'ancient-greek': { location: ['月桂城邦', '银橄榄港', '赤陶山城', '白帆岛镇', '青铜卫城', '紫葡萄丘城', '海豚湾城', '圣泉神庙镇', '金麦殖民城', '星岬港'], organization: ['月桂公民大会', '银橄榄哲学学园', '赤陶陶工行会', '白帆海商会', '青铜重装步兵团', '紫葡萄祭礼会', '海豚船主会', '圣泉神谕祭司团', '金麦城邦粮库', '星岬青年训练团'], item: ['月桂冠', '银橄榄油灯', '赤陶双耳瓶', '白帆城邦钱币', '青铜阿斯庇斯盾', '紫葡萄调酒器', '海豚纹酒杯', '圣泉祭盘', '金麦蜡板', '星岬基萨拉琴'] },
  'ancient-rome': { location: ['银鹰殖民城', '赤丘军镇', '月港商埠', '白石大道驿', '金麦论坛镇', '台伯河港', '月桂退伍军人城', '紫袍行省城', '北门军团堡', '橄榄神庙镇'], organization: ['银鹰军团', '赤丘道路工程署', '月港商人公会', '白石消防警备队', '金麦粮食供应署', '台伯船主公会', '月桂元老院', '紫袍行省总督府', '北门军团司令部', '橄榄祭司团'], item: ['银鹰军旗', '赤丘蜡板法典', '月港帝国金币', '白石里程碑', '金麦双耳陶罐', '台伯青铜书写笔', '月桂印章戒指', '紫袍托加', '北门军靴', '橄榄陶制油灯'] },
  celtic: { location: ['白鹿山丘堡', '橡林圣井村', '海雾修院岛', '乌鸦河谷镇', '塔拉王廷丘', '卡舍尔红岩城', '阿马榆林镇', '基尔代尔圣井村', '斯凯利格海崖岛', '内伊湖芦苇港'], organization: ['白鹿部族议会', '橡林布雷洪法庭', '海雾菲利诗人团', '乌鸦修院抄写会', '塔拉高王议会', '卡舍尔圣杯守护团', '阿马盖尔语学社', '基尔代尔修院院会', '斯凯利格朝圣者会', '内伊湖舟人行会'], item: ['白鹿银胸针', '橡林牧杖', '海雾爱尔兰竖琴', '乌鸦欧甘铭文石', '塔拉高王印戒', '卡舍尔石匠凿', '阿马修院墨水瓶', '基尔代尔圣井水壶', '斯凯利格朝圣十字', '内伊湖芦苇笛'] },
  'slavic-east': { location: ['白桦河城', '黑林寨', '晨星公国镇', '霜湖修院村', '第聂伯港城', '波尔塔瓦麦城', '文尼察葡萄园镇', '卡缅涅茨石堡', '乌日霍罗德山门城', '哈尔科夫书院城'], organization: ['白桦村社大会', '黑林猎户会', '晨星亲兵团', '霜湖修院抄写院', '第聂伯商船会', '波尔塔瓦哥萨克议会', '文尼察工匠会', '卡缅涅茨城防团', '乌日霍罗德鲁塞尼亚学社', '哈尔科夫大学学团'], item: ['白桦文书', '黑林皮毛斗篷', '晨星圣像', '霜湖银酒杯', '第聂伯河船桨', '波尔塔瓦麦穗徽章', '文尼察陶釉壶', '卡缅涅茨石堡钥匙', '乌日霍罗德刺绣腰带', '哈尔科夫铜印'] },
  'dutch-lowlands': { location: ['银堤运河城', '风车圩田村', '郁金香商埠', '白帆船坞镇', '乌得勒支钟楼城', '哈勒姆花市镇', '格罗宁根泥炭港', '马斯特里赫特石桥城', '阿纳姆林地城', '小孩堤防风车村'], organization: ['银堤水务会', '风车主协会', '郁金香商社', '白帆造船行会', '乌得勒支钟楼议会', '哈勒姆花商会', '格罗宁根泥炭行会', '马斯特里赫特石桥会', '阿纳姆林地守护队', '小孩堤防风车管理会'], item: ['银堤通行牌', '风车齿轮', '郁金香账册', '白帆地图铜版', '乌得勒支钟楼铜铃', '哈勒姆花市木箱', '格罗宁根泥炭铲', '马斯特里赫特石桥测绘册', '阿纳姆林地猎号', '小孩堤防风车帆布'] },
  baltic: { location: ['铁狼大公城', '琥珀河港', '橡树丘堡', '涅曼湖镇', '内里斯渡口镇', '青湖庄园镇', '白塔教区村', '金冠大学城', '松林边境堡', '太阳文化城'], organization: ['铁狼大公宫廷', '琥珀商人会', '橡树贵族会议', '涅曼船主会', '内里斯文书局', '青湖农场主会', '白塔主教座堂会', '金冠大学学社', '松林边境守备队', '太阳民俗协会'], item: ['铁狼大公印玺', '琥珀银胸针', '橡树木杯', '涅曼船桨', '内里斯羊皮文书', '青湖织纹腰带', '白塔蜡封契约', '金冠坎克莱斯琴', '松林皮革箭囊', '太阳草编吊饰'] },
  balkan: { location: ['白鹰王城', '莫拉瓦河港镇', '橡树修院村', '德里纳山堡', '红瓦集市镇', '山隼矿镇', '银桥渡口镇', '金麦河谷城', '黑松教区村', '圣泉大学城'], organization: ['白鹰王室议事会', '莫拉瓦船主会', '橡树修道院抄写院', '德里纳边境守备队', '红瓦手工业行会', '山隼矿工团体', '银桥市议会', '金麦村社议会', '黑松古斯莱歌者团', '圣泉大学学社'], item: ['白鹰王室印章', '莫拉瓦船桨', '橡树木制圣像', '德里纳骑兵军刀', '红瓦奥帕纳克皮鞋', '山隼银锭', '银桥沙伊卡查帽', '金麦刺绣巾', '黑松古斯莱琴', '圣泉皮罗特织毯'] },
  caucasus: { location: ['纳尔特山谷城', '阿兰石塔村', '捷列克河源镇', '卡兹别克山口镇', '银泉牧民村', '黑塔峡谷堡', '金角教区镇', '白毡文化城', '青谷大学城', '赤岩矿镇'], organization: ['纳尔特史诗研究会', '阿兰山谷氏族议会', '捷列克河谷水利会', '卡兹别克山地救援队', '银泉牧民互助会', '黑塔石匠工坊', '金角民歌团', '白毡毛毡工坊', '青谷语言学社', '赤岩矿工会'], item: ['纳尔特史诗手抄本', '阿兰纹样银胸针', '捷列克木制酒杯', '卡兹别克登山地图', '银泉三足祭礼桌', '黑塔山地短剑', '金角达拉凡德尔竖琴', '白毡奥塞梯毡帽', '青谷奥塞梯语读本', '赤岩基辛凡德尔提琴'] },
  polish: { location: ['白鹰王城', '琥珀盐路镇', '红砖河港', '冬堡森林村'], organization: ['白鹰贵族小议会', '琥珀商会', '红砖大学学社', '冬堡城防队'], item: ['白鹰马刀', '琥珀十字架', '红砖王室敕令', '冬堡羽饰'] },
  hungarian: { location: ['金原骑兵镇', '王冠河城', '黑马草原驿', '葡萄丘堡'], organization: ['金原牧马会', '王冠议会', '黑马骠骑兵团', '葡萄丘酒商会'], item: ['金原马刀', '王冠印章', '黑马银马镫', '葡萄丘酒壶'] },
  romani: { location: ['星车冬营', '银铃河畔营', '彩布马市', '月火旅路集市'], organization: ['星车长老议事圈', '银铃乐师行会', '彩布篷车互助会', '月火流动铁匠会'], item: ['星车篷车灯', '银铃小提琴', '彩布披肩', '月火黄铜壶'] },
  finnish: { location: ['千湖木材镇', '白桦冬港', '极光林村', '蓝湖岛镇'], organization: ['千湖船会', '白桦森林合作社', '极光史诗歌者学社', '蓝湖冬季渔民会'], item: ['千湖木舟桨', '白桦皮杯', '极光康特勒琴', '蓝湖普科刀'] },
  'albanian-romanian': { location: ['山鹰塔楼村', '白石林堡镇', '葡萄丘隘口驿', '蓝湖牧羊山寨'], organization: ['山鹰氏族会', '白石堡守备队', '葡萄丘酒商会', '蓝湖牧羊人行会'], item: ['山鹰白毡帽', '白石双弦琴', '葡萄丘绣衣', '蓝湖弧管排箫'] },
  'modern-greek': { location: ['白岛港城', '蓝海橄榄镇', '紫藤海岬村', '金湾山城'], organization: ['白岛议会', '蓝海航运商会', '紫藤剧院协会', '金湾渔民合作社'], item: ['白岛布祖基琴', '蓝海船灯', '紫藤双耳瓶', '金湾解忧珠'] },
  portuguese: { location: ['航星海岬港', '蓝瓷河口城', '白帆葡萄镇', '银潮岛村'], organization: ['航星海图师院', '蓝瓷工坊', '白帆造船行会', '银潮港务议会'], item: ['航星浑天仪', '蓝瓷壁板', '白帆船用沙漏', '银潮葡萄牙吉他'] },
}

const uniqueExpansionEntries = (entries: string[]) => [...new Set(entries.filter(Boolean))]

// Every pack exposes ten explicitly reviewable expansion slots per catalog
// kind.  Older packs already contain culture-specific source pools, but only
// four to eight entries were registered in the expansion table.  Promote
// those existing local entries into the expansion view before adding any
// generated material; this keeps the fallback culture-local and preserves the
// original native spelling when one is available after `|`.
function getReferenceExpansion(culture: OfflineCulture) {
  const explicit = europeanReferenceExpansion[culture] ?? nonEuropeanCatalogExpansions[culture]?.reference ?? {}
  const periodLocations = Object.values(periodLocationNames[culture] ?? {}).flat()
  const strictPeriodEntries = ['japanese', 'korean', 'mongolian', 'tibetan', 'manchu'].includes(culture)
    ? culture === 'japanese'
      ? Object.values(japanesePeriodReferenceCatalogs).flatMap((period) => period.location ?? [])
      : culture === 'korean'
        ? Object.values(koreanPeriodReferenceCatalogs).flatMap((period) => period.location ?? [])
        : culture === 'mongolian'
          ? Object.values(mongolianPeriodReferenceCatalogs).flatMap((period) => period.location ?? [])
          : culture === 'tibetan'
            ? Object.values(tibetanPeriodReferenceCatalogs).flatMap((period) => period.location ?? [])
            : Object.values(manchuPeriodReferenceCatalogs).flatMap((period) => period.location ?? [])
    : []
  const strictPeriodOrganizations = ['japanese', 'korean', 'mongolian', 'tibetan', 'manchu'].includes(culture)
    ? culture === 'japanese'
      ? Object.values(japanesePeriodReferenceCatalogs).flatMap((period) => period.organization ?? [])
      : culture === 'korean'
        ? Object.values(koreanPeriodReferenceCatalogs).flatMap((period) => period.organization ?? [])
        : culture === 'mongolian'
          ? Object.values(mongolianPeriodReferenceCatalogs).flatMap((period) => period.organization ?? [])
          : culture === 'tibetan'
            ? Object.values(tibetanPeriodReferenceCatalogs).flatMap((period) => period.organization ?? [])
            : Object.values(manchuPeriodReferenceCatalogs).flatMap((period) => period.organization ?? [])
    : []
  const strictPeriodItems = ['japanese', 'korean', 'mongolian', 'tibetan', 'manchu'].includes(culture)
    ? culture === 'japanese'
      ? Object.values(japanesePeriodReferenceCatalogs).flatMap((period) => period.item ?? [])
      : culture === 'korean'
        ? Object.values(koreanPeriodReferenceCatalogs).flatMap((period) => period.item ?? [])
        : culture === 'mongolian'
          ? Object.values(mongolianPeriodReferenceCatalogs).flatMap((period) => period.item ?? [])
          : culture === 'tibetan'
            ? Object.values(tibetanPeriodReferenceCatalogs).flatMap((period) => period.item ?? [])
            : Object.values(manchuPeriodReferenceCatalogs).flatMap((period) => period.item ?? [])
    : []
  const candidates: Partial<Record<OfflineNameKind, string[]>> = {
    location: [
      ...(explicit.location ?? []),
      ...periodLocations,
      ...strictPeriodEntries,
      ...(expandedNonPersonPools[culture]?.location ?? []),
      ...(additionalReferencePools[culture]?.location ?? []),
      ...(locationPools[culture]?.location ?? []),
    ],
    organization: [
      ...(explicit.organization ?? []),
      ...strictPeriodOrganizations,
      ...(expandedNonPersonPools[culture]?.organization ?? []),
      ...(additionalReferencePools[culture]?.organization ?? []),
      ...(locationPools[culture]?.organization ?? []),
    ],
    item: [
      ...(explicit.item ?? []),
      ...strictPeriodItems,
      ...(expandedNonPersonPools[culture]?.item ?? []),
      ...(additionalReferencePools[culture]?.item ?? []),
      ...(locationPools[culture]?.item ?? []),
    ],
  }
  return Object.fromEntries((['location', 'organization', 'item'] as const).map((kind) => [kind, uniqueExpansionEntries(candidates[kind] ?? []).slice(0, 10)])) as Partial<Record<OfflineNameKind, string[]>>
}

function getFictionalCompleteExpansion(culture: OfflineCulture) {
  const explicit = europeanFictionalCompletePools[culture] ?? nonEuropeanCatalogExpansions[culture]?.fictionalComplete ?? {}
  const locationEntries = Object.values(fictionalLocationNames[culture] ?? {}).flat()
  const candidates: Partial<Record<OfflineNameKind, string[]>> = {
    location: [...(explicit.location ?? []), ...locationEntries, ...(fictionalStylePools[culture]?.location ?? [])],
    organization: [...(explicit.organization ?? []), ...(fictionalStylePools[culture]?.organization ?? [])],
    item: [...(explicit.item ?? []), ...(fictionalStylePools[culture]?.item ?? [])],
  }
  // Most older style pools contain six complete names.  The culture-specific
  // combiner supplies the remaining controlled names without using regional
  // or phonetic fragments from another pack.
  for (const kind of ['location', 'organization', 'item'] as const) {
    if (['japanese', 'korean', 'mongolian', 'tibetan', 'manchu'].includes(culture) && (candidates[kind]?.length ?? 0) < 10) {
      candidates[kind] = [...(candidates[kind] ?? []), ...getCompleteFictionalCatalogBase(culture, kind)]
    }
    if ((candidates[kind]?.length ?? 0) < 10) {
      const composed = buildCultureSpecificCombinations(culture, kind)
      candidates[kind] = [...(candidates[kind] ?? []), ...composed]
    }
    if ((candidates[kind]?.length ?? 0) < 10) {
      const semanticComposed = buildCatalogCombinations(culture, kind)
      candidates[kind] = [...(candidates[kind] ?? []), ...semanticComposed]
    }
  }
  return Object.fromEntries((['location', 'organization', 'item'] as const).map((kind) => [kind, uniqueExpansionEntries(candidates[kind] ?? []).slice(0, 10)])) as Partial<Record<OfflineNameKind, string[]>>
}

type CatalogPair = readonly [display: string, native: string]
type CatalogCombination = Partial<Record<OfflineNameKind, { heads: CatalogPair[]; tails: CatalogPair[] }>>

// These templates deliberately join only culture-approved semantic units. The
// result expands the catalog without falling back to arbitrary phonetic noise.
const catalogCombinationGroups: Record<string, CatalogCombination> = {
  sinitic: { location: { heads: [['云', '云'], ['青', '青'], ['北', '北']], tails: [['川', '川'], ['陵', '陵'], ['关', '关'], ['港', '港']] }, organization: { heads: [['玄', '玄'], ['长', '长'], ['白', '白']], tails: [['衡司', '衡司'], ['河营', '河营'], ['鹿院', '鹿院']] }, item: { heads: [['青', '青'], ['玄', '玄'], ['山河', '山河']], tails: [['玉符', '玉符'], ['铁剑', '铁剑'], ['图卷', '图卷']] } },
  western: { location: { heads: [['灰', 'Grey'], ['河', 'River'], ['白', 'White']], tails: [['守望', 'watch'], ['门', 'gate'], ['谷', 'vale'], ['堡', 'keep']] }, organization: { heads: [['灰', 'Grey'], ['北', 'North'], ['白', 'White']], tails: [['守望团', 'watch Company'], ['门议会', 'gate Council'], ['鹿修会', 'hart Order']] }, item: { heads: [['灰钢', 'greysteel'], ['河门', 'Rivergate'], ['白鹿', 'white hart']], tails: [['长剑', ' sword'], ['印戒', ' signet'], ['提灯', ' lantern']] } },
  nordic: { location: { heads: [['霜', 'Frost'], ['乌鸦', 'Hrafn'], ['北', 'Nord']], tails: [['湾', 'vik'], ['岭', 'fell'], ['谷', 'dal'], ['港', 'havn']] }, organization: { heads: [['霜', 'Frost'], ['铁', 'Jarn'], ['狼', 'Ulf']], tails: [['湾廷会', 'vik Thing'], ['松兄弟会', 'fura Brotherhood'], ['牙战团', 'fang Warband']] }, item: { heads: [['霜', 'frost'], ['乌鸦', 'raven'], ['狼牙', 'wolf-tooth']], tails: [['铁斧', 'iron axe'], ['臂环', ' arm ring'], ['短剑', ' seax']] } },
  classical: { location: { heads: [['银', 'Argyra'], ['赤', 'Ruber'], ['月', 'Luna']], tails: [['丘', 'polis'], ['港', 'portus'], ['台地', 'collis'], ['门', 'porta']] }, organization: { heads: [['银鹰', 'Aquila Argentea'], ['赤丘', 'Collis Ruber'], ['月港', 'Portus Lunae']], tails: [['同盟', ' League'], ['元老院', ' Senate'], ['商团', ' Collegium']] }, item: { heads: [['银鹰', 'aquila argentea'], ['赤丘', 'collis ruber'], ['月港', 'portus lunae']], tails: [['军旗', ' standard'], ['蜡板', ' tablet'], ['金币', ' aureus']] } },
  nile: { location: { heads: [['蓝莲', 'Blue Lotus'], ['金隼', 'Golden Falcon'], ['月河', 'Moonriver']], tails: [['城', ' City'], ['渡口', ' Crossing'], ['绿洲', ' Oasis'], ['神庙', ' Temple']] }, organization: { heads: [['蓝莲', 'Blue Lotus'], ['金隼', 'Golden Falcon'], ['赤沙', 'Red Sand']], tails: [['祭司团', ' Priesthood'], ['宫廷', ' Court'], ['边军', ' Guard']] }, item: { heads: [['蓝莲', 'blue lotus'], ['金隼', 'golden falcon'], ['赤沙', 'red sand']], tails: [['护符', ' amulet'], ['权杖', ' sceptre'], ['匕首', ' dagger']] } },
  southasia: { location: { heads: [['月', 'Chandra'], ['金', 'Swarna'], ['青河', 'Neela Nadi']], tails: [['城', 'nagar'], ['堡', 'garh'], ['湖', 'tal'], ['港', 'pattana']] }, organization: { heads: [['月河', 'Chandra'], ['金莲', 'Swarna Kamal'], ['风堡', 'Vayu Garh']], tails: [['王庭', ' Court'], ['学舍', ' Gurukula'], ['守军', ' Guard']] }, item: { heads: [['月河', 'Chandra'], ['金莲', 'Swarna Kamal'], ['风堡', 'Vayu Garh']], tails: [['弯刀', ' talwar'], ['铜灯', ' lamp'], ['印章', ' seal']] } },
  seasia: { location: { heads: [['月', 'Bulan'], ['白帆', 'Layar Putih'], ['青', 'Khiao']], tails: [['湾', ' Teluk'], ['港', ' Pelabuhan'], ['河', ' Mae Nam'], ['岛', ' Pulau']] }, organization: { heads: [['月湾', 'Teluk Bulan'], ['白帆', 'Layar Putih'], ['青河', 'Mae Nam Khiao']], tails: [['商会', ' Guild'], ['船团', ' Fleet'], ['寺院', ' Temple']] }, item: { heads: [['月湾', 'Teluk Bulan'], ['白帆', 'Layar Putih'], ['青河', 'Mae Nam Khiao']], tails: [['短剑', ' kris'], ['织锦', ' songket'], ['罗盘', ' compass']] } },
  africa: { location: { heads: [['金', 'Golden'], ['白河', 'White River'], ['红土', 'Red Earth']], tails: [['鼓城', ' Drum Town'], ['谷', ' Valley'], ['草原', ' Plain'], ['港', ' Port']] }, organization: { heads: [['金鼓', 'Golden Drum'], ['白贝', 'White Shell'], ['红土', 'Red Earth']], tails: [['宫廷', ' Court'], ['神谕会', ' Oracle'], ['商团', ' Guild']] }, item: { heads: [['金鼓', 'golden drum'], ['白贝', 'white shell'], ['红土', 'red earth']], tails: [['杖', ' staff'], ['面具', ' mask'], ['护符', ' amulet']] } },
  americas: { location: { heads: [['雾松', 'Mistpine'], ['白河', 'White River'], ['红谷', 'Red Valley']], tails: [['镇', ' Town'], ['堡', ' Fort'], ['岭', ' Ridge'], ['湾', ' Bay']] }, organization: { heads: [['雾松', 'Mistpine'], ['白河', 'White River'], ['红谷', 'Red Valley']], tails: [['边境会', ' Frontier Company'], ['铁路社', ' Railway'], ['矿业会', ' Mining Guild']] }, item: { heads: [['雾松', 'Mistpine'], ['白河', 'White River'], ['红谷', 'Red Valley']], tails: [['燧发枪', ' flintlock'], ['怀表', ' watch'], ['矿灯', ' lamp']] } },
  siberian: { location: { heads: [['白桦', 'Berezo'], ['霜河', 'Morozorech'], ['雪松', 'Kedro']], tails: [['堡', 'grad'], ['镇', 'sk'], ['关', 'ostrog'], ['湖', 'ozero']] }, organization: { heads: [['白熊', 'Bely Medved'], ['北风', 'Severnyi Veter'], ['雪松', 'Kedrovy']], tails: [['哥萨克团', ' Cossacks'], ['商会', ' Guild'], ['修院', ' Monastery']] }, item: { heads: [['白熊', 'Bely Medved'], ['北风', 'Severnyi Veter'], ['雪松', 'Kedrovy']], tails: [['战斧', ' axe'], ['短剑', ' knife'], ['圣像', ' icon']] } },
  steppe: { location: { heads: [['苍狼', 'Khukh Chono'], ['金帐', 'Altan Orgoo'], ['风马', 'Khiimori']], tails: [['河谷', ' Gol'], ['鄂博', ' Ovoo'], ['营地', ' Khoton'], ['草原', ' Tal'] ] }, organization: { heads: [['苍狼', 'Khukh Chono'], ['金帐', 'Altan Orgoo'], ['风马', 'Khiimori']], tails: [['千户', ' Mingghan'], ['汗庭', ' Ordoo'], ['部族会', ' Khoshuu'], ['驿传司', ' Urtuu Office']] }, item: { heads: [['苍狼', 'Khukh Chono'], ['金帐', 'Altan Orgoo'], ['风马', 'Khiimori']], tails: [['弓', ' num'], ['银牌', ' gerege'], ['马鞍', ' emeel'], ['马奶酒囊', ' airag flask']] } },
  himalayan: { location: { heads: [['雪', 'Gang'], ['经幡', 'Lungta'], ['金刚', 'Dorje']], tails: [['岭', ' Ri'], ['寺', ' Gompa'], ['谷', ' Rong']] }, organization: { heads: [['雪岭', 'Gang Ri'], ['经幡', 'Lungta'], ['金刚', 'Dorje']], tails: [['寺院', ' Gompa'], ['商队', ' Caravan'], ['医馆', ' Menpa House']] }, item: { heads: [['雪岭', 'Gang Ri'], ['经幡', 'Lungta'], ['金刚', 'Dorje']], tails: [['唐卡', ' thangka'], ['转经筒', ' prayer wheel'], ['护符', ' amulet']] } },
  arabicPersian: { location: { heads: [['月', 'Qamar'], ['金', 'Zarrin'], ['蔷薇', 'Gol']], tails: [['城', 'abad'], ['绿洲', ' oasis'], ['门', ' darwaza']] }, organization: { heads: [['月', 'Qamar'], ['金', 'Zarrin'], ['蔷薇', 'Gol']], tails: [['学舍', ' madrasa'], ['商会', ' caravanserai'], ['宫廷', ' divan']] }, item: { heads: [['月', 'Qamar'], ['金', 'Zarrin'], ['蔷薇', 'Gol']], tails: [['弯刀', ' shamshir'], ['灯盏', ' chiragh'], ['印玺', ' mohr']] } },
  turkic: { location: { heads: [['天', 'Kok'], ['阿勒坦', 'Altan'], ['风', 'Yel']], tails: [['城', 'kent'], ['河谷', 'su'], ['关', 'kapi']] }, organization: { heads: [['天', 'Kok'], ['阿勒坦', 'Altan'], ['风', 'Yel']], tails: [['汗庭', ' ordu'], ['商队', ' kervan'], ['部族会', ' oba']] }, item: { heads: [['天', 'Kok'], ['阿勒坦', 'Altan'], ['风', 'Yel']], tails: [['弓', ' yay'], ['短剑', ' bicak'], ['马鞍', ' eyer']] } },
  celtic: { location: { heads: [['白鹿', 'Fia Ban'], ['橡林', 'Doire'], ['海雾', 'Muircheo']], tails: [['山丘堡', ' dun'], ['河谷', ' gleann'], ['岛', ' inis']] }, organization: { heads: [['白鹿', 'Fia Ban'], ['橡林', 'Doire'], ['海雾', 'Muircheo']], tails: [['部族议会', ' tuath council'], ['修院', ' mainistir'], ['诗人团', ' fili circle']] }, item: { heads: [['白鹿', 'Fia Ban'], ['橡林', 'Doire'], ['海雾', 'Muircheo']], tails: [['长剑', ' claideb'], ['竖琴', ' clairseach'], ['胸针', ' dealg']] } },
  slavic: { location: { heads: [['白', 'Belo'], ['晨', 'Zorya'], ['黑', 'Chern']], tails: [['堡', 'grad'], ['河', 'reka'], ['林', 'bor']] }, organization: { heads: [['白', 'Belo'], ['晨星', 'Zorya'], ['黑', 'Chern']], tails: [['亲兵团', ' druzhina'], ['商会', ' artel'], ['修院', ' monastyr']] }, item: { heads: [['白', 'Belo'], ['晨星', 'Zorya'], ['黑', 'Chern']], tails: [['长剑', ' saber'], ['圣像', ' icon'], ['印章', ' pechat']] } },
  lithuanian: { location: { heads: [['琥珀', 'Gintaro'], ['橡树', 'Azuolo'], ['涅曼', 'Nemuno']], tails: [['城', 'pilis'], ['河', 'upe'], ['林', 'giria']] }, organization: { heads: [['琥珀', 'Gintaro'], ['橡树', 'Azuolo'], ['涅曼', 'Nemuno']], tails: [['贵族会', ' bajoru taryba'], ['商会', ' pirkliu gildija'], ['学社', ' draugija']] }, item: { heads: [['琥珀', 'gintaro'], ['橡树', 'azuolo'], ['涅曼', 'Nemuno']], tails: [['胸针', ' sage'], ['木杯', ' kaušas'], ['腰带', ' juosta']] } },
  sahel: { location: { heads: [['金', 'Zinariya'], ['红土', 'Kasa'], ['风', 'Iska']], tails: [['城', ' gari'], ['井', ' rijiya'], ['草原', ' fili']] }, organization: { heads: [['金', 'Zinariya'], ['红土', 'Kasa'], ['风', 'Iska']], tails: [['埃米尔庭', ' emirate'], ['商队', ' caravan'], ['学舍', ' madrasa']] }, item: { heads: [['金', 'Zinariya'], ['红土', 'Kasa'], ['风', 'Iska']], tails: [['鼓', ' kalangu'], ['皮囊', ' ruwa'], ['护符', ' laya']] } },
  indigenous: { location: { heads: [['白云', 'Whitecloud'], ['奔鹿', 'Running Deer'], ['晨星', 'Morning Star']], tails: [['河谷', ' Valley'], ['营地', ' Camp'], ['高地', ' Highlands']] }, organization: { heads: [['白云', 'Whitecloud'], ['奔鹿', 'Running Deer'], ['晨星', 'Morning Star']], tails: [['议会', ' Council'], ['氏族', ' Clan'], ['守望团', ' Watch']] }, item: { heads: [['白云', 'Whitecloud'], ['奔鹿', 'Running Deer'], ['晨星', 'Morning Star']], tails: [['鼓', ' drum'], ['项链', ' necklace'], ['药袋', ' medicine pouch']] } },
  polynesian: { location: { heads: [['海', 'Moana'], ['星', 'Fetu'], ['风', 'Matagi']], tails: [['岛', ' motu'], ['礁', ' ava'], ['湾', ' faga']] }, organization: { heads: [['海', 'Moana'], ['星', 'Fetu'], ['风', 'Matagi']], tails: [['航海会', ' voyaging house'], ['酋长庭', ' matai council'], ['舞团', ' dance guild']] }, item: { heads: [['海', 'Moana'], ['星', 'Fetu'], ['风', 'Matagi']], tails: [['独木舟', ' canoe'], ['贝壳项链', ' shell lei'], ['木鼓', ' drum']] } },
}

const cultureCombinationGroups: Partial<Record<OfflineCulture, keyof typeof catalogCombinationGroups>> = {
  chinese: 'sinitic', japanese: 'sinitic', korean: 'sinitic', english: 'western', french: 'western', german: 'western', italian: 'western', iberian: 'western',
  norse: 'nordic', icelandic: 'nordic', 'ancient-greek': 'classical', 'ancient-rome': 'classical', egyptian: 'nile',
  'india-north': 'southasia', 'india-south': 'southasia', vietnamese: 'seasia', thai: 'seasia', malay: 'seasia', filipino: 'seasia',
  yoruba: 'africa', amharic: 'africa', swahili: 'africa', 'zulu-xhosa': 'africa', 'north-american': 'americas', mesoamerican: 'americas', andean: 'americas',
  'russian-siberian': 'siberian', mongolian: 'steppe',
  tibetan: 'himalayan', arabic: 'arabicPersian', persian: 'arabicPersian', 'turkic-central-asian': 'turkic', celtic: 'celtic', 'slavic-east': 'slavic', 'hausa-fulani': 'sahel', 'indigenous-north-american': 'indigenous', polynesian: 'polynesian',
  manchu: 'sinitic', burmese: 'seasia', 'khmer-lao': 'seasia', bengali: 'southasia', 'punjabi-urdu': 'southasia', 'ottoman-turkish': 'arabicPersian', somali: 'africa', 'igbo-akan': 'africa', 'brazilian-tupi': 'americas', caribbean: 'americas', maori: 'polynesian',
  'dutch-lowlands': 'western', baltic: 'lithuanian', balkan: 'slavic', caucasus: 'himalayan', kurdish: 'arabicPersian', 'tamil-telugu': 'southasia', 'javanese-sundanese': 'seasia', 'oromo-shona': 'africa', amazonian: 'americas',
  polish: 'slavic', hungarian: 'slavic', armenian: 'arabicPersian', georgian: 'arabicPersian', 'marathi-gujarati': 'southasia', 'kannada-malayalam': 'southasia', malagasy: 'africa', 'melanesian-australian': 'polynesian',
  'hebrew-jewish': 'arabicPersian', assyrian: 'arabicPersian', romani: 'slavic', sami: 'nordic', 'canadian-french': 'western', 'australian-aboriginal': 'indigenous',
  finnish: 'nordic', 'albanian-romanian': 'slavic', 'amazigh-tuareg': 'sahel', 'pashtun-tajik': 'arabicPersian', 'nepali-sinhala': 'southasia', inuit: 'indigenous', mapuche: 'americas', 'micronesian-fijian': 'polynesian',
  uyghur: 'turkic', kazakh: 'steppe', kyrgyz: 'steppe', uzbek: 'turkic', turkmen: 'turkic', tajik: 'arabicPersian', 'navajo-apache': 'indigenous', haudenosaunee: 'indigenous', pueblo: 'indigenous', 'northwest-coast': 'indigenous', maya: 'americas', nahuatl: 'americas', quechua: 'americas', aymara: 'americas',
  'modern-greek': 'classical', portuguese: 'western', balinese: 'seasia', minangkabau: 'seasia', akan: 'africa', igbo: 'africa', hausa: 'sahel', fulani: 'sahel', wolof: 'sahel', kongo: 'africa', azerbaijani: 'turkic', 'chechen-dagestan': 'arabicPersian', hawaiian: 'polynesian', 'samoan-tongan': 'polynesian',
  'dong-son-au-lac': 'seasia', 'sa-huynh-champa': 'seasia', 'funan-chenla': 'seasia', 'pyu-city-states': 'seasia',
  'dvaravati-mon': 'seasia', 'old-malay-srivijaya': 'seasia', 'old-javanese-medang': 'seasia', 'old-bali': 'seasia',
  mesopotamia: 'arabicPersian', 'bronze-iron-anatolia': 'arabicPersian', 'ancient-levant': 'arabicPersian', 'iranian-central-asia': 'arabicPersian',
  'nubia-kush': 'nile', 'aksum-horn': 'africa', 'early-britain': 'western', 'gaul-franks': 'western', 'ancient-germanic': 'western', 'etruscan-italic': 'classical',
  'prehistoric-japan': 'sinitic', 'early-korea': 'sinitic', 'indus-valley': 'southasia', 'gandhara-kushan': 'southasia',
  'mesoamerican-formative': 'americas', 'preinca-andes': 'americas', 'lapita-pacific': 'polynesian',
}

type SemanticCatalogProfile = Record<'location' | 'organization' | 'item', string[]>

// These vocabularies expand semantic variety, not just permutation depth.
// Entries are Chinese creative labels, so they do not pretend to be native
// historical spellings. The selected cultural group controls which modifier
// and semantic profile may be combined.
const semanticCatalogModifiers: Record<string, string[]> = {
  sinitic: ['云岭', '松江', '白鹭', '青竹', '丹枫', '玄鹤', '玉泉', '东海', '长风', '明月', '寒梅', '石桥'],
  western: ['灰堡', '白鹿', '黑松', '银河', '金穗', '红崖', '橡木', '冬港', '晨星', '石桥', '鹰巢', '蔷薇'],
  nordic: ['霜湾', '乌鸦', '铁松', '鲸骨', '极光', '冰河', '雷岩', '狼原', '白桦', '北星', '海雾', '长夜'],
  classical: ['银橄榄', '赤陶', '月桂', '青铜', '白帆', '紫葡萄', '金麦穗', '海豚', '日轮', '柱廊', '雄鹰', '清泉'],
  nile: ['蓝莲', '金隼', '赤沙', '绿洲', '黑土', '纸莎草', '日轮', '河湾', '圣甲虫', '棕榈', '芦苇', '星穹'],
  southasia: ['月河', '金莲', '孔雀', '榕树', '香檀', '雨季', '红砂', '白象', '青芒', '恒河', '椰林', '山风'],
  seasia: ['月湾', '白帆', '青河', '红莲', '金稻', '香木', '雨林', '火山', '珊瑚', '象群', '棕榈', '季风'],
  africa: ['金鼓', '白贝', '红土', '靛蓝', '象牙', '猴面包', '河神', '日影', '铜铃', '棕榈', '狮鬃', '雨云'],
  americas: ['雾松', '白河', '红谷', '蓝岭', '金麦', '黑橡', '北星', '海风', '峡湾', '晨钟', '银湖', '鹰崖'],
  siberian: ['白桦', '霜河', '雪松', '极光', '冻原', '灰狼', '驯鹿', '冰湖', '北风', '针叶', '长冬', '河雾'],
  steppe: ['苍狼', '金帐', '风马', '青鹰', '白鹿', '红山', '长河', '银鞍', '天幕', '草海', '月原', '黑石'],
  himalayan: ['雪狮', '风马', '白螺', '红岩', '青稞', '牦牛', '玛尼', '日轮', '月轮', '苍鹰', '莲华', '泉音', '桑烟', '松石', '金顶', '羌塘'],
  arabicPersian: ['月庭', '金蔷薇', '蓝釉', '绿洲', '赤沙', '香柏', '星塔', '石榴', '孔雀', '银泉', '葡萄园', '晨祷'],
  turkic: ['天青', '金原', '风河', '白毡', '黑鹰', '红山', '银泉', '长路', '蓝湖', '草海', '月城', '驼铃'],
  celtic: ['白鹿', '橡林', '海雾', '圣井', '红鹿', '银泉', '乌鸦', '冬青', '月丘', '金琴', '青苔', '黑莓'],
  slavic: ['白城', '晨星', '黑林', '赤河', '银桦', '金麦', '霜湖', '狼谷', '松烟', '冬月', '蓝顶', '鹰门'],
  sahel: ['金砂', '红土', '风井', '盐路', '蓝袍', '黑石', '河湾', '椰枣', '驼铃', '日影', '月井', '铜鼓'],
  indigenous: ['白云', '奔鹿', '晨星', '红杉', '鹰羽', '河石', '月湖', '松烟', '雷鸟', '长草', '雪水', '熊岭'],
  polynesian: ['海星', '风帆', '月礁', '鲸歌', '珊瑚', '火山', '椰林', '雨湾', '海鸟', '泻湖', '潮汐', '南风'],
}

const semanticCatalogProfiles: Record<string, SemanticCatalogProfile> = {
  settled: {
    location: ['城', '镇', '村', '港', '渡口', '关隘', '堡寨', '庄园', '集市', '河曲', '湖畔', '山口', '台地', '林场', '驿站', '工坊区'],
    organization: ['议事会', '商会', '守备队', '工匠会', '医馆', '学社', '档案馆', '航运会', '巡护队', '粮仓会', '译馆', '乐师团', '驿站司', '测绘队', '药师会', '铸币局'],
    item: ['长剑', '短刀', '印戒', '提灯', '账册', '地图卷', '纹章旗', '药材匣', '铜钥匙', '旅行箱', '祭礼杯', '工匠锤', '钱币袋', '望远镜', '马鞍袋', '信使筒'],
  },
  maritime: {
    location: ['港湾', '峡湾', '海岬', '河口', '岛镇', '礁湾', '船坞', '渔场', '潮滩', '灯塔岛', '海峡', '内湾', '泊船地', '盐场', '海崖', '冬港'],
    organization: ['航海会', '船匠会', '渔民议会', '港务司', '领航员会', '盐商会', '海防队', '帆布工坊', '鲸猎团', '沿岸商会', '海图院', '救难队', '码头行会', '灯塔守望队', '远洋船团', '潮汐观测所'],
    item: ['船桨', '舵柄', '航海石', '鲸骨梳', '海图卷', '船灯', '鱼叉', '缆绳', '帆针', '铜罗盘', '号角', '海盐罐', '锚链', '渔网坠', '防水披风', '船首饰板'],
  },
  classical: {
    location: ['城邦', '港城', '卫城', '丘城', '城门区', '广场', '殖民城', '圣域', '剧场区', '葡萄园', '橄榄林', '采石场', '桥头堡', '军营', '岛城', '浴场区'],
    organization: ['公民会', '元老院', '商人团', '祭司团', '哲学院', '竞技会', '军团', '护民院', '抄写院', '港务会', '陶工会', '葡萄酒商会', '医师会', '建筑师团', '驿使团', '法庭'],
    item: ['短剑', '圆盾', '长矛', '蜡板', '酒杯', '双耳瓶', '桂冠', '军旗', '印戒', '油灯', '钱币', '胸甲', '日晷', '祭盘', '卷轴匣', '陶片签'],
  },
  riverine: {
    location: ['河港', '渡口', '三角洲镇', '灌溉村', '稻谷平原', '寺院城', '商旅站', '园林庄', '山麓镇', '湖滨集市', '石阶井', '盐泽', '森林关', '高原堡', '运河城', '河心岛'],
    organization: ['河港商会', '水利议会', '寺院工匠会', '香料商队', '纺织行会', '学者院', '王室卫队', '象军营', '药师会', '船运社', '铸币局', '抄经院', '乐舞团', '村社议会', '粮仓署', '园林工坊'],
    item: ['油灯', '经卷', '弯刀', '织毯', '香料匣', '铜壶', '象牙棋盘', '木雕印章', '长弓', '孔雀羽扇', '染布卷', '寺钟', '药囊', '水烟壶', '珠饰腰带', '旅行水罐'],
  },
  tropical: {
    location: ['稻田村', '河港', '水上集市', '火山坡城', '雨林寨', '岛湾', '红树林口', '寺塔城', '香料港', '珊瑚岛', '高脚屋村', '瀑布谷', '湖上镇', '山地梯田', '海峡关', '棕榈庄园'],
    organization: ['村社议会', '稻田水会', '香料商会', '船队', '寺院学社', '木雕工坊', '织染行会', '象队', '港务会', '雨林采集社', '乐舞团', '铜锣工坊', '岛屿守备队', '医药会', '王宫侍卫', '渔猎会'],
    item: ['短剑', '蜡染布', '铜锣', '木偶', '藤盾', '竹简', '香料盒', '船桨', '漆器盒', '棕榈叶卷', '编织篮', '仪式面具', '鱼叉', '米酒壶', '铜铃', '雨披'],
  },
  savanna: {
    location: ['鼓城', '河谷', '草原镇', '红土村', '林缘集市', '高地寨', '盐路驿站', '湖滨聚落', '石丘', '牧牛场', '棕榈绿洲', '雨季营地', '铜矿镇', '狩猎林', '渡口', '王宫城'],
    organization: ['长老会', '猎人会', '鼓乐团', '铸铜行会', '织染工坊', '河港商会', '牧民议会', '药师团', '王室卫队', '市场妇女会', '盐商队', '象牙工匠会', '使者团', '祭司院', '粮仓会', '雨季巡护队'],
    item: ['手鼓', '面具', '珠冠', '铜铃', '长矛', '皮盾', '靛蓝布', '木杖', '贝壳串', '象牙梳', '药草袋', '陶水罐', '皮革披风', '狩猎号角', '编织篮', '占卜盘'],
  },
  desert: {
    location: ['绿洲', '商队站', '城门镇', '巴扎', '蓄水池城', '盐泽', '沙丘营地', '高原堡', '干谷', '古井', '海港', '花园城', '山口', '观星台', '驼队驿站', '河岸城'],
    organization: ['驼队商会', '宫廷书记院', '法学会', '绿洲水会', '地毯行会', '天文院', '港口税署', '香料商会', '驿站司', '护商队', '金工坊', '诗人会', '医师院', '园林署', '铸币局', '城门守备队'],
    item: ['星盘', '铜壶', '水袋', '地毯', '弯刀', '细密画册', '香料盒', '驼铃', '玻璃灯', '印章', '书写盒', '银手镯', '旅行罗盘', '皮革卷袋', '香炉', '马鞍毯'],
  },
  steppe: {
    location: ['营地', '冬营', '夏牧场', '水井', '河曲', '渡口', '盐湖', '丘陵', '山口', '驿站', '马市', '牧马场', '帐城', '界碑地', '草甸', '沙地营盘'],
    organization: ['汗廷', '部族议会', '牧群登记所', '驿马司', '铁匠营', '牧道巡护队', '渡口会', '马具商团', '祭礼院', '鹰猎团', '弓手队', '冬营会', '商旅会', '毡房工坊', '使者队', '水草议事会'],
    item: ['马鞍', '箭囊', '毡帐', '鹰猎兜帽', '马尾旗', '皮酒囊', '骨骰', '火镰', '驼毛绳', '银腰带', '铜锅', '号角', '马奶桶', '弓袋', '风向旗', '套马索'],
  },
  arctic: {
    location: ['河站', '冬营地', '针叶林镇', '冰湖村', '苔原驿站', '海岬', '冻湾', '矿营', '猎人小屋', '渡口', '山口', '铁路站', '气象站', '修院镇', '驯鹿场', '极光哨站'],
    organization: ['毛皮商会', '河运署', '猎户会', '冻土测绘队', '极地补给站', '渔猎社', '边地议会', '驯鹿牧团', '矿工会', '雪橇邮队', '森林巡护队', '气象观测所', '修船坊', '皮革工坊', '冬营互助会', '药草采集队'],
    item: ['桦皮舟', '毛皮包', '雪地靴', '驯鹿挽具', '骨鱼叉', '森林斧', '测量杆', '渔网', '雪橇铃', '皮手套', '冰钻', '油灯', '兽皮帐', '木制罗盘盒', '猎刀', '保温水壶'],
  },
  highland: {
    location: ['山口', '草甸', '河曲', '湖湾', '盐泽', '冰川口', '台地', '峡道', '石林', '泉眼', '渡口', '驿站', '庄园堡', '牧场', '修行洞', '岩壁村', '温泉谷', '高原集市', '河源地', '风蚀台'],
    organization: ['马帮', '辩经院', '医馆', '译经院', '粮仓会', '盐商会', '牧场盟', '河谷议事会', '雕刻坊', '绘画院', '铸匠会', '驿站司', '巡山队', '护湖会', '药师会', '乐舞团', '历算院', '茶马行', '藏书院', '帐篷工坊'],
    item: ['氆氇披风', '护符盒', '铜壶', '木碗', '皮囊', '马鞍', '火镰', '糌粑袋', '盐砖', '鼻烟壶', '长号', '手鼓', '骨笛', '刻经板', '药箱', '护身结', '银腰饰', '长刀', '陶罐', '帐篷杆'],
  },
  forest: {
    location: ['林间村', '河湾', '湖畔营地', '山麓寨', '长屋聚落', '红杉湾', '峡谷台地', '草原营地', '冬季营地', '狩猎林', '石圈地', '瀑布口', '松林渡口', '高地村', '湿地岛', '海岸营地'],
    organization: ['长老圈', '氏族会', '狩猎联盟', '歌路守护者', '渔猎社', '药草会', '冬营联盟', '工艺交换会', '仪式舞团', '远行使者团', '河道守护队', '木舟工坊', '织篮会', '故事传承会', '火塘议事会', '林地巡护队'],
    item: ['鹿皮披肩', '骨针', '石刃', '树皮篮', '羽饰', '骨护符', '皮水袋', '木舟', '图腾柱', '仪式袋', '木鼓', '石锤', '编织毯', '鱼叉', '雪鞋', '烟斗袋'],
  },
  island: {
    location: ['珊瑚岛', '泻湖', '礁口', '火山高地', '椰林海岸', '潮汐滩', '海鸟岛', '雨林岛', '内海湾', '风帆港', '渔场', '海峡', '补给湾', '盐池', '独木舟道', '海崖村', '火山湖', '河口岛', '外礁', '祭祀岛'],
    organization: ['航海长老会', '酋长议会', '独木舟工坊', '海图传承院', '椰纤工坊', '贝壳工艺会', '潮汐渔猎社', '岛屿盟会', '远洋歌者团', '祖谱记忆院', '火山祭司团', '礁湖守护队', '季风商旅会', '海鸟观察社', '木鼓乐团', '岛间使者团', '粮仓会', '星象观测会', '渔网编织会', '岛屿医者圈'],
    item: ['远洋独木舟', '星图板', '贝壳胸饰', '树皮布', '木鼓', '鲸牙坠饰', '椰壳水勺', '鱼骨钩', '编织席', '羽毛披风', '火山石刃', '雕纹船桨', '测深杆', '绳结板', '贝壳货币', '祖灵木像', '海盐罐', '椰纤绳', '珊瑚磨石', '贝壳号'],
  },
}

// Europe uses separate location grammars instead of a single western bucket.
// These are semantic Chinese labels for fictional settings; native historical
// spellings remain in the reference pools and are not fabricated here.
const europeanLocationTypeOverrides: Partial<Record<OfflineCulture, string[]>> = {
  english: ['郡镇', '教区村', '庄园镇', '港镇', '荒原驿站', '城堡领', '河谷镇', '林地村', '丘陵堡', '集市镇', '桥镇', '沼泽地', '矿镇', '修道院镇', '海湾村', '边境要塞'],
  french: ['伯爵领', '侯爵堡', '葡萄园镇', '教区村', '石堡镇', '河畔城', '海港镇', '山口堡', '修道院镇', '集市镇', '林地村', '泉镇', '边区堡', '橡林庄', '盐场镇', '桥头城'],
  german: ['自由市', '林堡镇', '矿山城', '河畔堡', '侯国城', '边境关', '修院镇', '湖区镇', '钟楼村', '集市堡', '山谷城', '盐路镇', '铁门堡', '橡林村', '葡萄园城', '桥镇'],
  italian: ['城邦', '海港城', '山城', '塔城', '葡萄园镇', '湖畔城', '石桥镇', '教区城', '侯国堡', '广场镇', '橄榄庄', '大理石城', '海角镇', '喷泉镇', '修院城', '商埠'],
  iberian: ['王国城', '港城', '山城', '边堡', '朝圣镇', '修院镇', '海岸城', '谷地镇', '橄榄庄', '河港', '高原堡', '矿镇', '石桥镇', '伯爵领', '白墙镇', '要塞'],
  norse: ['峡湾农庄村', '海湾镇', '木板教堂村', '山谷堡', '鳕鱼港', '山口寨', '高原驿站', '松林镇', '潮汐港', '岩壁城', '海岬寨', '果园村', '峡湾堡', '渔场镇', '冰湖村', '冬营地'],
  icelandic: ['熔岩村', '冰川镇', '海湾村', '温泉地', '火山口', '黑沙滩镇', '峡湾农场', '雪原驿站', '苔原港', '牧场村', '渔站', '山口堡', '冰湖地', '熔岩台', '北岸镇', '风口村'],
  'ancient-greek': ['城邦', '港城', '卫城', '神庙镇', '竞技场区', '葡萄园', '橄榄林', '海岛城', '山丘城', '剧场区', '圣泉镇', '石柱堡', '军营城', '商埠', '桥头城', '殖民城'],
  'ancient-rome': ['行省城', '军营镇', '道路驿站', '港口城', '浴场区', '论坛城', '庄园镇', '边防堡', '桥头城', '橄榄庄', '矿镇', '河港', '殖民城', '山口堡', '石桥镇', '军团营'],
  celtic: ['圣井村', '修院镇', '橡林村', '雾谷地', '海岬寨', '泥炭地', '山丘堡', '牧鹿地', '竖琴镇', '河湾村', '圣泉地', '冬青林', '岛屿港', '石丘村', '草甸堡', '海雾村'],
  'slavic-east': ['公国城', '河畔镇', '白桦村', '修院镇', '边境堡', '集市城', '森林寨', '盐路镇', '湖滨镇', '矿山城', '石桥城', '草原关', '冬营地', '葡萄园村', '山口堡', '河口城'],
  'dutch-lowlands': ['堤坝镇', '运河城', '圩田村', '海堤堡', '风车村', '河口港', '商埠城', '岛堤村', '沼泽地', '船坞镇', '农庄村', '盐场港', '桥闸城', '低地堡', '湖区镇', '牧场村'],
  baltic: ['大公城', '丘堡镇', '庄园镇', '河港镇', '湖堡镇', '林地村', '教区村', '集市镇', '渡口镇', '大学城', '铸币镇', '边境堡', '草甸村', '橡树林村', '铁路镇', '文化城'],
  balkan: ['王城', '大茹潘城', '修院镇', '矿镇', '河港镇', '山堡镇', '集市镇', '教区村', '渡口镇', '石桥村', '铁路镇', '工业城', '大学城', '河谷城', '橡树林村', '山麓镇'],
  caucasus: ['阿兰王城', '石塔村', '骑兵镇', '山谷城', '教堂镇', '商旅驿', '牧马村', '河源镇', '峡谷堡', '矿镇', '大学城', '文化城', '山口镇', '瀑布村', '冰川镇', '高原村'],
  polish: ['王城', '河港', '盐矿镇', '森林村', '骑士堡', '琥珀港', '湖区城', '粮仓镇', '修院城', '边境堡', '草甸村', '集市城', '松林镇', '桥头城', '河谷村', '矿山堡'],
  hungarian: ['王冠城', '河畔镇', '平原庄', '葡萄园村', '堡垒城', '集市镇', '骑士堡', '牧场村', '湖滨镇', '盐路城', '桥头镇', '边境堡', '林地村', '庄园镇', '河口城', '草原驿站'],
  romani: ['旅路营地', '河畔营', '森林集市', '山口营', '马市镇', '边境营', '海港营', '冬季营地', '湖滨营', '手工业村', '草原驿站', '桥头营', '矿区营', '盐路营', '林缘集市', '河口营'],
  finnish: ['湖镇', '森林村', '沼泽堡', '海湾镇', '白桦村', '河口村', '木材镇', '雪原驿站', '岛屿港', '桑拿村', '湖心岛', '松林镇', '矿区城', '峡湾村', '草甸村', '冬港'],
  'albanian-romanian': ['塔楼村', '山鹰堡', '海湾港', '高山林镇', '宽河渡口', '林堡镇', '牧羊山寨', '葡萄丘村', '石砌高地村', '边关塔堡', '湖畔渔村', '高原牧场', '山谷市集', '隘口驿站', '盐矿镇', '河湾城'],
  'modern-greek': ['港城', '岛镇', '海湾村', '橄榄镇', '山城', '海峡港', '海滨市', '葡萄园村', '渔港', '石桥镇', '丘陵城', '修院村', '海岬镇', '河口城', '风岛镇', '白石村'],
  portuguese: ['航海港', '河口城', '海岛镇', '葡萄园村', '修院城', '海岬堡', '商埠港', '橄榄庄', '盐场镇', '石桥城', '丘陵村', '王室港', '航海驿站', '海湾城', '岛屿村', '河谷镇'],
}

const europeanOrganizationTypeOverrides: Partial<Record<OfflineCulture, string[]>> = {
  english: ['郡议会', '教区会', '庄园法庭', '羊毛商会', '长弓手团', '海峡船会', '大学学社', '王室邮驿', '石匠行会', '港务委员会', '猎场守林队', '城堡守备队'],
  french: ['伯爵议会', '葡萄酒商会', '城堡卫队', '修道院书院', '百合旗骑士团', '香料商会', '织毯工坊', '河港税务会', '宫廷乐师团', '石匠行会', '教区医院', '驿使署'],
  german: ['自由市议会', '北海城市商馆', '矿工行会', '铁匠兄弟会', '修院书院', '侯爵卫队', '大河船会', '钟表匠会', '啤酒酿造会', '驿站署', '林业会', '城墙守备队'],
  italian: ['城邦议会', '银行家会', '丝绸行会', '玻璃工坊', '画师学院', '雇佣兵团', '贡多拉船会', '教廷卫队', '香料商会', '建筑师团', '剧院会', '城堡法庭'],
  iberian: ['骑士团', '王室航海院', '羊毛商会', '橄榄种植会', '教区议会', '边境守备队', '铸币局', '港口税署', '朝圣者救济院', '城堡法庭', '马术兄弟会', '地图师院'],
  norse: ['地方庭会', '莱当船队', '国王侍卫团', '符文刻师会', '铁匠行会', '峡湾商会', '主教座堂参事会', '海岸守望队', '鳕鱼商会', '法律宣讲人团', '船匠坊', '农场主会'],
  icelandic: ['全岛议会', '地方廷会', '法律委员会', '萨迦抄写院', '农场主会', '峡湾船会', '羊毛织工会', '鱼商会', '主教座堂会', '冬季互助会', '火山监测站', '海岸救难队'],
  'ancient-greek': ['公民大会', '五百人议事会', '城邦同盟', '哲学学园', '神谕祭司团', '陶工行会', '海商会', '重装步兵团', '剧场诗人会', '竞技会', '神庙财库', '医师学派'],
  'ancient-rome': ['元老院', '平民会议', '军团', '禁卫队', '商人公会', '圣火女祭司团', '道路工程署', '行省总督府', '角斗士训练所', '公共浴场会', '抄写员会', '铸币局'],
  celtic: ['部族议会', '菲利诗人团', '布雷洪法庭', '修院抄写会', '橡林修道院', '海岸船会', '铁匠行会', '猎鹿团', '王廷侍从团', '牧民盟会', '圣井守护队', '山丘堡卫队'],
  'slavic-east': ['亲兵团', '公国议会', '修院抄写院', '河商会', '林地猎户会', '盐商队', '村社大会', '铁匠合作社', '边防守军', '圣像画师会', '驿站署', '粮仓议事会'],
  'dutch-lowlands': ['城市议会', '海外特许商馆', '运河船会', '堤坝水务会', '风车主协会', '呢绒行会', '港口商会', '地图师工坊', '造船行会', '郁金香商社', '啤酒酿造会', '圩田管理会'],
  baltic: ['大公宫廷', '贵族会议', '大公国议会', '最高法庭', '文书局', '盖特曼府', '主教座堂会', '大学学社', '铸币局', '商人行会', '民俗协会', '边境守备队'],
  balkan: ['大茹潘宫廷', '王室议事会', '教会会议', '修道院抄写院', '矿工团体', '王室文书局', '村社议会', '革命政府委员会', '古斯莱歌者团', '市议会', '语言研究所', '国家档案馆'],
  caucasus: ['阿兰王廷', '氏族议事会', '骑兵亲卫队', '奥塞梯教区', '纳尔特史诗歌者团', '山口守望队', '石塔营造团', '牧民互助会', '民歌团', '语言研究所', '国家博物馆', '山地救援队'],
  polish: ['贵族小议会', '王室议会', '翼骑兵团', '盐矿工会', '琥珀商会', '大学学社', '河运商会', '庄园法庭', '修院抄写院', '森林猎户会', '铸币局', '边境城防队'],
  hungarian: ['王国议会', '骠骑兵团', '平原牧马会', '葡萄酒商会', '城堡守备队', '河运会', '皮革匠行会', '改革宗学院', '驿马署', '盐路商队', '庄园法庭', '边境巡逻队'],
  romani: ['长老议事圈', '旅团会', '乐师行会', '流动铁匠会', '马匹交易会', '篷车互助会', '故事传承会', '铜器工坊', '织带工坊', '旅路信使团', '冬营议事会', '占卜师会'],
  finnish: ['森林合作社', '湖区船会', '木材商会', '史诗歌者学社', '冬季渔民会', '驯鹿牧团', '刀匠工坊', '教区议会', '桑拿屋会', '边境守备队', '纺织合作社', '湖运署'],
  'albanian-romanian': ['山地氏族会', '沃伊沃德宫廷', '东正教修院会', '牧羊人行会', '石堡守备队', '葡萄酒商会', '山口驿站署', '河运商会', '银匠工坊', '村社议会', '边境骑兵队', '森林猎户会'],
  'modern-greek': ['航运商会', '岛屿议会', '东正教教区会', '橄榄种植会', '渔民合作社', '港务委员会', '造船行会', '剧院协会', '考古学社', '葡萄酒商会', '海岸救难队', '山村议事会'],
  portuguese: ['王室航海院', '海外商馆', '港务议会', '造船行会', '瓷砖工坊', '葡萄酒商会', '教区慈善会', '海图师院', '香料商社', '河运会', '航海家兄弟会', '海岸守备队'],
}

const europeanItemTypeOverrides: Partial<Record<OfflineCulture, string[]>> = {
  english: ['长弓', '橡木盾', '羊皮地契', '郡徽印戒', '锡制酒杯', '羊毛斗篷', '航海罗盘', '羽毛笔盒', '庄园账册', '猎号', '石桥通行牌', '船灯'],
  french: ['细剑', '百合纹印章', '葡萄酒壶', '织锦挂毯', '珐琅胸针', '羊皮敕令', '宫廷折扇', '铜制圣物盒', '羽饰帽', '香水瓶', '河运通行证', '鲁特琴'],
  german: ['双手剑', '弩', '行会账册', '啤酒杯', '铁钥匙', '矿灯', '纹章盾', '木刻版', '银制钟表', '航河图', '工匠锤', '修院抄本'],
  italian: ['细剑', '假面', '城邦金币', '玻璃高脚杯', '家族印章', '手抄法典', '鲁特琴', '港口海图', '炼金瓶', '丝绸披风', '大理石小像', '贡多拉灯'],
  iberian: ['细剑', '星盘', '念珠', '王室印章', '银币', '海图', '皮革水袋', '马鞍', '橄榄油壶', '朝圣徽章', '羊毛披风', '船用沙漏'],
  norse: ['长船', '圆盾', '胡须斧', '单刃长剑', '银臂环', '符文石', '饮酒角', '骨梳', '羊毛斗篷', '皂石锅', '木雕船首', '织机坠'],
  icelandic: ['萨迦羊皮卷', '岛民法典', '银胸针', '羊毛斗篷', '鲸骨棋子', '鱼皮鞋', '饮酒角', '铁短刀', '火山石磨', '羊毛布匹', '船用绳', '木杯'],
  'ancient-greek': ['圆盾', '长矛', '青铜胸甲', '双耳瓶', '酒杯', '陶片签', '蜡板', '月桂冠', '油灯', '神庙供盘', '里拉琴', '城邦钱币'],
  'ancient-rome': ['短剑', '方盾', '标枪', '军团鹰旗', '蜡板法典', '托加袍', '帝国金币', '凯旋桂冠', '印戒', '油灯', '道路里程碑', '军团水壶'],
  celtic: ['铁剑', '爱尔兰竖琴', '银胸针', '角杯', '环形护符', '牧杖', '木皮盾', '羊毛披风', '猎鹿号角', '欧甘铭文石', '铜镜', '海舟桨'],
  'slavic-east': ['弯刀', '圣像', '印章', '皮靴', '桦皮文书', '银酒杯', '皮毛斗篷', '木雕圣牌', '河运账册', '长柄斧', '盐袋', '马鞍毯'],
  'dutch-lowlands': ['航海图', '蓝白瓷砖', '黄铜罗盘', '风车齿轮', '呢绒卷', '郁金香账册', '运河通行牌', '船钟', '银币袋', '啤酒杯', '地图铜版', '木鞋'],
  baltic: ['大公印玺', '立陶宛法典', '第纳尔银币', '琥珀胸针', '坎克莱斯琴', '织纹腰带', '草编吊饰', '彩绘蛋', '亚麻桌布', '木雕十字架', '羊皮特许状', '木制啤酒杯'],
  balkan: ['《杜尚法典》', '塞尔维亚第纳尔', '王室金玺诏书', '古斯莱琴', '奥帕纳克皮鞋', '沙伊卡查帽', '皮罗特织毯', '兹拉库萨陶罐', '刺绣巾', '起义旗', '铁路电子票', '双头鹰纪念章'],
  caucasus: ['阿兰直刃长剑', '复合弓', '骑兵马具', '银腰带饰片', '铭文石碑', '基辛凡德尔提琴', '达拉凡德尔竖琴', '乌阿丁兹笛', '三足祭礼桌', '奥塞梯毡帽', '史诗手抄本', '阿兰纹样胸针'],
  polish: ['波兰马刀', '琥珀十字架', '剪纸册', '木制齐特琴', '盐矿灯', '翼骑兵羽饰', '贵族印戒', '亚麻披风', '王室敕令', '银酒杯', '河运账册', '皮革马具'],
  hungarian: ['马刀', '马扎尔刺绣', '牧马鞭', '葡萄酒壶', '骠骑兵帽', '银马镫', '皮革箭囊', '平原地图', '王冠印章', '铜酒杯', '绣花披风', '驿马铃'],
  romani: ['小提琴', '黄铜壶', '刺绣腰带', '马具', '塔罗牌匣', '篷车灯', '银铃', '彩布披肩', '铁匠锤', '铜手镯', '旅行水壶', '故事卷册'],
  finnish: ['康特勒琴', '普科刀', '桦皮杯', '羊毛手套', '木制雪橇', '湖区渔网', '桑拿木勺', '驯鹿铃', '松脂火把', '亚麻披风', '木舟桨', '银胸针'],
  'albanian-romanian': ['双弦琴', '白毡帽', '褶裥裙装', '奥平奇皮鞋', '山地弯刀', '弧管排箫', '传统绣衣', '羊毛织毯', '李子蒸馏酒壶', '木雕门牌', '长管燧发枪', '蜂蜡圣烛'],
  'modern-greek': ['布祖基琴', '橄榄冠', '圣像', '双耳瓶', '航海罗盘', '渔网坠', '海绵袋', '葡萄酒壶', '银十字架', '岛屿地图', '船灯', '陶制咖啡杯'],
  portuguese: ['卡拉维尔海图', '蓝白瓷砖', '法多吉他', '葡萄酒壶', '星盘', '航海罗盘', '船用沙漏', '王室印章', '海员披风', '香料匣', '港口通行证', '船灯'],
}

const europeanSemanticModifiers: Partial<Record<OfflineCulture, string[]>> = {
  english: ['白鹿', '黑荆', '橡林', '鸦石', '西桥', '灰沼', '赤丘', '王栎', '冬溪', '银麦', '雾港', '北垣'],
  french: ['白蔷薇', '银泉', '晴川', '红塔', '金藤', '蓝港', '百合', '白石', '晨钟', '绿谷', '香槟', '月桂'],
  german: ['鹰岩', '黑林', '银湖', '铁门', '白橡', '莱茵', '红堡', '松针', '狼岭', '钟楼', '金麦', '北境'],
  italian: ['金谷', '白塔', '月湾', '赤狮', '青石', '雾港', '橄榄', '葡萄藤', '圣泉', '日冠', '大理石', '海风'],
  iberian: ['银月', '红岭', '白帆', '太阳堡', '绿谷', '海风', '橄榄', '石榴', '金塔', '圣路', '蔚蓝', '雄狮'],
  norse: ['霜湾', '乌鸦', '铁松', '鳕鱼', '峡湾', '冰河', '雷岩', '狼谷', '白桦', '北星', '海雾', '长夜'],
  icelandic: ['熔岩', '冰川', '黑沙', '温泉', '火山', '北极光', '海雾', '霜原', '风岬', '鲸湾', '雪峰', '苔原'],
  'ancient-greek': ['银橄榄', '赤陶', '月桂', '青铜', '白帆', '紫葡萄', '金麦穗', '海豚', '日轮', '柱廊', '雄鹰', '清泉'],
  'ancient-rome': ['金鹰', '赤丘', '月港', '白石', '橄榄', '紫袍', '军旗', '石拱', '大理石', '凯旋', '河神', '铜盾'],
  celtic: ['白鹿', '橡林', '海雾', '圣井', '红鹿', '银泉', '乌鸦', '冬青', '月丘', '金琴', '青苔', '黑莓'],
  'slavic-east': ['白城', '晨星', '黑林', '赤河', '银桦', '金麦', '霜湖', '狼谷', '松烟', '冬月', '蓝顶', '鹰门'],
  'dutch-lowlands': ['风车', '低地', '银堤', '河口', '郁金香', '灰港', '绿圩', '白帆', '钟塔', '北海', '堤门', '琥珀'],
  baltic: ['铁狼', '琥珀', '橡树', '涅曼', '内里斯', '青湖', '白塔', '金冠', '猎隼', '月丘', '松林', '太阳'],
  balkan: ['白鹰', '莫拉瓦', '德里纳', '橡树', '红瓦', '山隼', '银桥', '金麦', '黑松', '圣泉', '拉斯', '舒马迪亚'],
  caucasus: ['纳尔特', '阿兰', '捷列克', '卡兹别克', '金角', '白山', '黑塔', '铁马', '雪峰', '青谷', '银泉', '赤岩'],
  polish: ['琥珀', '白城', '金麦', '松林', '红砖', '银河', '黑水', '王冠', '盐矿', '白桦', '冬堡', '鹰门'],
  hungarian: ['王冠', '金原', '红桥', '白堡', '葡萄藤', '平原', '银湖', '黑马', '鹰巢', '长河', '蓝门', '秋林'],
  romani: ['远路', '马铃', '篝火', '铜壶', '彩布', '河灯', '星车', '黑马', '月营', '银铃', '风帐', '红毯'],
  finnish: ['白桦', '千湖', '松林', '北极光', '冰湾', '木舟', '霜雪', '蓝湖', '长夜', '银鱼', '苔原', '风松'],
  'albanian-romanian': ['山鹰', '白石', '红谷', '黑林', '银河', '石桥', '葡萄藤', '雪峰', '蓝湖', '古堡', '风口', '橡林'],
  'modern-greek': ['蓝海', '白岛', '橄榄', '金湾', '石堡', '晨光', '紫葡萄', '海风', '月港', '银泉', '白帆', '山鹰'],
  portuguese: ['白帆', '金港', '蓝湾', '红塔', '橄榄', '葡萄藤', '海风', '航星', '石桥', '银潮', '王室', '河口'],
}

const semanticProfileByGroup: Record<string, keyof typeof semanticCatalogProfiles> = {
  sinitic: 'settled', western: 'settled', nordic: 'maritime', classical: 'classical', nile: 'riverine', southasia: 'riverine', seasia: 'tropical', africa: 'savanna', americas: 'settled', siberian: 'arctic', steppe: 'steppe', himalayan: 'highland', arabicPersian: 'desert', turkic: 'steppe', celtic: 'forest', slavic: 'forest', lithuanian: 'forest', sahel: 'desert', indigenous: 'forest', polynesian: 'island',
}

function getSemanticCatalogVocabulary(culture: OfflineCulture, kind: OfflineNameKind) {
  const group = cultureCombinationGroups[culture]
  if (!group || kind === 'character') return { modifiers: [] as string[], types: [] as string[] }
  const profile = semanticCatalogProfiles[semanticProfileByGroup[group]]
  const types = kind === 'location'
    ? europeanLocationTypeOverrides[culture] ?? profile?.location ?? []
    : kind === 'organization'
      ? europeanOrganizationTypeOverrides[culture] ?? profile?.organization ?? []
      : europeanItemTypeOverrides[culture] ?? profile?.item ?? []
  return { modifiers: europeanSemanticModifiers[culture] ?? semanticCatalogModifiers[group] ?? [], types }
}

function buildSemanticCatalogCombinations(culture: OfflineCulture, kind: OfflineNameKind) {
  const { modifiers, types } = getSemanticCatalogVocabulary(culture, kind)
  return modifiers.flatMap((modifier) => types
    .filter((type) => !type.includes(modifier) && !modifier.includes(type))
    .map((type) => `${modifier}${type}|${modifier}${type}`))
}

const COMPLETE_FICTIONAL_TARGET = 15

function uniqueCatalogEntries(entries: string[], culture: OfflineCulture) {
  const seenDisplay = new Set<string>()
  const seenNative = new Set<string>()
  return entries.filter((entry) => {
    const [rawDisplay, rawNative = rawDisplay] = entry.split('|')
    const display = rawDisplay !== rawNative ? rawDisplay.replace(/·/g, '') : localizeCatalogName(rawNative, culture)
    if (seenDisplay.has(display) || seenNative.has(rawNative)) return false
    seenDisplay.add(display)
    seenNative.add(rawNative)
    return true
  })
}

const periodIsolatedCatalogCultures = new Set<OfflineCulture>([
  'english', 'french', 'german', 'italian', 'iberian', 'norse', 'icelandic', 'ancient-greek', 'ancient-rome', 'egyptian',
  'celtic', 'slavic-east', 'dutch-lowlands', 'roman-low-countries', 'early-slavic', 'baltic', 'balkan', 'caucasus', 'japanese', 'korean', 'mongolian', 'tibetan', 'manchu',
])

function getCompleteFictionalCatalogBase(culture: OfflineCulture, kind: Exclude<OfflineNameKind, 'character'>, locationType: OfflineLocationType = 'settlement', period = 'modern') {
  const earlyAsiaEntries = getEarlyAsiaFictionalEntries(culture, period, kind, locationType)
  if (earlyAsiaEntries.length) return uniqueCatalogEntries(earlyAsiaEntries, culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'english') {
    return uniqueCatalogEntries(getEnglishPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  }
  if (culture === 'french') {
    return uniqueCatalogEntries(getFrenchPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  }
  if (culture === 'german') {
    return uniqueCatalogEntries(getGermanPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  }
  if (culture === 'italian') {
    return uniqueCatalogEntries(getItalianPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  }
  if (culture === 'iberian') {
    return uniqueCatalogEntries(getIberianPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  }
  if (culture === 'norse') return uniqueCatalogEntries(getNorsePeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'icelandic') return uniqueCatalogEntries(getIcelandicPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'ancient-greek') return uniqueCatalogEntries(getAncientGreekPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'ancient-rome') return uniqueCatalogEntries(getAncientRomePeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'egyptian') return uniqueCatalogEntries(getEgyptianPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'celtic') return uniqueCatalogEntries(getCelticPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'slavic-east') return uniqueCatalogEntries(getSlavicEastPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'dutch-lowlands') return uniqueCatalogEntries(getDutchLowlandsPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'roman-low-countries') return uniqueCatalogEntries(getRomanLowCountriesFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'early-slavic') return uniqueCatalogEntries(getEarlySlavicFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'baltic') return uniqueCatalogEntries(getLithuanianPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'balkan') return uniqueCatalogEntries(getSerbianPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'caucasus') return uniqueCatalogEntries(getOssetianPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'japanese') {
    return uniqueCatalogEntries(getJapanesePeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  }
  if (culture === 'korean') {
    return uniqueCatalogEntries(getKoreanPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  }
  if (culture === 'mongolian') return uniqueCatalogEntries(getMongolianPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'tibetan') return uniqueCatalogEntries(getTibetanPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  if (culture === 'manchu') return uniqueCatalogEntries(getManchuPeriodFictionalEntries(period, kind, locationType), culture).slice(0, COMPLETE_FICTIONAL_TARGET)
  const fixed = kind === 'location'
    ? [...(fictionalLocationNames[culture]?.[locationType] ?? []), ...(fictionalStylePools[culture]?.location ?? []), ...(getFictionalCompleteExpansion(culture)?.location ?? [])]
    : [...(fictionalStylePools[culture]?.[kind] ?? []), ...(getFictionalCompleteExpansion(culture)?.[kind] ?? [])]
  const complete = uniqueCatalogEntries(fixed, culture)
  if (complete.length >= COMPLETE_FICTIONAL_TARGET) return complete
  const seed = { value: seedOf(`complete-fictional|${culture}|${kind}|${locationType}`) }
  const materialized = shuffle(buildSemanticCatalogCombinations(culture, kind), seed)
  return uniqueCatalogEntries([...complete, ...materialized], culture).slice(0, COMPLETE_FICTIONAL_TARGET)
}

function getCompleteFictionalCatalog(culture: OfflineCulture, kind: Exclude<OfflineNameKind, 'character'>, locationType: OfflineLocationType = 'settlement', period = 'modern') {
  const base = getCompleteFictionalCatalogBase(culture, kind, locationType, period)
  if (earlyAsiaFictionalProfiles[culture]?.[period]) return base
  if (periodIsolatedCatalogCultures.has(culture)) return base
  const expansion = getFictionalCompleteExpansion(culture)?.[kind] ?? []
  return uniqueCatalogEntries([...base, ...expansion], culture).slice(0, COMPLETE_FICTIONAL_TARGET)
}

export function getOfflineCatalogVariety(culture: OfflineCulture) {
  return Object.fromEntries((['location', 'organization', 'item'] as OfflineNameKind[]).map((kind) => {
    const vocabulary = getSemanticCatalogVocabulary(culture, kind)
    return [kind, { modifiers: vocabulary.modifiers.length, types: vocabulary.types.length }]
  }))
}

export function getOfflineCatalogSignature(culture: OfflineCulture) {
  const group = cultureCombinationGroups[culture]
  const profile = semanticCatalogProfiles[semanticProfileByGroup[group ?? '']]
  return {
    group,
    modifiers: [...(europeanSemanticModifiers[culture] ?? semanticCatalogModifiers[group ?? ''] ?? [])],
    locationTypes: [...(europeanLocationTypeOverrides[culture] ?? profile?.location ?? [])],
    organizationTypes: [...(europeanOrganizationTypeOverrides[culture] ?? profile?.organization ?? [])],
    itemTypes: [...(europeanItemTypeOverrides[culture] ?? profile?.item ?? [])],
  }
}

export function getOfflineCatalogExpansionCounts(culture: OfflineCulture) {
  const countKinds = (pool: Partial<Record<OfflineNameKind, string[]>> | undefined) =>
    Object.fromEntries((['location', 'organization', 'item'] as OfflineNameKind[]).map((kind) => [kind, new Set(pool?.[kind] ?? []).size]))
  return {
    reference: countKinds(getReferenceExpansion(culture)),
    fictionalComplete: countKinds(getFictionalCompleteExpansion(culture)),
  }
}

export function getOfflineCompleteFictionalCounts(culture: OfflineCulture) {
  return Object.fromEntries((['location', 'organization', 'item'] as const).map((kind) => [kind, getCompleteFictionalCatalog(culture, kind).length]))
}

// Shared regional reference material for culture packs whose surviving local
// records are small. These are labelled as regional by collectReferenceEntries
// and are never presented as culture-specific historical facts.
const regionalReferencePools: Record<string, Partial<Record<OfflineNameKind, string[]>>> = {
  sinitic: {
    organization: ['东亚书院|East Asian Academy', '海上商路会馆|Maritime Trade Hall', '山岳寺院网络|Mountain Monastery Network', '地方氏族会议|Regional Clan Assembly', '宫廷文书院|Court Scriptorium', '河港行会|River Port Guild', '边防都护府|Frontier Protectorate', '礼学讲院|Ritual Studies School', '漆器作坊联合会|Lacquer Artisans Union', '茶道宗社|Tea Ceremony Society', '丝路驿站会|Silk Road Relay House', '东亚医师会|East Asian Physicians Guild', '水师营|River Fleet Office', '地方神社联社|Shrine Association', '盐场商会|Saltworks Guild', '铜匠作坊|Bronze Workers Hall', '山城守备府|Hill Fortress Office', '书画院|Painting and Calligraphy Bureau', '海东学社|Eastern Sea Society', '古典文献馆|Classical Text Archive'],
    item: ['东亚竹简|bamboo slips', '礼仪玉佩|ritual jade pendant', '漆木食盒|lacquer food box', '丝绸卷轴|silk scroll', '铜镜|bronze mirror', '铁制短刀|iron utility knife', '茶碾|tea grinder', '木版印本|woodblock book', '船用罗盘|mariner compass', '纸伞|paper umbrella', '祭礼钟|ceremonial bell', '青瓷碗|celadon bowl', '马具铜铃|horse tack bell', '书写砚台|inkstone', '绢本地图|silk map', '药材匣|herbal chest', '竹编篮|woven bamboo basket', '护身符袋|talisman pouch', '织机梭|loom shuttle', '木雕印章|wooden seal'],
  },
  southasia: {
    location: ['恒河上游|Upper Ganges', '德干高原北缘|Northern Deccan', '科罗曼德尔海岸|Coromandel Coast', '马拉巴尔海岸|Malabar Coast', '旁遮普平原|Punjab Plain', '孟加拉三角洲|Bengal Delta', '古吉拉特港湾|Gulf of Gujarat', '喜马拉雅山麓|Himalayan Foothills'],
    organization: ['地区寺院联盟|Regional Monastery League', '商路驿站会|Caravanserai Council', '梵学学院|Sanskrit College', '纺织行会|Textile Guild', '河港商会|River Port Merchants', '王室象军|Royal Elephant Corps', '地方村社议会|Village Council', '宫廷乐师院|Court Musicians House', '香料商队|Spice Caravan', '铸币局|Mint Office', '水利灌溉会|Irrigation Council', '瑜伽修院|Yoga Monastery', '医典抄写院|Medical Scriptorium', '海上航运社|Maritime Navigation House', '寺庙工匠会|Temple Artisans Guild'],
    item: ['掌叶经卷|palm-leaf manuscript', '青铜油灯|bronze oil lamp', '象牙棋盘|ivory chessboard', '棉布长巾|cotton shawl', '弯刃短剑|curved dagger', '铜制水罐|copper lota', '香料匣|spice box', '寺庙铜钟|temple bell', '孔雀羽扇|peacock fan', '石刻印章|stone seal', '木制弓|wooden bow', '染织卷布|dyed textile'],
  },
  arabicPersian: {
    location: ['香料海岸|Spice Coast', '两河上游|Upper Mesopotamia', '高原商路|Highland Caravan Route', '沙漠绿洲带|Desert Oasis Belt', '里海南岸|Southern Caspian Shore', '红海航线|Red Sea Route'],
    organization: ['驼队商会|Camel Caravan Guild', '宫廷书记院|Court Scribes House', '地方法学会|Regional Fiqh Council', '绿洲水利会|Oasis Water Council', '地毯织工行会|Carpet Weavers Guild', '天文观测院|Astronomers House', '港口关税署|Harbor Customs Office', '香料商人会|Spice Merchants House'],
    item: ['星盘|astrolabe', '铜制咖啡壶|copper dallah', '旅行水袋|traveler waterskin', '羊毛地毯|wool carpet', '阿拉伯短剑|curved jambiya', '波斯细密画册|miniature album', '香料盒|spice casket', '驼铃|camel bell'],
  },
  indigenous: {
    location: ['北方森林带|Northern Forest Belt', '大湖水系|Great Lakes Basin', '高原河谷|Plateau River Valley', '沿海潮汐湾|Coastal Tidal Bay', '草原迁徙带|Prairie Migration Range', '山麓峡谷|Mountain Foothill Canyon', '极地苔原海岸|Arctic Tundra Coast', '峡谷台地|Canyon Plateau'],
    organization: ['长老议事圈|Elders Council Circle', '氏族狩猎联盟|Clan Hunting Alliance', '歌路守护者|Songline Custodians', '河谷村社|River Valley Community', '沿海渔猎社|Coastal Fishing Society', '药草知识会|Herbal Knowledge Circle', '冬季营地联盟|Winter Camp Alliance', '工艺交换会|Craft Exchange Council', '仪式舞者团|Ceremonial Dancers', '远行使者团|Long-Distance Runners'],
    item: ['鹿皮披肩|deerskin mantle', '骨针|bone needle', '石刃|stone blade', '树皮篮|bark basket', '羽饰头冠|feather headdress', '兽骨护符|animal-bone amulet', '皮革水袋|hide water pouch', '木制独木舟|cedar canoe', '图腾柱|totem pole', '烟草仪式袋|ritual tobacco pouch'],
  },
  polynesian: {
    location: ['南太平洋|South Pacific', '珊瑚海|Coral Sea', '塔斯曼海|Tasman Sea', '波利尼西亚三角|Polynesian Triangle', '密克罗尼西亚海域|Micronesian Waters', '美拉尼西亚群岛|Melanesian Islands', '珊瑚环礁带|Coral Atoll Belt', '季风航路|Monsoon Wayfinding Route', '南十字星海域|Southern Cross Waters', '火山岛链|Volcanic Island Chain', '西太平洋航道|Western Pacific Passage', '岛屿内海|Island Inner Sea', '远洋渔场|Open Ocean Fishing Grounds', '泻湖群|Lagoon Chain', '海峡航线|Island Strait Route', '风帆补给湾|Sail Resupply Bay', '椰林海岸|Coconut Coast', '礁湖航标|Reef Waypoint', '火山高地|Volcanic Upland', '海鸟群岛|Seabird Islands', '潮汐滩|Tidal Flats', '珊瑚礁口|Reef Mouth', '雨林岛|Rainforest Island', '南岛航线|Southern Island Route', '海上祭祀岛|Offshore Ritual Island'],
    organization: ['航海长老会|Wayfinding Elders Council', '岛屿酋长议会|Island Chiefs Council', '独木舟建造社|Canoe Builders House', '海图传承院|Chart-Keepers House', '椰纤维工坊|Coconut Fibre Workshop', '贝壳工艺会|Shell Artisans Guild', '潮汐渔猎社|Tidal Fishing Society', '珊瑚岛盟约|Coral Island Compact', '远洋歌者团|Ocean Chant Society', '祖谱记忆院|Genealogy Keepers', '火山祭司团|Volcano Priesthood', '礁湖守护队|Lagoon Guardians', '季风商旅会|Monsoon Traders House', '海鸟观察社|Seabird Watchers', '木鼓乐团|Wooden Drum Ensemble', '岛间使者团|Island Messenger Corps', '酋邦礼仪院|Chiefly Protocol House', '航海学徒院|Wayfinding Apprentices', '海盐交换会|Sea Salt Exchange', '雨林采集社|Rainforest Gatherers', '珊瑚修复会|Reef Stewardship Council', '传统舞团|Traditional Dance House', '渔网编织会|Fishing Net Weavers', '岛屿医者圈|Island Healers Circle', '星象观测会|Stargazers House', '木雕祖灵院|Ancestor Carvers House', '海上盟誓会|Ocean Oath Society', '贝饰交换站|Shell Exchange House', '岛屿粮仓会|Island Granary Council', '泻湖水道会|Lagoon Channel Keepers'],
    item: ['远洋独木舟|ocean-going canoe', '航海星盘|wayfinding star chart', '贝壳胸饰|shell breastplate', '树皮布|tapa cloth', '木鼓|wooden slit drum', '鲸牙坠饰|whale-tooth pendant', '椰壳水勺|coconut ladle', '鱼骨鱼钩|bone fishhook', '编织席|woven pandanus mat', '羽毛披风|feather cape', '火山黑曜石|volcanic glass blade', '海龟纹桨|turtle-carved paddle', '礁石测深杆|reef sounding pole', '航海绳结板|navigation knot board', '贝壳货币串|shell currency strand', '木雕祖灵像|ancestral wood figure', '鱼皮鼓|fishskin drum', '海盐陶罐|sea-salt jar', '椰纤维绳|coconut-fibre rope', '珊瑚磨刀石|coral whetstone', '岛屿礼仪杖|ceremonial staff', '鲸骨梳|whalebone comb', '海鸟羽束|seabird feather bundle', '帆布修补针|sailmaker needle', '泻湖贝壳号|lagoon shell trumpet', '木制舵柄|wooden steering handle', '礁湖捕鱼篓|lagoon fish basket', '火山石祭盘|volcanic offering plate', '椰壳灯|coconut-shell lamp', '海风护符|sea-wind amulet', '祖谱刻板|genealogy tablet', '潮汐计|tide marker'],
  },
  turkic: {
    location: ['草原驿道|Steppe Relay Road', '天山北麓|Northern Tien Shan', '锡尔河上游|Upper Syr Darya', '里海草原|Caspian Steppe', '费尔干纳东缘|Eastern Fergana', '阿尔泰山口|Altai Pass'],
    organization: ['汗国驿站署|Khanate Relay Office', '游牧部落议会|Nomad Tribal Council', '丝路商队会|Silk Road Caravan Guild', '马匹育种营|Horse Breeders Camp', '草原铁匠会|Steppe Smiths Guild', '天文历法院|Astronomical Calendar House', '河谷灌溉会|River Irrigation Council', '毡房工艺社|Yurt Artisans Guild'],
    item: ['复合弓|composite bow', '马鞍毡垫|felt saddle pad', '鹰猎手套|falconry glove', '毡房骨架|yurt frame', '银饰马缰|silver bridle', '丝路驼铃|caravan bell', '草原短刀|steppe knife', '皮革箭囊|leather quiver'],
  },
  steppe: {
    organization: ['草原汗廷|Steppe Khan Court', '部族盟誓会|Tribal Oath Assembly', '牧群登记所|Herd Registry Office', '冬营议事会|Winter Camp Council', '驿马管理署|Relay Horse Office', '草原铁匠营|Steppe Smith Camp', '牧道巡护队|Pasture Route Wardens', '河谷渡口会|River Crossing Council', '冬牧帐篷会|Winter Pasture House', '马具商团|Horse Tack Traders', '草原祭礼院|Steppe Ritual House'],
    item: ['蒙古马鞍|Mongol saddle', '箭囊|horseback quiver', '毡制帐篷|felt ger cover', '鹰猎兜帽|eagle hood', '马尾军旗|horse-tail standard', '皮制酒囊|leather airag flask', '骨制骰子|bone knucklebones', '草原火镰|steppe fire striker', '驼毛绳|camel-hair rope', '银饰腰带|silver belt', '游牧铜锅|nomad cauldron', '驿站号角|relay horn', '马奶桶|mare-milk pail', '皮革箭靶|leather target', '草原风向旗|steppe wind pennant'],
  },
  himalayan: {
    organization: ['高原寺院联盟|Highland Monastery League', '山谷商队会|Valley Caravan House', '经院辩经院|Monastic Debate College', '雪山药师会|Snowland Physicians', '牧民冬营会|Pastoral Winter Camp', '河谷灌溉议会|Valley Irrigation Council', '岩盐商队|Rock Salt Caravan', '经卷抄写院|Scripture Scriptorium', '高山马帮|Highland Horse Caravan', '圣湖守护会|Sacred Lake Guardians', '酥油工坊|Butter-Lamp Workshop', '石刻工匠会|Stone Carvers Guild', '雪线驿站|Snowline Relay House', '天文历算院|Astronomical Calendar House', '山口盟誓会|Mountain Pass Oath Circle', '牧场互助社|Pasture Mutual Aid', '僧侣医学院|Monastic Medical School', '峡谷木工坊|Valley Woodworkers Guild', '高原歌者团|Highland Chant Society', '寺院粮仓会|Monastery Granary Council'],
    item: ['经幡|prayer flags', '转经筒|prayer wheel', '唐卡画轴|thangka scroll', '酥油灯|butter lamp', '高原毡靴|felt boots', '牦牛驮鞍|yak pack saddle', '银饰护符盒|silver amulet box', '石刻经板|carved scripture slab', '羊毛披肩|wool shawl', '木制念珠|wooden mala', '盐砖|salt brick', '高山药囊|mountain herb pouch', '骨制法号|bone trumpet', '铜制供水碗|copper offering bowl', '风马旗|windhorse banner', '牦牛毛绳|yak-hair rope', '藏式短刀|highland utility knife', '雪莲药盒|snow-lotus medicine box', '谷物量斗|grain measure', '石砌火盆|stone brazier'],
  },
  siberian: {
    location: ['叶尼塞河流域|Yenisei Basin', '勒拿河流域|Lena Basin', '贝加尔湖东岸|Eastern Baikal Shore', '北极苔原|Arctic Tundra', '鄂毕河上游|Upper Ob Basin', '萨彦岭北坡|Northern Sayan Range', '楚科奇海岸|Chukchi Coast', '远东森林带|Far Eastern Forest Belt'],
    organization: ['西伯利亚哥萨克防线|Siberian Cossack Line', '北方毛皮商会|Northern Fur Traders', '河运驿站署|River Transport Office', '针叶林猎户会|Taiga Hunters Guild', '冻土测绘队|Permafrost Survey Corps', '极地补给站|Polar Supply Station', '贝加尔渔猎社|Baikal Fishing Society', '远东边地议会|Far Eastern Frontier Council'],
    item: ['桦树皮舟|birch-bark canoe', '毛皮交易包|fur trade bundle', '雪地靴|fur snow boots', '驯鹿挽具|reindeer harness', '骨制鱼叉|bone harpoon', '针叶林斧|taiga axe', '冻土测量杆|permafrost rod', '贝加尔渔网|Baikal fishing net'],
  },
}

// A culture pack must not borrow named places, institutions, or objects from
// another culture. Shared regional pools used to make the result look varied,
// but they also made a Chinese selection return Korean, Japanese, or Tibetan
// entries. Keep reference results culture-specific; variety is supplied by the
// audited expansion tables for each pack.
function collectReferenceEntriesBase(culture: OfflineCulture, kind: Exclude<OfflineNameKind, 'character'>, period: string) {
  const earlyAsiaCatalog = earlyAsiaPeriodReferenceCatalogs[culture]?.[period]
  if (earlyAsiaCatalog) return [...new Set(earlyAsiaCatalog[kind])].map((rawName) => ({ rawName, sourceClass: 'historical' as const }))
  if (culture === 'english') {
    const direct = englishPeriodReferenceCatalogs[period]?.[kind] ?? englishPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'french') {
    const direct = frenchPeriodReferenceCatalogs[period]?.[kind] ?? frenchPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'german') {
    const direct = germanPeriodReferenceCatalogs[period]?.[kind] ?? germanPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'italian') {
    const direct = italianPeriodReferenceCatalogs[period]?.[kind] ?? italianPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'iberian') {
    const direct = iberianPeriodReferenceCatalogs[period]?.[kind] ?? iberianPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'norse') {
    const direct = norsePeriodReferenceCatalogs[period]?.[kind] ?? norsePeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'icelandic') {
    const direct = icelandicPeriodReferenceCatalogs[period]?.[kind] ?? icelandicPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'ancient-greek') {
    const direct = ancientGreekPeriodReferenceCatalogs[period]?.[kind] ?? ancientGreekPeriodReferenceCatalogs.classical[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: 'historical' as const }))
  }
  if (culture === 'ancient-rome') {
    const direct = ancientRomePeriodReferenceCatalogs[period]?.[kind] ?? ancientRomePeriodReferenceCatalogs.empire[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: 'historical' as const }))
  }
  if (culture === 'egyptian') {
    const direct = egyptianPeriodReferenceCatalogs[period]?.[kind] ?? egyptianPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'celtic') {
    const direct = celticPeriodReferenceCatalogs[period]?.[kind] ?? celticPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'slavic-east') {
    const direct = slavicEastPeriodReferenceCatalogs[period]?.[kind] ?? slavicEastPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'dutch-lowlands') {
    const direct = dutchLowlandsPeriodReferenceCatalogs[period]?.[kind] ?? dutchLowlandsPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'roman-low-countries') {
    const direct = romanLowCountriesReferenceCatalogs[period]?.[kind] ?? romanLowCountriesReferenceCatalogs.roman[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: 'historical' as const }))
  }
  if (culture === 'early-slavic') {
    const direct = earlySlavicReferenceCatalogs[period]?.[kind] ?? earlySlavicReferenceCatalogs['migration-era'][kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: 'historical' as const }))
  }
  if (culture === 'baltic') {
    const direct = lithuanianPeriodReferenceCatalogs[period]?.[kind] ?? lithuanianPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'balkan') {
    const direct = serbianPeriodReferenceCatalogs[period]?.[kind] ?? serbianPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'caucasus') {
    const direct = ossetianPeriodReferenceCatalogs[period]?.[kind] ?? ossetianPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'japanese') {
    const direct = japanesePeriodReferenceCatalogs[period]?.[kind] ?? japanesePeriodReferenceCatalogs.modern[kind]
    const sourceClass = period === 'modern' ? 'modern' as const : 'historical' as const
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass }))
  }
  if (culture === 'korean') {
    const direct = koreanPeriodReferenceCatalogs[period]?.[kind] ?? koreanPeriodReferenceCatalogs['south-modern'][kind]
    const sourceClass = period === 'south-modern' || period === 'north-modern' ? 'modern' as const : 'historical' as const
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass }))
  }
  if (culture === 'mongolian') {
    const direct = mongolianPeriodReferenceCatalogs[period]?.[kind] ?? mongolianPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'tibetan') {
    const direct = tibetanPeriodReferenceCatalogs[period]?.[kind] ?? tibetanPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  if (culture === 'manchu') {
    const direct = manchuPeriodReferenceCatalogs[period]?.[kind] ?? manchuPeriodReferenceCatalogs.modern[kind]
    return [...new Set(direct)].map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  }
  const direct = kind === 'location'
    ? [...(periodLocationNames[culture]?.[period] ?? []), ...(expandedNonPersonPools[culture]?.location ?? []), ...(additionalReferencePools[culture]?.location ?? []), ...(locationPools[culture]?.location ?? []), ...(getReferenceExpansion(culture)?.location ?? [])]
    : [...(expandedNonPersonPools[culture]?.[kind] ?? []), ...(additionalReferencePools[culture]?.[kind] ?? []), ...(locationPools[culture]?.[kind] ?? []), ...(getReferenceExpansion(culture)?.[kind] ?? [])]
  const seen = new Set<string>()
  return direct.map((rawName) => ({ rawName, sourceClass: 'historical' as const })).filter(({ rawName }) => {
    if (seen.has(rawName)) return false
    seen.add(rawName)
    return true
  })
}

function collectReferenceEntries(culture: OfflineCulture, kind: Exclude<OfflineNameKind, 'character'>, period: string) {
  const base = collectReferenceEntriesBase(culture, kind, period)
  if (earlyAsiaPeriodReferenceCatalogs[culture]?.[period]) return base
  if (periodIsolatedCatalogCultures.has(culture)) return base
  const seen = new Set(base.map((entry) => entry.rawName))
  const expansion = getReferenceExpansion(culture)?.[kind] ?? []
  const additional = expansion.filter((rawName) => {
    if (seen.has(rawName)) return false
    seen.add(rawName)
    return true
  }).map((rawName) => ({ rawName, sourceClass: period === 'modern' ? 'modern' as const : 'historical' as const }))
  return [...base, ...additional]
}

function buildCultureSpecificCombinations(culture: OfflineCulture, kind: OfflineNameKind) {
  const rawEntries = kind === 'location'
    ? [
        ...Object.values(fictionalLocationNames[culture] ?? {}).flat(),
        ...(fictionalStylePools[culture]?.location ?? []),
      ]
    : fictionalStylePools[culture]?.[kind] ?? []
  const pairs = rawEntries.map((rawEntry) => {
    const [rawDisplay, rawNative = rawDisplay] = rawEntry.split('|')
    // Older location packs stored only the local/Latin form. Convert that
    // form to the Chinese UI label before combining it, while preserving the
    // original spelling in the native half of the candidate.
    const display = rawDisplay !== rawNative || !/[A-Za-z]/.test(rawDisplay)
      ? rawDisplay
      : localizeCatalogName(rawNative, culture)
    const native = rawNative
    const displayWords = display.trim().split(/\s+/).filter(Boolean)
    const nativeWords = native.trim().split(/\s+/).filter(Boolean)
    if (displayWords.length > 1) {
      return {
        displayHead: displayWords.slice(0, -1).join(' '),
        displayTail: displayWords.at(-1) ?? display,
        nativeHead: nativeWords.slice(0, -1).join(' ') || native,
        nativeTail: nativeWords.at(-1) ?? native,
      }
    }
    const splitAt = Math.max(1, Math.floor(display.length / 2))
    const nativeSplitAt = Math.max(1, Math.floor(native.length / 2))
    return { displayHead: display.slice(0, splitAt), displayTail: display.slice(splitAt), nativeHead: native.slice(0, nativeSplitAt), nativeTail: native.slice(nativeSplitAt) }
  }).filter((entry) => entry.displayHead && entry.displayTail && entry.nativeHead && entry.nativeTail)
  if (pairs.length < 2) return []
  const singleLayer = pairs.flatMap((head) => pairs.map((tail) => `${head.displayHead}${tail.displayTail}|${head.nativeHead}${tail.nativeTail}`))
  const compoundLayer = pairs.flatMap((head, index) => pairs.filter((_, rootIndex) => rootIndex !== index).flatMap((root) => [
    `${head.displayHead}${root.displayHead}${root.displayTail}|${head.nativeHead}${root.nativeHead}${root.nativeTail}`,
    `${head.displayHead}${root.displayHead}${head.displayTail}|${head.nativeHead}${root.nativeHead}${head.nativeTail}`,
    `${root.displayHead}${head.displayHead}${root.displayTail}|${root.nativeHead}${head.nativeHead}${root.nativeTail}`,
  ]))
  // A third, still same-culture layer gives small packs enough variety for a
  // catalog without importing vocabulary from another culture.  The source
  // units are already curated as setting heads/tails, so this remains a
  // controlled fictional construction rather than random syllable assembly.
  const tripleLayer = pairs.flatMap((head, index) => pairs.filter((_, rootIndex) => rootIndex !== index).flatMap((root, rootIndex) => pairs.filter((_, tailIndex) => tailIndex !== index && tailIndex !== rootIndex).map((tail) => `${head.displayHead}${root.displayHead}${tail.displayTail}|${head.nativeHead}${root.nativeHead}${tail.nativeTail}`)))
  return [...new Set([...singleLayer, ...compoundLayer, ...tripleLayer])]
}

function buildCatalogCombinations(culture: OfflineCulture, kind: OfflineNameKind, period = 'modern', locationType: OfflineLocationType = 'settlement') {
  if (culture === 'english' && kind !== 'character') return getEnglishPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'french' && kind !== 'character') return getFrenchPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'german' && kind !== 'character') return getGermanPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'italian' && kind !== 'character') return getItalianPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'iberian' && kind !== 'character') return getIberianPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'norse' && kind !== 'character') return getNorsePeriodFictionalEntries(period, kind, locationType)
  if (culture === 'icelandic' && kind !== 'character') return getIcelandicPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'ancient-greek' && kind !== 'character') return getAncientGreekPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'ancient-rome' && kind !== 'character') return getAncientRomePeriodFictionalEntries(period, kind, locationType)
  if (culture === 'egyptian' && kind !== 'character') return getEgyptianPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'celtic' && kind !== 'character') return getCelticPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'slavic-east' && kind !== 'character') return getSlavicEastPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'dutch-lowlands' && kind !== 'character') return getDutchLowlandsPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'roman-low-countries' && kind !== 'character') return getRomanLowCountriesFictionalEntries(period, kind, locationType)
  if (culture === 'early-slavic' && kind !== 'character') return getEarlySlavicFictionalEntries(period, kind, locationType)
  if (culture === 'baltic' && kind !== 'character') return getLithuanianPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'balkan' && kind !== 'character') return getSerbianPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'caucasus' && kind !== 'character') return getOssetianPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'japanese' && kind !== 'character') return getJapanesePeriodFictionalEntries(period, kind, locationType)
  if (culture === 'korean' && kind !== 'character') return getKoreanPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'mongolian' && kind !== 'character') return getMongolianPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'tibetan' && kind !== 'character') return getTibetanPeriodFictionalEntries(period, kind, locationType)
  if (culture === 'manchu' && kind !== 'character') return getManchuPeriodFictionalEntries(period, kind, locationType)
  // Location entries in the legacy packs are complete names, not morpheme
  // dictionaries. Splitting Falkenberg or Valcour in half creates malformed
  // hybrids, so locations now use the structured semantic grammar below.
  const cultureSpecific = kind === 'location' ? [] : buildCultureSpecificCombinations(culture, kind)
  const semantic = buildSemanticCatalogCombinations(culture, kind)
  // Once a culture has a sufficiently rich semantic vocabulary, prefer it
  // over the legacy three-head/three-tail fallback. This prevents old compact
  // combinations from dominating the first page of results.
  if (semantic.length >= 50) return [...new Set([...cultureSpecific, ...semantic])]
  const group = cultureCombinationGroups[culture]
  const definition = group ? catalogCombinationGroups[group][kind] : undefined
  if (!definition) return [...new Set([...cultureSpecific, ...semantic])]
  const singleLayer = definition.heads.flatMap(([displayHead, nativeHead]) => definition.tails.map(([displayTail, nativeTail]) => `${displayHead}${displayTail}|${nativeHead}${nativeTail}`))
  // A second term is only drawn from the same cultural template. This creates
  // fuller fictional names (for example, modifier + local root + local suffix)
  // without mixing cultures or inventing arbitrary syllables.
  const compoundLayer = definition.heads.flatMap(([displayModifier, nativeModifier], index) => definition.heads.filter((_, rootIndex) => rootIndex !== index).flatMap(([displayRoot, nativeRoot]) => definition.tails.map(([displayTail, nativeTail]) => `${displayModifier}${displayRoot}${displayTail}|${nativeModifier}${nativeRoot}${nativeTail}`)))
  const tripleLayer = definition.heads.flatMap(([displayFirst, nativeFirst], firstIndex) => definition.heads.filter((_, secondIndex) => secondIndex !== firstIndex).flatMap(([displaySecond, nativeSecond], secondIndex) => definition.heads.filter((_, thirdIndex) => thirdIndex !== firstIndex && thirdIndex !== secondIndex).flatMap(([displayThird, nativeThird]) => definition.tails.map(([displayTail, nativeTail]) => `${displayFirst}${displaySecond}${displayThird}${displayTail}|${nativeFirst}${nativeSecond}${nativeThird}${nativeTail}`))))
  const doubleTailLayer = definition.heads.flatMap(([displayFirst, nativeFirst], firstIndex) => definition.heads.filter((_, secondIndex) => secondIndex !== firstIndex).flatMap(([displaySecond, nativeSecond]) => definition.tails.flatMap(([displayTail, nativeTail], tailIndex) => definition.tails.filter((_, otherTailIndex) => otherTailIndex !== tailIndex).map(([displayOtherTail, nativeOtherTail]) => `${displayFirst}${displaySecond}${displayTail}${displayOtherTail}|${nativeFirst}${nativeSecond}${nativeTail}${nativeOtherTail}`))))
  return [...new Set([...cultureSpecific, ...semantic, ...singleLayer, ...compoundLayer, ...tripleLayer, ...doubleTailLayer])]
}

function seedOf(value: string) { let seed = 2166136261; for (const character of value) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619); return seed >>> 0 }
function random(seed: { value: number }, size: number) {
  seed.value = (seed.value + 0x6D2B79F5) >>> 0
  let mixed = seed.value
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1)
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
  return Math.floor((((mixed ^ (mixed >>> 14)) >>> 0) / 0x100000000) * size)
}
function shuffle<T>(items: T[], seed: { value: number }) { const result = [...items]; for (let i = result.length - 1; i > 0; i -= 1) { const j = random(seed, i + 1); [result[i], result[j]] = [result[j], result[i]] }; return result }
let generationSequence = 0

type CatalogSourceEntry = {
  rawName: string
  sourceClass: NonNullable<OfflineNameCandidate['sourceClass']>
  catalogTier?: 'complete' | 'composed'
}

function orderCatalogEntries(entries: CatalogSourceEntry[], mode: OfflineCatalogMode, seed: { value: number }, culture: OfflineCulture) {
  const seenDisplay = new Set<string>()
  const seenNative = new Set<string>()
  const uniqueEntries = entries.filter((entry) => {
    const [rawDisplay, rawNative = rawDisplay] = entry.rawName.split('|')
    const display = rawDisplay !== rawNative ? rawDisplay.replace(/·/g, '') : localizeCatalogName(rawNative, culture)
    if (seenDisplay.has(display) || seenNative.has(rawNative)) return false
    seenDisplay.add(display)
    seenNative.add(rawNative)
    return true
  })
  const specific = shuffle(uniqueEntries.filter((entry) => entry.sourceClass !== 'regional' && entry.sourceClass !== 'controlled'), seed)
  const regional = shuffle(uniqueEntries.filter((entry) => entry.sourceClass === 'regional'), seed)
  const complete = shuffle(uniqueEntries.filter((entry) => entry.sourceClass === 'controlled' && entry.catalogTier === 'complete'), seed)
  const composed = shuffle(uniqueEntries.filter((entry) => entry.sourceClass === 'controlled' && entry.catalogTier !== 'complete'), seed)
  const queues = mode === 'reference'
    ? [{ items: specific, take: 4 }, { items: regional, take: 1 }]
    : mode === 'fictional'
      ? [{ items: complete, take: 1 }, { items: composed, take: 2 }]
      : [{ items: specific, take: 2 }, { items: complete, take: 1 }, { items: composed, take: 1 }, { items: regional, take: 1 }]
  const ordered: CatalogSourceEntry[] = []
  while (queues.some((queue) => queue.items.length > 0)) {
    const block = queues.flatMap((queue) => queue.items.splice(0, queue.take))
    ordered.push(...shuffle(block, seed))
  }
  return ordered
}
function periodFor(config: CultureConfig, id: string) { return config.periods.find((period) => period.id === id) ?? config.periods[config.periods.length - 1] }
function cleanPeriodDisplayLabel(label: string) {
  return label.replace(/（([^（）]*)）/g, (full, inner: string) => {
    const hasDate = /(?:前|公元|\d+年|\d+世纪)/.test(inner)
    if (hasDate && /[，；;]/.test(inner)) return `（${inner.split(/[，；;]/)[0].trim()}）`
    if (!hasDate && /(?:考古|参照|资料|传说|文献|铭文|史书)/.test(inner)) return ''
    return full
  })
}
function cleanCultureDisplayLabel(label: string) {
  return label.replace(/资料包|通用参考/g, '').replace(/（\s*）/g, '').trim()
}
function titleMeaning(name: string) { return `按“${name}”的文化姓名资料生成；具体含义与家族、时代和人物设定有关` }
function catalogMeaning(name: string, kind: OfflineNameKind) {
  const labels: Record<OfflineNameKind, string> = { character: '人物', location: '地点', organization: '组织', item: '物品' }
  return `按“${name}”的${labels[kind]}命名语义生成；具体含义与所选文化、时代和作品设定有关`
}

const hiddenMergedCultureIds = new Set(['prehistoric-japan', 'early-korea'])

export function getOfflineCultures() {
  return Object.entries(cultures)
    .filter(([id]) => !hiddenMergedCultureIds.has(id))
    .map(([id, config]) => ({
      id: id as OfflineCulture,
      label: cleanCultureDisplayLabel(config.label),
      region: cultureRegions[id as OfflineCulture],
      periods: config.periods.map((period) => ({ ...period, label: cleanPeriodDisplayLabel(period.label) })),
    }))
}

const russianPatronymics: Record<string, { male: string; female: string }> = {
  Aleksandr: { male: 'Aleksandrovich', female: 'Aleksandrovna' }, Dmitri: { male: 'Dmitrievich', female: 'Dmitrievna' }, Mikhail: { male: 'Mikhailovich', female: 'Mikhailovna' }, Nikolai: { male: 'Nikolaevich', female: 'Nikolaevna' }, Sergei: { male: 'Sergeevich', female: 'Sergeevna' }, Viktor: { male: 'Viktorovich', female: 'Viktorovna' }, Yuri: { male: 'Yurievich', female: 'Yurievna' }, Pavel: { male: 'Pavlovich', female: 'Pavlovna' }, Ilya: { male: 'Ilyich', female: 'Ilyinichna' }, Andrei: { male: 'Andreevich', female: 'Andreevna' }, Fyodor: { male: 'Fyodorovich', female: 'Fyodorovna' }, Timofei: { male: 'Timofeevich', female: 'Timofeevna' },
}

const icelandicGenitives: Record<string, string> = {
  'Jón': 'Jóns', Gunnar: 'Gunnars', 'Magnús': 'Magnúsar', Einar: 'Einars', 'Ólafur': 'Ólafs', 'Björn': 'Björns', Arnar: 'Arnars',
  'Kristján': 'Kristjáns', Snorri: 'Snorra', Ari: 'Ara', Kjartan: 'Kjartans', Grettir: 'Grettis', Hrafn: 'Hrafns', Kolbeinn: 'Kolbeins', 'Þorvaldur': 'Þorvalds', Bjarni: 'Bjarna',
  'Njáll': 'Njáls', Egill: 'Egils', Leifur: 'Leifs', 'Skarphéðinn': 'Skarphéðins', 'Gísli': 'Gísla', 'Þorgeir': 'Þorgeirs', 'Hallfreður': 'Hallfreðar', Ketill: 'Ketils',
  Baldur: 'Baldurs', 'Hákon': 'Hákonar', 'Eiríkur': 'Eiríks', 'Guðmundur': 'Guðmundar', 'Sigurður': 'Sigurðar', 'Þórður': 'Þórðar', Andri: 'Andra', 'Kári': 'Kára',
}

const norsePatronymicStems: Record<string, string> = {
  Harald: 'Haralds', Hakon: 'Hakons', Olav: 'Olavs', Eirik: 'Eiriks', Sigurd: 'Sigurds', Halfdan: 'Halfdanar', Guttorm: 'Guttorms', Bjorn: 'Bjorns', Ragnvald: 'Ragnvalds', Torstein: 'Torsteins',
  Gudrod: 'Gudrods', Egil: 'Egils', Havard: 'Havards', Ulf: 'Ulfs', Einar: 'Einars', Arne: 'Arnes', Ketil: 'Ketils', Rolf: 'Rolfs', Trygve: 'Trygves', Erling: 'Erlings',
  Magnus: 'Magnus', Eystein: 'Eysteins', Inge: 'Inges', Sverre: 'Sverres', Knut: 'Knuts', Skule: 'Skules', Bard: 'Bards', Jon: 'Jons', Pal: 'Pals', Audun: 'Auduns', Hallvard: 'Hallvards', Torfinn: 'Torfinns', Erlend: 'Erlends',
}

const romanCognominaByPeriod: Record<string, string[]> = {
  republic: ['Cicero', 'Caesar', 'Cato', 'Brutus', 'Scipio', 'Gracchus', 'Sulla', 'Naso', 'Pulcher', 'Maximus', 'Verrucosus', 'Paullus'],
  empire: ['Caesar', 'Augustus', 'Germanicus', 'Drusus', 'Severus', 'Maximus', 'Felix', 'Rufus', 'Celsus', 'Nerva', 'Tacitus', 'Varus'],
}

function joinFamilyName(culture: OfflineCulture, family: string, given: string, period?: string) {
  if (culture === 'vietnamese' || culture === 'hungarian') return `${family} ${given}`
  if (culture === 'manchu' && period === 'modern') return `${family}${given}`
  if (culture === 'manchu') return `${family} ${given}`
  if (culture === 'chinese' || culture === 'japanese' || culture === 'korean') return `${family}${given}`
  return `${given} ${family}`
}

const lithuanianFemaleFamilyForms: Record<string, string> = {
  Radvila: 'Radvilaitė', Goštautas: 'Goštautaitė', Kęsgaila: 'Kęsgailaitė', Astikas: 'Astikaitė', Pacas: 'Pacaitė', Tiškevičius: 'Tiškevičiūtė', Valavičius: 'Valavičiūtė', Giedraitis: 'Giedraitytė', Alšėniškis: 'Alšėniškytė', Manvydas: 'Manvydaitė',
  Kazlauskas: 'Kazlauskaitė', Jankauskas: 'Jankauskaitė', Petrauskas: 'Petrauskaitė', Stankevičius: 'Stankevičiūtė', Vasiliauskas: 'Vasiliauskaitė', Žukauskas: 'Žukauskaitė', Butkus: 'Butkutė', Paulauskas: 'Paulauskaitė', Urbonas: 'Urbonaitė', Kavaliauskas: 'Kavaliauskaitė', Rimkus: 'Rimkutė', Ivanauskas: 'Ivanauskaitė', Balčiūnas: 'Balčiūnaitė', Navickas: 'Navickaitė', Savickas: 'Savickaitė', Baranauskas: 'Baranauskaitė', Mikalauskas: 'Mikalauskaitė', Žilinskas: 'Žilinskaitė', Ramanauskas: 'Ramanauskaitė', Lukoševičius: 'Lukoševičiūtė',
}

const serbianHistoricalPatronymics: Record<string, string> = {
  Stefan: 'Stefanović', Vukan: 'Vukanović', Uroš: 'Urošević', Dragutin: 'Dragutinović', Milutin: 'Milutinović', Dušan: 'Dušanović', Lazar: 'Lazarević', Vuk: 'Vuković', Branko: 'Branković', Đurađ: 'Đurđević', Radoslav: 'Radosavljević', Vladislav: 'Vladisavljević', Predislav: 'Predisavljević', Prvoslav: 'Prvosavljević', Dragoslav: 'Dragosavljević', Miroslav: 'Mirosavljević', Dobroslav: 'Dobrosavljević', Gradislav: 'Gradisavljević', Gojko: 'Gojković', Altoman: 'Altomanović', Nikola: 'Nikolić', Jovan: 'Jovanović', Konstantin: 'Konstantinović', Sava: 'Savić', Karađorđe: 'Karađorđević', Miloš: 'Milošević', Petar: 'Petrović', Aleksa: 'Aleksić', Jakov: 'Jakovljević', Matija: 'Matijević', Ilija: 'Ilić', Stanoje: 'Stanojević', Veljko: 'Veljković', Sima: 'Simić', Dositej: 'Dositejević', Stevan: 'Stevanović', Đorđe: 'Đorđević', Radovan: 'Radovanović', Milenko: 'Milenković', Luka: 'Lukić', Marko: 'Marković',
}

const ossetianFemaleFamilyForms: Record<string, string> = {
  Khetagurov: 'Khetagurova', Gagloyev: 'Gagloyeva', Tibilov: 'Tibilova', Sanakoyev: 'Sanakoyeva', Dzhioyev: 'Dzhioyeva', Pliev: 'Plieva', Kabisov: 'Kabisova', Tsarakhov: 'Tsarakhova', Dzagurov: 'Dzagurova', Kesaev: 'Kesaeva', Gazdanov: 'Gazdanova', Dzasokhov: 'Dzasokhova', Mamsurov: 'Mamsurova', Tedeyev: 'Tedeyeva', Totoonov: 'Totoonova', Kokoyev: 'Kokoyeva', Margiyev: 'Margiyeva', Valiyev: 'Valiyeva', Bitarov: 'Bitarova', Kaloyev: 'Kaloyeva',
}

const medievalLowlandsPatronymics = [
  { father: 'Jan', male: 'Janszoon', female: 'Jansdochter', maleDisplay: '扬松', femaleDisplay: '扬斯多赫特' },
  { father: 'Willem', male: 'Willemszoon', female: 'Willemsdochter', maleDisplay: '威廉松', femaleDisplay: '威廉斯多赫特' },
  { father: 'Pieter', male: 'Pieterszoon', female: 'Pietersdochter', maleDisplay: '彼得松', femaleDisplay: '彼得斯多赫特' },
  { father: 'Dirk', male: 'Dirkszoon', female: 'Dirksdochter', maleDisplay: '迪尔克松', femaleDisplay: '迪尔克斯多赫特' },
  { father: 'Hendrik', male: 'Hendrikszoon', female: 'Hendriksdochter', maleDisplay: '亨德里克松', femaleDisplay: '亨德里克斯多赫特' },
  { father: 'Claes', male: 'Claeszoon', female: 'Claesdochter', maleDisplay: '克拉斯松', femaleDisplay: '克拉斯多赫特' },
  { father: 'Jacob', male: 'Jacobszoon', female: 'Jacobsdochter', maleDisplay: '雅各布松', femaleDisplay: '雅各布斯多赫特' },
  { father: 'Gerrit', male: 'Gerritszoon', female: 'Gerritsdochter', maleDisplay: '赫里特松', femaleDisplay: '赫里特斯多赫特' },
  { father: 'Lambert', male: 'Lambertszoon', female: 'Lambertsdochter', maleDisplay: '兰贝特松', femaleDisplay: '兰贝特斯多赫特' },
  { father: 'Wouter', male: 'Wouterszoon', female: 'Woutersdochter', maleDisplay: '沃特松', femaleDisplay: '沃特斯多赫特' },
]
const medievalLowlandsOccupationalBynames = [
  { native: 'de Smit', display: '德·斯米特', meaning: '铁匠别称' },
  { native: 'de Wever', display: '德·韦弗', meaning: '织工别称' },
  { native: 'de Bakker', display: '德·巴克尔', meaning: '面包师别称' },
  { native: 'de Visser', display: '德·菲瑟', meaning: '渔夫别称' },
  { native: 'de Brouwer', display: '德·布劳沃', meaning: '酿酒师别称' },
  { native: 'de Timmerman', display: '德·蒂默曼', meaning: '木匠别称' },
  { native: 'de Kuiper', display: '德·克伊珀', meaning: '箍桶匠别称' },
  { native: 'de Mulder', display: '德·穆尔德尔', meaning: '磨坊主别称' },
  { native: 'de Schipper', display: '德·斯希珀', meaning: '船主别称' },
  { native: 'de Volder', display: '德·福尔德尔', meaning: '缩绒工别称' },
]

const earlySoutheastAsianCultures = new Set<OfflineCulture>([
  'dong-son-au-lac', 'sa-huynh-champa', 'funan-chenla', 'pyu-city-states',
  'dvaravati-mon', 'old-malay-srivijaya', 'old-javanese-medang', 'old-bali',
])
const ancientExpansionCultures = new Set<OfflineCulture>(ancientExpansionCultureIds)
const mergedEarlyEastAsianPeriods = new Set([
  'japanese|yayoi', 'japanese|kofun-yamato',
  'korean|gojoseon', 'korean|buyeo-samhan',
])
const archaeologicalOnlyPersonPeriods = new Set([
  'chinese|paleolithic-reference', 'chinese|neolithic-reference', 'chinese|xia-erlitou',
  'japanese|jomon', 'korean|jeulmun-mumun',
  'dong-son-au-lac|archaeological', 'sa-huynh-champa|sa-huynh', 'dvaravati-mon|dvaravati',
  'old-malay-srivijaya|kedah', 'old-bali|pejeng',
  ...ancientArchaeologicalPersonPeriodKeys,
])

function buildPersonPool(options: OfflineNameOptions, seed: { value: number }) {
  const config = cultures[options.culture]
  const configuredPeriodGiven = [
    ...(periodGivenNames[options.culture]?.[options.period] ?? []),
    ...(expandedPeriodGivenNames[options.culture]?.[options.period] ?? []),
  ]
  // Some historical/period packs intentionally start with a small curated
  // list. Supplement only those small packs with the culture's general name
  // pool; this keeps the selected period primary while preventing a catalog
  // from stopping at a few dozen entries.
  const periodGiven = configuredPeriodGiven.length < 50 && !ancientExpansionCultures.has(options.culture) && !['chinese', 'india-north', 'india-south', 'bengali', 'marathi-gujarati', 'english', 'french', 'german', 'italian', 'iberian', 'norse', 'icelandic', 'ancient-greek', 'ancient-rome', 'egyptian', 'celtic', 'slavic-east', 'dutch-lowlands', 'roman-low-countries', 'early-slavic', 'baltic', 'balkan', 'caucasus', 'japanese', 'korean', 'mongolian', 'tibetan', 'manchu', 'filipino', 'dong-son-au-lac', 'sa-huynh-champa', 'funan-chenla', 'pyu-city-states', 'dvaravati-mon', 'old-malay-srivijaya', 'old-javanese-medang', 'old-bali'].includes(options.culture)
    ? [...configuredPeriodGiven, ...cultures[options.culture].given]
    : configuredPeriodGiven
  const availableGiven = periodGiven.length ? periodGiven : config.given
  const given = shuffle(availableGiven.filter((item) => !options.gender || options.gender === 'any' || !item.gender || item.gender === 'any' || item.gender === options.gender), seed)
  const surname = options.surname?.trim()
  const periodFamilies = periodFamilyNames[options.culture]?.[options.period]
  const familyFirst = options.culture === 'chinese' || options.culture === 'japanese' || options.culture === 'korean' || options.culture === 'vietnamese' || options.culture === 'hungarian' || options.culture === 'manchu'
  if (options.culture === 'chinese' && ['paleolithic-reference', 'neolithic-reference', 'xia-erlitou'].includes(options.period)) return []
  if (archaeologicalOnlyPersonPeriods.has(`${options.culture}|${options.period}`)) return []
  if (earlySoutheastAsianCultures.has(options.culture) || ancientExpansionCultures.has(options.culture) || mergedEarlyEastAsianPeriods.has(`${options.culture}|${options.period}`)) {
    return given.map((item) => ({
      item,
      name: item.name,
      components: `该时期文献或碑铭可核对的个人名、王名或名号（${item.name}）；不添加现代固定姓氏`,
      pattern: '保留史料中的完整形式；不跨文化补名，不套用现代东南亚姓名结构',
      reading: item.reading,
    }))
  }
  if (options.culture === 'chinese' && ['shang-western-zhou', 'eastern-zhou'].includes(options.period)) {
    return given.map((item) => ({ item, name: item.name, components: `实证个人名或史籍称谓（${item.name}）；不套用后世固定姓氏`, pattern: '个人名、氏族/国族标识或称谓；具体结构随文献语境而定', reading: item.reading }))
  }
  if ((options.culture === 'india-north' && ['vedic-mahajanapada', 'maurya-gupta'].includes(options.period))
    || (options.culture === 'india-south' && ['sangam-satavahana', 'early-kingdoms'].includes(options.period))
    || (options.culture === 'bengali' && options.period === 'vanga-gauda')
    || (options.culture === 'marathi-gujarati' && options.period === 'satavahana-western-deccan')) {
    return given.map((item) => ({ item, name: item.name, components: `该时期史料所见个人名或王号成分（${item.name}）；不添加现代社群姓氏`, pattern: '个人名 + 可选父名、母名、族属、出生地或王号；不使用现代固定姓氏', reading: item.reading }))
  }
  if (options.culture === 'tibetan') {
    return given.map((item) => ({ item, name: item.name, components: '个人名（通常无固定家族姓）', pattern: '单名或双名；宗教名/尊称按语境使用', reading: item.reading }))
  }
  if (options.culture === 'thai' && options.period === 'traditional') {
    return given.map((item) => ({ item, name: item.name, components: '个人名（传统时期通常无现代式固定姓氏）', pattern: '个人名 + 尊称/头衔（按语境）', reading: item.reading }))
  }
  if (options.culture === 'mongolian') {
    if (!['socialist', 'modern'].includes(options.period)) {
      const families = shuffle(periodFamilies?.length ? periodFamilies : config.surnames, seed)
      return given.flatMap((item) => families.map((familyDatum) => {
        const family = surname || familyDatum.name
        return { item, name: `${family} ${item.name}`, components: `氏族/部属（${family}）+ 本名（${item.name}）`, pattern: '氏族或部属标识 + 本名；氏族不是现代固定姓氏', reading: item.reading }
      }))
    }
    const parents = shuffle(availableGiven.filter((item) => item.gender === 'male'), seed)
    return given.flatMap((item) => parents.map((parent) => ({ item, name: `${surname || parent.name} ${item.name}`, components: `父名（${surname || parent.name}）+ 本名（${item.name}）`, pattern: '父名 + 本名；不按固定欧洲家族姓处理', reading: item.reading })))
  }
  if (options.culture === 'manchu' && options.period !== 'modern') {
    const families = shuffle(periodFamilies?.length ? periodFamilies : config.surnames, seed)
    return given.flatMap((item) => families.map((familyDatum) => {
      const family = surname || familyDatum.name
      return { item, name: `${family} ${item.name}`, components: `哈拉/氏族（${family}）+ 本名（${item.name}）`, pattern: '哈拉或氏族 + 本名；按所选时期使用对应氏族', reading: item.reading }
    }))
  }
  if (options.culture === 'celtic' && options.period === 'early-medieval') {
    const parents = shuffle(availableGiven.filter((item) => item.gender === 'male'), seed)
    return given.flatMap((item) => parents.map((parent) => {
      const connector = item.gender === 'female' ? 'ingen' : 'mac'
      return { item, name: `${item.name} ${connector} ${parent.name}`, components: `个人名（${item.name}）+ ${connector === 'mac' ? '父名标识 mac' : '父名标识 ingen'}（${parent.name}）`, pattern: '早期爱尔兰个人名 + 父名标识；不是现代固定姓氏', reading: item.reading }
    }))
  }
  if (options.culture === 'celtic' && options.period === 'ogham') {
    return given.map((item) => ({ item, name: item.name, components: `欧甘铭文所见个人名形式（${item.name}）；铭文常用屈折形式`, pattern: '铭文实证个人名；不添加 Ó、Mac 或现代固定姓氏', reading: item.reading }))
  }
  if (options.culture === 'roman-low-countries') {
    return given.map((item) => ({ item, name: item.name, components: `罗马时期莱茵河下游文献或铭文姓名（${item.name}）`, pattern: '本地单名或罗马化姓名；不添加荷兰固定姓氏', reading: item.reading }))
  }
  if (options.culture === 'early-slavic') {
    return given.map((item) => ({ item, name: item.name, components: `6—8世纪希腊语或拉丁语史料记录的个人名（${item.name}）`, pattern: '早期斯拉夫个人名；不添加基辅罗斯父名或现代东斯拉夫姓氏', reading: item.reading }))
  }
  if (options.culture === 'slavic-east' && options.period === 'medieval') {
    return given.map((item) => ({ item, name: item.name, components: '鲁塞尼亚个人名；不强制套用现代固定家族姓（父名、领地称号或排行按具体人物语境添加）', pattern: '中世纪个人名；不强制套用现代固定家族姓', reading: item.reading }))
  }
  if (options.culture === 'dutch-lowlands' && options.period === 'medieval') {
    if (surname) return given.map((item) => ({ item, name: `${item.name} ${surname}`, components: `个人名（${item.name}）+ 用户指定历史别称/出处称号（${surname}）；不视为现代固定家族姓`, pattern: '中世纪低地个人名 + 历史别称或出处称号', reading: item.reading }))
    const origins = periodFamilies ?? []
    return given.flatMap((item, index) => {
      const patronymic = medievalLowlandsPatronymics[index % medievalLowlandsPatronymics.length]
      const patronymicNative = item.gender === 'female' ? patronymic.female : patronymic.male
      const patronymicDisplay = item.gender === 'female' ? patronymic.femaleDisplay : patronymic.maleDisplay
      const occupation = medievalLowlandsOccupationalBynames[index % medievalLowlandsOccupationalBynames.length]
      const origin = origins[index % origins.length]
      const displayGiven = localizeFullName(item.name, options.culture)
      return [
        { item, name: `${item.name} ${patronymicNative}`, displayName: `${displayGiven}·${patronymicDisplay}`, components: `个人名（${item.name}）+ 父名（${patronymic.father}之子/女）；不是固定家族姓`, pattern: '中世纪低地个人名 + 父名', reading: item.reading },
        { item, name: `${item.name} ${occupation.native}`, displayName: `${displayGiven}·${occupation.display}`, components: `个人名（${item.name}）+ ${occupation.meaning}（${occupation.native}）；不是固定家族姓`, pattern: '中世纪低地个人名 + 职业别称', reading: item.reading },
        ...(origin ? [{ item, name: `${item.name} ${origin.name}`, components: `个人名（${item.name}）+ 出处称号（${origin.name}）；不是固定家族姓`, pattern: '中世纪低地个人名 + 出处称号', reading: item.reading }] : []),
      ]
    })
  }
  if (options.culture === 'vietnamese' && (options.period === 'dynastic' || options.period === 'colonial') && !surname) {
    const completeNames = shuffle([
      ...(expandedPeriodGivenNames.vietnamese?.[options.period] ?? []),
    ], seed)
    return completeNames.map((item) => ({
      item,
      name: item.name,
      components: `越南历史档案姓名（${item.name}）`,
      pattern: '按历史档案保留原有姓名形式与空格，不额外拼接姓氏',
      reading: item.reading,
    }))
  }
  if (options.culture === 'russian-siberian') {
    const families = shuffle(periodFamilies?.length ? periodFamilies : config.surnames, seed)
    const fathers = shuffle(availableGiven.filter((item) => item.gender === 'male'), seed)
    return given.flatMap((item, index) => fathers.map((father, fatherIndex) => {
      const patronymic = russianPatronymics[father.name]?.[item.gender === 'female' ? 'female' : 'male'] ?? `${father.name}${item.gender === 'female' ? 'ovna' : 'ovich'}`
      const family = surname || families[(index + fatherIndex) % families.length].name
      return { item, name: `${item.name} ${patronymic} ${family}`, components: `名（${item.name}）+ 父称（${patronymic}）+ 家族姓（${family}）`, pattern: config.structure, reading: item.reading }
    }))
  }
  if (options.culture === 'egyptian' && options.period === 'modern' && periodFamilies?.length) {
    const families = shuffle(periodFamilies, seed)
    const fathers = shuffle(availableGiven, seed)
    return given.flatMap((item, index) => fathers.map((father, parentIndex) => { const family = surname || families[(index + parentIndex) % families.length].name; return { item, name: `${item.name} ${father.name} ${family}`, components: `名（${item.name}）+ 父名（${father.name}）+ 家族姓（${family}）`, pattern: '名 + 父名 + 家族姓', reading: item.reading } }))
  }
  if (options.culture === 'baltic' && options.period === 'medieval') {
    return given.map((item) => ({ item, name: item.name, components: `中世纪立陶宛个人名（${item.name}）`, pattern: '个人名；不强制套用后世固定家族姓', reading: item.reading }))
  }
  if (options.culture === 'baltic' && periodFamilies?.length) {
    const families = shuffle(periodFamilies, seed)
    return given.flatMap((item) => families.map((familyDatum) => {
      const baseFamily = surname || familyDatum.name
      const family = item.gender === 'female' ? lithuanianFemaleFamilyForms[baseFamily] ?? baseFamily : baseFamily
      return { item, name: `${item.name} ${family}`, components: `名（${item.name}）+ 立陶宛家族姓（${family}）`, pattern: '名 + 具有性别形式的立陶宛家族姓', reading: item.reading }
    }))
  }
  if (options.culture === 'balkan' && options.period !== 'modern') {
    if (surname) return given.map((item) => ({ item, name: `${item.name} ${surname}`, components: `个人名（${item.name}）+ 用户指定父名式称谓/历史别称（${surname}）；不视为现代固定家族姓`, pattern: '塞尔维亚个人名 + 父名式称谓或历史别称', reading: item.reading }))
    const fathers = shuffle(availableGiven.filter((item) => item.gender === 'male'), seed)
    return given.flatMap((item) => fathers.flatMap((father) => {
      const patronymic = serbianHistoricalPatronymics[father.name]
      if (!patronymic) return []
      return [{ item, name: `${item.name} ${patronymic}`, components: `个人名（${item.name}）+ 父名式称谓（${father.name}之子女：${patronymic}）；不是现代固定家族姓`, pattern: options.period === 'medieval' ? '中世纪塞尔维亚个人名 + 父名式称谓' : '奥斯曼统治与革命时期塞尔维亚个人名 + 父名式称谓/别称', reading: item.reading }]
    }))
  }
  if (options.culture === 'caucasus' && options.period === 'alanian') {
    return given.map((item) => surname
      ? ({ item, name: `${item.name} ${surname}`, components: `阿兰史料名或奥塞梯版纳尔特角色名（${item.name}）+ 用户指定历史称号（${surname}）；不视为固定家族姓；不套用后世俄语化固定家族姓`, pattern: '阿兰史料名/奥塞梯版纳尔特角色名 + 可选历史称号', reading: item.reading })
      : ({ item, name: item.name, components: `阿兰史料名或奥塞梯版纳尔特角色名（${item.name}）；不套用后世俄语化固定家族姓`, pattern: '单一名称；不套用后世俄语化固定家族姓', reading: item.reading }))
  }
  if (options.culture === 'caucasus' && periodFamilies?.length) {
    const families = shuffle(periodFamilies, seed)
    return given.flatMap((item) => families.map((familyDatum) => {
      const baseFamily = surname || familyDatum.name
      const family = item.gender === 'female' ? ossetianFemaleFamilyForms[baseFamily] ?? baseFamily : baseFamily
      return { item, name: `${item.name} ${family}`, components: `名（${item.name}）+ 奥塞梯家族姓（${family}）`, pattern: '名 + 具有性别形式的奥塞梯家族姓', reading: item.reading }
    }))
  }
  if (options.culture === 'malay') {
    const parents = shuffle(availableGiven.filter((item) => item.gender === 'male'), seed)
    return given.flatMap((item) => parents.map((parent) => { const parentName = surname || parent.name; const connector = item.gender === 'female' ? 'binti' : 'bin'; return { item, name: `${item.name} ${connector} ${parentName}`, components: `名（${item.name}）+ ${connector} + 父名（${parentName}）`, pattern: '名 + bin/binti + 父名', reading: item.reading } }))
  }
  if (options.culture === 'amharic') {
    const parents = shuffle(availableGiven.filter((item) => item.gender === 'male'), seed)
    return given.flatMap((item) => parents.map((parent) => { const parentName = surname || parent.name; return { item, name: `${item.name} ${parentName}`, components: `名（${item.name}）+ 父名（${parentName}）`, pattern: '名 + 父名', reading: item.reading } }))
  }
  if (options.culture === 'somali') {
    const fathers = shuffle(availableGiven.filter((item) => item.gender === 'male'), seed)
    return given.flatMap((item, index) => fathers.flatMap((father, fatherIndex) => {
      const grandfather = fathers[(index + fatherIndex + 1) % fathers.length]
      if (!grandfather || grandfather.name === father.name) return []
      return [{ item, name: `${item.name} ${surname || father.name} ${grandfather.name}`, components: `本名（${item.name}）+ 父名（${surname || father.name}）+ 祖父名（${grandfather.name}）`, pattern: '本名 + 父名 + 祖父名；无 son/dóttir 后缀', reading: item.reading }]
    }))
  }
  if (periodFamilies?.length && options.culture !== 'chinese' && options.culture !== 'iberian' && options.culture !== 'ancient-rome') {
    const families = shuffle(periodFamilies, seed)
    return given.flatMap((item) => families.map((familyDatum) => {
      const family = surname || familyDatum.name
      const name = joinFamilyName(options.culture, family, item.name, options.period)
      return { item, name, components: familyFirst ? `姓（${family}）+ 名（${item.name}）` : `名（${item.name}）+ 家族姓（${family}）`, pattern: familyFirst ? '姓 + 名' : '名 + 固定家族姓', reading: item.reading }
    }))
  }
  if (config.patronymic) {
    const parents = shuffle(availableGiven.filter((item) => item.gender === 'male'), seed).slice(0, Math.max(8, given.length))
    return given.flatMap((item) => parents.map((parentDatum) => {
      const parent = surname || parentDatum.name
      const female = item.gender === 'female'
      const patronymic = options.culture === 'icelandic'
        ? `${icelandicGenitives[parent] ?? `${parent}s`}${female ? 'dóttir' : 'son'}`
        : options.culture === 'norse'
          ? `${norsePatronymicStems[parent] ?? `${parent}s`}${female ? 'dóttir' : 'son'}`
          : `${parent}${female ? 'sdóttir' : 'sson'}`
      return { item, name: `${item.name} ${patronymic}`, components: `名 + 父名的属格形式（${patronymic}）`, pattern: config.structure, reading: item.reading }
    }))
  }
  if (options.culture === 'ancient-rome') {
    const clans = shuffle(periodFamilies?.length ? periodFamilies : config.surnames, seed)
    const cognomina = romanCognominaByPeriod[options.period] ?? romanCognominaByPeriod.empire
    return given.flatMap((item, index) => {
      const isFemale = item.gender === 'female'
      if (isFemale) return ['Maior', 'Minor', 'Prima', 'Secunda'].map((distinction) => ({ item, name: `${item.name} ${distinction}`, components: `氏族女性名 + 区别名（${distinction}）`, pattern: '氏族女性名 + 区别名', reading: item.reading }))
      return clans.map((familyDatum, familyIndex) => {
        const family = surname || familyDatum.name
        const branch = cognomina[(index + familyIndex) % cognomina.length]
        return { item, name: `${item.name} ${family} ${branch}`, components: `本名（${item.name}）+ 氏族名（${family}）+ 家族支系名（${branch}）`, pattern: config.structure, reading: item.reading }
      })
    })
  }
  if (options.culture === 'iberian') {
    const families = shuffle(periodFamilies?.length ? periodFamilies : config.surnames, seed)
    return given.flatMap((item) => families.map((firstDatum, index) => {
      const first = surname || firstDatum.name
      if (options.period !== 'modern') return { item, name: `${item.name} ${first}`, components: `名（${item.name}）+ 家族/地缘姓（${first}）`, pattern: '历史时期使用单一家族或地缘姓；不强制现代双姓', reading: item.reading }
      const second = families[(index + 7) % families.length].name
      return { item, name: `${item.name} ${first} ${second}`, components: `名（${item.name}）+ 父姓（${first}）+ 母姓（${second}）`, pattern: config.structure, reading: item.reading }
    }))
  }
  if (options.culture === 'filipino') {
    if (options.period === 'precolonial') return given.map((item) => ({ item, name: item.name, components: `前殖民时期个人名或史料所见名号（${item.name}）；不添加西班牙式家族姓`, pattern: '个人名或名号；不套用殖民时期双姓结构', reading: item.reading }))
    const family = shuffle(config.surnames, seed); return given.flatMap((item) => family.map((firstDatum, index) => { const first = surname || firstDatum.name; const second = family[(index + 7) % family.length].name; return { item, name: `${item.name} ${first} ${second}`, components: `名（${item.name}）+ 中间姓（${first}）+ 家族姓（${second}）`, pattern: config.structure, reading: item.reading } }))
  }
  if (!config.surnames.length) return given.map((item) => ({ item, name: item.name, components: config.structure, pattern: config.structure, reading: item.reading }))
  const families = shuffle(periodFamilies?.length ? periodFamilies : config.surnames, seed)
  return given.flatMap((item) => families.map((familyDatum) => { const family = surname || familyDatum.name; const name = joinFamilyName(options.culture, family, item.name, options.period); return { item, name, components: familyFirst ? `姓（${family}）+ 名（${item.name}）` : `${config.structure}（${family}）`, pattern: config.structure, reading: item.reading } }))
}

export function generateOfflineNames(options: OfflineNameOptions): OfflineNameCandidate[] {
  // Keep the public generator useful for larger catalog views.  The UI still
  // requests small batches, while audits and the name browser can inspect the
  // complete per-culture pool without silently truncating it at 30 entries.
  const count = Math.max(1, Math.min(100, Math.round(options.count ?? 10)))
  const config = cultures[options.culture] ?? cultures.chinese
  const period = periodFor(config, options.period)
  const catalogMode = options.catalogMode ?? 'mixed'
  const excluded = new Set((options.exclude ?? []).map((value) => value.trim()).filter(Boolean))
  generationSequence = (generationSequence + 1) >>> 0
  const seed = { value: seedOf(`${options.kind}|${options.culture}|${options.period}|${options.gender ?? 'any'}|${options.locationType ?? ''}|${Date.now()}|${generationSequence}`) }
  const catalogKind = options.kind === 'character' ? undefined : options.kind
  const normalizedOptions = options.period === period.id ? options : { ...options, period: period.id }
  const referenceNames = catalogKind ? collectReferenceEntries(options.culture, catalogKind, period.id) : []
  const completeFictionalNames = catalogKind ? getCompleteFictionalCatalog(options.culture, catalogKind, options.locationType, period.id) : []
  const completeFictionalSet = new Set(completeFictionalNames)
  const composedFictionalNames = catalogKind ? buildCatalogCombinations(options.culture, catalogKind, period.id, options.locationType).filter((name) => !completeFictionalSet.has(name)) : []
  const fictionalNames: CatalogSourceEntry[] = [
    ...completeFictionalNames.map((rawName) => ({ rawName, sourceClass: 'controlled' as const, catalogTier: 'complete' as const })),
    ...composedFictionalNames.map((rawName) => ({ rawName, sourceClass: 'controlled' as const, catalogTier: 'composed' as const })),
  ]
  const nonPersonNames = catalogMode === 'reference'
    ? referenceNames
    : catalogMode === 'fictional'
      ? fictionalNames
      : [...referenceNames, ...fictionalNames]
  const orderedNonPersonNames = orderCatalogEntries(nonPersonNames, catalogMode, seed, options.culture)
  const pool = options.kind === 'character' ? buildPersonPool(normalizedOptions, seed) : orderedNonPersonNames.map(({ rawName, sourceClass }) => {
    const [displayName, nativeName] = rawName.split('|')
    return { name: nativeName ?? rawName, displayName: nativeName ? displayName : undefined, components: sourceClass === 'controlled' ? '符合所选文化语义的架空资料' : sourceClass === 'regional' ? '同文化区的真实参考资料' : '与所选文化、时期匹配的真实参考资料', pattern: sourceClass === 'controlled' ? '受控架空构词' : sourceClass === 'regional' ? '文化区参考资料目录' : '参考资料目录', item: person(nativeName ?? rawName), reading: undefined, sourceClass }
  })
  const results: OfflineNameCandidate[] = []
  const orderedPool = options.kind === 'character' ? shuffle(pool, seed) : pool
  for (const built of orderedPool) {
    const nativeName = built.name
    const rawDisplayName = (built as { displayName?: string }).displayName ?? (options.kind === 'character' ? localizeFullName(nativeName, options.culture) : localizeCatalogName(nativeName, options.culture))
    const displayName = options.kind === 'character' ? rawDisplayName : rawDisplayName.replace(/·/g, '')
    if (excluded.has(nativeName) || excluded.has(displayName) || results.some((item) => item.name === displayName || item.nativeName === nativeName)) continue
    const meaning = options.kind === 'character' ? built.item.meaning ?? titleMeaning(nativeName) : catalogMeaning(displayName, options.kind)
    results.push({ id: crypto.randomUUID(), name: displayName, nativeName, kind: options.kind, culture: options.culture, cultureLabel: cleanCultureDisplayLabel(config.label), period: period.id, periodLabel: cleanPeriodDisplayLabel(period.label), gender: options.gender ?? 'any', meaning, pattern: built.pattern, ...(built.reading ? { reading: built.reading } : {}), components: built.components, sourceClass: catalogMode === 'fictional' ? 'controlled' : (built as { sourceClass?: OfflineNameCandidate['sourceClass'] }).sourceClass ?? (period.id === 'modern' ? 'modern' : config.sourceClass), createdAt: Date.now() })
    if (results.length === count) break
  }
  return results
}

// Version 5 stores a Chinese display name and the original local-script name
// separately; older candidates do not contain enough information to migrate.
export async function loadOfflineNameCandidates(projectId: string): Promise<OfflineNameCandidate[]> {
  try {
    const items = await webGet<OfflineNameCandidate[]>('offlineNames', projectId) ?? []
    if (!Array.isArray(items)) return []
    const normalized = items.slice(0, 200).filter((item) => item.sourceClass !== 'regional' && !['japanese', 'korean', 'iberian', 'norse', 'icelandic', 'ancient-greek', 'ancient-rome', 'egyptian', 'celtic', 'slavic-east', 'dutch-lowlands', 'roman-low-countries', 'early-slavic', 'mongolian', 'tibetan', 'manchu'].includes(item.culture)).map((item) => {
      const displayLabels = { ...item, cultureLabel: cleanCultureDisplayLabel(item.cultureLabel), periodLabel: cleanPeriodDisplayLabel(item.periodLabel) }
      if (item.kind === 'character' || (!/[A-Za-z]/.test(item.name) && !item.name.includes('·'))) return displayLabels
      const name = localizeCatalogName(item.nativeName || item.name, item.culture)
      const meaning = /[A-Za-z]/.test(item.meaning || '') ? catalogMeaning(name, item.kind) : item.meaning
      return { ...displayLabels, name, meaning }
    })
    if (JSON.stringify(normalized) !== JSON.stringify(items.slice(0, 200))) await webPut('offlineNames', projectId, normalized, { projectId, updatedAt: Date.now() })
    return normalized
  } catch {
    return []
  }
}
export function saveOfflineNameCandidates(projectId: string, candidates: OfflineNameCandidate[]) {
  return webPut('offlineNames', projectId, candidates.slice(0, 200), { projectId, updatedAt: Date.now() })
}
