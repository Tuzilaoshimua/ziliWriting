export type AncientExpansionCulture = keyof typeof ancientCultureConfigs

type Gender = 'any' | 'female' | 'male'
type Person = { name: string; gender?: Gender; meaning?: string }
type Period = { id: string; label: string; personData?: 'archaeological' }
type ReferenceCatalog = { location: string[]; organization: string[]; item: string[] }
type FictionalProfile = {
  modifiers: string[]
  location: Record<'settlement' | 'region' | 'fortress' | 'natural', string[]>
  organization: string[]
  item: string[]
}

const person = (name: string, gender: Gender = 'any', meaning?: string): Person => ({ name, gender, meaning })
const sexed = (male: string[], female: string[]) => [
  ...male.map((name) => person(name, 'male')),
  ...female.map((name) => person(name, 'female')),
]
const period = (id: string, label: string, personData?: 'archaeological'): Period => ({ id, label, ...(personData ? { personData } : {}) })

export const ancientCultureConfigs = {
  mesopotamia: { label: '两河流域（苏美尔—巴比伦）', periods: [period('sumer-akkad', '苏美尔—阿卡德（约前3500—前2000年）'), period('old-babylon', '乌尔第三王朝—古巴比伦（约前2112—前1595年）'), period('neo-assyria-babylon', '新亚述—新巴比伦（前911—前539年）')], surnames: [], given: [], structure: '使用楔形文字文献所见完整人名；不套现代阿拉伯、亚述或犹太姓氏', sourceClass: 'historical' as const },
  'bronze-iron-anatolia': { label: '古安纳托利亚（赫梯—吕底亚）', periods: [period('hittite-luwian', '赫梯—卢维亚（约前1650—前700年）'), period('phrygia-lydia-urartu', '弗里吉亚—吕底亚—乌拉尔图（约前1200—前546年）')], surnames: [], given: [], structure: '使用王室档案、碑铭与钱币所见名号；各语言传统不互相补名', sourceClass: 'historical' as const },
  'ancient-levant': { label: '古代黎凡特（乌加里特—腓尼基）', periods: [period('ugarit-canaan', '乌加里特—青铜时代迦南（约前1600—前1200年）'), period('phoenician-aramaean', '腓尼基—阿拉米城邦（约前1200—前300年）')], surnames: [], given: [], structure: '使用乌加里特、腓尼基或阿拉米碑铭完整人名；不投射现代民族姓氏', sourceClass: 'historical' as const },
  'iranian-central-asia': { label: '古代中亚伊朗语文化（塞种—粟特）', periods: [period('saka-bactria', '塞种—巴克特里亚（约前700—公元300年）'), period('sogdia-khwarazm', '粟特—花剌子模（约300—900年）')], surnames: [], given: [], structure: '使用希腊、波斯、汉文及本地文书所见人名；不套现代中亚民族姓氏', sourceClass: 'historical' as const },
  'nubia-kush': { label: '尼罗河中上游（克尔玛—库施）', periods: [period('kerma', '克尔玛文化（约前2500—前1500年，考古参考）', 'archaeological'), period('napata', '纳帕塔库施（约前900—前270年）'), period('meroe', '麦罗埃库施（约前270—公元350年）')], surnames: [], given: [], structure: '克尔玛层不生成人名；库施时期使用埃及文或麦罗埃文所见王名', sourceClass: 'historical' as const },
  'aksum-horn': { label: '非洲之角（德阿马特—阿克苏姆）', periods: [period('dmt', '德阿马特与前阿克苏姆时期（约前800—前400年）'), period('aksum', '阿克苏姆王国（约100—900年）')], surnames: [], given: [], structure: '使用南阿拉伯文、吉兹文、希腊文碑铭与钱币所见名号；未完整标元音的早期铭文名保留辅音骨架释读', sourceClass: 'historical' as const },
  'early-britain': { label: '早期不列颠（铁器时代—盎格鲁-撒克逊）', periods: [period('iron-age-britain', '铁器时代不列颠（约前800—公元43年）'), period('roman-britain', '罗马不列颠（43—410年）'), period('anglo-saxon', '盎格鲁-撒克逊英格兰（约450—1066年）')], surnames: [], given: [], structure: '按时期使用布立吞、罗马化或古英语完整姓名；不添加现代英格兰姓氏', sourceClass: 'historical' as const },
  'gaul-franks': { label: '高卢—法兰克', periods: [period('gaul', '古高卢（约前600—前50年）'), period('gallo-roman', '高卢罗马时期（约前50—公元500年）'), period('merovingian-carolingian', '墨洛温—加洛林时期（约500—987年）')], surnames: [], given: [], structure: '使用铭文、古典文献或编年史完整人名；不添加现代法国姓氏', sourceClass: 'historical' as const },
  'ancient-germanic': { label: '早期日耳曼文化区', periods: [period('germanic-iron-age', '日耳曼铁器时代（约前500—公元400年）'), period('migration-age', '民族迁徙时期日耳曼诸部（约400—750年）')], surnames: [], given: [], structure: '使用古典文献、铭文与早期史书所见个人名；不套现代德语姓氏', sourceClass: 'historical' as const },
  'etruscan-italic': { label: '古意大利（伊特鲁里亚—意大利诸族）', periods: [period('etruscan', '伊特鲁里亚城邦（约前800—前100年）'), period('italic-peoples', '拉丁、萨宾、萨莫奈等意大利诸族（约前800—前300年）')], surnames: [], given: [], structure: '使用碑铭与古典文献所见个人名、氏族名组合；不套现代意大利姓氏', sourceClass: 'historical' as const },
  'prehistoric-japan': { label: '日本列岛（绳文—古坟）', periods: [period('jomon', '绳文时代（约前14000—前900年，考古参考）', 'archaeological'), period('yayoi', '弥生时代（约前900—公元250年）'), period('kofun-yamato', '古坟—早期大和（约250—592年）')], surnames: [], given: [], structure: '绳文层不生成人名；弥生末至古坟期仅使用汉文史籍、铭文和早期王名', sourceClass: 'historical' as const },
  'early-korea': { label: '朝鲜半岛（栉文—古朝鲜与扶余）', periods: [period('jeulmun-mumun', '栉文—无文陶器时代（约前8000—前300年，考古参考）', 'archaeological'), period('gojoseon', '古朝鲜与卫满朝鲜（约前4—前1世纪）'), period('buyeo-samhan', '扶余、沃沮、东濊与三韩（约前2—公元3世纪；部分名号见后世史书传说）')], surnames: [], given: [], structure: '考古层不生成人名；历史层只用汉文史籍所见名号，后世传说人物按文献传统保留，不套后世韩式姓氏', sourceClass: 'historical' as const },
  'indus-valley': { label: '印度河文明（哈拉帕文化）', periods: [period('early-harappan', '早期哈拉帕（约前3300—前2600年，考古参考）', 'archaeological'), period('mature-harappan', '成熟哈拉帕（约前2600—前1900年，考古参考）', 'archaeological')], surnames: [], given: [], structure: '印度河文字尚未释读，不生成个人姓名', sourceClass: 'historical' as const },
  'gandhara-kushan': { label: '西北南亚（犍陀罗—贵霜）', periods: [period('achaemenid-gandhara', '阿契美尼德治下犍陀罗（约前550—前327年）'), period('indo-greek', '印度—希腊诸王国（约前200—公元10年）'), period('kushan', '贵霜帝国（约30—375年）')], surnames: [], given: [], structure: '使用阿拉米文、希腊文、佉卢文与钱币所见完整名号', sourceClass: 'historical' as const },
  'mesoamerican-formative': { label: '中美洲早期文明（奥尔梅克—特奥蒂瓦坎）', periods: [period('olmec', '奥尔梅克文明（约前1500—前400年，考古参考）', 'archaeological'), period('zapotec', '早期萨波特克与蒙特阿尔班（约前700—公元900年，考古参考）', 'archaeological'), period('teotihuacan', '特奥蒂瓦坎（约前100—公元550年，考古参考）', 'archaeological')], surnames: [], given: [], structure: '统治者姓名尚不能可靠读取，只提供考古地点、社会结构和器物', sourceClass: 'historical' as const },
  'preinca-andes': { label: '前印加安第斯（卡拉尔—奇穆）', periods: [period('caral', '卡拉尔—北小圣地（约前3000—前1800年，考古参考）', 'archaeological'), period('chavin', '查文文化（约前900—前200年，考古参考）', 'archaeological'), period('moche-nazca', '莫切—纳斯卡（约100—800年，考古参考）', 'archaeological'), period('wari-tiwanaku', '瓦里—蒂瓦纳科（约500—1000年，考古参考）', 'archaeological'), period('chimu', '奇穆王国（约900—1470年）')], surnames: [], given: [], structure: '无可读姓名时期不生成人物；奇穆期仅用殖民初期记载保存的王名', sourceClass: 'historical' as const },
  'lapita-pacific': { label: '早期太平洋（拉皮塔—波利尼西亚定居）', periods: [period('lapita', '拉皮塔文化（约前1600—前500年，考古参考）', 'archaeological'), period('early-polynesian-settlement', '早期波利尼西亚定居（约前500—公元1000年，考古参考）', 'archaeological')], surnames: [], given: [], structure: '考古阶段不将后世口传谱系倒推为同期姓名', sourceClass: 'historical' as const },
}

export const ancientCultureRegions: Record<keyof typeof ancientCultureConfigs, string> = {
  mesopotamia: '西亚与高加索', 'bronze-iron-anatolia': '西亚与高加索', 'ancient-levant': '西亚与高加索', 'iranian-central-asia': '北亚与中亚',
  'nubia-kush': '非洲', 'aksum-horn': '非洲', 'early-britain': '欧洲', 'gaul-franks': '欧洲', 'ancient-germanic': '欧洲', 'etruscan-italic': '欧洲',
  'prehistoric-japan': '东亚', 'early-korea': '东亚', 'indus-valley': '南亚', 'gandhara-kushan': '南亚',
  'mesoamerican-formative': '中美洲', 'preinca-andes': '南美洲', 'lapita-pacific': '大洋洲',
}

export const ancientPeriodGivenNames: Record<string, Record<string, Person[]>> = {
  mesopotamia: {
    'sumer-akkad': sexed(['Enmebaragesi', 'Gilgamesh', 'Lugalzagesi', 'Sargon', 'Rimush', 'Manishtushu', 'Naram-Sin', 'Gudea', 'Ur-Nammu', 'Shulgi'], ['Puabi', 'Enheduanna', 'Kubaba', 'Tashlultum', 'Baranamtarra', 'Ninalla']),
    'old-babylon': sexed(['Ishbi-Erra', 'Lipit-Ishtar', 'Hammurabi', 'Samsu-iluna', 'Zimri-Lim', 'Shamshi-Adad', 'Yasmah-Addu', 'Rim-Sin', 'Warad-Sin', 'Ammisaduqa'], ['Shibtu', 'Kirum', 'Iltani', 'Beltani', 'Lamassi', 'Taram-Uram']),
    'neo-assyria-babylon': sexed(['Ashurnasirpal', 'Shalmaneser', 'Tiglath-pileser', 'Sargon II', 'Sennacherib', 'Esarhaddon', 'Ashurbanipal', 'Nabopolassar', 'Nebuchadnezzar', 'Nabonidus'], ['Sammu-ramat', 'Naqi’a', 'Zakutu', 'Nitocris', 'Adad-guppi', 'Libbali-sharrat']),
  },
  'bronze-iron-anatolia': {
    'hittite-luwian': sexed(['Hattusili', 'Mursili', 'Suppiluliuma', 'Tudhaliya', 'Arnuwanda', 'Telepinu', 'Kurunta', 'Kupanta-Kurunta', 'Tarkasnawa', 'Warpalawa'], ['Puduhepa', 'Tawananna', 'Danuhepa', 'Asmunikal', 'Manapa-Tarhunta']),
    'phrygia-lydia-urartu': sexed(['Midas', 'Gordias', 'Gyges', 'Alyattes', 'Croesus', 'Aramu', 'Sarduri', 'Menua', 'Argishti', 'Rusa'], ['Midasia', 'Nana', 'Aryenis', 'Tushpaia']),
  },
  'ancient-levant': {
    'ugarit-canaan': sexed(['Niqmaddu', 'Ammittamru', 'Ibiranu', 'Abdi-Heba', 'Rib-Hadda', 'Yapahu', 'Milkilu', 'Biridiya', 'Labaya', 'Shipti-Baal'], ['Ahinoam']),
    'phoenician-aramaean': sexed(['Hiram', 'Ethbaal', 'Baal-Eser', 'Mattan', 'Eshmunazar', 'Tabnit', 'Bodashtart', 'Kilamuwa', 'Bar-Rakib', 'Panamuwa'], ['Jezebel', 'Batnoam']),
  },
  'iranian-central-asia': {
    'saka-bactria': sexed(['Skunxa', 'Amorges', 'Spitamenes', 'Oxyartes', 'Diodotus', 'Euthydemus', 'Demetrius', 'Eucratides', 'Heliocles', 'Maues'], ['Tomyris', 'Roxana', 'Apama', 'Agathokleia']),
    'sogdia-khwarazm': sexed(['Devashtich', 'Ghurak', 'Tarkhun', 'Varkhuman', 'Nanai-vandak', 'An Lushan', 'Kang Senghui', 'Afrigh', 'Askajamuk', 'Shaushafar'], ['Mugh Lady', 'Chaghanian Lady', 'Nanaivandak', 'Roxana']),
  },
  'nubia-kush': {
    kerma: [],
    napata: sexed(['Alara', 'Kashta', 'Piye', 'Shabaka', 'Shebitku', 'Taharqa', 'Tantamani', 'Aspelta', 'Anlamani', 'Aramatle-qo'], ['Pabatma', 'Abar', 'Peksater', 'Amanirenas']),
    meroe: sexed(['Arkamani', 'Adikhalamani', 'Natakamani', 'Amanakhareqerem', 'Tarekeniwal', 'Teqorideamani'], ['Amanishakheto', 'Amanitore', 'Amanirenas', 'Shanakdakhete', 'Amanikhatashan']),
  },
  'aksum-horn': {
    dmt: sexed(['Waran Haywat', 'RDM', 'SMR'], []),
    aksum: sexed(['Zoskales', 'Endubis', 'Aphilas', 'Wazeba', 'Ousanas', 'Ezana', 'Kaleb', 'Armah', 'Gersem', 'Israel'], ['Sofya', 'Admas', 'Makeda']),
  },
  'early-britain': {
    'iron-age-britain': sexed(['Cassivellaunus', 'Tasciovanus', 'Cunobelinus', 'Caratacus', 'Togodumnus', 'Verica', 'Tincomarus', 'Dubnovellaunus', 'Eppillus'], ['Boudica', 'Cartimandua']),
    'roman-britain': sexed(['Tiberius Claudius Cogidubnus', 'Gaius Julius Alpinus Classicianus', 'Marcus Minicius Natalis', 'Carausius', 'Allectus', 'Magnus Maximus', 'Pelagius', 'Lucius Artorius Castus'], ['Claudia Severa', 'Sulpicia Lepidina', 'Regina', 'Julia Victorina']),
    'anglo-saxon': sexed(['Aethelberht', 'Raedwald', 'Edwin', 'Oswald', 'Penda', 'Offa', 'Alfred', 'Athelstan', 'Edgar', 'Cnut'], ['Aethelflaed', 'Eadgifu', 'Ealhswith', 'Aelfthryth', 'Hild', 'Cynethryth']),
  },
  'gaul-franks': {
    gaul: sexed(['Vercingetorix', 'Ambiorix', 'Dumnorix', 'Diviciacus', 'Orgetorix', 'Brennus', 'Bituitus', 'Casticus', 'Correus', 'Sedullos'], ['Eponina', 'Camulogenia', 'Boudicca']),
    'gallo-roman': sexed(['Gaius Julius Vindex', 'Eumenius', 'Ausonius', 'Sidonius Apollinaris', 'Paulinus of Nola', 'Germanus of Auxerre', 'Hilary of Poitiers', 'Martin of Tours'], ['Eucheria', 'Eulalia', 'Proba', 'Avita']),
    'merovingian-carolingian': sexed(['Clovis', 'Chlothar', 'Childebert', 'Dagobert', 'Pepin', 'Charles Martel', 'Charlemagne', 'Louis the Pious', 'Lothair', 'Hugh Capet'], ['Clotilde', 'Brunhilda', 'Fredegund', 'Bertrada', 'Gisela', 'Dhuoda']),
  },
  'ancient-germanic': {
    'germanic-iron-age': sexed(['Ariovistus', 'Arminius', 'Maroboduus', 'Segestes', 'Inguiomerus', 'Catualda', 'Vibilius', 'Mallovendus', 'Civilis'], ['Thusnelda', 'Veleda', 'Ganna', 'Albruna']),
    'migration-age': sexed(['Alaric', 'Theodoric', 'Geiseric', 'Odoacer', 'Wulfila', 'Chlodio', 'Genobaud', 'Radagaisus', 'Gundobad', 'Theodemir'], ['Amalasuntha', 'Galla Placidia', 'Audofleda', 'Ragnagild', 'Erelieva']),
  },
  'etruscan-italic': {
    etruscan: sexed(['Larth', 'Vel', 'Aule', 'Arnth', 'Avile Tite', 'Thefarie Velianas', 'Larth Porsenna', 'Caile Vipinas', 'Aule Metelis', 'Spurinna'], ['Tanaquil', 'Ramtha', 'Larthia', 'Thanchvil', 'Seianti']),
    'italic-peoples': sexed(['Titus Tatius', 'Attius Clausus', 'Gaius Pontius', 'Herennius Bassus', 'Vettius Scato', 'Marius Egnatius', 'Quintus Poppaedius Silo', 'Herius Asinius'], ['Hersilia', 'Tarpeia', 'Vibia', 'Polla']),
  },
  'prehistoric-japan': {
    jomon: [],
    yayoi: sexed(['Suisho', 'Mimaki-iri-hiko', 'Ikume-iri-hiko', 'Nakatsuhiko'], ['Himiko', 'Iyo']),
    'kofun-yamato': sexed(['Homuda Wake', 'Oasazuma Wakugo', 'Ohohatsuse Wakatakeru', 'Wohatsuse Wakasazaki', 'Keitai', 'Kinmei', 'Soga no Iname', 'Mononobe no Okoshi'], ['Iwa no Hime', 'Sotoori Hime', 'Kasuga no Iratsume', 'Princess Tashiraka']),
  },
  'early-korea': {
    'jeulmun-mumun': [],
    gojoseon: sexed(['Wiman', 'Ugeo', 'Yeok Gye-gyeong', 'Bu', 'Jun'], []),
    'buyeo-samhan': sexed(['Haemosu', 'Geumwa', 'Daeso', 'Wutae', 'Gutae', 'Suro', 'Talhae', 'Jumong'], ['Yuhwa', 'Soseono', 'Heo Hwang-ok']),
  },
  'indus-valley': { 'early-harappan': [], 'mature-harappan': [] },
  'gandhara-kushan': {
    'achaemenid-gandhara': sexed(['Pukkusati', 'Taxiles', 'Ambhi', 'Astes', 'Arsakes', 'Bagadata', 'Mazakes'], []),
    'indo-greek': sexed(['Demetrius', 'Apollodotus', 'Menander', 'Antialcidas', 'Agathocles', 'Pantaleon', 'Heliocles', 'Strato', 'Amyntas', 'Hermaeus'], ['Agathokleia', 'Calliope', 'Berenike']),
    kushan: sexed(['Kujula Kadphises', 'Vima Takto', 'Vima Kadphises', 'Kanishka', 'Huvishka', 'Vasudeva', 'Kipunada'], []),
  },
  'mesoamerican-formative': { olmec: [], zapotec: [], teotihuacan: [] },
  'preinca-andes': {
    caral: [], chavin: [], 'moche-nazca': [], 'wari-tiwanaku': [],
    chimu: sexed(['Tacaynamo', 'Guacricaur', 'Naucempinco', 'Minchancaman', 'Chumun Caur'], []),
  },
  'lapita-pacific': { lapita: [], 'early-polynesian-settlement': [] },
}

