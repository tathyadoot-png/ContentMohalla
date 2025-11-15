import { Suspense } from "react";
import CreateUserPage from "@/components/CreateUserPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateUserPage />
    </Suspense>
  );
}
