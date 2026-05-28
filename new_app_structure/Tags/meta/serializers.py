from rest_framework import serializers
from new_app_structure.models import ComponentMaster, meta_tags




class metaSerializer(serializers.ModelSerializer):

    class Meta:
        model = meta_tags
        fields = '__all__'

class componentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentMaster
        fields = ['component_id','component_type','component_specification','unit_of_measurement']



