// Bilingual (Hebrew / English) strings, enum label maps, error messages,
// and direction-aware layout helpers. Hebrew is the default and renders RTL.

import { GroupBy, InitiativeStatus, Priority, SortKey, TaskStatus } from './types'

export type Lang = 'he' | 'en'
export type Dir = 'rtl' | 'ltr'

export function dirForLang(lang: Lang): Dir {
  return lang === 'he' ? 'rtl' : 'ltr'
}

export interface Strings {
  appName: string
  // toolbar / modes
  cards: string
  table: string
  initiatives: string
  tasks: string
  lock: string // action shown when unlocked
  unlock: string // action shown when locked
  lockedNote: string // subtle "you are in read-only" hint
  unlockedNote: string // subtle "editing enabled for you" hint
  showArchived: string
  hideArchived: string
  addCampaign: string
  addInitiative: string
  addTask: string
  edit: string
  done: string
  archive: string
  restore: string
  deleteTask: string
  switchLang: string // label on the language toggle (shows the OTHER language)
  // counts
  countInitiatives: string
  countTasks: string
  archivedHiddenSuffix: string
  // groups
  unassigned: string
  // field labels
  fTitle: string
  fOwner: string
  fDueDate: string
  fCampaign: string
  fStatus: string
  fPriority: string
  fFigmaLink: string
  fDescription: string
  fNotes: string
  fAssignee: string
  tasksHeading: string
  // placeholders
  phInitiativeTitle: string
  phCampaignTitle: string
  phTaskTitle: string
  phOwner: string
  phDueDate: string
  phFigmaLink: string
  phDescription: string
  phNotes: string
  phAssignee: string
  // empty states
  emptyNoInitiatives: string
  emptyNoCampaignInitiatives: string
  emptyNoTasks: string
  noResults: string
  // table headers
  thCampaign: string
  thInitiative: string
  thOwner: string
  thStatus: string
  thPriority: string
  thDue: string
  thProgress: string
  thLink: string
  thTask: string
  thAssignee: string
  thTaskStatus: string
  thInitStatus: string
  thInitDue: string
  thNotes: string
  // progress
  noTasks: string
  tasksDone: (done: number, total: number) => string
  // value labels
  status: Record<InitiativeStatus, string>
  priority: Record<Priority, string>
  taskStatus: Record<TaskStatus, string>
  // grouping / sorting controls
  groupByLabel: string
  sortByLabel: string
  groupByOptions: Record<GroupBy, string>
  sortKeyOptions: Record<SortKey, string>
  // estimates
  hoursUnit: string // short unit suffix, e.g. "h" / "ש'"
  fEstimate: string // field label
  phEstimate: string // input placeholder
  thEstimate: string // table column header
  noOwner: string // section title when grouping by owner and none is set
  // validation messages keyed by code
  errors: Record<string, string>
}

