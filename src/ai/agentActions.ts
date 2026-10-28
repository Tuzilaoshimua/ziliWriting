import type { MemoryCandidate } from '../data/storyMemoryStorage'
import type { Chapter, ProjectState } from '../data/projectStorage'

export type AgentActionScope = 'current' | 'all' | 'chapters'

export type AgentPanel =
  | 'memory'
  | 'trash'
  | 'references'
  | 'assets'
  | 'attachments'
  | 'review'
  | 'draft'
  | 'advisor'
  | 'tools'
  | 'naming'

/**
 * 字里助手可以直接执行的程序操作。
 * 这里只放“确定性操作”，不负责生成正文；生成正文仍由候选正文流程完成。
 */
export type AgentAppAction =
  | {
    type: 'replace_text'
    find: string
    replace: string
    scope?: AgentActionScope
    chapterTitles?: string[]
    regex?: boolean
  }
  | {
    type: 'rename_character'
    names: string[]
    newName: string
    aliases?: string[]
    scope?: AgentActionScope
    chapterTitles?: string[]
  }
  | {
    type: 'write_chapter'
    chapterTitle?: string
    text: string
    mode: 'replace' | 'append'
  }
  | {
    type: 'create_chapter'
    title: string
    text?: string
    afterChapterTitle?: string
  }
  | {
    type: 'rename_chapter'
    chapterTitle: string
    newTitle: string
  }
  | {
    type: 'delete_chapter'
    chapterTitle: string
  }
  | {
    type: 'move_chapter'
    chapterTitle: string
    beforeChapterTitle?: string
    afterChapterTitle?: string
  }
  | {
    type: 'update_story_memory'
    character: string
    newName?: string
    aliases?: string[]
    removeAliases?: string[]
  }
  | {
    type: 'merge_characters'
    primary: string
    secondary: string
  }
  | {
    type: 'set_thread_lifecycle'
    thread: string
    lifecycle: 'active' | 'resolved' | 'abandoned' | 'superseded'
  }
  | {
    type: 'open_chapter'
    chapterTitle: string
  }
  | {
    type: 'open_panel'
    panel: AgentPanel
  }

export type AgentActionResult = {
  action: AgentAppAction
  status: 'complete' | 'failed'
  detail: string
  changed?: boolean
  chapterTitles?: string[]
}

export type AgentActionChapterSnapshot = {
  chapterId: string
  beforeRevisionId: string
  afterContentHash: string
  afterTitle: string
}

export type AgentActionMemorySnapshot = {
  candidate: MemoryCandidate
  afterUpdatedAt: number
}

/** 一次确认里执行的全部修改；只记录可安全回退的内容。 */
export type AgentActionBatch = {
  id: string
  createdAt: number
  status: 'applied' | 'undone'
  undoneAt?: number
  summary: string
  undoable: boolean
  chapters: AgentActionChapterSnapshot[]
  memory: AgentActionMemorySnapshot[]
  chapterOrderBefore: string[]
}

function cleanString(value: unknown, maximum: number) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function cleanList(value: unknown, limit: number, maximum: number) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map((item) => cleanString(item, maximum)).filter(Boolean))].slice(0, limit)
}

function cleanScope(value: unknown): AgentActionScope {
  return value === 'current' || value === 'chapters' ? value : 'all'
}

const PANELS: AgentPanel[] = ['memory', 'trash', 'references', 'assets', 'attachments', 'review', 'draft', 'advisor', 'tools', 'naming']

const GENERIC_NAME_WORDS = new Set(['他', '她', '它', '我', '你', '您', '主角', '男主', '女主', '主人公', '角色', '人物', '名字', '昵称', '别名', '原名'])

/**
 * 把模型返回的操作计划转成可执行动作。
 * 任何字段不完整或超出范围的动作都会被丢弃，避免半截指令被误执行。
 */
