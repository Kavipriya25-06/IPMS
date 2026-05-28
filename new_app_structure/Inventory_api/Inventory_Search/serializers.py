from rest_framework import serializers
from new_app_structure.models import ComponentMaster, tags_table




class tagsSerializer(serializers.ModelSerializer):

    class Meta:
        model = tags_table
        fields = '__all__'


class meta_ComponentMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentMaster
        fields = ['component_id', 'component_type', 'component_specification', 'unit_of_measurement',  'category']


class meta_tagsSerializer(serializers.Serializer):
    component_id = meta_ComponentMasterSerializer()  # Include nested details from ComponentMaster
    tags = serializers.ListField(child=serializers.CharField())  # List of tag names
