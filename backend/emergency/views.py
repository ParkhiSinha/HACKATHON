from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import EmergencyAlert
from .serializers import EmergencyAlertSerializer
from django.utils import timezone

class EmergencyAlertCreateView(generics.CreateAPIView):
    queryset = EmergencyAlert.objects.all()
    serializer_class = EmergencyAlertSerializer
    permission_classes = [permissions.AllowAny]

class EmergencyAlertListView(generics.ListAPIView):
    queryset = EmergencyAlert.objects.filter(is_handled=False).order_by('-created_at')
    serializer_class = EmergencyAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'police' and user.department:
            # Only show emergencies near the police department
            department = user.department
            return EmergencyAlert.objects.filter(
                is_handled=False,
                latitude__range=(department.latitude-0.1, department.latitude+0.1),
                longitude__range=(department.longitude-0.1, department.longitude+0.1)
            ).order_by('-created_at')
        return EmergencyAlert.objects.none()

class EmergencyAlertHandleView(generics.UpdateAPIView):
    queryset = EmergencyAlert.objects.all()
    serializer_class = EmergencyAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_handled = True
        instance.handled_at = timezone.now()
        instance.save()
        return Response({"status": "Emergency marked as handled"})