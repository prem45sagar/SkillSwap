import { 
  Award, 
  Star, 
  Users, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Crown, 
  Flame, 
  Heart, 
  Trophy 
} from "lucide-react";

export const BADGES = [
  {
    id: "newcomer",
    name: "Newcomer",
    description: "Completed your first skill swap!",
    icon: Zap,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    criteria: (u) => (u.completedSwaps || 0) > 0,
    progress: (u) => Math.min(u.completedSwaps || 0, 1) * 100,
    target: "1 Swap Completed"
  },
  {
    id: "mentor_bronze",
    name: "Rising Star",
    description: "Received 5+ total endorsements.",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    criteria: (u) => (u.totalEndorsements || 0) >= 5,
    progress: (u) => ((u.totalEndorsements || 0) / 5) * 100,
    target: "5 Endorsements"
  },
  {
    id: "mentor_silver",
    name: "Expert Mentor",
    description: "Received 15+ total endorsements.",
    icon: Award,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    criteria: (u) => (u.totalEndorsements || 0) >= 15,
    progress: (u) => ((u.totalEndorsements || 0) / 15) * 100,
    target: "15 Endorsements"
  },
  {
    id: "swapper_pro",
    name: "Serial Swapper",
    description: "Completed 10+ skill swaps successfully.",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    criteria: (u) => (u.completedSwaps || 0) >= 10,
    progress: (u) => ((u.completedSwaps || 0) / 10) * 100,
    target: "10 Swaps"
  },
  {
    id: "highly_rated",
    name: "Community Hero",
    description: "Maintain a 4.8+ rating with 5+ reviews.",
    icon: Crown,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    criteria: (u) => (u.rating || 0) >= 4.8 && (u.numReviews || 0) >= 5,
    progress: (u) => (Math.min(u.numReviews || 0, 5) / 5) * 100,
    target: "4.8+ Rating & 5 Reviews"
  },
  {
    id: "popular",
    name: "Social Star",
    description: "Built a community of 10+ followers.",
    icon: Heart,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    criteria: (u) => (u.followers || []).length >= 10,
    progress: (u) => ((u.followers || []).length / 10) * 100,
    target: "10 Followers"
  },
  {
    id: "dedicated",
    name: "Dedicated Peer",
    description: "Received 15+ reviews from the community.",
    icon: ShieldCheck,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    criteria: (u) => (u.numReviews || 0) >= 15,
    progress: (u) => ((u.numReviews || 0) / 15) * 100,
    target: "15 Reviews"
  },
  {
    id: "skill_explorer",
    name: "Skill Explorer",
    description: "Shared at least 3 skills with the community.",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    criteria: (u, skillsCount) => skillsCount >= 3,
    progress: (u, skillsCount) => (skillsCount / 3) * 100,
    target: "3 Skills Shared"
  },
  {
    id: "mentor_gold",
    name: "Legendary Mentor",
    description: "Reached 50+ total endorsements.",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    criteria: (u) => (u.totalEndorsements || 0) >= 50,
    progress: (u) => ((u.totalEndorsements || 0) / 50) * 100,
    target: "50 Endorsements"
  },
  {
    id: "master",
    name: "SkillSwap Master",
    description: "The ultimate achievement. 100+ endorsements & 20+ swaps.",
    icon: Trophy,
    color: "text-red-500",
    bg: "bg-red-500/10",
    criteria: (u) => (u.totalEndorsements || 0) >= 100 && (u.completedSwaps || 0) >= 20,
    progress: (u) => (((u.totalEndorsements || 0) / 100) + ((u.completedSwaps || 0) / 20)) / 2 * 100,
    target: "100 Endorsements & 20 Swaps"
  }
];
