import { BadgeCheck, Building2, Globe2, MapPin, ShieldQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Scholarship } from "@/lib/types";

export function ScopeBadge({ s }: { s: Scholarship }) {
  if (s.scope === "local")
    return (
      <Badge variant="local">
        <MapPin /> Local DMV
      </Badge>
    );
  if (s.scope === "national")
    return (
      <Badge variant="national">
        <Globe2 /> National
      </Badge>
    );
  return (
    <Badge variant="university">
      <Building2 /> University
    </Badge>
  );
}

export function ResidencyBadge({ s }: { s: Scholarship }) {
  if (!s.residency) return null;
  const label = s.residency.counties?.length
    ? `${s.residency.counties.join(", ").replace(" County", " Co.")} residents`
    : `${s.residency.states?.join(" / ")} residents`;
  return <Badge variant="outline">{label}</Badge>;
}

export function VerifiedBadge({ s }: { s: Scholarship }) {
  return s.verified ? (
    <Badge variant="verified">
      <BadgeCheck /> Verified
    </Badge>
  ) : (
    <Badge variant="warning">
      <ShieldQuestion /> Pending verification
    </Badge>
  );
}
