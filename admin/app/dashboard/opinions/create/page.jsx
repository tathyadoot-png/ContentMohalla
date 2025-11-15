import { Suspense } from "react";
import OpinionCreate from "@/components/OpinionCreate";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OpinionCreate />
    </Suspense>
  );
}