export const ancientExpansionCultureIds = Object.keys(ancientCultureConfigs) as AncientExpansionCulture[]
export const ancientArchaeologicalPersonPeriodKeys = Object.entries(ancientCultureConfigs).flatMap(([culture, config]) => config.periods.filter((entry) => entry.personData === 'archaeological').map((entry) => `${culture}|${entry.id}`))

const reference = (location: string[], organization: string[], item: string[]): ReferenceCatalog => ({ location, organization, item })

export const ancientPeriodReferenceCatalogs: Record<string, Record<string, ReferenceCatalog>> = {
  mesopotamia: {
    'sumer-akkad': reference(
      ['乌鲁克|Uruk', '乌尔|Ur', '拉格什|Lagash', '尼普尔|Nippur', '基什|Kish', '埃利都|Eridu', '乌玛|Umma', '阿达卜|Adab', '阿卡德|Akkad', '吉尔苏|Girsu'],
      ['乌鲁克城邦神庙机构|Uruk temple household', '拉格什王宫机构|Lagash palace household', '尼普尔恩利尔祭司团|Enlil priesthood at Nippur', '苏美尔城邦公民大会|Sumerian civic assembly', '阿卡德王廷|Akkadian royal court', '楔形文字书记学校|cuneiform scribal school', '神庙土地管理机构|temple estate administration', '运河营建劳役群体|canal labour corps', '远程贸易商人群体|long-distance merchants', '青铜工匠作坊|bronze workers workshop'],
      ['乌鲁克泥板文书|Uruk clay tablet', '滚筒印章|cylinder seal', '楔形文字芦苇笔|cuneiform reed stylus', '乌尔王陵竖琴|lyre from Royal Cemetery of Ur', '秃鹫碑|Stele of the Vultures', '阿卡德国王铜头像|Akkadian royal copper head', '金青石珠饰|gold and lapis jewellery', '轮制陶罐|wheel-made pottery jar', '青铜嵌銎斧|socketed bronze axe', '沥青芦苇舟构件|bitumen-coated reed boat fitting'],
    ),
    'old-babylon': reference(
      ['乌尔|Ur', '伊辛|Isin', '拉尔萨|Larsa', '巴比伦|Babylon', '马里|Mari', '埃什努纳|Eshnunna', '西帕尔|Sippar', '尼普尔|Nippur', '苏萨|Susa', '阿苏尔|Assur'],
      ['乌尔第三王朝王廷|Ur III royal court', '伊辛王廷|Isin court', '拉尔萨王廷|Larsa court', '巴比伦王廷|Babylonian court', '马里王宫档案机构|Mari palace archive', '沙玛什神庙祭司团|Shamash temple priesthood', '商人投资合伙群体|tamkarum merchant partnership', '楔形文字书记学校|edubba scribal school', '运河与田赋管理机构|canal and field administration', '城门司法会议|city-gate court'],
      ['乌尔纳姆法典泥板|Law Code of Ur-Nammu tablet', '汉谟拉比法典碑|Code of Hammurabi stele', '马里书信泥板|Mari letter tablet', '古巴比伦数学泥板|Old Babylonian mathematical tablet', '西帕尔圆筒印章|Sippar cylinder seal', '青铜镰刀|bronze sickle', '银称量锭|weighed silver ingot', '陶制契约封套|clay contract envelope', '羊毛织物卷|wool textile roll', '运河测量绳|canal survey rope'],
    ),
    'neo-assyria-babylon': reference(
      ['尼姆鲁德|Nimrud', '尼尼微|Nineveh', '杜尔舍鲁金|Dur-Sharrukin', '阿苏尔|Assur', '阿尔贝拉|Arbela', '巴比伦|Babylon', '博尔西帕|Borsippa', '乌鲁克|Uruk', '西帕尔|Sippar', '哈兰|Harran'],
      ['新亚述王廷|Neo-Assyrian royal court', '亚述常备军|Assyrian standing army', '王家驿传系统|royal relay system', '尼尼微王家图书馆|Royal Library of Nineveh', '伊什塔尔神庙祭司团|Ishtar temple priesthood', '新巴比伦王廷|Neo-Babylonian court', '埃萨吉拉神庙机构|Esagila temple household', '巴比伦城墙营建群体|Babylon wall builders', '帝国行省总督机构|imperial provincial administration', '王家占卜师团|royal diviners'],
      ['拉马苏守门神像|lamassu guardian statue', '亚述宫殿浮雕|Assyrian palace relief', '棱柱形王家铭文|royal annal prism', '铁制复合弓箭头|iron arrowhead', '攻城槌包铜构件|bronze siege-engine fitting', '伊什塔尔门釉砖|Ishtar Gate glazed brick', '新巴比伦星历泥板|Babylonian astronomical tablet', '楔形文字词表|cuneiform lexical tablet', '圆筒印章|cylinder seal', '银舍客勒砝码|silver shekel weight'],
    ),
  },
  'early-britain': {
    'iron-age-britain': reference(
      ['梅登城堡|Maiden Castle', '丹伯里|Danebury', '斯坦威|Stanway', '卡姆洛杜努姆|Camulodunum', '卡图维劳尼领地|Catuvellauni Territory', '布里甘特领地|Brigantian Territory', '费什伯恩|Fishbourne', '格拉斯顿伯里湖村|Glastonbury Lake Village', '亨吉斯特伯里角|Hengistbury Head', '泰晤士河谷|Thames Valley'],
      ['布立吞部族王权|Brittonic tribal kingship', '山丘堡共同体|hillfort community', '战车武士随从团|chariot-warrior retinue', '德鲁伊祭司群体|druidic priesthood', '卡图维劳尼王廷|Catuvellauni court', '特里诺文特长老会|Trinovantian elders', '布里甘特王廷|Brigantian court', '铁匠群体|ironworking artisans', '海峡贸易商人群体|Channel traders', '农牧聚落共同体|agro-pastoral community'],
      ['铁制长剑|iron longsword', '镜面青铜圆镜|decorated bronze mirror', '布立吞金币|Brittonic gold stater', '珊瑚嵌饰盾牌|coral-inlaid shield fitting', '战车轮毂|chariot wheel hub', '环形胸针|penannular brooch', '铁制镰刀|iron sickle', '玻璃手镯|glass bracelet', '陶制盐罐|ceramic salt container', '拉坦诺纹剑鞘|La Tene decorated scabbard'],
    ),
    'roman-britain': reference(
      ['伦迪尼乌姆|Londinium', '埃博拉库姆|Eboracum', '卡姆洛杜努姆|Camulodunum', '阿奎苏利斯|Aquae Sulis', '维鲁拉米乌姆|Verulamium', '文多兰达|Vindolanda', '哈德良长城|Hadrians Wall', '伊斯卡奥古斯塔|Isca Augusta', '科里尼乌姆|Corinium', '费什伯恩宫|Fishbourne Palace'],
      ['不列颠总督府|Roman provincial administration', '第二奥古斯塔军团|Legio II Augusta', '第六胜利军团|Legio VI Victrix', '文多兰达驻军|Vindolanda garrison', '伦迪尼乌姆市议会|Londinium civic council', '苏利斯密涅瓦神庙祭司团|Sulis Minerva priesthood', '商人同业会|merchant collegium', '浴场管理机构|bathhouse administration', '边墙辅助军团|frontier auxiliary cohort', '庄园农场共同体|villa estate household'],
      ['文多兰达木牍|Vindolanda tablet', '罗马不列颠胸针|Romano-British brooch', '诅咒铅片|curse tablet', '军团瓦片印记|legionary stamped tile', '萨米安陶碗|Samian ware bowl', '骑兵面罩头盔|cavalry face-mask helmet', '哈德良长城里程碑|Hadrianic milestone', '青铜密涅瓦像|bronze Minerva figurine', '银第纳尔|silver denarius', '铁制锁子甲环|iron mail ring'],
    ),
    'anglo-saxon': reference(
      ['萨顿胡|Sutton Hoo', '坎特伯雷|Canterbury', '温彻斯特|Winchester', '约克|York', '伦敦维克|Lundenwic', '雷普顿|Repton', '惠特比|Whitby', '林迪斯法恩|Lindisfarne', '坦沃思|Tamworth', '贝班堡|Bamburgh'],
      ['肯特王廷|Kentish royal court', '东盎格利亚王廷|East Anglian court', '麦西亚王廷|Mercian court', '威塞克斯王廷|West Saxon court', '国王贤人会议|Witan', '修道院书写室|monastic scriptorium', '贵族侍从团|thegnly retinue', '郡长行政机构|shire administration', '城堡守备群体|burh garrison', '铸币工匠群体|moneyers'],
      ['萨顿胡头盔|Sutton Hoo helmet', '盎格鲁-撒克逊圆盾|Anglo-Saxon round shield', '金石榴石肩扣|gold garnet shoulder clasp', '林迪斯法恩福音书|Lindisfarne Gospels', '符文骨盒|Franks Casket', '铁制塞克斯短刀|seax', '盘形胸针|disc brooch', '银便士|silver penny', '羊皮法典|parchment codex', '骨制织梳|bone weaving comb'],
    ),
  },
  'gaul-franks': {
    gaul: reference(
      ['比布拉克特|Bibracte', '阿莱西亚|Alesia', '格尔戈维亚|Gergovia', '马纳欣|Manching', '恩特勒蒙|Entremont', '纳罗马尔图斯|Nemetocenna', '卢格杜努姆丘陵|Lugdunum Hill', '阿瓦里库姆|Avaricum', '维苏恩纳|Vesunna', '罗讷河谷|Rhone Valley'],
      ['阿维尔尼部族议会|Arverni tribal council', '爱杜依贵族会|Aedui aristocratic council', '高卢战士随从团|Gallic warrior retinue', '德鲁伊祭司群体|druidic priesthood', '奥皮杜姆共同体|oppidum community', '铸币工匠群体|coin minting artisans', '铁匠群体|ironworking artisans', '盐铁商人群体|salt and iron traders', '部族骑兵团|tribal cavalry', '圣林祭仪共同体|sacred-grove ritual community'],
      ['高卢金币|Gallic gold stater', '拉坦诺纹长剑|La Tene sword', '铁制长盾包边|iron shield binding', '青铜号角|carnyx war trumpet', '扭绳金颈环|gold torc', '珊瑚胸针|coral fibula', '双耳酒罐|wine amphora', '铁制农具|iron agricultural tool', '玻璃手镯|glass bracelet', '雕纹剑鞘|decorated scabbard'],
    ),
    'gallo-roman': reference(
      ['卢格杜努姆|Lugdunum', '卢泰西亚|Lutetia', '尼姆|Nemausus', '奥古斯托杜努姆|Augustodunum', '阿雷拉特|Arelate', '特里尔|Augusta Treverorum', '波尔多|Burdigala', '桑特|Mediolanum Santonum', '维埃纳|Vienna', '兰斯|Durocortorum'],
      ['高卢行省总督府|Gallic provincial administration', '卢格杜努姆高卢大会|Council of the Gauls', '罗马军团驻军|Roman legionary garrison', '帝国崇拜祭司团|imperial cult priesthood', '城市市议会|municipal curia', '陶器工匠同业会|potters collegium', '河运船夫公会|river boatmen guild', '基督教主教团|early Christian episcopate', '税吏机构|tax administration', '庄园家庭机构|villa estate household'],
      ['高卢萨米安陶器|Gaulish terra sigillata', '卢格杜努姆祭坛铭文|Lugdunum altar inscription', '罗马高卢马赛克|Gallo-Roman mosaic', '青铜墨丘利像|bronze Mercury figurine', '玻璃酒瓶|glass wine flask', '军团腰带扣|military belt fitting', '石制里程碑|stone milestone', '银第纳尔|silver denarius', '骨制发簪|bone hairpin', '基督教石棺浮雕|Christian sarcophagus relief'],
    ),
    'merovingian-carolingian': reference(
      ['巴黎|Paris', '苏瓦松|Soissons', '兰斯|Reims', '梅斯|Metz', '图尔|Tours', '亚琛|Aachen', '圣但尼|Saint-Denis', '兰斯修道院区|Reims Monastic Quarter', '普吕姆|Prum', '科尔比|Corbie'],
      ['墨洛温王廷|Merovingian royal court', '法兰克贵族侍从团|Frankish noble retinue', '宫相府|mayor of the palace household', '加洛林王廷|Carolingian royal court', '王家教堂|palatine chapel', '修道院书写室|monastic scriptorium', '伯爵行政机构|comital administration', '王家使节团|missi dominici', '主教座堂参事会|cathedral chapter', '庄园劳役共同体|manorial labour community'],
      ['墨洛温金三分币|Merovingian gold tremissis', '法兰克投掷斧|francisca axe', '环首剑|ring-pommel sword', '金石榴石扣饰|garnet cloisonne buckle', '加洛林小写体手稿|Carolingian minuscule manuscript', '王家敕令羊皮卷|royal capitulary parchment', '银便士|silver denier', '圣髑盒|reliquary casket', '铁制马镫|iron stirrup', '福音书象牙封面|ivory Gospel cover'],
    ),
  },
  'ancient-germanic': {
    'germanic-iron-age': reference(
      ['托尔斯贝格沼泽|Thorsberg Moor', '尼达姆沼泽|Nydam Bog', '伊勒鲁普奥达尔|Illerup Adal', '希奥尔特斯普林|Hjortspring', '古丹麦半岛|Jutland', '易北河流域|Elbe Basin', '威悉河流域|Weser Basin', '莱茵河右岸|Right Bank of Rhine', '图林根盆地|Thuringian Basin', '波罗的海沿岸|Baltic Coast'],
      ['部族大会|tribal thing assembly', '战士随从团|warrior comitatus', '亲族共同体|kinship community', '圣沼祭仪群体|sacred-bog ritual community', '铁匠群体|ironworking artisans', '琥珀商人群体|amber traders', '农牧聚落共同体|agro-pastoral community', '船只营建群体|boat builders', '部族骑兵团|tribal cavalry', '预言祭司群体|seer-priest community'],
      ['尼达姆船|Nydam boat', '希奥尔特斯普林舟|Hjortspring boat', '单刃铁剑|single-edged iron sword', '木质圆盾|wooden round shield', '扭绳颈环|twisted neck ring', '符文梳|runic comb', '铁制矛头|iron spearhead', '琥珀珠串|amber bead necklace', '角制饮器|horn drinking vessel', '沼泽献祭腰带|bog-offering belt fitting'],
    ),
    'migration-age': reference(
      ['乌普萨拉古丘|Gamla Uppsala', '古德梅|Gudme', '蒂索|Tisso', '索斯马拉|Sosdala', '彼得罗阿萨|Pietroasa', '阿奎莱亚|Aquileia', '图卢兹|Toulouse', '拉文纳|Ravenna', '迦太基|Carthage', '多瑙河中游|Middle Danube'],
      ['哥特王廷|Gothic royal court', '汪达尔王廷|Vandal royal court', '勃艮第王廷|Burgundian court', '战士随从团|warrior comitatus', '部族大会|tribal assembly', '阿里乌派主教团|Arian episcopate', '王家骑兵团|royal cavalry', '金匠工坊|goldsmith workshop', '迁徙车队共同体|migrant wagon community', '罗马化行政机构|Romanized court administration'],
      ['金制鹰形胸针|gold eagle fibula', '石榴石扣饰|garnet cloisonne buckle', '环首剑|ring-pommel sword', '铁制骑枪|iron cavalry lance', '彼得罗阿萨金器|Pietroasa gold treasure', '哥特银币|Gothic silver coin', '符文金角|runic gold horn', '骨制梳|bone comb', '玻璃高脚杯|glass beaker', '马具金饰|gilded horse-harness fitting'],
    ),
  },
  'etruscan-italic': {
    etruscan: reference(
      ['塔尔奎尼亚|Tarquinia', '凯雷|Caere', '维伊|Veii', '武尔奇|Vulci', '沃尔西尼|Volsinii', '丘西|Clusium', '波普洛尼亚|Populonia', '佩鲁贾|Perusia', '科尔托纳|Cortona', '马尔扎博托|Marzabotto'],
      ['伊特鲁里亚城邦贵族会|Etruscan city aristocracy', '卢库莫王廷|lucumo court', '占卜祭司团|haruspex priesthood', '十二城邦同盟会议|Etruscan League council', '墓葬营建工匠团|tomb builders', '青铜工匠群体|bronze artisans', '陶器工匠群体|bucchero potters', '海商群体|maritime merchants', '铸币机构|city mint', '圣地祭仪共同体|sanctuary community'],
      ['伊特鲁里亚黑陶杯|Etruscan bucchero cup', '皮亚琴察铜肝|Liver of Piacenza', '刻铭铜镜|inscribed bronze mirror', '彩绘墓室壁画|painted tomb mural', '金制颗粒工艺胸饰|granulated gold pectoral', '青铜三足鼎|bronze tripod', '伊特鲁里亚字母碑|Etruscan inscription', '陶制屋脊神像|terracotta roof figure', '铁制矛头|iron spearhead', '银制钱币|silver coin'],
    ),
    'italic-peoples': reference(
      ['库迈|Cumae', '普拉埃内斯特|Praeneste', '提沃利|Tibur', '阿尔巴隆加地区|Alban Hills', '萨宾山区|Sabine Hills', '博维亚努姆|Bovianum', '科菲尼乌姆|Corfinium', '拉里努姆|Larinum', '诺拉|Nola', '卡普阿|Capua'],
      ['拉丁同盟会议|Latin League council', '萨宾部族共同体|Sabine tribal community', '萨莫奈部族联盟|Samnite confederation', '奥斯坎文书记群体|Oscan scribes', '城市元老会|city senate', '战士誓盟团|warrior oath-band', '神庙祭司团|temple priesthood', '山地牧民共同体|upland pastoral community', '青铜工匠群体|bronze artisans', '市场商人群体|market traders'],
      ['奥斯坎文青铜板|Oscan bronze tablet', '伊古维乌姆铜板|Iguvine Tablets', '萨莫奈圆盾|Samnite shield', '意大利式胸甲|Italic bronze cuirass', '铁制标枪|iron javelin', '青铜头盔|bronze helmet', '黑釉陶杯|black-gloss cup', '奉献小铜像|votive bronze figurine', '石制界碑|stone boundary marker', '银制钱币|silver coin'],
    ),
  },
  'prehistoric-japan': {
    jomon: reference(
      ['三内丸山遗址|Sannai Maruyama', '大平山元遗址|Odai Yamamoto', '尖石遗址|Togariishi', '龟冈遗址|Kamegaoka', '是川遗址|Korekawa', '大汤环状列石|Oyu Stone Circles', '加曾利贝冢|Kasori Shell Mound', '鸟滨贝冢|Torihama Shell Mound', '真胁遗址|Mawaki', '伊势堂岱遗址|Isedotai'],
      ['竖穴聚落共同体|pit-house settlement community', '贝冢营建共同体|shell-midden community', '漆器工匠群体|lacquer artisans', '石器工匠群体|stone-tool artisans', '土偶制作群体|dogu makers', '渔猎共同体|fishing and hunting community', '坚果加工共同体|nut-processing community', '环状列石祭仪群体|stone-circle ritual community', '远程黑曜石交换网络|obsidian exchange network', '丸木舟营建群体|dugout-canoe builders'],
      ['火焰形陶器|flame-style pottery', '遮光器土偶|goggle-eyed dogu', '磨制石斧|ground stone axe', '骨角鱼钩|bone fishhook', '漆涂木弓|lacquered wooden bow', '石制箭头|stone arrowhead', '贝制手镯|shell bracelet', '编织篮残片|woven basket fragment', '磨石与石皿|grinding stone set', '丸木舟|dugout canoe'],
    ),
    yayoi: reference(
      ['吉野里遗址|Yoshinogari', '登吕遗址|Toro', '唐古键遗址|Karako-Kagi', '池上曾根遗址|Ikegami Sone', '菜畑遗址|Nabatake', '板付遗址|Itazuke', '纒向遗址|Makimuku', '原之辻遗址|Harunotsuji', '妻木晚田遗址|Mukibanda', '荒神谷遗址|Kojindani'],
      ['环壕聚落共同体|moated settlement community', '水田稻作共同体|paddy-farming community', '青铜器铸造群体|bronze-casting artisans', '铁器工匠群体|ironworking artisans', '高床仓储管理群体|raised-granary community', '海峡交换网络|strait exchange network', '魏志所记倭国使团|Wa diplomatic mission', '邪马台国政治共同体|Yamatai polity', '墓葬营建共同体|burial community', '纺织工匠群体|weaving artisans'],
      ['弥生陶壶|Yayoi pottery jar', '铜铎|dotaku bronze bell', '广形铜矛|broad bronze spearhead', '铜剑|bronze sword', '铁制锄刃|iron hoe blade', '木制农具|wooden agricultural tool', '高床仓库柱材|raised-granary post', '玻璃勾玉|glass magatama', '纺轮|spindle whorl', '内行花文镜|TLV mirror'],
    ),
    'kofun-yamato': reference(
      ['大仙陵古坟|Daisen Kofun', '誉田御庙山古坟|Konda Gobyoyama Kofun', '箸墓古坟|Hashihaka Kofun', '石舞台古坟|Ishibutai Kofun', '稻荷山古坟|Inariyama Kofun', '江田船山古坟|Eta Funayama Kofun', '藤之木古坟|Fujinoki Kofun', '今城冢古坟|Imashirozuka Kofun', '纒向|Makimuku', '飞鸟|Asuka'],
      ['大和王权|Yamato kingship', '大王近侍集团|Great King retinue', '物部氏军事集团|Mononobe military group', '苏我氏家政集团|Soga household', '部民共同体|be occupational group', '屯仓管理机构|miyake granary administration', '渡来人技术群体|immigrant artisan community', '埴轮工匠群体|haniwa artisans', '古坟营建劳役群体|kofun construction labour', '王家外交使团|royal diplomatic mission'],
      ['稻荷山铁剑|Inariyama iron sword', '江田船山大刀|Eta Funayama sword', '人物埴轮|figure haniwa', '圆筒埴轮|cylindrical haniwa', '三角缘神兽镜|triangular-rimmed deity mirror', '金铜冠|gilt-bronze crown', '马具金饰|gilt horse-harness fitting', '须惠器|Sue ware vessel', '直弧文盾形埴轮|shield-shaped haniwa', '石棺|stone sarcophagus'],
    ),
  },
  'early-korea': {
    'jeulmun-mumun': reference(
      ['岩寺洞遗址|Amsa-dong', '东三洞贝冢|Dongsam-dong Shell Midden', '鳌山里遗址|Osan-ri', '弓山遗址|Gungsan', '松竹里遗址|Songjuk-ri', '松菊里遗址|Songguk-ri', '大坪遗址|Daepyeong', '检丹里遗址|Geomdan-ri', '无去洞遗址|Mugeo-dong', '黔丹里支石墓群|Geomdan dolmen group'],
      ['栉文陶聚落共同体|Jeulmun settlement community', '贝冢渔猎共同体|shell-midden fishing community', '无文陶稻作共同体|Mumun farming community', '支石墓营建共同体|dolmen-building community', '石器工匠群体|stone-tool artisans', '陶作工匠群体|pottery artisans', '河海交换网络|river-sea exchange network', '青铜器持有精英群体|bronze-using elite group', '高地旱作共同体|upland farming community', '环壕聚落共同体|ditched settlement community'],
      ['栉文陶钵|comb-pattern pottery bowl', '无文陶罐|Mumun pottery jar', '半月形石刀|crescent stone knife', '磨制石剑|ground stone dagger', '琵琶形铜剑|Liaoning-style bronze dagger', '多钮粗纹镜|multi-knobbed bronze mirror', '支石墓石棺|dolmen stone cist', '石制箭头|stone arrowhead', '纺轮|spindle whorl', '骨制鱼叉|bone harpoon'],
    ),
    gojoseon: reference(
      ['王险城|Wanggeom-seong', '辽东|Liaodong', '浿水|Paesu', '清川江流域|Chongchon Basin', '大同江流域|Taedong Basin', '乐浪地区|Lelang Region', '辽河流域|Liao Basin', '平壤平原|Pyongyang Plain', '西北朝鲜半岛|Northwestern Korean Peninsula', '鸭绿江下游|Lower Yalu'],
      ['古朝鲜王权|Gojoseon kingship', '卫满朝鲜王廷|Wiman Joseon court', '朝鲜大臣群体|Joseon ministerial group', '边郡贸易使团|frontier trade envoys', '铁器工匠群体|ironworking artisans', '青铜器铸造群体|bronze artisans', '城邑守卫群体|walled-settlement guards', '农耕共同体|farming community', '汉朝交涉使团|Han diplomatic mission', '地方首领侍从团|local chiefly retinue'],
      ['细形铜剑|slender bronze dagger', '多钮细纹镜|fine-lined bronze mirror', '铁制剑|iron sword', '铁制犁铧|iron ploughshare', '陶制长颈壶|long-necked pottery jar', '车马具铜饰|bronze chariot fitting', '燕明刀钱|Yan knife coin', '汉式铜镜|Han-style bronze mirror', '木椁墓构件|wooden chamber tomb fitting', '瓦当|roof-end tile'],
    ),
    'buyeo-samhan': reference(
      ['扶余|Buyeo', '吉林平原|Jilin Plain', '松花江流域|Songhua Basin', '沃沮地区|Okjeo Territory', '东濊地区|Dongye Territory', '辰韩|Jinhan', '马韩|Mahan', '弁韩|Byeonhan', '金海|Gimhae', '洛东江流域|Nakdong Basin'],
      ['扶余王廷|Buyeo royal court', '四出道地方首领集团|Buyeo regional lords', '沃沮邑落共同体|Okjeo settlement community', '东濊邑落共同体|Dongye settlement community', '马韩目支国首领集团|Mokji leadership', '辰韩邑落会议|Jinhan settlement council', '弁韩铁贸易群体|Byeonhan iron traders', '祭天共同体|heaven-ritual community', '骑兵随从团|mounted retinue', '铁器工匠群体|ironworking artisans'],
      ['铁制长剑|iron longsword', '弁韩铁锭|Byeonhan iron ingot', '青铜马具|bronze horse fitting', '陶制高杯|pottery pedestal cup', '夹炭黑陶罐|black burnished jar', '鹿角柄刀|antler-handled knife', '玻璃珠串|glass bead necklace', '木棺墓构件|wooden coffin fitting', '铜制铃饰|bronze bell ornament', '铁制甲片|iron armour plate'],
    ),
  },
  'bronze-iron-anatolia': {
    'hittite-luwian': reference(
      ['哈图沙|Hattusa', '卡涅什|Kanesh', '萨皮努瓦|Sapinuwa', '阿拉贾霍裕克|Alaca Hoyuk', '阿尔斯兰特佩|Arslantepe', '卡尔卡米什|Carchemish', '塔尔洪塔萨|Tarhuntassa', '米拉|Mira', '马萨|Masa', '维卢萨|Wilusa'],
      ['赫梯大王廷|Hittite Great King court', '哈图沙王家书记团|Hattusa royal scribes', '太阳女神祭司团|Sun Goddess priesthood', '赫梯战车军|Hittite chariot corps', '卡涅什亚述商人居留地|Kanesh karum merchants', '卢维亚地方王廷|Luwian regional court', '卡尔卡米什副王廷|Carchemish viceregal court', '王家条约保管机构|royal treaty archive', '神庙土地管理机构|temple estate administration', '青铜工匠群体|bronze-working artisans'],
      ['赫梯楔形文字泥板|Hittite cuneiform tablet', '卢维象形文字碑|Luwian hieroglyphic stele', '哈图沙狮门石雕|Lion Gate sculpture', '青铜楔形文字条约板|bronze treaty tablet', '仪式鹿形来通杯|stag-shaped ritual rhyton', '铁制早期剑刃|early iron sword blade', '战车轮毂构件|chariot wheel hub', '王家印章封泥|royal seal impression', '库尔特佩商贸泥板|Kultepe trade tablet', '风暴神石像|storm-god stone image'],
    ),
    'phrygia-lydia-urartu': reference(
      ['戈尔迪翁|Gordion', '佩西努斯|Pessinus', '萨迪斯|Sardis', '宾格尔山|Mount Tmolus', '图什帕|Tushpa', '埃瑞布尼|Erebuni', '阿尔吉什蒂希尼利|Argishtihinili', '阿亚尼​​斯|Ayanis', '凡湖|Lake Van', '卡尔米尔布卢尔|Karmir Blur'],
      ['弗里吉亚王廷|Phrygian royal court', '戈尔迪翁贵族宴饮集团|Gordion elite household', '库柏勒祭司团|Cybele priesthood', '吕底亚王廷|Lydian royal court', '萨迪斯铸币机构|Sardis mint', '王家金砂采炼群体|royal electrum workers', '乌拉尔图王廷|Urartian royal court', '乌拉尔图要塞守军|Urartian fortress garrison', '灌溉渠营建群体|irrigation canal builders', '神庙仓储机构|temple storehouse'],
      ['戈尔迪翁木制家具|Gordion wooden furniture', '弗里吉亚扣针|Phrygian fibula', '吕底亚琥珀金币|Lydian electrum coin', '萨迪斯金砂坩埚|Sardis gold-refining crucible', '库柏勒石像|Cybele stone image', '乌拉尔图青铜腰带|Urartian bronze belt', '乌拉尔图铭文盾牌|Urartian inscribed shield', '埃瑞布尼楔形文字砖|Erebuni cuneiform brick', '青铜狮首釜饰|bronze lion-headed cauldron fitting', '灌溉渠界碑|irrigation canal boundary stone'],
    ),
  },
  'ancient-levant': {
    'ugarit-canaan': reference(
      ['乌加里特|Ugarit', '比布鲁斯|Byblos', '哈索尔|Hazor', '米吉多|Megiddo', '拉吉|Lachish', '耶路撒冷|Jerusalem', '示剑|Shechem', '盖泽尔|Gezer', '阿什凯隆|Ashkelon', '阿拉拉赫|Alalakh'],
      ['乌加里特王廷|Ugarit royal court', '巴力神庙祭司团|Baal temple priesthood', '乌加里特港商人群体|Ugarit maritime merchants', '楔形字母书记团|alphabetic cuneiform scribes', '比布鲁斯王廷|Byblos royal court', '迦南城邦长老会|Canaanite city elders', '哈索尔守军|Hazor garrison', '米吉多战车军|Megiddo chariot corps', '宫殿仓储机构|palace storehouse', '紫色染料工匠群体|purple-dye artisans'],
      ['乌加里特字母泥板|Ugaritic alphabet tablet', '巴力神话泥板|Baal Cycle tablet', '青铜雷神像|bronze storm-god figurine', '迦南鸭形象牙盒|Canaanite duck-shaped ivory box', '双耳运输罐|Canaanite transport jar', '青铜镰形剑|bronze sickle sword', '米吉多象牙雕件|Megiddo ivory carving', '埃及圣甲虫印章|Egyptian-style scarab seal', '紫色染料陶缸|purple-dye vat', '王家圆筒印章|royal cylinder seal'],
    ),
    'phoenician-aramaean': reference(
      ['推罗|Tyre', '西顿|Sidon', '比布鲁斯|Byblos', '阿尔瓦德|Arwad', '迦太基|Carthage', '萨马勒|Samal', '阿尔帕德|Arpad', '大马士革|Damascus', '哈马|Hamath', '萨马利亚|Samaria'],
      ['推罗王廷|Tyrian royal court', '西顿王廷|Sidonian royal court', '麦勒卡特祭司团|Melqart priesthood', '阿斯塔蒂祭司团|Astarte priesthood', '腓尼基海商群体|Phoenician maritime merchants', '紫色染料工匠行会|purple-dye artisans', '萨马勒阿拉米王廷|Aramaean court of Samal', '阿拉米书记团|Aramaic scribes', '大马士革战车军|Damascene chariot corps', '城邦长老议事会|city elders council'],
      ['腓尼基字母碑铭|Phoenician alphabet inscription', '埃什穆纳扎尔石棺|Sarcophagus of Eshmunazar', '阿希兰石棺|Sarcophagus of Ahiram', '紫色染料陶罐|purple-dye jar', '雪松木船肋材|cedar ship timber', '银制神庙碗|silver temple bowl', '腓尼基双耳罐|Phoenician amphora', '基拉穆瓦碑|Kilamuwa stele', '阿拉米文象牙铭牌|Aramaic inscribed ivory plaque', '青铜献祭香炉|bronze incense burner'],
    ),
  },
  'iranian-central-asia': {
    'saka-bactria': reference(
      ['帕泽雷克|Pazyryk', '伊塞克|Issyk', '贝希斯敦|Behistun', '巴尔赫|Bactra', '阿伊哈努姆|Ai Khanoum', '塔赫特桑金|Takht-i Sangin', '贝格拉姆|Begram', '喀布尔河谷|Kabul Valley', '索格底亚那岩堡|Sogdian Rock', '费尔干纳盆地|Fergana Valley'],
      ['塞种部族王权|Saka chiefly polity', '帕泽雷克墓葬营建群体|Pazyryk burial community', '巴克特里亚总督府|Bactrian satrapal administration', '阿伊哈努姆城邦议事机构|Ai Khanoum civic administration', '奥克苏斯神庙祭司团|Oxus temple priesthood', '希腊—巴克特里亚王廷|Greco-Bactrian court', '骑射战士集团|mounted archer retinue', '商队护卫群体|caravan guards', '铸币机构|royal mint', '灌溉农业共同体|irrigation community'],
      ['帕泽雷克毛毡壁挂|Pazyryk felt hanging', '塞种金鹿饰牌|Saka gold deer plaque', '伊塞克金人甲饰|Issyk Golden Man armour plaque', '短剑阿基纳克|akinakes short sword', '复合弓|composite bow', '巴克特里亚希腊金币|Greco-Bactrian gold coin', '奥克苏斯银像|Oxus silver figurine', '阿伊哈努姆希腊文碑|Ai Khanoum Greek inscription', '红玉髓印章|carnelian seal', '双峰驼鞍具|Bactrian camel tack'],
    ),
    'sogdia-khwarazm': reference(
      ['撒马尔罕|Samarkand', '片治肯特|Panjikent', '布哈拉|Bukhara', '瓦拉赫沙|Varakhsha', '帕伊肯特|Paykend', '穆格山|Mount Mugh', '阿弗拉西阿卜|Afrasiab', '托普拉克卡拉|Toprak Kala', '卡特|Kath', '花剌子模绿洲|Khwarazm Oasis'],
      ['撒马尔罕王廷|Samarkand court', '粟特商人共同体|Sogdian merchant community', '祆教祭司团|Zoroastrian priesthood', '片治肯特城邦贵族会|Panjikent aristocratic council', '穆格山文书书记团|Mount Mugh scribes', '商队粟特语翻译群体|Sogdian caravan interpreters', '花剌子模王廷|Khwarazmian court', '托普拉克卡拉宫廷机构|Toprak Kala palace administration', '铸币机构|regional mint', '灌溉渠管理共同体|irrigation canal community'],
      ['粟特文书|Sogdian document', '穆格山书信|Mount Mugh letter', '片治肯特壁画|Panjikent mural', '阿弗拉西阿卜壁画|Afrasiab mural', '粟特银碗|Sogdian silver bowl', '骆驼商队货签|caravan cargo tag', '花剌子模钱币|Khwarazmian coin', '托普拉克卡拉木牍|Toprak Kala wooden tablet', '祆教纳骨瓮|Zoroastrian ossuary', '丝绸贸易织物|trade silk textile'],
    ),
  },
  'nubia-kush': {
    kerma: reference(
      ['克尔玛|Kerma', '西德夫法|Western Deffufa', '东德夫法|Eastern Deffufa', '多基盖尔|Dukki Gel', '赛岛|Sai Island', '第三瀑布|Third Cataract', '托姆博斯|Tombos', '卡瓦|Kawa', '塞丁加|Sedeinga', '尼罗河栋古拉河段|Dongola Reach'],
      ['克尔玛城市共同体|Kerma urban community', '德夫法仪式建筑营建群体|Deffufa ritual builders', '王家墓葬营建群体|royal tumulus builders', '尼罗河农牧共同体|Nile agro-pastoral community', '陶器工匠群体|fine-pottery artisans', '牛祭仪群体|cattle ritual community', '黄金采集交换群体|gold-trading community', '河运舟师群体|Nile boatmen', '边地商旅群体|frontier traders', '粮仓管理群体|granary administrators'],
      ['克尔玛黑顶红陶杯|Kerma black-topped red beaker', '德夫法泥砖|Deffufa mud brick', '牛角墓葬供物|cattle-horn funerary offering', '象牙嵌片|ivory inlay', '云母石器皿|mica stone vessel', '青铜匕首|bronze dagger', '金制珠饰|gold bead jewellery', '弓箭组|bow and arrow set', '皮革衣物|leather garment', '陶制粮仓封泥|granary clay sealing'],
    ),
    napata: reference(
      ['纳帕塔|Napata', '杰贝勒巴尔卡勒|Jebel Barkal', '库鲁|El-Kurru', '努里|Nuri', '卡瓦|Kawa', '桑纳姆|Sanam', '多基盖尔|Dukki Gel', '塞丁加|Sedeinga', '麦罗埃|Meroe', '第四瀑布|Fourth Cataract'],
      ['纳帕塔王廷|Napatan royal court', '阿蒙神庙祭司团|Amun priesthood', '库施王家墓葬机构|Kushite royal mortuary institution', '王家书记团|royal scribes', '库施弓箭军|Kushite archer corps', '尼罗河舟师群体|Nile boatmen', '黄金采炼群体|gold workers', '神庙土地管理机构|temple estate administration', '地方总督群体|provincial governors', '金字塔营建工匠团|pyramid builders'],
      ['杰贝勒巴尔卡勒王碑|Jebel Barkal royal stele', '纳帕塔阿蒙神像|Napatan Amun image', '库施王冠|Kushite royal cap crown', '库鲁金饰|El-Kurru gold jewellery', '努里沙布提俑|Nuri shabti', '青铜献祭桌|bronze offering table', '埃及圣书体碑铭|Egyptian hieroglyphic inscription', '复合弓|composite bow', '彩绘陶罐|painted pottery jar', '金字塔顶石|pyramid capstone'],
    ),
    meroe: reference(
      ['麦罗埃|Meroe', '穆萨瓦拉特苏弗拉|Musawwarat es-Sufra', '纳卡|Naqa', '瓦德本纳卡|Wad ben Naga', '哈马达布|Hamadab', '卡萨拉|Qasr Ibrim', '索巴|Soba', '第六瀑布|Sixth Cataract', '布塔纳草原|Butana Steppe', '阿特巴拉河|Atbara River'],
      ['麦罗埃王廷|Meroitic royal court', '狮神阿佩德马克祭司团|Apedemak priesthood', '麦罗埃文书记团|Meroitic scribes', '铁冶炼工匠群体|iron-smelting artisans', '王家象军|royal elephant corps', '尼罗河舟师群体|Nile boatmen', '远程商人群体|long-distance merchants', '神庙营建工匠团|temple builders', '王家墓葬机构|royal mortuary institution', '地方首领侍从团|regional chiefly retinue'],
      ['麦罗埃文碑铭|Meroitic inscription', '纳卡狮神浮雕|Naqa Apedemak relief', '铁制矛头|iron spearhead', '麦罗埃陶罐|Meroitic pottery jar', '金制指环|gold signet ring', '青铜仪式铃|bronze ritual bell', '玻璃珠串|glass bead necklace', '象形纹石牌|carved stone plaque', '金字塔祭堂浮雕|pyramid chapel relief', '铁冶炼炉渣|iron-smelting slag'],
    ),
  },
  'aksum-horn': {
    dmt: reference(
      ['耶哈|Yeha', '哈乌尔蒂|Hawulti', '马塔拉|Matara', '阿克苏姆高地|Aksum Highlands', '阿迪加拉特|Adigrat', '科哈伊托|Qohaito', '塞纳费|Senafe', '阿拉伯海沿岸通道|Red Sea corridor', '提格雷高原|Tigray Plateau', '马雷布河|Mareb River'],
      ['德阿马特王权|Dmt polity', '耶哈阿勒玛卡神庙祭司团|Almaqah temple priesthood at Yeha', '南阿拉伯文书记群体|South Arabian scribes', '石工营建群体|monumental stone builders', '高原农耕共同体|highland farming community', '红海商旅群体|Red Sea traders', '灌溉管理群体|irrigation community', '金属工匠群体|metalworking artisans', '地方首领侍从团|local chiefly retinue', '神庙仓储机构|temple storehouse'],
      ['耶哈神庙石构件|Yeha temple stone block', '南阿拉伯文碑铭|South Arabian inscription', '哈乌尔蒂石碑|Hawulti monument', '青铜阿勒玛卡像|bronze Almaqah figurine', '石制香坛|stone incense altar', '铁制农具|iron agricultural tool', '红海贝壳珠|Red Sea shell bead', '陶制储藏罐|ceramic storage jar', '石雕野山羊纹板|ibex-carved stone panel', '金制小饰件|gold ornament'],
    ),
    aksum: reference(
      ['阿克苏姆|Aksum', '阿杜利斯|Adulis', '马塔拉|Matara', '科哈伊托|Qohaito', '耶哈|Yeha', '德布雷达莫|Debre Damo', '哈乌尔蒂|Hawulti', '阿克苏姆石碑场|Aksum Stelae Field', '红海沿岸|Red Sea Coast', '提格雷高原|Tigray Plateau'],
      ['阿克苏姆王廷|Aksumite royal court', '王家铸币机构|royal mint', '吉兹文书记团|Geez scribes', '阿克苏姆教会|Aksumite Church', '阿杜利斯港商人群体|Adulis merchants', '象牙贸易群体|ivory traders', '石碑营建工匠团|stela builders', '王家军队|royal army', '地方总督机构|provincial administration', '修道共同体|monastic community'],
      ['阿克苏姆金币|Aksumite gold coin', '埃扎纳石碑|Ezana Stone', '阿克苏姆方尖碑|Aksum Obelisk', '吉兹文碑铭|Geez inscription', '希腊文王家铭文|Greek royal inscription', '青铜十字架|bronze processional cross', '象牙雕件|ivory carving', '红海双耳罐|Red Sea amphora', '玻璃器皿|glass vessel', '石制宝座基座|stone throne base'],
    ),
  },
  'indus-valley': {
    'early-harappan': reference(
      ['梅赫尔格尔|Mehrgarh', '哈拉帕早期层|Early Harappa', '科特迪吉|Kot Diji', '阿姆里|Amri', '雷赫曼德里|Rehman Dheri', '卡利班甘早期层|Early Kalibangan', '巴纳瓦利|Banawali', '纳乌沙罗|Nausharo', '索蒂|Sothi', '古马尔|Gumla'],
      ['早期哈拉帕聚落共同体|Early Harappan settlement community', '灌溉农耕共同体|irrigation farming community', '陶器工匠群体|pottery artisans', '铜器工匠群体|copper-working artisans', '珠饰工匠群体|bead-making artisans', '谷物仓储群体|grain-storage community', '城墙营建群体|wall-building community', '山地石料交换网络|upland stone exchange network', '河运商旅群体|river traders', '牧业共同体|pastoral community'],
      ['科特迪吉彩陶罐|Kot Diji painted jar', '早期印章|early stamp seal', '铜制钻头|copper drill bit', '红玉髓珠|carnelian bead', '燧石刀片|chert blade', '陶制纺轮|pottery spindle whorl', '泥砖|mud brick', '石制砝码|stone weight', '骨制锥|bone awl', '陶制牛车模型|terracotta cart model'],
    ),
    'mature-harappan': reference(
      ['摩亨佐-达罗|Mohenjo-daro', '哈拉帕|Harappa', '多拉维拉|Dholavira', '洛塔尔|Lothal', '卡利班甘|Kalibangan', '拉基加里|Rakhigarhi', '甘韦里瓦拉|Ganweriwala', '巴纳瓦利|Banawali', '苏特卡根多尔|Sutkagen-dor', '乔胡达罗|Chanhudaro'],
      ['哈拉帕城市管理共同体|Harappan urban administration', '标准砝码管理群体|standard-weight custodians', '印章雕刻工匠群体|seal-cutting artisans', '红玉髓珠工匠群体|carnelian bead artisans', '城市排水营建群体|urban drainage builders', '谷物仓储管理群体|granary community', '远程海贸群体|long-distance maritime traders', '棉纺织工匠群体|cotton textile artisans', '铜器工匠群体|copper-working artisans', '陶器工匠群体|pottery artisans'],
      ['独角兽纹印章|unicorn seal', '印度河文字印章|Indus script seal', '标准石制砝码|standard stone weight', '红玉髓蚀花珠|etched carnelian bead', '青铜舞女像|bronze Dancing Girl', '祭司王石像|Priest-King sculpture', '铜制工具组|copper tool set', '彩绘陶罐|painted pottery jar', '棉织物残片|cotton textile fragment', '烧砖排水管|baked-brick drain element'],
    ),
  },
  'gandhara-kushan': {
    'achaemenid-gandhara': reference(
      ['塔克西拉|Taxila', '普什卡拉瓦蒂|Pushkalavati', '犍陀罗|Gandhara', '喀布尔河谷|Kabul Valley', '斯瓦特河谷|Swat Valley', '贝希斯敦|Behistun', '波斯波利斯|Persepolis', '印度河渡口|Indus Crossing', '巴拉希萨尔|Bala Hissar', '查尔萨达|Charsadda'],
      ['犍陀罗总督府|Gandharan satrapy', '阿契美尼德王家使团|Achaemenid royal envoys', '阿拉米文书记团|Aramaic scribes', '贡赋征收机构|tribute administration', '印度河渡口守卫群体|Indus crossing guards', '商队群体|caravan merchants', '银器工匠群体|silversmith artisans', '地方城邦长老会|city elders council', '山口驻军|mountain-pass garrison', '铸币工匠群体|mint workers'],
      ['阿拉米文公文|Aramaic administrative document', '贝希斯敦犍陀罗浮雕|Gandharan relief at Behistun', '波斯式银杯|Achaemenid-style silver bowl', '弓箭袋|quiver', '短剑阿基纳克|akinakes dagger', '印章封泥|seal impression', '银制弯曲棒币|bent-bar silver coin', '红玉髓珠|carnelian bead', '铁制矛头|iron spearhead', '石制砝码|stone weight'],
    ),
    'indo-greek': reference(
      ['锡尔卡普|Sirkap', '塔克西拉|Taxila', '萨迦拉|Sagala', '贝格拉姆|Begram', '阿伊哈努姆|Ai Khanoum', '斯瓦特河谷|Swat Valley', '喀布尔|Kabul', '普什卡拉瓦蒂|Pushkalavati', '巴焦尔|Bajaur', '印度河上游|Upper Indus'],
      ['印度—希腊王廷|Indo-Greek royal court', '王家铸币机构|royal mint', '希腊文书记团|Greek scribes', '佉卢文书记团|Kharosthi scribes', '城市议事机构|city civic administration', '佛教僧团|Buddhist Sangha', '商队群体|caravan merchants', '希腊化军队|Hellenistic army', '象军|elephant corps', '石雕工匠群体|stone sculptors'],
      ['印度—希腊双语钱币|Indo-Greek bilingual coin', '米南德银币|Menander silver drachm', '佉卢文奉献碑|Kharosthi dedicatory inscription', '希腊式科林斯柱头|Corinthian capital', '石制佛塔构件|stone stupa element', '红玉髓印章|carnelian seal', '青铜赫拉克勒斯像|bronze Heracles figurine', '铁制骑枪|iron cavalry lance', '玻璃器皿|glass vessel', '双耳运输罐|transport amphora'],
    ),
    kushan: reference(
      ['白沙瓦|Purushapura', '马图拉|Mathura', '贝格拉姆|Begram', '苏尔赫科塔尔|Surkh Kotal', '塔克西拉|Taxila', '迦毕试|Kapisa', '巴尔赫|Bactra', '喀布尔|Kabul', '拉巴塔克|Rabatak', '德尔津特佩|Dalverzin Tepe'],
      ['贵霜王廷|Kushan royal court', '王家铸币机构|royal mint', '巴克特里亚文书记团|Bactrian scribes', '佛教僧团|Buddhist Sangha', '祆教祭司群体|Iranian cult priesthood', '商队群体|Silk Road caravans', '象军|elephant corps', '骑兵团|Kushan cavalry', '犍陀罗雕刻工坊|Gandharan sculpture workshop', '地方总督机构|provincial administration'],
      ['迦腻色迦金币|Kanishka gold coin', '拉巴塔克碑铭|Rabatak inscription', '苏尔赫科塔尔碑|Surkh Kotal inscription', '犍陀罗佛像|Gandharan Buddha image', '马图拉红砂岩神像|Mathura red-sandstone image', '贵霜骑士钱币|Kushan horseman coin', '青铜弥勒像|bronze Maitreya image', '丝绸贸易织物|trade silk textile', '玻璃酒杯|glass goblet', '铁制马具|iron horse fitting'],
    ),
  },
  'mesoamerican-formative': {
    olmec: reference(
      ['圣洛伦索|San Lorenzo', '拉文塔|La Venta', '特雷斯萨波特斯|Tres Zapotes', '拉古纳德洛斯塞罗斯|Laguna de los Cerros', '埃尔马纳蒂|El Manati', '查尔卡钦戈|Chalcatzingo', '拉斯利马斯|Las Limas', '波特雷罗努埃沃|Potrero Nuevo', '阿罗约松索|Arroyo Sonso', '墨西哥湾低地|Gulf Lowlands'],
      ['奥尔梅克仪式中心共同体|Olmec ceremonial-center community', '巨石头像营建群体|colossal-head builders', '玄武岩采运群体|basalt quarrying and transport group', '玉器工匠群体|jade artisans', '高台营建劳役群体|platform construction labour', '玉米农耕共同体|maize farming community', '河运交换网络|river exchange network', '祭仪球赛群体|ritual ballgame community', '泥塑工匠群体|ceramic figurine artisans', '沼泽资源采集群体|wetland resource community'],
      ['奥尔梅克巨石头像|Olmec colossal head', '昆兹斧|Kunz axe', '玉制凯尔特斧|jade celt', '拉斯利马斯石像|Las Limas monument', '婴儿脸陶像|baby-face figurine', '玄武岩祭坛|basalt altar', '血祭穿刺器|bloodletting perforator', '赤铁矿镜|hematite mirror', '橡胶球|rubber ball', '白陶器皿|white-slipped vessel'],
    ),
    zapotec: reference(
      ['蒙特阿尔班|Monte Alban', '圣何塞莫戈特|San Jose Mogote', '米特拉|Mitla', '达因苏|Dainzu', '亚古尔|Yagul', '兰比铁科|Lambityeco', '蒂拉卡尤潘|Tilcajete', '阿齐奥姆帕|Atzompa', '奥科特兰|Ocotlan', '瓦哈卡谷地|Oaxaca Valley'],
      ['蒙特阿尔班城市共同体|Monte Alban urban community', '萨波特克统治精英集团|Zapotec ruling elite', '碑铭书记群体|Zapotec scribes', '历法祭司群体|calendar priesthood', '墓葬营建工匠团|tomb builders', '陶瓮工匠群体|urn makers', '谷地农耕共同体|valley farming community', '市场交换群体|market exchange community', '战士集团|warrior group', '石雕工匠群体|stone carvers'],
      ['舞者石刻|Danzantes stone', '萨波特克文字碑|Zapotec glyph monument', '灰陶神像瓮|greyware effigy urn', '蒙特阿尔班墓室壁画|Monte Alban tomb mural', '绿石珠饰|greenstone jewellery', '黑曜石刀片|obsidian blade', '三足陶碗|tripod ceramic bowl', '骨制穿刺器|bone perforator', '石制历法碑|calendrical stone monument', '灰泥面具|stucco mask'],
    ),
    teotihuacan: reference(
      ['特奥蒂瓦坎|Teotihuacan', '太阳金字塔|Pyramid of the Sun', '月亮金字塔|Pyramid of the Moon', '羽蛇神庙|Feathered Serpent Pyramid', '亡者大道|Avenue of the Dead', '特潘蒂特拉|Tepantitla', '阿特特尔科|Atetelco', '特蒂特拉|Tetitla', '拉文蒂利亚|La Ventilla', '乔卢拉|Cholula'],
      ['特奥蒂瓦坎城市管理共同体|Teotihuacan urban administration', '多户复合院共同体|apartment-compound community', '祭司群体|temple priesthood', '黑曜石工匠群体|obsidian artisans', '壁画工匠群体|mural painters', '商人侨居群体|foreign merchant enclave', '羽蛇神祭仪群体|Feathered Serpent ritual community', '军人集团|warrior order', '市场交换群体|market community', '水利营建群体|hydraulic builders'],
      ['特奥蒂瓦坎三足圆筒器|tripod cylinder vessel', '绿曜石刀片|green obsidian blade', '羽蛇神石雕|Feathered Serpent sculpture', '火神陶像|Old Fire God brazier', '特拉洛克壁画|Tlaloc mural', '黄铁矿镜|pyrite mirror', '灰泥面具|stucco mask', '贝壳耳饰|shell earspool', '黑曜石矛头|obsidian spearhead', '陶制香炉|ceramic incense burner'],
    ),
  },
  'preinca-andes': {
    caral: reference(
      ['卡拉尔|Caral', '阿斯佩罗|Aspero', '班杜里亚|Bandurria', '维查马|Vichama', '瓦里坎加|Huaricanga', '卡巴莱特|Caballeta', '洛斯加维拉内斯|Los Gavilanes', '帕蒂维尔卡河谷|Pativilca Valley', '福塔莱萨河谷|Fortaleza Valley', '苏佩河谷|Supe Valley'],
      ['卡拉尔城市共同体|Caral urban community', '平台建筑营建群体|platform-mound builders', '棉作共同体|cotton-farming community', '海岸渔业共同体|coastal fishing community', '河谷灌溉共同体|valley irrigation community', '结绳记录管理群体|quipu-like record custodians', '仪式广场共同体|sunken-plaza ritual community', '芦苇运输群体|reed-raft transport group', '贝壳交换网络|shell exchange network', '乐器制作群体|musical-instrument artisans'],
      ['卡拉尔骨笛|Caral bone flute', '鹈鹕骨号|pelican-bone horn', '早期结绳|early quipu', '棉制渔网|cotton fishing net', '葫芦容器|gourd vessel', '芦苇编篮|reed basket', '石制重锤|stone weight', '贝壳珠饰|shell bead ornament', '泥塑人像|clay figurine', '平台建筑石袋|shicra stone bag'],
    ),
    chavin: reference(
      ['查文德万塔尔|Chavin de Huantar', '昆图尔瓦西|Kuntur Wasi', '帕科潘帕|Pacopampa', '卡拉瓦伊略|Garagay', '塞钦|Sechin', '卡巴约穆埃尔托|Caballo Muerto', '内佩尼亚河谷|Nepena Valley', '莫斯纳河谷|Mosna Valley', '库普斯尼克地区|Cupisnique Region', '安第斯东坡通道|Eastern Andean Corridor'],
      ['查文神庙祭仪共同体|Chavin temple ritual community', '地下廊道营建群体|gallery builders', '石雕工匠群体|stone carvers', '祭司群体|priestly community', '远程朝圣网络|pilgrimage network', '贝壳交换群体|shell traders', '高地农牧共同体|highland agro-pastoral community', '陶器工匠群体|pottery artisans', '纺织工匠群体|textile artisans', '引水渠营建群体|canal builders'],
      ['兰松神像|Lanzon monolith', '雷蒙迪碑|Raimondi Stele', '特略方尖碑|Tello Obelisk', '石制钉头|stone tenon head', '斯特龙布斯贝号|strombus shell trumpet', '查文黑陶罐|Chavin blackware vessel', '金制冠饰|gold crown ornament', '骨制吸管|bone snuff tube', '彩绘棉织物|painted cotton textile', '石制研磨钵|stone mortar'],
    ),
    'moche-nazca': reference(
      ['太阳神庙|Huaca del Sol', '月亮神庙|Huaca de la Luna', '西潘|Sipan', '埃尔布鲁霍|El Brujo', '潘帕格兰德|Pampa Grande', '纳斯卡|Nazca', '卡瓦奇|Cahuachi', '帕尔帕|Palpa', '阿卡里河谷|Acari Valley', '南部海岸地画区|Nazca Lines Region'],
      ['莫切仪式中心共同体|Moche ceremonial-center community', '莫切武士集团|Moche warrior elite', '祭司群体|priesthood', '金银工匠群体|metalworking artisans', '灌溉渠共同体|irrigation community', '纳斯卡仪式中心共同体|Nazca ceremonial community', '地画营建群体|geoglyph builders', '彩陶工匠群体|polychrome pottery artisans', '纺织工匠群体|textile artisans', '海岸农渔共同体|coastal farming and fishing community'],
      ['莫切肖像陶瓶|Moche portrait vessel', '西潘金耳饰|Sipan gold ear ornament', '金制背饰|gold backflap', '铜制仪式刀|copper tumi', '莫切壁画|Moche mural', '纳斯卡彩陶罐|Nazca polychrome vessel', '纳斯卡地画测绳|geoglyph layout cord', '羽毛织物|feather textile', '斯特龙布斯贝壳|strombus shell', '芦苇舟模型|reed-boat model'],
    ),
    'wari-tiwanaku': reference(
      ['瓦里|Wari', '皮基亚克塔|Pikillacta', '维拉科查潘帕|Viracochapampa', '塞罗鲍尔|Cerro Baul', '孔乔帕塔|Conchopata', '蒂瓦纳科|Tiwanaku', '卢库尔马塔|Lukurmata', '普马朋克|Pumapunku', '阿卡帕纳|Akapana', '的的喀喀湖|Lake Titicaca'],
      ['瓦里国家行政共同体|Wari state administration', '瓦里道路驿站群体|Wari road-station community', '彩陶工匠群体|polychrome pottery artisans', '纺织工匠群体|tapestry weavers', '仓储管理群体|state storage administrators', '蒂瓦纳科仪式中心共同体|Tiwanaku ceremonial community', '高台田农耕共同体|raised-field farming community', '石工群体|monumental stoneworkers', '羊驼商队群体|llama caravan community', '湖上舟运群体|lake transport community'],
      ['瓦里彩陶大瓮|Wari polychrome urn', '瓦里挂毯|Wari tapestry', '四角帽|four-cornered hat', '木制鼻烟盘|wooden snuff tray', '蒂瓦纳科太阳门|Gateway of the Sun', '贝内特石像|Bennett Monolith', '克罗杯|kero beaker', '金制胸饰|gold pectoral', '青铜农具|bronze agricultural tool', '芦苇舟|reed boat'],
    ),
    chimu: reference(
      ['昌昌|Chan Chan', '瓦卡埃斯梅拉尔达|Huaca Esmeralda', '瓦卡阿尔科伊里斯|Huaca Arco Iris', '帕拉蒙加|Paramonga', '法尔凡|Farfan', '图库梅|Tucume', '兰巴耶克河谷|Lambayeque Valley', '莫切河谷|Moche Valley', '奇卡马河谷|Chicama Valley', '太平洋北岸|North Peruvian Coast'],
      ['奇穆王廷|Chimu royal court', '昌昌城院管理群体|Chan Chan ciudadela administration', '灌溉渠管理共同体|irrigation canal administration', '金银工匠群体|metalworking artisans', '纺织工匠群体|textile artisans', '海上渔业共同体|maritime fishing community', '贡赋仓储机构|tribute storehouse', '信使群体|messenger corps', '军人集团|warrior group', '地方领主侍从团|regional lordly retinue'],
      ['奇穆黑陶瓶|Chimu blackware vessel', '金制面具|gold funerary mask', '银制烧杯|silver beaker', '铜制图米刀|copper tumi', '羽毛织物|feather textile', '斯蓬迪鲁斯贝饰|spondylus shell ornament', '木制仪式偶像|wooden ritual idol', '棉制渔网|cotton fishing net', '芦苇舟|reed fishing craft', '浮雕土墙板|relief adobe wall panel'],
    ),
  },
  'lapita-pacific': {
    lapita: reference(
      ['塔莱帕凯马莱|Talepakemalai', '泰奥乌马|Teouma', '穆利法努阿|Mulifanua', '努库莱卡|Nukuleka', '布雷瓦|Bourewa', '卡莫托|Kamgot', '瓦托穆|Watom', '内内亚|Nenumbo', '雷夫卡|Reefs Islands', '俾斯麦群岛|Bismarck Archipelago'],
      ['拉皮塔沿海聚落共同体|Lapita coastal settlement community', '远洋航海群体|ocean voyaging community', '齿印陶工群体|dentate-stamped pottery artisans', '礁湖渔业共同体|lagoon fishing community', '园艺农业共同体|horticultural community', '黑曜石交换网络|obsidian exchange network', '贝饰工匠群体|shell ornament artisans', '独木舟营建群体|canoe builders', '墓葬共同体|burial community', '岛际婚姻交换网络|inter-island kinship network'],
      ['拉皮塔齿印陶罐|Lapita dentate-stamped vessel', '黑曜石刀片|obsidian blade', '贝制手镯|shell bracelet', '锛|stone adze', '鱼钩|shell fishhook', '陶制纺轮状坠饰|ceramic pendant', '独木舟桨|canoe paddle', '树皮布槌|barkcloth beater', '磨制石器|ground stone tool', '贝壳珠串|shell bead necklace'],
    ),
    'early-polynesian-settlement': reference(
      ['托伊加马拉马拉|Toaga', '阿纳伊奥|Anaehoomalu', '哈阿图阿图阿|Haatuatua', '贝利角|Bellows Beach', '亨德森岛|Henderson Island', '曼加雷瓦|Mangareva', '马尔克萨斯群岛|Marquesas Islands', '社会群岛|Society Islands', '库克群岛|Cook Islands', '复活节岛阿纳凯纳|Anakena'],
      ['早期波利尼西亚村落共同体|early Polynesian village community', '双体独木舟航海群体|double-hulled canoe voyagers', '园艺农业共同体|horticultural community', '近岸渔业共同体|inshore fishing community', '石锛工匠群体|stone-adze artisans', '贝饰工匠群体|shell ornament artisans', '树皮布制作群体|barkcloth makers', '祭仪场地营建群体|ritual-space builders', '岛际交换网络|inter-island exchange network', '鸟骨工具工匠群体|bone-tool artisans'],
      ['玄武岩石锛|basalt adze', '珍珠贝鱼钩|pearl-shell fishhook', '骨制鱼钩|bone fishhook', '独木舟桨|canoe paddle', '树皮布槌|barkcloth beater', '贝制胸饰|shell breast ornament', '珊瑚锉|coral file', '火山玻璃刀片|volcanic-glass blade', '椰壳容器|coconut-shell vessel', '石制烹饪炉构件|earth-oven stone'],
    ),
  },
}

