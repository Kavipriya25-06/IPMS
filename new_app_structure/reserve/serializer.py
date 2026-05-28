# from rest_framework import serializers
from new_app_structure.models import Inventory,Reserved
from rest_framework import serializers



class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'  # Include all fields of Inventory

class ReservedSerializer(serializers.ModelSerializer):
    inventory_details = InventorySerializer(source='serial_number', read_only=True)  # Fetch full Inventory details

    class Meta:
        model = Reserved
        fields = ['id', 'serial_number', 'inventory_details']  # Include Inventory details in the response
