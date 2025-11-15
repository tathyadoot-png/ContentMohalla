// app/dashboard/page.jsx
import DashboardStats from "@/components/DashboardStats";
import PrivateRoute from "@/components/PrivateRoute";

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <div className="p-8">
     
        <DashboardStats/>
      </div>
    </PrivateRoute>
  );
}
