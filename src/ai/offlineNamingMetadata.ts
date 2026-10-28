import type { OfflineCulture, OfflinePeriod } from './offlineNamingData'

export type OfflineCultureMetadata = {
  id: OfflineCulture
  label: string
  region: string
  periods: OfflinePeriod[]
}

export const offlineCultureMetadata: OfflineCultureMetadata[] = [
  {
    "id": "chinese",
    "label": "中国（华夏—汉文化）",
    "region": "东亚",
    "periods": [
      {
        "id": "paleolithic-reference",
        "label": "中国旧石器时代（约前170万—前1万年）",
        "personData": "archaeological"
      },
      {
        "id": "neolithic-reference",
        "label": "中国新石器时代文化群（约前1万—前1900年）",
        "personData": "archaeological"
      },
      {
        "id": "xia-erlitou",
        "label": "夏与二里头文化（约前2070—前1600年）",
        "personData": "archaeological"
      },
      {
        "id": "shang-western-zhou",
        "label": "商与西周（约前1600—前771年）"
      },
      {
        "id": "eastern-zhou",
        "label": "春秋战国（前770—前221年）"
      },
      {
        "id": "qin-han",
        "label": "秦汉（前221—220年）"
      },
      {
        "id": "wei-jin-tang",
        "label": "魏晋隋唐"
      },
      {
        "id": "song-yuan",
        "label": "宋元"
      },
      {
        "id": "ming-qing",
        "label": "明清"
      },
      {
        "id": "republic",
        "label": "民国"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "japanese",
    "label": "日本列岛",
    "region": "东亚",
    "periods": [
      {
        "id": "jomon",
        "label": "绳文时代（约前14000—前900年）",
        "personData": "archaeological"
      },
      {
        "id": "yayoi",
        "label": "弥生时代（约前900—公元250年）"
      },
      {
        "id": "kofun-yamato",
        "label": "古坟—早期大和（约250—592年）"
      },
      {
        "id": "asuka-nara",
        "label": "飞鸟至奈良"
      },
      {
        "id": "heian",
        "label": "平安"
      },
      {
        "id": "kamakura-muromachi",
        "label": "镰仓至室町"
      },
      {
        "id": "sengoku-azuchi",
        "label": "战国至安土桃山"
      },
      {
        "id": "edo",
        "label": "江户"
      },
      {
        "id": "meiji-showa",
        "label": "明治至昭和前期"
      },
      {
        "id": "modern",
        "label": "战后至现代"
      }
    ]
  },
  {
    "id": "korean",
    "label": "朝鲜半岛",
    "region": "东亚",
    "periods": [
      {
        "id": "jeulmun-mumun",
        "label": "栉文—无文陶器时代（约前8000—前300年）",
        "personData": "archaeological"
      },
      {
        "id": "gojoseon",
        "label": "古朝鲜与卫满朝鲜（约前4—前1世纪）"
      },
      {
        "id": "buyeo-samhan",
        "label": "扶余、沃沮、东濊与三韩（约前2—公元3世纪）"
      },
      {
        "id": "three-kingdoms",
        "label": "三国时代"
      },
      {
        "id": "unified-silla",
        "label": "统一新罗"
      },
      {
        "id": "goryeo",
        "label": "高丽"
      },
      {
        "id": "early-joseon",
        "label": "朝鲜前期"
      },
      {
        "id": "late-joseon",
        "label": "朝鲜后期"
      },
      {
        "id": "korean-empire",
        "label": "大韩帝国"
      },
      {
        "id": "colonial",
        "label": "近代殖民时期"
      },
      {
        "id": "south-modern",
        "label": "战后韩国"
      },
      {
        "id": "north-modern",
        "label": "战后朝鲜"
      }
    ]
  },
  {
    "id": "english",
    "label": "英格兰",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪英格兰"
      },
      {
        "id": "early-modern",
        "label": "近世英格兰"
      },
      {
        "id": "modern",
        "label": "现代英格兰"
      }
    ]
  },
  {
    "id": "french",
    "label": "法国",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "ancien-regime",
        "label": "近世"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "german",
    "label": "德意志地区",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪德意志"
      },
      {
        "id": "early-modern",
        "label": "近世德意志"
      },
      {
        "id": "modern",
        "label": "现代德国"
      }
    ]
  },
  {
    "id": "italian",
    "label": "意大利",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "renaissance",
        "label": "文艺复兴"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "iberian",
    "label": "西班牙",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪西班牙诸王国"
      },
      {
        "id": "early-modern",
        "label": "近世西班牙"
      },
      {
        "id": "modern",
        "label": "现代西班牙"
      }
    ]
  },
  {
    "id": "norse",
    "label": "挪威/古诺斯",
    "region": "欧洲",
    "periods": [
      {
        "id": "viking",
        "label": "挪威维京时代"
      },
      {
        "id": "medieval",
        "label": "中世纪挪威"
      },
      {
        "id": "modern",
        "label": "现代挪威"
      }
    ]
  },
  {
    "id": "icelandic",
    "label": "冰岛",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪冰岛"
      },
      {
        "id": "modern",
        "label": "现代冰岛"
      }
    ]
  },
  {
    "id": "ancient-greek",
    "label": "古希腊",
    "region": "欧洲",
    "periods": [
      {
        "id": "archaic",
        "label": "古风时期"
      },
      {
        "id": "classical",
        "label": "古典时期"
      },
      {
        "id": "hellenistic",
        "label": "希腊化时期"
      }
    ]
  },
  {
    "id": "ancient-rome",
    "label": "古罗马",
    "region": "欧洲",
    "periods": [
      {
        "id": "republic",
        "label": "罗马共和国"
      },
      {
        "id": "empire",
        "label": "罗马帝国"
      }
    ]
  },
  {
    "id": "egyptian",
    "label": "埃及",
    "region": "非洲",
    "periods": [
      {
        "id": "ancient",
        "label": "古埃及"
      },
      {
        "id": "ptolemaic",
        "label": "托勒密埃及"
      },
      {
        "id": "modern",
        "label": "现代埃及"
      }
    ]
  },
  {
    "id": "india-north",
    "label": "北印度（恒河—印度河历史区）",
    "region": "南亚",
    "periods": [
      {
        "id": "vedic-mahajanapada",
        "label": "吠陀晚期与十六大国（约前800—前321年）"
      },
      {
        "id": "maurya-gupta",
        "label": "孔雀—笈多时期（约前321—公元550年）"
      },
      {
        "id": "medieval",
        "label": "中世纪北印度"
      },
      {
        "id": "modern",
        "label": "现代北印度"
      }
    ]
  },
  {
    "id": "india-south",
    "label": "南印度（早期泰米尔—德干）",
    "region": "南亚",
    "periods": [
      {
        "id": "sangam-satavahana",
        "label": "桑伽姆—萨塔瓦哈纳时期（约前300—公元300年）"
      },
      {
        "id": "early-kingdoms",
        "label": "早期南印度王国（约300—900年）"
      },
      {
        "id": "medieval",
        "label": "中世纪南印度"
      },
      {
        "id": "modern",
        "label": "现代南印度"
      }
    ]
  },
  {
    "id": "vietnamese",
    "label": "越南",
    "region": "东南亚",
    "periods": [
      {
        "id": "dynastic",
        "label": "历史王朝"
      },
      {
        "id": "colonial",
        "label": "近代"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "thai",
    "label": "泰国",
    "region": "东南亚",
    "periods": [
      {
        "id": "traditional",
        "label": "传统时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "malay",
    "label": "马来/印度尼西亚",
    "region": "东南亚",
    "periods": [
      {
        "id": "traditional",
        "label": "传统时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "filipino",
    "label": "菲律宾",
    "region": "东南亚",
    "periods": [
      {
        "id": "precolonial",
        "label": "前殖民时期"
      },
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "yoruba",
    "label": "西非约鲁巴",
    "region": "非洲",
    "periods": [
      {
        "id": "traditional",
        "label": "传统时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "amharic",
    "label": "东非阿姆哈拉",
    "region": "非洲",
    "periods": [
      {
        "id": "imperial",
        "label": "帝国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "swahili",
    "label": "东非斯瓦希里",
    "region": "非洲",
    "periods": [
      {
        "id": "precolonial",
        "label": "前殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "zulu-xhosa",
    "label": "南部非洲祖鲁/科萨",
    "region": "非洲",
    "periods": [
      {
        "id": "precolonial",
        "label": "前殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "north-american",
    "label": "北美英语区",
    "region": "北美",
    "periods": [
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "mesoamerican",
    "label": "中美洲（纳瓦特尔/玛雅）",
    "region": "中美洲",
    "periods": [
      {
        "id": "precolonial",
        "label": "前殖民时期"
      },
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "andean",
    "label": "安第斯（克丘亚/艾马拉）",
    "region": "南美洲",
    "periods": [
      {
        "id": "precolonial",
        "label": "前殖民时期"
      },
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "russian-siberian",
    "label": "俄罗斯/西伯利亚",
    "region": "北亚与中亚",
    "periods": [
      {
        "id": "tsardom",
        "label": "沙皇时期"
      },
      {
        "id": "imperial",
        "label": "帝国时期"
      },
      {
        "id": "soviet",
        "label": "苏联时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "mongolian",
    "label": "蒙古草原",
    "region": "东亚",
    "periods": [
      {
        "id": "pre-empire",
        "label": "部落联盟时期"
      },
      {
        "id": "empire",
        "label": "蒙古帝国时期"
      },
      {
        "id": "northern-yuan",
        "label": "北元时期"
      },
      {
        "id": "oirat-khanates",
        "label": "瓦剌与准噶尔时期"
      },
      {
        "id": "qing",
        "label": "清代蒙古"
      },
      {
        "id": "socialist",
        "label": "社会主义时期"
      },
      {
        "id": "modern",
        "label": "现代蒙古"
      }
    ]
  },
  {
    "id": "tibetan",
    "label": "藏区",
    "region": "东亚",
    "periods": [
      {
        "id": "empire",
        "label": "吐蕃时期"
      },
      {
        "id": "fragmentation",
        "label": "分裂割据时期"
      },
      {
        "id": "sakya-yuan",
        "label": "萨迦与元代"
      },
      {
        "id": "phagmodrupa",
        "label": "帕木竹巴时期"
      },
      {
        "id": "ganden-phodrang",
        "label": "甘丹颇章时期"
      },
      {
        "id": "modern",
        "label": "近现代藏区"
      }
    ]
  },
  {
    "id": "arabic",
    "label": "阿拉伯语区",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "classical",
        "label": "古典时期"
      },
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "persian",
    "label": "波斯语区",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "ancient",
        "label": "古波斯"
      },
      {
        "id": "classical",
        "label": "古典波斯"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "turkic-central-asian",
    "label": "突厥/中亚",
    "region": "北亚与中亚",
    "periods": [
      {
        "id": "steppe",
        "label": "草原时期"
      },
      {
        "id": "khanate",
        "label": "汗国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "celtic",
    "label": "爱尔兰盖尔",
    "region": "欧洲",
    "periods": [
      {
        "id": "ogham",
        "label": "欧甘铭文期爱尔兰（约4—7世纪）"
      },
      {
        "id": "early-medieval",
        "label": "早期中世纪爱尔兰"
      },
      {
        "id": "medieval",
        "label": "盖尔中世纪"
      },
      {
        "id": "modern",
        "label": "现代爱尔兰"
      }
    ]
  },
  {
    "id": "slavic-east",
    "label": "乌克兰/鲁塞尼亚",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "基辅罗斯与鲁塞尼亚"
      },
      {
        "id": "imperial",
        "label": "近世乌克兰与鲁塞尼亚"
      },
      {
        "id": "modern",
        "label": "现代乌克兰"
      }
    ]
  },
  {
    "id": "hausa-fulani",
    "label": "豪萨/富拉尼",
    "region": "非洲",
    "periods": [
      {
        "id": "sahel",
        "label": "萨赫勒传统时期"
      },
      {
        "id": "emirate",
        "label": "埃米尔时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "indigenous-north-american",
    "label": "北美原住民",
    "region": "北美",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "historical",
        "label": "历史时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "polynesian",
    "label": "波利尼西亚",
    "region": "大洋洲",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "voyaging",
        "label": "航海传统时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "manchu",
    "label": "满洲",
    "region": "东亚",
    "periods": [
      {
        "id": "jin-jurchen",
        "label": "金代女真"
      },
      {
        "id": "late-jurchen",
        "label": "明代女真"
      },
      {
        "id": "later-jin",
        "label": "后金时期"
      },
      {
        "id": "early-qing",
        "label": "清前中期"
      },
      {
        "id": "late-qing",
        "label": "清后期"
      },
      {
        "id": "modern",
        "label": "近现代满族"
      }
    ]
  },
  {
    "id": "burmese",
    "label": "缅甸",
    "region": "东南亚",
    "periods": [
      {
        "id": "pagan",
        "label": "蒲甘时期"
      },
      {
        "id": "konbaung",
        "label": "贡榜时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "khmer-lao",
    "label": "高棉/老挝",
    "region": "东南亚",
    "periods": [
      {
        "id": "angkor",
        "label": "吴哥时期"
      },
      {
        "id": "lan-xang",
        "label": "澜沧时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "bengali",
    "label": "孟加拉（古代—现代）",
    "region": "南亚",
    "periods": [
      {
        "id": "vanga-gauda",
        "label": "文伽—高达古代孟加拉（约前300—公元750年）"
      },
      {
        "id": "pala",
        "label": "波罗时期"
      },
      {
        "id": "sultanate",
        "label": "苏丹时期"
      },
      {
        "id": "modern",
        "label": "现代孟加拉"
      }
    ]
  },
  {
    "id": "punjabi-urdu",
    "label": "旁遮普/乌尔都（中古以后）",
    "region": "南亚",
    "periods": [
      {
        "id": "sultanate",
        "label": "苏丹时期"
      },
      {
        "id": "mughal",
        "label": "莫卧儿时期"
      },
      {
        "id": "modern",
        "label": "现代旁遮普/乌尔都语区"
      }
    ]
  },
  {
    "id": "ottoman-turkish",
    "label": "奥斯曼土耳其",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "rise",
        "label": "崛起时期"
      },
      {
        "id": "classical",
        "label": "古典时期"
      },
      {
        "id": "late",
        "label": "晚期"
      }
    ]
  },
  {
    "id": "somali",
    "label": "索马里",
    "region": "非洲",
    "periods": [
      {
        "id": "sultanate",
        "label": "苏丹国时期"
      },
      {
        "id": "colonial",
        "label": "近代"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "igbo-akan",
    "label": "伊博/阿肯",
    "region": "非洲",
    "periods": [
      {
        "id": "kingdoms",
        "label": "王国时期"
      },
      {
        "id": "colonial",
        "label": "近代"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "brazilian-tupi",
    "label": "巴西/图皮-瓜拉尼",
    "region": "南美洲",
    "periods": [
      {
        "id": "precolonial",
        "label": "前殖民时期"
      },
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "caribbean",
    "label": "加勒比",
    "region": "北美",
    "periods": [
      {
        "id": "precolonial",
        "label": "前殖民时期"
      },
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "maori",
    "label": "毛利",
    "region": "大洋洲",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "tribal",
        "label": "部族时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "dutch-lowlands",
    "label": "荷兰/尼德兰低地",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪尼德兰低地"
      },
      {
        "id": "early-modern",
        "label": "荷兰共和国时期"
      },
      {
        "id": "modern",
        "label": "现代荷兰语区"
      }
    ]
  },
  {
    "id": "roman-low-countries",
    "label": "罗马时期莱茵河下游",
    "region": "欧洲",
    "periods": [
      {
        "id": "roman",
        "label": "罗马时期低地（约前1世纪—4世纪）"
      }
    ]
  },
  {
    "id": "early-slavic",
    "label": "早期斯拉夫",
    "region": "欧洲",
    "periods": [
      {
        "id": "migration-era",
        "label": "迁徙时期早期斯拉夫（6—8世纪）"
      }
    ]
  },
  {
    "id": "baltic",
    "label": "立陶宛",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪立陶宛大公国"
      },
      {
        "id": "early-modern",
        "label": "近世立陶宛"
      },
      {
        "id": "modern",
        "label": "现代立陶宛"
      }
    ]
  },
  {
    "id": "balkan",
    "label": "塞尔维亚",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪塞尔维亚"
      },
      {
        "id": "ottoman",
        "label": "奥斯曼统治与革命时期塞尔维亚"
      },
      {
        "id": "modern",
        "label": "现代塞尔维亚"
      }
    ]
  },
  {
    "id": "caucasus",
    "label": "奥塞梯/阿兰",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "alanian",
        "label": "阿兰王国与奥塞梯版纳尔特传统"
      },
      {
        "id": "imperial",
        "label": "俄国统治时期奥塞梯"
      },
      {
        "id": "modern",
        "label": "现代奥塞梯"
      }
    ]
  },
  {
    "id": "kurdish",
    "label": "库尔德",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "emirate",
        "label": "埃米尔时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "tamil-telugu",
    "label": "泰米尔/泰卢固",
    "region": "南亚",
    "periods": [
      {
        "id": "ancient",
        "label": "古代"
      },
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "javanese-sundanese",
    "label": "爪哇/巽他",
    "region": "东南亚",
    "periods": [
      {
        "id": "majapahit",
        "label": "满者伯夷时期"
      },
      {
        "id": "sultanate",
        "label": "苏丹时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "oromo-shona",
    "label": "奥罗莫/绍纳",
    "region": "非洲",
    "periods": [
      {
        "id": "kingdoms",
        "label": "王国时期"
      },
      {
        "id": "colonial",
        "label": "近代"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "amazonian",
    "label": "亚马孙流域",
    "region": "南美洲",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "polish",
    "label": "波兰",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "early-modern",
        "label": "近世"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "hungarian",
    "label": "匈牙利",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "early-modern",
        "label": "近世"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "armenian",
    "label": "亚美尼亚",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "kingdom",
        "label": "王国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "georgian",
    "label": "格鲁吉亚",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "kingdom",
        "label": "王国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "marathi-gujarati",
    "label": "马拉地/古吉拉特（西印度与德干）",
    "region": "南亚",
    "periods": [
      {
        "id": "satavahana-western-deccan",
        "label": "萨塔瓦哈纳—西部刹帝利古代德干（约前100—公元400年）"
      },
      {
        "id": "medieval",
        "label": "中世纪西印度"
      },
      {
        "id": "maratha",
        "label": "马拉地时期"
      },
      {
        "id": "modern",
        "label": "现代西印度"
      }
    ]
  },
  {
    "id": "kannada-malayalam",
    "label": "卡纳达/马拉雅拉姆",
    "region": "南亚",
    "periods": [
      {
        "id": "ancient",
        "label": "古代"
      },
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "malagasy",
    "label": "马达加斯加",
    "region": "非洲",
    "periods": [
      {
        "id": "kingdom",
        "label": "王国时期"
      },
      {
        "id": "colonial",
        "label": "近代"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "melanesian-australian",
    "label": "美拉尼西亚/澳洲原住民",
    "region": "大洋洲",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "colonial",
        "label": "近代"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "hebrew-jewish",
    "label": "希伯来/犹太",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "biblical",
        "label": "圣经时期"
      },
      {
        "id": "diaspora",
        "label": "散居时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "assyrian",
    "label": "亚述/美索不达米亚",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "ancient",
        "label": "古代亚述"
      },
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "romani",
    "label": "罗姆",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪迁徙时期"
      },
      {
        "id": "early-modern",
        "label": "近世"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "sami",
    "label": "萨米",
    "region": "北亚与中亚",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "traditional",
        "label": "传统时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "canadian-french",
    "label": "法裔加拿大",
    "region": "北美",
    "periods": [
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "confederation",
        "label": "联邦时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "australian-aboriginal",
    "label": "澳洲原住民",
    "region": "大洋洲",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "colonial",
        "label": "近代"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "finnish",
    "label": "芬兰",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "national",
        "label": "民族复兴时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "albanian-romanian",
    "label": "阿尔巴尼亚/罗马尼亚",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "ottoman",
        "label": "奥斯曼时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "amazigh-tuareg",
    "label": "阿马齐格/图阿雷格",
    "region": "非洲",
    "periods": [
      {
        "id": "ancient",
        "label": "古代"
      },
      {
        "id": "caravan",
        "label": "撒哈拉商路时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "pashtun-tajik",
    "label": "普什图/塔吉克",
    "region": "北亚与中亚",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "emirate",
        "label": "埃米尔时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "nepali-sinhala",
    "label": "尼泊尔/僧伽罗",
    "region": "南亚",
    "periods": [
      {
        "id": "ancient",
        "label": "古代"
      },
      {
        "id": "kingdom",
        "label": "王国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "inuit",
    "label": "因纽特",
    "region": "北美",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "historical",
        "label": "历史时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "mapuche",
    "label": "马普切",
    "region": "南美洲",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "micronesian-fijian",
    "label": "密克罗尼西亚/斐济",
    "region": "大洋洲",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "chiefdom",
        "label": "酋邦时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "uyghur",
    "label": "维吾尔",
    "region": "北亚与中亚",
    "periods": [
      {
        "id": "silk-road",
        "label": "丝路时期"
      },
      {
        "id": "khanate",
        "label": "汗国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "kazakh",
    "label": "哈萨克",
    "region": "北亚与中亚",
    "periods": [
      {
        "id": "steppe",
        "label": "草原时期"
      },
      {
        "id": "khanate",
        "label": "汗国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "kyrgyz",
    "label": "吉尔吉斯",
    "region": "北亚与中亚",
    "periods": [
      {
        "id": "steppe",
        "label": "草原时期"
      },
      {
        "id": "khanate",
        "label": "汗国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "uzbek",
    "label": "乌兹别克",
    "region": "北亚与中亚",
    "periods": [
      {
        "id": "timurid",
        "label": "帖木儿时期"
      },
      {
        "id": "khanate",
        "label": "汗国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "turkmen",
    "label": "土库曼",
    "region": "北亚与中亚",
    "periods": [
      {
        "id": "tribal",
        "label": "部族时期"
      },
      {
        "id": "khanate",
        "label": "汗国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "tajik",
    "label": "塔吉克",
    "region": "北亚与中亚",
    "periods": [
      {
        "id": "samanid",
        "label": "萨曼王朝时期"
      },
      {
        "id": "emirate",
        "label": "埃米尔时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "navajo-apache",
    "label": "纳瓦霍/阿帕奇",
    "region": "北美",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "historical",
        "label": "历史时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "haudenosaunee",
    "label": "易洛魁/豪德诺绍尼",
    "region": "北美",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "confederacy",
        "label": "联盟时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "pueblo",
    "label": "普韦布洛",
    "region": "北美",
    "periods": [
      {
        "id": "ancestral",
        "label": "祖先普韦布洛时期"
      },
      {
        "id": "historical",
        "label": "历史时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "northwest-coast",
    "label": "西北海岸原住民",
    "region": "北美",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "historical",
        "label": "历史时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "maya",
    "label": "玛雅",
    "region": "中美洲",
    "periods": [
      {
        "id": "preclassic",
        "label": "前古典时期"
      },
      {
        "id": "classic",
        "label": "古典时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "nahuatl",
    "label": "纳瓦特尔/阿兹特克",
    "region": "中美洲",
    "periods": [
      {
        "id": "precontact",
        "label": "前殖民时期"
      },
      {
        "id": "empire",
        "label": "三方同盟时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "quechua",
    "label": "克丘亚",
    "region": "南美洲",
    "periods": [
      {
        "id": "inca",
        "label": "印加时期"
      },
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "aymara",
    "label": "艾马拉",
    "region": "南美洲",
    "periods": [
      {
        "id": "preinca",
        "label": "前印加时期"
      },
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "modern-greek",
    "label": "现代希腊",
    "region": "欧洲",
    "periods": [
      {
        "id": "byzantine",
        "label": "拜占庭时期"
      },
      {
        "id": "independence",
        "label": "独立时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "portuguese",
    "label": "葡萄牙语区",
    "region": "欧洲",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "colonial",
        "label": "殖民时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "balinese",
    "label": "巴厘",
    "region": "东南亚",
    "periods": [
      {
        "id": "majapahit",
        "label": "满者伯夷时期"
      },
      {
        "id": "kingdom",
        "label": "王国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "minangkabau",
    "label": "米南加保",
    "region": "东南亚",
    "periods": [
      {
        "id": "sultanate",
        "label": "苏丹时期"
      },
      {
        "id": "adat",
        "label": "习惯法时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "akan",
    "label": "阿肯",
    "region": "非洲",
    "periods": [
      {
        "id": "kingdoms",
        "label": "王国时期"
      },
      {
        "id": "colonial",
        "label": "近代"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "igbo",
    "label": "伊博",
    "region": "非洲",
    "periods": [
      {
        "id": "kingdoms",
        "label": "王国时期"
      },
      {
        "id": "colonial",
        "label": "近代"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "hausa",
    "label": "豪萨",
    "region": "非洲",
    "periods": [
      {
        "id": "sahel",
        "label": "萨赫勒传统时期"
      },
      {
        "id": "emirate",
        "label": "埃米尔时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "fulani",
    "label": "富拉尼",
    "region": "非洲",
    "periods": [
      {
        "id": "pastoral",
        "label": "游牧传统时期"
      },
      {
        "id": "emirate",
        "label": "埃米尔时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "wolof",
    "label": "沃洛夫",
    "region": "非洲",
    "periods": [
      {
        "id": "kingdoms",
        "label": "王国时期"
      },
      {
        "id": "colonial",
        "label": "近代"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "kongo",
    "label": "刚果文化带",
    "region": "非洲",
    "periods": [
      {
        "id": "kingdoms",
        "label": "刚果王国时期"
      },
      {
        "id": "colonial",
        "label": "近代"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "azerbaijani",
    "label": "阿塞拜疆",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "medieval",
        "label": "中世纪"
      },
      {
        "id": "khanate",
        "label": "汗国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "chechen-dagestan",
    "label": "车臣/达吉斯坦",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "mountain",
        "label": "山地传统时期"
      },
      {
        "id": "imperial",
        "label": "帝国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "hawaiian",
    "label": "夏威夷",
    "region": "大洋洲",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "kingdom",
        "label": "王国时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "samoan-tongan",
    "label": "萨摩亚/汤加",
    "region": "大洋洲",
    "periods": [
      {
        "id": "precontact",
        "label": "接触前时期"
      },
      {
        "id": "chiefdom",
        "label": "酋邦时期"
      },
      {
        "id": "modern",
        "label": "现代"
      }
    ]
  },
  {
    "id": "dong-son-au-lac",
    "label": "红河流域（东山—瓯雒）",
    "region": "东南亚",
    "periods": [
      {
        "id": "archaeological",
        "label": "东山文化与瓯雒（约前600—前111年）",
        "personData": "archaeological"
      }
    ]
  },
  {
    "id": "sa-huynh-champa",
    "label": "越南中部（沙黄—早期占婆）",
    "region": "东南亚",
    "periods": [
      {
        "id": "sa-huynh",
        "label": "沙黄文化（约前1000—公元200年）",
        "personData": "archaeological"
      },
      {
        "id": "early-champa",
        "label": "林邑与早期占婆（约2—7世纪）"
      }
    ]
  },
  {
    "id": "funan-chenla",
    "label": "湄公河下游（扶南—真腊）",
    "region": "东南亚",
    "periods": [
      {
        "id": "funan",
        "label": "扶南（约1—6世纪）"
      },
      {
        "id": "chenla",
        "label": "真腊（约6—8世纪）"
      }
    ]
  },
  {
    "id": "pyu-city-states",
    "label": "伊洛瓦底江流域（骠人城邦）",
    "region": "东南亚",
    "periods": [
      {
        "id": "pyu",
        "label": "骠人城邦（约2世纪前后—9世纪）"
      }
    ]
  },
  {
    "id": "dvaravati-mon",
    "label": "湄南河流域（堕罗钵底—孟人）",
    "region": "东南亚",
    "periods": [
      {
        "id": "dvaravati",
        "label": "堕罗钵底与早期孟人城邦（约6—11世纪）",
        "personData": "archaeological"
      }
    ]
  },
  {
    "id": "old-malay-srivijaya",
    "label": "古马来（古吉打—室利佛逝）",
    "region": "东南亚",
    "periods": [
      {
        "id": "kedah",
        "label": "古吉打与马来半岛港市（约2—7世纪）",
        "personData": "archaeological"
      },
      {
        "id": "srivijaya",
        "label": "室利佛逝（约7—13世纪）"
      }
    ]
  },
  {
    "id": "old-javanese-medang",
    "label": "古爪哇（诃陵—马打兰）",
    "region": "东南亚",
    "periods": [
      {
        "id": "kalingga",
        "label": "诃陵与早期爪哇（约5—8世纪）"
      },
      {
        "id": "medang",
        "label": "古马打兰—卡胡里潘（约8—11世纪）"
      }
    ]
  },
  {
    "id": "old-bali",
    "label": "古巴厘（佩坚—瓦尔马德瓦）",
    "region": "东南亚",
    "periods": [
      {
        "id": "pejeng",
        "label": "佩坚青铜文化",
        "personData": "archaeological"
      },
      {
        "id": "warmadewa",
        "label": "古巴厘与瓦尔马德瓦王朝（约9—11世纪）"
      }
    ]
  },
  {
    "id": "mesopotamia",
    "label": "两河流域（苏美尔—巴比伦）",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "sumer-akkad",
        "label": "苏美尔—阿卡德（约前3500—前2000年）"
      },
      {
        "id": "old-babylon",
        "label": "乌尔第三王朝—古巴比伦（约前2112—前1595年）"
      },
      {
        "id": "neo-assyria-babylon",
        "label": "新亚述—新巴比伦（前911—前539年）"
      }
    ]
  },
  {
    "id": "bronze-iron-anatolia",
    "label": "古安纳托利亚（赫梯—吕底亚）",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "hittite-luwian",
        "label": "赫梯—卢维亚（约前1650—前700年）"
      },
      {
        "id": "phrygia-lydia-urartu",
        "label": "弗里吉亚—吕底亚—乌拉尔图（约前1200—前546年）"
      }
    ]
  },
  {
    "id": "ancient-levant",
    "label": "古代黎凡特（乌加里特—腓尼基）",
    "region": "西亚与高加索",
    "periods": [
      {
        "id": "ugarit-canaan",
        "label": "乌加里特—青铜时代迦南（约前1600—前1200年）"
      },
      {
        "id": "phoenician-aramaean",
        "label": "腓尼基—阿拉米城邦（约前1200—前300年）"
      }
    ]
  },
  {
    "id": "iranian-central-asia",
    "label": "古代中亚伊朗语文化（塞种—粟特）",
    "region": "北亚与中亚",
    "periods": [
      {
        "id": "saka-bactria",
        "label": "塞种—巴克特里亚（约前700—公元300年）"
      },
      {
        "id": "sogdia-khwarazm",
        "label": "粟特—花剌子模（约300—900年）"
      }
    ]
  },
  {
    "id": "nubia-kush",
    "label": "尼罗河中上游（克尔玛—库施）",
    "region": "非洲",
    "periods": [
      {
        "id": "kerma",
        "label": "克尔玛文化（约前2500—前1500年）",
        "personData": "archaeological"
      },
      {
        "id": "napata",
        "label": "纳帕塔库施（约前900—前270年）"
      },
      {
        "id": "meroe",
        "label": "麦罗埃库施（约前270—公元350年）"
      }
    ]
  },
  {
    "id": "aksum-horn",
    "label": "非洲之角（德阿马特—阿克苏姆）",
    "region": "非洲",
    "periods": [
      {
        "id": "dmt",
        "label": "德阿马特与前阿克苏姆时期（约前800—前400年）"
      },
      {
        "id": "aksum",
        "label": "阿克苏姆王国（约100—900年）"
      }
    ]
  },
  {
    "id": "early-britain",
    "label": "早期不列颠（铁器时代—盎格鲁-撒克逊）",
    "region": "欧洲",
    "periods": [
      {
        "id": "iron-age-britain",
        "label": "铁器时代不列颠（约前800—公元43年）"
      },
      {
        "id": "roman-britain",
        "label": "罗马不列颠（43—410年）"
      },
      {
        "id": "anglo-saxon",
        "label": "盎格鲁-撒克逊英格兰（约450—1066年）"
      }
    ]
  },
  {
    "id": "gaul-franks",
    "label": "高卢—法兰克",
    "region": "欧洲",
    "periods": [
      {
        "id": "gaul",
        "label": "古高卢（约前600—前50年）"
      },
      {
        "id": "gallo-roman",
        "label": "高卢罗马时期（约前50—公元500年）"
      },
      {
        "id": "merovingian-carolingian",
        "label": "墨洛温—加洛林时期（约500—987年）"
      }
    ]
  },
  {
    "id": "ancient-germanic",
    "label": "早期日耳曼文化区",
    "region": "欧洲",
    "periods": [
      {
        "id": "germanic-iron-age",
        "label": "日耳曼铁器时代（约前500—公元400年）"
      },
      {
        "id": "migration-age",
        "label": "民族迁徙时期日耳曼诸部（约400—750年）"
      }
    ]
  },
  {
    "id": "etruscan-italic",
    "label": "古意大利（伊特鲁里亚—意大利诸族）",
    "region": "欧洲",
    "periods": [
      {
        "id": "etruscan",
        "label": "伊特鲁里亚城邦（约前800—前100年）"
      },
      {
        "id": "italic-peoples",
        "label": "拉丁、萨宾、萨莫奈等意大利诸族（约前800—前300年）"
      }
    ]
  },
  {
    "id": "indus-valley",
    "label": "印度河文明（哈拉帕文化）",
    "region": "南亚",
    "periods": [
      {
        "id": "early-harappan",
        "label": "早期哈拉帕（约前3300—前2600年）",
        "personData": "archaeological"
      },
      {
        "id": "mature-harappan",
        "label": "成熟哈拉帕（约前2600—前1900年）",
        "personData": "archaeological"
      }
    ]
  },
  {
    "id": "gandhara-kushan",
    "label": "西北南亚（犍陀罗—贵霜）",
    "region": "南亚",
    "periods": [
      {
        "id": "achaemenid-gandhara",
        "label": "阿契美尼德治下犍陀罗（约前550—前327年）"
      },
      {
        "id": "indo-greek",
        "label": "印度—希腊诸王国（约前200—公元10年）"
      },
      {
        "id": "kushan",
        "label": "贵霜帝国（约30—375年）"
      }
    ]
  },
  {
    "id": "mesoamerican-formative",
    "label": "中美洲早期文明（奥尔梅克—特奥蒂瓦坎）",
    "region": "中美洲",
    "periods": [
      {
        "id": "olmec",
        "label": "奥尔梅克文明（约前1500—前400年）",
        "personData": "archaeological"
      },
      {
        "id": "zapotec",
        "label": "早期萨波特克与蒙特阿尔班（约前700—公元900年）",
        "personData": "archaeological"
      },
      {
        "id": "teotihuacan",
        "label": "特奥蒂瓦坎（约前100—公元550年）",
        "personData": "archaeological"
      }
    ]
  },
  {
    "id": "preinca-andes",
    "label": "前印加安第斯（卡拉尔—奇穆）",
    "region": "南美洲",
    "periods": [
      {
        "id": "caral",
        "label": "卡拉尔—北小圣地（约前3000—前1800年）",
        "personData": "archaeological"
      },
      {
        "id": "chavin",
        "label": "查文文化（约前900—前200年）",
        "personData": "archaeological"
      },
      {
        "id": "moche-nazca",
        "label": "莫切—纳斯卡（约100—800年）",
        "personData": "archaeological"
      },
      {
        "id": "wari-tiwanaku",
        "label": "瓦里—蒂瓦纳科（约500—1000年）",
        "personData": "archaeological"
      },
      {
        "id": "chimu",
        "label": "奇穆王国（约900—1470年）"
      }
    ]
  },
  {
    "id": "lapita-pacific",
    "label": "早期太平洋（拉皮塔—波利尼西亚定居）",
    "region": "大洋洲",
    "periods": [
      {
        "id": "lapita",
        "label": "拉皮塔文化（约前1600—前500年）",
        "personData": "archaeological"
      },
      {
        "id": "early-polynesian-settlement",
        "label": "早期波利尼西亚定居（约前500—公元1000年）",
        "personData": "archaeological"
      }
    ]
  },
  {
    "id": "ancient-iberia",
    "label": "古代伊比利亚（塔尔特索斯—罗马西班牙）",
    "region": "欧洲",
    "periods": [
      {
        "id": "iberian-pre-roman",
        "label": "前罗马伊比利亚（约前1000—前218年）"
      },
      {
        "id": "roman-hispania",
        "label": "罗马西班牙（约前218—公元476年）"
      }
    ]
  },
  {
    "id": "nordic-prehistory",
    "label": "北欧史前（青铜时代—铁器时代）",
    "region": "欧洲",
    "periods": [
      {
        "id": "nordic-bronze-age",
        "label": "北欧青铜时代（约前1700—前500年）",
        "personData": "archaeological"
      },
      {
        "id": "pre-roman-nordic-iron",
        "label": "北欧前罗马铁器时代（约前500—公元1年）",
        "personData": "archaeological"
      }
    ]
  },
  {
    "id": "pre-roman-lowlands",
    "label": "罗马前低地（凯尔特—弗里西）",
    "region": "欧洲",
    "periods": [
      {
        "id": "iron-age-lowlands",
        "label": "罗马前低地铁器时代（约前800—前1年）",
        "personData": "archaeological"
      }
    ]
  }
]
