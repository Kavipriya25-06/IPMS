from rest_framework import serializers
from ..models import RequestComponent

class RequestComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestComponent
        fields = '__all__'