type FictionalMode = 'archaeological' | 'city-state' | 'kingdom' | 'tribal' | 'maritime'
const fictionalLocations: Record<FictionalMode, FictionalProfile['location']> = {
  archaeological: {
    settlement: ['河岸聚落', '高台聚落', '工匠聚落', '农耕村落', '墓地聚落', '湖滨聚落', '山麓聚落', '海岸聚落', '环壕聚落', '交换聚落'],
    region: ['河谷文化区', '山麓地带', '海岸交换区', '农耕腹地', '墓葬分布区', '矿料来源区', '岛际航行区', '高原通道区', '湖沼生产区', '聚落密集区'],
    fortress: ['环壕城址', '土垣聚落', '高台寨址', '河口寨址', '山口寨址', '木栅聚落', '守望高地', '仓储围区', '渡口寨址', '海岬守望地'],
    natural: ['河谷', '湖泽', '山麓', '高原', '海湾', '河口', '丘陵', '沙洲', '森林', '海峡'],
  },
  'city-state': {
    settlement: ['王城', '神庙城', '河港城', '商旅市镇', '工匠城区', '稻作村落', '渡口城', '仓储港镇', '山麓城', '边地市镇'],
    region: ['王畿', '城邦辖区', '神庙领地', '灌溉农业区', '港市腹地', '矿业区', '边地行省', '河谷领地', '山地通道区', '贡赋辖区'],
    fortress: ['王城门堡', '河防堡', '山口堡', '港口关城', '边地要塞', '神庙护墙', '军营堡', '渡口关寨', '守望塔', '粮仓围城'],
    natural: ['河谷', '平原', '山麓', '湖泊', '海湾', '河口', '高原', '丘陵', '森林', '沙漠边缘'],
  },
  kingdom: {
    settlement: ['王都', '行宫城', '神庙镇', '河港城', '铸币城', '商旅镇', '边境城', '工匠村', '驿站城', '粮仓镇'],
    region: ['王畿', '行省', '封地', '神庙领', '贡赋区', '灌溉区', '牧业区', '矿冶区', '海贸区', '边疆区'],
    fortress: ['王家要塞', '边境堡', '河防堡', '山口关城', '军团营寨', '港口堡', '城门堡', '守望塔', '驿路堡', '粮仓堡'],
    natural: ['大河', '河谷', '平原', '高原', '山口', '湖岸', '海湾', '草原', '森林', '沙洲'],
  },
  tribal: {
    settlement: ['山丘堡', '河谷聚落', '农牧村落', '工匠村落', '圣林聚落', '海岸聚落', '岛屿村落', '渡口聚落', '高地营地', '集会聚落'],
    region: ['部族领地', '河谷地带', '牧业区', '农耕区', '圣林区', '铁矿区', '琥珀商路区', '海峡交换区', '边境地带', '山地通道区'],
    fortress: ['山丘堡', '木栅寨', '河口寨', '山口堡', '边地营寨', '渡口堡', '海岬守望地', '高地寨', '圣地围墙', '粮仓围区'],
    natural: ['河谷', '山地', '森林', '沼泽', '海湾', '湖泊', '草原', '丘陵', '海峡', '高原'],
  },
  maritime: {
    settlement: ['港城', '岛港镇', '河口市镇', '航海聚落', '渔业村落', '仓储港镇', '工匠港镇', '祭仪港镇', '海峡市镇', '舟师驻地'],
    region: ['港市辖区', '岛链航行区', '海峡控制区', '渔业区', '海贸腹地', '珊瑚礁区', '季风航路区', '河口仓储区', '森林产物区', '海岸农耕区'],
    fortress: ['港口关寨', '海岬守望塔', '河口堡', '舟师泊寨', '岛港木栅', '仓储围区', '海峡关城', '山口寨', '渡口堡', '海岸营寨'],
    natural: ['海湾', '海峡', '岛屿', '珊瑚礁', '河口', '潟湖', '沙洲', '海岬', '红树林', '火山岛'],
  },
}

