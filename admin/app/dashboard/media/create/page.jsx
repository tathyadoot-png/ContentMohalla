  import { Suspense } from "react";
  import MediaAdminPage from "@/components/MediaAdminPage";
  
  export default function Page() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <MediaAdminPage/>
      </Suspense>
    );
  }
  