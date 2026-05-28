from rest_framework import serializers

from new_app_structure.models import qc_answer, qc_component_type, qc_return_answer


class qc_answer_serializer(serializers.ModelSerializer):

    class Meta:
        model = qc_answer
        fields='__all__'


class qc_return_answer_serializer(serializers.ModelSerializer):

    class Meta:
        model = qc_return_answer
        fields = "__all__"