const HE: Strings = {
  appName: 'יומן יוזמות',
  cards: 'כרטיסים',
  table: 'טבלה',
  initiatives: 'יוזמות',
  tasks: 'משימות',
  lock: 'נעילה',
  unlock: 'פתח לעריכה',
  lockedNote: 'מצב קריאה',
  unlockedNote: 'עריכה מופעלת',
  showArchived: 'הצג ארכיון',
  hideArchived: 'הסתר ארכיון',
  addCampaign: '+ קמפיין',
  addInitiative: '+ יוזמה',
  addTask: '+ משימה',
  edit: '✎ עריכה',
  done: '✓ סיום',
  archive: 'העבר לארכיון',
  restore: 'שחזר',
  deleteTask: 'מחק',
  switchLang: 'EN',
  countInitiatives: 'יוזמות',
  countTasks: 'משימות',
  archivedHiddenSuffix: 'בארכיון (מוסתרים)',
  unassigned: 'ללא שיוך',
  fTitle: 'כותרת',
  fOwner: 'אחראי',
  fDueDate: 'תאריך יעד',
  fCampaign: 'קמפיין',
  fStatus: 'סטטוס',
  fPriority: 'עדיפות',
  fFigmaLink: 'קישור Figma',
  fDescription: 'תיאור',
  fNotes: 'הערות',
  fAssignee: 'אחראי משימה',
  tasksHeading: 'משימות',
  phInitiativeTitle: 'כותרת היוזמה',
  phCampaignTitle: 'שם הקמפיין',
  phTaskTitle: 'כותרת המשימה',
  phOwner: 'שם האחראי',
  phDueDate: 'YYYY-MM-DD',
  phFigmaLink: 'https://figma.com/…',
  phDescription: 'תיאור היוזמה',
  phNotes: 'הקשר תומך',
  phAssignee: 'מבצע',
  emptyNoInitiatives: 'אין יוזמות עדיין. הוסף יוזמה ראשונה כדי להתחיל.',
  emptyNoCampaignInitiatives: 'אין יוזמות בקמפיין זה עדיין.',
  emptyNoTasks: 'אין משימות עדיין.',
  noResults: 'אין רשומות התואמות לחיפוש ולמסננים.',
  thCampaign: 'קמפיין',
  thInitiative: 'יוזמה',
  thOwner: 'אחראי',
  thStatus: 'סטטוס',
  thPriority: 'עדיפות',
  thDue: 'יעד',
  thProgress: 'התקדמות',
  thLink: 'קישור',
  thTask: 'משימה',
  thAssignee: 'מבצע',
  thTaskStatus: 'סטטוס משימה',
  thInitStatus: 'סטטוס יוזמה',
  thInitDue: 'יעד יוזמה',
  thNotes: 'הערות',
  noTasks: 'אין משימות',
  tasksDone: (done, total) => `${done}/${total} משימות הושלמו`,
  status: {
    Backlog: 'בקלוג',
    Planned: 'מתוכנן',
    'In Progress': 'בתהליך',
    Blocked: 'חסום',
    'In Review': 'בבדיקה',
    Done: 'הושלם',
  },
  priority: {
    P0: 'P0',
    P1: 'P1',
    P2: 'P2',
    P3: 'P3',
  },
  taskStatus: {
    'To Do': 'לביצוע',
    'In Progress': 'בתהליך',
    Blocked: 'חסום',
    Done: 'הושלם',
  },
  groupByLabel: 'קיבוץ',
  sortByLabel: 'מיון',
  groupByOptions: {
    campaign: 'קמפיין',
    priority: 'עדיפות',
    status: 'סטטוס',
    owner: 'אחראי',
    none: 'ללא',
  },
  sortKeyOptions: {
    priority: 'עדיפות',
    estimate: 'אומדן',
    dueDate: 'תאריך יעד',
    status: 'סטטוס',
    title: 'כותרת',
    manual: 'ידני',
  },
  hoursUnit: "ש'",
  fEstimate: 'הערכת זמן',
  phEstimate: 'שעות',
  thEstimate: 'הערכת זמן',
  noOwner: 'ללא אחראי',
  errors: {
    campaignTitleRequired: 'נדרשת כותרת לקמפיין.',
    initiativeTitleRequired: 'נדרשת כותרת ליוזמה.',
    taskTitleRequired: 'נדרשת כותרת למשימה.',
    titleTooLong: 'הכותרת ארוכה מדי.',
    invalidInitiativeStatus: 'סטטוס יוזמה לא חוקי.',
    invalidTaskStatus: 'סטטוס משימה לא חוקי.',
    invalidPriority: 'עדיפות לא חוקית.',
    invalidCampaignRef: 'הקמפיין המשויך אינו קיים.',
    invalidInitiativeRef: 'היוזמה המשויכת אינה קיימת.',
    invalidSortOrder: 'סדר התצוגה חייב להיות מספר.',
    missingId: 'נדרש מזהה רשומה לעדכון.',
    taskNoDueDate: 'למשימות אין תאריך יעד.',
    recordMissing: 'הרשומה אינה קיימת עוד.',
    invalid: 'ערך לא חוקי.',
  },
}