export function parseAgentActions(raw: unknown): AgentAppAction[] {
  if (!Array.isArray(raw)) return []
  const actions: AgentAppAction[] = []
  for (const item of raw.slice(0, 8)) {
    if (!item || typeof item !== 'object') continue
    const source = item as Record<string, unknown>
    const type = cleanString(source.type, 40)
    if (type === 'replace_text') {
      const find = cleanString(source.find, 500)
      const replace = cleanString(source.replace, 500)
      if (!find || find === replace) continue
      actions.push({
        type,
        find,
        replace,
        scope: cleanScope(source.scope),
        chapterTitles: cleanList(source.chapterTitles, 40, 80),
        regex: source.regex === true,
      })
      continue
    }
    if (type === 'rename_character') {
      const names = cleanList(source.names, 12, 40).filter((name) => !GENERIC_NAME_WORDS.has(name))
      const newName = cleanString(source.newName, 40)
      if (names.length === 0 || !newName || GENERIC_NAME_WORDS.has(newName) || names.every((name) => name === newName)) continue
      actions.push({
        type,
        names,
        newName,
        aliases: cleanList(source.aliases, 12, 40),
        scope: cleanScope(source.scope),
        chapterTitles: cleanList(source.chapterTitles, 40, 80),
      })
      continue
    }
    if (type === 'write_chapter') {
      const text = cleanString(source.text, 200_000)
      if (!text) continue
      actions.push({
        type,
        chapterTitle: cleanString(source.chapterTitle, 80) || undefined,
        text,
        mode: source.mode === 'append' ? 'append' : 'replace',
      })
      continue
    }
    if (type === 'create_chapter') {
      const title = cleanString(source.title, 80)
      if (!title) continue
      actions.push({
        type,
        title,
        text: cleanString(source.text, 200_000) || undefined,
        afterChapterTitle: cleanString(source.afterChapterTitle, 80) || undefined,
      })
      continue
    }
    if (type === 'rename_chapter') {
      const chapterTitle = cleanString(source.chapterTitle, 80)
      const newTitle = cleanString(source.newTitle, 80)
      if (!chapterTitle || !newTitle || chapterTitle === newTitle) continue
      actions.push({ type, chapterTitle, newTitle })
      continue
    }
    if (type === 'delete_chapter') {
      const chapterTitle = cleanString(source.chapterTitle, 80)
      if (!chapterTitle) continue
      actions.push({ type, chapterTitle })
      continue
    }
    if (type === 'move_chapter') {
      const chapterTitle = cleanString(source.chapterTitle, 80)
      if (!chapterTitle) continue
      actions.push({
        type,
        chapterTitle,
        beforeChapterTitle: cleanString(source.beforeChapterTitle, 80) || undefined,
        afterChapterTitle: cleanString(source.afterChapterTitle, 80) || undefined,
      })
      continue
    }
    if (type === 'update_story_memory') {
      const character = cleanString(source.character, 40)
      if (!character) continue
      actions.push({
        type,
        character,
        newName: cleanString(source.newName, 40) || undefined,
        aliases: cleanList(source.aliases, 20, 40),
        removeAliases: cleanList(source.removeAliases, 20, 40),
      })
      continue
    }
    if (type === 'merge_characters') {
      const primary = cleanString(source.primary, 40)
      const secondary = cleanString(source.secondary, 40)
      if (primary && secondary && normalizedAgentName(primary) !== normalizedAgentName(secondary)) actions.push({ type, primary, secondary })
      continue
    }
    if (type === 'set_thread_lifecycle') {
      const thread = cleanString(source.thread, 80)
      const lifecycle = cleanString(source.lifecycle, 20)
      if (thread && ['active', 'resolved', 'abandoned', 'superseded'].includes(lifecycle)) {
        actions.push({ type, thread, lifecycle: lifecycle as 'active' | 'resolved' | 'abandoned' | 'superseded' })
      }
      continue
    }
    if (type === 'open_chapter') {
      const chapterTitle = cleanString(source.chapterTitle, 80)
      if (chapterTitle) actions.push({ type, chapterTitle })
      continue
    }
    if (type === 'open_panel') {
      const panel = cleanString(source.panel, 30) as AgentPanel
      if (PANELS.includes(panel)) actions.push({ type, panel })
    }
  }
  return actions
}

