import { BookOpen, Code2, ExternalLink } from 'lucide-react';

export const tabs = [
  {
    title: "Frame Specification",
    href: "/docs/frame-specification",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Implementation Notes", 
    href: "/docs/implementation-notes",
    icon: <Code2 className="h-4 w-4" />,
  },
  {
    title: "External Resources",
    href: "/docs/external-resources",
    icon: <ExternalLink className="h-4 w-4" />,
  },
] 