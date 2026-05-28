from rest_framework import serializers
from new_app_structure.models import inventory_status


class inventory_status_serializer(serializers.ModelSerializer):
    class Meta:
        model = inventory_status
        fields = '__all__'