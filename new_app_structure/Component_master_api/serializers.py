from rest_framework import serializers
from new_app_structure.models import ComponentMaster

# BOMList Serializer
class ComponentMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentMaster
        fields = ['component_id','category','component_type', 'component_specification', 'unit_of_measurement', 'tally_reference' ,'hsn_number','sku_number','part_number']  # Fields to display
