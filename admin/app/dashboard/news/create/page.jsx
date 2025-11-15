import { Suspense } from "react";
import NewsForm from "@/components/NewsForm";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsForm />
    </Suspense>
  );
}
