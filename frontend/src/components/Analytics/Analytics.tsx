import { useQuery } from 'react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import api from '../../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics: React.FC = () => {
  // Fetch this week's data
  const { data: thisWeekData, isLoading: thisWeekLoading } = useQuery(
    'analytics-this-week',
    async () => {
      const response = await api.get('/analytics/calendar/this-week');
      return response.data.data;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Fetch weekly trends for Career Advancement
  const { data: careerTrends, isLoading: careerTrendsLoading } = useQuery(
    'analytics-career-trends',
    async () => {
      const categoryName = encodeURIComponent('Career Advancement');
      const response = await api.get(`/analytics/calendar/trends/${categoryName}`, {
        params: { weeks: 12 }
      });
      return response.data.data;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Fetch weekly trends for Health & Fitness
  const { data: fitnessTrends, isLoading: fitnessTrendsLoading } = useQuery(
    'analytics-fitness-trends',
    async () => {
      const categoryName = encodeURIComponent('Health & Fitness');
      const response = await api.get(`/analytics/calendar/trends/${categoryName}`, {
        params: { weeks: 12 }
      });
      return response.data.data;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Prepare category bar chart data
  const categoryChartData = thisWeekData?.byCategory
    ? {
        labels: Object.keys(thisWeekData.byCategory),
        datasets: [
          {
            label: 'Hours Spent',
            data: (Object.values(thisWeekData.byCategory) as number[]).map((hours) =>
              Math.round(hours * 10) / 10
            ),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',   // Blue
              'rgba(16, 185, 129, 0.8)',   // Green
              'rgba(251, 146, 60, 0.8)',   // Orange
              'rgba(139, 92, 246, 0.8)',   // Purple
              'rgba(236, 72, 153, 0.8)',   // Pink
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)',
              'rgba(251, 146, 60, 1)',
              'rgba(139, 92, 246, 1)',
              'rgba(236, 72, 153, 1)',
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Prepare career subcategories pie chart data
  const careerSubcategoriesData = thisWeekData?.careerSubcategories
    ? {
        labels: Object.keys(thisWeekData.careerSubcategories),
        datasets: [
          {
            label: 'Hours Spent',
            data: (Object.values(thisWeekData.careerSubcategories) as number[]).map((hours) =>
              Math.round(hours * 10) / 10
            ),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',   // Blue
              'rgba(16, 185, 129, 0.8)',   // Green
              'rgba(251, 146, 60, 0.8)',   // Orange
              'rgba(139, 92, 246, 0.8)',   // Purple
              'rgba(236, 72, 153, 0.8)',   // Pink
              'rgba(245, 158, 11, 0.8)',   // Yellow
              'rgba(239, 68, 68, 0.8)',   // Red
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)',
              'rgba(251, 146, 60, 1)',
              'rgba(139, 92, 246, 1)',
              'rgba(236, 72, 153, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(239, 68, 68, 1)',
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Prepare career trends bar chart data
  const careerTrendsChartData = careerTrends
    ? {
        labels: careerTrends.map((trend: any) => trend.week),
        datasets: [
          {
            label: 'Hours Spent',
            data: careerTrends.map((trend: any) => trend.hours),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Prepare fitness trends bar chart data
  const fitnessTrendsChartData = fitnessTrends
    ? {
        labels: fitnessTrends.map((trend: any) => trend.week),
        datasets: [
          {
            label: 'Hours Spent',
            data: fitnessTrends.map((trend: any) => trend.hours),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 1,
        },
      },
    },
  };

  return (
    <div className="space-y-8 p-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track your productivity and time allocation
          </p>
        </div>
      </div>

      {/* This Week Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">This Week</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Time by Category
            </h4>
            {thisWeekLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : categoryChartData ? (
              <div className="h-64">
                <Bar data={categoryChartData} options={barChartOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">No data available for this week</div>
              </div>
            )}
          </div>

          {/* Career Subcategories Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Career Advancement Subcategories
            </h4>
            {thisWeekLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : careerSubcategoriesData && Object.keys(thisWeekData.careerSubcategories).length > 0 ? (
              <div className="h-64">
                <Pie data={careerSubcategoriesData} options={chartOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">No Career Advancement data for this week</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overall Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Overall</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Career Advancement Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Career Advancement - Weekly Trends
            </h4>
            {careerTrendsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : careerTrendsChartData ? (
              <div className="h-64">
                <Bar data={careerTrendsChartData} options={barChartOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">No Career Advancement trends available</div>
              </div>
            )}
          </div>

          {/* Health & Fitness Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Health & Fitness - Weekly Trends
            </h4>
            {fitnessTrendsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : fitnessTrendsChartData ? (
              <div className="h-64">
                <Bar data={fitnessTrendsChartData} options={barChartOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">No Health & Fitness trends available</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