export function normalizedAgentName(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/[\s·•・,，。.!！?？:：;；'"“”‘’（）()\[\]【】《》<>_-]/g, '')
}

function actionScopeLabel(action: { scope?: AgentActionScope; chapterTitles?: string[] }) {
  if (action.scope === 'current') return '当前章'
  if (action.scope === 'chapters') return `指定章节${action.chapterTitles?.length ? `（${action.chapterTitles.join('、')}）` : ''}`
  return '全书'
}

/** 给确认卡展示的可读操作说明，不执行任何修改。 */
export function describeAgentAction(action: AgentAppAction) {
  if (action.type === 'rename_character') {
    const names = action.names.map((name) => `“${name}”`).join('、')
    const aliases = action.aliases?.length ? `，新昵称/别名：${action.aliases.map((name) => `“${name}”`).join('、')}` : ''
    return `把 ${names} 改为“${action.newName}”${aliases}（${actionScopeLabel(action)}）`
  }
  if (action.type === 'replace_text') {
    return `在${actionScopeLabel(action)}把“${action.find}”替换为“${action.replace}”${action.regex ? '（正则表达式）' : ''}`
  }
  if (action.type === 'write_chapter') {
    return `${action.mode === 'append' ? '追加到' : '改写'}章节“${action.chapterTitle ?? '当前章'}”（${action.text.replace(/\s/g, '').length} 字）`
  }
  if (action.type === 'create_chapter') {
    return `新建章节“${action.title}”${action.afterChapterTitle ? `，放在“${action.afterChapterTitle}”之后` : ''}${action.text ? `，写入 ${action.text.replace(/\s/g, '').length} 字` : ''}`
  }
  if (action.type === 'rename_chapter') return `把章节“${action.chapterTitle}”改名为“${action.newTitle}”`
  if (action.type === 'delete_chapter') return `把章节“${action.chapterTitle}”移到回收站`
  if (action.type === 'move_chapter') {
    const position = action.beforeChapterTitle ? `“${action.beforeChapterTitle}”之前` : `“${action.afterChapterTitle}”之后`
    return `把章节“${action.chapterTitle}”移到${position}`
  }
  if (action.type === 'update_story_memory') {
    return `更新人物“${action.character}”${action.newName ? `，主名改为“${action.newName}”` : ''}${action.aliases?.length ? `，添加别名：${action.aliases.join('、')}` : ''}${action.removeAliases?.length ? `，移除别名：${action.removeAliases.join('、')}` : ''}`
  }
  if (action.type === 'merge_characters') return `把人物“${action.secondary}”合并到“${action.primary}”`
  if (action.type === 'set_thread_lifecycle') {
    const labels = { active: '进行中', resolved: '已回收', abandoned: '已废弃', superseded: '已替代' } as const
    return `把线索“${action.thread}”的状态改为“${labels[action.lifecycle]}”`
  }
  if (action.type === 'open_chapter') return `打开章节“${action.chapterTitle}”`
  const panelLabels: Record<AgentPanel, string> = {
    memory: '故事记忆', trash: '回收站', references: '参考文本', assets: '图片素材',
    attachments: '附件资料', review: '审稿', draft: '候选正文', advisor: '创作顾问',
    tools: '创作工具', naming: '离线命名',
  }
  return `打开“${panelLabels[action.panel]}”面板`
}

export function describeAgentActionDanger(action: AgentAppAction) {
  return action.type === 'delete_chapter'
    || action.type === 'merge_characters'
    || (action.type === 'rename_character' && (action.scope ?? 'all') === 'all')
    || (action.type === 'replace_text' && (action.scope ?? 'all') === 'all')
}

function previewResolveChapter(project: ProjectState, title?: string) {
  if (!title?.trim()) return project.chapters.find((chapter) => chapter.id === project.activeChapterId) ?? project.chapters[0] ?? null
  const wanted = normalizedAgentName(title)
  if (!wanted) return null
  return project.chapters.find((chapter) => normalizedAgentName(chapter.title) === wanted)
    ?? project.chapters.find((chapter) => {
      const known = normalizedAgentName(chapter.title)
      return known.length >= 2 && (known.includes(wanted) || wanted.includes(known))
    })
    ?? null
}

function previewScopeChapters(project: ProjectState, action: AgentAppAction, canModify: (chapterId: string) => boolean) {
  if (!('scope' in action)) return project.chapters.filter((chapter) => canModify(chapter.id))
  if (action.scope === 'current') {
    const current = previewResolveChapter(project)
    return current && canModify(current.id) ? [current] : []
  }
  if (action.scope === 'chapters') {
    return [...new Map((action.chapterTitles ?? [])
      .map((title) => previewResolveChapter(project, title))
      .filter((chapter): chapter is Chapter => chapter !== null && canModify(chapter.id))
      .map((chapter) => [chapter.id, chapter])).values()]
  }
  return project.chapters.filter((chapter) => canModify(chapter.id))
}

/** 确认前的只读影响预估，不修改任何内容。 */
export function previewAgentAction(action: AgentAppAction, project: ProjectState, canModify: (chapterId: string) => boolean) {
  if (action.type === 'rename_character') {
    const names = [...new Set(action.names)].filter((name) => name && name !== action.newName)
    const targets = previewScopeChapters(project, action, canModify)
    let chapterCount = 0
    let total = 0
    for (const chapter of targets) {
      let found = 0
      for (const name of names) found += countLiteralOccurrences(chapter.plainText, name)
      if (found > 0) {
        chapterCount += 1
        total += found
      }
    }
    return total > 0 ? `预计修改 ${chapterCount} 章，共 ${total} 处` : '正文中没有找到这些名字，执行会失败'
  }
  if (action.type === 'replace_text') {
    const targets = previewScopeChapters(project, action, canModify)
    let chapterCount = 0
    let total = 0
    let pattern: RegExp | null = null
    if (action.regex) {
      try {
        pattern = new RegExp(action.find, 'g')
      } catch {
        return '正则表达式无效，执行会失败'
      }
    }
    for (const chapter of targets) {
      const count = pattern
        ? (chapter.plainText.match(new RegExp(action.find, 'g'))?.length ?? 0)
        : countLiteralOccurrences(chapter.plainText, action.find)
      if (count > 0) {
        chapterCount += 1
        total += count
      }
    }
    return total > 0 ? `预计修改 ${chapterCount} 章，共 ${total} 处` : '正文中没有找到要替换的文字，执行会失败'
  }
  if (action.type === 'write_chapter') {
    const target = previewResolveChapter(project, action.chapterTitle)
    if (!target) return '没有找到目标章节，执行会失败'
    const added = action.text.replace(/\s/g, '').length
    return action.mode === 'append'
      ? `新增约 ${added} 字，追加后约 ${target.plainText.replace(/\s/g, '').length + added} 字`
      : `章节现有 ${target.plainText.replace(/\s/g, '').length} 字，将被替换为约 ${added} 字`
  }
  if (action.type === 'create_chapter') return `新章节约 ${(action.text ?? '').replace(/\s/g, '').length} 字`
  if (action.type === 'rename_chapter') {
    const target = previewResolveChapter(project, action.chapterTitle)
    return target ? `章节现有 ${target.plainText.replace(/\s/g, '').length} 字，只改标题` : '没有找到目标章节，执行会失败'
  }
  if (action.type === 'delete_chapter') {
    const target = previewResolveChapter(project, action.chapterTitle)
    return target ? `将移出正文 ${target.plainText.replace(/\s/g, '').length} 字，可在回收站恢复` : '没有找到目标章节，执行会失败'
  }
  if (action.type === 'move_chapter') return '只调整章节顺序，不改正文'
  if (action.type === 'update_story_memory') return '更新人物资料，不改正文'
  if (action.type === 'merge_characters') return '合并人物资料，不改正文'
  if (action.type === 'set_thread_lifecycle') return '只更新线索状态，不改正文'
  return '只读操作，不改作品'
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function countLiteralOccurrences(source: string, find: string) {
  if (!find) return 0
  let count = 0
  let index = source.indexOf(find)
  while (index >= 0) {
    count += 1
    index = source.indexOf(find, index + find.length)
  }
  return count
}

export type AgentActionPlan = {
  actions: AgentAppAction[]
  note: string
  reasoning: string
}

/**
 * 判断一句话是否值得交给“操作规划器”处理。
 * 纯讨论、分析、评价会直接走普通对话，省掉一次模型调用。
 */
export function requestMayNeedAgentActions(request: string) {
  if (/(?:如果|假如|要是|万一|会怎样|会怎么样|怎么样|好不好|合适吗|该不该|是否应该|建议|讨论|分析一下|为什么|改成什么|改成谁|如何改|怎么改|哪一个|哪种|有没有|是否|检查一下|查一下|看看)/.test(request)) return false
  return /(?:改|换|替换|重命名|命名|删|移除|去掉|新建|创建|增加|添加|加为|插入|写入|追加|补充|更新|设置|设为|设置成|调整|移动|移到|放到|排在|提前|调前|调后|合并|统一|修正|更正|标记|整理|同步|打开|显示|切换|导出|保存|应用|执行|别名|昵称|化名|称呼|全部|全文|全书|每一章|所有章节)/.test(request)
}

/**
 * 有些模型即使拿到操作能力，仍会沿用“文档是本地文件、我无法修改”的旧说法。
 * 在这种情况下补一句能力提示，避免作者被误导为只能手动复制。
 */
export function appendAgentControlHint(reply: string) {
  const refusal = /(?:无法|不能|没办法|无法直接).{0,16}(?:修改|操作|编辑|写入|改动|访问).{0,16}(?:本地|原稿|文档|文件|磁盘)|(?:文档|原稿|文件).{0,10}是本地文件|本地文件.{0,10}(?:无法|不能)/i
  if (!refusal.test(reply)) return reply
  return `${reply.trim()}\n\n（提示：字里助手已经可以直接修改作品。请直接说明“把旧名 A 改成新名 B”以及范围（本章或全书），我会给出操作确认卡，确认后立即执行。）`
}

/**
 * 模型偶尔会把“讨论怎么改”误判成“已经要求改”。执行前再用作者原话做一次窄口径校验，
 * 只有原话里真的出现相应意图时才放行，避免误改正文。
 */
export function filterActionsForRequest(actions: AgentAppAction[], request: string) {
  return actions.filter((action) => {
    if (action.type === 'rename_character') {
      return /(?:名字|姓名|改名|更名|重命名|昵称|别名|化名|称呼|改成|换成|改为|主角|主人公|男主|女主|人物|角色)/.test(request)
    }
    if (action.type === 'update_story_memory' || action.type === 'merge_characters' || action.type === 'set_thread_lifecycle') {
      return /(?:人物|角色|别名|昵称|化名|称呼|合并|视为同一|线索|伏笔|承诺|秘密|情节线|回收|解决|废弃|替代)/.test(request)
    }
    if (action.type === 'delete_chapter') return /(?:删|移除|去掉|不要了)/.test(request)
    if (action.type === 'move_chapter') return /(?:移动|移到|放到|排在|提前|调前|调后|顺序)/.test(request)
    if (action.type === 'create_chapter') return /(?:新建|创建|增加|加一|新开|另起|添加)/.test(request)
    if (action.type === 'write_chapter') return /(?:写入|写进|替换|改成|换成|改为|放进|追加|补上|录入)/.test(request)
    if (action.type === 'replace_text') return /(?:替换|改成|换成|改为|全部改|统一|更正|修正|校对)/.test(request)
    return true
  })
}

export function formatAgentActionReply(note: string, results: AgentActionResult[]) {  const completed = results.filter((result) => result.status === 'complete')
  const failed = results.filter((result) => result.status === 'failed')
  const changed = completed.some((result) => result.changed)
  const lines = results.map((result, index) => `${index + 1}. ${result.status === 'complete' ? '已完成' : '未完成'}：${result.detail}`)
  const header = note.trim() ? `${note.trim()}\n\n` : ''
  const footer = changed
    ? '\n\n修改已经直接写入作品并保存。每章修改前都自动保存了版本，可在“版本历史”里回退。'
    : ''
  return `${header}${completed.length > 0 ? `已执行 ${completed.length} 项操作` : '没有执行任何操作'}${failed.length > 0 ? `，${failed.length} 项未完成` : ''}：\n${lines.join('\n')}${footer}`
}

export const AGENT_ACTION_PLANNER_PROMPT = `[ZILI_AGENT_ACTION_PLANNER_V1]
你是“字里助手”的操作规划器。你的任务不是聊天，而是判断作者是否要求对作品执行具体操作，并把要求转成严格 JSON 操作指令。

只返回严格 JSON：
{"actions":[...],"note":"一句话说明你准备做什么"}

可用操作（字段名必须完全一致）：
1. 替换文字：{"type":"replace_text","find":"要替换的原文","replace":"替换后的文字","scope":"current|all|chapters","chapterTitles":["指定章节标题"],"regex":false}
2. 角色改名：{"type":"rename_character","names":["旧名","旧昵称","旧别名"],"newName":"新名字","aliases":["新昵称","新别名"],"scope":"current|all|chapters","chapterTitles":[]}
3. 直接写入章节：{"type":"write_chapter","chapterTitle":"章节标题，省略表示当前章","text":"作者已经给出的完整文字","mode":"replace|append"}
4. 新建章节：{"type":"create_chapter","title":"章节标题","text":"可选正文","afterChapterTitle":"可选，插在哪一章之后"}
5. 修改章节标题：{"type":"rename_chapter","chapterTitle":"原章节标题","newTitle":"新章节标题"}
6. 删除章节（移到回收站）：{"type":"delete_chapter","chapterTitle":"章节标题"}
7. 移动章节：{"type":"move_chapter","chapterTitle":"要移动的章节","beforeChapterTitle":"可选，移到这一章之前","afterChapterTitle":"可选，移到这一章之后"}
8. 更新人物资料：{"type":"update_story_memory","character":"人物当前名称","newName":"可选新名称","aliases":["要添加的别名"],"removeAliases":["要移除的别名"]}
9. 合并人物：{"type":"merge_characters","primary":"保留的人物名","secondary":"并入的人物名"}
10. 更新线索状态：{"type":"set_thread_lifecycle","thread":"线索、伏笔或承诺的标题","lifecycle":"active|resolved|abandoned|superseded"}
11. 打开章节：{"type":"open_chapter","chapterTitle":"章节标题"}
12. 打开面板：{"type":"open_panel","panel":"memory|trash|references|assets|attachments|review|draft|advisor|tools|naming"}

规则：
- 只有作者明确要求执行、修改、删除、创建、打开时才返回操作；讨论、询问意见、要求分析、请求建议、问“改成什么好”时必须返回 {"actions":[],"note":""}。
- “按我们商量好的”“就按刚才说的”要从最近对话里找出最终确定的名字、昵称和范围，不要使用被否定的旧方案。
- 角色改名时，names 必须包含故事记忆里该角色的全部已知名字和别名，以及对话中确认的旧昵称；按字符串从长到短排列。新昵称放进 aliases。
- 作者说“主角”时，取故事记忆里资料最多、或最近对话明确指出的角色；不确定时不要猜，返回空操作。
- scope 省略或为 all 表示全书；只说“这一章/当前章”用 current；点名章节用 chapters 并填 chapterTitles。
- write_chapter 只用于作者已经给出完整文字、要求原样写入的情况；作者要求续写、改写、扩写、润色、生成正文时不要返回 write_chapter，交给候选正文流程。
- 不要编造章节标题、人物名或原文。找不到目标时不要执行，note 说明找不到什么。
- 一次最多 8 个操作，按执行顺序排列。不要输出 Markdown、代码块或解释。`
