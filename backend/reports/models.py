from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator

User = get_user_model()

class CrimeType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class CrimeReport(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_investigation', 'Under Investigation'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    crime_type = models.ForeignKey(CrimeType, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=200)
    details = models.TextField()
    location = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    image = models.ImageField(
        upload_to='crime_images/',
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png'])],
        blank=True,
        null=True
    )
    reported_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    user_name = models.CharField(max_length=100)
    user_email = models.EmailField()
    user_phone = models.CharField(max_length=15)
    
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

class PoliceDepartment(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    area = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    
    def __str__(self):
        return self.name

class PoliceTeam(models.Model):
    name = models.CharField(max_length=100)
    department = models.ForeignKey(PoliceDepartment, on_delete=models.CASCADE, related_name='teams')
    members = models.ManyToManyField(User, related_name='police_teams')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.department.name})"

class CrimeAssignment(models.Model):
    crime_report = models.ForeignKey(CrimeReport, on_delete=models.CASCADE, related_name='assignments')
    team = models.ForeignKey(PoliceTeam, on_delete=models.CASCADE, related_name='assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.team.name} assigned to {self.crime_report.title}"

class StatusUpdate(models.Model):
    crime_report = models.ForeignKey(CrimeReport, on_delete=models.CASCADE, related_name='status_updates')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.crime_report.title} status changed from {self.old_status} to {self.new_status}"