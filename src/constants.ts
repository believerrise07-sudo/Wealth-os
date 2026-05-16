export const COLORS = {
  bg: '#0F1115',
  obsidian: '#0F1115',
  surface: '#14171d',
  slate: '#1C1F26',
  platinum: '#E5E4E2',
  champagne: '#D4AF37',
  goldMid: '#D4AF37',
  goldLight: '#f5e4ab',
  goldGlow: 'rgba(212,175,55,0.15)',
  green: '#2ecc71',
  red: '#c54141',
  blue: '#3498db',
  purple: '#9b59b6',
  textPrimary: '#E5E4E2',
  textSecondary: '#a0a8b5',
  textMuted: 'rgba(229,228,226,0.4)',
  textDisabled: '#3d4452',
  chartLine: '#D4AF37',
  chartFill: 'rgba(212,175,55,0.08)'
};

export const SPRING_CONFIG = { type: "spring", stiffness: 100, damping: 20 };

export const TREND_DATA = [
  { month: 'Jan', netWorth: 980000 },
  { month: 'Feb', netWorth: 1025000 },
  { month: 'Mar', netWorth: 1085000 },
  { month: 'Apr', netWorth: 1140000 },
  { month: 'May', netWorth: 1180000 },
  { month: 'Jun', netWorth: 1250000 },
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