const EN: Strings = {
  appName: 'Initiative Log',
  cards: 'Cards',
  table: 'Table',
  initiatives: 'Initiatives',
  tasks: 'Tasks',
  lock: 'Lock',
  unlock: 'Unlock',
  lockedNote: 'Read-only',
  unlockedNote: 'Editing enabled',
  showArchived: 'Show archived',
  hideArchived: 'Hide archived',
  addCampaign: '+ Campaign',
  addInitiative: '+ Initiative',
  addTask: '+ Task',
  edit: '✎ Edit',
  done: '✓ Done',
  archive: 'Archive',
  restore: 'Restore',
  deleteTask: 'Delete',
  switchLang: 'עב',
  countInitiatives: 'initiatives',
  countTasks: 'tasks',
  archivedHiddenSuffix: 'archived hidden',
  unassigned: 'Unassigned',
  fTitle: 'Title',
  fOwner: 'Owner',
  fDueDate: 'Due date',
  fCampaign: 'Campaign',
  fStatus: 'Status',
  fPriority: 'Priority',
  fFigmaLink: 'Figma link',
  fDescription: 'Description',
  fNotes: 'Notes',
  fAssignee: 'Assignee',
  tasksHeading: 'Tasks',
  phInitiativeTitle: 'Initiative title',
  phCampaignTitle: 'Campaign title',
  phTaskTitle: 'Task title',
  phOwner: 'Owner',
  phDueDate: 'YYYY-MM-DD',
  phFigmaLink: 'https://figma.com/…',
  phDescription: 'Initiative description',
  phNotes: 'Supporting context',
  phAssignee: 'Assignee',
  emptyNoInitiatives: 'No initiatives yet. Add your first initiative to start tracking.',
  emptyNoCampaignInitiatives: 'No initiatives in this campaign yet.',
  emptyNoTasks: 'No tasks yet.',
  noResults: 'No records match the current search and filters.',
  thCampaign: 'Campaign',
  thInitiative: 'Initiative',
  thOwner: 'Owner',
  thStatus: 'Status',
  thPriority: 'Priority',
  thDue: 'Due',
  thProgress: 'Progress',
  thLink: 'Link',
  thTask: 'Task',
  thAssignee: 'Assignee',
  thTaskStatus: 'Task status',
  thInitStatus: 'Init status',
  thInitDue: 'Init due',
  thNotes: 'Notes',
  noTasks: 'No tasks',
  tasksDone: (done, total) => `${done}/${total} tasks done`,
  status: {
    Backlog: 'Backlog',
    Planned: 'Planned',
    'In Progress': 'In Progress',
    Blocked: 'Blocked',
    'In Review': 'In Review',
    Done: 'Done',
  },
  priority: {
    P0: 'P0',
    P1: 'P1',
    P2: 'P2',
    P3: 'P3',
  },
  taskStatus: {
    'To Do': 'To Do',
    'In Progress': 'In Progress',
    Blocked: 'Blocked',
    Done: 'Done',
  },
  groupByLabel: 'Group',
  sortByLabel: 'Sort',
  groupByOptions: {
    campaign: 'Campaign',
    priority: 'Priority',
    status: 'Status',
    owner: 'Owner',
    none: 'None',
  },
  sortKeyOptions: {
    priority: 'Priority',
    estimate: 'Estimate',
    dueDate: 'Due date',
    status: 'Status',
    title: 'Title',
    manual: 'Manual',
  },
  hoursUnit: 'h',
  fEstimate: 'Estimate',
  phEstimate: 'Hours',
  thEstimate: 'Estimate',
  noOwner: 'No owner',
  errors: {
    campaignTitleRequired: 'Campaign title is required.',
    initiativeTitleRequired: 'Initiative title is required.',
    taskTitleRequired: 'Task title is required.',
    titleTooLong: 'Title is too long.',
    invalidInitiativeStatus: 'Invalid initiative status.',
    invalidTaskStatus: 'Invalid task status.',
    invalidPriority: 'Invalid priority.',
    invalidCampaignRef: 'Referenced campaign does not exist.',
    invalidInitiativeRef: 'Referenced initiative does not exist.',
    invalidSortOrder: 'Sort order must be a number.',
    missingId: 'Record id is required for updates.',
    taskNoDueDate: 'Tasks do not support due dates.',
    recordMissing: 'Record no longer exists.',
    invalid: 'Invalid value.',
  },
}

const STRINGS: Record<Lang, Strings> = { he: HE, en: EN }

export function getStrings(lang: Lang): Strings {
  return STRINGS[lang]
}

// --- Direction-aware layout helpers ---

// Reverse children for RTL so the first logical item renders on the right.
export function order<T>(children: T[], dir: Dir): T[] {
  return dir === 'rtl' ? children.slice().reverse() : children
}

export function alignText(dir: Dir): 'left' | 'right' {
  return dir === 'rtl' ? 'right' : 'left'
}

export function formatProgress(t: Strings, done: number, total: number): string {
  return total === 0 ? t.noTasks : t.tasksDone(done, total)
}

// Bundle handed down to components.
export interface Ui {
  t: Strings
  dir: Dir
  lang: Lang
}
