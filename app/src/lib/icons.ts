/**
 * Icon library configuration and mappings
 * Using Lucide React for consistent, professional icons
 */

import {
  // Navigation & Actions
  Rocket,
  Star,
  Sparkles,
  BarChart3,
  PenLine,
  Plus,
  Home,
  User,
  Users,

  // Status & Feedback
  X,
  Check,
  AlertCircle,
  Info,
  Loader2,

  // Data & Content
  Copy,
  Search,
  Folder,
  Image,
  Camera,
  Save,
  Trash2,
  Download,
  Upload,
  Tag,

  // Financial
  DollarSign,
  Coins,
  TrendingUp,
  Wallet,

  // Achievements & Rewards
  Trophy,
  Medal,
  Award,
  Target,
  Zap,
  Crown,

  // Social & Communication
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,

  // UI Elements
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Menu,
  MoreVertical,
  Settings,

  // Time
  Clock,
  Calendar,

  // Tech
  Code,
  Github,
  Globe,
} from 'lucide-react';

// Icon size presets (in pixels)
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

// Export all icons for easy access
export const Icons = {
  // Navigation
  rocket: Rocket,
  star: Star,
  sparkles: Sparkles,
  chart: BarChart3,
  edit: PenLine,
  plus: Plus,
  home: Home,
  user: User,
  users: Users,

  // Actions
  x: X,
  check: Check,
  alert: AlertCircle,
  info: Info,
  loader: Loader2,

  // Content
  copy: Copy,
  search: Search,
  folder: Folder,
  image: Image,
  camera: Camera,
  save: Save,
  trash: Trash2,
  download: Download,
  upload: Upload,
  tag: Tag,

  // Financial
  dollar: DollarSign,
  coins: Coins,
  trending: TrendingUp,
  wallet: Wallet,

  // Achievements
  trophy: Trophy,
  medal: Medal,
  award: Award,
  target: Target,
  zap: Zap,
  crown: Crown,

  // Social
  heart: Heart,
  message: MessageCircle,
  share: Share2,
  external: ExternalLink,

  // UI
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  menu: Menu,
  more: MoreVertical,
  settings: Settings,

  // Time
  clock: Clock,
  calendar: Calendar,

  // Tech
  code: Code,
  github: Github,
  globe: Globe,
} as const;

// Emoji to Icon mapping for gradual migration
export const EMOJI_TO_ICON_MAP = {
  '🚀': 'rocket',
  '⭐': 'star',
  '✨': 'sparkles',
  '📊': 'chart',
  '✏️': 'edit',
  '❌': 'x',
  '📋': 'copy',
  '🔍': 'search',
  '💾': 'save',
  '🖼️': 'image',
  '📸': 'camera',
  '💰': 'coins',
  '💎': 'award',
  '🏆': 'trophy',
  '⚡': 'zap',
  '📂': 'folder',
  '🎯': 'target',
  '👤': 'user',
  '👥': 'users',
} as const;

// Category icon mapping for Genesis Awards
export const CATEGORY_ICONS = {
  HACKATHON: 'trophy',
  OPEN_SOURCE: 'code',
  COMMUNITY: 'users',
  INNOVATION: 'sparkles',
  CUSTOM: 'star',
} as const;