const fictionalOrganizations: Record<FictionalMode, string[]> = {
  archaeological: ['聚落共同体', '陶作工匠群体', '石器工匠群体', '农耕共同体', '渔猎共同体', '墓葬营建群体', '交换网络', '祭仪群体', '航运群体', '金属工匠群体'],
  'city-state': ['王廷', '神庙祭司团', '书记团', '商人群体', '工匠团', '守备队', '灌溉共同体', '税吏机构', '使节团', '粮仓管理群体'],
  kingdom: ['王廷', '王家军队', '地方总督府', '神庙祭司团', '王家书记团', '铸币机构', '商队群体', '工匠团', '驿传机构', '贡赋仓储机构'],
  tribal: ['部族议会', '战士随从团', '亲族共同体', '祭司群体', '铁匠群体', '商旅群体', '农牧共同体', '船匠群体', '骑兵团', '长老会'],
  maritime: ['港市议事会', '航海群体', '船匠群体', '渔业共同体', '商人群体', '引航群体', '仓储管理群体', '祭司团', '岛际交换网络', '港口守卫队'],
}

const fictionalProfile = (modifiers: string[], item: string[], mode: FictionalMode): FictionalProfile => ({
  modifiers,
  location: fictionalLocations[mode],
  organization: fictionalOrganizations[mode],
  item,
})

