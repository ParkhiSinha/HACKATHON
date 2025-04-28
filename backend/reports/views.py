from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import CrimeReport, CrimeType, PoliceDepartment, PoliceTeam, CrimeAssignment, StatusUpdate
from .serializers import (
    CrimeReportSerializer, CrimeTypeSerializer, PoliceDepartmentSerializer,
    PoliceTeamSerializer, CrimeAssignmentSerializer, StatusUpdateSerializer
)
from accounts.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
import pandas as pd
from django.http import JsonResponse

class CrimeTypeListView(generics.ListAPIView):
    queryset = CrimeType.objects.all()
    serializer_class = CrimeTypeSerializer
    permission_classes = [permissions.AllowAny]

class CrimeReportCreateView(generics.CreateAPIView):
    queryset = CrimeReport.objects.all()
    serializer_class = CrimeReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CrimeReportListView(generics.ListAPIView):
    serializer_class = CrimeReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'crime_type']
    search_fields = ['title', 'details', 'user_name']
    ordering_fields = ['reported_at', 'status']
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'police':
            # Police can see reports near their department or assigned to their team
            department = user.department
            if department:
                # Simple distance calculation (in reality, use proper geodistance)
                nearby_reports = CrimeReport.objects.filter(
                    Q(latitude__range=(department.latitude-0.1, department.latitude+0.1)) &
                    Q(longitude__range=(department.longitude-0.1, department.longitude+0.1))
                )
            else:
                nearby_reports = CrimeReport.objects.none()
            
            # Reports assigned to user's teams
            team_reports = CrimeReport.objects.filter(assignments__team__members=user)
            
            return (nearby_reports | team_reports).distinct().order_by('-reported_at')
        else:
            # Regular users can only see their own reports
            return CrimeReport.objects.filter(user=user).order_by('-reported_at')

class CrimeReportDetailView(generics.RetrieveUpdateAPIView):
    queryset = CrimeReport.objects.all()
    serializer_class = CrimeReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'police':
            return CrimeReport.objects.all()
        return CrimeReport.objects.filter(user=user)
    
    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        updated_report = serializer.save()
        
        if updated_report.status != old_status:
            StatusUpdate.objects.create(
                crime_report=updated_report,
                updated_by=self.request.user,
                old_status=old_status,
                new_status=updated_report.status
            )

class PoliceDepartmentListView(generics.ListAPIView):
    queryset = PoliceDepartment.objects.all()
    serializer_class = PoliceDepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class PoliceTeamListView(generics.ListAPIView):
    serializer_class = PoliceTeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'police':
            return PoliceTeam.objects.filter(department=user.department)
        return PoliceTeam.objects.none()

class CrimeAssignmentCreateView(generics.CreateAPIView):
    queryset = CrimeAssignment.objects.all()
    serializer_class = CrimeAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        crime_report = serializer.validated_data['crime_report']
        if crime_report.status == 'pending':
            crime_report.status = 'under_investigation'
            crime_report.save()
            
            StatusUpdate.objects.create(
                crime_report=crime_report,
                updated_by=self.request.user,
                old_status='pending',
                new_status='under_investigation',
                notes=f"Team {serializer.validated_data['team'].name} assigned"
            )
        
        serializer.save(assigned_by=self.request.user)

class StatusUpdateListView(generics.ListAPIView):
    serializer_class = StatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        report_id = self.kwargs.get('report_id')
        report = get_object_or_404(CrimeReport, id=report_id)
        
        # Check if user has permission to view this report's updates
        user = self.request.user
        if user.user_type != 'police' and report.user != user:
            return StatusUpdate.objects.none()
        
        return StatusUpdate.objects.filter(crime_report=report).order_by('-updated_at')

class CrimeStatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        if not request.user.user_type == 'police':
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get stats for police dashboard
        queryset = CrimeReport.objects.all()
        
        # If police user has a department, filter nearby reports
        if request.user.department:
            department = request.user.department
            queryset = queryset.filter(
                latitude__range=(department.latitude-0.1, department.latitude+0.1),
                longitude__range=(department.longitude-0.1, department.longitude+0.1)
            )
        
        # Create pandas DataFrame for analysis
        df = pd.DataFrame.from_records(queryset.values('crime_type__name', 'status', 'reported_at'))
        
        if df.empty:
            return Response({
                "status_counts": {},
                "crime_type_counts": {},
                "timeline_data": {}
            })
        
        # Status counts
        status_counts = df['status'].value_counts().to_dict()
        
        # Crime type counts
        crime_type_counts = df['crime_type__name'].value_counts().to_dict()
        
        # Timeline data (reports per day)
        timeline_data = df.set_index('reported_at').resample('D').size().to_dict()
        
        return Response({
            "status_counts": status_counts,
            "crime_type_counts": crime_type_counts,
            "timeline_data": timeline_data
        })