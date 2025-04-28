from django.urls import path
from .views import (
    CrimeTypeListView, CrimeReportCreateView, CrimeReportListView,
    CrimeReportDetailView, PoliceDepartmentListView, PoliceTeamListView,
    CrimeAssignmentCreateView, StatusUpdateListView, CrimeStatsView
)

urlpatterns = [
    path('crime-types/', CrimeTypeListView.as_view(), name='crime-type-list'),
    path('reports/', CrimeReportCreateView.as_view(), name='report-create'),
    path('reports/list/', CrimeReportListView.as_view(), name='report-list'),
    path('reports/<int:pk>/', CrimeReportDetailView.as_view(), name='report-detail'),
    path('departments/', PoliceDepartmentListView.as_view(), name='department-list'),
    path('teams/', PoliceTeamListView.as_view(), name='team-list'),
    path('assignments/', CrimeAssignmentCreateView.as_view(), name='assignment-create'),
    path('reports/<int:report_id>/status-updates/', StatusUpdateListView.as_view(), name='status-update-list'),
    path('stats/', CrimeStatsView.as_view(), name='crime-stats'),
]