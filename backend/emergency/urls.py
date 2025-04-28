from django.urls import path
from .views import EmergencyAlertCreateView, EmergencyAlertListView, EmergencyAlertHandleView

urlpatterns = [
    path('alert/', EmergencyAlertCreateView.as_view(), name='emergency-alert'),
    path('alerts/', EmergencyAlertListView.as_view(), name='emergency-alert-list'),
    path('alerts/<int:pk>/handle/', EmergencyAlertHandleView.as_view(), name='emergency-handle'),
]