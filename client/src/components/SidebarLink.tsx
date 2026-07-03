import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type SidebarLinkProps = {
  to: string;
  icon: LucideIcon;
  label: string;
};

export default function SidebarLink({ to, icon: Icon, label }: SidebarLinkProps) {
  return (
    <NavLink to={to} className="sidebar-link">
      <Icon size={16} strokeWidth={2} className="sidebar-link__icon" aria-hidden />
      <span>{label}</span>
    </NavLink>
  );
}
