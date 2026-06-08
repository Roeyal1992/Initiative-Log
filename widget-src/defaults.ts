// Default UI state, entity field defaults, and development seed data.
// See 03_BUILD.md sections 6.4, 9, 25.1.

import {
  Campaign,
  FilterState,
  GroupBy,
  Initiative,
  SortDir,
  SortKey,
  TableMode,
  Task,
  ViewMode,
} from './types'

// Dev flag: when true, an empty tracker is populated with sample data on first render.
export const SEED_ON_EMPTY = true

export const DEFAULT_FILTER_STATE: FilterState = {
  campaignId: 'all',
  initiativeStatus: 'all',
  taskStatus: 'all',
  owner: 'all',
  assignee: 'all',
  priority: 'all',
  showArchived: false,
}

export const DEFAULT_VIEW_MODE: ViewMode = 'Cards'
export const DEFAULT_TABLE_MODE: TableMode = 'Initiatives'
export const DEFAULT_GROUP_BY: GroupBy = 'campaign'
export const DEFAULT_SORT_KEY: SortKey = 'manual'
export const DEFAULT_SORT_DIR: SortDir = 'asc'

// Field defaults applied by create actions.
export const INITIATIVE_DEFAULTS = {
  owner: '',
  status: 'Backlog' as const,
  priority: 'P2' as const,
  dueDate: null,
  figmaLink: '',
  description: '',
  notes: '',
  archived: false,
}

export const TASK_DEFAULTS = {
  assignee: '',
  status: 'To Do' as const,
  notes: '',
  estimateHours: 0,
}

// Deterministic Hebrew sample data for development. IDs are stable so re-seeding is idempotent.
export function buildSeedData(now: string): {
  campaigns: Campaign[]
  initiatives: Initiative[]
  tasks: Task[]
} {
  const campaigns: Campaign[] = [
    { id: 'camp_seed_nav', title: 'רענון ניווט', sortOrder: 0, createdAt: now, updatedAt: now },
    { id: 'camp_seed_onb', title: 'אונבורדינג 2.0', sortOrder: 1, createdAt: now, updatedAt: now },
  ]

  const initiatives: Initiative[] = [
    {
      id: 'init_seed_sidebar',
      campaignId: 'camp_seed_nav',
      title: 'עיצוב מחדש של סרגל הצד',
      owner: 'דנה',
      status: 'In Progress',
      priority: 'P1',
      dueDate: '2026-06-15',
      figmaLink: 'https://figma.com/file/example-sidebar',
      description:
        'לצמצם את עומק הניווט ולאפשר הגעה ליעדים מרכזיים בלחיצה אחת. נכלל: ארכיטקטורת מידע של הסרגל, אייקונים, התנהגות כיווץ. מחוץ להיקף: סרגל עליון, חיפוש.',
      notes: 'מתואם עם יעד הניווט לרבעון השני.',
      sortOrder: 0,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'init_seed_mobilenav',
      campaignId: 'camp_seed_nav',
      title: 'ניווט תחתון במובייל',
      owner: 'אלי',
      status: 'Planned',
      priority: 'P2',
      dueDate: '2026-07-01',
      figmaLink: '',
      description:
        'להביא את שיפורי הניווט מהדסקטופ לחוויית המובייל. נכלל: סרגל ניווט תחתון. מחוץ להיקף: מחוות מגע.',
      notes: '',
      sortOrder: 1,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'init_seed_welcome',
      campaignId: 'camp_seed_onb',
      title: 'מסך פתיחה למשתמש חדש',
      owner: 'דנה',
      status: 'In Review',
      priority: 'P0',
      dueDate: '2026-06-05',
      figmaLink: 'https://figma.com/file/example-welcome',
      description:
        'להביא משתמשים חדשים לערך ראשון בתוך שתי דקות. נכלל: מסך פתיחה בן 3 שלבים. מחוץ להיקף: הקמת חשבון.',
      notes: 'ממתין לבדיקת תוכן.',
      sortOrder: 0,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'init_seed_unassigned',
      campaignId: null,
      title: 'מיפוי מצבי ריק',
      owner: '',
      status: 'Backlog',
      priority: 'P3',
      dueDate: null,
      figmaLink: '',
      description: 'למפות כל מצב ריק ולהגדיר דפוס אחיד.',
      notes: 'עדיין לא משויך לקמפיין.',
      sortOrder: 0,
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'init_seed_archived',
      campaignId: 'camp_seed_nav',
      title: 'ניקוי פירורי לחם ישנים',
      owner: 'אלי',
      status: 'Done',
      priority: 'P3',
      dueDate: '2026-04-01',
      figmaLink: '',
      description: 'הסרת רכיב פירורי הלחם המיושן.',
      notes: 'הושלם ברבעון הקודם.',
      sortOrder: 2,
      archived: true,
      createdAt: now,
      updatedAt: now,
    },
  ]

  const tasks: Task[] = [
    { id: 'task_seed_1', initiativeId: 'init_seed_sidebar', title: 'מיפוי פריטי הסרגל הקיימים', assignee: 'דנה', status: 'Done', notes: '', estimateHours: 8, sortOrder: 0, createdAt: now, updatedAt: now },
    { id: 'task_seed_2', initiativeId: 'init_seed_sidebar', title: 'אפיון מצב מכווץ', assignee: 'דנה', status: 'In Progress', notes: 'רוחב 64px במצב מכווץ.', estimateHours: 16, sortOrder: 1, createdAt: now, updatedAt: now },
    { id: 'task_seed_3', initiativeId: 'init_seed_sidebar', title: 'אב-טיפוס לחשיפה בריחוף', assignee: 'מאיה', status: 'To Do', notes: '', estimateHours: 12, sortOrder: 2, createdAt: now, updatedAt: now },
    { id: 'task_seed_4', initiativeId: 'init_seed_welcome', title: 'כתיבת תוכן לשלבים', assignee: 'סם', status: 'Blocked', notes: 'ממתין לאישור משפטי.', estimateHours: 6, sortOrder: 0, createdAt: now, updatedAt: now },
    { id: 'task_seed_5', initiativeId: 'init_seed_welcome', title: 'עיצוב סט איורים', assignee: 'מאיה', status: 'Done', notes: '', estimateHours: 10, sortOrder: 1, createdAt: now, updatedAt: now },
  ]

  return { campaigns, initiatives, tasks }
}
