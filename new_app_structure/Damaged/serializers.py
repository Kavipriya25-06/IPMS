from rest_framework import serializers
from new_app_structure.models import DamagedInventory

class DamagedInventorySerializer(serializers.ModelSerializer):
    serial_number = serializers.CharField(source="serial_number.serial_number", read_only=True)

    class Meta:
        model = DamagedInventory
        fields = '__all__'
