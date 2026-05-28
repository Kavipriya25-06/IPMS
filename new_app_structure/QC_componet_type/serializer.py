from rest_framework import serializers
from new_app_structure.models import qc_component_type





class qc_component_type_question_serializer(serializers.ModelSerializer):
    class Meta:
        model = qc_component_type
        fields='__all__'