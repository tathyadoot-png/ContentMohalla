import { Suspense } from "react";
import CreateBlogPage from "@/components/CreateBlogPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateBlogPage />
    </Suspense>
  );
}
