from django.db import models

class EmergencyAlert(models.Model):
    phone = models.CharField(max_length=15)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_handled = models.BooleanField(default=False)
    handled_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Emergency from {self.phone} at {self.created_at}"