type FictionalSeed = [modifiers: string[], item: string[], mode: FictionalMode]
const ancientFictionalSeeds: Record<string, Record<string, FictionalSeed>> = {
  mesopotamia: {
    'sumer-akkad': [['芦苇', '星门', '金羊', '月神', '黑土', '双河', '青金', '王狮', '白庙', '铜山'], ['泥板文书', '滚筒印章', '青铜斧', '芦苇笔', '竖琴', '青金珠饰', '陶制粮罐', '铜制矛头', '沥青舟板', '石制砝码'], 'city-state'],
    'old-babylon': [['日轮', '月塔', '双河', '法碑', '铜门', '银秤', '蓝砖', '王渠', '芦城', '星台'], ['法典泥板', '契约封套', '银称量锭', '数学泥板', '圆筒印章', '青铜镰刀', '羊毛织物', '运河测绳', '陶制酒罐', '神庙供桌'], 'kingdom'],
    'neo-assyria-babylon': [['翼狮', '星塔', '蓝门', '铁军', '月城', '王猎', '双河', '金砖', '杉木', '神箭'], ['宫殿浮雕', '棱柱铭文', '铁制箭头', '釉面砖', '攻城槌构件', '星历泥板', '银舍客勒', '王家印章', '锁子甲片', '青铜权杖'], 'kingdom'],
  },
  'bronze-iron-anatolia': {
    'hittite-luwian': [['风暴', '太阳', '狮门', '铜山', '王印', '战车', '鹰岩', '红河', '神鹿', '石城'], ['楔形文字板', '象形文字碑', '青铜条约板', '鹿形来通杯', '战车轮毂', '王家封泥', '铁制剑刃', '石制神像', '青铜短斧', '陶制储藏罐'], 'kingdom'],
    'phrygia-lydia-urartu': [['金砂', '狮泉', '山堡', '库柏勒', '凡湖', '岩门', '松木', '王墓', '青铜', '河谷'], ['琥珀金币', '青铜腰带', '铭文盾牌', '木制宴饮桌', '金砂坩埚', '扣针', '狮首釜饰', '楔形文字砖', '石制神像', '灌渠界碑'], 'kingdom'],
  },
  'ancient-levant': {
    'ugarit-canaan': [['巴力', '雪松', '紫海', '雷云', '青铜', '王港', '神山', '橄榄', '月塔', '狮门'], ['字母泥板', '青铜神像', '象牙盒', '镰形剑', '圆筒印章', '紫染陶罐', '雪松船板', '双耳酒罐', '圣甲虫印章', '银制供碗'], 'city-state'],
    'phoenician-aramaean': [['紫帆', '雪松', '麦勒卡特', '海星', '银港', '红城', '青铜', '阿斯塔蒂', '商路', '石狮'], ['字母碑铭', '紫染陶罐', '雪松船肋', '银制神庙碗', '双耳运输罐', '石棺铭文', '青铜香炉', '象牙铭牌', '玻璃珠串', '银制钱币'], 'maritime'],
  },
  'iranian-central-asia': {
    'saka-bactria': [['金鹿', '雪豹', '双峰驼', '赤山', '草原', '奥克苏斯', '王弓', '青金', '葡萄', '风马'], ['金制饰牌', '阿基纳克短剑', '复合弓', '毛毡壁挂', '希腊金币', '红玉髓印章', '银制神像', '骆驼鞍具', '青铜镜', '皮革箭囊'], 'tribal'],
    'sogdia-khwarazm': [['粟特', '星火', '丝路', '双峰驼', '银碗', '河中', '绿洲', '商队', '葡萄', '金门'], ['粟特文书', '银制酒碗', '彩绘壁画', '商队货签', '纳骨瓮', '丝绸织物', '花剌子模钱币', '木牍', '玻璃酒杯', '红玉髓印章'], 'city-state'],
  },
  'nubia-kush': {
    kerma: [['黑顶陶', '牛角', '金河', '德夫法', '尼罗', '象牙', '弓手', '红土', '河舟', '月丘'], ['黑顶陶杯', '泥砖', '牛角供物', '象牙嵌片', '青铜匕首', '金制珠饰', '弓箭组', '皮革衣物', '石制器皿', '粮仓封泥'], 'archaeological'],
    napata: [['阿蒙', '金冠', '黑土', '圣山', '弓手', '尼罗', '王碑', '狮首', '金塔', '河舟'], ['王家石碑', '阿蒙神像', '库施王冠', '金制珠饰', '沙布提俑', '献祭桌', '复合弓', '彩绘陶罐', '金字塔顶石', '青铜仪式铃'], 'kingdom'],
    meroe: [['狮神', '铁炉', '金塔', '尼罗', '王象', '红土', '麦罗埃', '河舟', '星冠', '黑陶'], ['麦罗埃文碑', '狮神浮雕', '铁制矛头', '黑陶罐', '金制指环', '青铜铃', '玻璃珠串', '金字塔浮雕', '铁炉构件', '砂岩神像'], 'kingdom'],
  },
  'aksum-horn': {
    dmt: [['月神', '高原', '红海', '野山羊', '石塔', '金香', '马雷布', '青铜', '耶哈', '星坛'], ['南阿拉伯文碑', '石制香坛', '青铜神像', '铁制农具', '贝壳珠饰', '储藏陶罐', '石雕纹板', '金制饰件', '石砌构件', '印章封泥'], 'city-state'],
    aksum: [['方尖碑', '红海', '金十字', '象牙', '高原', '吉兹', '王币', '石座', '海港', '星冠'], ['阿克苏姆金币', '吉兹文碑', '希腊文铭文', '青铜十字架', '象牙雕件', '红海双耳罐', '玻璃器皿', '石碑构件', '王家印章', '石制宝座'], 'kingdom'],
  },
  'early-britain': {
    'iron-age-britain': [['白马', '橡林', '雾丘', '铜镜', '战车', '海峡', '红鹿', '圣泉', '铁环', '山堡'], ['铁制长剑', '青铜圆镜', '金币', '盾牌包边', '战车轮毂', '环形胸针', '铁制镰刀', '玻璃手镯', '陶制盐罐', '雕纹剑鞘'], 'tribal'],
    'roman-britain': [['长墙', '鹰旗', '温泉', '泰晤士', '军团', '密涅瓦', '石路', '北境', '银币', '橡林'], ['木牍书信', '青铜胸针', '诅咒铅片', '军团瓦片', '萨米安陶碗', '骑兵面罩', '石制里程碑', '青铜神像', '银第纳尔', '锁子甲环'], 'kingdom'],
    'anglo-saxon': [['白龙', '鸦旗', '金鹿', '林迪斯', '王栎', '海崖', '灰钟', '银麦', '剑丘', '北星'], ['铁制塞克斯刀', '圆盾', '金石榴石扣', '符文骨盒', '羊皮福音书', '盘形胸针', '银便士', '骨制织梳', '铁制矛头', '圣髑盒'], 'kingdom'],
  },
  'gaul-franks': {
    gaul: [['金颈环', '白鹿', '橡林', '青铜号', '河谷', '山堡', '战车', '圣林', '红盾', '雾丘'], ['高卢金币', '长剑', '盾牌包边', '卡尔尼克斯号', '金颈环', '珊瑚胸针', '双耳酒罐', '铁制农具', '玻璃手镯', '雕纹剑鞘'], 'tribal'],
    'gallo-roman': [['卢格杜努姆', '罗讷', '墨丘利', '石路', '葡萄', '银泉', '军团', '陶窑', '河舟', '圣堂'], ['红陶碗', '祭坛铭文', '马赛克', '青铜神像', '玻璃酒瓶', '军用带扣', '里程碑', '银第纳尔', '骨制发簪', '石棺浮雕'], 'city-state'],
    'merovingian-carolingian': [['金蜂', '白鹿', '王冠', '圣但尼', '亚琛', '银剑', '修院', '橡林', '王玺', '晨星'], ['金三分币', '法兰克斧', '环首剑', '石榴石扣', '羊皮手稿', '王家敕令', '银便士', '圣髑盒', '铁马镫', '象牙书封'], 'kingdom'],
  },
  'ancient-germanic': {
    'germanic-iron-age': [['雷神', '琥珀', '黑林', '沼祭', '狼旗', '河雾', '铁矛', '白桦', '海舟', '鸦丘'], ['木制圆盾', '铁制矛头', '单刃剑', '琥珀珠串', '符文梳', '角制饮器', '扭绳颈环', '沼祭腰带', '船板构件', '铁制镰刀'], 'tribal'],
    'migration-age': [['鹰形', '金石榴', '黑海', '多瑙', '王剑', '鸦旗', '狼骑', '银扣', '海风', '北星'], ['鹰形胸针', '石榴石扣', '环首剑', '骑枪', '金制酒器', '银币', '符文金角', '骨制梳', '玻璃高杯', '马具金饰'], 'tribal'],
  },
  'etruscan-italic': {
    etruscan: [['黑陶', '铜肝', '雷鸟', '王墓', '金粒', '海城', '青铜镜', '酒神', '狮门', '月泉'], ['黑陶杯', '占卜铜肝', '刻铭铜镜', '墓室壁画', '金制胸饰', '青铜鼎', '字母碑铭', '陶制神像', '铁制矛头', '银制钱币'], 'city-state'],
    'italic-peoples': [['山狼', '拉丁', '萨宾', '铁盾', '圣林', '山城', '河神', '青铜', '战誓', '白马'], ['奥斯坎文铜板', '仪式铜板', '圆盾', '青铜胸甲', '铁制标枪', '青铜头盔', '黑釉陶杯', '奉献小铜像', '石制界碑', '银制钱币'], 'tribal'],
  },
  'prehistoric-japan': {
    jomon: [['火焰陶', '漆弓', '贝丘', '黑曜石', '栗林', '环石', '山海', '土偶', '丸木舟', '雪谷'], ['绳文陶钵', '土偶', '磨制石斧', '骨角鱼钩', '漆涂木弓', '石制箭头', '贝制手镯', '编织篮', '磨石', '丸木舟'], 'archaeological'],
    yayoi: [['铜铎', '稻泽', '环壕', '镜光', '海峡', '高仓', '青铜矛', '纒向', '红陶', '铁田'], ['弥生陶壶', '铜铎', '广形铜矛', '铜剑', '铁制锄刃', '木制农具', '高仓柱材', '玻璃勾玉', '纺轮', '铜镜'], 'archaeological'],
    'kofun-yamato': [['大王', '前方丘', '金冠', '埴轮', '大和', '镜光', '马具', '石室', '渡来', '王剑'], ['铭文铁剑', '金铜大刀', '人物埴轮', '圆筒埴轮', '神兽镜', '金铜冠', '马具金饰', '须惠器', '盾形埴轮', '石棺'], 'kingdom'],
  },
  'early-korea': {
    'jeulmun-mumun': [['栉纹', '无纹', '稻河', '石剑', '支石墓', '河海', '青铜镜', '半月刀', '黑陶', '高地'], ['栉文陶钵', '无文陶罐', '半月形石刀', '磨制石剑', '琵琶形铜剑', '多钮铜镜', '支石墓石棺', '石制箭头', '纺轮', '骨制鱼叉'], 'archaeological'],
    gojoseon: [['王险', '浿水', '细剑', '铜镜', '辽东', '铁田', '古朝鲜', '燕币', '木椁', '西北'], ['细形铜剑', '多钮细纹镜', '铁制剑', '铁制犁铧', '长颈陶壶', '车马具铜饰', '燕刀钱', '汉式铜镜', '木椁构件', '瓦当'], 'kingdom'],
    'buyeo-samhan': [['松花', '鹿角', '祭天', '铁港', '扶余', '洛东', '弁韩', '骑风', '黑陶', '铜铃'], ['铁制长剑', '铁锭', '青铜马具', '陶制高杯', '黑陶罐', '鹿角柄刀', '玻璃珠串', '木棺构件', '铜制铃饰', '铁制甲片'], 'tribal'],
  },
  'indus-valley': {
    'early-harappan': [['赤陶', '河城', '铜钻', '红玉髓', '泥砖', '谷仓', '牛车', '石秤', '水渠', '山石'], ['彩陶罐', '早期印章', '铜制钻头', '红玉髓珠', '燧石刀片', '陶制纺轮', '泥砖', '石制砝码', '骨制锥', '陶制牛车'], 'archaeological'],
    'mature-harappan': [['独角兽', '大浴池', '黑印', '红玉髓', '砖渠', '海港', '棉城', '铜秤', '河谷', '谷仓'], ['印度河印章', '石制砝码', '蚀花珠', '青铜人像', '石制人像', '铜制工具', '彩绘陶罐', '棉织物', '烧砖水管', '贝制手镯'], 'archaeological'],
  },
  'gandhara-kushan': {
    'achaemenid-gandhara': [['王道', '阿拉米', '印度河', '山口', '银弓', '波斯', '石城', '商队', '青金', '弯棒币'], ['阿拉米文书', '银制酒碗', '短剑', '弓箭袋', '印章封泥', '弯棒银币', '红玉髓珠', '铁制矛头', '石制砝码', '马具铜饰'], 'kingdom'],
    'indo-greek': [['双语币', '赫拉克勒斯', '佉卢', '白城', '希腊柱', '佛塔', '象军', '葡萄', '山关', '银盾'], ['双语钱币', '佉卢文碑', '科林斯柱头', '佛塔构件', '红玉髓印章', '青铜神像', '铁制骑枪', '玻璃器皿', '双耳罐', '银制酒杯'], 'kingdom'],
    kushan: [['迦腻色迦', '金骑', '佛光', '巴克特里亚', '丝路', '象军', '红砂岩', '山关', '王印', '双河'], ['贵霜金币', '巴克特里亚文碑', '犍陀罗佛像', '红砂岩神像', '青铜弥勒像', '丝绸织物', '玻璃酒杯', '铁制马具', '王家印章', '石制佛塔构件'], 'kingdom'],
  },
  'mesoamerican-formative': {
    olmec: [['巨石首', '玉斧', '雨林', '黑豹', '河沼', '玄武岩', '橡胶', '玉米', '白陶', '神山'], ['巨石头像', '玉制斧', '石制祭坛', '婴儿脸陶像', '血祭穿刺器', '赤铁矿镜', '橡胶球', '白陶器皿', '玉制面具', '黑曜石刀片'], 'archaeological'],
    zapotec: [['云山', '灰陶', '舞者', '谷地', '历法', '石墓', '绿石', '雨神', '黑曜石', '高台'], ['文字石碑', '舞者石刻', '灰陶神像瓮', '墓室壁画', '绿石珠饰', '黑曜石刀片', '三足陶碗', '骨制穿刺器', '历法石碑', '灰泥面具'], 'archaeological'],
    teotihuacan: [['太阳塔', '月亮塔', '羽蛇', '绿曜石', '亡者道', '雨神', '壁画', '黄铁镜', '火神', '白灰泥'], ['三足圆筒器', '绿曜石刀片', '羽蛇石雕', '火神陶像', '雨神壁画', '黄铁矿镜', '灰泥面具', '贝壳耳饰', '黑曜石矛头', '陶制香炉'], 'archaeological'],
  },
  'preinca-andes': {
    caral: [['沉广场', '棉网', '骨笛', '河谷', '芦舟', '石袋', '贝壳', '葫芦', '海风', '高台'], ['骨笛', '骨号', '早期结绳', '棉制渔网', '葫芦容器', '芦苇编篮', '石制重锤', '贝壳珠饰', '泥塑人像', '石袋'], 'archaeological'],
    chavin: [['兰松', '猫神', '鹰纹', '地下廊', '贝号', '黑陶', '金冠', '山泉', '石首', '蛇纹'], ['兰松神像', '石制碑板', '方尖碑', '石制钉头', '贝壳号', '黑陶罐', '金制冠饰', '骨制吸管', '彩绘棉布', '石制研磨钵'], 'archaeological'],
    'moche-nazca': [['月神庙', '金耳饰', '肖像陶', '蜂鸟', '地画', '彩陶', '海鸟', '铜刀', '羽织', '沙河'], ['肖像陶瓶', '金制耳饰', '金制背饰', '铜制仪式刀', '壁画', '彩陶罐', '地画测绳', '羽毛织物', '贝壳饰件', '芦苇舟模型'], 'archaeological'],
    'wari-tiwanaku': [['太阳门', '四角帽', '彩瓮', '羊驼队', '高台田', '湖舟', '石像', '挂毯', '青铜', '山路'], ['彩陶大瓮', '挂毯', '四角帽', '鼻烟盘', '石制太阳门', '石像', '克罗杯', '金制胸饰', '青铜农具', '芦苇舟'], 'archaeological'],
    chimu: [['黑陶', '金面', '海月', '土墙', '灌渠', '银杯', '芦舟', '贝壳', '羽织', '王城'], ['黑陶瓶', '金制面具', '银制烧杯', '铜制图米刀', '羽毛织物', '贝壳饰件', '木制偶像', '棉制渔网', '芦苇舟', '浮雕土墙板'], 'kingdom'],
  },
  'lapita-pacific': {
    lapita: [['齿印陶', '黑曜石', '贝环', '双舟', '礁湖', '季风', '珊瑚', '树皮布', '岛链', '海星'], ['齿印陶罐', '黑曜石刀片', '贝制手镯', '石锛', '贝制鱼钩', '陶制坠饰', '独木舟桨', '树皮布槌', '磨制石器', '贝壳珠串'], 'maritime'],
    'early-polynesian-settlement': [['玄武岩', '双体舟', '珍珠贝', '椰林', '海鸟', '火山岛', '珊瑚', '树皮布', '星航', '礁湖'], ['玄武岩石锛', '珍珠贝鱼钩', '骨制鱼钩', '独木舟桨', '树皮布槌', '贝制胸饰', '珊瑚锉', '火山玻璃刀片', '椰壳容器', '地炉石'], 'maritime'],
  },
}

