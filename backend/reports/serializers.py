from rest_framework import serializers
from .models import CrimeReport, CrimeType, PoliceDepartment, PoliceTeam, CrimeAssignment, StatusUpdate
from accounts.models import User

class CrimeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrimeType
        fields = '__all__'

class PoliceDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PoliceDepartment
        fields = '__all__'

class PoliceTeamSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = PoliceTeam
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone']

class CrimeReportSerializer(serializers.ModelSerializer):
    crime_type_name = serializers.CharField(source='crime_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None
    
    class Meta:
        model = CrimeReport
        fields = '__all__'
        read_only_fields = ['user', 'reported_at', 'status']

class CrimeAssignmentSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    assigned_by_name = serializers.SerializerMethodField()
    
    def get_assigned_by_name(self, obj):
        if obj.assigned_by:
            return f"{obj.assigned_by.first_name} {obj.assigned_by.last_name}"
        return None
    
    class Meta:
        model = CrimeAssignment
        fields = '__all__'

class StatusUpdateSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.SerializerMethodField()
    
    def get_updated_by_name(self, obj):
        if obj.updated_by:
            return f"{obj.updated_by.first_name} {obj.updated_by.last_name}"
        return None
    
    class Meta:
        model = StatusUpdate
        fields = '__all__'