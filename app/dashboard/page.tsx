import { getDashboardStats } from '@/lib/services/dashboardService';
import DashboardClientPage from './DashboardClientPage';

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    return <DashboardClientPage stats={stats} />;
}