export const ancientPeriodFictionalProfiles: Record<string, Record<string, FictionalProfile>> = Object.fromEntries(
  Object.entries(ancientFictionalSeeds).map(([culture, periods]) => [culture, Object.fromEntries(
    Object.entries(periods).map(([periodId, [modifiers, item, mode]]) => [periodId, fictionalProfile(modifiers, item, mode)]),
  )]),
)

// Curated whole-name Chinese labels. Source spellings remain in nativeName.
export const ancientLocalizedNames: Record<string, string> = {
  Enmebaragesi: '恩美巴拉格西', Gilgamesh: '吉尔伽美什', Lugalzagesi: '卢伽尔扎吉西', Sargon: '萨尔贡', Rimush: '里穆什', Manishtushu: '玛尼什图苏', 'Naram-Sin': '纳拉姆辛', Gudea: '古地亚', 'Ur-Nammu': '乌尔纳姆', Shulgi: '舒尔吉',
  Puabi: '普阿比', Enheduanna: '恩赫杜安娜', Kubaba: '库巴巴', Tashlultum: '塔什卢尔图姆', Baranamtarra: '巴拉南塔拉', Ninalla: '宁阿拉',
  'Ishbi-Erra': '伊什比埃拉', 'Lipit-Ishtar': '利皮特伊什塔尔', Hammurabi: '汉谟拉比', 'Samsu-iluna': '萨姆苏伊鲁纳', 'Zimri-Lim': '齐姆里林', 'Shamshi-Adad': '沙姆希阿达德', 'Yasmah-Addu': '亚斯马赫阿杜', 'Rim-Sin': '里姆辛', 'Warad-Sin': '瓦拉德辛', Ammisaduqa: '阿米萨杜卡',
  Shibtu: '希卜图', Kirum: '基鲁姆', Iltani: '伊尔塔尼', Beltani: '贝尔塔尼', Lamassi: '拉玛西', 'Taram-Uram': '塔拉姆乌拉姆',
  Ashurnasirpal: '阿淑尔纳西尔帕二世', Shalmaneser: '沙尔马那塞尔', 'Tiglath-pileser': '提格拉特帕拉沙尔', 'Sargon II': '萨尔贡二世', Sennacherib: '辛那赫里布', Esarhaddon: '阿萨尔哈东', Ashurbanipal: '阿淑尔巴尼帕', Nabopolassar: '那波帕拉沙尔', Nebuchadnezzar: '尼布甲尼撒', Nabonidus: '那波尼德',
  'Sammu-ramat': '萨穆拉玛特', 'Naqi’a': '纳基娅', Zakutu: '扎库图', Nitocris: '尼托克丽丝', 'Adad-guppi': '阿达德古皮', 'Libbali-sharrat': '利巴利沙拉特',
  Hattusili: '哈图西里', Mursili: '穆尔西里', Suppiluliuma: '苏庇路里乌玛', Tudhaliya: '图特哈里亚', Arnuwanda: '阿尔努万达', Telepinu: '特列皮努', Kurunta: '库伦塔', 'Kupanta-Kurunta': '库潘塔库伦塔', Tarkasnawa: '塔尔卡斯纳瓦', Warpalawa: '瓦尔帕拉瓦',
  Puduhepa: '普杜赫帕', Tawananna: '塔瓦南娜', Danuhepa: '达努赫帕', Asmunikal: '阿斯穆尼卡尔', 'Manapa-Tarhunta': '玛纳帕塔尔洪塔',
  Midas: '弥达斯', Gordias: '戈尔迪亚斯', Gyges: '巨吉斯', Alyattes: '阿律亚忒斯', Croesus: '克洛伊索斯', Aramu: '阿拉穆', Sarduri: '萨尔杜里', Menua: '美努亚', Argishti: '阿尔吉什提', Rusa: '鲁萨', Midasia: '弥达西娅', Nana: '娜娜', Aryenis: '阿里耶尼斯', Tushpaia: '图什帕娅',
  Niqmaddu: '尼克马杜', Ammittamru: '阿米塔姆鲁', Ibiranu: '伊比拉努', Ugarit: '乌加里特', 'Abdi-Heba': '阿卜迪赫巴', 'Rib-Hadda': '里布哈达', Yapahu: '亚帕胡', Milkilu: '米尔基鲁', Biridiya: '比里迪亚', Labaya: '拉巴亚',
  Ahinoam: '阿希诺安', 'Bint-Anat': '宾特阿纳特', 'Shipti-Baal': '希普提巴力', Hiram: '希兰', Ethbaal: '伊特巴力', 'Baal-Eser': '巴力埃塞尔', Mattan: '马坦', Eshmunazar: '埃什穆纳扎尔', Tabnit: '塔布尼特', Bodashtart: '博达什塔特', Kilamuwa: '基拉穆瓦', 'Bar-Rakib': '巴尔拉基布', Panamuwa: '帕纳穆瓦', Jezebel: '耶洗别', Astarte: '阿斯塔蒂', Batnoam: '巴特诺安', Yapa: '亚帕',
  Skunxa: '斯昆哈', Amorges: '阿摩尔吉斯', Spitamenes: '斯皮塔米尼斯', Oxyartes: '奥克西亚特斯', Diodotus: '狄奥多托斯', Euthydemus: '欧西德穆斯', Demetrius: '德米特里俄斯', Eucratides: '欧克拉提德斯', Heliocles: '赫利奥克勒斯', Maues: '毛厄斯', Tomyris: '托米丽司', Roxana: '罗克珊娜', Apama: '阿帕玛', Agathokleia: '阿伽托克利娅',
  Devashtich: '迪瓦什提奇', Ghurak: '古拉克', Tarkhun: '塔尔浑', Varkhuman: '瓦尔胡曼', 'Nanai-vandak': '娜娜伊万达克', 'An Lushan': '安禄山', 'Kang Senghui': '康僧会', Afrigh: '阿弗里格', Askajamuk: '阿斯卡贾穆克', Shaushafar: '绍沙法尔', 'Mugh Lady': '穆格女主人', 'Chaghanian Lady': '赭时女贵族', Nanaivandak: '娜娜伊万达克',
  Alara: '阿拉拉', Kashta: '卡什塔', Piye: '皮耶', Shabaka: '沙巴卡', Shebitku: '沙比特库', Taharqa: '塔哈尔卡', Tantamani: '坦塔马尼', Aspelta: '阿斯佩尔塔', Anlamani: '安拉马尼', 'Aramatle-qo': '阿拉马特勒科',
  Pabatma: '帕巴特马', Abar: '阿巴尔', Peksater: '佩克萨特尔', Amanirenas: '阿玛尼雷纳斯', Arkamani: '阿尔卡马尼', Adikhalamani: '阿迪卡拉马尼', Natakamani: '纳塔卡马尼', Amanakhareqerem: '阿玛纳哈雷克雷姆', Tarekeniwal: '塔雷凯尼瓦尔', Teqorideamani: '特科里德阿玛尼', Amanishakheto: '阿玛尼沙赫托', Amanitore: '阿玛尼托雷', Shanakdakhete: '沙纳克达赫特', Amanikhatashan: '阿玛尼哈塔尚',
  'Waran Haywat': '瓦兰哈伊瓦特', 'Karib-il Watar': '卡里布伊勒瓦塔尔', RDM: '拉迪姆', SMR: '萨米尔', 'Yada-il': '亚达伊勒', Malki: '马尔基', Shamsi: '沙姆西',
  Zoskales: '佐斯卡勒斯', Endubis: '恩杜比斯', Aphilas: '阿菲拉斯', Wazeba: '瓦泽巴', Ousanas: '乌萨纳斯', Ezana: '埃扎纳', Kaleb: '卡莱布', Armah: '阿尔玛赫', Gersem: '格尔森', Israel: '以色列', Sofya: '索菲娅', Admas: '阿德玛斯', Makeda: '玛凯达',
  Cassivellaunus: '卡西维劳努斯', Tasciovanus: '塔斯基奥瓦努斯', Cunobelinus: '库诺贝利努斯', Caratacus: '卡拉塔库斯', Togodumnus: '托戈杜姆努斯', Verica: '维里卡', Tincomarus: '廷科马鲁斯', Dubnovellaunus: '杜布诺维劳努斯', Boudica: '布狄卡', Cartimandua: '卡提曼杜娅', Eppillus: '埃皮卢斯',
  'Tiberius Claudius Cogidubnus': '提比略·克劳狄·科吉杜布努斯', 'Gaius Julius Alpinus Classicianus': '盖乌斯·尤利乌斯·阿尔皮努斯·克拉西基阿努斯', 'Marcus Minicius Natalis': '马尔库斯·米尼基乌斯·纳塔利斯', Carausius: '卡劳修斯', Allectus: '阿勒克图斯', 'Magnus Maximus': '马格努斯·马克西穆斯', Pelagius: '佩拉纠', 'Lucius Artorius Castus': '卢基乌斯·阿尔托里乌斯·卡斯图斯', 'Claudia Severa': '克劳狄娅·塞维拉', 'Sulpicia Lepidina': '苏尔皮基娅·莱皮迪娜', Regina: '雷吉娜', 'Julia Victorina': '尤利娅·维克托里娜',
  Aethelberht: '埃塞尔伯特', Raedwald: '雷德沃尔德', Edwin: '埃德温', Oswald: '奥斯瓦尔德', Penda: '彭达', Offa: '奥法', Alfred: '阿尔弗雷德', Athelstan: '埃塞尔斯坦', Edgar: '埃德加', Cnut: '克努特', Aethelflaed: '埃塞尔弗莱德', Eadgifu: '伊迪吉芙', Ealhswith: '埃尔斯维丝', Aelfthryth: '埃尔弗思里丝', Hild: '希尔达', Cynethryth: '居内思里丝',
  Vercingetorix: '维钦托利', Ambiorix: '安比奥里克斯', Dumnorix: '杜姆诺里克斯', Diviciacus: '迪维基阿库斯', Orgetorix: '奥尔盖托里克斯', Brennus: '布伦努斯', Bituitus: '比图伊图斯', Casticus: '卡斯提库斯', Correus: '科雷乌斯', Sedullos: '塞杜洛斯', Eponina: '埃波尼娜', Camulogenia: '卡穆洛革尼娅', Boudicca: '布狄卡',
  'Gaius Julius Vindex': '盖乌斯·尤利乌斯·文德克斯', Eumenius: '欧墨尼乌斯', Ausonius: '奥索尼乌斯', 'Sidonius Apollinaris': '西多尼乌斯·阿波利纳里斯', 'Paulinus of Nola': '诺拉的保利努斯', 'Germanus of Auxerre': '欧塞尔的日耳曼努斯', 'Hilary of Poitiers': '普瓦捷的希拉里', 'Martin of Tours': '图尔的玛尔定', Eucheria: '欧凯里娅', Eulalia: '欧拉利娅', Proba: '普罗芭', Avita: '阿维塔',
  Clovis: '克洛维', Chlothar: '克洛塔尔', Childebert: '希尔德贝尔特', Dagobert: '达戈贝尔特', Pepin: '丕平', 'Charles Martel': '查理·马特', Charlemagne: '查理曼', 'Louis the Pious': '虔诚者路易', Lothair: '洛泰尔', 'Hugh Capet': '于格·卡佩', Clotilde: '克洛蒂尔德', Brunhilda: '布伦希尔德', Fredegund: '芙蕾德贡德', Bertrada: '贝特拉达', Gisela: '吉塞拉', Dhuoda: '杜奥达',
  Ariovistus: '阿里奥维斯图斯', Arminius: '阿米尼乌斯', Maroboduus: '马罗博杜乌斯', Segestes: '塞革斯特斯', Inguiomerus: '英吉奥梅鲁斯', Catualda: '卡图阿尔达', Vibilius: '维比利乌斯', Mallovendus: '马洛文杜斯', Civilis: '基维利斯', Veleda: '维莱达', Thusnelda: '图斯内尔达', Ganna: '甘娜', Albruna: '阿尔布鲁娜',
  Alaric: '阿拉里克', Theodoric: '狄奥多里克', Geiseric: '盖萨里克', Odoacer: '奥多亚塞', Wulfila: '乌尔斐拉', Chlodio: '克洛迪奥', Genobaud: '革诺鲍德', Radagaisus: '拉达盖苏斯', Gundobad: '贡多巴德', Theodemir: '狄奥德米尔', Amalasuntha: '阿玛拉逊莎', 'Galla Placidia': '加拉·普拉西狄娅', Audofleda: '奥多弗莱达', Ragnagild: '拉格纳吉尔德', Erelieva: '埃雷利耶娃',
  Larth: '拉尔特', Vel: '维尔', Aule: '奥莱', Arnth: '阿恩特', 'Avile Tite': '阿维莱·提特', 'Thefarie Velianas': '塞法里耶·维利亚纳斯', 'Larth Porsenna': '拉尔特·波尔森纳', 'Caile Vipinas': '凯莱·维皮纳斯', 'Aule Metelis': '奥莱·梅特利斯', Spurinna: '斯普林纳', Tanaquil: '塔纳奎尔', Ramtha: '拉姆塔', Larthia: '拉尔蒂娅', Thanchvil: '坦赫维尔', Seianti: '塞安蒂',
  'Titus Tatius': '提图斯·塔提乌斯', 'Attius Clausus': '阿提乌斯·克劳苏斯', 'Gaius Pontius': '盖乌斯·庞提乌斯', 'Herennius Bassus': '赫伦尼乌斯·巴苏斯', 'Vettius Scato': '维提乌斯·斯卡托', 'Marius Egnatius': '马里乌斯·埃格纳提乌斯', 'Quintus Poppaedius Silo': '昆图斯·波派狄乌斯·西洛', 'Herius Asinius': '赫里乌斯·阿西尼乌斯', Hersilia: '赫西利娅', Tarpeia: '塔尔佩娅', Vibia: '维比娅', Polla: '波拉',
  Suisho: '帅升', 'Mimaki-iri-hiko': '御间城入彦', 'Ikume-iri-hiko': '活目入彦', Nakatsuhiko: '中津彦', Himiko: '卑弥呼', Iyo: '壹与',
  'Homuda Wake': '誉田别', 'Oasazuma Wakugo': '允恭天皇', 'Ohohatsuse Wakatakeru': '雄略天皇', 'Wohatsuse Wakasazaki': '武烈天皇', Keitai: '继体天皇', Kinmei: '钦明天皇', 'Soga no Iname': '苏我稻目', 'Mononobe no Okoshi': '物部尾舆',
  'Iwa no Hime': '磐之媛', 'Sotoori Hime': '衣通姬', 'Kasuga no Iratsume': '春日娘子', 'Princess Tashiraka': '手白香皇女',
  Wiman: '卫满', Ugeo: '右渠', 'Yeok Gye-gyeong': '历谿卿', Bu: '否王', Jun: '准王', Haemosu: '解慕漱', Geumwa: '金蛙王', Daeso: '带素王', Wutae: '优台', Gutae: '仇台', Suro: '首露王', Talhae: '脱解尼师今', Jumong: '朱蒙', Yuhwa: '柳花', Soseono: '召西奴', 'Heo Hwang-ok': '许黄玉',
  Pukkusati: '弗迦罗娑梨', Taxiles: '塔克西勒斯', Ambhi: '安比', Astes: '阿斯提斯', Arsakes: '阿尔萨凯斯', Bagadata: '巴加达塔', Mazakes: '马扎凯斯',
  Apollodotus: '阿波罗多托斯', Menander: '米南德', Antialcidas: '安提阿尔基达斯', Agathocles: '阿伽托克利斯', Pantaleon: '潘塔利翁', Strato: '斯特拉托', Amyntas: '阿明塔斯', Hermaeus: '赫尔迈奥斯', Calliope: '卡利俄珀', Berenike: '贝勒尼基',
  'Kujula Kadphises': '丘就却', 'Vima Takto': '韦玛·塔克图', 'Vima Kadphises': '阎膏珍', Kanishka: '迦腻色迦', Huvishka: '胡毗色伽', Vasudeva: '波调', Kipunada: '基普纳达',
  Tacaynamo: '塔凯纳莫', Guacricaur: '瓜克里考尔', Naucempinco: '瑙森平科', Minchancaman: '明昌卡曼', 'Chumun Caur': '楚蒙考尔',
}
